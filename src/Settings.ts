import DexcaliburRegistry from "./DexcaliburRegistry";
import DexcaliburWorkspace from "./DexcaliburWorkspace";
import * as _path_ from "path";
import * as _fs_ from "fs";
import * as _os_ from "os";
import {AuthType} from "./user/auth/AuthTypes";


const LOG_FILE = (process.env.DXC_LOG_PATH ? process.env.DXC_LOG_PATH : null);
function __log( pMessage:string):void{
    if(LOG_FILE!=null)
        _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
}


function getValueFrom( pObject:any, pField:string, pDefaultValue:any):any {
    return (pObject.hasOwnProperty(pField)? pObject[pField] : pDefaultValue);
}


/**
 * Declare class related to global configuration
 * @namespace
 */
export namespace Settings {

    export const GLOBAL_CFG_NAME:string = "dxc.json";

    /**
     * Default http port for webserver
     *
     * By default, port is 8000. Use env variable `DXC_HTTP_PORT` to override
     *
     * @type {number}
     * @const
     * @export
     */
    export const DEFAULT_HTTP_PORT:number = (process.env.DXC_HTTP_PORT ? parseInt(process.env.DXC_HTTP_PORT,10) : 8000);

    /**
     * Default websocket port for webserver
     *
     * By default, port is 8001. Use env variable `DXC_WS_PORT` to override
     *
     * @type {number}
     * @const
     * @export
     */
    export const DEFAULT_WS_PORT:number = 8001;

    export interface ExternalToolParams {
        path: string,
        params?: string[]
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

    /**
     * Represents server configuration
     * @class
     * @export
     */
    export class ServerSettings {


        /**
         * Dexcalibur remote registry
         *
         * @field
         * @type {DexcaliburRegistry}
         * @private
         */
        private registry: DexcaliburRegistry;


        /**
         * Path of Dexcalibur workspace
         * @field
         * @type {string}
         * @private
         */
        private space:DexcaliburWorkspace;

        /**
         * Path of Dexcalibur workspace
         * @field
         * @type {string}
         * @private
         */
        private auth:AuthenticationSettings;

        constructor( pConfig:any=null) {

            if(pConfig.hasOwnProperty('workspace')){
                this.space = DexcaliburWorkspace.getInstance(pConfig.workspace);
            }

            if(pConfig.hasOwnProperty('registry')){
                this.registry = new DexcaliburRegistry(pConfig.registry, pConfig.registryAPI);
            }

            if(pConfig.hasOwnProperty('auth')){
                this.auth = new AuthenticationSettings(pConfig.auth);
            }
        }

        getRegistry():DexcaliburRegistry {
            return this.registry;
        }

        getWorkspace():DexcaliburWorkspace {
            return this.space;
        }

        getAuthenticationSettings():AuthenticationSettings {
            return this.auth;
        }

        toObject():any {
            return {
                workspace:  this.space.getLocation(),
                registry: this.registry.url,
                registryAPI: this.registry.api,
                auth: this.auth.toObject()
            };
        }
    }

    /**
     * Represent web server configuration
     * @class
     * @export
     */
    export class WebServerSettings {

        /**
         * HTTP port for internal web server
         * @field
         * @type {string}
         * @private
         */
        private _http:number = DEFAULT_HTTP_PORT;

        /**
         * WebSocket port for internal web server
         * @field
         * @type {string}
         * @private
         */
        private _ws:number = DEFAULT_WS_PORT;

        /**
         * Create an object which hold server settings from global settings files and env var
         *
         * @param {number} pHttp HTTP port of web server. Can be override by DXC_HTTP_PORT env var
         * @param {number} pWs Websocket port of web server. Can be override by DXC_WS_PORT env var
         * @constructor
         * @since 1.0.0
         */
        constructor( pHttp:number, pWs:number) {
            this._http = (process.env.DXC_HTTP_PORT ? parseInt(process.env.DXC_HTTP_PORT,10) : pHttp);
            this._ws = (process.env.DXC_WS_PORT ? parseInt(process.env.DXC_WS_PORT,10) : pWs);
        }

        /**
         *
         */
        getHttpPort():number {
            return this._http;
        }

        getWsPort():number {
            return this._ws;
        }
    }

    export class ExternalSettings {

        private _all: any;

        constructor( pConfig:any) {
            this._all = pConfig;
        }

        getToolList():string[]  {
            return Object.keys(this._all);
        }

        getTool( pUID:string) :any {
            return this._all[pUID];
        }

        getAll():any{
            return this._all;
        }

        toObject():any {
            return this._all;
        }
    }

    /**
     *
     */
    export class WorkspaceSettings {

        static DEFAULT_ENCODING = 'utf8';
        static DEFAULT_CONN = 'inmemory'

        private connector: string;
        private encoding: string;

