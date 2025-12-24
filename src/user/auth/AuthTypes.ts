import {AuthenticationResult} from "./PasswordAuthenticator.js";

export enum AuthType {
    NONE='none',
    PASSWORD='pwd',
    TOKEN='token',
    API_KEY='api_key'
}


export enum AuthCode {
    NONE,
    INVALID_PASSWORD,
    EMPTY_PASSWORD,
    INVALID_USERNAME,
    EMPTY_USERNAME,
    ACCOUNT_LOCKED,
    ACCOUNT_DEACTIVATED,
    MAX_ATTEMPTS_REACHED,

    NOT_CONFIGURED,
    INVALID_APIKEY,
}

export interface Authenticator {
    doAuthentication( ...args:any[]):AuthenticationResult|Promise<AuthenticationResult>;
}

export class AuthenticationException extends Error {

    _c:AuthCode = AuthCode.NONE


    constructor(pMsg, pCode:AuthCode = AuthCode.NONE) {
        super(pMsg);
        this._c = pCode;
    }

    /**
     * To get auth code
     */
    getCode():AuthCode {
        return this._c;
    }
}