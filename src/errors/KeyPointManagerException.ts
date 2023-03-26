import {ErrorCode, MonitoredError} from "./MonitoredError.js";



export class KeyPointManagerException extends MonitoredError {

    static ERR = {
        INVALID_DB: ErrorCode.KP_MANAGER + 101,
        UNKNOW_KEYPOINT: ErrorCode.KP_MANAGER + 102,
        INVALID_KEYPOINT_PPT: ErrorCode.KP_MANAGER + 103,
        INVALID_TARGET_NODE: ErrorCode.KP_MANAGER + 104,
        UNKNOW_TOKEN: ErrorCode.KP_MANAGER + 105,
        GENERATOR_ERROR_NO_NODE: ErrorCode.KP_MANAGER + 106,
        GENERATOR_ERROR_NODE_NOT_FOUND: ErrorCode.KP_MANAGER + 107
    };

    static INVALID_DB = ()=>{ return new KeyPointManagerException(" The database cannot be null",KeyPointManagerException.ERR.INVALID_DB) };
    static UNKNOW_KEYPOINT = (uid)=>{ return new KeyPointManagerException(" There is not key point with UID : "+uid,KeyPointManagerException.ERR.UNKNOW_KEYPOINT) };
    static INVALID_KEYPOINT_PPT = (ppt)=>{ return new KeyPointManagerException(" The key point has not property : "+ppt,KeyPointManagerException.ERR.UNKNOW_KEYPOINT) };
    static INVALID_TARGET_NODE = (ppt,uid)=>{ return new KeyPointManagerException(" The target of the key point is not found : type="+ppt+", uid="+uid,KeyPointManagerException.ERR.INVALID_TARGET_NODE) };
    static UNKNOW_TOKEN = (token)=>{ return new KeyPointManagerException(" No key points found by token : token="+token,KeyPointManagerException.ERR.UNKNOW_TOKEN) };
    static GENERATOR_ERROR_NO_NODE = (name)=>{ return new KeyPointManagerException(" [KEY POINT GENERATOR]  Code of Key Point cannot be generated, no node specified : keypoint="+name,KeyPointManagerException.ERR.GENERATOR_ERROR_NO_NODE) };
    static GENERATOR_ERROR_NODE_NOT_FOUND = (type,uid)=>{ return new KeyPointManagerException(" [KEY POINT GENERATOR]  Node associated to the target cannot be found (type="+type+", uid="+uid+")",KeyPointManagerException.ERR.GENERATOR_ERROR_NODE_NOT_FOUND) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('KEY POINT MANAGER', pMsg, pCode, pExtra);
    }
}