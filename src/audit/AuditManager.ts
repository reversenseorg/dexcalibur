import * as _path_ from 'path';
import * as _fs_ from 'fs';

import DexcaliburProject from "../DexcaliburProject.js";
import AssuranceModel from "./common/AssuranceModel.js";
import AssuranceReport from "./common/AssuranceReport.js";
import { PrivacyModel } from "./privacy/PrivacyModel.js";
import Util from '../Utils.js';
import {AuditManagerException} from "./errors/AuditManagerException.js";

const SUBDIRS = {
    REPORTS: "reports",
    MODELS: "models",
};

let gInstance:AuditManager|null = null;

/**
 * Class to load, store and manage assurance model
 * in project context
 *
 * @class
 */
export class AuditManager {

    genericModels:AssuranceModel[] = [];

    constructor() {
        [
            new PrivacyModel()
            // new ArjelModel()
        ].map(x => {
            x.load();
            this.genericModels.push(x);
        });
    }

    /**
     *
     */
    static getInstance():AuditManager {
        if(gInstance==null){
            gInstance = new AuditManager();
        }

        return gInstance;
    }

    listGenericModels():AssuranceModel[] {
        return this.genericModels;
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
    listModels( pProject:DexcaliburProject):AssuranceModel[] {
        const models:AssuranceModel[] = [];

        const customModels = _path_.join(pProject.getWorkspace().getAuditDir(),SUBDIRS.MODELS);
        //_fs_.readdirSync()

        return models.concat(this.genericModels);
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
    listReports( pProject:DexcaliburProject):AssuranceReport[] {
        const reports:AssuranceReport[] = [];

        const customReports = _path_.join(pProject.getWorkspace().getAuditDir(),SUBDIRS.REPORTS);
        // check user permissions
        if(_fs_.existsSync(customReports)){
            _fs_.readdirSync(customReports).map( vPath => {
                try{
                    reports.push(
                        AssuranceReport.fromJsonObject(
                            JSON.parse(
                                _fs_.readFileSync(vPath, {encoding:'utf8'})
                            )
                        )
                    );
                }catch (err){

                }
            });
        }

        return reports;
    }

    getModel(pProject:DexcaliburProject, pModelID:string):AssuranceModel {
        const models = this.listModels(pProject);
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
     * To save a model
     */
    saveModel(){

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