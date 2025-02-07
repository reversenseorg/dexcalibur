import * as _fs_ from 'fs';
import Asset from "./Asset.js";
import Threat from "./Threat.js";
import Constraint from "./Constraint.js";
import { ConstraintMatch } from "./ConstraintMatch.js";
import CodeConstraint from "./CodeConstraint.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import AssuranceModel from "./AssuranceModel.js";
import AssuranceReport, { AssuranceReportOptions } from './AssuranceReport.js';
import Control from "./Control.js";
import ControlAssessment from "./ControlAssessment.js";

export interface GenericReportOptions extends AssuranceReportOptions {


}


export interface Index<T> {
    [absoluteID:string] :T
}

/**
 * Deprecated ?
 */
export default class GenericReport extends AssuranceReport {

    indexControls:Index<Control> = {}
    indexAssessments:Index<ControlAssessment> = {}

    constructor( pConfig:GenericReportOptions = {}) {
        super(pConfig);
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    private _indexModel(pBaseID:string,pControl:Control):void {
        const id = pBaseID+"."+pControl.id;
        if(pControl.hasChildren()){
            pControl.children.map(x => this._indexModel(id,x));
        }else{
            pControl.assessments.map( (x,i) => {
                this.indexAssessments[id+"."+x.id] = x;
            });
        }
        this.indexControls[id] = pControl;
    }

    setModel(pModel:AssuranceModel):void {
        this._model = pModel;
        this.model = this._model.getUID();

        this._model.controls.map( x => {
            this._indexModel(this._model.getID(), x);
        });
    }

    getControl(pControlName:string):Control {
        return this.indexControls[pControlName];
    }

    getControlAssessment(pControlName:string):ControlAssessment {
        return this.indexAssessments[pControlName];
    }

    exportAsJson():any {
        const o:any = this.toJsonObject();
        delete o.primaryAssets;
        delete o.secondaryAssets;
        delete o.globalThreats;
        delete o.assets;

        if(this._model != null){
            o.name = this._model.name;
        }


        return o;
    }

    static fromJsonObject(pData:any):AssuranceReport {
        const a = new AssuranceReport(pData);

        return a;
    }
}