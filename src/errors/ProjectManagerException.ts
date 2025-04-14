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
import {ProjectOrderUUID} from "../project/ProjectOrder.js";


export class ProjectManagerException extends MonitoredError {

    static ORDER_NOT_FOUND = (pPOUID:ProjectOrderUUID)=>{
        return new ProjectManagerException("Project Order not found  [uuid="+pPOUID+"]",
            ErrorCode.PROJ_MGT + 1) };

    static ORDER_EXEC_FAILED = (pPOUID:ProjectOrderUUID)=>{
        return new ProjectManagerException("Project Order execution failed  [uuid="+pPOUID+"]",
            ErrorCode.PROJ_MGT + 2) };

    static PROJECT_NOT_FOUND = (pPOUID:DexcaliburProjectUUID)=>{
        return new ProjectManagerException("Project not found  [uuid="+pPOUID+"]",
            ErrorCode.PROJ_MGT + 3) };

    static INPUTS_ARE_MANDATORY = (pPOUID:ProjectOrderUUID)=>{
        return new ProjectManagerException("Input files to analyse are mandatory to create a project  [order="+pPOUID+"]",
            ErrorCode.PROJ_MGT + 4) };

    static NO_MORE_RESOURCES = (pPOUID:ProjectOrderUUID)=>{
        return new ProjectManagerException("Cannot open the project because there are no more resources available [project="+pPOUID+"]",
            ErrorCode.PROJ_MGT + 5) };

    static PROJECT_NOT_LOADED = (pPOUID:DexcaliburProjectUUID, pSource = "none")=>{
        return new ProjectManagerException("Project not loaded  [uuid="+pPOUID+`][src=${pSource}]`,
            ErrorCode.PROJ_MGT + 6) };

    static PROJECT_IS_MANDATORY = (pSource = "none")=>{
        return new ProjectManagerException(`Project is mandatory [src=${pSource}]`,
            ErrorCode.PROJ_MGT + 7) };

    static GRID_WS_NOT_READY = (pUID:DexcaliburProjectUUID)=>{
        return new ProjectManagerException("Grid of workspace is not ready",
            ErrorCode.PROJ_MGT + 8, {
                project: pUID
            }).zone(SecurityZone.PRIVATE) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('PROJECT MGT', pMsg, pCode, pExtra);
    }

}