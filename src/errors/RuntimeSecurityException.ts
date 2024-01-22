import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue.js";

export class RuntimeSecurityException extends MonitoredError {

    static USE_OF_UNSAFE_VALUE = (pUnsafeValue:PassthroughValue)=>{ return new RuntimeSecurityException("Value is invalid",ErrorCode.SECURITY_RUNTIME + 107, pUnsafeValue) };
    static PATH_TRAVERSAL_IS_FORBIDDEN = ()=>{ return new RuntimeSecurityException("Path traversal is forbidden",ErrorCode.SECURITY_RUNTIME + 108) };

    static OIDC_DISCOVER_URI_REQUIRED = ()=>{
        return new RuntimeSecurityException("OpenID Client : Discover URI is required by configuration but not provided",ErrorCode.SECURITY_RUNTIME + 101) };
    static OIDC_CLIENT_ID_REQUIRED = ()=>{
        return new RuntimeSecurityException("OpenID Client : Client ID is required by configuration but not provided",ErrorCode.SECURITY_RUNTIME + 102) };
    static OIDC_CLIENT_SECRET_REQUIRED = ()=>{
        return new RuntimeSecurityException("OpenID Client : Client secret is required by configuration but not provided",ErrorCode.SECURITY_RUNTIME + 103) };
    static OIDC_REDIRECT_URIS_REQUIRED = ()=>{
        return new RuntimeSecurityException("OpenID Client : Redirect URIs is required by configuration but not provided",ErrorCode.SECURITY_RUNTIME + 104) };
    static OIDC_LOGOUT_URIS_REQUIRED = ()=>{
        return new RuntimeSecurityException("OpenID Client : Logout URIs is required by configuration but not provided",ErrorCode.SECURITY_RUNTIME + 105) };
    static OIDC_RESPONSE_TYPE_REQUIRED = ()=>{
        return new RuntimeSecurityException("OpenID Client : Response Type is required by configuration but not provided",ErrorCode.SECURITY_RUNTIME + 106) };

    static OBJ_FORBIDDEN_IN_PUBLIC_ZONE = ()=>{ return new RuntimeSecurityException("Security Zone violated : this object cannot be exposed in public scope",ErrorCode.SECURITY_RUNTIME + 109) };
    static SAFETY_CHECK_FAILED = (pType:string)=>{ return new RuntimeSecurityException("Safety Check failed : "+pType+" ",ErrorCode.SECURITY_RUNTIME + 109) };




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