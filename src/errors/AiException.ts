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
import {AnalyzerErrCode} from "./AnalyzerException.js";

export class AiException extends MonitoredError {


    static MCP_ROUTE_MISSING_PARAM_SCHEMA = (pName:string, pTool:string, pUri:string )=>{
        return new AiException("Missing schemaDoc or schema for parameter ["+pName+`] of MCP tool [${pTool}] at ${pUri}`,
            ErrorCode.AI + 1) };

    static MCP_ROUTE_MISSING_RESP_SCHEMA = (pRespN:number, pTool:string )=>{
        return new AiException("Missing schemaDoc or schema for response ["+pRespN+`] of MCP tool [${pTool}]`,
            ErrorCode.AI + 2) };

    static MCP_UNKNOW_COMP = (pFqcn:string)=>{
        return new AiException("The component '"+pFqcn+"' is not unknown.",
            ErrorCode.AI + 10) };

    static MCP_UNKNOW_COMP_PPT = (pFqcn:string, pPpt:string)=>{
        return new AiException("The property '"+pPpt+"' from component '"+pFqcn+"' is unknown.",
            ErrorCode.AI + 11) };

    static MCP_MISSING_CMP_SCHEMA = (pFqcn:string, pPpt?:string)=>{
        return new AiException(`The schema of ${pPpt? 'the property "'+pPpt+'" from "'+pFqcn : 'the component "'+pFqcn+'"' } is unknown.`,
            ErrorCode.AI + 12) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AI', pMsg, pCode, pExtra);
    }
}