import {ErrorCode, MonitoredError} from "./MonitoredError.js";

export class PackageAnalyzerException extends MonitoredError {

    code:number;
    extra:any;

    static ALL = {};

    static MAIN_INPUT_NOT_FOUND = ()=>{ return new PackageAnalyzerException("The main input cannot be found.", ErrorCode.ANALYZER_PKG + 101) };
    static EXTRA_INPUTS_NOT_FOUND = ()=>{ return new PackageAnalyzerException("The extra inputs cannot be found.", ErrorCode.ANALYZER_PKG + 102) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('PACKAGE ANALYZER', pMsg);
        this.code = pCode;
        this.extra = pExtra;
    }
}