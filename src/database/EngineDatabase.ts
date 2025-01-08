import DexcaliburEngine from "../DexcaliburEngine.js";
import {DatabaseSettingType, Settings} from "../Settings.js";
import {MongodbAdapter, MongodbDb, MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {Nullable} from "../core/IStringIndex.js";
import {AuthMechanism, MongoCredentialsOptions} from "mongodb";
import * as Log from "../Logger.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {Device} from "../Device.js";
import InspectorFactory from "../InspectorFactory.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import {IDbCollection, INode, NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, NodeInternalTypeName} from "@dexcalibur/dxc-core-api";
import {EngineDatabaseException} from "../errors/EngineDatabaseException.js";
import {BusSubscriber} from "../Bus.js";
import BusEvent from "../BusEvent.js";
import {ProjectDatabase} from "./ProjectDatabase.js";
import {LogMessage} from "../log/Log.js";
import {UserSession} from "../user/session/UserSession.js";
import DatabaseSettings = Settings.DatabaseSettings;
import AssuranceReport from "../audit/common/AssuranceReport.js";
import { Connection, Credential } from "@dexcalibur/dxc-orgs";
import Inspector from "../Inspector.js";
import Role from "../user/acl/common/Role.js";
import AccessControl from "../user/acl/AccessControl.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {DeviceTemplate} from "../device/template/DeviceTemplate.js";
import {DeviceInstance} from "../device/maker/DeviceInstance.js";




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

const PROJECT_COL = DexcaliburProject.TYPE.getName(); //"projects";
const DEVICES_COL = Device.TYPE.getName(); //"devices";

/**
 * @deprecated
 */
const INSP_COL = Inspector.TYPE.getName(); //"inspectors";

const SCAN_COL = ScanOrder.TYPE.getName(); //"scans";
const SESSIONS_COL = UserSession.TYPE.getName(); //"sessions";
const UA_COL = UserAccount.TYPE.getName(); //"accounts";


const REPORT_COL = AssuranceReport.TYPE.getName();
const ORGU_COL = OrganizationUnit.TYPE.getName();
const APPU_COL = ApplicationUnit.TYPE.getName();
const DEVTPL_COL = DeviceTemplate.TYPE.getName();
const CRED_COL = Credential.TYPE.getName();
const CONN_COL = Connection.TYPE.getName();

export const INTERNAL_DB = "dxcserver";
export const PROJECT_DB_PREFIX = "dxc_";



interface CollectionInfo {
    nodeType?:NodeInternalType;
    collType:Nullable<NodeType>;
    collName:Nullable<string>;
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
    // static DEFAULT_HOST = "127.0.0.1";
    // static DEFAULT_PORT = 27017;

    /**
     * An hashmap of  attached project instances
     *
     * @private
     */
    private _attached: Record<DexcaliburProjectUUID, AttachedProject> = {};

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
    private sessions:Nullable<MongodbDbCollection>;

    // project scope
    private runtime_events:Nullable<MongodbDbCollection>; // with session
    private hooks:Nullable<MongodbDbCollection>;
    private app_files:Nullable<MongodbDbCollection>;

    private _projectsDB:{ [projectUID:string] :ProjectDatabase } = {};



    private _supportedType:NodeType[] = [
        LogMessage.TYPE,
        OrganizationUnit.TYPE,
        ApplicationUnit.TYPE,
        Credential.TYPE,
        Connection.TYPE,
        Role.TYPE,
        UserAccount.TYPE,
        DeviceTemplate.TYPE,
        DeviceInstance.TYPE
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
     * @param {DatabaseSettings} pOptions
     * @param {any} pMongoOpts Additional custom MongoDB options
     * @private
     */
    private _init(pOptions:DatabaseSettings, pMongoOpts:any = {}):MongodbAdapter {
        let creds:Nullable<MongoCredentialsOptions> = null;
        let host:Nullable<string>;
        let port = -1;
        let update = false;


        if(pOptions.getConnectionString()!=null){
            creds = this.parseCredentialString(pOptions.getConnectionString());
        }else{
            throw EngineDatabaseException.CANNOT_CONNECT_TO_DB("empty connection string");
            // creds = this.parseCredentialString(EngineDatabase.DEFAULT_CONN_STR);
            // update = true;
        }

        if(pOptions.getHost()){
            host = pOptions.getHost();
        }
        else if(this._opts.getHost()){
            host = this._opts.getHost();
        }
        else{
            //host = EngineDatabase.DEFAULT_HOST;
            //update = true;
            throw EngineDatabaseException.CANNOT_CONNECT_TO_DB("db hostname is undefined");
        }

        if(pOptions.getPort()){
            port = pOptions.getPort();
        }
        else if(this._opts.getPort()){
            port = this._opts.getPort();
            if(port == -1){
                // port = EngineDatabase.DEFAULT_PORT;
                // update = true;
                throw EngineDatabaseException.CANNOT_CONNECT_TO_DB("db port is undefined (2)");
            }
        }else{
            //port = EngineDatabase.DEFAULT_PORT;
            //update = true;
            throw EngineDatabaseException.CANNOT_CONNECT_TO_DB("db port is undefined");
        }

        if(update){
            //pOptions.update(pOptions.sanitize(DatabaseSettingType.DB_AUTH_STRING, EngineDatabase.DEFAULT_CONN_STR));
            pOptions.update(pOptions.sanitize(DatabaseSettingType.DB_HOST,  host));
            pOptions.update(pOptions.sanitize(DatabaseSettingType.DB_PORT, port));
            pOptions.save()
        }




        return new MongodbAdapter(this._ctx, {
            clusterUrl: host ,
            port:  port,
            credentials: creds,
            clientOpts: pMongoOpts
        });



        // enumerate others DB
    }

    /**
     * To create a collection into DB
     *
     * @param pNode
     * @param pExitingCols
     * @private
     */
    private async _createCollectionOf(pNode:NodeType, pExitingCols:string[]):Promise<any> {
        if(pExitingCols.indexOf(pNode.getName())==-1){
            await this._db.createCollectionOf(pNode, pNode.getName());
            Logger.info("ENGINE DB > createCollectionOf > ",pNode.getName());
        }

    }

    getRawDB():MongodbDb {
        return this._db;
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
        if(existings.indexOf(SESSIONS_COL)==-1){ this._db.createCollectionOf(UserSession.TYPE, SESSIONS_COL); }
        if(existings.indexOf(REPORT_COL)==-1){ this._db.createCollectionOf(AssuranceReport.TYPE, REPORT_COL); }


        // to ease db dev, collection are created accordingly to supported node types
        let nodeType:NodeType;
        const skip = [
            DexcaliburProject.TYPE.getType(),
            Device.TYPE.getType(),
            InspectorFactory.TYPE.getType(),
            ScanOrder.TYPE.getType(),
            UserSession.TYPE.getType(),
            AssuranceReport.TYPE.getType(),
        ];

        for(let i=0; i<this._supportedType.length; i++){
            nodeType = this._supportedType[i];

            // TODO : Remove "static" creating. skip already created colls
            if(skip.indexOf(nodeType.getType())>-1) continue;

            await this._createCollectionOf(nodeType, existings);
            this._supportedTypeInfos[nodeType.getType()] = {
                collName: nodeType.getName(),
                collType: nodeType
            };
        }


        Logger.info("[ENGINE] [DB] Connection successful");
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
     * To retrieve global logs
     * @param pSize
     * @param pStartDate
     */
    async getGlobalLogs(pSize:number, pStartDate:number = -1):Promise<LogMessage[]> {
        return await (this.getCollectionOf(LogMessage.TYPE.getType())).getAsList(pSize);
    }



    /**
     * To retrieve all (or a subset)  of device template
     *
     * @param pSize
     * @param pStartDate
     */
    async getDeviceTemplates(pSize:number, pStartDate:number = -1):Promise<DeviceTemplate[]> {
        return await (this.getCollectionOf(DeviceTemplate.TYPE.getType())).getAsList(pSize);
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
            throw EngineDatabaseException.UNKNOWN_PROJECT(pUID,"EngineDB.getProject");
        }

        // inject context
        project[0].setEngine(this._ctx);

        if(pUserAccount!=null){
            AccessControl.isAuthorized(
                AccessControl.access.PROJ_OPEN_OWN,
                pUserAccount,
                project[0],
                [
                    ProjectAccessControl.attr.OWNER,
                    ProjectAccessControl.attr.TESTER,
                ]
            )
            //project[0].isOwnedBy(pUserAccount);
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
                    await this.saveProject(vEvent.getData().project);
                })();
            }else{
                console.error("Invalid events : "+vEvent.getType());
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
            case NodeInternalType.USER_SESSION:
                collName = SESSIONS_COL;
                collType = UserSession.TYPE;
                break;
            case NodeInternalType.USER_ACCOUNT:
                collName = UA_COL;
                collType = UserAccount.TYPE;
                break;
            case NodeInternalType.ASSURANCE_REPORT:
                collName = REPORT_COL;
                collType = AssuranceReport.TYPE;
                break;
            case NodeInternalType.ORG_UNIT:
                collName = ORGU_COL;
                collType = OrganizationUnit.TYPE;
                break;
            case NodeInternalType.APP_UNIT:
                collName = APPU_COL;
                collType = ApplicationUnit.TYPE;
                break;
            case NodeInternalType.DEVICE_TPL:
                collName = DEVTPL_COL;
                collType = DeviceTemplate.TYPE;
                break;
            case NodeInternalType.CREDENTIAL:
                collName = CRED_COL;
                collType = Credential.TYPE;
                break;
            case NodeInternalType.CONNECTION:
                collName = CONN_COL;
                collType = Connection.TYPE;
                break;
            default:
                if(this._isSupported(nodeType)){
                    collName = this._supportedTypeInfos[nodeType].collName;
                    collType = this._supportedTypeInfos[nodeType].collType;
                }
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



    /**
     * To list project from db
     */
    async listDevices():Promise<Device[]> {
        const coll = this.getCollectionOf(Device.TYPE.getType());
        return await coll.getAsList();
    }

    async listScanReports():Promise<AssuranceReport[]> {
        const coll = this.getCollectionOf(AssuranceReport.TYPE.getType());
        return await coll.getAsList();
    }

    /*async saveScanReport(pReport:AssuranceReport):Promise<AssuranceReport> {
        const db = this.getCollectionOf(AssuranceReport.TYPE.getType());
        return await db.asyncUpdateEntry(pReport, {upsert:true});
    }*/

    async saveProject(pProject:DexcaliburProject):Promise<DexcaliburProject> {
        const db = this.getCollectionOf(DexcaliburProject.TYPE.getType());
        return await db.asyncUpdateEntry(pProject, {upsert:true});
    }

    private _isSupported(pType:NodeInternalType):boolean {
        for(let i=0; i<this._supportedType.length; i++){
            if(this._supportedType[i].getType()===pType){
                return true;
            }
        }
        return false;
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
            case NodeInternalType.ASSURANCE_REPORT:
                collName = REPORT_COL;
                collType = AssuranceReport.TYPE;
                break;
            case NodeInternalType.ORG_UNIT:
                collName = ORGU_COL;
                collType = OrganizationUnit.TYPE;
                break;
            case NodeInternalType.APP_UNIT:
                collName = APPU_COL;
                collType = ApplicationUnit.TYPE;
                break;
            case NodeInternalType.DEVICE_TPL:
                collName = DEVTPL_COL;
                collType = DeviceTemplate.TYPE;
                break;
            case NodeInternalType.CREDENTIAL:
                collName = CRED_COL;
                collType = Credential.TYPE;
                break;
            case NodeInternalType.CONNECTION:
                collName = CONN_COL;
                collType = Connection.TYPE;
                break;
            default:
                if(this._isSupported(pObject.__)){
                    collName = this._supportedTypeInfos[pObject.__].collName;
                    collType = this._supportedTypeInfos[pObject.__].collType;
                }
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

            // delete project DB
            await ((await this.getProjectDB(pUID)).drop());

            // delete project metadata
            coll = this._db.getCollection(PROJECT_COL, DexcaliburProject.TYPE);
            res = await coll.asyncRemoveEntry( new DexcaliburProject({ uid:pUID }));


        }catch(err){
            Logger.error(err);
            res = false;
        }

        return res;
    }

    /**
     *
     * TODO : rename : connectProjectDB()
     *
     * @param pProjectUID
     */
    async getProjectDB(pProjectUID:string):Promise<ProjectDatabase> {

        Logger.info("[INFO] [ENGINE DB] getProjectDB = "+pProjectUID)
        const dbName = PROJECT_DB_PREFIX+pProjectUID;
        let projectAdapter:MongodbAdapter;
        let db:MongodbDb;
        let projDB:ProjectDatabase;

        if(this._projectsDB[pProjectUID]!=null){
            return this._projectsDB[pProjectUID];
        }

        // create ProjectDatabase
        projectAdapter = this._init(
            this._opts,
            {
                minPoolSize: 2,
                maxPoolSize: 200,
                maxConnecting: 10
            }
        );
        db = await projectAdapter.asyncConnect(null, dbName);
        db.open(dbName);
        Logger.info("[INFO] [PROJECT DB] Fresh ");

        projDB = new ProjectDatabase(db);
        projDB.name = dbName;
        projDB.setEngine(this._ctx);

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

    /**
     * To create a new scan order
     *
     * @param {ScanOrder} pOrder Fresh scan order
     *
     */
    async createScanOrder(pOrder:ScanOrder):Promise<ScanOrder> {
        return (await this.save(pOrder) as ScanOrder);
        /*
        return await (this.getCollectionOf(ScanOrder.TYPE.getType()) as MongodbDbCollection)
                    .asyncAddEntry({ uuid:pOrder.getUUID() },pOrder);*/
    }

    /**
     * To create a new scan order
     *
     * @param {ScanOrder} pOrder Fresh scan order
     *
     */
    async updateScanOrder(pOrder:ScanOrder):Promise<boolean> {
        console.log("updateScanOrder > ",pOrder.getUID());
        return await (this.getCollectionOf(ScanOrder.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrder);
    }

    async searchUsers(pUUIDs: UserAccountUUID[]):Promise<UserAccount[]> {
        return await (this.getCollectionOf(ScanOrder.TYPE.getType()) as MongodbDbCollection)
            .search({ filter: { _uid: { $in: pUUIDs } } }, {raw:true});
    }
}