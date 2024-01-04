import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class EngineDatabaseException extends MonitoredError {

    code:number;
    extra:any;

    static CODE = {
        UNKNOWN_COLLECTION: ErrorCode.GENERIC + 20,
        SAVE_OPE_NOT_SUPPORTED: ErrorCode.GENERIC + 21,
        UPDATE_FAILED_FOR: ErrorCode.GENERIC + 22,
        UNKNOWN_PROJECT: ErrorCode.GENERIC + 24
    }

    static UNKNOWN_COLLECTION = (pName:string)=>{
        return new EngineDatabaseException("Following collection is missing in Engine DB :"+pName,
            ErrorCode.GENERIC + 20) };


    static UNKNOWN_PROJECT = (pName:string)=>{
        return new EngineDatabaseException("Following project is missing in Engine DB :"+pName,
            ErrorCode.GENERIC + 24) };

    static SAVE_OPE_NOT_SUPPORTED = (pName:string)=>{
        return new EngineDatabaseException("The 'save' operation is not supported for object '"+pName+"'",
            ErrorCode.GENERIC + 21) };

    static UPDATE_FAILED_FOR = (pName:string,pUID:string)=>{
        return new EngineDatabaseException(`The 'update' operation failed for object [type=${pName}][uid=${pUID}]`,
            ErrorCode.GENERIC + 22) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ENGINE DB', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}