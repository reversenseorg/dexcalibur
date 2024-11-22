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