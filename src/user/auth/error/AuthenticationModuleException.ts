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

import {AuthModule} from "../AuthModule.js";
import {OrganizationUnit} from "../../../organization/OrganizationUnit.js";
import {ErrorCode, MonitoredError} from "../../../errors/MonitoredError.js";
import {SecurityZone} from "../../../security/SecurityZone.js";


export class AuthenticationModuleException extends MonitoredError {


    static AUTH_MODULE_DEPLOY_FAILURE = (pAuthM:AuthModule, pOrg:OrganizationUnit)=>{
        return new AuthenticationModuleException(`Auth module [mod=${pAuthM.getUID()}] from [org=${pOrg.getUID()}] cannot be deployed.`,
            ErrorCode.AUTH + 304).zone(SecurityZone.PRIVATE) };

    static MODULE_NOT_SUPPORTED = (pAuthM:AuthModule, pOrg:OrganizationUnit)=>{
        return new AuthenticationModuleException(`Auth module type [type=${pAuthM.type}] in [org=${pOrg.getUID()}][mod=${pAuthM.getUID()}] is not supported.`,
            ErrorCode.AUTH + 305).zone(SecurityZone.PRIVATE) };

    static MODULE_NOT_ACTIVE = (pAuthM:AuthModule, pOrg:OrganizationUnit)=>{
        return new AuthenticationModuleException(`Auth module [mod=${pAuthM.getUID()}]  in [org=${pOrg.getUID()}] cannot be deployed : the module is disabled`,
            ErrorCode.AUTH + 306).zone(SecurityZone.PRIVATE) };

    static INVALID_STATE_UUID = (pAuthM:AuthModule)=>{
        return new AuthenticationModuleException(`Loaded auth module [mod=${pAuthM.getUID()}] as invalid strategy UUID`,
            ErrorCode.AUTH + 307).zone(SecurityZone.PRIVATE) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AUTH MODULE', pMsg, pCode, pExtra);
    }
}