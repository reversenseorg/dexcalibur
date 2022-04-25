import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";


export enum InspectorFactoryError {
    GENERIC = 100,
    HOOKSET = 200  ,
    STRATEGY=300 ,
    EVENT=400 ,
}

export class InspectorFactoryException extends MonitoredError {

    static ERR = {
        HOOKSET_CANNOT_BE_CREATED: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.HOOKSET+ 1,
        STRATEGY_NAME_IS_MANDATORY: ErrorCode.INSPECTOR_FACT + InspectorFactoryError.STRATEGY+ 2,
    };

    static HOOKSET_CANNOT_BE_CREATED = (uid)=>{ return new InspectorFactoryException(" Hookset cannot be created : "+uid,InspectorFactoryException.ERR.HOOKSET_CANNOT_BE_CREATED) };
    static STRATEGY_NAME_IS_MANDATORY = (uid)=>{ return new InspectorFactoryException(" Strategy name is mandatory. Inspector : "+uid,InspectorFactoryException.ERR.STRATEGY_NAME_IS_MANDATORY) };

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('INSPECTOR FACTORY', pMsg, pCode, pExtra);
    }
}