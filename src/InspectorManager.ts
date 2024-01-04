import * as  _path_ from "path";
import * as  _fs_ from 'fs';
import * as  _xz_ from 'xz';
import got from 'got';

import DexcaliburEngine from "./DexcaliburEngine.js";
import Inspector, {INSPECTOR_TYPE} from "./Inspector.js";
import DexcaliburProject from "./DexcaliburProject.js";
import InspectorFactory from "./InspectorFactory.js";
import Util from "./Utils.js";
import DexcaliburRegistry from "./DexcaliburRegistry.js";
import * as Log from './Logger.js';
import WebServer from "./WebServer.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


var gInstance:InspectorManager = null;

export interface InspectorFactorySet {
    [id :string] :InspectorFactory;
}


export interface InspectorMap {
    [inspectorID :string] :Inspector;
}

export interface ProjectInspectorMap {

    [projectUID :string] :InspectorMap;
}

/**
 * @class
 */
export default class InspectorManager
{
    engine:DexcaliburEngine = null;

    inspectors:Inspector[] = [];
    errors:string[] = [];

    projects:ProjectInspectorMap = {};

    enabled:any = {};

    locals:InspectorFactorySet = {};
    remote:InspectorFactorySet = {};
    /**
     * 
     * @param {DexcaliburProject} pProject Project instance
     * @constructor
     */
    constructor( pEngine:DexcaliburEngine){
        this.engine = pEngine;
    }

    static getInstance( pEngine:DexcaliburEngine = null):InspectorManager{
        if(gInstance == null){
            gInstance = new InspectorManager(pEngine);
        }

        return gInstance;
    }


    /**
     * 
     * @param {*} pRegistry 
     * @param {*} pName 
     */
    async install(pInspector:Inspector):Promise<boolean>{

        /*let path:string = _path_.join( this.engine.workspace.getTempFolderLocation(), pInspector.getUID()+".xz");

        await pipeline(
            got.stream(pInspector.getRemotePath()),
            _xz_.Decompressor(),
            _fs_.createWriteStream(path)
        );

        if(_fs_.existsSync(path) == true){
            pInspector.checkInstall();
            return true;
        }else{
            return false;
        }*/
        return true;
    }

    isInstalled( pName:string):boolean{
        return (this.locals[pName] instanceof Inspector)
    }

    getLocal():InspectorFactorySet{
        return this.locals;
    }

    getRemote():InspectorFactorySet{
        return this.remote;
    }


    async enumerate(){

        this.locals = await this.enumerateLocal();

        /*(async ()=>{
            this.remote = await this.enumerateRemote();

            for(let i in this.local){
                if(this.remote[i] instanceof Inspector){
                    this.local[i] = this.remote[i];
                }
            }
        })();*/
    }

    /**
     * TODO : add DB as backend
     */
    async enumerateLocal():Promise<InspectorFactorySet>{
        let p:string =null;
        const ws:string = _path_.join(Util.__dirname(import.meta.url), '..', 'inspectors'); // this.engine.workspace.getPluginsFolderLocation();
        const files:string[] = _fs_.readdirSync(ws);

        for(let i=0; i<files.length; i++){
            if(this.locals[ files[i] ] == null){

                p = _path_.join( ws, files[i], "main.js");

                if(_fs_.existsSync(p)){
                    this.locals[ files[i] ] = (await import(p)).default; //require(p);
                }
            }
        }


        Logger.info("[INSPECTOR MANAGER] Inspectors found  : "+Object.keys(this.locals));

        return this.locals;
    }
    




    /**
     * To enumerate platforms of a remote registry
     *  
     * @param {require('./DexcaliburRegistry')} pRegistry The remote registry
     * @returns {Platform[]} An array a platform 
     * @method
     */
    async enumerateRemote( pRegistry:DexcaliburRegistry):Promise<InspectorFactorySet>{

        // todo
        /*
        let platforms  = null, p=null, res={};

        if(pRegistry == null){
            pRegistry = this.engine.getRegistry();
        }

        // retrieve remote platform
        inspectors = await pRegistry.enumerateInspectors();

        for(let i=0; i<inspectors.length; i++){
            p = Inspector.fromRemoteName(platforms[i].name);
            if(p == null) continue;

            p.setRemotePath(platforms[i].download_url);
            p.setLocalPath( _path_.join(this.engine.workspace.getPlatformFolderLocation(), p.getUID()));
            p.setSize(platforms[i].size);
            p.setHash(platforms[i].sha);

            res[p.getUID()] = p;
        }*/
        
        return {};
    }


    getInspectorsOf(pProject:DexcaliburProject):InspectorMap{
        //Logger.info("getInspectorsOf:" + pProject.getUID()+" ( "+(pProject==null?'<null>':'<project>')+")");
        return this.projects[pProject.getUID()];
    }

    /**
     * 
     * @param {*} pProject 
     * @param {*} pName 
     * @method
     */
    getEnabledInspector(pProject:DexcaliburProject, pName:string):Inspector{
        const all = this.projects[pProject.getUID()];

        if(all == null) 
            return null;

        return all[pName];
    }

