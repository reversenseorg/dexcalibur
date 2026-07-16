
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

import Threat, {ThreatOptions} from "./Threat.js";
import CodeConstraint from "./CodeConstraint.js";
import Constraint from "./Constraint.js";
import {NodeInternalType} from "@reversense/dxc-core-api";;
import {CoreDebug} from "../../core/CoreDebug.js";


export interface CodeConstraintMap {
    [nodeType:number] :CodeConstraint[]
}

export interface CodeThreatOptions extends ThreatOptions {
    signature?:CodeConstraint[];

}

export default class CodeThreat extends Threat {

    signature:CodeConstraint[] = [];

    private _cmap:CodeConstraintMap = {};

    constructor( pConfig:CodeThreatOptions = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    appendSignature(pConstraint:CodeConstraint):void {
        super.appendSignature(pConstraint);

        // update mapping
        if(this._cmap[pConstraint.node]==null){
            this._cmap[pConstraint.node] = [];
        }

        this._cmap[pConstraint.node].push(pConstraint);
    }

    listPerNodeType():CodeConstraintMap {
        return this._cmap;
    }

    listByNodeType(pNodeType:NodeInternalType):CodeConstraint[] {
        return this._cmap[pNodeType];
    }

    toJsonObject(): any {
        const o = super.toJsonObject(["signature"]);
        o.signature=[];
        this.signature.map(x => {
            o.signature.push(x.toJsonObject());
        });
        CoreDebug.checkJsonSerialize(o, "CodeThreat");
        return o;
    }
}