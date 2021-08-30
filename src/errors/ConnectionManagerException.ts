import {ErrorCode, MonitoredError} from "./MonitoredError";

export class ConnectionManagerException extends MonitoredError {

    static EMPTY_CONN_PARAMS = ()=>{
        return new ConnectionManagerException("The connection params are not provided.",
            ErrorCode.REMOTE_DEXCALIBUR + 301) };

    static EMPTY_CREDS = ()=>{
        return new ConnectionManagerException("The credentials are not provided",
            ErrorCode.REMOTE_DEXCALIBUR + 302) };

    static AUTH_TYPE_UNSUPPORTED = ()=>{
        return new ConnectionManagerException("This authentication type is not supported by remote server.",
            ErrorCode.REMOTE_DEXCALIBUR + 303) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('REMOTE CONNECTION MGR', pMsg, pCode, pExtra);
    }
}