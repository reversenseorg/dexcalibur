/**
 * All rights reserved at Reversense SAS 2018 - 2022
 *
 * @author Georges-Bastien Michel <georges@reversense.com>
 * @copyright Reversense SAS <contact@reversense.com>
 */
//const UT = require("./Utils.js");
import * as _fs_ from 'fs';
import * as _path_ from 'path';
import * as Express from 'express';

import HookSet from "./HookSet.js";
import {ConnectorFactory} from "./ConnectorFactory.js";
import DexcaliburProject from "./DexcaliburProject.js";
import InspectorFrontController, {IFC_TYPE} from "./InspectorFrontController.js";
import BusEvent from "./BusEvent.js";
import * as Log from './Logger.js';
import {Stats} from "mocha";
import {BusBroadcaster} from "./Bus.js";
import {IDatabase, IDatabaseAdapter} from "./persist/orm/DbAbstraction.js";
import {DelegateWebApi} from "./webapi/DelegateWebApi.js";
import WebServer from "./WebServer.js";
import {TagCategory} from "./tags/TagCategory.js";
import {NodeType} from "./persist/orm/NodeType.js";
import {NodeInternalType} from "./NodeInternalType.js";
import Util from "./Utils.js";
import {CoreDebug} from "./core/CoreDebug.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

const TASK_CODE = {
    NO_RESULT: 0,
    SUCCESS: 1,
    DATA_UPDATE: 2
};

/**
 * List of steps from where an inpector can be deployed.
 *
 * @enum
 */
export enum INSPECTOR_TYPE {
    BOOT= 'BOOT',
    POST_APP_SCAN= 'POST_APP_SCAN',
    POST_PLATFORM_SCAN= 'POST_PLATFORM_SCAN',
    POST_DEV_SCAN= 'POST_DEV_SCAN',
    ON_DEMAND= 'ON_DEMAND',
}

interface ListenerList {
    [eventType :string] :StaticTask[]
}

/**
 * A StaticTask is the component processing incoming data or executing task when an event is caught from the Bus
 *
 * If an analysis is not invoked explicitely by the user, but automatically when a specific event happened, then
 * context or incoming data are processed by listeners (StaticTask).
 *
 * @class
 */
class StaticTask
{
    task:any = null;
    condition:any = null;
    onDataUpdate:any = null;
    onNoResult:any = null;
    onSuccess:any = null;

    constructor(pConfig:any=null){
        if(pConfig!==null)
            for(const i in pConfig)
                this[i] = pConfig[i];
    }

    /**
     * To set a function evaluated as a condition
     *
     * The function MUST return a boolean
     *
     * @param fn {Function} Condition function
     * @return
     */
    setCondition(fn:any){
        this.condition = fn;
    }


    /**
     * To set a function processing the context or data
     *
     * The function takes two arguments:
     * - Context : the DexcaliburProject instance
     * - Event : the event object which triggered the function, this object contains incoming data
     *
     *
     * @param fn {Function} Condition function
     * @return
     */
    setTask(fn:any){
        this.task = fn;
    }

    /**
     * Execute the task if there is not condition or if the condition is true
     *
     * @param ctx
     * @param event
     * @return {void}
     * @method
     */
    exec(ctx:any, event:any){
        if(this.condition != null && this.condition(ctx))
            this.task(ctx, event);
        else
            this.task(ctx, event);
    }
}


/**
 * An inspector is a plugin able to add (and/or):
 * - One or more data analyzer and classifier to main Bus
 * - One hook set containing One or more heuristics (HookStrategy) able to generate instrumentation
 * - Additional REST endpoint to extend Dexcalibur server APIs
 * - Addition GUI components
 *
 * Every analysis and builtin hooks available inside Dexcalibur are provided through Inspectors.
 * Using Inspectors is the main way to extend Dexcalibur analyzer, features and UI
 *
 * All enabled inspectors are created when a project is  created/opened. However, analysis and
 * hook strategies are executed only some specific milestone are reach during project open/create workflow.
 * So every Inspector MUST be attached to a specific `step`. By default, the inspector is deployed when  f INSPECTOR_TYPE
 * a new project is instantiated (open/create), so `this.step` equals `INSPECTOR_TYPE.BOOT`
 *
 *
 * Inspector are responsible to :
 * - Generate instrumentation
 * - Process raw data returned by hook logs, in order to tag it and push it inside main Bus
 * - Listen for data on the main Bus, an process it in order to extract new data, make correlation, or improve hooks
 * - Filter project DBs and improve analysis
 * - Extend graphical interface
 * - Extend tagging system or knowledge DB
 * - Extend REST API
 * - Extend API
 *
 * @implements {BusBroadcaster}
 * @class
 */
export default class Inspector implements BusBroadcaster
{
    static TYPE:NodeType = new NodeType( "inspectors", NodeInternalType.INSPECTOR, []);

    __:NodeInternalType = NodeInternalType.INSPECTOR;

    /**
     * The inspector ID is a string and it must be unique for entire engine
     *
     * @field
     * @type {string}
     * @public
     */
    id:string = null;

