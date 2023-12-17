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
import {INode, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "../NodeInternalType.js";

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
/**
 * Represent the server DB where project data are stored or cloned
 *
 * @class
 */
export class EngineDatabase {

    static DEFAULT_CONN_STR = "master:master123:admin:DEFAULT:";
    static DEFAULT_HOST = "127.0.0.1";
    static DEFAULT_PORT = 27017;

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

    constructor(pContext:DexcaliburEngine, pOptions:DatabaseSettings) {
        this._ctx = pContext;
        this._opts = pOptions;

        if(pOptions!=null){
            this._init(pOptions);
        }
    }

    /**
     *
     * @param pOptions
     * @private
     */
    private _init(pOptions:DatabaseSettings):void {
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

        this._connector = new MongodbAdapter(this._ctx, {
            clusterUrl: this._opts.getHost() ,
            port:  this._opts.getPort(),
            credentials: creds
        });
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

        console.log(this._db);
        Logger.info("Connection successful");
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
        const coll = this._db.getCollection(PROJECT_COL);
        const projs:any[] = await coll.getAsList();
        const res:DexcaliburProject[] = [];

        projs.map( x => {
            res.push( DexcaliburProject.load( this._ctx, x.uid, pUserAccount, x));
        });

        return res;
    }

    async createProject(pProject:DexcaliburProject):Promise<any> {
        const coll = this._db.getCollection(PROJECT_COL);
        return coll.asyncAddEntry( pProject.getUID(), pProject.toJsonObject());
    }

    async saveProject(pProject:DexcaliburProject):Promise<boolean> {
        const coll = this._db.getCollection(PROJECT_COL);
        return coll.asyncUpdateEntry( pProject);
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
    async save(pObject:INode):Promise<boolean> {
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
                console.log((this._db as any)._colls);
            }
            const coll = this._db.getCollection(collName, collType);
            if(coll.asyncHasEntry(pObject)){
                return coll.asyncUpdateEntry( pObject);
            }else{
                coll.asyncAddEntry( pObject.getUID(), pObject);
                return true;
            }
        }else{
            return false;
        }

    }
}