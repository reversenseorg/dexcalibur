import {ErrorCode, MonitoredError} from "../../errors/MonitoredError.js";


export enum SessionCode {
    NONE,
    EXPIRED,
    DESTROYED,
    INVALID_ACCOUNT,
    ACCOUNT_LOCKED,
    EMPTY_SESSID,
    INVALID_SESSID,
    NO_SESSION_FOUND
}



export class SessionException extends MonitoredError {



    _c:SessionCode = SessionCode.NONE

    static INVALID_SESSION = ()=>{ return new SessionException("Session is invalid", ErrorCode.AUTH + 101) };
    static EXPIRED_SESSION = ()=>{ return new SessionException("Session is expired", ErrorCode.AUTH + 102) };
    static NO_ACTIVE_PROJECT = ()=>{ return new SessionException("This session has not active project", ErrorCode.AUTH + 103) };
    static MULTIPLE_ACTIVE_PROJECT = ()=>{ return new SessionException("This session has multiple active project, please specify.", ErrorCode.AUTH + 104) };
    static INVALID_ACTIVE_PROJECT_UID = (vUID:string = 'unknow')=>{ return new SessionException("This session has not active project with the given UID : "+vUID, ErrorCode.AUTH + 105) };

    constructor(pMsg, pCode:SessionCode = SessionCode.NONE) {
        super('SESSION',pMsg,pCode);
        this._c = pCode;
    }

    /**
     * To get auth code
     */
    getCode():SessionCode {
        return this._c;
    }
}