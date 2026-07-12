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
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {AuthModuleType} from "../user/auth/AuthModule.js";
import {UserGroupUUID} from "../user/acl/common/UserGroup.js";
import {UserAccountUUID} from "../user/UserAccount.js";
import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {RoleUUID} from "../user/acl/common/Role.js";
import {ConnectionUUID} from "../organization/conn/Connection.js";
import {SecretUUID} from "../core/secrets/Secret.js";
import {DeviceUUID} from "../Device.js";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {ApplicationUnitUUID} from "../organization/ApplicationUnit.js";
import {SecurityZone} from "../security/SecurityZone.js";


export class ProjectSchedulerException extends MonitoredError {

    static CANNOT_VERIFY_ORG_BALANCE = (pOUID:OrganizationUnitUUID)=>{
        return new ProjectSchedulerException("Missing organization UUID [uuid="+pOUID+"]",
            ErrorCode.PROJ_SCHED + 1) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('PROJECT SCHED', pMsg, pCode, pExtra);
    }

}