import Inspector, {INSPECTOR_TYPE} from "./Inspector";
import DexcaliburProject from "./DexcaliburProject";
import HookSet from "./HookSet";
import Hook from "./Hook";
import {DelegateWebApi} from "./webapi/DelegateWebApi";
import WebServer from "./WebServer";
import * as Log from "./Logger";
import DexcaliburEngine from "./DexcaliburEngine";
import HookStrategy from "./hook/HookStrategy";
import {HookManager} from "./hook/HookManager";
import {HookDbApi} from "./hook/HookDbApi";
import {InspectorFactoryException} from "./errors/InspectorFactoryException";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * There is one InspectorFactory for each type prototype of Inspector.
 *
 * This instance is shared by every project and it is a member of DexcaliburEngine objects.
 * Its purpose if to create Inspector instance per project
 *
 * @class
 */
export default class InspectorFactory
{
    _config:any = null;

    /**
     * The step when the inspector must be deployed
     */
    step:INSPECTOR_TYPE = null;
    webapi: DelegateWebApi = null;

    /**
     * Flag. True if webapi is ready
     * @private
     */
    private _r:boolean  = false;

    constructor( pModel:any ){
        this._config = pModel;
        this.step = pModel.startStep;
        if(pModel.hasOwnProperty('webapi'))
            this.webapi = pModel.webapi
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
            Logger.raw("[InspectorFactory] registering web server. Plugin = ", this._config.id );
            if(this._config.id == null){
                throw new Error("Inspector has not UID");
            }

            this.webapi.injectServer(pWebServer);
            pWebServer.getApplication().use('/api/inspector/'+this._config.id, this.webapi.getRouter());
            this._r = true;
            Logger.raw("[InspectorFactory] API endpoint mapped for : "+this._config.id);
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
    createInstance( pProject:DexcaliburProject):Inspector{
        const ins:Inspector = new Inspector();
        const hmgr:HookManager = pProject.getHookManager();
        const hapi:HookDbApi = hmgr.getDbAPI();
        let hs:HookSet = null;
        let strategies:any;
        let hsuid:string = null;

        // register a new endpoint inside the web api
        if(this.hasWebApi() && !this.isWebApiReady()){
            this.registerWebServer(DexcaliburEngine.getInstance().getWebserver());
        }

        // copy config from prototype to fresh Inspector instance
        if(this._config.id != null) ins.id = this._config.id;
        if(this._config.name != null) ins.name = this._config.name;
        if(this._config.description != null) ins.description = this._config.description;

        // set "when" the inspector must be executed
        if(this._config.startStep != null){
            this.step = this._config.startStep;
            ins.setStartStep(this._config.startStep);
        }

        // If specified, define the color associated to this inspector
        if(this._config.color != null){
            ins.color = this._config.color;
        }

        // If the inspector prototype define a hookset, create it or restore it
        if(this._config.hookSet != null){

            hsuid = (this._config.id!=null ? this._config.id : this._config.hookSet.id);

            Logger.raw("IS STRATEGY EXISTS ?? : "+hsuid+"  "+hapi.isHookSetExists(hsuid));

            // the first step is to verify if there is not yet a hook set for this project
            // It happens mainly because the project has been created during a previous run
            // so, data have been partially restored by the hook manager from the SQLIte db of the project earlier
            if(hapi.isHookSetExists(hsuid)){
                // if the hook set is already instantiated, we get the instance
                hs = hapi.getHookSet(hsuid);
            }else{
                // else, wen create a new HookSet instance with data from Inspector prototype
                hs = hmgr.createHookSet(hsuid, {
                    name: (this._config.hookSet.name!=null ? this._config.hookSet.name : this._config.name),
                    description: (this._config.hookSet.description!=null ? this._config.hookSet.description : this._config.description),
                    //require: (this._config.require!=null ? this._config.require : this._config.hookSet.require),
                    hookshare: (this._config.hookSet.hookshare!=null ? this._config.hookSet.hookshare : null),
                    color: this._config.color,
                    builtin: true
                });

                // to configure object shared by several hooks
                if(this._config.hookSet.hookShare != null){
                    hs.addHookShare(this._config.hookSet.hookShare);
                }

                // to declare hookset dependencies
                if(this._config.hookSet.require != null){
                    this._config.hookSet.require.map((k,v)=>{
                        hs.require(k);
                    });
                }
                // to declare inspector dependencies inherited by hook set
                if(this._config.require != null){
                    this._config.require.map((k,v)=>{
                        hs.require(k);
                    });
                }
            }

            // If the hook set is not initiliazed, throw a exception
            if(hs == null){
                throw InspectorFactoryException.HOOKSET_CANNOT_BE_CREATED(this._config.name!=null ? this._config.name : this._config.hookSet.name);
            }

            // browse hook strategy
            strategies = this._config.hookSet.strategies;

            if(strategies != null){
                strategies.map((vStratCfg)=>{
                    if(vStratCfg.name == null){
                        throw InspectorFactoryException.STRATEGY_NAME_IS_MANDATORY(ins.getUID());
                    }

                    const stratUID = hsuid+":"+vStratCfg.name;
                    let strat:HookStrategy = null;

                    if(!hapi.isStrategyExists(stratUID)){
                        strat = HookStrategy.from(vStratCfg);

                        strat.setUID(stratUID);

                        if(strat.hasLoadKeyPoint()){
                            strat.setLoadKeyPoint(
                                pProject.getKeyPointManager().getKeyPoint(strat.loadOn)
                            );
                        }

                        if(strat.hasUnloadKeyPoint()){
                            strat.setUnloadKeyPoint(
                                pProject.getKeyPointManager().getKeyPoint(strat.unloadOn)
                            );
                        }

                        hapi.createHookStrategy(strat);

                    }else{
                        strat = hmgr.getHookStrategy(stratUID);
                    }
                    hs.addStrategy(strat);
                    hapi.updateHookStrategy(strat);
                });
            }

            ins.setHookSet(hs);
            hapi.updateHookSet(hs);
        }

        // If the inspector use local InMemory DB : create/open it, and create indexes
        if(this._config.db != null){
            if(this._config.db.dbms==='inmemory'){

                ins.useMemoryDB(pProject);

                switch(this._config.db.type){
                    case 'index':
                        ins.getDB().newIndex(this._config.db.name, null);
                        break;
                    case 'collection':
                        ins.getDB().newCollection(this._config.db.name,null);
                        break;
                }
            }   
        }

        // If the inspector adds own tag categories, add them
        if(this._config.tags != null){
            for(const i in this._config.tags){
                ins.registerTagCategory(i, this._config.tags[i]);
            }  
        }

        // If the inspector use GUI, set the flag
        if(this._config.useGUI === true){
            ins.useGUI();
        }

        // If the inspector extend analyzers with own event listener, register it into new Inspector
        if(this._config.eventListeners != null){
            for(const i in this._config.eventListeners){
                ins.on(i, {
                    task: this._config.eventListeners[i]
                });
            }
        }

        // Finally, when the Inspector is created from the prototype, inject the current project (context)
        ins.injectContext(pProject);

        return ins;
    }
}
