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

import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";
import {AnalyzerErrCode} from "../../errors/AnalyzerException.js";
import {NodeType} from "@reversense/dexcalibur-orm";
import {NodeInternalType} from "@reversense/dxc-core-api";


export class MerlinSearchRequestException extends MonitoredError {

    static ERR = {
        MISSING_NODE_TYPE: ErrorCode.ANALYZER_SEARCH + 1,
        MISSING_INVALID_PPT: ErrorCode.ANALYZER_SEARCH + 2,
        INVALID_PATTERN_NO_FIELD: ErrorCode.ANALYZER_SEARCH + 3,
        NODE_NOT_FOUND: ErrorCode.ANALYZER_SEARCH + 4
    };

    static MISSING_NODE_TYPE = (pStr:string)=>{ return new MerlinSearchRequestException(`The node type cannot be retrieved from node name : ${pStr}`,MerlinSearchRequestException.ERR.MISSING_NODE_TYPE) };

    static INVALID_NODE_PPT = (pName:string,pNode:NodeType)=>{
        return new MerlinSearchRequestException(`The property not exists in this node type`,
            MerlinSearchRequestException.ERR.MISSING_INVALID_PPT, {type:pNode.getType(), ppt:pName}) };


    static INVALID_PATTERN_NO_FIELD = (pPattern:string)=>{
        return new MerlinSearchRequestException(`Invalid search pattern : field is mandatory bu empty`,
            MerlinSearchRequestException.ERR.INVALID_PATTERN_NO_FIELD, {pattern:pPattern}) };

    static NODE_NOT_FOUND = (pType:NodeInternalType, pID:string)=>{
        return new MerlinSearchRequestException(`${NodeType.getByID(pType).getName()} node found.`,
            MerlinSearchRequestException.ERR.NODE_NOT_FOUND, {type:pType, id:pID})
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('MERLIN SEARCH REQUEST', pMsg, pCode, pExtra);
    }
}