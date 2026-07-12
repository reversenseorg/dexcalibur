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

import DataProperty from "./DataProperty.js";
import Constraint, {ConstraintType} from "./Constraint.js";
import CodeConstraint from "./CodeConstraint.js";
import AssuranceModel from "./AssuranceModel.js";
import Asset from "./Asset.js";
import {CoreDebug} from "../../core/CoreDebug.js";

export interface ThreatOptions {
    id?:string;
    uid?:string ;
    name?:string;
    description?:string;
    refs?:string[];
    property?:DataProperty;
    signature?:Constraint[];
}
/**
 *
 */
export default class Threat extends Asset{

    uid:string ;
    property:DataProperty;
    signature:Constraint[] = [];

    refs:string[] = [];

    _codeBased = false;

    constructor( pConfig:any = null) {
        super(pConfig);
        
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    appendSignature(pConstraint:Constraint):void{
        if(pConstraint.type===ConstraintType.CODE){
            this._codeBased = true;
        }

        this.signature.push(pConstraint);
    }

    isCodeCheckable():boolean {
        return this._codeBased;
    }

    toJsonObject(pExclude:string[] = []):any{
        const o:any = {};
        for(let i in this){
            if(pExclude.indexOf(i)>-1) continue;

            switch (i){
                case "signature":
                    o.signature = [];
                    this.signature.map(x => {
                        o.signature.push(x.toJsonObject());
                    })
                    break;
                case "id":
                case "uid":
                case "name":
                case "description":
                case "refs":
                case "_codeBased":
                    o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "Threat");
        return o;
    }
}