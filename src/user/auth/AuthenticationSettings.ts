import {AuthType} from "./AuthTypes.js";
import {Settings} from "../../Settings.js";
import {SessionSettings} from "../session/SessionSettings.js";
import Util from "../../Utils.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {DbmsConnSettings} from "../../core/db/DbmsConnSettings.js";
import {AuthenticationPolicy, AuthenticationPolicyOptions} from "./AuthenticationPolicy.js";
import {IStringIndex, Nullable} from "../../core/IStringIndex.js";
import {RuntimeSecurityException} from "../../errors/RuntimeSecurityException.js";
import * as Log from "../../Logger.js";
import ServerSettings = Settings.ServerSettings;


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface AuthenticationOptions {
    policy?:AuthenticationPolicyOptions;
    db?:DbmsConnSettings;
    supported?:AuthType[];
    sess?:any;
    oidc?:OidcOptions;
}


export interface OidcOptions {
    discoverUri:string;
    client_id?:string;
    client_secret?:string;
    redirectUris:string[];
    postLogoutRedirectUris:string[];
    responseType:string[];
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
    private _oidc:Nullable<OidcOptions> = null;

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

        if(pConfig.oidc!=null){
            this._oidc = pConfig.oidc;
        }

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
     * To override existings settings with specified settings
     *
     * This method is mainly used to override settings at runtime.
     *
     * TODO :  this method should be able trigger some hot reload mechanisms to apply changes
     *
     * @param pSettings
     */
    overrideWith(pSettings:IStringIndex<any>, pBeforeStart = false):void {
        if(pSettings.oidc != null){

            let overriddenCfg:IStringIndex<any> = (this._oidc!=null ? this._oidc : {});
            for(let k in pSettings.oidc){
                overriddenCfg[k] = (pSettings.oidc as IStringIndex<any>)[k];
            }

            if(!pBeforeStart && this._oidc==null){
                this._oidc = overriddenCfg as OidcOptions;
                // TODO : must reinit webserver  or add sso middleware
            }else{
                this._oidc = overriddenCfg as OidcOptions;
            }
        }
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



    getOidcString(pIndent = 2):string {
        if(this._oidc==null){
            return "null";
        }

        return `
${"\t".repeat(pIndent)}discover = ${this._oidc.discoverUri}
${"\t".repeat(pIndent)}client_id = ${this._oidc.client_id}
${"\t".repeat(pIndent)}client_secret =  <REDACTED>
${"\t".repeat(pIndent)}redirect URIs = ${this._oidc.redirectUris}
${"\t".repeat(pIndent)}logout URIs = ${this._oidc.postLogoutRedirectUris}
${"\t".repeat(pIndent)}response Type = ${this._oidc.responseType}
`;
    }




    getPolicyString(pIndent = 2):string {
        if(this.policy==null){
            return "[null]";
        }
        return this._policy.explains(pIndent);
    }

    /**
     * To check is OpenID Client settings are provided
     *
     * @return {boolean}
     * @method
     */
    hasOidcSettings():boolean {
        Logger.info("[INFO] [AUTHENTICATION] OIDC Settings : "+(this._oidc!=null) );
        return (this._oidc!=null);
    }

    getOidcDiscoverURI():string {
        if(this._oidc.client_id==null){
            throw RuntimeSecurityException.OIDC_DISCOVER_URI_REQUIRED();
        }
        return this._oidc.discoverUri;
    }


    getOidcClientID():string {
        if(this._oidc==null || this._oidc.client_id==null){
            throw RuntimeSecurityException.OIDC_CLIENT_ID_REQUIRED();
        }
        return this._oidc.client_id;
    }

    getOidcClientSecret():string {
        /*if(this._oidc==null || this._oidc.client_secret==null){
            throw RuntimeSecurityException.OIDC_CLIENT_SECRET_REQUIRED();
        }*/
        return this._oidc.client_secret;
    }

    getOidcRedirectUris():string[] {
        if(this._oidc==null || this._oidc.redirectUris==null){
            throw RuntimeSecurityException.OIDC_REDIRECT_URIS_REQUIRED();
        }
        return this._oidc.redirectUris;
    }

    getOidcLogoutUris():string[] {
        if(this._oidc==null || this._oidc.postLogoutRedirectUris==null){
            throw RuntimeSecurityException.OIDC_LOGOUT_URIS_REQUIRED();
        }
        return this._oidc.postLogoutRedirectUris;
    }

    getOidcResponseType():string[] {
        if(this._oidc==null || this._oidc.responseType==null){
            throw RuntimeSecurityException.OIDC_RESPONSE_TYPE_REQUIRED();
        }
        return this._oidc.responseType;
    }

    getSupportedString():string {
        if(this._supported==null){
            return "[null]";
        }

        return "[ "+this._supported.join(",")+" ]";
    }

    toObject(pZone:SecurityZone = SecurityZone.PUBLIC):any {

        if(pZone==SecurityZone.PRIVATE){
            return {
                db: this._db,
                policy: this._policy,
                supported: this._supported,
                sess: this._sess.toObject(pZone),
                oidc: this._oidc
            };
        }else{
            return {};
        }

    }
}
