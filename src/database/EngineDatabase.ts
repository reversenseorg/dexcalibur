import DexcaliburEngine from "../DexcaliburEngine.js";
import {Settings} from "../Settings.js";
import DatabaseSettings = Settings.DatabaseSettings;
import {MongodbAdapter, MongodbDb, MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {Nullable} from "../core/IStringIndex.js";
import {MongoCredentialsOptions, AuthMechanism} from "mongodb";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {UserAccount} from "../user/UserAccount.js";
import {Device} from "../Device.js";
import InspectorFactory from "../InspectorFactory.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import {
    IDatabase,
    IDatabaseAdapter,
    IDbCollection,
    INode,
    NodeType,
    Tag,
    TagCategory
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, NodeInternalTypeName} from "../NodeInternalType.js";
import {EngineDatabaseException} from "../errors/EngineDatabaseException.js";
import {parentPort} from "worker_threads";
import {BusSubscriber} from "../Bus.js";
import BusEvent from "../BusEvent.js";
import {ProjectDatabase} from "./ProjectDatabase.js";
import {AnalyzerState} from "../AnalyzerState.js";
import HookSession from "../HookSession.js";
import ModelFile from "../ModelFile.js";
import DataScope from "../DataScope.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface EngineDatabaseOptions {
    conn?:string;
    host:string;
    port:string;
}

export interface EngineDatabaseCredential {
    username: string;
    password: string;
    source: string;
    mechanism: string;
    mechanismProperties: any;
}

const PROJECT_COL = "projects";
const DEVICES_COL = "devices";
const TOOLS_COL = "tools";
const INSP_COL = "inspectors";
const SCAN_COL = "scans";

const INTERNAL_DB = "dxcserver";
const PROJECT_DB_PREFIX = "dxc_";


interface CollectionInfo {
    name:string;
    type:number;
}

interface AttachedProject {
    project: DexcaliburProject;
    subscriber: Nullable<BusSubscriber>;
}

/**
 * Represent the server DB where project data are stored or cloned
 *
 * @class
 */
export class EngineDatabase {

    static DEFAULT_CONN_STR = "master:master123:admin:DEFAULT:";
    static DEFAULT_HOST = "127.0.0.1";
    static DEFAULT_PORT = 27017;

    /**
     * An hashmap of  attached project instances
     *
     * @private
     */
    private _attached: {[projectUID:string] :AttachedProject} = {};

    private _ctx:DexcaliburEngine;
    private _opts:DatabaseSettings;
    private _connector: MongodbAdapter;
    private _ready = false;

    private _db:Nullable<MongodbDb> = null;

    // engine scope
    private projects:Nullable<MongodbDbCollection>;
    private inspectors:Nullable<MongodbDbCollection>;
    private devices:Nullable<MongodbDbCollection>;
    private tools:Nullable<MongodbDbCollection>;
    private scans:Nullable<MongodbDbCollection>;

    // project scope
    private runtime_events:Nullable<MongodbDbCollection>; // with session
    private hooks:Nullable<MongodbDbCollection>;
    private app_files:Nullable<MongodbDbCollection>;

    private _projectsDB:{ [projectUID:string] :ProjectDatabase } = {};



    private _supportedType:NodeType[] = [
        Tag.TYPE,
        TagCategory.TYPE,
        AnalyzerState.TYPE,
        HookSession.TYPE,
        ModelFile.TYPE,
        DataScope.TYPE
    ];
    private _supportedTypeInfos:{ [type:number] :CollectionInfo } = {};


    constructor(pContext:DexcaliburEngine, pOptions:DatabaseSettings) {
        this._ctx = pContext;
        this._opts = pOptions;

        if(pOptions!=null){
            this._connector = this._init(pOptions);
        }
    }


