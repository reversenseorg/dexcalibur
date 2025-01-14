import {IncomingValue, SanitizedValue, UnsafeValue} from "../../security/SanitizedValue.js";
import {GlobalSettingsException} from "../../errors/GlobalSettingsException.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {Settings} from "../../Settings.js";
import {AbstractSettings} from "../../settings/AbstractSettings.js";


export interface SignatureServerOptions {
    host?:string;
    port?:number;
    ssl?:any;
    auth?:any;
}

const DEFAULT_HTTP_PORT = 8085;

/**
 * Represent configuration of signature server client
 * @class
 * @export
 */
export class SignatureServerSettings extends AbstractSettings {

    /**
     * Hostname
     * @field
     * @type {string}
     * @private
     */
    private _host:string;

    /**
     * HTTP port
     * @field
     * @type {number}
     * @private
     */
    private _port:number;

    /**
     * SSL config
     * @field
     * @type {any}
     * @private
     */
    private _ssl:any;

    /**
     * Authentication cfg
     * @field
     * @type {any}
     * @private
     */
    private _auth:any;

    /**
     * Create an object which hold server settings from global settings files and env var
     *
     * param {number} pHttp HTTP port of web server. Can be override by DXC_HTTP_PORT env var
     * param {number} pWs Websocket port of web server. Can be override by DXC_WS_PORT env var
     *
     * @param {GlobalSettings} pParent Parent settings
     * @param {WebServerOptions} pConfig Options values
     * @constructor
     * @since 1.0.0
     */
    constructor( pParent:Settings.ServerSettings, pConfig:SignatureServerOptions= {} /*Http:number, pWs:number*/) {
        super(pParent);

        this._host = (process.env.DXC_SS_HOST ? process.env.DXC_SS_HOST : '127.0.0.1');
        this._port = (process.env.DXC_SS_PORT ? parseInt(process.env.DXC_SS_PORT,10) : -1);

        if(this._port === -1){
            this._port = pConfig.port != null ? pConfig.port : DEFAULT_HTTP_PORT;
        }
    }


    /**
     *
     */
    getPort():number {
        return this._port;
    }

    getHost():string {
        return this._host;
    }


    hasSslConfig():boolean {
        return this._ssl!=null;
    }

    hasAuthConfig():boolean {
        return this._auth!=null;
    }

    sanitize(pName: string, pValue: any): IncomingValue {
        // todo
        switch(pName){
            case "host":
                if((new URL(pValue)).hostname==pValue){
                    return new SanitizedValue(pName, (new URL(pValue)).hostname);
                }else{
                    return new UnsafeValue(pName, pValue);
                }
                break;
            case "port":
                const d = (typeof  pValue == 'string' ? parseInt(pValue,10) : pValue);
                if(d > 1 && d < 65534){
                    return new SanitizedValue(pName, d);
                }else{
                    return new UnsafeValue(pName, d);
                }
                break;
            case "ssl":
                return new UnsafeValue(pName, pValue);
            case "auth":
                return new UnsafeValue(pName, pValue);
            default:
                throw GlobalSettingsException.SETTING_UNKNOW();
        }
    }

    update( pValue:IncomingValue):void {
        const supported = ["port","ssl","host","auth"];

        for(let i=0; i<supported.length; i++){
            if(supported[i]==pValue.getName()){
                this["_"+supported[i]] = pValue.getValue();
                return;
            }
        }

        throw GlobalSettingsException.SETTING_UNKNOW();
        /*
        switch (pValue.getName()) {
            case "port":
                this._port = pValue.getValue();
                break;
            case "host":
                this._host = pValue.getValue();
                break;
            case "ssl":
                this._ssl = pValue.getValue();
                break;
            case "auth":
                this._auth = pValue.getValue();
                break;
            default:
                throw GlobalSettingsException.SETTING_UNKNOW();
        }*/
    }

    toObject(pZone:SecurityZone = SecurityZone.PUBLIC): any {

        if(pZone==SecurityZone.PRIVATE){
            return {
                host: this._host,
                port: this._port,
                ssl: this._ssl,
                auth: this._auth
            }
        }else{
            return {
                host: this._host,
                port: this._port,
                ssl: "<REDACTED>",
                auth: "<REDACTED>"
            }
        }

    }

    static createDefault():SignatureServerSettings {
        return new SignatureServerSettings(null, {})
    }
}