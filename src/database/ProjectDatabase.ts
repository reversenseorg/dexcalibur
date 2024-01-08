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
import DataScope from "../DataScope.js";
import KeyPoint from "../hook/KeyPoint.js";
import HookStrategy from "../hook/HookStrategy.js";
import HookTemplateFragment from "../hook/HookTemplateFragment.js";
import JavaMethodHook from "../hook/JavaMethodHook.js";
import NativeFunctionHook from "../hook/NativeFunctionHook.js";
import {RuntimeEvent} from "../hook/RuntimeEvent.js";
import Inspector from "../Inspector.js";
import {BookmarkType} from "../bookmark/BookmarkType.js";
import {Bookmark} from "../bookmark/Bookmark.js";

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

    name:string = "";

    private _ctx:DexcaliburEngine;
    private _opts:DatabaseSettings;
    private _connector: MongodbAdapter;
    private _ready = false;

    private _db:Nullable<MongodbDb> = null;

    private _project:Nullable<DexcaliburProject> = null;

    private _supportedType:NodeType[] = [
        Tag.TYPE,
        TagCategory.TYPE,
        AnalyzerState.TYPE,
        HookSession.TYPE,
        ModelFile.TYPE,
        DataScope.TYPE,
        KeyPoint.TYPE,
        HookStrategy.TYPE,
        HookSet.TYPE,
        HookTemplateFragment.TYPE,
        JavaMethodHook.TYPE,
        NativeFunctionHook.TYPE,
        RuntimeEvent.TYPE,
        InspectorFactory.TYPE,
        Inspector.TYPE,
        BookmarkType.TYPE,
        Bookmark.TYPE
    ];

    private _supportedTypeInfos:{ [type:number] :CollectionInfo } = {};


    constructor(pContext:DexcaliburEngine, pDb:MongodbDb) {
        this._ctx = pContext;
        this._db = pDb;

    }

    setProject(pProject:DexcaliburProject):void {
        this._project = pProject;
        if(pProject.dbName!=""){
            pProject.dbName = this.name;
        }
    }

    /**
     *
     */
    async connect():Promise<void> {

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
            console.log("PROJECT DB > createCollectionOf > ",pNode.getName());
        }

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

        // to ease db dev, collection are created accordingly to supported node types
        let nodeType:NodeType;
        for(let i=0; i<this._supportedType.length; i++){
            nodeType = this._supportedType[i];
            await this._createCollectionOf(nodeType, existings);
            this._supportedTypeInfos[nodeType.getType()] = {
                collName: nodeType.getName(),
                collType: nodeType
            };
        }
    }


    /**
     *
     * @param pNode
     * @private
     */
    private _getCollectionInfo(pNode:INode|NodeInternalType):CollectionInfo {

        const nodeType = (typeof pNode==='number')?pNode:pNode.__;

        if(this._supportedTypeInfos[nodeType]!=null){
            return this._supportedTypeInfos[nodeType];
        }else{
            throw EngineDatabaseException.UNKNOWN_COLLECTION(NodeInternalTypeName[nodeType]);
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

        let state:AnalyzerState = await (coll as MongodbDbCollection).asyncGetEntry({ _uid: pAnal });

        if(state == null){
            state = new AnalyzerState({ _uid:pAnal, state:{}, modified:-1 });
            state = await coll.asyncAddEntry(pAnal, state);
        }

        if(this._project!=null){
            if(!state.isReady()) state.setContext(this._project);
        }

        return state;
    }

    async saveState(pState:AnalyzerState):Promise<any> {
        return this.getCollectionOf(AnalyzerState.TYPE.getType()).asyncUpdateEntry(
            pState,
            { upsert: true, filter: { _uid:pState._uid } }
        );
    }
}