    /**
     *
     * @param pOptions
     * @private
     */
    private _init(pOptions:DatabaseSettings):MongodbAdapter {
        let creds:Nullable<MongoCredentialsOptions> = null;
        let host:Nullable<string>;
        let port = -1;
        let update = false;

        if(pOptions.getConnectionString()!=null){
            creds = this.parseCredentialString(pOptions.getConnectionString());
        }else{
            creds = this.parseCredentialString(EngineDatabase.DEFAULT_CONN_STR);
            update = true;
        }

        if(this._opts.getHost()){
            host = this._opts.getHost();
        }else{
            host = EngineDatabase.DEFAULT_HOST;
            update = true;
        }

        if(this._opts.getPort()){
            port = this._opts.getPort();
            if(port == -1){
                port = EngineDatabase.DEFAULT_PORT;
                update = true;
            }
        }else{
            port = EngineDatabase.DEFAULT_PORT;
            update = true;
        }

        if(update){

            pOptions.update(pOptions.sanitize("conn", EngineDatabase.DEFAULT_CONN_STR));
            pOptions.update(pOptions.sanitize("host", host));
            pOptions.update(pOptions.sanitize("port", port));
            pOptions.save()
        }

        return new MongodbAdapter(this._ctx, {
            clusterUrl: this._opts.getHost() ,
            port:  this._opts.getPort(),
            credentials: creds
        });

        // enumerate others DB
    }

    private async _enumerateDBs(){
        await this._connector.asyncConnect(null);
    }


    /**
     * Format
     *
     * URI(user):URI(pwd):URI(source):mechanism
     *
     * @param pStr
     */
    parseCredentialString(pStr:string): MongoCredentialsOptions {
        const parts = pStr.split(':');

        return {
            username: decodeURIComponent(parts[0]),
            password: decodeURIComponent(parts[1]),
            source: decodeURIComponent(parts[2]),
            mechanism: parts[3] as AuthMechanism,
            mechanismProperties: {}
        };
    }


    async connect():Promise<void> {
        this._db = await this._connector.asyncConnect(null,INTERNAL_DB);
        this._db.open(INTERNAL_DB);

        const existings:string[] = [];
        const colls = await this._db.getDbCollections();
        colls.map(x => {
            existings.push(x.collectionName)
        });

        if(existings.indexOf(PROJECT_COL)==-1){ this._db.createCollectionOf(DexcaliburProject.TYPE, PROJECT_COL); }
        if(existings.indexOf(DEVICES_COL)==-1){ this._db.createCollectionOf(Device.TYPE, DEVICES_COL); }
        if(existings.indexOf(INSP_COL)==-1){ this._db.createCollectionOf(InspectorFactory.TYPE, INSP_COL); }
        if(existings.indexOf(SCAN_COL)==-1){ this._db.createCollectionOf(ScanOrder.TYPE, SCAN_COL); }

        Logger.info("[INFO] [ENGINE] [DB] Connection successful");
    }

    /**
     * To get instance of a project DB
     *
     * @param pProject
     */
    getProjectDb(pProject:string):any {

    }

    /**
     * To get instance of a internal db.
     *
     * The purpose of internal DB is to
     *
     * @param pProject
     */
    getInternalDb():any {

    }

    /**
     * To list project from db
     */
    async listProjects(pUserAccount:UserAccount):Promise<DexcaliburProject[]> {
        const coll = this.getCollectionOf(DexcaliburProject.TYPE.getType());
        const projs:any[] = await coll.getAsList();
        const res:DexcaliburProject[] = [];

        for(let i=0; i<projs.length; i++){
            res.push( await DexcaliburProject.load( this._ctx, projs[i].uid, pUserAccount, projs[i]));
        }

        return res;
    }



    /**
     * To read a project from engine DB usign username
     *
     * @param {string} pUID Project UID
     * @param {Nullable<UserAccount>} pUserAccount User account
     * @return {Promise<DexcaliburProject[]>}
     * @method
     * @async
     */
    async getProject(pUID:string, pUserAccount?:Nullable<UserAccount>):Promise<DexcaliburProject> {
        const coll:MongodbDbCollection = this.getCollectionOf(DexcaliburProject.TYPE.getType()) as MongodbDbCollection;
        const project:Nullable<DexcaliburProject[]> = await coll.search({ uid: pUID});

        if(project==null || project.length==0){
            console.log(await coll.getAsList());
            throw EngineDatabaseException.UNKNOWN_PROJECT(pUID);
        }

        // inject context
        project[0].setEngine(this._ctx);

        if(pUserAccount!=null){
            project[0].isOwnedBy(pUserAccount);
        }


        return project[0];
    }

