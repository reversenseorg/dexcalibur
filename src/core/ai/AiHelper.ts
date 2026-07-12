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

import {IJSONSchema} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {AiException} from "../../errors/AiException.js";

export interface AiBasicInfo {
    name:string,
    descr:string
}

export interface AiPropertyInfo extends AiBasicInfo{
    default?:any,
    schema?:IJSONSchema
}

export interface AiCmpInfo extends AiBasicInfo {
    fqcn:string,
    properties: AiPropertyInfo[],
}


let gInst:Nullable<AiHelper> = null;


export default class AiHelper {

    private _cmp:Record<string, AiCmpInfo> = {};

    private constructor(){}

    getJsonSchemaOf(pFqcn:string, pProperty?:string):IJSONSchema {
        const cmp = this._cmp[pFqcn];
        if(cmp==null){
            throw AiException.MCP_UNKNOW_COMP(pFqcn)
        }

        if(pProperty!=null){
            const p = cmp.properties.find(x => x.name==pProperty);
            if(p==null){
                throw AiException.MCP_UNKNOW_COMP_PPT(pFqcn,pProperty);
            }
            if(p.schema==null){
                throw AiException.MCP_MISSING_CMP_SCHEMA(pFqcn,pProperty);
            }

            return p.schema;
        }

        const sch:IJSONSchema = { type:"object", properties: {}};

        for(let p of this._cmp[pFqcn].properties){
            if(p.schema==null) continue;
            sch.properties[p.name] = p.schema;
        }

        return sch;
    }

    getInfo(pFqcn:string):AiCmpInfo {
        const cmp = this._cmp[pFqcn];
        if (cmp == null) {
            throw AiException.MCP_UNKNOW_COMP(pFqcn)
        }
        return cmp;
    }

    registerExtraComponent(pComp:AiCmpInfo):AiCmpInfo {
        this._cmp[pComp.fqcn] = pComp;

        return pComp;
    }

    static getInstance():AiHelper {
        if(gInst==null) gInst = new AiHelper();

        return gInst;
    }
}

gInst = AiHelper.getInstance();

