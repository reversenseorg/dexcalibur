
const Logger = require("./Logger.js")();
const _MD5_ = require("md5");
const _FS_ = require('fs');
const _path_ = require('path');

const DeviceProfile = require('./DeviceProfile');
const Platform = require('./Platform');
const PlatformManager = require('./PlatformManager');
const DexcaliburWorkspace = require('./DexcaliburWorkspace');
const Utils = require("./Utils");

const DEV = {
    UNKNOW:0x0,
    USB: 0x1,
    EMU: 0x2,
    ADB: 0x3,
    SDB: 0x4
};
const DEV_NAME = ['unknow','usb','emu','adb','sdb'];


const OS = {
    ANDROID: 0x0,
    LINUX: 0x1,
    TIZEN: 0x2
};
const OS_NAME = ['android','linux','tizen'];



 /**
 * This class represents a device
 * 
 * @class
 * @author Georges-B MICHEL
 */
class Device
{
    constructor(config=null){
        this.type = null;
        this.connected = false;

        this.bridge = null;
        this.usb = null;
        this.selected = false;
        
        // the operation mode
        this.opmode = null;
        this.isEmulated = false;


        this.uid = null;
        this.id =  null;
        this.authorized = true;
        this.model = null;
        this.product = null;
        this.device = null;
        this.transportId = null;
        this.usbQualifier = null;

        this.profile = null;
        this.platform = null;

        this.frida = {
            server: null
        };

        this.enrolled = false;

        if(config !== null)
            for(let i in config) this[i] = config[i];    
    }

    setEnrolled( pStatus = true){
        this.enrolled = pStatus;

        return this;
    }

    isEnrolled(){
        return this.enrolled;
    }

    getProfile(){
        return this.profile;
    }

    /**
     * To get enrollment status
     * 
     * @returns {Boolean} Enrollement status : TRUE if the device is enrolled and frida ready, else FALSE
     * @method
     */
    isFridaReady(){
        return this.enrolled;
    }

    /**
     * To get device status : connected / disconnected
     * 
     * @returns {Boolean} TRUE if the device is connected, else FALSE  
     * @method
     */
    isConnected(){
        return (this.connected == true);
    }

    /**
    * To get authorized status
    * 
    * @returns {Boolean} TRUE if the device is authorized, else FALSE  
    * @method
    */
    isAuthorized(){
        return (this.authorized == true);
    }

    /**
     * To disconnect "logically" a device.
     * 
     * This flag is involved into connected device monitoring.
     * 
     * @method
     */
    disconnect(){
        this.connected = false;
    }

    /**
     * 
     * @param {*} pPath 
     */
    setFridaServer( pPath){
        this.frida.server = pPath;
    }

    /**
     * @method
     */
    getFridaServerPath(){
        return this.frida.server;
    }

    /**
     * To setup internal device UID
     * 
     * Since several device can have the same DeviceID value,
     * UID is built by mixing several DeviceID with several data from `qualifier` array
     * 
     * 
     * @param {String} deviceID Value of DeviceID as returned by the device
     * @param {String[]} qualifier Additional data 
     */
    setUID(deviceID, qualifier){
        this.uid = deviceID;
/*        for(let k in qualifier){
            this.uid += "/"+k+"/"+qualifier[k];
        }*/
        //this.uid = _MD5_(this.uid);
    }


    /**
     * To get device UID
     * 
     * TODO : fix typo
     * 
     * <b>Warning : Device UID is the Dexcalibur internal UID. 
     * It is not the DeviceID as returned by the device. </b>
     * 
     * @returns {String} Internal device UID
     */
    getUID(){
        return this.uid;
    }

    getBridge(){
        return this.bridge;
    }

    update( pDevice){
        this.bridge = pDevice.bridge;
        this.model = pDevice.model;
        this.device = pDevice.device;
        this.product = pDevice.product;
        this.transportId = pDevice.transportId;
        this.connected = pDevice.connected;
        this.authorized = pDevice.authorized;
        this.usbQualifier = pDevice.usbQualifier;
    }

