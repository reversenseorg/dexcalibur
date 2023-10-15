import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class DevException extends MonitoredError {


    static DEPRECATED = (pMessage:string)=>{
        return new DevException("DEPRECATED : "+pMessage,
            ErrorCode.DEV_MODE + 1) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DEVMODE EXCEPTION', pMsg, pCode, pExtra);
    }
}