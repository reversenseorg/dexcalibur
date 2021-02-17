
//const UT = require("./Utils.js");
import * as _fs_ from 'fs';
import * as _path_ from 'path';
import * as Express from 'express';

import HookSet from "./HookSet";
import {ConnectorFactory, IDatabase, IDatabaseAdapter} from "./ConnectorFactory";
import DexcaliburProject from "./DexcaliburProject";
import InspectorFrontController, {IFC_TYPE} from "./InspectorFrontController";
import Event from "./Event";
import * as Log from './Logger';
import {Stats} from "mocha";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const TASK_CODE = {
    NO_RESULT: 0,
    SUCCESS: 1,
    DATA_UPDATE: 2
};

export enum INSPECTOR_TYPE {
    BOOT= 'BOOT',
    POST_APP_SCAN= 'POST_APP_SCAN',
    POST_PLATFORM_SCAN= 'POST_PLATFORM_SCAN',
    POST_DEV_SCAN= 'POST_DEV_SCAN',
    ON_DEMAND= 'ON_DEMAND',
};

interface ListenerList {
    [eventType :string] :StaticTask[]
}

class StaticTask
{

    task:any = null;
    condition:any = null;
    onDataUpdate:any = null;
    onNoResult:any = null;
    onSuccess:any = null;

