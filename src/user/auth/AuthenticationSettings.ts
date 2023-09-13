import {AuthType} from "./AuthTypes.js";
import {Settings} from "../../Settings.js";
import {SessionSettings} from "../session/SessionSettings.js";
import Util from "../../Utils.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import ServerSettings = Settings.ServerSettings;
import { DbmsConnSettings } from "../../core/db/DbmsConnSettings.js";
import {AuthenticationPolicy, AuthenticationPolicyOptions} from "./AuthenticationPolicy.js";

export interface AuthenticationOptions {
    policy?:AuthenticationPolicyOptions;
    db?:DbmsConnSettings;
    supported?:AuthType[];
    sess?:any;
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
    private _policy:AuthenticationPolicy = null;
    private _sess:SessionSettings = null;
    private _db:DbmsConnSettings = null;
    private _parent:ServerSettings;

    /**
     * Create an object which hold authentication settings.
     * Authentication settings are a ârt of server settings
     *
     * @param {ServerSettings} pParent Parent settings
     * @param {AuthOptions} pConfig Options to use to initialize Authentication settings
     * @constructor
     * @since 1.0.0
     */
    constructor( pParent:ServerSettings, pConfig:AuthenticationOptions={} ) {
        this._parent = pParent;

        if(pConfig==null) pConfig = {};

        this._db = Util.getValue( pConfig, 'db', {});
        if(! pConfig.policy != null){
            pConfig.policy = {enforced:true};
        }

        this._policy = new AuthenticationPolicy(pConfig);
        this._supported = Util.getValue( pConfig, 'supported', [AuthType.PASSWORD]);
        this._sess = new SessionSettings( this, Util.getValue( pConfig, 'sess', {}))
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

    getDbString(pIndent = 2):string {
        if(this._db==null){
            return "null";
        }

        return `
${"\t".repeat(pIndent)}dbms = ${this._db.dbms}
${"\t".repeat(pIndent)}uri = ${this._db.uri}
${"\t".repeat(pIndent)}port = ${this._db.port}
${"\t".repeat(pIndent)}username = ${this._db.user}
${"\t".repeat(pIndent)}passwd = ${this._db.pwd}
`;
    }


    getPolicyString(pIndent = 2):string {
        if(this.policy==null){
            return "[null]";
        }
        return this._policy.explains(pIndent);
    }


    getSupportedString():string {
        if(this._supported==null){
            return "[null]";
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
