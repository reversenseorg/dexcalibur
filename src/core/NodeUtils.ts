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

import {INode, JSONSchemaValidator, NodeProperty, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "./IStringIndex.js";

const validator = new JSONSchemaValidator();

export class NodeUtils {

    private constructor() {
    }

    /**
     * To prepare one or more node instance to be serialized
     *
     * @param pNodes
     * @param pOptions
     */
    static toJsonObject(pNodes:INode[]|INode, pOptions:Nullable<SerializeOptions> = null):any[] {
        if(pNodes==null) return null;

        if(Array.isArray(pNodes)){
            const o:any[] = [];
            pNodes.map(x => o.push(x.toJsonObject()));
            return o;
        }else{
            return pNodes.toJsonObject(pOptions);
        }
    }

    static validateProperty(pProp:NodeProperty, pValue:any):boolean{
        return validator.validate(pValue, pProp.toJSONSchemaDoc()).valid;
    }
}