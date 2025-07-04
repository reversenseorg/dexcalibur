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
import {ProjectInput} from "../analyzer/ProjectInput.js";
import {ProjectDatabase} from "./ProjectDatabase.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

const PROJECT_DB_PREFIX = "dxc_";

/**
 * Represent the server DB where project data are stored or cloned
 *
 * @class
 */
export class ProjectFileDatabase  {

    private _pdb:ProjectDatabase;
    private _prj:DexcaliburProject;

    constructor(pPrj:DexcaliburProject, pDb:ProjectDatabase) {
        this._pdb = pDb;
        this._prj = pPrj;
    }


    /**
     * To create a baseline search request for search in file db
     *
     * @param {DataScope} pScope File scope
     * @returns {MerlinSearchRequest} request
     * @method
     */
    createRequestByScope(pScope:DataScope):MerlinSearchRequest {
        return MerlinSearchRequest.fromCondition(
            this._prj.merlin,
            ModelFile.TYPE,
            `scope:${pScope.getUID()}`,{
                not:false
            }
        )
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchFiles(pScope:DataScope, pFilter:any):Promise<ModelFile[]> {
        const coll = this._pdb.getCollectionOf(ModelFile.TYPE.getType());

        return await  this._pdb.search({
            scope: pScope,

        },ModelFile.TYPE.getType())
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchFilesByName(pScope:DataScope, pPattern:string|RegExp):Promise<ModelFile[]> {

        let request:MerlinSearchRequest =  this.createRequestByScope(pScope);
        if(typeof pPattern==='string'){
            request = request.search("name:"+pPattern)
        }else if(pPattern instanceof RegExp){
            request = request.search(`name:/${pPattern.source}/`,{ not:false, regexp: true })
        }else{
            throw new Error("ProjectFileDatabase : Filter type not supported ")
        }

        return (await request.executePDB(this._prj)).getData();
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchFilesByPath(pScope:DataScope, pPattern:string|RegExp):Promise<ModelFile[]> {

        let request:MerlinSearchRequest =  this.createRequestByScope(pScope);
        if(typeof pPattern==='string'){
            request = request.search("_r:"+pPattern)
        }else if(pPattern instanceof RegExp){
            request = request.search(`_r:/${pPattern.source}/`,{ not:false, regexp: true })
        }else{
            throw new Error("ProjectFileDatabase : Filter type not supported ")
        }

        return (await request.executePDB(this._prj)).getData();
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchSharedObjects(pScope:DataScope):Promise<ModelFile[]> {

        let request:MerlinSearchRequest =  this.createRequestByScope(pScope)
                            .search(`_r:/\.so$/`,{ not:false, regexp: true })

        return (await request.executePDB(this._prj)).getData();
    }

    /**
     * To search
     * @param pScope
     * @param pFilter
     */
    async searchExecutables(pScope:DataScope):Promise<ModelFile[]> {

        /*let request:MerlinSearchRequest =  this.createRequestByScope(pScope)
            .filter(`type:/^(ELF|Mach-O|PE)$/`,{ not:false, regexp: true })

        return (await request.executePDB(this._prj)).getData();*/

        return await this._pdb.getCollectionOf(ModelFile.TYPE.getType()).search({
            filter:{
                scope: pScope.getInternalName(),
                type: {
                    $regex: "^(ELF|Mach-O|PE)$"
                }
            }
        },{raw:true});
    }
}