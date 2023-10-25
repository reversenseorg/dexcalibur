import * as _path_ from 'path';
import * as _fs_ from 'fs';

import DexcaliburProject from "../DexcaliburProject.js";
import AssuranceModel from "./common/AssuranceModel.js";
import AssuranceReport from "./common/AssuranceReport.js";
import {AuditManagerException} from "./errors/AuditManagerException.js";
import {PrivacyTrackersModel} from "./models/SharePrivacyTrackersModel.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {ReversenseNetworkSecurityModel} from "./models/NetworkUsageModel.js";
import ProjectWorkspace from "../ProjectWorkspace.js";
import Util from "../Utils.js";
import * as Log from "../Logger.js";
const Logger:Log.Logger = Log.newLogger() as Log.Logger;

const SUBDIRS = {
    REPORTS: "reports",
    MODELS: "models",
};

let gInstance:AuditManager|null = null;

const GLOBAL_MODELS_FOLDER = "models";
const PROJECT_MODELS_FOLDER = "models";

interface AssuranceModelMap {
    [id:string] : AssuranceModel;
}

/**
 * Class to load, store and manage assurance model
 * in project context
 *
 * @class
 */
export class AuditManager {

    engine:DexcaliburEngine;

    genericModels:AssuranceModel[] = [];

    constructor(pEngine:DexcaliburEngine) {

        this.engine = pEngine;


    }

    /**
     *
     */
    static getInstance(pEngine:DexcaliburEngine|null = null):AuditManager {
        if(gInstance==null){
            if(pEngine!=null){
                gInstance = new AuditManager(pEngine);
            }else{
                throw AuditManagerException.CANNOT_INITIALIZE();
            }
        }

        return gInstance;
    }


    /**
     * To list assurance model of the project.
     *
     * It includes :
     * - available models
     * - custom models
     *
     *
     * @return {AssuranceModel[]}
     * @method
     */
    async listModels( pProject:DexcaliburProject|null = null):Promise<AssuranceModel[]> {
        let allModels:AssuranceModelMap = {};
        let projectModels:AssuranceModelMap = {};
        let globalModels:AssuranceModelMap = {};

        // if additionnal configuration is provided over Dexcalibur command arguments

        // load from remote signature server
        const remoteSharedModels = await this.engine.getSignatureServer().getModels();
        remoteSharedModels.map(x=> {
            x.updateControlTree(x.controls);
            allModels[x.getID()] = x;
        });

        // if project is specified, add models from project workspace
        if(pProject!=null) {
            projectModels = this._listModelsFromFolder(
                _path_.join(
                    pProject.getWorkspace().getAuditDir(),
                    PROJECT_MODELS_FOLDER
                )
            );
        }

        // load from Dexcalibur workspace
        /*
        globalModels =  this._listModelsFromFolder(
            _path_.join(
                this.engine.getWorkspace().getConfigFolderLocation(),
                GLOBAL_MODELS_FOLDER
            )
        );

        for(let k in globalModels){
            if(allModels[k]==null){
                allModels[k] = globalModels[k];
            }
        }*/


        // if some built-in models are not already stored in Dexcalibur or Project workspace,
        // create it
        for(let uid in projectModels){
            if(allModels[uid]==null){
                projectModels[uid].updateControlTree(projectModels[uid].controls);
                allModels[uid] = projectModels[uid];
            }
        }

        /*
        const presetModels = [
            PrivacyTrackersModel,
            ReversenseNetworkSecurityModel
        ];

        let x:AssuranceModel;
        for(let i=0; i<presetModels.length; i++){
            x = presetModels[i];
            if(allModels[x.getID()]==null){
                await x.load();
                allModels[x.getID()] = x;
            }
        }*/

        /*
        [
            //OwaspMasvsModel,
            //PrivacyPiiModel,
            PrivacyPiiModel2,
            PrivacyTrackersModel,
            ReversenseNetworkSecurityModel
        ].map(x => {
            if(allModels[x.getID()]==null){
                x.load();
                //this.saveModel(x, pProject);
                allModels[x.getID()] = x;
            }
        });*/


        return Object.values(allModels);
    }

    /**
     * To retrieve AssuranceModels from global workspace
     *
     * @return {AssuranceModel[]} List of models
     * @private
     */
    private _listModelsFromFolder(pPath:string):AssuranceModelMap {
        const models:AssuranceModelMap = {};
        let model:AssuranceModel;
        let data:string;

        if(_fs_.existsSync(pPath)){
            _fs_.readdirSync(pPath).map((vFile)=>{
                if(vFile.endsWith(".json")){
                    data = _fs_.readFileSync(_path_.join(pPath,vFile), {encoding:'utf-8'});
                    model = AssuranceModel.fromJsonObject(JSON.parse(data));
                    models[model.getID()] = model;
                }
            })
        }else{
            _fs_.mkdirSync(pPath);
        }

        return models;
    }


