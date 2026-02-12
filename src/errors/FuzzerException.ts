import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {SecurityZone} from "../security/SecurityZone.js";


export enum FuzzErrCode {
    GENERIC=100,
    HOST=200,
    DEV=300
}

export class FuzzerException extends MonitoredError {

    static ERR = {
        MISSING_SESSID: ErrorCode.FUZZ_MANAGER + FuzzErrCode.HOST + 1,
        MISSING_CASEID: ErrorCode.FUZZ_MANAGER + FuzzErrCode.HOST + 2,
        MASTER_CANNOT_RUN: ErrorCode.FUZZ_MANAGER + FuzzErrCode.HOST + 3
    };

    _zone = SecurityZone.PRIVATE;

    static MISSING_SESSID = ()=>{
        return new FuzzerException(" Missing Fuzzer session UID",
            FuzzerException.ERR.MISSING_SESSID).zone(SecurityZone.PUBLIC) };
    static MISSING_CASEID = ()=>{
        return new FuzzerException(" Missing Test case UID",
            FuzzerException.ERR.MISSING_CASEID).zone(SecurityZone.PUBLIC) };
    static MASTER_CANNOT_RUN = (pMsg:string)=>{
        return new FuzzerException(" Master node cannot run fuzzer : "+pMsg,
            FuzzerException.ERR.MASTER_CANNOT_RUN) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('FUZZER', pMsg, pCode, pExtra);
    }
}