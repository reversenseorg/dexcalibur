import {ErrorCode, MonitoredError} from "./MonitoredError";
import {AnalyzerErrCode} from "./AnalyzerException";

export class AbiException extends MonitoredError {


    static UNKNOW_ABI = (pABI:string)=>{
        return new AbiException("The ABI '"+pABI+"' is not supported. Please, fill an issue.",
            ErrorCode.ANALYZER + AnalyzerErrCode.NATIV + 1) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ABI', pMsg, pCode, pExtra);
    }
}