    async createProject(pProject:DexcaliburProject):Promise<any> {
        const coll = this.getCollectionOf(pProject);
        return coll.asyncAddEntry( pProject.getUID(), pProject );
    }


    /**
     * To attach the Event Bus of the specified project to Engine DB
     * in order to trigger a DB update when a some properties of the project
     * change
     *
     * When following events are emitted, an update operation is trigged :
     * - project:owner:change
     * - project:state:change
     *
     *
     * @param pProject
     */
    async attachProject(pProject:DexcaliburProject):Promise<void> {

        // ignore is already attached
        if(this._attached[pProject.getUID()]!=null){
            if(this._attached[pProject.getUID()].subscriber.isPrevented()){
                this._attached[pProject.getUID()].subscriber.unprevent()
            }
        }

        await this.saveProject(pProject);

        const subcriber = BusSubscriber.from((vEvent:BusEvent<any>)=>{
            Logger.info("[DB] Project update caught : update ");
            if(vEvent.getData().project != null){
                (async ()=>{
                    console.log(vEvent.getData().project);
                    await this.saveProject(vEvent.getData().project);
                })();
            }else{
                console.error("Invalid events : ");
                console.log(vEvent);
            }

        });

        this._attached[pProject.getUID()] = {
            project: pProject,
            subscriber: subcriber
        };

        pProject.getBus().subscribe(
            [
                DexcaliburProject.EV_TYPE.STATE_CHANGE,
                DexcaliburProject.EV_TYPE.PKGNAME_CHANGE,
                DexcaliburProject.EV_TYPE.OWNER_CHANGE
            ],
            subcriber
        );
    }

    /**
     * To attach the Event Bus of the specified project to Engine DB
     * in order to trigger a DB update when a some properties of the project
     * change
     *
     * When following events are emitted, an update operation is trigged :
     * - project:owner:change
     * - project:state:change
     *
     *
     * @param pProject
     */
    detachProject(pProject:DexcaliburProject):void {
        // ignore is already attached
        if(this._attached[pProject.getUID()]==null) return;

        const subs = this._attached[pProject.getUID()].subscriber;

        if(subs!=null){
            subs.prevent();
        }
    }


    /**
     * To get an instance of the collection specified node are stored in
     * engine db
     *
     * @param {INode|NodeInternalType} pNode An instance of a node, or a node type (a number)
     * @return {IDbCollection} Matching collection
     * @method
     */
    getCollectionOf(pNode:INode|NodeInternalType):IDbCollection {
        let collName:Nullable<string> = null;
        let collType:Nullable<NodeType> = null;
        const nodeType = (typeof pNode==='number')?pNode:pNode.__;
        switch ( nodeType){
            case NodeInternalType.SCAN_ORDER:
                collName = SCAN_COL;
                collType = ScanOrder.TYPE;
                break;
            case NodeInternalType.PROJECT:
                collName = PROJECT_COL;
                collType = DexcaliburProject.TYPE;
                break;
            case NodeInternalType.DEVICE:
                collName = DEVICES_COL;
                collType = Device.TYPE;
                break;
            case NodeInternalType.INSPECTOR:
                collName = INSP_COL;
                collType = InspectorFactory.TYPE;
                break;
        }

        if(collName!==null && collType!==null){
            if(Object.keys((this._db as any)._colls).length==0){
                this._db.open(INTERNAL_DB);
            }
            return this._db.getCollection(collName, collType);
        }else{
            throw EngineDatabaseException.UNKNOWN_COLLECTION(NodeInternalTypeName[nodeType]);
        }
    }

    /**
     *
     * @param pObject
     */
    async search(pFilter:any, pObject:INode, pOptions?:any):Promise<any[]> {

        let res:INode[] = [];
        let coll:IDbCollection;

        try{
            coll = this.getCollectionOf(pObject);
            res = await coll.search( pFilter, pOptions);
        }catch(err){
            Logger.error(err);
            res = [];
        }

        return res;
    }


