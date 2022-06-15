import DexcaliburRegistry from "./DexcaliburRegistry";
import DexcaliburWorkspace from "./DexcaliburWorkspace";
import * as _path_ from "path";
import * as _fs_ from "fs";
import * as _os_ from "os";
import {AuthenticationSettings} from "./user/auth/AuthenticationSettings";
import {DexcaliburConnectionParams, DexcaliburConnectionParamsList} from "./remote/DexcaliburConnectionParams";
import {ConnectionSettingsException} from "./errors/ConnectionSettingsException";
import {IncomingValue, SanitizedValue, UnsafeValue} from "./security/SanitizedValue";
import {GlobalSettingsException} from "./errors/GlobalSettingsException";
import {SecurityZone} from "./security/SecurityZone";


const LOG_FILE = (process.env.DXC_LOG_PATH ? process.env.DXC_LOG_PATH : null);
function __log( pMessage:string):void{
    if(LOG_FILE!=null)
        _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
}


/**
 * Declare class related to global configuration
 * @namespace
 */
export namespace Settings {

    export const GLOBAL_CFG_NAME = "dxc.json";

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
    export const DEFAULT_WS_PORT = 8001;

    export interface ExternalToolParams {
        path: string,
        params?: string[]
    }

    export abstract class AbstractSettings {

        protected parent:AbstractSettings = null;

        constructor( pParent:AbstractSettings = null) {
            this.parent = pParent;
        }

        /**
         * To trigger global saving
         *
         * @param {string} pDestPath Optional. Backup file path
         * @method
         */
        save(pDestPath:string = null):any {
            return (this.parent!=null ? this.parent.save(pDestPath) : null)
        }



        abstract sanitize( pName:string, pValue:any):IncomingValue;

        abstract update( pValue:IncomingValue):void;

        abstract toObject():any;
    }

    /**
     * Represents server configuration
     * @class
     * @export
     */
    export class ServerSettings extends AbstractSettings {


        static SUPPORTED_ARCH = ["aarch64","aarch32","x64","x86"];

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


        /**
         * Max heap size allowed for engine
         * @field
         * @type number
         * @private
         */
        private heapSize = 4096;

        /**
         * Default architecture
         * @field
         * @type number
         * @private
         */
        private defaultArch = 'aarch64';

        constructor( pParent:GlobalSettings, pConfig:any=null) {

            super(pParent);

            if(pConfig!=null){
                if(pConfig.hasOwnProperty('workspace')){
                    this.space = DexcaliburWorkspace.getInstance(pConfig.workspace);
                }

                if(pConfig.hasOwnProperty('registry')){
                    this.registry = new DexcaliburRegistry(pConfig.registry, pConfig.registryAPI);
                }

                if(pConfig.hasOwnProperty('auth')){
                    this.auth = new AuthenticationSettings(this, pConfig.auth);
                }
            }

        }

        getDefaultArchitecture():string {
            return this.defaultArch;
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


        getHeapSize():number {
            return this.heapSize;
        }


        sanitize(pName: string, pValue: any): IncomingValue {
            switch(pName){
                case "heapSize":
                    const d = (typeof  pValue == 'string' ? parseInt(pValue,10) : pValue);
                    if(d > 2048){
                        return new SanitizedValue(pName, d);
                    }else{
                        return new UnsafeValue(pName, d);
                    }
                    break;
                case "defaultArch":
                    if(ServerSettings.SUPPORTED_ARCH.indexOf(pValue)>-1){
                        return new SanitizedValue(pName, pValue);
                    }else{
                        return new UnsafeValue(pName, pValue);
                    }
                    break;
                default:
                    throw GlobalSettingsException.SETTING_UNKNOW();
            }
        }


        update( pValue:IncomingValue):void {

            switch (pValue.getName()) {
                case "heapSize":
                    this.heapSize = pValue.getValue();
                    break;
                case "defaultArch":
                    this.defaultArch = pValue.getValue();
                    break;
                default:
                    throw GlobalSettingsException.SETTING_UNKNOW();

            }
        }

        /**
         * To trigger global saving
         *
         * @param {string} pDestPath Optional. Backup file path
         * @method
         */
        save(pDestPath:string = null):any {
            return this.parent.save(pDestPath);
        }

        toObject(pZone:SecurityZone = SecurityZone.PUBLIC):any {
            return {
                workspace:  this.space.getLocation(),
                registry: this.registry.url,
                registryAPI: this.registry.api,
                auth: this.auth.toObject(pZone),
                heapSize: this.heapSize,
                defaultArch: this.defaultArch
            };
        }
    }


