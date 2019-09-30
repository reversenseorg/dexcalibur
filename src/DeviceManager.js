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
        this.Bridges = {
            ADB: new AdbWrapper(this.config.getAdbPath(),null)
        };
    
    }


    // scan for available devices 
    /**
     * To detect connected devices from each bridges
     * @function
     */
    scan(){
         // TODO : scan for new devices
         let ret="", dev=[], device=null,re=null,id=null;

        this.count = 0;
        if(this.Bridges.ADB.isReady()){
            dev = this.Bridges.ADB.listDevices();
            this.count += dev.length;

            for(let i in dev){
                this.devices[dev[i].id] = dev[i];
            }
            ut.msgBox("Android devices", Object.keys(this.devices));
        }

        // TODO :  add SDB and others type of bridge
         
        if(this.count==1){
            this.setDefault(dev[0].id);
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
        this.defaultDevice = this.devices[deviceId];
        this.devices[deviceId].selected = true;
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
        let json = [];
        for(let i in this.devices){
            json.push(this.devices[i].toJsonObject())
        }
        return json;
    };
}


module.exports = DeviceManager;