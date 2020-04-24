const _path_ = require("path");
const _fs_ = require("fs");

var ut = require("./Utils.js");

const AdbWrapperFactory = require("./AdbWrapperFactory.js");
const DexcaliburWorkspace = require("./DexcaliburWorkspace");
const Device = require("./Device");
const StatusMessage = require("./StatusMessage");
const FridaHelper = require("./FridaHelper");
const PlatformManager = require("./PlatformManager");

var Logger = require("./Logger")();

const DEVICE_FILE = "devices.json";
var gInstance = null;

/**
 * To manager connected devices
 * 
 * @class
 */
class DeviceManager
{
    /**
     * To create an instance of DeviceManager
     * @param {Configuration} config The configuration object
     */
    constructor(){

        this.dxcWorkspace = DexcaliburWorkspace.getInstance();

        /**
         * Path of the file where device are stored
         * @field
         */
        this.devFile = _path_.join(
            this.dxcWorkspace.getDeviceFolderLocation(), 
            DEVICE_FILE
        );

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
         * @field
         */
        this.status = null;

        /**
         * Supported bridges
         * TODO : add sdb
         * @field 
         */
        this.bridges = {
            ADB: AdbWrapperFactory.getInstance(
                _path_.join(
                    this.dxcWorkspace.getBinaryFolderLocation(),
                    "platform-tools",
                    "adb"
                )
            )
        };
    
    }


    static getInstance(){
        if(gInstance == null){
            gInstance = new DeviceManager();
        }

        return gInstance;
    }


    /**
     * To load Devices properties from `.dxc/dev/devices.json` file
     * 
     * @method
     */
    load(){
        if(_fs_.existsSync( this.devFile) == false)
            return true;

        let data = null;
        try{
            data = JSON.parse( _fs_.readFileSync( this.devFile));
            for(let i=0; i<data.length; i++){
                if( data[i].uid != null)
                    this.devices[ data[i].uid ] = Device.fromJsonObject(data[i]);
            }
        } catch(err){
            console.log(err);
            Logger.error("[DEVICE MANAGER] Unable to load devices");
        }

        return true;
    }

    /**
     * To save properties of devices into `.dxc/dev/devices.json` file
     * 
     * @method
     */
    save(){
        if(_fs_.existsSync( this.devFile) == true){
            _fs_.unlinkSync( this.devFile);
        } 


        let data = [];
        for(let i in this.devices){
            data.push( this.devices[i].toJsonObject({
                connected: false
            }));
        }


        _fs_.writeFileSync(
            this.devFile,
            JSON.stringify(data)
        );
    }

    /**
     * To turn all device tagged "connected" to "disconnected"
     */
    disconnectAll(){
        for(let uid in this.devices){
            this.devices[uid].disconnect();
        }
    }

    /**
     * To merge a given device list with cuurent list
     * 
     * @param {*} pDeviceList 
     */
    updateDeviceList( pDeviceList){
        let active = 0, uid=null;

        for(let i=0; i<pDeviceList.length; i++){

            uid = pDeviceList[i].getUID();
            if(this.devices[uid] instanceof Device){
                this.devices[uid].update(pDeviceList[i]);
            }else{
                this.devices[uid] = pDeviceList[i];
            }

            if(this.devices[uid].isConnected()){
                active++;
            }
        }

        return active;
    }

    /**
     * To get a list of connected devices
     * 
     * @returns {Device[]} Array of device
     */
    getConnectedDevices(){
        let conn=[];
        for(let i in this.devices){
            if(this.devices[i].isConnected()){
                conn.push(this.devices[i]);
            }
        }

        return conn;
    }