    flagAsUnauthorized(){
        this.authorized = false;
    }

    setTransportId(id){
        this.transportId = id;
    }

    setUsbQualifier(id){
        this.usbQualifier = id;
        if(this.uid==null && this.id != null) 
            this.setUID( this.id, {
                usb: id
            });
    }

    setModel(name){
        this.model = name;
    }

    setProduct(name){
        this.product = name;
    }

    setDevice(name){
        this.device = name;
    }

    exec(pCommand, pCallbacks){
        return this.bridge.shellWithEH(pCommand, pCallbacks);
    }

    execSync(pCommand){
        return this.bridge.shellWithEHsync(pCommand);
    }


    async privilegedExecSync(pCommand, pOtions=null){
        if(pOtions == null)
            return await this.bridge.privilegedShell(pCommand);
        else 
            return await this.bridge.privilegedShell(pCommand, pOtions);
    }

    getPlatform(){
        return this.platform;
    }

    setPlatform( pPlatform){
        this.platform = pPlatform;
    }



    /**
     * 
     * @param {Path|String} pRemotePath 
     * @param {Path|String} pLocalPath 
     */ 
    pull(pRemotePath, pLocalPath){
        let c = null;
        c = this.bridge.pull(pRemotePath, pLocalPath);
        console.log(c);
        return c;
    }

    /**
     * To pull a fil from a device and store it into temporary folder
     * 
     * @param {String} pRemotePath 
     * @method
     */
    pullTemp(pRemotePath){
        if(this.bridge == null){
            throw new Error("[DEVICE] Bridge is not ready");
        }
        let path = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(),
            Utils.randString( 16, Utils.ALPHANUM)+'.remote.apk'
        );

        let o = this.bridge.pull( pRemotePath, path);