    /**
     * Represent web server configuration
     * @class
     * @export
     */
    export class WebServerSettings extends AbstractSettings {

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
        constructor( pParent:GlobalSettings, pHttp:number, pWs:number) {
            super(pParent);

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


        sanitize(pName: string, pValue: any): IncomingValue {
            // todo
            switch(pName){
                case "ws":
                case "http":
                    const d = (typeof  pValue == 'string' ? parseInt(pValue,10) : pValue);
                    if(d > 1 && d < 65534){
                        return new SanitizedValue(pName, d);
                    }else{
                        return new UnsafeValue(pName, d);
                    }
                    break;
                default:
                    throw GlobalSettingsException.SETTING_UNKNOW();
            }
        }

        update( pValue:IncomingValue):void {
            switch (pValue.getName()) {
                case "http":
                    this._http = pValue.getValue();
                    break;
                case "ws":
                    this._ws = pValue.getValue();
                    break;
                default:
                    throw GlobalSettingsException.SETTING_UNKNOW();
            }
        }

        toObject(pZone:SecurityZone = SecurityZone.PUBLIC): any {
            return {
                http: this._http,
                ws: this._ws
            }
        }
    }

    export class ExternalSettings extends AbstractSettings {

        private _all: any;


        constructor( pParent:GlobalSettings, pConfig:any) {
            super(pParent);
            this._all = pConfig;
        }

        getToolList():string[]  {
            return Object.keys(this._all);
        }

        getTool( pUID:string) :any {
            return this._all[pUID];
        }


        sanitize(pName: string, pValue: any, pForce = false): IncomingValue {

            if(Object.keys(this._all).indexOf(pName)>-1 || pForce){
                if(_fs_.existsSync(pValue)){
                    return new SanitizedValue(pName, pValue);
                }else{
                    return new UnsafeValue(pName, pValue);
                }
            }else{
                throw GlobalSettingsException.SETTING_UNKNOW();
            }
        }

        update( pValue:IncomingValue):void {
            this._all[pValue.getName()] = pValue.getValue();
        }

        getAll():any{
            return this._all;
        }

