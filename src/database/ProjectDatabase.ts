import DexcaliburEngine from "../DexcaliburEngine.js";
import {Settings} from "../Settings.js";
import DatabaseSettings = Settings.DatabaseSettings;
import {MongodbAdapter, MongodbDb, MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {Nullable} from "../core/IStringIndex.js";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import InspectorFactory from "../InspectorFactory.js";
import {IDbCollection, IDbIndex, INode, NodeType, Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, NodeInternalTypeName}
from "@dexcalibur/dxc-core-api";

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
import {WorkerInfo} from "../core/Job.js";
import {JobWorkerMessage} from "../formats/identifier/Job.js";
import {SaveScheduler} from "./SaveScheduler.js";
import AnalyzerDatabase from "../AnalyzerDatabase.js";
import Util from "../Utils.js";
import {BusSubscriber} from "../Bus.js";
import BusEvent from "../BusEvent.js";
import ModelBom from "../ModelBom.js";
import ModelUiEventType from "../graphics/models/ModelUiEventType.js";
import ModelUiEvent from "../graphics/models/ModelUiEvent.js";
import ModelUiComponent from "../graphics/models/ModelUiComponent.js";
import ModelUiComponentType from "../graphics/models/ModelUiComponentType.js";
import ModelUiRole from "../graphics/models/ModelUiRole.js";
import ModelResource from "../ModelResource.js";
import ModelStringValue from "../ModelStringValue.js";
import InMemoryDbCollection from "../../connectors/inmemory/InMemoryDbCollection.js";
import {MerlinSearchRequest} from "../search/MerlinSearchRequest.js";
import {FinderResult} from "../search/FinderResult.js";
import InMemoryDbIndex from "../../connectors/inmemory/InMemoryDbIndex.js";
import AssuranceModel from "../audit/common/AssuranceModel.js";
import {GridFSBucket} from "mongodb";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";
import {IFileDatabase} from "../core/commons.js";
import {FileManager} from "../core/FileManager.js";

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
export class ProjectDatabase implements IFileDatabase {

    name:string = "";

    private _ctx:DexcaliburEngine;
    private _opts:DatabaseSettings;
    private _fmgr:FileManager;
    private _connector: MongodbAdapter;
    private _ready = false;

    private _wsBucket:Nullable<GridFSBucket> = null;

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
        ModelBom.TYPE,
        ModelStringValue.TYPE,

        ModelUiEventType.TYPE,
        ModelUiEvent.TYPE,
        ModelUiComponentType.TYPE,
        ModelUiComponent.TYPE,
        ModelUiRole.TYPE,

        ModelResource.TYPE,

        AssuranceModel.TYPE
        //ModelStringValue.TYPE
    ];

    private _supportedTypeInfos:{ [type:number] :CollectionInfo } = {};


    constructor(pDb:MongodbDb) {
        this._db = pDb;
    }

    setEngine(pContext:DexcaliburEngine){
        this._ctx = pContext;
        this._fmgr = new FileManager(pContext, this);
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
    private _initWorkspace(){
        // create or open the workspace bucket in gridFS
        this._wsBucket = new GridFSBucket(this._db.db, {bucketName: 'ws' });

        this._fmgr
    }

    /**
     *
     * @param pBuffer
     * @param pPath
     * @param pMetadata
     */
    async writeFileContent(pBuffer:Buffer, pPath:string, pMetadata:any){

        if(this._wsBucket==null){
            throw ProjectManagerException.GRID_WS_NOT_READY(this._project.getUID());
        }

        /*Readable.from(pBuffer).pipe(this._wsBucket.openUploadStream(pPath, {
            chunkSizeBytes: pBuffer.length,
            metadata: pMetadata
        }));*/
    }

    /**
     *
     * @param pFile
     */
    async readFileContent(pFile:string):Promise<any> {
        if(this._wsBucket==null){
            throw ProjectManagerException.GRID_WS_NOT_READY(this._project.getUID());
        }

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

        // prepare Workspace FS
        if(this._fmgr!=null){
            this._fmgr.open('ws');
        }


        // init ws
        this._initWorkspace();
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
    async save(pObject:INode, pFilter:Nullable<any>=null, pSet:string[] = []):Promise<INode> {


        let obj:INode;
        const info = this._getCollectionInfo(pObject);
        const coll = this._db.getCollection(info.collName, info.collType);
        let opt:any;

        if(pObject._id!=null){
            //Logger.info("PROJECT DB > save > ",pObject._id);
            opt = { upsert:true, replace:false, filter: {_id:pObject._id} };
            if(pSet.length>0){
                opt['$set'] = pSet;
            }
            if((await coll.asyncUpdateEntry( pObject, opt))===false){
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

                console.log(e,{ upsert:true, replace:false, filter: filterId });
                opt = { upsert:true, replace:false, filter: filterId };
                if(pSet.length>0){
                    opt['$set'] = pSet;
                }
                await coll.asyncUpdateEntry( pObject, opt);
            }

        }

        return obj;
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
    async saveMany(pObjects:INode[], pNodeType:NodeInternalType):Promise<INode[]> {


        let obj:INode[];
        const info = this._getCollectionInfo(pNodeType);
        const coll = this._db.getCollection(info.collName, info.collType);

        // separate document to update from document to create
        const toCreate:Record<any, INode> = {};
        const toUpdate:Record<any, INode> = {};
        let hasUpdate = false;
        pObjects.map(x=>{
            if(x._id!=null){
                hasUpdate = true;
                toUpdate[x.getUID()] = x;
            }else{
                toCreate[x.getUID()] = x;
            }
        });

        if(hasUpdate){
            try{
                obj = await coll.updateMany(toUpdate) as any;
            }catch(e){
                console.log(e.stack,e.msg);
                //const filterId:any = {};
                //NodeType.INTERN[pObject.__].setPrimaryKeyValueOf( filterId as any, pObject.getUID());
                //await coll.asyncUpdateEntry( pObject, { upsert:true, filter: filterId });
                //throw EngineDatabaseException.BULK_OP_NOT_SUPPORTED('updateMany', 'bulk update failed' );
            }

            //throw EngineDatabaseException.BULK_OP_NOT_SUPPORTED('saveMany', 'some documents have _id but "updateMany" is not supported' );
        }

        try{
            obj = await coll.addMany(toCreate) as any;
        }catch(e){
            console.log(e.stack,e.msg);
            //const filterId:any = {};
            //NodeType.INTERN[pObject.__].setPrimaryKeyValueOf( filterId as any, pObject.getUID());
            //await coll.asyncUpdateEntry( pObject, { upsert:true, filter: filterId });
            //throw EngineDatabaseException.BULK_OP_NOT_SUPPORTED('saveMany', 'insert failed, some documents have _id but "updateMany" is not supported' );
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
            try{
                if(vals.length>0){
                    await this.saveMany(vals, types[i]);
                }
            }catch (e){
                Logger.error(e.message);
            }
        }

        Logger.success("[PROJECT DB] Analyzer DB saved [duration="+((Util.now()-startTime)/1000)+"s]");
    }


    /**
     * To save only CLASS/METHOD/FIELD/PACKAGE tagged with pTag
     * and stored in AnalyzerDB
     *
     * @param {AnalyzerDatabase} pDB The analyzer DB
     * @param {Tag} pTag Tag
     */
    async savePartialAnalyzerDB(pDB: AnalyzerDatabase, pTag:Tag):Promise<void>  {

        if(this._ctx.dryRun){
            Logger.success("[PROJECT DB] Analyzer DB didnt  save : dry run mode");
            return;
        }

        Logger.info("[PROJECT DB] Start to save Analyzer DB");
        const startTime = Util.now();

        const types:NodeType[] = [
            ModelClass.TYPE,
            ModelField.TYPE,
            ModelMethod.TYPE,
            ModelPackage.TYPE
        ];


        let result:IDbIndex = new InMemoryDbIndex();
        let req:MerlinSearchRequest;
        for(let i=0; i<types.length; i++){

            req = MerlinSearchRequest.fromCondition(this._project.merlin, types[i], "@"+pTag.getUID(), { not:false });
            result = await (pDB.getDataSetFromNodeType(types[i].getType()) as InMemoryDbCollection).search(
                req,
                result
            ); //.getAsList();


            try{
                Logger.info(`Partial save of Analyzer DB [nodeType=${types[i].getName()}][size=${result.size()}][tag=${pTag.getUID()}]`);
                if(result.size()>0){
                    await this.saveMany(result.getAsList(), types[i].getType());
                }
            }catch (e){
                Logger.error(e.message);
            }
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

    async getAppResource(pResUID:string):Promise<ModelResource> {
        return await (this.getCollectionOf(ModelResource.TYPE.getType()) as MongodbDbCollection)
            .asyncGetEntry({ _uid:pResUID });
    }

    getFileManager():FileManager {
        return this._fmgr;
    }
}