    /**
     * To detect connected devices from each bridges and update
     * device list
     * 
     * @function
     */
    scan(){
        let dev=[], wrapper=null, activeDev = 0, latestDefault=null;

        latestDefault = this.getDefault();

        this.disconnectAll();


        for(let type in this.bridges){

//            console.log(type, this.bridges[type]);
            if(this.bridges[type].isReady()){
    
                // scan for connected devices
                wrapper  = this.bridges[type].newGenericWrapper();
                dev = wrapper.listDevices();
                
//                listDevices();

                activeDev += this.updateDeviceList(dev);
    
                ut.msgBox("Enumerated devices", Object.keys(this.devices));
            }
        }

        // now

        if(activeDev==1){
    
            // 1 device -> no problem
            this.setDefault(
                this.getConnectedDevices()[0]
            );

        }else if(activeDev > 1){



            // by default, if there are several devices connected
            // a default device should be selected 

             // 1/ If default device is connected and authorized
            if(this.devices[latestDefault] != null 
                && this.devices[latestDefault].isConnected()
                && this.devices[latestDefault].isAuthorized()){

                this.setDefault(latestDefault);
                return null;
            }

            // 2/ Only authorized device should be instrumented 
            dev = [];
            for(let i in this.devices){
                if(this.devices[i].isAuthorized()){
                    dev.push(i);
                }
            }

            if(dev.length > 0){
                this.setDefault(dev[0]);
                return null;
            }


           

            // more device -> select better condition 
            // check if a single is authorized
            /*dev = [];
            for(let i in this.devices){
                if(this.devices[i].authorized){
                    dev.push(this.devices[i]);
                }
            }
            if(dev.length==1){
                dev[0].selected = true;
            }*/

            // check frida at default server location according to configuration
            // TODO
        }

        return null;
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
     * @method
     */
    setDefault(deviceId){

        // unselect current default device
        /*if(this.defaultDevice != null){
            this.defaultDevice.selected = false;
        }*/


        for(let i in this.devices){

            if(this.devices[i].uid === deviceId){
                this.devices[i].selected = true;
                this.defaultDevice = this.devices[i];
            }else{
                this.devices[i].selected = false;
            }
        }
    }
    
    /**
     * To get the default device
     * @returns {Device} Default device
     * @method
     */
    getDefault(){
        return this.defaultDevice;
    }
    
    /**
     * To get a device by its deviceID
     * @param {String} deviceId Device ID
     * @returns {Device} The Device instance, else null
     * @method
     */
    getDevice(deviceId){
        return this.devices[deviceId];
    }
    
    /**
     * To get all devices (connected or not)
     * @returns {Object} To get an hashmap associtating to each device ID the device instance
     * @method 
     */
    getAll(){
        return this.devices;
    }
    
    /**
     * To export data to JSON
     * @returns {String} JSON payload
     * @method
     */
    toJsonObject(){
        let json = [];
        for(let i in this.devices){
            json.push(this.devices[i].toJsonObject());
        }
        return json;
    }

    /**
     * To enroll a new device or an updated device
     * 
     * @param {*} pDevice 
     * @param {*} pOtions 
     */
    async enroll( pDevice, pOtions = {}){

        let device = null, success=false, pf=null, pm=PlatformManager.getInstance();

        // set device
        if(pDevice instanceof Device)
            device = pDevice;
        else
            device = this.devices[pDevice];

        if(device == null){
            throw new Error("[DEVICE MANAGER] Unknow device : "+pDevice);
        }
        this.status = new StatusMessage(10, "[Device Manager] Start device profiling");

        // Gather data 
        success = await device.performProfiling( pOtions.profiling);

        if(success){
            this.status = new StatusMessage(30, this.status.append("[Device Manager] Profiling successfull.\n[Device Manager] Start Frida server install"));
        }else{
            this.status = StatusMessage.newError( this.status.append("[Device Manager] Fail to profile the device"));
        }

        // Install frida 
        success = await FridaHelper.installServer(device, (pOtions.frida != null? pOtions.frida: {})) ;

        if(success){
            this.status = new StatusMessage(70, this.status.append("[Device Manager] Frida server installed.\n[Device Manager] Start platform install ..."));
        }else{
            this.status = StatusMessage.newError( this.status.append("[Device Manager] Fail"));
        }

        // Download platform 
        pf = 'sdk_androidapi_'+device.getProfile().getSystemProfile().getSdkVersion()+'_google';

        if( pm.isInstalled(pf) == false){
            pf = pm.getRemotePlatform(pf);
            success = pm.install(pf);
            if(success) device.setPlatform(pf)
        }else{
            device.setPlatform( pm.getLocalPlatform(pf));
        }

        if(success){
            this.status = StatusMessage.newSuccess( this.status.append("[Device Manager] Platform (SDK) of target device installed"));
        }else{
            this.status = StatusMessage.newError( this.status.append("[Device Manager] Fail"));
        }

        device.setEnrolled(true);

        // save device manager data
        this.save();

        return success;
    }

    setEnrollStatus( pStatus){
        pStatus.progress =  (this.status==null? 0 : this.status.progress);
        this.status = pStatus;
    }

    getEnrollStatus(){
        return this.status;
    }
}


module.exports = DeviceManager;