    /**
     * Human-readable short name for the inspector
     *
     * @field
     * @type {string}
     * @public
     */
    name:string = null;

    /**
     * Optional but recommended, a description of the purpose of this plugin
     *
     * @field
     * @type {string}
     * @public
     */
    description:string = null;

    /**
     * Current context (project) for this plugin instance
     *
     * @field
     * @type {DexcaliburProject}
     * @public
     */
    context:DexcaliburProject = null;

    /**
     * Optional. If the plugin offers heuristics (HookStrategy) to generate some hooks, then all strategies must
     * be grouped inside a HookSet.
     *
     * The HookSet is deployed (executed) only when some conditions (different from parent Inspector) are fulfilled  :
     * - at first run when a project is created, but not later because hooks will already exists
     * - on demand, by overwriting previously generated hooks
     * - on demand, by droping user changes
     * - and so ...
     *
     *
     * @field
     * @type {HookSet}
     * @public
     */
    hookSet:HookSet = null;

    /**
     * @field
     * @type {StaticTask[]}
     * @public
     * @deprecated
     */
    staticTasks:StaticTask[] = null;

    /**
     * A flag to know if the inspector has been deployed (everything executed or ready) or not.
     *
     * @field
     * @type {boolean} TRUE if inspector is running, else FALSE
     * @public
     */
    running = false;

    /**
     * The map of event name <> list of associated tasks.
     *
     * @field
     * @type {ListenerList} Mapping of event names / tasks
     * @public
     */
    listener:ListenerList = {};

    /**
     * The list of events already emitted by the inspectors
     *
     * @field
     * @type {string[]} A list of event name
     * @public
     */
    events:string[] = [];

    /**
     * A flag to know if the inspector has some HTML/UI material
     *
     * @field
     * @type {boolean}
     * @public
     */
    gui_available = false;

    frontController:InspectorFrontController = null;

    /**
     * A list of Tag
     *
     * @field
     * @type {boolean}
     * @public
     */
    preRegisteredTags:TagCategory[] = [];


    /**
     * A local DB - private to this plugin
     *
     * @field
     * @type {IDatabase}
     * @public
     */
    db:IDatabase = null;
   // webapi:DelegateWebApi = null;

    /**
     * A default color for hook logs and tag from this plugin
     *
     * @type {String}
     * @field
     * @public
     */
    color = null;

    installed = false;


    /**
     * Required. The step when the plugin is deployed.
     *
     * Default is `INSPECTOR_TYPE.BOOT`
     *
     * @field
     * @type {INSPECTOR_TYPE}
     * @public
     */
    step:INSPECTOR_TYPE = INSPECTOR_TYPE.BOOT;

