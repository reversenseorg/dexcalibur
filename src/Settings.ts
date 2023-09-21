import DexcaliburRegistry from "./DexcaliburRegistry.js";
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import * as _path_ from "path";
import * as _fs_ from "fs";
import * as _os_ from "os";
import {AuthenticationOptions, AuthenticationSettings} from "./user/auth/AuthenticationSettings.js";
import {DexcaliburConnectionParams, DexcaliburConnectionParamsList} from "./remote/DexcaliburConnectionParams.js";
import {ConnectionSettingsException} from "./errors/ConnectionSettingsException.js";
import {IncomingValue, SanitizedValue, UnsafeValue} from "./security/SanitizedValue.js";
import {GlobalSettingsException} from "./errors/GlobalSettingsException.js";
import {SecurityZone} from "./security/SecurityZone.js";


const LOG_FILE = (process.env.DXC_LOG_PATH ? process.env.DXC_LOG_PATH : null);
function __log( pMessage:string):void{
    if(LOG_FILE!=null)
        _fs_.appendFileSync(LOG_FILE, pMessage+_os_.EOL);
}

export interface WebServerOptions {
    http?:number;
    ws?:number;
    guis?:string[];
    headless?:boolean;
}

export interface ServerOptions {
    auth?:AuthenticationOptions;
    registry?:string;
    registryAPI?:string;
    workspace?:string;
    heapSize?:number;
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
    export class ServerSettings extends Settings.AbstractSettings {


        static DEFAULT_HEAP_SIZE = 4096;

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
        private heapSize;

        /**
         * Default architecture
         * @field
         * @type number
         * @private
         */
        private defaultArch = 'aarch64';

        constructor( pParent:GlobalSettings, pConfig:ServerOptions={}) {

            super(pParent);

            if(pConfig.workspace!=null){
                this.space = DexcaliburWorkspace.getInstance(pConfig.workspace);
            }

            if(pConfig.registry!=null){
                this.registry = new DexcaliburRegistry(pConfig.registry, pConfig.registryAPI);
            }

            if(pConfig.auth != null){
                this.auth = new AuthenticationSettings(this, pConfig.auth);
            }else{
                this.auth = new AuthenticationSettings(this);
            }

            if(pConfig.heapSize!=null){
                this.heapSize = pConfig.heapSize;
            }

            if(this.heapSize == null){
                this.heapSize = ServerSettings.DEFAULT_HEAP_SIZE;
            }


        }

        getDefaultArchitecture():string {
            return this.defaultArch;
        }

        getRegistry():DexcaliburRegistry {
            return this.registry;
        }

        setRegistry(pRegistry:DexcaliburRegistry):void {
            this.registry = pRegistry;
        }

        getWorkspace():DexcaliburWorkspace {
            return this.space;
        }

        getAuthenticationSettings():AuthenticationSettings {
            return this.auth;
        }

        setAuthenticationSettings(pSettings:AuthenticationSettings):void {
            this.auth = pSettings;
        }

        /**
         *
         * @param pPath
         * @param pOverride
         */
        setWorkspace(pPath:string, pOverride = false):void {
            this.space = DexcaliburWorkspace.getInstance(pPath,pOverride);
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
                case "defaultArch":
                    if(ServerSettings.SUPPORTED_ARCH.indexOf(pValue)>-1){
                        return new SanitizedValue(pName, pValue);
                    }else{
                        return new UnsafeValue(pName, pValue);
                    }
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
                registry: (this.registry!=null)? this.registry.url : null,
                registryAPI: (this.registry!=null)? this.registry.api : null,
                auth: this.auth!=null ? this.auth.toObject(pZone) : null,
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
        private _http:number;

        /**
         * WebSocket port for internal web server
         * @field
         * @type {string}
         * @private
         */
        private _ws:number;


        /**
         * List of GUIs installed and exposed at runtime
         * Keep it empty to run in headless mode (only REST API endpoints are exposed)
         * @field
         * @type {string[]} List of GUIs names installed
         * @private
         */
        private guis:string[] = [];

        /**
         * Create an object which hold server settings from global settings files and env var
         *
         * param {number} pHttp HTTP port of web server. Can be override by DXC_HTTP_PORT env var
         * param {number} pWs Websocket port of web server. Can be override by DXC_WS_PORT env var
         * @param {GlobalSettings} pParent Parent settings
         * @param {WebServerOptions} pConfig Options values
         * @constructor
         * @since 1.0.0
         */
        constructor( pParent:GlobalSettings, pConfig:WebServerOptions= {} /*Http:number, pWs:number*/) {
            super(pParent);

            this._http = (process.env.DXC_HTTP_PORT ? parseInt(process.env.DXC_HTTP_PORT,10) : -1);
            this._ws = (process.env.DXC_WS_PORT ? parseInt(process.env.DXC_WS_PORT,10) : -1);

            if(this._http === -1){
                this._http = pConfig.http != null ? pConfig.http : DEFAULT_HTTP_PORT;
            }

            if(this._ws === -1){
                this._ws = pConfig.ws != null ? pConfig.ws : DEFAULT_WS_PORT;
            }
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

        getGUIs():string[] {
            return this.guis;
        }

        isHeadless():boolean {
            return (this.guis.length==0);
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
                case "guis":
                    if(Array.isArray(pValue)){
                        const sanitized:string[] = [];
                        pValue.map( x => {
                            if(/^[a-zA-Z0-9_:=]+$/.test(x)){
                                sanitized.push(x);
                            }
                        });
                        return new SanitizedValue(pName, sanitized);
                    }else{
                        return new UnsafeValue(pName, pValue);
                    }
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
                case "guis":
                    this.guis = pValue.getValue();
                    break;
                default:
                    throw GlobalSettingsException.SETTING_UNKNOW();
            }
        }

        toObject(pZone:SecurityZone = SecurityZone.PUBLIC): any {
            return {
                http: this._http,
                ws: this._ws,
                guis: this.guis
            }
        }
    }

