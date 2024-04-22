import * as  _path_ from "path";
import * as  _fs_ from 'fs';

import DexcaliburEngine from "./DexcaliburEngine.js";
import Inspector, {INSPECTOR_TYPE} from "./Inspector.js";
import DexcaliburProject from "./DexcaliburProject.js";
import InspectorFactory, {
    EventListeners, EventListenersCode,
    EventListenersSource,
    FlattenTagCategoryOptions,
    UpgradeLevel
} from "./InspectorFactory.js";
import Util from "./Utils.js";
import DexcaliburRegistry from "./DexcaliburRegistry.js";
import * as Log from './Logger.js';
import {Tag, TagOptions} from "@dexcalibur/dexcalibur-orm";
import {InspectorManagerException} from "./errors/InspectorManagerException.js";
import {Nullable} from "./core/IStringIndex.js";

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

interface Changes {
    _changes:string[];
}

interface FactoryChanges extends Changes {
    tags: FlattenTagCategoryOptions[],
    eventListeners: EventListeners,
    eventListenerSources: EventListenersSource,
    eventListenersCode: EventListenersCode
}

interface InspectorChanges extends Changes {

}

interface UpgradeChanges {
    factory: FactoryChanges,
    inspector: InspectorChanges,
}

/**
 * Manager to load/save/restore inspectors of projects
 * running on this engine instance
 *
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
     *
     * @param pInspectorFactory
     * @param pProject
     */
    async createInspector( pInspectorFactory:InspectorFactory, pProject:DexcaliburProject):Promise<boolean> {

        let ins:Inspector;

        pInspectorFactory.compileListeners();

        //test = pProject.engine.getEngineDB().getRawDB()._s.prepareForPersist(pInspectorFactory, InspectorFactory.TYPE);

        // save inspector data/version
        await pProject.getProjectDB().getCollectionOf(InspectorFactory.TYPE.getType()).asyncAddEntry(pInspectorFactory.getUID(), pInspectorFactory);


        try{
            ins = await pInspectorFactory.createInstance(pProject);
            this.projects[pProject.getUID()][pInspectorFactory.id] = ins;
            await pProject.attachInspector(ins);
            return  true;
        }catch (err){
            // if an error happens, remove InspectorFactory from DB and log it.
            this.engine.log("Inspector instance cannot be created : "+err.message, pProject, err.code);
            Logger.error(err.message);
            try{
                await pProject.getProjectDB().getCollectionOf(InspectorFactory.TYPE.getType()).asyncRemoveEntry(pInspectorFactory);
            }catch(err2){
                this.engine.log("InspectorFactory cannot be removed after instance creating failed : "+err2.message, pProject, err2.code);
                Logger.error(err2.message);
            }finally {
                return false;
            }
        }

    }

    /**
     * To create inspector instance for new projects
     *
     * @param {DexcaliburProject} pProject
     * @return {boolean}
     */
    async createInspectorsFor( pProject:DexcaliburProject):Promise<boolean>{
        const uid:string = pProject.getUID();
        let ins:Inspector;
        let factory:InspectorFactory;
        
        if(this.projects[uid] == null){
            this.projects[uid] = {};
        }

        let test:any;
        for(const i in this.locals){
            // local inspector
            factory = (this.locals[i] as any);

            await this.createInspector(this.locals[i], pProject);
            /*
            factory.compileListeners();

            test = pProject.engine.getEngineDB().getRawDB()._s.prepareForPersist(factory, InspectorFactory.TYPE);
            // save inspector data/version
            await pProject.getProjectDB().getCollectionOf(InspectorFactory.TYPE.getType()).asyncAddEntry(factory.getUID(), factory);


            try{
                ins = await factory.createInstance(pProject);
                this.projects[uid][i] = ins;
                await pProject.attachInspector(ins);
            }catch (err){
                // if an error happens, remove InspectorFactory from DB and log it.
                this.engine.log("Inspector instance cannot be created : "+err.message, pProject, err.code);
                Logger.error(err.message);
                try{
                    await pProject.getProjectDB().getCollectionOf(InspectorFactory.TYPE.getType()).asyncRemoveEntry(factory);
                }catch(err2){
                    this.engine.log("InspectorFactory cannot be removed after instance creating failed : "+err2.message, pProject, err2.code);
                    Logger.error(err2.message);
                }
            }*/
        }

        return true;
    }


    /**
     * To restore inspector instances from a dirty project
     *
     * @param {DexcaliburProject} pProject
     * @return {boolean}
     */
    async restoreInspectorsFor( pProject:DexcaliburProject):Promise<boolean>{
        const uid:string = pProject.getUID();
        let factory:InspectorFactory;
        let factories:InspectorFactory[];

        console.log("RESTORE INSPECTORS ?...");

        if(this.projects[uid] == null) this.projects[uid] = {};

        const inspNames = Object.keys(pProject.inspectors);
        let inspID:string;
        let needUpgrade = false;
        let changes:Nullable<UpgradeChanges> = null;
        let restored:string[] = [];

        // read InspectorPlugin of the project
        factories = await pProject.getProjectDB()
                                    .getCollectionOf(InspectorFactory.TYPE.getType()).getAsList();


        // foreach retrieve Inspector state and restore it.
        for(let i=0; i<factories.length; i++){

            try{
                if(factories[i] != null){
                    changes = null;

                    // retrieve Inspector state from DB for each, and restore Inspector instance
                    this.projects[uid][factories[i].id] = await factories[i].restore(pProject);

                    // upgrade inspector with new factory
                    if(InspectorFactory.needUpgrade(factories[i], this.locals[factories[i].id])){
                        switch (InspectorFactory.getUpgradeLevel(factories[i], this.locals[factories[i].id])){
                            case UpgradeLevel.MAJOR:
                                // warning :
                                throw InspectorManagerException.INSPECTOR_UPGRADE_TO_MAJOR_NOT_SUPPORTED(
                                    factories[i].id, factories[i].version, this.locals[factories[i].id].version);
                                break;
                            case UpgradeLevel.MINOR:
                                // recreate inspector
                                throw InspectorManagerException.INSPECTOR_UPGRADE_TO_MINOR_NOT_SUPPORTED(
                                    factories[i].id, factories[i].version, this.locals[factories[i].id].version);
                                break;
                            case UpgradeLevel.PATCH:
                                changes = this.upgradeFactory(factories[i], this.locals[factories[i].id]);
                                this.upgradeInspector(this.projects[uid][factories[i].id], this.locals[factories[i].id]);
                                break;
                        }

                        // restore listeners
                        factories[i]._restoreEventListenersFromCode(this.projects[uid][factories[i].id]);
                        factories[i]._restoreEventListenersFromFunc(this.projects[uid][factories[i].id]);
                        factories[i].version = this.locals[factories[i].id].version;

                        if(changes!=null){
                            if(changes.factory._changes.length>0){

                                // save InspectorFactory changes
                                await pProject.getProjectDB()
                                    .getCollectionOf(InspectorFactory.TYPE.getType()).asyncUpdateEntry(factories[i]);

                                // save change
                                await pProject.getProjectDB()
                                    .getCollectionOf(Inspector.TYPE.getType()).asyncUpdateEntry(this.projects[uid][factories[i].id]);
                            }
                        }
                    }else{
                        // restore listeners
                        factories[i]._restoreEventListenersFromCode(this.projects[uid][factories[i].id]);
                        factories[i]._restoreEventListenersFromFunc(this.projects[uid][factories[i].id]);
                    }

                    restored.push(factories[i].id);

                    // trigger event when Inspector is restored.
                    await pProject.attachInspector(this.projects[uid][factories[i].id]);
                }
            }catch(err){
                this.engine.log("State of inspector ["+factories[i].getUID()+"] cannot be restored. ", pProject, err.code);
                console.log(err.message,err.stack);
            }

        }

        // detect if there is missing inspector
        for(let k in this.locals){
            if(restored.indexOf(k)==-1){
                await this.createInspector(this.locals[k], pProject);
            }
        }

        pProject.restored();

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
    async deployInspectors( pProject:DexcaliburProject, pStep:INSPECTOR_TYPE):Promise<boolean>{
        const uid:string = pProject.getUID();
        let insp = "";

        if(this.projects[uid] == null) {
            // cannot deployed not initiliazed inspectors
            return false;
        }
        Logger.info("[INSPECTOR MANAGER] Project["+uid+"], Step["+pStep+"] Starting to deploy inspectors.");

        const projInsps = pProject.getInspectors();

        for(let i in projInsps){
            if(projInsps[i].isStartAt(pStep)){

                pProject.getInspectors()

                await projInsps[i].deploy();
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
    async deployAll():Promise<void>{
        for(const k in this.inspectors)
            await this.inspectors[k].deploy();
    }

    /**
     * 
     * @param {String} name Inspector name
     * @returns {Boolean} 
     * @method
     */
    async deploy(name:string):Promise<boolean>{
        const insp:Inspector = this.get(name);
        if(insp instanceof Inspector){
            await insp.deploy();
            return true;
        }
        return false;
    }

    /**
     * To upgrade a factory instance with date from newest version
     *
     * Only following data are upgraded :
     * - event listeners
     * -
     * To be complete
     *
     * @param pOutdatedFactory
     * @param pNewFactory
     */
    upgradeFactory(pOutdatedFactory: InspectorFactory, pNewFactory: InspectorFactory):UpgradeChanges {
        const changes:UpgradeChanges = {
            factory:{
                tags:[],
                eventListeners: {},
                eventListenerSources: {},
                eventListenersCode: {},
                _changes: []
            },
            inspector:{
                _changes: []
            }
        };

        // upgrade tags
        pNewFactory.itags.map((vCat:FlattenTagCategoryOptions)=> {
            const cat = pNewFactory.itags.find((vValue, vIndex, vAll) => {
                if (vValue.name == vCat.name) {
                    return vValue;
                }
            });

            if(cat==null){
                // add category to preregistered tags
                pOutdatedFactory.itags.push(vCat);
                // trace changes
                if(changes.factory.tags.length==0) changes.factory._changes.push("tags");
                changes.factory.tags.push(vCat);
            }
        });

        // upgrade listeners
        for(let evtName in pNewFactory.eventListenerSources){
            // check if the event is already caught
            if(pOutdatedFactory.eventListenersCode[evtName]!=null){
                // if listener didnt change, skip
                if(pOutdatedFactory.eventListenersCode[evtName].equalOptions(pNewFactory.eventListenerSources[evtName])){
                   continue;
                }
            }

            // add or update
            pOutdatedFactory.upgradeListener(evtName, pNewFactory.eventListenerSources[evtName]);

            if(Object.keys(changes.factory.eventListenerSources).length==0){
                changes.factory._changes.push("eventListenerSources");
                changes.factory._changes.push("eventListenersCode");
            }

            changes.factory.eventListenerSources[evtName] = pNewFactory.eventListenerSources[evtName];
            changes.factory.eventListenersCode[evtName] = pNewFactory.eventListenersCode[evtName];
        }

        // TODO : upgrade of eventListener is not supported

        return changes;
    }


    /**
     *
     * @param pOutdatedInspector
     * @param pNewFactory
     */
    upgradeInspector(pOutdatedInspector: Inspector, pNewFactory: InspectorFactory) {

        // first, check if new factory has new tag category
        pNewFactory.itags.map((vCat:FlattenTagCategoryOptions)=>{
            const cat = pOutdatedInspector.preRegisteredTags.find((vValue,vIndex,vAll)=>{
                if(vValue.name==vCat.name){
                    return vValue;
                }
            });

            // category not found
            if(cat==null){
                // add category to preregistered tags
                pOutdatedInspector.factory.itags.push(vCat);
                // update inspector preregistered tags
                pOutdatedInspector.registerTagCategory(InspectorFactory.createTagCategory(vCat));
            }else{
                // update tag category
                vCat._tagsOptions.map((vTag:TagOptions)=>{
                    let existing = cat.getTags().find((x)=>{ if(x.name==vTag.name){ return x; } });

                    if(existing!=null){
                        // update
                        existing.updateWithOptions(vTag)
                    }else{
                        // add
                        cat.addTag( new Tag(vTag));
                    }
                });

                // tag cannot be removed safely from existing inspector, so tag from older version of inspector
                // cannot be deleted

            }
        })
    }
}
