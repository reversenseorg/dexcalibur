import * as  _path_ from "path";
import * as  _fs_ from 'fs';

import DexcaliburEngine from "./DexcaliburEngine.js";
import Inspector, {INSPECTOR_TYPE} from "./Inspector.js";
import DexcaliburProject from "./DexcaliburProject.js";
import InspectorFactory, {
    EventListeners,
    EventListenersCode,
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
import HookStrategy, {HookStrategyOptions} from "./hook/HookStrategy.js";
import HookSet from "./HookSet.js";
import {UPGRADE_MODE} from "./inspector/common.js";
import {HookRevision, HookRevisionSubject, RevisionOperation} from "./HookRevision.js";
import {CustomCode} from "./actionnable/CustomCode.js";
import {BusEventHandler} from "./Bus.js";
import {InspectorFactoryException} from "./errors/InspectorFactoryException.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


var gInstance:InspectorManager = null;

export interface InspectorUninstallOptions {
    keepTags:boolean;
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

interface HookStrategyChanges {
    added: HookStrategyOptions[],
    removed: HookStrategyOptions[],
    modified: HookStrategyOptions[]
}

interface FactoryChanges extends Changes {
    tags: FlattenTagCategoryOptions[],
    eventListeners: EventListeners,
    eventListenerSources: EventListenersSource,
    eventListenersCode: EventListenersCode
    hookSet: HookRevision,
    hookStrategies: HookStrategyChanges
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

    locals:Record<string, InspectorFactory> = {};
    remote:Record<string, InspectorFactory> = {};

    upgradeMode = UPGRADE_MODE.REPLACE;
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

    getLocal():Record<string, InspectorFactory>{
        return this.locals;
    }

    getRemote():Record<string, InspectorFactory>{
        return this.remote;
    }


    /**
     * To enumerate all inspectors factory available
     *  - locally : from DB or source code
     *  - remotely : from marketplace server
     *
     *  @method
     *  @async
     */
    async enumerate(){

        // refresh list of local inspectors
        this.locals = await this.enumerateLocal();

        // this.remote = await this.enumerateRemote();
    }

    /**
     * To enumerate local factory :
     * - Built-in InspectorFactory (from inspectors/ folder in source code)
     * - TODO : InspectorFactory from Engine DB (should replace inspectors form source later)
     *
     * TODO : add DB as backend
     *
     *
     */
    async enumerateLocal():Promise<Record<string, InspectorFactory>>{
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
    async enumerateRemote( pRegistry:DexcaliburRegistry):Promise<Record<string, InspectorFactory>>{

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


    /**
     *
     * @param pProject
     */
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
    async createInspector( pInspectorFactory:InspectorFactory, pProject:DexcaliburProject):Promise<Inspector> {

        let ins:Inspector;

        pInspectorFactory.compileListeners();

        //test = pProject.engine.getEngineDB().getRawDB()._s.prepareForPersist(pInspectorFactory, InspectorFactory.TYPE);

        // save inspector data/version
        await pProject.getProjectDB().getCollectionOf(InspectorFactory.TYPE.getType()).asyncAddEntry(pInspectorFactory.getUID(), pInspectorFactory);


        try{
            ins = await pInspectorFactory.createInstance(pProject);
            this.projects[pProject.getUID()][pInspectorFactory.id] = ins;
            await pProject.attachInspector(ins);
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
                ins = null;
            }
        }

        return ins;
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
     * 1/ Import InspectorFactory from Project DB
     * 2/ Detect for each if the factory need to be upgraded
     * 2bis/ If TRUE, upgrade the factory instance and save changes
     * 3/Restore Inspectors
     * 3bis/ If 2bis was TRUE, upgrade Inspectors (create new one, remove olds) and save changes
     *
     *
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
        let skipUpgrade = false;
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

                    // detect Inspector created from removed (old) InspectorFactory
                    // Case : the project has been created with an older version of DxEngine
                    // and the new version has removed the type of inspector.
                    if(factories[i] != null && this.locals[factories[i].id]==null){
                        Logger.info(`[INSPECTOR FACTORY][${factories[i].id}:${factories[i].version}] This factory is removed. `);


                        // 1) check if "old" inspector is already flagged as "deprecated" but not "removed"
                        if(!factories[i].removed && factories[i].deprecated){
                            factories[i].markAsRemoved();
                        }

                        if(factories[i].removed && !this.projects[uid][factories[i].id]){
                            this.projects[uid][factories[i].id].markAsRemoved();
                        }

                        // 2) don't upgrade InspectorFactory with "removed" or "deprecated" flag
                        skipUpgrade = true;
                        // throw InspectorFactoryException.INSPECTOR_NOT_FOUND_SERVER_SIDE(factories[i].id);

                    }

                    if(!skipUpgrade){
                        // upgrade inspector with new factory
                        if(InspectorFactory.needUpgrade(factories[i], this.locals[factories[i].id])){

                            // if the factory from server is newer, and deprecated
                            if(this.locals[factories[i].id].deprecated && !factories[i].deprecated){
                                factories[i].markAsDeprecated();
                            }


                            // check upgrade level
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
                                    // update factory and save changes
                                    changes = this.upgradeFactory(factories[i], this.locals[factories[i].id]);

                                    this.projects[uid][factories[i].id].context = pProject;

                                    // apply changes to inspectors
                                    await this.upgradeInspector(this.projects[uid][factories[i].id], this.locals[factories[i].id], changes);

                                    //console.log("Post upgradeInspector ",this.projects[uid][factories[i].id]);
                                    // upgrade hooks
                                    //this.upgradeInspectorHooks(pProject, this.projects[uid][factories[i].id], this.locals[factories[i].id])
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

                                    // save Inspector change
                                    await pProject.getProjectDB()
                                        .getCollectionOf(Inspector.TYPE.getType()).asyncUpdateEntry(this.projects[uid][factories[i].id]);
                                }
                            }
                        }else{
                            // restore listeners
                            factories[i]._restoreEventListenersFromCode(this.projects[uid][factories[i].id]);
                            // listeners passed as function instead of source code should be removed
                            // because they cannot be edited later
                            factories[i]._restoreEventListenersFromFunc(this.projects[uid][factories[i].id]);
                        }
                    }



                    restored.push(factories[i].id);

                    // trigger event when Inspector is restored.
                    await pProject.attachInspector(this.projects[uid][factories[i].id]);
                }
            }catch(err){
                this.engine.log("State of inspector ["+factories[i].getUID()+"] cannot be restored. ", pProject, err.code);
                console.log(err.message,err.stack);

                if(factories[i]!=null){
                    // if a factory cannot be restored, it must be removed
                    try {
                        this.uninstallInspector(pProject, factories[i]);
                    }catch(e){
                        console.log(e.message,e.stack);
                    }

                }
            }

        }

        // detect if there is missing inspector
        const newInspectors:Record<string, Inspector> = {};
        for(let k in this.locals){
            console.log(restored.join(":"),k);
            if( restored.indexOf(k)==-1){
                newInspectors[k] = await this.createInspector(this.locals[k], pProject);
                console.log("Create inspector : "+ newInspectors[k].getUID()+" "+ newInspectors[k].getID())
            }
        }

        // if new inspector have been created, start to deploy it
        if(Object.keys(newInspectors).length>0){
            await  this.deployInspectors(pProject, INSPECTOR_TYPE.BOOT, newInspectors);
        }

        pProject.restored();

        return true;
    }

    /**
     * To detect inspectors not installed for active project,
     * and to deploy it
     *
     * @param {DexcaliburProject} pProject
     */
    async upgradeInspectorsFor( pProject:DexcaliburProject):Promise<void>{
        const available = Object.keys(this.locals);
        const toInstall:string[] = [];

        let factories:InspectorFactory[];
        let existing:string[] = [];

        if(this.projects[pProject.getUID()] == null) this.projects[pProject.getUID()] = {};


        // read InspectorPlugin of the project
        factories = await pProject.getProjectDB()
            .getCollectionOf(InspectorFactory.TYPE.getType()).getAsList();

        // make a list of inspector UIDs
        factories.map(x => existing.push(x.getUID()));

        // search new factories
        for(let i=0; i<available.length; i++){
            if(existing.indexOf(available[i])==-1){
                toInstall.push(available[i]);
            }
        }

        const newInspectors:InspectorMap = {};
        let insp:Inspector;

        // create inspectors for new InspectorFactory to install
        for(let i=0; i<toInstall.length; i++){
            // create inspector
            insp = await this.createInspector(this.locals[toInstall[i]], pProject);
            newInspectors[toInstall[i]] = insp ;
        }

        if(Object.keys(newInspectors).length>0){
            await  this.deployInspectors(pProject, INSPECTOR_TYPE.BOOT, newInspectors);
        }

        return ;
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
    async deployInspectors( pProject:DexcaliburProject, pStep:INSPECTOR_TYPE, pInspectors:InspectorMap = {}):Promise<boolean>{
        const uid:string = pProject.getUID();
        let insp = "";

        if(this.projects[uid] == null) {
            // cannot deployed not initiliazed inspectors
            return false;
        }
        Logger.info("[INSPECTOR MANAGER] Project["+uid+"], Step["+pStep+"] Starting to deploy inspectors.");

        const projInsps = (Object.keys(pInspectors).length==0 ? pProject.getInspectors() : pInspectors);

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
     *
     * Only following data are upgraded :
     * - event listeners
     * -
     * To be complete
     *
     * @param pOutdatedFactory
     * @param pNewFactory
     * @return {UpgradeChanges} Changes to the outdated fatcory
     */
    upgradeFactory(pOutdatedFactory: InspectorFactory, pNewFactory: InspectorFactory):UpgradeChanges {
        const changes:UpgradeChanges = {
            factory:{
                tags:[],
                eventListeners: {},
                eventListenerSources: {},
                eventListenersCode: {},
                hookSet: null,
                hookStrategies: {
                    added:[],
                    modified:[],
                    removed:[],
                },
                _changes: []
            },
            inspector:{
                _changes: []
            }
        };


        // top level properties
        if(pNewFactory.startStep!=pOutdatedFactory.startStep){
            pOutdatedFactory.startStep = pNewFactory.startStep;
            changes.factory._changes.push("startStep");
        }

        if(pNewFactory.name!=pOutdatedFactory.name){
            pOutdatedFactory.name = pNewFactory.name;
            changes.factory._changes.push("name");
        }

        if(pNewFactory.color!=pOutdatedFactory.color){
            pOutdatedFactory.color = pNewFactory.color;
            changes.factory._changes.push("color");
        }

        if(pNewFactory.db!=pOutdatedFactory.db){
            pOutdatedFactory.db = pNewFactory.db;
            changes.factory._changes.push("db");
        }

        // if the factory from server is newer, and deprecated
        if(pNewFactory.deprecated && !pOutdatedFactory.deprecated){
            pOutdatedFactory.markAsDeprecated();
            changes.factory._changes.push("deprecated");
        }

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
            pOutdatedFactory.updateListener(evtName, pNewFactory.eventListenerSources[evtName]);

            if(Object.keys(changes.factory.eventListenerSources).length==0){
                changes.factory._changes.push("eventListenerSources");
                changes.factory._changes.push("eventListenersCode");
            }

            changes.factory.eventListenerSources[evtName] = pNewFactory.eventListenerSources[evtName];
            changes.factory.eventListenersCode[evtName] = pNewFactory.eventListenersCode[evtName];
        }


        // detect changes in hook sets and update existing factory
        if(pNewFactory.hookSet!=null){
            if(pOutdatedFactory.hookSet==null){
                changes.factory.hookSet = {
                    time:Util.time(),
                    operation: RevisionOperation.ADDED,
                    subject: HookRevisionSubject.HOOKSET,
                    data: pNewFactory.hookSet
                };
                pOutdatedFactory.hookSet = pNewFactory.hookSet;
                changes.factory.hookStrategies.added = pNewFactory.hookSet.strategies;
                changes.factory._changes.push("hookSet");
            }else{
                // update hookset properties
                changes.factory.hookSet = HookSet.upgradeOptions(pOutdatedFactory.hookSet, pNewFactory.hookSet, this.upgradeMode);

                if(Object.keys(changes.factory.hookSet.data).length>0){
                    changes.factory._changes.push("hookSet");
                }
                // update strategies
            }

        }


        //
        // TODO : upgrade of eventListener is not supported

        return changes;
    }


    /**
     *
     * @param pOutdatedInspector
     * @param pNewFactory
     */
    async upgradeInspector(pOutdatedInspector: Inspector, pNewFactory: InspectorFactory, pChanges:UpgradeChanges):Promise<void> {



        // first, check if new factory has new tag category
        if(pNewFactory.itags!=null && Array.isArray(pNewFactory.itags)){
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
            });

        }

        // upgrade inspector
        let vType:string;
        for(let i in pChanges.factory._changes){
            vType = pChanges.factory._changes[i];
            switch (vType){
                case "name":
                case "description":
                case "color":
                    pOutdatedInspector[vType] = pNewFactory[vType];
                    break;
                case "db":
                    if(pNewFactory.db.dbms==='inmemory'){

                        pOutdatedInspector.useMemoryDB(pOutdatedInspector.context);

                        switch(pNewFactory.db.type){
                            case 'index':
                                pOutdatedInspector.getDB().newIndex(pNewFactory.db.name, null);
                                break;
                            case 'collection':
                                pOutdatedInspector.getDB().newCollection(pNewFactory.db.name,null);
                                break;
                        }
                    }
                    break;
                case "eventListenerSources":
                    let elSrc:CustomCode;
                    for(const i in pNewFactory.eventListenerSources) {
                        // update all
                        elSrc = new CustomCode(pNewFactory.eventListenerSources[i]);
                        pNewFactory.eventListenersCode[i] = new CustomCode(elSrc);
                        pNewFactory.eventListenerSources[i] = new CustomCode(elSrc);

                        try {
                            pOutdatedInspector.on(i, elSrc.createFunction(['pEvent', 'pLogger']) as BusEventHandler);
                        } catch (err) {
                            Logger.error(`[INSPECTOR FACTORY][uid=${pNewFactory.id}][ERR:${err.code}] createInstance : event listener cannot create from source code. 
                ${err.msg}
                ${err.message}`);
                        }
                    }
                    break;
                case "eventListeners":
                    for(const i in pNewFactory.eventListeners){
                        // Warning : always upgraded
                        pOutdatedInspector.on(i,  pNewFactory.eventListeners[i]);
                    }
                    break;
                case "hookSet":
                    if(pChanges.factory.hookSet.operation==RevisionOperation.EDIT){

                        // TODO : create a copy of Inspector and InspectorFactory in DB before to apply changes
                        await pOutdatedInspector.updateHookSet(pOutdatedInspector.context, pNewFactory.hookSet);
                    }else{
                        await pNewFactory.createHookSetTo(pOutdatedInspector.context, pOutdatedInspector, false);
                    }
                    break;
                case "tags":
                    // already performed
                    break;
            }
        }

        // if Factory is now "deprecated", then mark entire Inspector and related object as "deprecated"
        if(!pOutdatedInspector.deprecated && pChanges.factory._changes.indexOf("deprecated")>-1){
            pOutdatedInspector.markAsDeprecated();
        }

    }

    /**
     *
     * @param pOutdatedInspector
     * @param pNewFactory
     */
    async upgradeInspectorHooks(pProject:DexcaliburProject, pOutdatedInspector: Inspector, pNewFactory: InspectorFactory, pRemove = false):Promise<void> {

        // update hook set data
        const hs:HookSet = pOutdatedInspector.getHookSet();
        // to create a standalone inspector from the new factory
        const newInspector = await pNewFactory.createInstance(pProject, true);

        let existingStrats:string[] = [];
        let conflictingStrats:HookStrategy[] = [];
        let newStrats:HookStrategy[] = [];

        if(hs!=null){
            // update data
            hs.upgradeInfo(newInspector.getHookSet());
            await pOutdatedInspector.save();

            // inject new hook strategy
            existingStrats = hs.strats.map(x => x.getUID() );
            newStrats = newInspector.getHookSet().strats.filter(x => {
                if(existingStrats.indexOf(x.getUID())==-1){
                    return true;
                }else{
                    conflictingStrats.push(x);
                    return false;
                }
            });

            newStrats.map( s => hs.addStrategy(s) );

            await pOutdatedInspector.save();

            // update strategy
            // conflictingStrats.map(x => { });

            // disable hook strategy
            if(pRemove){

            }

            // remove


        }else{
            pOutdatedInspector.setHookSet(newInspector.getHookSet());
        }

        // update hook strategy

        // mark existing hook strategy and related hooks as "deprecated" or "modified"
    }

    /**
     *
     * @param pProject
     * @param inspectorFactory
     */
    async uninstallInspector(pProject: DexcaliburProject, inspectorFactory: InspectorFactory):Promise<void> {
        if(this.projects[pProject.getUID()]==null || this.projects[pProject.getUID()][inspectorFactory.id]==null){

            return ;
        }

        // remove inspector from project
        await pProject.uninstallInspector(inspectorFactory, {keepTags:true});

    }
}
