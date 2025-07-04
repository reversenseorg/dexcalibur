import {MonitoredError} from "@dexcalibur/dexcalibur-orm";
import {ErrorCode} from "../../errors/MonitoredError.js";


export class R2Exception extends MonitoredError {


    static CANNOT_OPEN = (pMsg:string)=>{
        return new R2Exception("Radare2 cannot be started. ",
            ErrorCode.ANALYZER_NATIV_R2 + 1) };

    static INVALID_REMOTE_URI = (pURI:string)=>{
        return new R2Exception("The remote URI is invalid",
            ErrorCode.ANALYZER_NATIV_R2 + 2) };


    static STOPPED = (pName:string, pCMD:string)=>{
        return new R2Exception(`Cannot execute command because instance is stopped.`,
            ErrorCode.ANALYZER_NATIV_R2 + 3, {
                instance: pName,
                cmd: pCMD
            }) };

    static CMD_STOPPED = (pName:string, pCMD:string)=>{
        return new R2Exception(`Cannot execute command because instance is stopped.`,
            ErrorCode.ANALYZER_NATIV_R2 + 4, {
                instance: pName,
                cmd: pCMD
            }) };

    static REMOTE_OPTS_NOT_CONFIGURED = (pName:string)=>{
        return new R2Exception(`Remote options are not configure.`,
            ErrorCode.ANALYZER_NATIV_R2 + 5, {
                instance: pName
            }) };



    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('R2', pMsg, pCode, pExtra);
    }
}