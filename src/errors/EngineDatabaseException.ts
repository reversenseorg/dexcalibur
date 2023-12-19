import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class EngineDatabaseException extends MonitoredError {

    code:number;
    extra:any;

    static UNKNOWN_COLLECTION = (pName:string)=>{
        return new EngineDatabaseException("Following collection is missing in Engine DB :"+pName,
            ErrorCode.GENERIC + 20) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ENGINE DB', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}