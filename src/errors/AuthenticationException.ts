import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {AuthModule} from "../user/auth/AuthModule.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";

export class AuthenticationException extends MonitoredError {

    static AUTHENTICATION_FAILED = ()=>{
        return new AuthenticationException("Authentication failed",
            ErrorCode.AUTH + 201) };

    static ACCOUNT_LOCKED = ()=>{
        return new AuthenticationException("Authentication failed because account is locked",
            ErrorCode.AUTH + 202) };

    static MIGRATION_ERROR = (err)=>{
        return new AuthenticationException("Migration from old user db format to newest failed. Cause :"+err.message+"\n"+err.stack,
            ErrorCode.AUTH + 203) };

    static AUTH_MODULE_DEPLOY_FAILURE = (pAuthM:AuthModule, pOrg:OrganizationUnit)=>{
        return new AuthenticationException(`Auth module [mod=${pAuthM.getUID()}] from [org=${pOrg.getUID()}] cannot be deployed.`,
            ErrorCode.AUTH + 204).zone(SecurityZone.PRIVATE) };

    /*static AUTH_MODULE_DEPLOY_FAILURE = (err)=>{
        return new AuthenticationException("Migration from old user db format to newest failed. Cause :"+err.message+"\n"+err.stack,
            ErrorCode.AUTH + 205) };*/


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AUTHENTICATION', pMsg, pCode, pExtra);
    }
}