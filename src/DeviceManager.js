var ut = require("./Utils.js");
const AdbWrapper = require("./AdbWrapper.js");


/**
 * To manager connected devices
 * @class
 */
class DeviceManager
{
    /**
     * To create an instance of DeviceManager
     * @param {Configuration} config The configuration object
     */
    constructor(config=null){
        /**
         * Configuration object
         * @field 
         */
        this.config = config;

        /**
         * deffault device to use
         * @field 
         */
        this.defaultDevice = null;

        /**
         * Total amount of connected devices
         * @field 
         */
        this.count = 0;

        /**
         * List of connected devices
         * @field 
         */
        this.devices = {};
      
        /**
         * Supported bridges
         * TODO : add sdb
         * @field 
         */
        this.Bridges = {};
    
        if(this.config != null){
            this.init();
        }
    }

    init(){
        if(this.config.getAdbPath() != null){
            this.Bridges.ADB = new AdbWrapper(this.config.getAdbPath(),null);
        }else{
            throw new Error("[DEVICE MANAGER] Bridge client not configured");
        }
    }

    // scan for available devices 
    /**
     * To detect connected devices from each bridges
     * @function
     */
    scan(){
         // TODO : scan for new devices
         let ret="", dev=[], device=null,re=null,id=null, latestDefault=null;

        this.count = 0;
        if(this.Bridges.ADB.isReady()){

            latestDefault = this.getDefault();
            if(latestDefault != null) latestDefault = latestDefault.uid;
            

            // flush device list
            this.devices = {};

            // scan for connected devices
            dev = this.Bridges.ADB.listDevices();
            this.count += dev.length;

            for(let i in dev){
                this.devices[dev[i].uid] = dev[i];
            }
            ut.msgBox("Android devices", Object.keys(this.devices));
        }/*else{
            console.log("ADB Bridge is not ready");
        }*/

        // TODO :  add SDB and others type of bridge
        
        if(this.count==1){
            // 1 device -> no problem
            this.setDefault(dev[0].uid);
            return dev[0];
        }else if(this.count > 1){

            if(latestDefault != null && this.devices[latestDefault] != null){
                this.setDefault(latestDefault);
                return this.devices[latestDefault];
            }
            // more device -> select better condition 
            // check if a single is authorized
            dev = [];
            for(let i in this.devices){
                if(this.devices[i].authorized){
                    dev.push(this.devices[i]);
                }
            }
            if(dev.length==1){
                dev[0].selected = true;
                return dev[0];
            }

            // check frida at default server location according to configuration
            // TODO
            return null;
        }
    }

    /**
     * To check if a device is connected, but there is not default device selected.
     * @function
     * @returns {Boolean} Return TRUE if a device is connected and if there is not default device selected.
     */
    hasNotDefault(){
        return (this.count==0)||(this.count>1 && this.defaultDevice===null);
    }

    /**
     * To select a default device
     * @param {String} deviceId 
     * @function
     */
    setDefault(deviceId){
        if(this.defaultDevice != null){
            this.defaultDevice.selected = false;
        }

        for(let i in this.devices){

            if(this.devices[i].uid === deviceId){
                this.devices[i].selected = true;
                this.defaultDevice = this.devices[i];
            }else{
                this.devices[i].selected = false;
            }
        }
    };
    
    /**
     * To get the default device
     * @returns {Device} Default device
     * @function
     */
    getDefault(){
        return this.defaultDevice;
    };
    
    /**
     * To get a device by its deviceID
     * @param {String} deviceId Device ID
     * @returns {Device} The Device instance, else null
     * @function
     */
    getDevice(deviceId){
        return this.devices[deviceId];
    };
    
    /**
     * To get all devices
     * @returns {Object} To get an hashmap associtating to each device ID the device instance
     * @function 
     */
    getAll(){
        return this.devices;
    };
    
    /**
     * To export data to JSON
     * @returns {String} JSON payload
     * @function
     */
    toJsonObject(){
        let json = [], tmp=null;
        for(let i in this.devices){
            json.push(this.devices[i].toJsonObject());
        }
        return json;
    };
}


module.exports = DeviceManager;