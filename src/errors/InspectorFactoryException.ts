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


export enum InspectorFactoryError {
    GENERIC = 100,
    HOOKSET = 200  ,
    STRATEGY=300 ,
    EVENT=400 ,
}

export class InspectorFactoryException extends MonitoredError {

    static ERR = {
        HOOKSET_CANNOT_BE_CREATED: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.HOOKSET+ 1,
        HOOKSET_CANNOT_BE_RESTORED: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.HOOKSET+ 2,
        INSPECTOR_NOT_FOUND: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.GENERIC+ 1,
        STRATEGY_NAME_IS_MANDATORY: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.STRATEGY+ 2,
        DUPLICATED_HOOK_STRATEGY: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.STRATEGY+ 3,
        INSPECTOR_NOT_FOUND_SERVER_SIDE: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.GENERIC+ 2,
        INSPECTOR_NOT_FOUND_PROJECT_SIDE: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.GENERIC+ 3,
    };

    static HOOKSET_CANNOT_BE_CREATED = (uid)=>{ return new InspectorFactoryException(" Hookset cannot be created : "+uid,InspectorFactoryException.ERR.HOOKSET_CANNOT_BE_CREATED) };
    static STRATEGY_NAME_IS_MANDATORY = (uid)=>{ return new InspectorFactoryException(" Strategy name is mandatory. Inspector : "+uid,InspectorFactoryException.ERR.STRATEGY_NAME_IS_MANDATORY) };
    static INSPECTOR_NOT_FOUND = (uid)=>{ return new InspectorFactoryException(" Inspector not found : "+uid,InspectorFactoryException.ERR.INSPECTOR_NOT_FOUND) };
    static INSPECTOR_NOT_FOUND_SERVER_SIDE = (uid:string)=>{ return new InspectorFactoryException(" Inspector not found server side : "+uid,InspectorFactoryException.ERR.INSPECTOR_NOT_FOUND_SERVER_SIDE) };
    static INSPECTOR_NOT_FOUND_PROJECT_SIDE = (uid:string)=>{ return new InspectorFactoryException(" Inspector not found project side: "+uid,InspectorFactoryException.ERR.INSPECTOR_NOT_FOUND_PROJECT_SIDE) };


    static DUPLICATED_HOOK_STRATEGY = (uid)=>{ return new InspectorFactoryException("There is more than a single Strategy with this name : "+uid,InspectorFactoryException.ERR.DUPLICATED_HOOK_STRATEGY) };
    static HOOKSET_CANNOT_BE_RESTORED = (uid)=>{ return new InspectorFactoryException(" Hookset cannot be restored, because it is not found : "+uid,InspectorFactoryException.ERR.HOOKSET_CANNOT_BE_RESTORED) };



    DUPLICATED_HOOK_STRATEGY
    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('INSPECTOR FACTORY', pMsg, pCode, pExtra);
    }
}