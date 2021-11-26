import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";



export class KeyPointManagerException extends MonitoredError {

    static ERR = {
        INVALID_DB: ErrorCode.KP_MANAGER + 101,
    };

    static INVALID_DB = ()=>{ return new KeyPointManagerException(" The database cannot be null",KeyPointManagerException.ERR.INVALID_DB) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('KEY POINT MANAGER', pMsg, pCode, pExtra);
    }
}