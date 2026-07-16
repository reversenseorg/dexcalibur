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

import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {NodeInternalTypeName}
from "@reversense/dxc-core-api";;
import {INode} from "../INode.js";



export class KeyPointManagerException extends MonitoredError {

    static ERR = {
        INVALID_DB: ErrorCode.KP_MANAGER + 101,
        UNKNOW_KEYPOINT: ErrorCode.KP_MANAGER + 102,
        INVALID_KEYPOINT_PPT: ErrorCode.KP_MANAGER + 103,
        INVALID_TARGET_NODE: ErrorCode.KP_MANAGER + 104,
        UNKNOW_TOKEN: ErrorCode.KP_MANAGER + 105,
        GENERATOR_ERROR_NO_NODE: ErrorCode.KP_MANAGER + 106,
        GENERATOR_ERROR_NODE_NOT_FOUND: ErrorCode.KP_MANAGER + 107,
        MULTIPLE_TARGET_NOT_SUPPORTED: ErrorCode.KP_MANAGER + 108,
        CONDITION_NOT_SUPPORTED: ErrorCode.KP_MANAGER + 109
    };

    static INVALID_DB = ()=>{ return new KeyPointManagerException(" The database cannot be null",KeyPointManagerException.ERR.INVALID_DB) };
    static UNKNOW_KEYPOINT = (uid)=>{ return new KeyPointManagerException(" There is not key point with UID : "+uid,KeyPointManagerException.ERR.UNKNOW_KEYPOINT) };
    static INVALID_KEYPOINT_PPT = (ppt)=>{ return new KeyPointManagerException(" The key point has not property : "+ppt,KeyPointManagerException.ERR.UNKNOW_KEYPOINT) };
    static INVALID_TARGET_NODE = (node:INode)=>{ return new KeyPointManagerException(" The target of the key point is not found : type="+NodeInternalTypeName[node.__]+", uid="+node.getUID(),KeyPointManagerException.ERR.INVALID_TARGET_NODE) };
    static UNKNOW_TOKEN = (token)=>{ return new KeyPointManagerException(" No key points found by token : token="+token,KeyPointManagerException.ERR.UNKNOW_TOKEN) };
    static GENERATOR_ERROR_NO_NODE = (name)=>{ return new KeyPointManagerException(" [KEY POINT GENERATOR]  Code of Key Point cannot be generated, no node specified : keypoint="+name,KeyPointManagerException.ERR.GENERATOR_ERROR_NO_NODE) };
    static GENERATOR_ERROR_NODE_NOT_FOUND = (type,uid)=>{ return new KeyPointManagerException(" [KEY POINT GENERATOR]  Node associated to the target cannot be found (type="+type+", uid="+uid+")",KeyPointManagerException.ERR.GENERATOR_ERROR_NODE_NOT_FOUND) };
    static MULTIPLE_TARGET_NOT_SUPPORTED = ()=>{ return new KeyPointManagerException(" Single KeyPoint with multiple targets are not supported. Fill a ticket if you need it.",KeyPointManagerException.ERR.MULTIPLE_TARGET_NOT_SUPPORTED) };
    static CONDITION_NOT_SUPPORTED = (type:string)=>{ return new KeyPointManagerException(" [KEY POINT GENERATOR] Condition type or node type not supported ",KeyPointManagerException.ERR.CONDITION_NOT_SUPPORTED) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('KEY POINT MANAGER', pMsg, pCode, pExtra);
    }
}