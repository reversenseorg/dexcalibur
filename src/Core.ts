import DexcaliburRegistry from "./DexcaliburRegistry";
import * as _fs_ from "fs";
import * as _path_ from "path";
import DexcaliburWorkspace from "./DexcaliburWorkspace";
import FridaHelper from "./FridaHelper";
import ApkHelper from "./ApkHelper";
import {BinwalkHelper} from "./BinwalkHelper";
import JavaHelper from "./JavaHelper";
import DexHelper from "./DexHelper";


export namespace Core {


    /**
     * Declare class related to global configuration
     * @namespace
     */
    export namespace Configuration {

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

            getTool( pUID:string) :any {
                return this._all[pUID];
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


    export namespace External {


        import ExternalSettings = Core.Configuration.ExternalSettings;

        export class Tool {

            _uid: string;
            /**
             * Hold tool version
             */
            private _v:string;

            private _p: string;


            /**
             *
             * @param pUID
             * @param pConfig
             */
            constructor( pUID:string, pConfig:Core.Configuration.ExternalToolParams) {
                this._uid = pUID
                this._p = pConfig.path;
            }

            getPath():string {
                return this._p;
            }

            getVersion():string {
                return this._v;
            }

            getUID():string {
                return this._uid;
            }
        }

        export interface ToolSet  {
            [uid :string] :Tool;
        }

        export class ExternalHelper {

            protected static tool:Tool;

            public static init( pTool:Tool){
                this.tool = pTool;
            }

            public static getExtPath():string {
                if(this.tool==undefined){
                    throw new Error('Tool is not configured');
                }
                return this.tool.getPath();
            }
        }

        export class ToolManager {

            private tools: ToolSet;

            constructor( pConfig:ExternalSettings) {
                this.tools = {};

                for(let i in pConfig){
                    if(pConfig.hasOwnProperty(i)){
                        this.tools[i] = new Tool(i, pConfig[i]);
                    }
                }
            }

            /**
             * To configure application wide helpers leveraging external tools
             */
            configureHelpers():void {
                // r2helper uses r2-pipe
                // adb is configured by DeviceManager
                // python is not yet used

                // built-in helpers
                JavaHelper.init(this.tools.java);
                FridaHelper.init(this.tools.frida);
                ApkHelper.init(this.tools.apktool);
                BinwalkHelper.init(this.tools.binwalk);
                DexHelper.init(this.tools.baksmali);
            }


            getTool( pUID:string) :Tool {
                return this.tools[pUID];
            }

            addTool( pTool:Tool):void {
                this.tools[pTool.getUID()] = pTool;
            }
        }
    }
}