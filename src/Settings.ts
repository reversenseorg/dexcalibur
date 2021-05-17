import DexcaliburRegistry from "./DexcaliburRegistry";
import DexcaliburWorkspace from "./DexcaliburWorkspace";
import * as _path_ from "path";
import * as _fs_ from "fs";

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

        constructor( pConfig:any=null) {

            if(pConfig.hasOwnProperty('workspace')){
                this.space = DexcaliburWorkspace.getInstance(pConfig.workspace);
            }

            if(pConfig.hasOwnProperty('registry')){
                this.registry = new DexcaliburRegistry(pConfig.registry, pConfig.registryAPI);
            }
        }

        getRegistry():DexcaliburRegistry {
            return this.registry;
        }

        getWorkspace():DexcaliburWorkspace {
            return this.space;
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
            this.web = new WebServerSettings(pConfig.http, pConfig.ws);
        }

        static getDefaultLocation():string {
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

                _fs_.writeFileSync('/Users/salade/Documents/repos/dexcalibur-codebase/dexcalibur-ts/electron.logs',
                    'Configuration loaded : '+JSON.stringify(data));

                gs = new GlobalSettings(data);
            }catch(err){

                _fs_.writeFileSync('/Users/salade/Documents/repos/dexcalibur-codebase/dexcalibur-ts/electron.logs',
                    'Configuration not loaded : '+err.message);
            }finally {
                return gs;
            }
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