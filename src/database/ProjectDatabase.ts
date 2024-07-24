import DexcaliburEngine from "../DexcaliburEngine.js";
import {Settings} from "../Settings.js";
import DatabaseSettings = Settings.DatabaseSettings;
import {MongodbAdapter, MongodbDb, MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {Nullable} from "../core/IStringIndex.js";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import InspectorFactory from "../InspectorFactory.js";
import { IDbCollection, INode, NodeType, Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, NodeInternalTypeName}
from "@dexcalibur/dxc-core-api";;
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
import AndroidActivity from "../android/AndroidActivity.js";
import ModelClass from "../ModelClass.js";
import ModelPackage from "../ModelPackage.js";
import ModelMethod from "../ModelMethod.js";
import ModelField from "../ModelField.js";
import AndroidService from "../android/AndroidService.js";
import AndroidReceiver from "../android/AndroidReceiver.js";
import AndroidProvider from "../android/AndroidProvider.js";
//import {SaveScheduler} from "./SaveScheduler.js";
import {isMainThread} from "worker_threads";
import {WorkerInfo} from "../core/Job.js";
import {JobWorkerMessage} from "../formats/identifier/Job.js";
import {SaveScheduler} from "./SaveScheduler.js";
import AnalyzerDatabase from "../AnalyzerDatabase.js";
import Util from "../Utils.js";
import {BusSubscriber} from "../Bus.js";
import BusEvent from "../BusEvent.js";
import ModelBom from "../ModelBom.js";

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

    /**
     * Worker to schedule child worker to save data
     *
     * @type {Nullable<WorkerInfo>}
     * @private
     */
    //private _scheduler:Nullable<WorkerInfo> = null;

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
        Bookmark.TYPE,

        AndroidActivity.TYPE,
        AndroidService.TYPE,
        AndroidReceiver.TYPE,
        AndroidProvider.TYPE,

        ModelClass.TYPE,
        ModelPackage.TYPE,
        ModelMethod.TYPE,
        ModelField.TYPE,
        ModelBom.TYPE
    ];

    private _supportedTypeInfos:{ [type:number] :CollectionInfo } = {};


    constructor(pDb:MongodbDb) {
        this._db = pDb;
    }

    setEngine(pContext:DexcaliburEngine){
        this._ctx = pContext;
    }

    setProject(pProject:DexcaliburProject):void {
        this._project = pProject;
        this._db.conn.ctx = pProject;
        if(pProject.dbName==""){
            pProject.dbName = this.name;
        }

        this._initSubscriptions();

    }

    getDb():MongodbDb {
        return this._db;
    }

    private async _createScheduler():Promise<WorkerInfo>{
        return await  SaveScheduler.queueScheduler(
            20,
            this._project,
            (jMsg:JobWorkerMessage)=>{

                if(jMsg.cmd=="log"){
                    if(!jMsg.success || jMsg.err!=null ){
                        Logger.error("[SaveSchedulerWorker][queueScheduler]["+jMsg.threadID+" ] : "+(jMsg.err!=null? jMsg.err : jMsg.data));
                    }else{
                        Logger.info("[SaveSchedulerWorker][queueScheduler]["+jMsg.threadID+" ] : "+jMsg.data);
                    }
                    return;
                }

                if(jMsg.cmd=="save") {

                    if (!jMsg.success) {
                        Logger.error("[SaveSchedulerWorker][queueScheduler][" + jMsg.threadID + "] Error : " + jMsg.err);
                        return;
                    }

                    /*
                    const f:ModelFile = new ModelFile({
                        type: jMsg.data.fmt!=null ? jMsg.data.fmt.type : null,
                        __p: jMsg.data.fmt!=null ? jMsg.data.fmt.__p : null,
                        name: _path_.basename(jMsg.data.file),
                        path: jMsg.data.file,
                    });

                    // append to the list
                    files.push(f);

                    if(pContext!=null){
                        pContext.bus.send(new BusEvent<FileScanResult>({
                            type: "data.file.new.knownFmt",
                            data: {
                                src: jMsg.data.backend,
                                file: f
                            }
                        }))
                    }*/
                }
                return;
            },
            50
        );
    }


    /**
     *
     * @private
     */
    private _initSubscriptions():void {
        this._project.getBus().subscribe("data.file.parsed",  BusSubscriber.from( (pEvent:BusEvent<any>)=>{
            Logger.info("[DXC-PROJECT] [SUBSCRIBER] <data.file.parsed> Save parsed data [fmt="
                +pEvent.getData().format+"] : "+pEvent.getData().file.getPath());

            this.save(pEvent.getData().file).then((v)=>{},()=>{})
        }) )
    }

    /**
     *
     */
    async connect():Promise<void> {
    }

    /**
     * To create a collection of nodes with a specific NodeType into DB
     *
     * @param pNode
     * @param pExitingCols
     * @private
     */
    private async _createCollectionOf(pNode:NodeType, pExitingCols:string[]):Promise<any> {
        if(pExitingCols.indexOf(pNode.getName())==-1){
            await this._db.createCollectionOf(pNode, pNode.getName());
            Logger.debug("PROJECT DB > createCollectionOf > ",pNode.getName());
        }

    }

    /**
     *
     */
    async init():Promise<void>{

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


    saveAsync(pObject:INode):void{

        let obj:INode;
        const info = this._getCollectionInfo(pObject);
        const coll = this._db.getCollection(info.collName, info.collType);

        const flatObj = coll._db._s.prepareForPersist(pObject, NodeType.getByID(pObject.__));

        //coll.prepareObject()
        /*this._scheduler.worker.postMessage({
            cmd: "save",
            data: flatObj
        });*/
    }

    initScheduler(){
        /*if(this._scheduler==null && isMainThread){
            (async ()=>{
                this._scheduler = await this._createScheduler();

                // if scheduler crash, re-spawn it
                this._scheduler.worker.on('exit', ()=>{
                    // this._scheduler = await this._createScheduler();
                    console.error("Save scheduler exited.")
                })
            })();
        }*/
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
            //Logger.info("PROJECT DB > save > ",pObject._id);

            if((await coll.asyncUpdateEntry( pObject, { upsert:true, filter: {_id:pObject._id} }))===false){
                throw EngineDatabaseException.UPDATE_FAILED_FOR(NodeInternalTypeName[pObject.__], pObject._id );
            }else{
                obj = pObject;
            }
        }else{
            //Logger.info("PROJECT DB > save > ",pObject.getUID());
            try{
                obj = await coll.asyncAddEntry( pObject.getUID(), pObject);
            }catch(e){
                const filterId:any = {};
                NodeType.INTERN[pObject.__].setPrimaryKeyValueOf( filterId as any, pObject.getUID());
                await coll.asyncUpdateEntry( pObject, { upsert:true, filter: filterId });
            }

        }

        return obj;
    }


    /*
     * To save an object to corresponding collection
     *
     * Only some object type can be stored into shared DB :
     * scan order, projects metadata, devices, inspectors info
     *
     * @param {INode} pObject
     * @async
     * @method
     */
    /*
    async saveOOB(pFlatObject:INode):Promise<INode> {



        let obj:INode;
        const info = this._getCollectionInfo(pFlatObject.__);
        const coll = this._db.getCollection(info.collName, info.collType);


        if(pFlatObject._id!=null){
            //Logger.info("PROJECT DB > save > ",pObject._id);

            if((await coll.asyncUpdateEntry( pFlatObject, { upsert:true, filter: {_id:pFlatObject._id} }))===false){
                throw EngineDatabaseException.UPDATE_FAILED_FOR(NodeInternalTypeName[pFlatObject.__], pFlatObject._id );
            }else{
                obj = pFlatObject;
            }
        }else{
            const  uidPK = NodeType.getByID(pFlatObject.__).getPrimaryKey()._name;
            const  uid = pFlatObject[uidPK];
            Logger.info("PROJECT DB > save OOB > "+uid);
            try{
                obj = await coll.asyncAddEntry( uid, pFlatObject);
                pFlatObject._id = obj._id;
            }catch(e){
                const filterId:any = {};
                NodeType.INTERN[pFlatObject.__].setPrimaryKeyValueOf( filterId as any, uid);
                await coll.asyncUpdateEntry( pFlatObject, { upsert:true, filter: filterId });
            }

        }

        return obj;
    }*/


    /**
     * Retrieve Inspector state from DB by InspectorFactory UID
     *
     * @param pInspectorUID
     */
    async getInspectorState( pInspectorUID:string):Promise<Inspector> {
        return await (this.getCollectionOf(Inspector.TYPE.getType()) as MongodbDbCollection)
                        .asyncGetEntry({ id:pInspectorUID });
    }

    /**
     * Retrieve Inspector state from DB by InspectorFactory UID
     *
     * @param pInspectorUID
     */
    async getHookStrategy( pStrategyUID:string):Promise<HookStrategy> {
        return await (this.getCollectionOf(HookStrategy.TYPE.getType()) as MongodbDbCollection)
            .asyncGetEntry({ _uid:pStrategyUID });
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

    /**
     *
     * @param pState
     */
    async saveState(pState:AnalyzerState):Promise<any> {
        return this.getCollectionOf(AnalyzerState.TYPE.getType()).asyncUpdateEntry(
            pState,
            { upsert: true, filter: { _uid:pState._uid } }
        );
    }

    /**
     *
     * @param pInspector
     */
    async saveInspectorState(pInspector:Inspector):Promise<any> {
        return await this.getCollectionOf(Inspector.TYPE.getType()).asyncUpdateEntry(
            pInspector,
            { upsert: true, filter: { id:pInspector.getUID() } }
        );
    }

    /**
     * To persist the DB
     * @param {AnalyzerDatabase} pDB
     */
    async saveAnalyzerDB(pDB: AnalyzerDatabase):Promise<void>  {

        if(this._ctx.dryRun){
            Logger.success("[PROJECT DB] Analyzer DB didnt  save : dry run mode");
            return;
        }

        Logger.info("[PROJECT DB] Start to save Analyzer DB");
        const startTime = Util.now();

        const types = [
            NodeInternalType.CLASS,
            NodeInternalType.METHOD,
            NodeInternalType.FIELD,
            NodeInternalType.PACKAGE
        ];

        let vals;
        for(let i=0; i<types.length; i++){
            vals = pDB.getDataSetFromNodeType(types[i]).getAsList();
            await Util.mapInGroups<INode>(vals, async (vObj) => {
                try{
                    await this.save(vObj);
                }catch(err){
                    Logger.error(err.message);
                }
            }, 20);
        }

        Logger.success("[PROJECT DB] Analyzer DB saved [duration="+((Util.now()-startTime)/1000)+"s]");
    }


    /**
     * To drop this database
     *
     * Important : cannot be undone
     *
     * @method
     */
    async drop():Promise<void>{
        await this._db.db.dropDatabase();
    }
}