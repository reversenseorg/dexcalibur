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
import {ENodeInternalTypes, IDbCollection, INode, NodeType, Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, NodeInternalTypeName} from "../NodeInternalType.js";
import {EngineDatabaseException} from "../errors/EngineDatabaseException.js";
import {AnalyzerState} from "../AnalyzerState.js";
import ModelFile from "../ModelFile.js";
import HookSet from "../HookSet.js";
import HookSession from "../HookSession.js";

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

interface CollectionInfo {
    collType:Nullable<NodeType>;
    collName:Nullable<string>;
}

const PROJECT_DB_PREFIX = "dxc_";

/**
 * Represent the server DB where project data are stored or cloned
 *
 * @class
 */
export class ProjectDatabase {

    static DEFAULT_CONN_STR = "master:master123:admin:DEFAULT:";
    static DEFAULT_HOST = "127.0.0.1";
    static DEFAULT_PORT = 27017;

    private _ctx:DexcaliburEngine;
    private _opts:DatabaseSettings;
    private _connector: MongodbAdapter;
    private _ready = false;

    private _db:Nullable<MongodbDb> = null;

    // engine scope
    private metadata:Nullable<MongodbDbCollection>;
    private inspectors:Nullable<MongodbDbCollection>;
    private hooks:Nullable<MongodbDbCollection>;
    private files:Nullable<MongodbDbCollection>;

    // project scope
    private runtime_events:Nullable<MongodbDbCollection>; // with session
    private app_files:Nullable<MongodbDbCollection>;

    private _project:Nullable<DexcaliburProject> = null;

    constructor(pContext:DexcaliburEngine, pDb:MongodbDb) {
        this._ctx = pContext;
        this._db = pDb;
    }

    setProject(pProject:DexcaliburProject):void {
        this._project = pProject;
    }


    async connect():Promise<void> {

        /*this._db = await this._connector.asyncConnect(null,INTERNAL_DB);
        this._db.open(INTERNAL_DB);

        const existings:string[] = [];
        const colls = await this._db.getDbCollections();
        colls.map(x => {
            existings.push(x.collectionName)
        });

        if(existings.indexOf(TAG_COL)==-1){ this._db.createCollectionOf(Tag.TYPE, TAG_COL); }
        if(existings.indexOf(TAG_CATEGORY_COL)==-1){ this._db.createCollectionOf(TagCategory.TYPE, HOOK_COL); }
        if(existings.indexOf(INSP_COL)==-1){ this._db.createCollectionOf(InspectorFactory.TYPE, INSP_COL); }
        if(existings.indexOf(FILES_COL)==-1){ this._db.createCollectionOf(ScanOrder.TYPE, FILES_COL); }

        Logger.info("Connection successful");*/
    }

    private async _createCollectionOf(pNode:NodeType, pExitingCols:string[]):Promise<void> {
        if(pExitingCols.indexOf(pNode.getName())==-1){
            await this._db.createCollectionOf(pNode, pNode.getName());
            console.log("PROJECT DB > createCollectionOf > ",pNode.getName())
        }

        console.log(pExitingCols, pNode.getName());
    }

    /**
     *
     */
    async init():Promise<void>{

        console.log("INIT PROJECT DB");
        // refresh
        //this._db.open(this._db.name);

        // init schemas
        const existings:string[] = [];
        const colls = await this._db.getDbCollections();
        colls.map(x => {
            existings.push(x.collectionName)
        });


        console.log("PROJECT DB > exists : ",existings);

        await this._createCollectionOf(Tag.TYPE, existings);
        await this._createCollectionOf(TagCategory.TYPE, existings);
        await this._createCollectionOf(AnalyzerState.TYPE, existings);
        await this._createCollectionOf(HookSession.TYPE, existings);
        await this._createCollectionOf(ModelFile.TYPE, existings);
    }



    private _getCollectionInfo(pNode:INode|NodeInternalType):CollectionInfo {
        const info:CollectionInfo = {
            collName: null,
            collType: null
        };


        const nodeType = (typeof pNode==='number')?pNode:pNode.__;

        switch ( nodeType){
            case ENodeInternalTypes.TAG:
                info.collName = Tag.TYPE.getName();
                info.collType = Tag.TYPE;
                break;
            case ENodeInternalTypes.TAG_CATEGORY:
                info.collName = TagCategory.TYPE.getName();
                info.collType = TagCategory.TYPE;
                break;
            case NodeInternalType.FILE:
                info.collName = ModelFile.TYPE.getName();
                info.collType = ModelFile.TYPE;
                break;
            case NodeInternalType.INSPECTOR:
                info.collName = InspectorFactory.TYPE.getName();
                info.collType = InspectorFactory.TYPE;
                break;
            case NodeInternalType.HOOK_SESSION:
                info.collName = HookSession.TYPE.getName();
                info.collType = HookSession.TYPE;
                break;
            case NodeInternalType.ANAL_STATE:
                info.collName = AnalyzerState.TYPE.getName();
                info.collType = AnalyzerState.TYPE;
                break;
        }

        if(info.collName=="" || info.collType==null){
            throw EngineDatabaseException.UNKNOWN_COLLECTION(NodeInternalTypeName[nodeType]);
        }

        return info;
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

        const info = this._getCollectionInfo(pNode);

        /*if(Object.keys((this._db as any)._colls).length==0){
            this._db.open(INTERNAL_DB);
        }*/

        return this._db.getCollection(info.collName, info.collType);
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
        const info = this._getCollectionInfo(pObject);

        /*if(Object.keys((this._db as any)._colls).length==0){
            this._db.open(INTERNAL_DB);
            //console.log((this._db as any)._colls);
        }*/

        const coll = this._db.getCollection(info.collName, info.collType);


        if(pObject._id!=null){
            Logger.info("PROJECT DB > save > ",pObject._id);

            if((await coll.asyncUpdateEntry( pObject, { upsert:true, filter: {_id:pObject._id} }))===false){
                throw EngineDatabaseException.UPDATE_FAILED_FOR(NodeInternalTypeName[pObject.__], pObject._id );
            }else{
                obj = pObject;
            }
        }else{
            Logger.info("PROJECT DB > save > ",pObject.getUID());
            obj = await coll.asyncAddEntry( pObject.getUID(), pObject);
        }

        return obj;
    }



    /**
     *
     * @param pAnal
     * @private
     */
    async getAnalyzerState(pAnal:string):Promise<AnalyzerState> {
        const coll = this.getCollectionOf(AnalyzerState.TYPE.getType());

        let state:AnalyzerState = await coll.asyncGetEntry(pAnal);

        if(state == null){
            state = new AnalyzerState({ _uid:pAnal, state:{}, modified:-1 });
            await coll.asyncAddEntry(pAnal, state);
        }

        if(this._project!=null){
            if(!state.isReady()) state.setContext(this._project);
        }

        return state;
    }

}