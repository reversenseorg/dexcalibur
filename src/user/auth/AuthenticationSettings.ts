import {AuthType} from "./AuthTypes.js";
import {Settings} from "../../Settings.js";
import {SessionSettings} from "../session/SessionSettings.js";
import Util from "../../Utils.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import ServerSettings = Settings.ServerSettings;
import { DbmsConnSettings } from "../../core/db/DbmsConnSettings.js";
import {AuthenticationPolicy} from "./AuthenticationPolicy.js";


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
    private _sess:any = null;
    private _db:DbmsConnSettings = null;
    private _parent:ServerSettings;

    /**
     * Create an object which hold server settings from global settings files and env var
     *
     * @param {number} pHttp HTTP port of web server. Can be override by DXC_HTTP_PORT env var
     * @param {number} pWs Websocket port of web server. Can be override by DXC_WS_PORT env var
     * @constructor
     * @since 1.0.0
     */
    constructor( pParent:ServerSettings, pConfig:any ) {
        this._parent = pParent;

        if(pConfig==null) pConfig = {};

        this._db = Util.getValue( pConfig, 'db', null);
        if(! pConfig.hasOwnProperty('policy')){
            pConfig.policy = {enforced:true};
        }

        this._policy = new AuthenticationPolicy(pConfig);
        this._supported = Util.getValue( pConfig, 'supported', [AuthType.PASSWORD]);
        this._sess = new SessionSettings( this, Util.getValue( pConfig, 'sess', null))
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

    /**
     * To get raw session settings
     *
     * @return {any} session settings from auth configuration
     * @method
     */
    getSessionSettings():SessionSettings {
        return this._sess;
    }

    /**
     * To trigger configuration backup
     *
     * @param pDestFile
     */
    save(pDestFile:string = null):any {
        this._parent.save(pDestFile);
    }

    getDbString():string {
        if(this._db==null){
            return "null";
        }

        return `{
    \t dbms = ${this._db.dbms}
    \t uri = ${this._db.uri}
    \t port = ${this._db.port}
    \t username = ${this._db.user}
    \t passwd = ${this._db.pwd}
}`;
    }


    getPolicyString():string {
        if(this.policy==null){
            return "null";
        }
        return this._policy.explains();
    }


    getSupportedString():string {
        if(this._supported==null){
            return "null";
        }

        return "[ "+this._supported.join(",")+" ]";
    }

    toObject(pZone:SecurityZone = SecurityZone.PUBLIC):any {
        return {
            db: this._db,
            policy: this._policy,
            supported: this._supported,
            sess: this._sess.toObject(pZone)
        };
    }
}
