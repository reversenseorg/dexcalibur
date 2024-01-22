import Inspector, {INSPECTOR_TYPE} from "./Inspector.js";
import DexcaliburProject from "./DexcaliburProject.js";
import HookSet from "./HookSet.js";
import {DelegateWebApi} from "./webapi/DelegateWebApi.js";
import WebServer from "./WebServer.js";
import * as Log from "./Logger.js";
import DexcaliburEngine from "./DexcaliburEngine.js";
import HookStrategy from "./hook/HookStrategy.js";
import {HookManager} from "./hook/HookManager.js";
import {HookDbApi} from "./hook/HookDbApi.js";
import {InspectorFactoryException} from "./errors/InspectorFactoryException.js";


import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    SerializeOptions,
    Tag,
    TagCategory,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "./NodeInternalType.js";
import {IStringIndex, Nullable} from "./core/IStringIndex.js";
import BusEvent from "./BusEvent.js";
import {CustomCode, CustomCodeOptions} from "./actionnable/CustomCode.js";
import HookTemplateFragment from "./hook/HookTemplateFragment.js";
import HookStrategySelector from "./hook/HookStrategySelector.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export type RuntimeEventHandler = ((vContext:DexcaliburProject, vEvent:BusEvent<any>)=>void);

export interface EventListeners {
    [p:string]: RuntimeEventHandler;
}

export interface EventListenersSource {
    [p:string]: CustomCodeOptions
}

export interface EventListenersCode {
    [p:string]: CustomCode
}


export interface TagDefinitions {
    [catName:string]: string[]
}

export interface  HookStrategyOptions {

}

export interface HookSetOptions {
    id?:Nullable<string>;
    name?:Nullable<string>;
    description?:Nullable<string>;
    require?:string[];
    hookShare?:IStringIndex<any>;
    strategies: HookStrategyOptions[]
}


export interface InspectorDbmsOptions {
    dbms:string;
    type:string;
    name: string;
}

export interface InspectorFactoryOptions {
    id?:string;
    name?:string;
    version?:string;
    description?:Nullable<string>;
    webapi?:Nullable<DelegateWebApi>;
    useGUI?:Nullable<boolean>;
    startStep: INSPECTOR_TYPE;
    db?:Nullable<InspectorDbmsOptions>;
    tags?:Nullable<TagDefinitions>;
    color?:Nullable<string>;
    eventListeners?:EventListeners;
    eventListenerSources?:EventListenersSource;
    eventListenersCode?:EventListenersSource|EventListenersCode;
    hookSet?:HookSetOptions;
    require?:string[];
}
/**
 * There is one InspectorFactory for each type prototype of Inspector.
 *
 * This instance is shared by every project and it is a member of DexcaliburEngine objects.
 * Its purpose if to create Inspector instance per project
 *
 * @class
 */
