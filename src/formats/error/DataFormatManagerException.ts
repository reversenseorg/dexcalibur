import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";

export class DataFormatManagerException extends MonitoredError {

    code:number;
    extra:any;

    static CODE = {
        NOT_IMPLEMENTED: ErrorCode.GENERIC + 50,
        NOT_PARSABLE: ErrorCode.GENERIC + 51,
        INVALID_MAPPING: ErrorCode.GENERIC + 52
    }

    static NOT_PARSABLE = (pFormat:string)=>{
        return new DataFormatManagerException(
            "Data format cannot be parsed : "+pFormat,
            DataFormatManagerException.CODE.NOT_PARSABLE)
    };

    static NOT_IMPLEMENTED = (pFeature:string)=>{
        return new DataFormatManagerException(
            "Feature not implemented : "+pFeature,
            DataFormatManagerException.CODE.NOT_IMPLEMENTED)
    };


    static INVALID_MAPPING = (pType:string)=>{
        return new DataFormatManagerException(
            "Parser cannot be retrieved from : "+pType,
            DataFormatManagerException.CODE.INVALID_MAPPING)
    };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('DATA_FMT_MGR', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}