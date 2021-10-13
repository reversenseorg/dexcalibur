import {ErrorCode, MonitoredError} from "./MonitoredError";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue";

export class RuntimeSecurityException extends MonitoredError {

    static USE_OF_UNSAFE_VALUE = (pUnsafeValue:PassthroughValue)=>{ return new RuntimeSecurityException("Value is invalid",ErrorCode.SECURITY_RUNTIME + 101, pUnsafeValue) };
    static PATH_TRAVERSAL_IS_FORBIDDEN = ()=>{ return new RuntimeSecurityException("Path traversal is forbidden",ErrorCode.SECURITY_RUNTIME + 102) };


    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('RUNTIME SECURITY', pMsg, pCode, pExtra);
    }

    isEncapsulateUnsafe():boolean{
        return (this.getCode()==(ErrorCode.SECURITY_RUNTIME + 101));
    }

    bypass():PassthroughValue {
        return (this.getExtra() as PassthroughValue);
    }
}