import * as _fs_ from 'fs';
import * as _path_ from 'path';
import * as _os_ from 'os';


import DexcaliburWorkspace from './DexcaliburWorkspace.js' ;
import {ExternalTool, ExternalToolMap} from "./ExternalTool.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {Nullable} from "./core/IStringIndex.js";


const NO_EXPORT = ["platform_available"];
const ENCODING = ["utf8","utf16","latin1"];


/**
 * Deprecated ?
 */
export default class Configuration {

    static DXCWS:number = 0b10;
    static PLATFORMS:number = 0b01;

    ready:boolean = false;

    // the default encoding ()
    encoding:string = null; //"utf8"

    // Dexcalibur src location
    // dexcaliburPath = _path_.join( __dirname, '..');

    // workspace location
    // the workspace contains a directory per project folder where analyzed APK and data are stored
    workspacePath:string = null; //"/tmp/ws/",

    // ADB location
    adbPath:string = null;

    // Java bin path
    javaBinPath:string = "java"; //"java";

    // temporary files location
    tmpDir:string = null; // "/tmp/",

    // Default web server config
    web_port:number = null; // 8002,

    workspace:DexcaliburWorkspace = null;

    connector:string = 'inmemory';

    exttools:ExternalToolMap = {};

    constructor() {
        this.exttools = {
            binwalk: new ExternalTool('binwalk','binwalk')
        };
    }



    /**
     * To create a Configuration object from a serialized Configuration object
     * @param {Object} pData Parameters values
     * @returns {Configuration} Configuration object filled with given data
     * @method
     */
    static from( pData:any):Configuration{
        let cfg:Configuration = new Configuration();

        cfg.import(pData, false, true);

        return cfg;
    }

    /**
     * To build a default configuration instance using HOME PATH
     */
    static getDefault():Configuration{
        let cfg:Configuration = new Configuration();
        
        cfg.encoding = 'utf8';
        cfg.workspace = new DexcaliburWorkspace( _path_.join( _os_.homedir(), 'dexcaliburWS') );
        cfg.web_port = 8000;
        cfg.connector = 'inmemory';

        cfg.workspacePath = _path_.join( _os_.homedir(), 'dexcaliburWS');
        cfg.tmpDir = _path_.join( cfg.workspacePath, '.tmp');

        return cfg;
    }

    static verifyField( pName:string, pValue:any):string{
        let result:string = null;

        switch(pName)
        {
            case "encoding":
                if(ENCODING.indexOf(pValue)==-1){
                    result = `Invalid encoding. Supported : UTF8, Latin1`;
                }
                break;
            case "adbPath":
            case "tmpDir":
            case "workspacePath":
                if(_fs_.existsSync(pValue) == true){
                    result = `Invalid path, this folder already exists.`;                  
                }
                break;
            case "web_port":
                if(pValue > 65535 || pValue < 0){
                    result = `Invalid port number`;           
                }
                break;
        }

        return result;
    }

    verify():any{
        let verif:any ={ length:0, msg:{} };
        for(let i in this){

            switch(i)
            {
                case "encoding":
                    if(ENCODING.indexOf(this.encoding)==-1){
                        verif.msg[i] = `Invalid encoding. Supported : UTF8, Latin1`;
                        verif.length++;
                    }
                    break;
                case "adbPath":
                    if(_fs_.existsSync(this.adbPath) == true){
                        verif.msg[i] = `Invalid adb path: folder not found`;
                        verif.length++;
                    }
                    break;
                case "tmpDir":
                    if(_fs_.existsSync(this.tmpDir) == true){
                        verif.msg[i] = `Invalid path: folder not found`;
                        verif.length++;                        
                    }
                    break;
                case "workspacePath":
                    if(_fs_.existsSync(this.workspacePath) == true){
                        verif.msg[i] = `Invalid path: this folder already exists.`;
                        verif.length++;                        
                    }
                    break;
                case "web_port":
                    if(this.web_port > 65535 || this.web_port < 0){
                        verif.msg.web_port = `Invalid port number`;
                        verif.length++;                        
                    }
                    break;
            }
        }

        return verif;
    }

