const _fs_ = require("fs");
const _path_ = require("path");
const _os_ = require("os");


const Logger = require("./Logger.js")();
const Platform = require("./Platform.js");
const FridaHelper = require("./FridaHelper");
const DexcaliburWorkspace = require('./DexcaliburWorkspace');

const NO_EXPORT = ["platform_available"];
const ENCODING = ["utf8","utf16","latin1"];

class Configuration {

    static DXCWS = 0b10;
    static PLATFORMS = 0b01;

    constructor() {
        this.ready = false;

        // the default encoding ()
        this.encoding = null; //"utf8"

        // Dexcalibur src location
        // this.dexcaliburPath = _path_.join( __dirname, '..');

        // workspace location 
        // the workspace contains a directory per project folder where analyzed APK and data are stored
        this.workspacePath = null, //"/tmp/ws/",

        // ADB location
        this.adbPath = null,
        this.androidSdkPath = null,

        // APKTool location
        // this.apktPath = null,

        // Optional : SDB location
        // this.sdbPath = null,

        // Java bin path
        this.javaBinPath = "java"; //"java";


        // do not modified
        this.deviceId = null; // default : null
        this.useEmulator = null; // default : false

        // temporary files location
        this.tmpDir = null; // "/tmp/",

        // default bridge
        this.bridge = null; // "adb",

        // Default web server config
        this.web_port = null; // 8002,

        // Optional : Database config
        // db_host = "localhost",
        // db_port = "27017",

        this.platform_target = null;

        /*
        -    this.platform_available = {
        -        "android:7.0.0": {
        -            name: "android",
        -            version : "7.0.0",
        -            binaryPath: "/mnt/dexcalibur/Tools/api22/",
        -            //binaryPath: "APIs/android_22/"
        -        }
        -    };
        */
        this.platform_available = null;
    }

    /**
     * To create a Configuration object from a serialized Configuration object
     * @param {Object} pData Parameters values
     * @returns {Configuration} Configuration object filled with given data
     * @method
     */
    static from( pData){
        let cfg = new Configuration();

        cfg.import(pData, false, true);

        return cfg;
    }

    /**
     * To build a default configuration instance using HOME PATH
     */
    static getDefault(){
        let cfg = new Configuration();
        
        cfg.encoding = 'utf8';
        cfg.workspace = new DexcaliburWorkspace( _path_.join( _os_.homedir(), 'dexcaliburWS') );
        cfg.web_port = 8000;

        cfg.workspacePath = _path_.join( _os_.homedir(), 'dexcaliburWS');
        cfg.tmpDir = _path_.join( cfg.workspacePath, '.tmp');

        return cfg;
    }

    static verifyField( pName, pValue){
        let result = null;

        switch(pName)
        {
            case "encoding":
                if(ENCODING.indexOf(pValue)==-1){
                    result = `Invalid encoding. Supported : UTF8, Latin1`;
                }
                break;
            case "dexcaliburPath":
            case "adbPath":
            case "apktPath":
            case "androidSdkPath":
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

    verify(){
        let verif={ length:0, msg:{} };
        for(let i in this){

            switch(i)
            {
                case "encoding":
                    if(ENCODING.indexOf(this[i])==-1){
                        verif.msg[i] = `Invalid encoding. Supported : UTF8, Latin1`;
                        verif.length++;
                    }
                    break;
                case "dexcaliburPath":
                case "adbPath":
                case "apktPath":
                case "androidSdkPath":
                case "tmpDir":
                    if(_fs_.existsSync(this[i]) == true){
                        verif.msg[i] = `Invalid path: folder not found`;
                        verif.length++;                        
                    }
                    break;
                case "workspacePath":
                    if(_fs_.existsSync(this[i]) == true){
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
    setParameter( pName, pValue){
        this[pName] = pValue;
    }

    /**
     * To clone the current instance of Configuration
     * @returns {Configuration} A clone of current instance
     * @method
     */
    clone(){
        let cfg = new Configuration();
        for(let i in this){
            cfg[i] = this[i];
        } 
        return cfg;
    }


    

    


    /**
     * To get the Java binary path (absolute or relative to $PATH) 
     *  
     * @returns {String} Java binary path
     * @function 
     */
    getJavaBin() {
        return this.javaBinPath;
    }

    /**
     * To save the configuration into a JSON file
     * 
     * @param {String} path File path where export the configuration
     * @function
     */
    exportTo(path) {
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
    save( pNewConfig){
        // if Dexcalibur workspace path has changed
        // then current config should be backed up into new Workspace 
        // in order to allow user to restore old config from new workspace
        if( this.workspacePath !== pNewConfig.workspacePath){
            _fs_.copyFile( _path_.join( ),  )
        }else{

        }
    }

    /**
     *  To import a configuration.
     * 
     *  @param {Object}     data    Configuration data
     *  @param {Boolean}    force   Force not existing properties to be created
     *  @param {Boolean}    overwrite   Override properties already setted
     *  @function
     */
    import(data, force = false, overwrite = false) {
        let isEmpty = null;
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

        for (let i in this.platform_available) {
            this.platform_available[i] = new Platform(this.platform_available[i], _path_.join( __dirname, "..", "APIs"));
        }

        this.ready = true;

        return true;
    }

    /**
     * To get the folder path containg the smali files of the target Android
     * @param {String} platform_name Platform name as defined in the config
     * @return {String} Folder path
     * @function
     * 
     */
    getTargetPlatformPath(platform_name = null) {
        return this.platform_available[this.platform_target].getBinPath();
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
        if (this.adbPath == null) {
            this.adbPath = this.androidSdkPath + "platform-tools/adb";
        }
        if (this.useEmulator == null) {
            this.useEmulator = false;
        }
        if (this.web_port == null) {
            this.web_port = 8000;
        }
    }

    /**
     * To get the absolute path of the Dexcalibur ./src/ folder
     * @returns {String} Dexcalibur src/ path
     * @function 
     */
    getDexcaliburPath() {
        return this.dexcaliburPath;
    }

    getLocalBinPath() {
        return _path_.join(this.dexcaliburPath, "./../bin");
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

    getAndroidSdkDir() {
        return this.androidSdkPath;
    }


    getTmpDir() {
        return this.tmpDir;
    }


    getWebPort() {
        return this.web_port;
    }

    toJsonObject( pInclude=Configuration.PLATFORMS) {
        let o = new Object();

        for (let i in this) {
            if(i=='ready') continue;
            switch (i) {
                case "workspace":
                    if(pInclude & Configuration.DXCWS){
                        o[i] = this[i].toJsonObject();
                    }
                    break;
                case "platform_available":
                    if(pInclude & Configuration.PLATFORMS){
                        o[i] = {};
                        for (let k in this[i])
                            o[i][k] = this[i][k].toJsonObject();
                    }
                    break;
                default:
                    if (typeof this[i] != 'function')
                        o[i] = this[i];
                    break;
            }
        }

        return o;
    }
}

module.exports = Configuration;