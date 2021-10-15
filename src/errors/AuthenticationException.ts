import {ErrorCode, MonitoredError} from "./MonitoredError";

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

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('AUTHENTICATION', pMsg, pCode, pExtra);
    }
}