import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {HookErrCode} from "./HookManagerException.js";


export class HookMessageException extends MonitoredError {

    static ERR = {
        MISSING_HOOK_ID: ErrorCode.HOOK_MANAGER + HookErrCode.MESSAGE + 1,
        MISSING_FRAG_ID: ErrorCode.HOOK_MANAGER + HookErrCode.MESSAGE + 2,
        INVALID_DATA: ErrorCode.HOOK_MANAGER + HookErrCode.MESSAGE + 3,
    };

    static MISSING_HOOK_ID = ()=>{ return new HookMessageException(`The hook ID is missing`,HookMessageException.ERR.MISSING_HOOK_ID) };
    static MISSING_FRAG_ID = ()=>{ return new HookMessageException(`The fragment ID is missing `,HookMessageException.ERR.MISSING_FRAG_ID) };
    static INVALID_DATA = ()=>{ return new HookMessageException(`Data format is invalid. `,HookMessageException.ERR.INVALID_DATA) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('HOOK MESSAGE', pMsg, pCode, pExtra);
    }
}