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