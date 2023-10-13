import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";


export class MerlinUnserializerException extends MonitoredError {

    static ERR = {
        MISSING_OPERATION_TYPE: ErrorCode.ANALYZER_SEARCH + 10,
    };

    static MISSING_OPERATION_TYPE = (pStr:string)=>{ return new MerlinUnserializerException(`The operation type cannot be retrieved from operation name : ${pStr}`,MerlinUnserializerException.ERR.MISSING_OPERATION_TYPE) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('MERLIN UNSERIALIZER', pMsg, pCode, pExtra);
    }
}