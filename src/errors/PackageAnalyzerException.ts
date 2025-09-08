import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class PackageAnalyzerException extends MonitoredError {


    static ALL = {};

    static MAIN_INPUT_NOT_FOUND = ()=>{
        return new PackageAnalyzerException("The main input cannot be found.", ErrorCode.ANALYZER_PKG + 101) };
    static EXTRA_INPUTS_NOT_FOUND = ()=>{
        return new PackageAnalyzerException("The extra inputs cannot be found.", ErrorCode.ANALYZER_PKG + 102) };
    static CANNOT_EXTRACT_APP = (pOs:string,pApp:string)=>{
        return new PackageAnalyzerException(
            "The application cannot be extracted.",
            ErrorCode.ANALYZER_PKG + 103,{
                os: pOs,
                app: pApp
            }) };
    static CANNOT_EXTRACT_VER = (pOs:string,pExtra:any)=>{
        return new PackageAnalyzerException(
            "The version cannot be extracted from package.",
            ErrorCode.ANALYZER_PKG + 104,{
                os: pOs,
                extra: pExtra
            }) };
    static CANNOT_EXTRACT_PKGID = (pOs:string,pExtra:any)=>{
        return new PackageAnalyzerException(
            "The package identifier cannot be extracted from package.",
            ErrorCode.ANALYZER_PKG + 105,{
                os: pOs,
                extra: pExtra
            }) };

    static CANNOT_EXTRACT_NAME = (pOs:string,pExtra:any)=>{
        return new PackageAnalyzerException(
            "The app name cannot be extracted from package.",
            ErrorCode.ANALYZER_PKG + 106,{
                os: pOs,
                extra: pExtra
            }) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('PACKAGE ANALYZER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}