    /**
     *
     * @param config
     * @constructor
     */
    constructor(config=null){

        if(config==null){
            for(const i in config){
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
     * To get the UID - a unique string for the current engine instance.
     *
     * @return {string} The plugin UID
     * @method
     */
    getUID(): string {
        return this.id;
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

    /**
     * To initialize and get the local DB as a Memory-based DB
     *
     * @param {DexcaliburProject} pContext
     * @return {IDatabase} The plugin DB instance
     * @method
     */
    useMemoryDB(pContext:DexcaliburProject=null):IDatabase{
        if(this.context == null && pContext == null)
            throw new Error('[INSPECTOR] DB cannot be initialized because the context is not defined');

        const conn:IDatabaseAdapter = ConnectorFactory.getInstance()
            .newConnector('inmemory', this.context!=null?this.context:pContext);
        this.db = conn.newTemporaryDb('insp:db:'+this.name);

        return this.db;
    }

    /**
     * To get the local DB of the plugin if it exists.
     * Local DB is optional.
     *
     * @return {IDatabase} The plugin DB instance or null
     * @method
     */
    getDB():IDatabase{
        return this.db;
    }

    /**
     * To forward an HTTP GET request from the web server handler to the inspector front controller if available
     * Internal use
     *
     * @param {Express.Request} req
     * @param {Express.Response} res
     * @method
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
     * To broadcast an event from the main Bus to relevent StaticTask.
     *
     * This function is called every time a new data is pushed on the main Bus
     *
     * TODO: add asynchronous task
     * TODO: improve performance => multi-thread ?
     *
     * @param {BusEvent} event  The event from main Bus
     * @method
     */
    broadcastEvent(event:BusEvent<any>){
        const event_type:string = event.type;

        //Logger.info( event_type, this.listener[event_type]);
        //console.log(this.listener);
        if(this.listener[event_type] != null){
            for(let i=0; i<this.listener[event_type].length; i++){
                // TODO : async / co
                // console.log(this.listener[event_type][i]);
                this.listener[event_type][i].exec(this.context, event);
            }
        }
        return true;
    }

    /**
     * To declare new event handler. If the param `task`is  a function, a new StaticTask is create implicitly.
     *
     * If a function is passed as is, the resulting StaticTask will not have additional condition.
     *
     *
     * @param {string} event_type  The name of the event
     * @param {StaticTask|any} task A  StaticTask instance or the listener function.
     * @return {Inspector} This inspector instance
     * @method
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


    /**
     * To add a new tag category to this plugin (to extend tagging system)
     *
     * @method
     * @param vCategory
     */
    registerTagCategory( vCategory:TagCategory ){
        this.preRegisteredTags.push(vCategory);
    }


    /**
     * To initialize the plugin for the specified project
     *
     * At this step, every things not depending of the "starting point" are executed :
     * - add custom tag categories to the tag system
     * - initializing front controller / custom web api endpoints
     * - initializing hook set
     *
     * @param {DexcaliburProject} ctx The current project (context)
     * @return {Inspector} The current inspector instance
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
        const path = _path_.join(Util.__dirname(import.meta.url),"..","inspectors",this.id,"service","main.js");
        if(_fs_.existsSync(path)){
            import(path).then((vModule)=>{
                this.frontController = vModule.default.injectContext(ctx);
                Logger.info("[Inspector::injectContext][FrontController] "+this.id+" registered !");
            })
            //this.frontController = require(path).default.injectContext(ctx);
            //Logger.info("[Inspector::injectContext][FrontController] "+this.id+" registered !");
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
        const tmgr = ctx.getTagManager();
        for(let i=0; i<this.preRegisteredTags.length; i++){
            tmgr.addCategory(this.preRegisteredTags[i]);
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

    /**
     * To dynamically set the hook set.
     *
     * This method is used to copy some properties shared by the parent (inspector) with the child hookset.
     *
     * @param {HookSet} pHookSet The HookSet instance (group of hook strategy)
     * @method
     */
    setHookSet(pHookSet:HookSet){
        this.hookSet = pHookSet;
        this.hookSet.color = this.color;

        if(this.id==null) this.id = pHookSet.id;
        if(this.name==null) this.name = pHookSet.name;
        if(this.description==null) this.description = pHookSet.description;
    }

    getHookSet():HookSet{
        return this.hookSet;
    }

    getID():string{
        return this.id;
    }

    /**
     * Deploy the current inspector.
     *
     * Currently, it is the function which triggers all heuristics able to generate instrumentation.
     * It updates `running` flag to `true`.
     *
     * @method
     */
    deploy():void{
        this.running = true;

        // add a check to force to redeploy or not
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
     * To emit a new event on the main event bus
     *
     * @param {string} name The event name
     * @param {any}  event The event data
     * @method
     */
    emits(name:string, event:any){
        if(this.events.indexOf(name)===-1)
            this.events.push(name);

        this.context.bus.send(new BusEvent({
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
     * To restore the inspector configuration in a separate JSON file
     *
     * @param {*} callback 
     * @method
     */
    restore(callback=null):void{
        //let self:Inspector = this;
        const savePath:string = _path_.join(this.context.workspace.getSaveDir(), this.id+".json");
        _fs_.lstat(savePath, (vErr:any, vStat:any)=>{
            if(vErr == null) {
                _fs_.readFile(savePath, 'ascii', function(err, data){

                    if(/^[\s\t\n\r]*$/.test(data)) return ;
                    Logger.raw(data);
                    const o = JSON.parse(data);

                    this.db.unserialize(o);
                    if(typeof callback === 'function')
                        callback(this);
                })
            }
        });
    }

    /**
     * To save the inspector configuration in a separate JSON file
     *
     * @method
     */
    save(){
        if(this.db == null) return null;

        const self:Inspector = this;
        const savePath:string = _path_.join(this.context.workspace.getSaveDir(), this.id+".json");
        _fs_.exists(savePath, function(exist){
            if(exist){
                _fs_.chmodSync(savePath, 0o777);
                _fs_.unlinkSync(savePath);
            }

            _fs_.open(savePath, 'w+', function(err, fd){
                if(err){
                    console.log("Save file cannot be created");
                    return;
                }

                const data = self.db.serialize();
                _fs_.write(fd, JSON.stringify(data), function(err){
                    if(err){
                        console.log("Save file cannot be created");
                        return;
                    }
                    console.log("Inspector "+self.id+" backed up");
                    _fs_.close(fd,function(err){
                        if(!err){
                            _fs_.chmodSync(savePath, 0o777);
                        }
                    });
                });
            })
        })
    }

    /**
     * To cast the current object to an object ready to be serialize (it avoids cyclic reference)
     *
     * TODO: improve listener serializing
     *
     * @returns {Object} 
     * @method
     */
    toJsonObject():any{
        const o:any = {};
        o.__ = this.__;
        o.id = this.id;
        o.description = this.description;
        o.name = this.name;
        o.running = this.running;
        o.events = this.events;
        o.installed = this.installed;
        o.step = this.step;

        o.db = null;
        if(this.db != null){
            o.db = this.db.toJsonObject();
        }

        o.hooks = this.hookSet.toJsonObject();

        o.preRegisteredTags = [];
        this.preRegisteredTags.map( (c)=>{
            o.preRegisteredTags.push(c.toJsonObject());
        })

        o.gui_available = this.gui_available;

        o.listener = [];
        for(const i in this.listener)
            o.listener.push({ n:i });

        CoreDebug.checkJsonSerialize(o, "Inspector");
        return o;
    }
}
