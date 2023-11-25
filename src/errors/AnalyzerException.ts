import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {NodeInternalType} from "../NodeInternalType.js";

export enum AnalyzerErrCode {
    GENERIC=1000,
    JAVA=2000,
    OBJC=3000,
    NATIV=4000,
    SCRIPT=5000,
    ANDROID_APP=6000,
    IOS_APP=7000,
    BIN_APP=8000,
    SEARCH=9000
}

export class AnalyzerException extends MonitoredError {


    static UNKNOW_ANAL = (pABI:string)=>{
        return new AnalyzerException("The ABI '"+pABI+"' is not supported. Please, fill an issue.",
            ErrorCode.ANALYZER_NATIV + 201) };

    static ANDROID_SEARCH_SPLITTED_DEV_FAIL = ()=>{
        return new AnalyzerException("Android Package Analyzer : Splitted APK cannot be search because device is offline or unknow",
            ErrorCode.ANALYZER_NATIV + 202) };

    static MISSING_DATA_SET = (pNodeType:string|NodeInternalType)=>{
        return new AnalyzerException("Data set missing for node type : "+pNodeType,
            ErrorCode.ANALYZER_NATIV + 203) };

    static PLATFORM_NOT_SUPPORTED = (pOS:string)=>{
        return new AnalyzerException("The platform is not supported, app cannot be analyzed : "+pOS,
            ErrorCode.ANALYZER_NATIV + 204) };
    static EXTRACT_NOT_SUPPORTED = (pType:string, pOS:string)=>{
        return new AnalyzerException("The targeted app has not extractor [type="+pType+"][os="+pOS+"]",
            ErrorCode.ANALYZER_NATIV + 205) };




    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('GENERIC ANALYZER', pMsg, pCode, pExtra);
    }
}