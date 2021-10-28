import Inspector, {INSPECTOR_TYPE} from "./Inspector";
import DexcaliburProject from "./DexcaliburProject";
import HookSet from "./HookSet";
import Hook from "./Hook";
import {DelegateWebApi} from "./webapi/DelegateWebApi";
import WebServer from "./WebServer";
import * as Log from "./Logger";
import DexcaliburEngine from "./DexcaliburEngine";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class InspectorFactory
{
    _config:any = null;
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

    isStartAt(pStep:INSPECTOR_TYPE):boolean{
        return this.step === pStep;
    }


    /**
     * To create an Inspector from this prototype
     * 
     * @param {*} pProject 
     */
    createInstance( pProject:DexcaliburProject):Inspector{
        let ins:Inspector = new Inspector();
        let hs:HookSet = null;
        let hooks:Hook[] = null;

        this.registerWebServer(DexcaliburEngine.getInstance().getWebserver());

        if(this._config.id != null) ins.id = this._config.id;
        if(this._config.name != null) ins.name = this._config.name;
        if(this._config.description != null) ins.description = this._config.description;

        if(this._config.startStep != null){
            this.step = this._config.startStep;
            ins.setStartStep(this._config.startStep);
        }

        if(this._config.color != null){
            ins.color = this._config.color;
        }

        if(this._config.hookSet != null){



            hs = new HookSet({
                id: (this._config.id!=null ? this._config.id : this._config.hookSet.id),
                name: (this._config.name!=null ? this._config.name : this._config.hookSet.name),
                description: (this._config.description!=null ? this._config.description : this._config.hookSet.description),
                color: this._config.color,
                builtin: true
            });

            hooks = this._config.hookSet.hooks;

            if(hooks != null){
                hooks.map((vHookCfg)=>{
                    hs.addIntercept(vHookCfg);
                });
            }

            if(this._config.hookSet.hookShare != null){
                hs.addHookShare(this._config.hookSet.hookShare);
            }

            if(this._config.hookSet.require != null){
                this._config.hookSet.require.map((k,v)=>{
                    hs.require(k);
                });
            }

            ins.setHookSet(hs);
        }

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

        if(this._config.tags != null){
            for(let i in this._config.tags){
                ins.registerTagCategory(i, this._config.tags[i]);
            }  
        }

        if(this._config.useGUI === true){
            ins.useGUI();
        }

        if(this._config.eventListeners != null){
            for(let i in this._config.eventListeners){
                ins.on(i, {
                    task: this._config.eventListeners[i]
                });
            }
        }

        ins.injectContext(pProject);

        return ins;
    }
}
