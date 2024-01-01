import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class EngineDatabaseException extends MonitoredError {

    code:number;
    extra:any;

    static CODE = {
        UNKNOWN_COLLECTION: ErrorCode.GENERIC + 20,
        UNKNOWN_PROJECT: ErrorCode.GENERIC + 21
    }

    static UNKNOWN_COLLECTION = (pName:string)=>{
        return new EngineDatabaseException("Following collection is missing in Engine DB :"+pName,
            ErrorCode.GENERIC + 20) };


    static UNKNOWN_PROJECT = (pName:string)=>{
        return new EngineDatabaseException("Following project is missing in Engine DB :"+pName,
            ErrorCode.GENERIC + 21) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ENGINE DB', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}