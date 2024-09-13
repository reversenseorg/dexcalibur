import {ErrorCode, MonitoredError} from "./MonitoredError.js";


export enum InspectorFactoryError {
    GENERIC = 100,
    HOOKSET = 200  ,
    STRATEGY=300 ,
    EVENT=400 ,
}

export class InspectorFactoryException extends MonitoredError {

    static ERR = {
        HOOKSET_CANNOT_BE_CREATED: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.HOOKSET+ 1,
        HOOKSET_CANNOT_BE_RESTORED: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.HOOKSET+ 2,
        INSPECTOR_NOT_FOUND: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.GENERIC+ 1,
        STRATEGY_NAME_IS_MANDATORY: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.STRATEGY+ 2,
        DUPLICATED_HOOK_STRATEGY: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.STRATEGY+ 3,
        INSPECTOR_NOT_FOUND_SERVER_SIDE: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.GENERIC+ 2,
        INSPECTOR_NOT_FOUND_PROJECT_SIDE: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.GENERIC+ 3,
    };

    static HOOKSET_CANNOT_BE_CREATED = (uid)=>{ return new InspectorFactoryException(" Hookset cannot be created : "+uid,InspectorFactoryException.ERR.HOOKSET_CANNOT_BE_CREATED) };
    static STRATEGY_NAME_IS_MANDATORY = (uid)=>{ return new InspectorFactoryException(" Strategy name is mandatory. Inspector : "+uid,InspectorFactoryException.ERR.STRATEGY_NAME_IS_MANDATORY) };
    static INSPECTOR_NOT_FOUND = (uid)=>{ return new InspectorFactoryException(" Inspector not found : "+uid,InspectorFactoryException.ERR.INSPECTOR_NOT_FOUND) };
    static INSPECTOR_NOT_FOUND_SERVER_SIDE = (uid:string)=>{ return new InspectorFactoryException(" Inspector not found server side : "+uid,InspectorFactoryException.ERR.INSPECTOR_NOT_FOUND_SERVER_SIDE) };
    static INSPECTOR_NOT_FOUND_PROJECT_SIDE = (uid:string)=>{ return new InspectorFactoryException(" Inspector not found project side: "+uid,InspectorFactoryException.ERR.INSPECTOR_NOT_FOUND_PROJECT_SIDE) };


    static DUPLICATED_HOOK_STRATEGY = (uid)=>{ return new InspectorFactoryException("There is more than a single Strategy with this name : "+uid,InspectorFactoryException.ERR.DUPLICATED_HOOK_STRATEGY) };
    static HOOKSET_CANNOT_BE_RESTORED = (uid)=>{ return new InspectorFactoryException(" Hookset cannot be restored, because it is not found : "+uid,InspectorFactoryException.ERR.HOOKSET_CANNOT_BE_RESTORED) };



    DUPLICATED_HOOK_STRATEGY
    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('INSPECTOR FACTORY', pMsg, pCode, pExtra);
    }
}