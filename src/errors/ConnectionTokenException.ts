import {ErrorCode, MonitoredError} from "./MonitoredError";

export class ConnectionTokenException extends MonitoredError {

    static EXPIRED_TOKEN = ()=>{
        return new ConnectionTokenException("The connection token is expired.",
            ErrorCode.REMOTE_DEXCALIBUR + 201) };

    static EMPTY_TOKEN = ()=>{
        return new ConnectionTokenException("The connection token is empty",
            ErrorCode.REMOTE_DEXCALIBUR + 202) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('REMOTE CONNECTION TOKEN', pMsg, pCode, pExtra);
    }
}