    constructor(pConfig:any=null){
        if(pConfig!==null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    setCondition(fn:any){
        this.task = fn;
    } 

    setTask(fn:any){
        this.condition = fn;
    }

    exec(ctx:any, event:any){
        if(this.condition != null && this.condition(ctx))
            this.task(ctx, event);
        else
            this.task(ctx, event);
    }
}



export default class Inspector
{
    id:string = null;
    name:string = null;
    description:string = null;

    context:DexcaliburProject = null;
    hookSet:HookSet = null;
    staticTasks:StaticTask[] = null;
    running:boolean = false;
    listener:ListenerList = {};

    events:string[] = [];

    gui_available:boolean = false;
    frontController:InspectorFrontController = null;
    preRegisteredTags:any = [];
    db:IDatabase = null;

    /**
     * @type {String}
     * @field
     */
    color:any = null;

    installed:boolean = false;
    step:INSPECTOR_TYPE = INSPECTOR_TYPE.BOOT;

    constructor(config:any=null){

        if(config==null){
            for(let i in config){
                this[i] = config[i];
                if(i==="hookSet"){
                    this.id = config[i].id;
                    this.name = config[i].name;
                    this.description = config[i].description;
                }
            }
        }

        return this;
    }


    /**
     * @return {boolean}
     * @method
     */
    isInstalled():boolean{
        return this.installed;
    }

    useGUI():void{
        this.gui_available = true;
    }

    useMemoryDB(pContext:DexcaliburProject=null):IDatabase{
        if(this.context == null && pContext == null)
            throw new Error('[INSPECTOR] DB cannot be initialized because the context is not defined');

        let conn:IDatabaseAdapter = ConnectorFactory.getInstance()
            .newConnector('inmemory', this.context!=null?this.context:pContext);
        this.db = conn.newTemporaryDb('insp:db:'+this.name);

        return this.db;
    }

    getDB():IDatabase{
        return this.db;
    }

    /**
     * To forward an HTTP GET request from the web server handler to the inspector front controller if available
     * Internal use
     */
    performGet(req:Express.Request, res:Express.Response):any{
        if(this.frontController.hasHandler(IFC_TYPE.GET)){
            return this.frontController.performGet(req,res);
        }else{
            return { error: true, msg:"Unavailable GET handler for this inspector" };
        }
    }


    /**
     * To forward an HTTP POST request from the web server handler to the inspector front controller if available
     * Internal use
     */
    performPost(req:Express.Request, res:Express.Response):any{
        if(this.frontController.hasHandler(IFC_TYPE.POST)){
            return this.frontController.performPost(req,res);
        }else{
            return { error: true, msg:"Unavailable POST handler for this inspector" };
        }
    }

    /**
     * To invoke the StaticTask instances associated to the given event. 
     */
    broadcastEvent(event:Event){
        let event_type:string = event.type;

        //Logger.info( event_type, this.listener[event_type]);
        //console.log(this.listener);
        if(this.listener[event_type] != null){
            for(let i:number=0; i<this.listener[event_type].length; i++){
                // TODO : async / co
                // console.log(this.listener[event_type][i]);
                this.listener[event_type][i].exec(this.context, event);
            }
        }
        return true;
    }

    /**
     * To declare new event handler. If the param `task`is  a function, a new StaticTask is create implicitly.
     */
    on(event_type:string, task:StaticTask|any):Inspector{
        if(this.listener[event_type] == null)
            this.listener[event_type] = [];
        
        if(task instanceof StaticTask)
            this.listener[event_type].push(task);
        else
            this.listener[event_type].push(new StaticTask(task));
            
        return this;
    }


    registerTagCategory(name:string, tags:any){
        this.preRegisteredTags.push({ name:name, tags:tags });
    }


    /**
     * @method
     */
    injectContext(ctx:DexcaliburProject):Inspector{
        this.context = ctx;

        if(this.hookSet != null){
            this.hookSet.injectContext(ctx);
            Logger.info("[Inspector::injectContext][HookSet] "+this.id+" registered !");
        }else{
            Logger.info("[Inspector::injectContext] "+this.id+" has not hook set.");
        }

        // register front controller
        let path = _path_.join(__dirname,"..","inspectors",this.id,"service","main.js");
        if(_fs_.existsSync(path)){
            this.frontController = require(path).default.injectContext(ctx);
            Logger.info("[Inspector::injectContext][FrontController] "+this.id+" registered !");
        }
        /*
        else if(Path.basename(ctx.config.getDexcaliburPath()) !== "src"){
            path = Path.join(ctx.config.getDexcaliburPath(),"inspectors",this.id,"service","main.js");
            if(fs.existsSync(path)){
                this.frontController = require(path).injectContext(ctx);
                Logger.info("[Inspector::injectContext][FrontController] "+this.id+" registered !");
            }
        }*/


        // declare TagCategory
        let anal = ctx.getAnalyzer();
        for(let i=0; i<this.preRegisteredTags.length; i++){
            anal.addTagCategory(this.preRegisteredTags[i].name, this.preRegisteredTags[i].tags)
        }

        /*if(this.db instanceof InMemoryDb){
            //this.db.setContext(this.context);
        }*/

        return this;
    }

    setStartStep(pStep:INSPECTOR_TYPE){
        this.step = pStep;
    }

    getStartStep():INSPECTOR_TYPE{
        return this.step;
    }

    setHookSet(hs:HookSet){
        this.hookSet = hs;
        this.hookSet.color = this.color;

        if(this.id==null) this.id = hs.id;
        if(this.name==null) this.name = hs.name;
        if(this.description==null) this.description = hs.description;
    }

    getHookSet():HookSet{
        return this.hookSet;
    }

    getID():string{
        return this.id;
    }

    deploy():void{
        this.running = true;
        this.hookSet.deploy();
    }

    // Inspector life-cycle
    /*
    turnOn(){
        this.running = true;
        if(this.hookSet!=null)
            this.hookSet.enable();
    }

    turnOff(){
        return this.staticTasks[name];
        if(this.hookSet!=null)
            this.hookSet.disable();
    }*/

    /**
     * emit a new event on the main event bus
     */
    emits(name:string, event:any){
        if(this.events.indexOf(name)===-1)
            this.events.push(name);

        this.context.bus.send(new Event({
            type: name, 
            data: event 
        }));
    }

    /**
     * 
     * @param {*} pStep
     * @method 
     */
    isStartAt(pStep:INSPECTOR_TYPE):boolean{
        return (this.step === pStep)
    }

    /**
     * 
     * @param {*} callback 
     * @method
     */
    restore(callback=null):void{
        let self:Inspector = this;
        let savePath:string = _path_.join(this.context.workspace.getSaveDir(), this.id+".json");
        _fs_.lstat(savePath, (vErr:any, vStat:any)=>{
            if(vErr == null) {
                _fs_.readFile(savePath, 'ascii', function(err, data){

                    if(/^[\s\t\n\r]*$/.test(data)) return ;
                    Logger.raw(data);
                    let o = JSON.parse(data);

                    self.db.unserialize(o);
                    if(typeof callback === 'function')
                        callback(self);
                })
            }
        });
    }

    /**
     * @method
     */
    save(){
        if(this.db == null) return null;

        let self:Inspector = this;
        let savePath:string = _path_.join(this.context.workspace.getSaveDir(), this.id+".json");
        _fs_.exists(savePath, function(exist){
            if(exist){
                _fs_.unlinkSync(savePath);
            }

            _fs_.open(savePath, 'w+', function(err, fd){
                if(err){
                    console.log("Save file cannot be created");
                    return;
                }

                let data = self.db.serialize();
                _fs_.write(fd, JSON.stringify(data), function(err){
                    if(err){
                        console.log("Save file cannot be created");
                        return;
                    }
                    console.log("Inspector "+self.id+" backed up");
                    _fs_.close(fd,function(err){});
                });
            })
        })
    }

    /**
     * To cast the current object to an object ready to be serialize (it avoids cyclic reference)
     * @returns {Object} 
     * @method
     */
    toJsonObject():any{
        let o:any = {};
        o.id = this.id;
        o.description = this.description;
        o.name = this.name;
        o.running = this.running;
        o.events = this.events;
        o.hooks = this.hookSet.toJsonObject();
        o.listener = [];
        o.gui_available = this.gui_available;
        for(let i in this.listener)
            o.listener.push({ n:i });
        
        return o;
    }
}
