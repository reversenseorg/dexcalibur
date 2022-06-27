import {ErrorCode, MonitoredError} from "./MonitoredError";


export class KeyPointException extends MonitoredError {

    static ERR = {
        INVALID_KP: ErrorCode.KP_MANAGER + 201,
    };

    static INVALID_KP = (pName:string)=>{ return new KeyPointException(` The template of the keypoint [uid= ${pName} ] is empty. `,KeyPointException.ERR.INVALID_KP) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('KEY POINT', pMsg, pCode, pExtra);
    }
}