    /**
     * 
     * @param {*} pName 
     * @method
     */
    getRemoteInspector( pName:string):InspectorFactory{
        return this.remote[pName];
    }

    /**
     * 
     * @param {*} pName 
     * @method
     */
    getLocalInspector( pName:string):InspectorFactory{
        if(this.locals[pName] instanceof Inspector){
            return this.locals[pName];
        }

        // throw exception
        return null;
    }



    // -----------

    /**
     * 
     * @param {*} err 
     * @method
     */
    addError(err:string):void{
        this.errors.push(err);
    }


    /**
     * 
     * @param {*} err 
     * @method
     */
    lastError():string{
        if(this.errors.length > 0)
            return this.errors[this.errors.length-1];
        else
            return null;
    }

    /**
     * Import inspector contained into the folders inspectors/*
     * 
     * @method
     * @deprecated
     */
    autoRegister( pProject:DexcaliburProject){
        const self:InspectorManager=this;

        Util.forEachFileOf(
            _path_.join(__dirname,"..","inspectors"), function(path:string){
                let insp:any = null;
                
                if(path.endsWith("/inspector.js")){
                    insp = require(path);

                    if(insp instanceof InspectorFactory){
                        // todo
                        console.log('USELESS ?');
                    }else{
                        insp.injectContext(pProject);
                    }
                    // subscribe to events bus
                    pProject.bus.register(insp);
                    
                    self.add(insp);
                }
        },true);
    }


    /**
     * To create inspector instance per actives projects
     *
     * @param {DexcaliburProject} pProject
     * @return {boolean}
     */
    createInspectorsFor( pProject:DexcaliburProject):boolean{
        const uid:string = pProject.getUID();
        let factory:InspectorFactory;
        const ws:WebServer = DexcaliburEngine.getInstance().getWebserver();

        if(this.projects[uid] == null){
            this.projects[uid] = {};
        }

        for(const i in this.locals){
            factory = (this.locals[i] as any);
            /*if(factory.hasWebApi() && !factory.isWebApiReady()){
                factory.registerWebServer(ws);
            }*/
            this.projects[uid][i] = factory.createInstance(pProject);
            pProject.bus.register(this.projects[uid][i]);
        }

        return true;
    }


    /**
     * To restore inspector instances from a dirty project
     *
     * @param {DexcaliburProject} pProject
     * @return {boolean}
     */
    restoreInspectorsFor( pProject:DexcaliburProject):boolean{
        const uid:string = pProject.getUID();
        let factory:InspectorFactory;

        if(this.projects[uid] == null){
            this.projects[uid] = {};
        }

        const inspNames = Object.keys(pProject.inspectors);

        Object.keys(pProject.inspectors).map((vInspName:string)=>{
            factory = (this.locals[vInspName] as any);
            if(factory != null){
                this.projects[uid][vInspName] = factory.restore(pProject);
                pProject.bus.register(this.projects[uid][vInspName]);
            }
        });

        pProject.restore();

        return true;
    }

    /**
     * To get an inspector by its UID
     * 
     * @param {String} id Inspector UID
     * @method
     */
    get(id:string):Inspector{
        for(let k=0 ; k<this.inspectors.length; k++)
            if(id == this.inspectors[k].id)
                return this.inspectors[k];
        
        this.addError("Inspector not found by name. (name="+id+")");
        return null;
    }

     /**
     * To get a list of all inspectors
     *  
     * @returns {Inspector[]} Array of inspector
     * @method
     */
    list():Inspector[]{
        return this.inspectors;
    }


     /**
     * To create inspector for target project
     * 
     * @param {*} pProject 
     * @param {*} pStep 
     */
    deployInspectors( pProject:DexcaliburProject, pStep:INSPECTOR_TYPE):boolean{
        const uid:string = pProject.getUID();
        let insp = "";

        if(this.projects[uid] == null) {
            // cannot deployed not initiliazed inspectors
            return false;
        }

        for(let i in this.projects[uid]){
            if(this.projects[uid][i].isStartAt(pStep)){
                this.projects[uid][i].deploy();
                insp += i+' ';
            }
        }

        Logger.info("[INSPECTOR MANAGER] Project["+uid+"], Step["+pStep+"] deploying inspectors : "+(insp.length==0? '<none>':insp));

        return true;
    }


    /**
     * 
     * 
     * @param {Inspector} pInspector Add an inspector 
     * @method
     */
    add(pInspector:Inspector):InspectorManager{
        this.inspectors.push(pInspector);

        return this;
    }

    /**
     * @method
     */
    deployAll():void{
        for(const k in this.inspectors)
            this.inspectors[k].deploy();
    }

    /**
     * 
     * @param {String} name Inspector name
     * @returns {Boolean} 
     * @method
     */
    deploy(name:string):boolean{
        const insp:Inspector = this.get(name);
        if(insp instanceof Inspector){
            insp.deploy();
            return true;
        }
        return false;
    }
}