export default class InspectorFactory implements INode
{
    static TYPE:NodeType = new NodeType('inspector_plugin', NodeInternalType.INSPECTOR_PLUGIN, [
        (new NodeProperty("id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("description")).type(DbDataType.STRING).def([]),
        (new NodeProperty("webapi")).volatile().type(DbDataType.BLOB),
        (new NodeProperty("version")).type(DbDataType.STRING).def("0.1"),
        (new NodeProperty("useGUI")).type(DbDataType.BOOLEAN).def(false),
        (new NodeProperty("startStep")).type(DbDataType.STRING).def(INSPECTOR_TYPE.ON_DEMAND),
        (new NodeProperty("db")).type(DbDataType.STRING).def(null),
        (new NodeProperty("tags")).type(DbDataType.STRING).def([]),
        (new NodeProperty("color")).type(DbDataType.STRING).def(null),
        (new NodeProperty("hookSet"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState) => {
                if(x.p==null) return null;

                x.p.strategies.map((s:any) => {
                    if(s.search!=null && s.search.type!=null){
                        if(typeof s.search.type==='object'){
                            s.search.type = (s.search.type as NodeType).getName();
                        }
                    }
                });
                return x.p;
            })
            .wakeUp( (x:NodePropertyState) => {
                if(x.p==null) return null;
                return x.p;
            }),
        (new NodeProperty("require")).type(DbDataType.STRING).def([]),
        (new NodeProperty("itags")).type(DbDataType.NUMERIC).def(null),
        (new NodeProperty("tags")).type(DbDataType.NUMERIC).def([]),
        (new NodeProperty("eventListeners")).volatile().type(DbDataType.STRING).def({}),
        (new NodeProperty("eventListenerSources")).type(DbDataType.STRING)
            .sleep( (x:NodePropertyState)=>{
                const codes:any = {};
                for(let i in x.p){
                    if(x.p[i]!=null){
                        codes[i] = (x.p[i].toJsonObject!=null ? x.p[i].toJsonObject() :  x.p[i]);
                    }
                }
                return codes;
            })
            .wakeUp( (x:NodePropertyState)=>{
                const codes:EventListenersCode = {};
                for(let i in x.p){
                    if(x.p[i]!=null) {
                        codes[i] = (new CustomCode(x.p[i])).wakeUp();
                    }else
                        codes[i] = null;
                }
                Logger.debug("CustomCode::eventListenerSources::WAKE_UP ");
                Logger.debugRAW( codes);
                return codes;
            })
            .def({}),
        (new NodeProperty("eventListenersCode")).type(DbDataType.STRING)
            .sleep( (x:NodePropertyState)=>{
                const codes:any = {};
                for(let i in x.p){
                    codes[i] = (x.p[i].toJsonObject!=null ? x.p[i].toJsonObject() :  x.p[i]);
                }
                return codes;
            })
            .wakeUp( (x:NodePropertyState)=>{
                const codes:EventListenersCode = {};
                for(let i in x.p){
                    if(x.p[i]!=null) {
                        codes[i] = (new CustomCode(x.p[i])).wakeUp();
                    }else
                        codes[i] = null;
                }

                Logger.debug("CustomCode::eventListenersCode::WAKE_UP ");
                Logger.debugRAW( codes);
                return codes;
            }),
        (new NodeProperty("require")).type(DbDataType.STRING).def([])
    ]);

    __ = NodeInternalType.INSPECTOR_PLUGIN;
    _config:Nullable<InspectorFactoryOptions> = null;




    id:string;
    name:Nullable<string> = null;
    description:Nullable<string> = null;
    version:string = "1.0";
    color:any = null;
    startStep:INSPECTOR_TYPE = INSPECTOR_TYPE.ON_DEMAND;
    hookSet:Nullable<HookSetOptions> = null;
    webapi: Nullable<DelegateWebApi> = null;
    db:Nullable<any> = null;
    eventListeners:EventListeners = {};
    eventListenersCode:EventListenersCode = {};
    eventListenerSources:EventListenersSource = {};
    useGUI = false;
    require:string[] = [];
    itags:Nullable<TagDefinitions> = null;

    /**
     * The step when the inspector must be deployed
     */
    step:INSPECTOR_TYPE = INSPECTOR_TYPE.ON_DEMAND;

    tags:TagUUID[] = [];

    /**
     * Flag. True if webapi is ready
     * @private
     */
    private _r:boolean  = false;

    constructor( pModel:InspectorFactoryOptions ){
        this._config = pModel;
        this.step = pModel.startStep;

        if(pModel.id!=null){
            this.id = pModel.id;
        }

        if(pModel.name != null) this.name = pModel.name;
        if(pModel.description != null) this.description = pModel.description;
        if(pModel.version != null) this.version = pModel.version;
        if(pModel.startStep != null) this.startStep = pModel.startStep;
        if(pModel.color != null) this.color = pModel.color;
        if(pModel.hookSet != null){
            this.hookSet = pModel.hookSet;
            if(this.name==null||this.name.length==0) this.name = pModel.hookSet.name;
            if(this.description==null||this.description.length==0) this.description = pModel.hookSet.description;
            if(this.id==null||this.id.length==0) this.id = pModel.hookSet.id;
        }
        if(pModel.require != null) this.require = pModel.require;
        if(pModel.db != null) this.db = pModel.db;
        if(pModel.tags != null) this.itags = pModel.tags;
        if(pModel.useGUI != null) this.useGUI = pModel.useGUI;
        if(pModel.eventListeners != null) this.eventListeners = pModel.eventListeners;
        if(pModel.eventListenerSources != null) this.eventListenerSources = pModel.eventListenerSources;
        if(pModel.hasOwnProperty('webapi'))  this.webapi = pModel.webapi
    }

    getUID(): string  {
        return this.id;
    }

    hasWebApi():boolean {
        return (this.webapi != null);
    }

    isWebApiReady():boolean {
        return this._r;
    }

    /**
     * To create additional web api endpoints
     *
     * If an inspector is generated and it extends web api, then the factory must create the endpoint.
     *
     * TODO: [SECURITY] untrusted inspector (from user) can break isolation by defining webapi available for others projects.
     *
     * @param {WebServer} pWebServer
     * @method
     */
    registerWebServer(pWebServer:WebServer){
        if(this.hasWebApi() && !this.isWebApiReady()){
            Logger.raw("[InspectorFactory] registering web server. Plugin = ", this.id );
            if(this.id == null){
                throw new Error("Inspector has not UID");
            }

            this.webapi.injectServer(pWebServer);
            pWebServer.getApplication().use('/api/inspector/'+this.id, this.webapi.getRouter());
            this._r = true;
            Logger.raw("[InspectorFactory] API endpoint mapped for : "+this.id);
        }
    }

    /**
     * To check if the inspectors make by this factory start at the specified step
     *
     * @param {INSPECTOR_TYPE} pStep
     * @method
     */
    isStartAt(pStep:INSPECTOR_TYPE):boolean{
        return this.step === pStep;
    }


    /**
     * To create an instance of Inspector using the inspector prototype
     *
     * @param {DexcaliburProject} pProject - The project instance
     * @return {Inspector} The freshly created Inspector
     * @method
     */
    async createInstance( pProject:DexcaliburProject):Promise<Inspector>{
        const ins:Inspector = new Inspector();
        const hmgr:HookManager = pProject.getHookManager();
        const hapi:HookDbApi = hmgr.getDbAPI();

        let hs:HookSet = null;
        let strategies:any;
        let hsuid:string = null;

        // keep a reference to the factory who built the Inspector instance
        ins.factory = this;

        // register a new endpoint inside the web api
        if(this.hasWebApi() && !this.isWebApiReady()){
            this.registerWebServer(DexcaliburEngine.getInstance().getWebserver());
        }

        // copy config from prototype to fresh Inspector instance
        if(this.id != null) ins.id = this.id;
        if(this.name != null) ins.name = this.name;
        if(this.description != null) ins.description = this.description;

        // set "when" the inspector must be executed
        if(this.startStep != null){
            ins.setStartStep(this.startStep);
        }

        // If specified, define the color associated to this inspector
        if(this.color != null){
            ins.color = this.color;
        }

        // If the inspector prototype define a hookset, create it or restore it
        if(this.hookSet != null){

            hsuid = (this.id!=null ? this.id : this.hookSet.id);

            //Logger.debug("IS STRATEGY EXISTS ?? : "+hsuid+"  "+await hapi.isHookSetExists(hsuid));

            // the first step is to verify if there is not yet a hook set for this project
            // It happens mainly because the project has been created during a previous run
            // so, data have been partially restored by the hook manager from the SQLIte db of the project earlier

            hs = await hapi.getHookSet(hsuid);
            if(hs == null){
                // else, wen create a new HookSet instance with data from Inspector prototype
                hs = await hmgr.createHookSet(hsuid, {
                    name: (this.hookSet.name!=null ? this.hookSet.name : this.name),
                    description: (this.hookSet.description!=null ? this.hookSet.description : this.description),
                    //require: (this._config.require!=null ? this._config.require : this._config.hookSet.require),
                    share: (this.hookSet.hookShare!=null ? this.hookSet.hookShare : null),
                    color: this.color,
                    builtin: true
                });

                // to configure object shared by several hooks
                if(this.hookSet.hookShare != null){
                    hs.addHookShare(this.hookSet.hookShare);
                }

                // to declare hookset dependencies
                if(this.hookSet.require != null){
                    this.hookSet.require.map((k,v)=>{
                        hs.require(k);
                    });
                }
                // to declare inspector dependencies inherited by hook set
                if(this.require != null){
                    this.require.map((k,v)=>{
                        hs.require(k);
                    });
                }
            }

            // If the hook set is not initiliazed, throw a exception
            if(hs == null){
                throw InspectorFactoryException.HOOKSET_CANNOT_BE_CREATED(this.name!=null ? this.name : this.hookSet.name);
            }

            // browse hook strategy
            strategies = this.hookSet.strategies;

            if(strategies != null){
                // else{
                //                 throw InspectorFactoryException.DUPLICATED_HOOK_STRATEGY(hsuid);
                //             }
                let f:boolean;
                for(let k=0; k<strategies.length; k++){
                    if(strategies[k].name == null){
                        throw InspectorFactoryException.STRATEGY_NAME_IS_MANDATORY(ins.getUID());
                    }


                    const stratUID = hsuid+":"+strategies[k].name;
                    let strat:HookStrategy = null;

                    f = await hapi.isStrategyExists(stratUID);


                    if(!f){
                        strat = HookStrategy.from(strategies[k]);

                        strat.setUID(stratUID);

                        if(strat.hasLoadKeyPoint()){
                            strat.setLoadKeyPoint(
                                await pProject.getKeyPointManager().getKeyPointByAttr({ name: strat.loadOn})
                            );
                        }else{
                            //no loadkp = never load
                            strat.setLoadKeyPoint(pProject.getKeyPointManager().getDefaulLoadKP());
                        }

                        if(strat.hasUnloadKeyPoint()){
                            // no unload = never unload
                            strat.setUnloadKeyPoint(
                                await pProject.getKeyPointManager().getKeyPointByAttr({ name:strat.unloadOn })
                            );
                        }else{
                            //strat.setUnloadKeyPoint(pProject.getKeyPointManager().getDefaulUnloadKP());
                        }

                        Logger.debug("createHookStrategy > "+stratUID);
                        await hapi.createHookStrategy(strat);

                        hs.addStrategy(strat);
                        //await hapi.updateHookStrategy(strat);
                    }else{
                        //strat = await hmgr.getHookStrategy(stratUID);
                        Logger.debug(`createHookStrategy > ${stratUID} exists > ${hsuid} :: ${k}`);
                        throw InspectorFactoryException.DUPLICATED_HOOK_STRATEGY(stratUID);
                    }
                    //hs.addStrategy(strat);
                    //await hapi.updateHookStrategy(strat);
                }
            }

            ins.setHookSet(hs);
            await hapi.updateHookSet(hs);
        }

        // If the inspector use local InMemory DB : create/open it, and create indexes
        if(this.db != null){
            if(this.db.dbms==='inmemory'){

                ins.useMemoryDB(pProject);

                switch(this.db.type){
                    case 'index':
                        ins.getDB().newIndex(this.db.name, null);
                        break;
                    case 'collection':
                        ins.getDB().newCollection(this.db.name,null);
                        break;
                }
            }
        }

        // If the inspector adds own tag categories, add them
        let tagcat:TagCategory;
        if(this.itags != null){
            for(const i in this.itags){
                tagcat = new TagCategory({ name: i });

                this.itags[i].map( (vName:string)=>{
                    tagcat.addTag(new Tag({ name:vName }))
                });

                ins.registerTagCategory(tagcat);
            }
        }

        // If the inspector use GUI, set the flag
        if(this.useGUI === true){
            Logger.debug(`[INSPECTOR FACTORY] useGui `);
            ins.useGUI();
        }


        // If the inspector extend analyzers with own event listener, register it into new Inspector


        // If the inspector extend analyzers with own event listener, register it into new Inspector

        console.log(this.id,this.eventListeners)
        if(this.eventListeners != null){
            Logger.debug(`[INSPECTOR FACTORY] eventListeners > ${Object.keys(this.eventListeners).length } listeners `);
            for(const i in this.eventListeners){
                console.log(i);
                ins.on(i, {
                    task: this.eventListeners[i]
                });
            }
        }

        if(this.eventListenerSources != null){
            Logger.debug(`[INSPECTOR FACTORY] eventListenerSources > ${Object.keys(this.eventListenerSources).length } listeners `);
            let elSrc:CustomCode;
            for(const i in this.eventListenerSources){
                elSrc = new CustomCode(this.eventListenerSources[i]);
                this.eventListenersCode[i] = new CustomCode(elSrc);
                this.eventListenerSources[i] = new CustomCode(elSrc);

                try{
                    ins.on(i, {
                        task: elSrc.createFunction(['pCtx','pEvent'])
                    });
                }catch(err){
                    Logger.error(`[INSPECTOR FACTORY][uid=${this.id}][ERR:${err.code}] createInstance : event listener cannot create from source code. 
                    ${err.msg}
                    ${err.message}`);
                }

            }
        }


        // Finally, when the Inspector is created from the prototype, inject the current project (context)
        // ins.injectContext(pProject);

        return ins;
    }


    /**
     * To restore an instance of an Inspector
     *
     * Tags / TagCatories are not restored, because they have been already importe in global scope.
     *
     * @param {DexcaliburProject} pProject - The project instance
     * @return {Inspector} The freshly created Inspector
     * @method
     */
    async restore( pProject:DexcaliburProject):Promise<Inspector>{
        let ins:Inspector; // = pProject.getInspector(this.getUID());
        const hmgr:HookManager = pProject.getHookManager();
        const hapi:HookDbApi = hmgr.getDbAPI();

        console.log("RESTORE ",this.getUID());

        // retrieve state
        const state = await (pProject.getProjectDB()).getInspectorState(this.getUID());
        const stratDB:MongodbDbCollection = pProject.getProjectDB().getCollectionOf(HookStrategy.TYPE.getType()) as MongodbDbCollection;

        let hs:HookSet = null;
        let strategies:any;
        let hsuid:string = null;
        let strat:HookStrategy;

        console.log("RESTORE ",this.getUID(), state);

        // keep a reference to the factory who restore the Inspector instance
        state.factory = this;

        // register a new endpoint inside the web api
        if(this.hasWebApi() && !this.isWebApiReady()){
            this.registerWebServer(DexcaliburEngine.getInstance().getWebserver());
        }

        // If the inspector prototype define a hookset, create it or restore it
        if(state.hookSet != null){

            hsuid = (this.id!=null ? this.id : this.hookSet.id);

            Logger.debugRAW("IS STRATEGY EXISTS ?? : "+hsuid+"  "+ await hapi.isHookSetExists(hsuid));

            // the first step is to verify if there is not yet a hook set for this project
            // It happens mainly because the project has been created during a previous run
            // so, data have been partially restored by the hook manager from the SQLIte db of the project earlier

            if(await hapi.isHookSetExists(hsuid)){
                // if the hook set is already instantiated, we get the instance
                hs = await hapi.getHookSet(hsuid);
            }else{
                throw InspectorFactoryException.HOOKSET_CANNOT_BE_RESTORED(hsuid);
            }

            // restore hook strategy
            if(hs.strats != null){

                for(let k=0; k<hs.strats.length; k++){

                    if(typeof hs.strats[k] === 'string'){
                        strat = hs.strats[k] = await pProject.getProjectDB().getHookStrategy(hs.strats[k] as any) ;
                    }else if(hs.strats[k]!=null){
                        strat = hs.strats[k];
                    }else{
                        Logger.info("[INSPECTOR FACTORY]["+this.id+"]["+k+"] No strategy defined, skipped. ")
                        continue;
                    }

                    if(strat.hasLoadKeyPoint()){
                        strat.setLoadKeyPoint(
                            await pProject.getKeyPointManager().getKeyPointByAttr({name:strat.loadOn})
                        );
                    }

                    if(strat.hasUnloadKeyPoint()){
                        strat.setUnloadKeyPoint(
                            await pProject.getKeyPointManager().getKeyPointByAttr({name:strat.unloadOn})
                        );
                    }


                    // update strategies if there is new things
                    /*if(!await hapi.isStrategyExists(strat.getUID())){
                        strat = HookStrategy.from(strategies[k]);

                        strat.setUID(stratUID);

                        if(strat.hasLoadKeyPoint()){
                            strat.setLoadKeyPoint(
                                await pProject.getKeyPointManager().getKeyPointByAttr({name:strat.loadOn})
                            );
                        }

                        if(strat.hasUnloadKeyPoint()){
                            strat.setUnloadKeyPoint(
                                await pProject.getKeyPointManager().getKeyPointByAttr({name:strat.unloadOn})
                            );
                        }

                        await hapi.createHookStrategy(strat);

                    }else{
                        strat = await hmgr.getHookStrategy(stratUID);
                    }

                    hs.addStrategy(strat);*/
                }
            }

            state.setHookSet(hs);
            await hapi.updateHookSet(hs);
        }

        // If the inspector use local InMemory DB : create/open it, and create indexes
        if(state.db != null){

            console.log("RESTORE INSPECTOR > state.db > ",state.db);
            /*
            const cfgDB = state.db as any;
            let dataSet:any ;

            if(cfgDB.schema !=null){
                if(cfgDB.schema.dbms==='inmemory'){
                    state.useMemoryDB(pProject);

                    switch(cfgDB.schema.type){
                        case 'index':
                            dataSet = state.getDB().newIndex(cfgDB.schema.name, null);
                            if(cfgDB.data!=null){

                            }
                            break;
                        case 'collection':
                            dataSet = state.getDB().newCollection(cfgDB.schema.name, null);
                            if(cfgDB.data!=null){

                            }
                            break;
                    }
                }
            }*/
        }

        // If the inspector adds own tag categories, add them
        // Tags are already imported
        /*let tagcat:TagCategory;
        if(state.preRegisteredTags != null){
            state.preRegisteredTags.map(x => {

            })
            for(const i in this._config.tags){
                tagcat = new TagCategory({ name: i });

                this._config.tags[i].map( (vName:string)=>{
                    tagcat.addTag(new Tag({ name:vName }))
                });
            }
        }*/


        // If the inspector extend analyzers with own event listener, register it into new Inspector
        /*if(this.eventListenersCode != null){
            for(const eventName in this.eventListenersCode){
                if(this.eventListenersCode[eventName].fn!=null){
                    state.on(eventName, {
                        task: this.eventListenersCode[eventName].fn
                    });
                }
            }
        }*/


        if(this._config.eventListenerSources != null){
            let elSrc:CustomCode;
            for(const i in this._config.eventListenerSources){
                elSrc = new CustomCode(this._config.eventListenerSources[i]);
                this.eventListenersCode[i] = new CustomCode(elSrc);

                state.on(i, {
                    task: elSrc.createFunction(['pCtx','pEvent'])
                });
            }
        }


        // If the inspector extend analyzers with own event listener, register it into new Inspector
        if(this._config.eventListeners != null){
            for(const i in this._config.eventListeners){
                state.on(i, {
                    task: this._config.eventListeners[i]
                });
            }
        }

        // Finally, when the Inspector is created from the prototype, inject the current project (context)
        state.injectContext(pProject);

        return state;
    }

    /**
     * To prepare custom code from listeners sources code
     *
     * If necessary, it transpiles TS source code to JS
     */
    compileListeners():void {
        for(let i in this.eventListenerSources){
            try{
                this.eventListenersCode[i] = (new CustomCode(this.eventListenerSources[i])).wakeUp();
            }catch(err){
                this.eventListenersCode[i] = (new CustomCode(this.eventListenerSources[i]));
                this.eventListenersCode[i].errors = err.message+' '+err.stack;
                Logger.error(`[INSPECTOR FACTORY] [${this.id}] Listener '${i}' cannot be compiled : ${err.message}`);
                Logger.raw(err.stack);
            }

        }
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return this;
    }
}
InspectorFactory.TYPE.builder(InspectorFactory);