import {AuthType} from "./AuthTypes";



function getValueFrom( pObject:any, pField:string, pDefaultValue:any):any {
    return (pObject.hasOwnProperty(pField)? pObject[pField] : pDefaultValue);
}


/**
 * Represent authentication configuration
 *
 * Such as user data DB location, authenticator enabled, policy,
 * auth enforced, ...
 *
 * @class
 * @export
 */
export class AuthenticationSettings {


    private _supported:AuthType[] = [];
    private _policy:any = null;
    private _db:any = null;

    /**
     * Create an object which hold server settings from global settings files and env var
     *
     * @param {number} pHttp HTTP port of web server. Can be override by DXC_HTTP_PORT env var
     * @param {number} pWs Websocket port of web server. Can be override by DXC_WS_PORT env var
     * @constructor
     * @since 1.0.0
     */
    constructor( pConfig:any ) {
        this._db = getValueFrom( pConfig, 'db', null);
        this._policy = getValueFrom( pConfig, 'policy', null);
        this._supported = getValueFrom( pConfig, 'supported', [AuthType.PASSWORD]);
    }


    get supported(): AuthType[] {
        return this._supported;
    }

    set supported(value: AuthType[]) {
        this._supported = value;
    }

    get policy(): any {
        return this._policy;
    }

    set policy(value: any) {
        this._policy = value;
    }

    get db(): any {
        return this._db;
    }

    set db(value: any) {
        this._db = value;
    }

    toObject():any {
        return {
            db: this._db,
            policy: this._policy,
            supported: this._supported
        };
    }
}
