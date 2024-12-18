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
import {BusEventHandler, BusSubscriber} from "./Bus.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import Util from "./Utils.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {IDatabase, IDatabaseAdapter, NodeType, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "./core/IStringIndex.js";
import InspectorFactory, {HookSetOptions} from "./InspectorFactory.js";
import {InspectorFactoryException} from "./errors/InspectorFactoryException.js";
import HookStrategy, {HookStrategyOptions} from "./hook/HookStrategy.js";
import {UPGRADE_MODE} from "./inspector/common.js";
import {InspectorState} from "./hook/common.js";
import {InspectorManagerException} from "./errors/InspectorManagerException.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * List of steps from where an inspector can be deployed.
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
    [eventType :string] :BusEventHandler[]
}


/**
 * An inspector is a plugin able to add (and/or):
 * - One or more data analyzer and classifier to main Bus
 * - One hook set containing One or more heuristics (HookStrategy) able to generate instrumentation
 * - Additional REST endpoint to extend Dexcalibur server APIs
 * - Additional GUI components
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
export default class Inspector
{
    static TYPE:NodeType = new NodeType( "inspectors", NodeInternalType.INSPECTOR, []);

    __:NodeInternalType = NodeInternalType.INSPECTOR;

    private _dirty = false;

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
    listener:Record<string, BusEventHandler[]> = {};

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
     * Optionally, the instance of the factory who built this
     * Inspector instance.
     *
     * @field
     */
    factory:Nullable<InspectorFactory> = null;


    /**
     * Flag. TRUE if the inspector has been created from a factory from an older version of DxEngine
     * and will be removed in future
     *
     * The user should migrate or remove this inspector.
     *
     * @type {boolean}
     * @field
     */
    deprecated = false;

    /**
     * Flag. TRUE if the factory has been created from a factory from an older version of DxEngine,
     * and has been removed from current version.
     *
     * The user should remove this inspector.
     *
     * @type {boolean}
     * @field
     */
    removed = false;

    /**
     *
     * @param config
     * @constructor
     */
    constructor(pConfig:any=null){

        if(pConfig!=null){
            for(const i in pConfig){
                this[i] = pConfig[i];
            }
            if(pConfig.hookSet != null){
                if(this.name==null) this.name = pConfig.hookSet.name;
                if(this.description==null) this.description = pConfig.hookSet.description;
                if(this.id==null && pConfig.hookSet.id!=null) this.id = pConfig.hookSet.id;
            }
        }


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
     * To declare new event handler.
     *
     * @param {string} pEventType  The name of the event
     * @param {BusEventHandler} pHandler Handler waiting for event with type `pEventType`
     * @return {Inspector} This inspector instance
     * @method
     */
    on(pEventType:string, pHandler: BusEventHandler):Inspector{


        if(this.listener[pEventType] == null) this.listener[pEventType] = [];

        Logger.debug(`[INSPECTOR][name=${this.name}] set listener [o=${pEventType}] }`);

        this.listener[pEventType].push(pHandler);


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
    async injectContext(ctx:DexcaliburProject):Promise<Inspector>{
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
            await tmgr.importCategory(this.preRegisteredTags[i]);
        }


        // register listeners

        // subscribe
        for(let evtName in this.listener){
            this.listener[evtName].map(( vEvtHandler:BusEventHandler)=>{
                this.context.getBus().singleSubscribe<any>(evtName, BusSubscriber.from(vEvtHandler));
            });
        }



        /*if(this.db instanceof InMemoryDb){
            //this.db.setContext(this.context);
        }*/

        this._dirty = false;

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
    async deploy():Promise<void>{
        this.running = true;

        // add a check to force to redeploy or not
        if(this.hookSet!=null){
            await this.hookSet.deploy();
        }
    }

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
        console.log("RESTORE INSPECTOR STATE : "+this.getUID());
        //let self:Inspector = this;
        /*
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
        });*/
    }

    /**
     * To save the inspector configuration in a separate JSON file
     *
     * @method
     */
    async save():Promise<void>{
        await this.context.getProjectDB().saveInspectorState(this);

        /*
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
        })*/
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
        o.deprecated = this.deprecated;
        o.removed = this.removed;

        o.db = null;
        if(this.db != null){
            o.db = {
                schema:  (this.factory!=null? this.factory._config.db : null),
                data: this.db.toJsonObject()
            }
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

    static fromJsonObject(pConfig:any):Inspector {
        const insp = new Inspector(pConfig);

        // dirty inspector are not running, they must be re-deployed first
        insp.running = false;
        insp.dirty();

        // restore DB info
        if(insp.db != null){

        }

        // don't restore hook set here, mark it as dirty
        if(insp.hookSet != null){
            insp.hookSet = new HookSet(insp.hookSet);
            insp.hookSet.dirty();
        }

        // restore tag categories
        if(pConfig.preRegisteredTags != null){
            const preRegisteredTags:TagCategory[] = [];

            pConfig.preRegisteredTags.map(x  => {
                preRegisteredTags.push(new TagCategory(x));
            });

            insp.preRegisteredTags = preRegisteredTags;
        }


        return insp;
    }

    dirty(){
        this._dirty = true;
    }

    isDirty():boolean {
        return this._dirty;
    }

    /**
     * To add a new strategy from options
     *
     * By default the UID is autogenerated as :
     *
     * <HOOKSET_UID>:<STRATEGY_NAME>
     *
     * @param {HookStrategyOptions} pStrategy Strategy options
     * @return {HookStrategy}
     * @method
     */
    async addStrategyFromOptions( pStrategy:HookStrategyOptions, pUID:string = null):Promise<HookStrategy> {


        let strat = HookStrategy.from(pStrategy);

        // generate UID
        if(pUID != null){
            strat.setUID(pUID);
        }else{
            strat.setUID(this.hookSet.getUID()+":"+strat.getName());
        }

        if(await this.context.getHookManager().db.isStrategyExists(strat.getUID())){
            throw InspectorFactoryException.DUPLICATED_HOOK_STRATEGY(strat.getUID());
        }

        // init KPs
        if(strat.hasLoadKeyPoint()){
            strat.setLoadKeyPoint(
                await this.context.getKeyPointManager().getKeyPointByAttr({ name: strat.loadOn})
            );
        }else{
            //no loadkp = never load
            strat.setLoadKeyPoint(this.context.getKeyPointManager().getDefaulLoadKP());
        }

        if(strat.hasUnloadKeyPoint()){
            // no unload = never unload
            strat.setUnloadKeyPoint(
                await this.context.getKeyPointManager().getKeyPointByAttr({ name:strat.unloadOn })
            );
        }


        // insert the hook strategy and generated fragments into DB
        await this.context.getHookManager().db.createHookStrategy(strat);


        this.hookSet.addStrategy(strat);
        //await hapi.updateHookStrategy(strat);

        return strat;
    }


    /**
     *
     * @param pStrategy
     * @param pUID
     */
    async updateStrategyFromOptions( pStrategy:HookStrategyOptions, pUID:string = null):Promise<HookStrategy> {


        let strat = HookStrategy.from(pStrategy);

        // generate UID
        if(pUID != null){
            strat.setUID(pUID);
        }else{
            strat.setUID(this.hookSet.getUID()+":"+strat.getName());
        }

        if(! await this.context.getHookManager().db.isStrategyExists(strat.getUID())){
            return await this.addStrategyFromOptions(pStrategy, pUID);
        }

        // update KPs
        if(strat.hasLoadKeyPoint()){
            strat.setLoadKeyPoint(
                await this.context.getKeyPointManager().getKeyPointByAttr({ name: strat.loadOn})
            );
        }else{
            //no loadkp = never load
            strat.setLoadKeyPoint(this.context.getKeyPointManager().getDefaulLoadKP());
        }

        if(strat.hasUnloadKeyPoint()){
            // no unload = never unload
            strat.setUnloadKeyPoint(
                await this.context.getKeyPointManager().getKeyPointByAttr({ name:strat.unloadOn })
            );
        }

        // insert the hook strategy and generated fragments into DB
        await this.context.getHookManager().db.updateHookStrategy(strat);
    }
    /**
     * To update hook set and children strategies
     *
     * @param context
     */
    async updateHookSet(pContext: DexcaliburProject, pHookSetOpts:HookSetOptions, pMode:UPGRADE_MODE = UPGRADE_MODE.REPLACE):Promise<void> {
        let f:boolean;
        let newStrats:Record<string, any> = {};
        let stratUID:string, oldStrat:HookStrategy, strat:HookStrategy;

        pHookSetOpts.strategies.map(x => {
            newStrats[x.name] = x;
            if(x.uid==null){
                x.uid = pHookSetOpts.id+":"+x.name;
            }
        });

        // update hook share
        if(pHookSetOpts.description != null){
            this.hookSet.description = pHookSetOpts.description;
        }

        // update required modules
        if(pHookSetOpts.require != null){
            this.hookSet.updateRequires(pHookSetOpts.require);
        }

        // update hook share
        if(pHookSetOpts.hookShare != null){
            this.hookSet.updateHookShare(pHookSetOpts.hookShare)
        }


        // update prologue
        if(pHookSetOpts.prologue != null){
            this.hookSet.setPrologue(pHookSetOpts.prologue)
        }

        // update old strategies
        const existingsStrats:string[] = [];
        for(let k=0; k<this.hookSet.strats.length; k++){

            oldStrat = this.hookSet.strats[k];
            stratUID = this.hookSet.getUID()+":"+this.hookSet.strats[k].name;

            existingsStrats.push(stratUID);

            if(newStrats[oldStrat.name]!=null){
                console.log(newStrats[oldStrat.name].uid,oldStrat.getUID());
                if(newStrats[oldStrat.name].uid==oldStrat.getUID()){
                    await this.updateStrategyFromOptions(newStrats[oldStrat.name]);
                }else{
                    // no conflict, just "append"
                    await this.addStrategyFromOptions(newStrats[oldStrat.name]);
                }
            }else if(pMode==UPGRADE_MODE.REPLACE){
                // remove old
                //await this.removeStrategy(oldStrat);
            }
        }

        // add new strategies
        for(let k in newStrats){

            stratUID = this.hookSet.getUID()+":"+newStrats[k].name;

            if(existingsStrats.indexOf(stratUID)==-1){
                 await this.addStrategyFromOptions(newStrats[k]);
            }
        }

        // save changes
        await this.context.getHookManager().getDbAPI().updateHookSet(this.hookSet);
    }

    /**
     * To mark the inspector instance as "deprecated"
     * "Deprecated" factories will be removed.
     *
     * @method
     */
    markAsDeprecated() {
        this.markAs(InspectorState.DEPRECATED);
    }

    /**
     *
     */
    markAsRemoved() {
        this.markAs(InspectorState.REMOVED);
    }

    /**
     *
     */
    markAs(pFlag:InspectorState) {

        if([InspectorState.DEPRECATED,InspectorState.REMOVED].indexOf(pFlag)>-1){
            throw InspectorManagerException.MARKER_NOT_SUPPORTED(pFlag);
        }

        this[pFlag] = true;

        this.hookSet.markAs(pFlag);
    }
}
Inspector.TYPE.builder(Inspector);