    static getReportsFolderFromPUID( pEngineWs:string, pProjectUID:string):string {
        return _path_.join(ProjectWorkspace.getAuditDirFromPUID(pEngineWs,pProjectUID), SUBDIRS.REPORTS);
    }


    /**
     * To list assurance report of the project.
     *
     * @param {DexcaliburProject} pProject
     * @return {AssuranceModel[]}
     * @method
     */
    async listReports( pProject:DexcaliburProject):Promise<AssuranceReport[]> {
        let x:AssuranceReport, model:AssuranceModel;

        const reports = this.listReportsFromPath(_path_.join(pProject.getWorkspace().getAuditDir(),SUBDIRS.REPORTS));

        for(let i=0;i<reports.length; i++){
            x = reports[i];
            model = await this.getModel(pProject, x.model as any);

            x.setProject(pProject);
            if(model != null){
                x.setModel(model);
                x.cleanReferences()
            }else{
                Logger.error("[AUDIT MANAGER] listReports > model cannot be restored ",x.model as any);
            }
        }

        return reports;
    }


    /**
     * To list assurance reports of the project even if the project is closed
     *
     *
     *
     * @return {AssuranceModel[]}
     * @method
     */
    listReportsFromPath( pDirPath:string):AssuranceReport[] {
        const reports:AssuranceReport[] = [];

        // check user permissions
        if(_fs_.existsSync(pDirPath)){
            _fs_.readdirSync(pDirPath).map( vPath => {
                console.log(vPath);

                // ignore system files
                if(Util.shouldIgnoreFile(vPath)) return;

                let report;
                try{

                    report = AssuranceReport.fromJsonObject(JSON.parse(_fs_.readFileSync(_path_.join(pDirPath,vPath), {encoding:'utf8'}) ));


                    reports.push(report);
                }catch (err){
                    console.log(err);
                }
            });
        }
        console.log(reports);
        return reports;
    }

    async getModel(pProject:DexcaliburProject, pModelID:string):Promise<AssuranceModel> {
        const models = await this.listModels(pProject);
        let model:AssuranceModel = null;
        for(let i=0; i<models.length; i++){
            if(models[i].id===pModelID){
                model = models[i];
            }
        }

        if(model==null){
            throw AuditManagerException.MODEL_NOT_FOUND(pModelID);
        }

        return model;
    }




    /**
     * To load custom
     */
    loadModels(){

    }

    /**
     * To save an assurance model into global or project workspace
     *
     * Final location depends of context :
     *  - If a projet is open and active, the model will be saved into project folder
     *  - If there is not active project, the model ll be save into Dexcalibur configuration folder into the workspace
     *
     *  @param {AssuranceModel} pModel The assurance model to save
     *  @param {DexcaliburProject|null} pProject Default NULL. The active project or null
     *  @return {void}
     *  @throws {AuditManagerException}
     *  @method
     */
    saveModel(pModel:AssuranceModel, pProject:DexcaliburProject|null = null):void{
        let folder:string;
        try{
            if(pProject!=null){
                // save into Project  workspace
                folder = _path_.join(
                    pProject.getWorkspace().getAuditDir(),
                    PROJECT_MODELS_FOLDER
                );
            }else{
                // save into Dexcalibur global workspace
                folder = _path_.join(
                    this.engine.getWorkspace().getConfigFolderLocation(),
                    GLOBAL_MODELS_FOLDER
                );
            }

            // remove if exists
            const path = _path_.join(folder,pModel.getID()+'.json');
            if(_fs_.existsSync(path)){
                _fs_.rmSync(path);
            }

            _fs_.writeFileSync(path, JSON.stringify(pModel.toJsonObject()));


        }catch (err){
            throw AuditManagerException.CANNOT_SAVE_MODEL(pModel.getID(),err.message);
        }



    }

    private _updateFolder(pPath:string):void{
        if(!_fs_.existsSync(pPath)){
            _fs_.mkdirSync(pPath);
        }
    }



    /**
     *
     * @param pProject
     * @param pReport
     * @return {string} Path of the report file
     * @method
     */
    saveReport( pProject:DexcaliburProject, pReport:AssuranceReport):string {
        let out = _path_.join(
            pProject.getWorkspace().getAuditDir(),
            SUBDIRS.REPORTS
        );

        this._updateFolder(out);

        out = _path_.join(
            out,
            pReport.getModel().id+"-"+(new Date()).getTime()+".json"
        );

        pReport.save(out);

        return out;
    }
}