
export enum AuthType {
    NONE='none',
    PASSWORD='pwd',
    TOKEN='token',
    API_KEY='api_key'
}

export interface Authenticator {
    doAuthentication( ...args:any[]):any;
}

export class AuthenticationException extends Error {
    constructor(pMsg) {
        super(pMsg);
    }
}