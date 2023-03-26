import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {AnalyzerErrCode} from "./AnalyzerException.js";

export class AbiException extends MonitoredError {


    static UNKNOW_ABI = (pABI:string)=>{
        return new AbiException("The ABI '"+pABI+"' is not supported. Please, fill an issue.",
            ErrorCode.ANALYZER + AnalyzerErrCode.NATIV + 1) };


    static UNDETECTABLE_ABI = (pMsg:string)=>{
        return new AbiException("The ABI cannot be detected : "+pMsg,
            ErrorCode.ANALYZER + AnalyzerErrCode.NATIV + 2) };

    static UNDETECTABLE_ISA = (pMsg:string)=>{
        return new AbiException("The ISA cannot be detected from ABI, ABI is unknown : "+pMsg,
            ErrorCode.ANALYZER + AnalyzerErrCode.NATIV + 3) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ABI', pMsg, pCode, pExtra);
    }
}