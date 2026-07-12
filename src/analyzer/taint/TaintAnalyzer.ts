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

import DexcaliburProject from "../../DexcaliburProject.js";
import ModelInstruction from "../../ModelInstruction.js";
import {TaintCase} from "./TaintCase.js";
import {INode} from "@dexcalibur/dexcalibur-orm";
import ModelField from "../../ModelField.js";
import {CONST} from "../../CoreConst.js";
import {FinderResult} from "../../search/FinderResult.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import ModelCall from "../../ModelCall.js";


export class TaintAnalyzer {

    ctx:DexcaliburProject;

    constructor(pOptions:any) {
        this.ctx = pOptions.ctx;
    }

    /**
     *
     * @param pInst
     */
    createSessionsFromInstruction(pInst:ModelInstruction):Promise<TaintCase> {
        return Promise.resolve(null);
    }


    /**
     *
     * @param pNode
     * @param pFilterOpType
     */
    createSessionsFromNode(pName:string, pNode:INode, pFilterOpType:number):Promise<TaintCase[]> {
        // if from field, search reader
        if(ModelField.TYPE.is(pNode)){

            let res:Nullable<FinderResult> = null;
            let sessions:TaintCase[] = [];
            // search taint source according to pFilterOpType
            switch (pFilterOpType) {
                case CONST.INSTR_TYPE.SETTER:
                    res = this.ctx.find.calls.setter("calleed.__signature__:"+pNode.getUID());
                    break;
                case CONST.INSTR_TYPE.GETTER:
                    res = this.ctx.find.calls.getter("calleed.__signature__:"+pNode.getUID());
                    break;
            }

            if(res!=null && res!=undefined){
                res.foreach((vCall:ModelCall)=> {
                    sessions.push(new TaintCase({
                        ctx: this.ctx,
                        name: pName+"-"+sessions.length,
                        source: {
                            source: vCall.caller,
                            location: vCall.instr
                        },
                        sinks: []
                    }));
                });
            }

            return Promise.resolve(sessions);
        }

        return Promise.resolve([]);

    }
}