        return path;
    }

    /**
     * To push an executable binary 
     * 
     * @param {Path|String} pLocalPath 
     * @param {Path|String} pRemotePath 
     */
    pushBinary( pLocalPath, pRemotePath){
        let success = this.bridge.push( pLocalPath, pRemotePath);
        if(!success){
            throw new Error(`[DEVICE] Fail to push '${pLocalPath}' file to '${pRemotePath}'`);
        }

        return this.bridge.shell(`chmod 777 ${pRemotePath}`);
    }

    /**
     * 
     * @param {*} pPkgIdentifier 
     * @param {*} pLocalPath 
     * @returns {Boolean} Return TRUE if file has been successfully downloaded, else FALSE
     * @throws {BridgeException} 
     */
    pullPackage( pPkgIdentifier, pLocalPath){
        let path = null;

        // get package path of the app
        path = this.bridge.getPackagePath(pPkgIdentifier);

        // pull the file
        this.bridge.pull( path, pLocalPath);       

        return _FS_.existsSync(pLocalPath);
    }



    /**
     * 
     * @deprecated
     * @param {Object} data 
     * @param {Object} callbacks 
     * @param {IntentFilter} pIntentFilter An intance of the intent filter 
     * @param {Boolean} force 
     */
    sendIntent(data, callbacks=null, pIntentFilter=null, force=false){
        let msg = {stdout:null, stderr:null};
        let pkg='', cmd='am start ';
        let act = null, cat=null;
        let cb = null;

        if(pIntentFilter==null){
            Logger.error("[TODO] Implement sendCustomIntent() : intent builder without autocompleting");
            callbacks.error("[TODO] Implement sendCustomIntent() : intent builder without autocompleting");
            return;
            // this.sendCustomIntent(data,callbacks);
        }

        if(data.category==null && force==false){
            if(pIntentFilter.getCategories().length-1 > 0){
                callbacks.error("This intent filter has several categories, and none is given");
                return;
            }
            else if(pIntentFilter.getCategories().length == 1){
                cat = pIntentFilter.getCategories()[0].getName();
            }
        }else{
            cat = data.category;
        }

        if(data.action==null && force == false){
            if(pIntentFilter.getActions().length-1 > 0){
                callbacks.error("This intent filter has several action, and none is given");
                return;
            }
            else if(pIntentFilter.getActions().length == 1){
                act = pIntentFilter.getActions()[0].getName();
            }
        }else{
            act = data.action;
        }

        if(callbacks != null){
            cb = function(err,stdout,stderr){
                if(err && callbacks.error!=null){
                    callbacks.error(err);
                }
                else if(stderr && callbacks.stderr!=null){
                    Logger.error(stderr);
                    callbacks.stderr(stderr);
                }else{
                    callbacks.stdout(stdout);
                }
            }
        }

        if(data.app !== null) 
            pkg = data.app;

        try{
            if(act != null && act.length > 0) cmd += `-a ${act} `;
            if(cat != null && cat.length > 0) cmd += `-c ${cat} `;
            if(data.data != null && data.data.length > 0) cmd += `-d ${data.data} `;
            
            msg.stdout = this.bridge.shellWithEH(cmd+' '+pkg, cb);
        }catch(err){
            msg.stderr = err.stderr;
            Logger.error("[INTENT]",err.stderr);
        }

        return msg;
    }


    /**
    * To check if the given file path exists on the device
    * @param {string} file The file path to check
    * @returns {boolean} Returns TRUE if the file exists on the device, else FALSE
    * @function 
    */
    hasFile(file, privileged=true){
        let ret="", i=0;

        if(privileged)
            ret = this.bridge.hasFilePrivileged(file).toString("ascii");
        else
            ret = this.bridge.hasFile(file).toString("ascii");
            
        return (ret.indexOf(file)==0);
    };


    async performProfiling( pOptions){

        console.log(this.bridge);

        if(this.bridge != null){
            this.profile = await this.bridge.performProfiling();
        }

        return true;
    }


    /**
     * To unserialize a Device from JSON string
     * 
     * @param {*} pJsonObject 
     * @param {*} pOverride 
     * @returns {String} JSON-serialized object
     * @method 
     */
    static fromJsonObject( pJsonObject, pOverride = {}){
        let dev = new Device();
        for(let i in pJsonObject){
            switch(i){
                case 'type':
                    dev[i] = OS_NAME.indexOf(pJsonObject[i]);
                    break;

                case 'bridge':
                    dev[i] = DEV_NAME.indexOf(pJsonObject[i]);
                    break;

                case 'profile':
                    dev[i] = ((pJsonObject[i] != null)? DeviceProfile.fromJsonObject(pJsonObject[i]) : null);
                    break;

                case 'platform':
                    dev[i] = ((pJsonObject[i] != null)? PlatformManager.getInstance().getPlatform(pJsonObject[i]) : null);
                    break;
                
                default:
                    dev[i] = pJsonObject[i];
                    break;
            }      
            
        }

        for(let i in pOverride){
            dev[i] = pOverride[i];
        }

        return dev;
    }

    /**
     * To serialize the Device to JSON string
     * 
     * @param {Object} pOverride A collection overrided field
     * @returns {JsonObject} JSON-serialized object
     * @method 
     */
    toJsonObject( pOverride = {}){
        let json = new Object();
        for(let i in this){
            switch(i){
                case 'type':
                    json[i] = OS_NAME[this[i]];
                    break;

                case 'bridge':
                    json[i] = DEV_NAME[this[i]];
                    break;

                case 'profile':
                    json[i] = ((this[i] instanceof DeviceProfile)? this[i].toJsonObject() : null);
                    break;

                case 'platform':
                    json[i] = ((this[i] instanceof Platform)? this[i].getUID() : null);
                    break;
                
                default:
                    json[i] = this[i];
                    break;
            }                  
        }

        for(let i in pOverride){
            json[i] = pOverride[i];
        }
        return json;
    }
}

module.exports = Device;