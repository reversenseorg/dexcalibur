import {ErrorCode, MonitoredError} from "../MonitoredError.js";
import {AnalyzerErrCode} from "../AnalyzerException.js";

export enum AndroidErrorCode {
    GENERIC=100,
    ACTIVITY=200,
    PROVIDER=300,
    SERVICE=400,
    RECEIVER=500,
    APP=600,
    COMP=700
}

export class AndroidComponentException extends MonitoredError {

    static UNDEFINED_ATTR = (pAttr:string)=>{
        return new AndroidComponentException(`The attribute [${pAttr}] is not defined.`,
            ErrorCode.ANALYZER_APP + AndroidErrorCode.COMP + 1) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ANDROID CMP', pMsg, pCode, pExtra);
    }
}