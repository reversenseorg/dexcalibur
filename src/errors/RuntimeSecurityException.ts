import {ErrorCode, MonitoredError} from "./MonitoredError.js";
import {PassthroughValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue.js";

export class RuntimeSecurityException extends MonitoredError {


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
    static USE_OF_UNSAFE_VALUE = (pUnsafeValue:PassthroughValue)=>{
        return new RuntimeSecurityException("Value is invalid",ErrorCode.SECURITY_RUNTIME + 107, pUnsafeValue) };
    static PATH_TRAVERSAL_IS_FORBIDDEN = ()=>{
        return new RuntimeSecurityException("Path traversal is forbidden",ErrorCode.SECURITY_RUNTIME + 108) };
    static OBJ_FORBIDDEN_IN_PUBLIC_ZONE = ()=>{
        return new RuntimeSecurityException("Security Zone violated : this object cannot be exposed in public scope",ErrorCode.SECURITY_RUNTIME + 110) };
    static SAFETY_CHECK_FAILED = (pType:string)=>{
        return new RuntimeSecurityException("Safety Check failed : "+pType+" ",ErrorCode.SECURITY_RUNTIME + 111) };
    static CSRF_TOKEN_IS_WRONG = (pPath:string)=>{
        return new RuntimeSecurityException("CSRF token is wrong. Request aborted [uri="+pPath+"]",ErrorCode.SECURITY_RUNTIME + 112) };
    static CSRF_TOKEN_IS_EMPTY = (pPath:string)=>{
        return new RuntimeSecurityException("CSRF token is empty. Request aborted [uri="+pPath+"]",ErrorCode.SECURITY_RUNTIME + 113) };
    static AUTH_REPLAY_DETECTED = (pUID:string)=>{
        return new RuntimeSecurityException("An authentication request replay has been detected. Request aborted [replayUID="+pUID+"]",ErrorCode.SECURITY_RUNTIME + 114) };
    static BROKEN_LOGIN_WORKFLOW = ()=>{
        return new RuntimeSecurityException("The authentication workflow is broken, session not intialized.",ErrorCode.SECURITY_RUNTIME + 115) };
    static COOKIE_SIGN_FAILURE = ()=>{
        return new RuntimeSecurityException("Signature of cookie value failed : secret not provided",ErrorCode.SECURITY_RUNTIME + 116) };
    static COOKIE_UNSIGN_FAILURE = ()=>{
        return new RuntimeSecurityException("Signature of cookie cannot be verified : secret not provided",ErrorCode.SECURITY_RUNTIME + 117) };





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