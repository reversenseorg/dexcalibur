/**
 * Class to load, store and manage assurance model
 * in project context
 *
 * @class
 */
import DexcaliburProject from "../DexcaliburProject.js";
import AssuranceModel from "./common/AssuranceModel.js";

export class AuditManager {

    private _ctx:DexcaliburProject;

    constructor(pProject:DexcaliburProject) {
        this._ctx = pProject;
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
    listModels():AssuranceModel[] {
        const models:AssuranceModel[] = [];



        return models;
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
}