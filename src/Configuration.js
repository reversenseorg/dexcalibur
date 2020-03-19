const _fs_ = require("fs");

const Logger = require("./Logger.js")();
const Platform = require("./Platform.js");
const Path = require("path");
const FridaHelper = require("./FridaHelper");

const NO_EXPORT = ["platform_available"];
const ENCODING = ["utf8","latin1"];

class Configuration {

    static DXCWS = 0b10;
    static PLATFORMS = 0b01;

    constructor() {
        this.ready = false;

        // reference to DexcaliburWorkspace object
        this.workspace = null;

        /*
         * Dexcalibur's workspace
         * @field
         */
        //this.dxcWorkspace = null;


        // the default encoding ()
        this.encoding = null; //"utf8"

        // Dexcalibur src location
        this.dexcaliburPath = null,

        // workspace location 
        // the workspace contains a directory per project folder where analyzed APK and data are stored
        this.workspacePath = null, //"/tmp/ws/",

        // ADB location
        this.adbPath = null,
        this.androidSdkPath = null,

        // APKTool location
        this.apktPath = null,

        // Optional : SDB location
        this.sdbPath = null,

        // Java bin path
        this.javaBinPath = "java"; //"java";

        // frida binary
        this.fridaBin = 'frida';

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
                case "workspacePath":
                    console.log(_fs_.existsSync(this[i]), this[i]);
                    if(_fs_.existsSync(this[i]) == false){
                        verif.msg[i] = `Invalid path : file or directory not found`;
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

    getFridaBin(){
        return this.fridaBin;
    }

    /**
     * To detect if Frida is installed and get version
     */
    getLocalFridaVersion(){
        return FridaHelper.getLocalFridaVersion(this.fridaBin);
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
                } else {
                    Logger.error("[Configuration::import] The property '", i, '" cannot be overwrote.');
                }
            } else if (!force) {
                Logger.error("[Configuration::import] The property '", i, '" not exists.');
            }
        }

        if(typeof this.web_port == "string"){
            this.web_port = parseInt(this.web_port, 10);
        }

        this.autocomplete();

        for (let i in this.platform_available) {
            this.platform_available[i] = new Platform(this.platform_available[i], Path.join( __dirname, "..", "APIs"));
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
        if (this.bridge == null) {
            this.bridge = "adb";
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
        return Path.join(this.dexcaliburPath, "./../bin");
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

    getApktoolPath() {
        return this.apktPath;
    }


    getAdbPath() {
        return this.adbPath;
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