    /**
     * 
     * @param {*} pName 
     * @param {*} pValue 
     */
    setParameter( pName:string, pValue:any){
        this[pName] = pValue;
    }

    /**
     * To clone the current instance of Configuration
     * @returns {Configuration} A clone of current instance
     * @method
     */
    clone():Configuration{
        let cfg:any = new Configuration();
        for(let i in this){
            cfg[i] = this[i];
        } 
        return cfg as Configuration;
    }


    

    getDefaultConnector():string{
        return this.connector;
    }


    /**
     * To get the Java binary path (absolute or relative to $PATH) 
     *  
     * @returns {String} Java binary path
     * @function 
     */
    getJavaBin():string {
        return this.javaBinPath;
    }

    /**
     * To save the configuration into a JSON file
     * 
     * @param {String} path File path where export the configuration
     * @function
     */
    exportTo(path):boolean {
        // remove file
        if(_fs_.existsSync(path)==true)
            _fs_.unlinkSync(path);
        // create file
        _fs_.openSync(path,'w+');

        // write
        _fs_.writeFileSync(path, JSON.stringify(this.toJsonObject()))
        
        
        return true;
    }

    /**
     * To save configuration into Dexcalibur workspace
     * 
     * It creates a backup of current configuration, and replace
     * actual configuration file by freshly exported config
     * 
     * @param {Configuration} pNewConfig 
     */
    save( pNewConfig:Configuration){
        // if Dexcalibur workspace path has changed
        // then current config should be backed up into new Workspace 
        // in order to allow user to restore old config from new workspace
        /*if( this.workspacePath !== pNewConfig.workspacePath){
            _fs_.copyFile( _path_.join( ),  )
        }else{

        }*/
    }

    /**
     *  To import a configuration.
     * 
     *  @param {Object}     data    Configuration data
     *  @param {Boolean}    force   Force not existing properties to be created
     *  @param {Boolean}    overwrite   Override properties already setted
     *  @function
     */
    import(data:any, force:boolean = false, overwrite:boolean = false):boolean {
        let isEmpty:boolean = null;
        for (let i in data) {
            if (this[i] !== undefined || force) {
                if ((this[i] != null && overwrite) || this[i] == null) {
                    this[i] = data[i];
                } 
            }
        }

        if(typeof this.web_port == "string"){
            this.web_port = parseInt(this.web_port, 10);
        }

        this.autocomplete();

        /* DEPRECATED
        for (let i in this.platform_available) {
            this.platform_available[i] = new Platform(this.platform_available[i], _path_.join( __dirname, "..", "APIs"));
        }
        */

        this.ready = true;

        return true;
    }



    /**
     * To complete empty fields with default value :
     *  - adbPath
     *  - useEmulator
     *  - bridge
     *  - web_port
     * 
     * @function
     */
    autocomplete() {
        if (this.web_port == null) {
            this.web_port = 8000;
        }
    }


    /**
     * To get the workspace directory path where the projects 
     * are stored
     * 
     * @returns {String} Workspace path
     * @function 
     */
    getWorkspaceDir() {
        return this.workspacePath;
    }

    getTmpDir() {
        return this.tmpDir;
    }


    getWebPort():number {
        return this.web_port;
    }

    getExternalTools():ExternalToolMap {
        return this.exttools;
    }

    /**
     * To get the external tool of the specified UID
     *
     * @param {string} pUID
     * @return {ExternalTool}
     * @method
     * @since 1.0.0
     */
    getExternalTool( pUID:string):ExternalTool {
        return this.exttools[pUID];
    }

    toJsonObject( pInclude=Configuration.PLATFORMS):any {
        let o:any = new Object();

        for (let i in this) {
            if(i=='ready') continue;
            switch (i) {
                case "workspace":
                    if(pInclude & Configuration.DXCWS){
                        o[i] = this.workspace.getLocation();
                    }
                    break;
                default:
                    if (typeof this[i] != 'function')
                        o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "Configuration");
        return o;
    }
}