    export class ExternalSettings extends Settings.AbstractSettings {

        private _all: any;


        constructor( pParent:GlobalSettings, pConfig:any) {
            super(pParent);
            this._all = pConfig;


            if(this._all==null){
                this._all = {};
            }
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

        /**
         * To add "dynamically" a new settings to ExternalSettings
         *
         * @param pName
         * @param pValue
         * @method
         */
        add( pName:string, pValue:any){
            this._all[pName] = pValue;
            this.save();
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


        sanitize(): IncomingValue {
            throw GlobalSettingsException.SETTING_UNKNOW();
        }


        update():void {
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


    export class    ConnectionSettings extends Settings.AbstractSettings {

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
         * To save a connection configuration into settings
         * @param {DexcaliburConnectionParams} pParam Parameters to perform authentication to a remote Dexcalibur server
         * @param {string} pSaveFile Optional. Alternative path where connection settings will be saved
         * @return {any}
         * @throws {ConnectionSettingsException}
         * @method
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

            return {
                all: Object.values(this._all)
            };
        }
    }

    /**
     * Represent global configuration
     * @class
     * @export
     */
    export class GlobalSettings extends Settings.AbstractSettings {

        private _path: string = null;

        private bin: Settings.ExternalSettings;
        private server: Settings.ServerSettings;
        private web: Settings.WebServerSettings;
        private conn: ConnectionSettings = null;

        /**
         *
         * @param pConfig
         * @constructor
         */
        constructor(pConfig: any = {}, pForceConfig = true) {
            super(null);

            this.server = new Settings.ServerSettings(this, pConfig.server); // server
            this.bin = new Settings.ExternalSettings(this, pConfig.bin);
            this.web = new Settings.WebServerSettings(this, pConfig.web);

            if(pConfig.server!=null && !pForceConfig) {
                if(pConfig.server.hasOwnProperty('http') != null && pConfig.server.hasOwnProperty('ws') != null){
                    this.web = new Settings.WebServerSettings(this, {
                        http: pConfig.server.http,
                        ws: pConfig.server.ws
                    }); //(pConfig.http, pConfig.ws);
                }
            }


            if (pConfig.hasOwnProperty('conn')) {
                this.conn = new ConnectionSettings(this, pConfig.conn);
            }
        }

        /**
         * To get the default location of the file where global stetings are stored
         *
         * Current path :   $HOME / .dexcalibur / dxc.json
         *
         * @static
         */
        static getDefaultLocation(): string {
            /*let p:string;
            switch(require('os').platform()){
                case 'darwin':
                    p = _path_.join( require('os').homedir(), 'Application Support', 'DexcaliburPRO', GLOBAL_CFG_NAME);
                    break;
            }*/
            // old path (v <= 0.7.x)

            //console.log("get default location at "+(_path_.join(_os_.homedir(), '.dexcalibur', Settings.GLOBAL_CFG_NAME)));

            return _path_.join(_os_.homedir(), '.dexcalibur', Settings.GLOBAL_CFG_NAME);
        }

        /**
         * To create a basic configuration file at pPath
         *
         * @param {string} pPath The file path
         * @static
         */
        static createDefaultConfig(pPath: string): void {

            const home =_path_.dirname(pPath);
            if(_fs_.existsSync(home)==false){
                _fs_.mkdirSync(home, 0o666);
            }

            const config = {
                server: {
                    bin:{
                        java:"java",
                        python:"python3",
                        frida:null, //"frida",
                        radare2:null, //"r2",
                        adb: null, //"/Users/salade/Documents/dxc3/.dxc/bin/platform-tools/adb",
                        apktool: null, //"/Users/salade/Documents/dxc3/.dxc/bin/apktool.jar",
                        baksmali: null, //"/Users/salade/Documents/dxc3/.dxc/bin/baksmali.jar",
                        binwalk: null, //"binwalk"
                    },
                    auth:{
                        db:{
                            dbms:"sqlite",
                            user:null,
                            pwd:null,
                            port:0,
                            uri:_path_.join( home, 'users.db')
                        },
                        policy:{
                            enforced:false
                        },
                        supported:["pwd"]
                    },
                    workspace: "",
                    embedded: false,
                    registry: "https://github.com/FrenchYeti/dexcalibur-registry/raw/master/",
                    registryAPI: "https://github.com/FrenchYeti/dexcalibur-registry/contents/",
                    env: {
                        DXC_LOG_PATH: _path_.join(home, 'server.logs')
                    },
                    log: true,
                    options: {
                        port: 8000,
                        ws: 8001,
                        restore: false
                    }
                },
                gui: {
                    serve: false,
                    devTools: true,
                    log: true,
                    env: {
                        DXC_LOG_PATH: _path_.join(home, 'gui.logs')
                    }
                }
            };

            _fs_.writeFileSync(pPath, JSON.stringify(config));
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
        static load(pConfigPath: string = undefined, pOverride: any = undefined): GlobalSettings {
            let path: string;
            let gs: GlobalSettings = null;

            if (process.env.DEXCALIBUR_HOME != null) {
                path = _path_.join(process.env.DEXCALIBUR_HOME, Settings.GLOBAL_CFG_NAME);
            } else if (pConfigPath !== undefined) {
                path = pConfigPath;
            } else {
                path = GlobalSettings.getDefaultLocation();
            }

            try {
                if (!_fs_.existsSync(path)) {
                    GlobalSettings.createDefaultConfig(path);
                }

                const data: any = JSON.parse(_fs_.readFileSync(path).toString());

                if (pOverride != null) {
                    for (const i in pOverride) data[i] = pOverride[i];
                }

                __log("[GLOBAL SETTINGS] load : success : " + JSON.stringify(data));

                gs = new GlobalSettings(data);
                gs.setPath(path);
            } catch (err) {
                console.log(err)
                __log("[GLOBAL SETTINGS] load : error : " + err.message + " " + pConfigPath + "\n" + err.stack);
            }

            return gs;
        }


        sanitize(pName: string, pValue: any): IncomingValue {
            throw GlobalSettingsException.SETTING_UNKNOW();
        }


        update(pValue: IncomingValue): void {
            throw GlobalSettingsException.SETTING_UNKNOW();
        }

        /**
         * To set location of the file containing current settings
         *
         * @param pPath
         */
        setPath(pPath: string): void {
            this._path = pPath;
        }
        
        getPath():string {
            return this._path;
        }
        

        /**
         * To save global settings
         *
         * @param pDestPath
         */
        save(pDestPath: string = null) {
            // if the path of the new file, is the same than current file,
            // then create a backup of current config
            if (this._path != null && (pDestPath == null || pDestPath === this._path)) {
                _fs_.copyFileSync(this._path, this._path + '.bkp');
            }

            _fs_.writeFileSync(
                pDestPath != null ? pDestPath : this._path,
                JSON.stringify(
                    this.toObject()
                ));
        }

        getServerSettings(): Settings.ServerSettings {
            return this.server;
        }

        getExternalSettings(): ExternalSettings {
            return this.bin;
        }

        getWebserverSettings(): Settings.WebServerSettings {
            return this.web;
        }

        getConnectionSettings(): ConnectionSettings {
            return this.conn;
        }

        toObject(pZone: SecurityZone = SecurityZone.PUBLIC): any {
            const o: any = {
                bin: this.bin.toObject(pZone),
                server: this.server.toObject(pZone),
                web: this.web.toObject(pZone)
            };

            if (this.conn != null) {
                o.conn = this.conn.toObject(pZone);
            }

            // deprecated
            o.server.http = this.web.getHttpPort();
            // deprecated
            o.server.ws = this.web.getWsPort();

            return o;
        }

        toJson(pZone: SecurityZone = SecurityZone.PRIVATE): string {
            return JSON.stringify(this.toObject(pZone));
        }

        createConnectionSettings(): ConnectionSettings {
            return this.conn = ConnectionSettings.newInstance(this, "local", "127.0.0.1", this.getWebserverSettings().getHttpPort());
        }
    }
}