        toObject(pZone:SecurityZone = SecurityZone.PUBLIC):any {
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


        sanitize(pName: string, pValue: any): IncomingValue {
            throw GlobalSettingsException.SETTING_UNKNOW();
        }


        update( pValue:IncomingValue):void {
            throw GlobalSettingsException.SETTING_UNKNOW();
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

        static DEFAULT_CONN = 'inmemory';

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


    export class    ConnectionSettings extends AbstractSettings {

        static LOCAL = 'local';

        private _all: DexcaliburConnectionParamsList = {};

        static newInstance( pParent:GlobalSettings, pName:string, pIp:string, pPort:number):ConnectionSettings {
            return new ConnectionSettings(
                pParent, {
                    all: [{
                        ip: pIp,
                        name: pName,
                        port: pPort
                    }]
                }
            );
        }

        constructor( pParent:GlobalSettings, pConfig:any) {
            super(pParent);
            if(pConfig.hasOwnProperty('all')){
                pConfig.all.map( o => {
                    const s = DexcaliburConnectionParams.fromPoorObject(o);
                    this._all[s.getName()] = s;
                });
            }
        }

        /**
         *
         * @param pName
         */
        getConnectionParamsFor( pName:string) :DexcaliburConnectionParams  {
            if(this._all[pName] != null){
                return this._all[pName];
            }else{
                throw ConnectionSettingsException.NO_CONNECTION_FOR_NAME();
            }
        }

        /**
         * To save a connection configurartion into settings
         * @param pParam
         */
        addConnectionParam( pParam:DexcaliburConnectionParams, pSaveFile:string = null) :any {
            if(this._all[pParam.getName()] !== null){
                throw ConnectionSettingsException.NAME_ALREADY_USED();
            }else{
                this._all[pParam.getName()] = pParam;
                return this.save(pSaveFile);
            }
        }

        countConnections():number {
            return Object.keys(this._all).length;
        }

        getAll():any{
            return this._all;
        }


        sanitize(pName: string, pValue: any): IncomingValue {
            throw GlobalSettingsException.SETTING_UNKNOW();
        }


        update( pValue:IncomingValue):void {
            throw GlobalSettingsException.SETTING_UNKNOW();
        }

        toObject(pZone:SecurityZone = SecurityZone.PUBLIC):any {
            const o:any =  {
                all: Object.values(this._all)
            };

            return o;
        }
    }

    /**
     * Represent global configuration
     * @class
     * @export
     */
    export class GlobalSettings extends AbstractSettings{

        private _path:string = null;

        private bin: ExternalSettings;
        private server: ServerSettings;
        private web: WebServerSettings;
        private conn: ConnectionSettings = null;

        /**
         *
         * @param pConfig
         * @constructor
         */
        constructor( pConfig:any=null) {
            super(null);

            this.server = new ServerSettings(this, pConfig.server); // server
            this.bin = new ExternalSettings(this, pConfig.bin);
            this.web = new WebServerSettings(this, pConfig.server.http, pConfig.server.ws); //(pConfig.http, pConfig.ws);

            if(pConfig.hasOwnProperty('conn')){
                this.conn = new ConnectionSettings(this, pConfig.conn);
            }
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
                const data:any = JSON.parse( _fs_.readFileSync(path).toString());

                if(pOverride != null){
                    for(const i in pOverride) data[i] = pOverride[i];
                }

                __log("[GLOBAL SETTINGS] load : success : "+JSON.stringify(data));

                gs = new GlobalSettings(data);
                gs.setPath(path);
            }catch(err){
                __log("[GLOBAL SETTINGS] load : error : "+err.message+" "+pConfigPath+"\n"+err.stack);
            }finally {
                return gs;
            }
        }


        sanitize(pName: string, pValue: any): IncomingValue {
            throw GlobalSettingsException.SETTING_UNKNOW();
        }


        update( pValue:IncomingValue):void {
            throw GlobalSettingsException.SETTING_UNKNOW();
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
            // if the path of the new file, is the same than current file,
            // then create a backup of current config
            if(this._path != null && (pDestPath == null || pDestPath===this._path)){
                _fs_.copyFileSync(this._path, this._path+'.bkp');
            }

            _fs_.writeFileSync(
                pDestPath!=null ? pDestPath : this._path,
                JSON.stringify(
                    this.toObject()
                ));
        }

        getServerSettings():ServerSettings {
            return this.server;
        }

        getExternalSettings(): ExternalSettings {
            return this.bin;
        }

        getWebserverSettings(): WebServerSettings {
            return this.web;
        }

        getConnectionSettings(): ConnectionSettings {
            return this.conn;
        }

        toObject(pZone:SecurityZone = SecurityZone.PUBLIC): any {
            const o:any = {
                bin: this.bin.toObject(pZone),
                server: this.server.toObject(pZone)
            };

            if(this.conn != null){
                o.conn = this.conn.toObject(pZone);
            }

            o.server.http = this.web.getHttpPort();
            o.server.ws = this.web.getWsPort();

            return o;
        }

        toJson(pZone:SecurityZone = SecurityZone.PRIVATE):string {
            return JSON.stringify(this.toObject(pZone));
        }

        createConnectionSettings(): ConnectionSettings {
            return this.conn = ConnectionSettings.newInstance(this, "local", "127.0.0.1", this.getWebserverSettings().getHttpPort());
        }
    }
}