    async saveProject(pProject:DexcaliburProject):Promise<DexcaliburProject> {
        const db = this.getCollectionOf(DexcaliburProject.TYPE.getType());
        return await db.asyncUpdateEntry(pProject, {upsert:true});
    }

    /**
     * To save an object to corresponding collection
     *
     * Only some object type can be stored into shared DB :
     * scan order, projects metadata, devices, inspectors info
     *
     * @param {INode} pObject
     * @async
     * @method
     */
    async save(pObject:INode):Promise<INode> {
        let obj:INode;
        let collName:Nullable<string> = null;
        let collType:Nullable<NodeType> = null;
        switch (pObject.__){
            case NodeInternalType.SCAN_ORDER:
                collName = SCAN_COL;
                collType = ScanOrder.TYPE;
                break;
            case NodeInternalType.PROJECT:
                collName = PROJECT_COL;
                collType = DexcaliburProject.TYPE;
                break;
            case NodeInternalType.DEVICE:
                collName = DEVICES_COL;
                collType = Device.TYPE;
                break;
            case NodeInternalType.INSPECTOR:
                collName = INSP_COL;
                collType = InspectorFactory.TYPE;
                break;
        }

        if(collName!==null && collType!==null){
            if(Object.keys((this._db as any)._colls).length==0){
                this._db.open(INTERNAL_DB);
            }

            const coll = this._db.getCollection(collName, collType);
            if(pObject._id!=null){
                //console.log("MONGO > asyncUpdateEntry > ",pObject);

                if((await coll.asyncUpdateEntry( pObject, {upsert:true, filter: {_id:pObject._id} }))===false){
                    throw EngineDatabaseException.UPDATE_FAILED_FOR(NodeInternalTypeName[pObject.__], pObject._id );
                }else{
                    obj = pObject;
                }
            }else{
                //console.log("MONGO > asyncAddEntry > ",pObject);
                obj = await coll.asyncAddEntry( pObject.getUID(), pObject);
            }
        }else{
            //throw EngineDatabaseException.SAVE_OPE_NOT_SUPPORTED(NodeInternalTypeName[pObject.__]);
            throw EngineDatabaseException.UNKNOWN_COLLECTION(NodeInternalTypeName[pObject.__]);
        }

        return obj;
    }
    /**
     * To remove a project from DB by its UID
     *
     * @param {string} pUID Project UID
     * @return {boolean} TRUE if deleting successful else FALSE
     * @method
     */
    async deleteProjectByUID(pUID: string):Promise<boolean> {
        let res = true;
        let coll:IDbCollection;

        try{
            // delete project metadata
            coll = this._db.getCollection(PROJECT_COL, DexcaliburProject.TYPE);
            res = await coll.asyncRemoveEntry( new DexcaliburProject({ uid:pUID }));

            // delete project DB

        }catch(err){
            Logger.error(err);
            res = false;
        }

        return res;
    }

    async getProjectDB(pProjectUID:string):Promise<ProjectDatabase> {

        Logger.info("[INFO] [ENGINE DB] getProjectDB = "+pProjectUID)
        const dbName = PROJECT_DB_PREFIX+pProjectUID;
        let projectAdapter:MongodbAdapter;
        let db:MongodbDb;
        let projDB:ProjectDatabase;

        Logger.debugRAW(this._projectsDB[pProjectUID])

        if(this._projectsDB[pProjectUID]!=null){
            return this._projectsDB[pProjectUID];
        }

        // create ProjectDatabase
        projectAdapter = this._init(this._opts);
        db = await projectAdapter.asyncConnect(null, dbName);
        db.open(dbName);
        Logger.info("[INFO] [PROJECT DB] Fresh ");

        projDB = new ProjectDatabase(this._ctx,  db);
        projDB.name = dbName;
        await projDB.init();

        this._projectsDB[pProjectUID] = projDB;
        Logger.info("[INFO] [PROJECT DB] Connection successful fro "+pProjectUID);

        return this._projectsDB[pProjectUID];
    }

    /**
     *
     * @param pProjectUID
     */
    hasProjectDB(pProjectUID:string):boolean{

        return (this._projectsDB[pProjectUID]!=null);
    }
}