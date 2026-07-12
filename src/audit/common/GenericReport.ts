/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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