        constructor( pConfig:any) {
            this.connector = (pConfig.connector==null ? WorkspaceSettings.DEFAULT_CONN : pConfig.connector);
            this.encoding =(pConfig.encoding==null ? WorkspaceSettings.DEFAULT_ENCODING : pConfig.encoding);
        }

        getDefaultConnector():string  {
            return this.connector;
        }

        getDefaultEncoding():string  {
            return this.encoding;
        }

        exportTo( pPath:string){
            _fs_.writeFileSync(pPath, JSON.stringify(this), { encoding:'utf8', mode:'w+' });
        }

        /**
         *
         * @param pPath
         */
        static importFrom( pPath:string){
            return new WorkspaceSettings(JSON.parse(_fs_.readFileSync(pPath).toString()));
        }
    }

    /**
     *
     */
    export class ProjectSettings {

        static DEFAULT_CONN:string = 'inmemory';

        private connector:string;
        private encoding: string;
        private device: string;
        private package: string;
        private nofrida: boolean;

        constructor( pConfig:any) {
            this.encoding = pConfig.encoding;
            this.device = pConfig.device;
            this.package = pConfig.package;
            this.nofrida = pConfig.nofrida;
            this.nofrida = pConfig.nofrida;
            this.connector = (pConfig.connector != null ? pConfig.connector : ProjectSettings.DEFAULT_CONN);
        }

        getEncoding():string {
            return this.encoding
        }

        getDeviceID():string {
            return this.device
        }

        getPackage():string {
            return this.package
        }

        getConnector():string {
            return this.connector
        }

        setDeviceID( pDevID:string):void {
            this.device = pDevID;
        }
    }


    /**
     * Represent global configuration
     * @class
     * @export
     */
    export class GlobalSettings {

        private _path:string = null;

        private bin: ExternalSettings;
        private srv: ServerSettings;
        private web: WebServerSettings;

        /**
         *
         * @param pConfig
         * @constructor
         */
        constructor( pConfig:any=null) {
            this.srv = new ServerSettings(pConfig.server);
            this.bin = new ExternalSettings(pConfig.bin);
            this.web = new WebServerSettings(pConfig.server.http, pConfig.server.ws); //(pConfig.http, pConfig.ws);
        }

        static getDefaultLocation():string {
            /*let p:string;
            switch(require('os').platform()){
                case 'darwin':
                    p = _path_.join( require('os').homedir(), 'Application Support', 'DexcaliburPRO', GLOBAL_CFG_NAME);
                    break;
            }*/
            // old path (v <= 0.7.x)
            return _path_.join( require('os').homedir(), '.dexcalibur', GLOBAL_CFG_NAME);
        }
        /**
         * To instanciate GlobalSettings instance by parsing configuration file
         * from specified location.
         *
         * - DEXCALIBUR_HOME
         * - pConfigPath
         * - Default location : <HOMEDIR>/.dexcalibur/<GLOBAL_CFG_NAME>
         *
         */
        static load( pConfigPath:string=undefined, pOverride:any=undefined): GlobalSettings {
            let path:string = null;
            let gs:GlobalSettings = null;

            if(process.env.DEXCALIBUR_HOME != null)
                path = _path_.join( process.env.DEXCALIBUR_HOME, GLOBAL_CFG_NAME);
            else if(pConfigPath !== undefined)
                path = pConfigPath;
            else
                path = GlobalSettings.getDefaultLocation();


            try{
                let data:any = JSON.parse( _fs_.readFileSync(path).toString());

                if(pOverride != null){
                    for(let i in pOverride) data[i] = pOverride[i];
                }

                __log("[GLOBAL SETTINGS] load : success : "+JSON.stringify(data));

                gs = new GlobalSettings(data);
                gs.setPath(path);
            }catch(err){
                __log("[GLOBAL SETTINGS] load : error : "+err.message+" "+pConfigPath);
            }finally {
                return gs;
            }
        }


        /**
         * To set location of the file containing current settings
         *
         * @param pPath
         */
        setPath(pPath:string):void {
            this._path = pPath;
        }

        /**
         * To save global settings
         *
         * @param pDestPath
         */
        save( pDestPath:string = null){
            let o:any = {
                bin: this.bin.toObject(),
                srv: this.srv.toObject()
            };

            o.srv.http = this.web.getHttpPort();
            o.srv.ws = this.web.getWsPort();

            // if the path of the new file, is the same than current file,
            // then create a backup of current config
            if(this._path != null && (pDestPath == null || pDestPath===this._path)){
                _fs_.copyFileSync(this._path, this._path+'.bkp');
            }

            _fs_.writeFileSync(
                pDestPath!=null ? pDestPath : this._path,
                JSON.stringify(o));
        }

        getServerSettings():ServerSettings {
            return this.srv;
        }

        getExternalSettings(): ExternalSettings {
            return this.bin;
        }

        getWebserverSettings(): WebServerSettings {
            return this.web;
        }
    }
}