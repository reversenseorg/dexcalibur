const _path_ = require("path");
const _fs_ = require("fs");
const _os_ = require('os');

var ut = require("./Utils.js");

const AdbWrapperFactory = require("./AdbWrapperFactory.js");
const DexcaliburWorkspace = require("./DexcaliburWorkspace");
const Device = require("./Device");
const StatusMessage = require("./StatusMessage");
const FridaHelper = require("./FridaHelper");
const PlatformManager = require("./PlatformManager");
const Utils = require('./Utils');

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
                    (require('os').platform()==="win32"? "adb.exe":"adb")
                )
            )
        };
    
    }

    /**
     * 
     * @param {String} pName Bridge name 
     * @since v0.7.2
     */
    getBridgeFactory( pName){
        if(this.bridges[pName]==null){
            throw new Error('[DEVICE MANAGER] Bridge not supported.');
        }

        return this.bridges[pName]; 
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
            data.push( this.devices[i].toJsonObject( {}, {
                connected: false,
                offline: false,
                bridge: {
                    up: false
                }
            }));
        }


        _fs_.writeFileSync(
            this.devFile,
            JSON.stringify(data)
        );
    }

    /**
     * Remove all device saved or previously enrolled
     * 
     * @method
     */
    clear(pDeviceID = null){

        if(pDeviceID !== null){
            throw new Error('Operation not supported');
        }

        let success = _fs_.existsSync( this.devFile);

        if(success == true){
            _fs_.unlinkSync( this.devFile);
            this.devices = {};
            this.count = 0;
            this.defaultDevice = null;
        }

        this.save();

        
        return success;
    }


    /**
     * To turn all device tagged "connected" to "disconnected"
     */
    disconnectAll(){
        for(let uid in this.devices){
            this.devices[uid].disconnect();
        }
    }

    getDeviceByID( pAndroidID){
        for(let uid in this.devices){
            if(this.devices[uid].id == pAndroidID){
                return this.devices[uid];
            }
        }
        return null;
    }

    generateUID(){
        let uid = Utils.randString(12, Utils.ALPHANUM);
        if(this.devices[uid]!=null)
            return generateUID();
        else
            return uid;
    }

    addDevice( pDevice){
        let uid = this.generateUID();
        pDevice.setUID(uid);
        this.devices[uid] = pDevice;
    }

    getDeviceByIP( pIpAddress, pPort=null, pUp=true){
        let d=null, b=null;
        for(let i in this.devices){
            d = this.devices[i];
            for(let k in d.bridges){
                b = d.bridges[k];
                if(b.isNetworkTransport()){
                    if(b.ip!==pIpAddress) continue;
                    if(pPort!==null && b.port!==pPort) continue;
                    if(pUp==true && b.up==false) continue;

                    return d;
                }
            }
        }

        return null;
    }
    

    /**
     * To merge a given device list with cuurent list
     * 
     * @param {*} pDeviceList 
     */
    updateDeviceList( pCandidateList){
        let active = 0, b=null, d=null, id=null, dev=null;
        let devs = {};

        for(let i=0; i<pCandidateList.length; i++){

            // at this step, candidate device has 1 bridge, no more.
            if(pCandidateList[i].bridge.isUsbTransport()){
                id = pCandidateList[i].bridge.deviceID;
                if(id != null){
                    // search if device already exists
                    dev = this.getDeviceByID(id);
                }else{
                    // invalid device
                    Logger.debug("Invalid devices");
                }
            }else{  
                dev = this.getDeviceByIP( pCandidateList[i].bridge.ip, pCandidateList[i].bridge.port);
            }


            if(dev != null){
                // a device already exists, then merge
                dev.update(pCandidateList[i]);
            }else{
                // add the new device
                this.addDevice(pCandidateList[i]);
            }

            if(pCandidateList[i].isConnected()){
                active++;
            }
            
        }

        

        // remove duplicated
        devs = {};
        for(let i in this.devices){
            
            if(this.devices[i].id=="<pending...>"){
                for(let k in this.devices[i].bridges){
                    b = this.devices[i].bridges[k];
                    if(b.isNetworkTransport()){
                        d = this.getDeviceByIP(b.ip, b.port, false);
                        if(d != null){
                            devs[this.devices[i].uid] = this.devices[i];
                        }
                    }else{
                        d = this.getDeviceByID(b.deviceID);

                        if(d == null){
                            devs[this.devices[i].uid] = this.devices[i];
                        }
                    }
                }
            }else{
                devs[this.devices[i].uid] = this.devices[i];
            }
            /*
            id = this.devices[i].id;

            if(devs[id] == null){
                devs[id] = this.devices[i];
            }else{
                devs[id].merge( this.devices[i]);
            }*/
        }

        this.devices = devs;
        //for(let i in devs) this.devices[devs[i].uid] = devs[i];


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

    async connect( pIpAddress, pPortNumber, pDevice){
        let success = false, wrapper=null;

        
        for(let i in this.bridges){
            if(pDevice == null){
                wrapper = this.bridges[i].newGenericWrapper();
                success |= await wrapper.connect(pIpAddress, pPortNumber);
            }else{    
                wrapper = this.bridges[i].newSpecificWrapper(pDevice);
                success |= await wrapper.connect(pIpAddress, pPortNumber);

                // create adb wrapper with network config 
                if(success==1){
                    wrapper.ip = pIpAddress;
                    wrapper.port = pPortNumber;
                    pDevice.addBridge(wrapper, true);

                    if(pDevice.bridge==null)
                        pDevice.setDefaultBridge(wrapper.shortname);
                }
            }
        }

        return (success==true);
    }

    /**
     * To detect connected devices from each bridges and update
     * device list
     * 
     * @function
     */
    async scan(){
        let dev=[], wrapper=null, activeDev = 0, latestDefault=null;

        latestDefault = this.getDefault();

        this.disconnectAll();


        for(let type in this.bridges){

//            console.log(type, this.bridges[type]);
            if(this.bridges[type].isReady()){
    
                // scan for connected devices
                wrapper  = this.bridges[type].newGenericWrapper();
                dev = await wrapper.listDevices();
                
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
    toJsonObject( pExcludeList={}){
        let json = [];
        for(let i in this.devices){
            json.push(this.devices[i].toJsonObject(null, pExcludeList.device));
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

        // update device ID if it is unknown 
        if(device.id == null){
            device.id = await device.retrieveUIDfromDevice();
        }
        
        if(_os_.platform()==='darwin' && _os_.arch()==='arm64'){

            this.status = new StatusMessage(50, this.status.append("[Device Manager] Frida server cannot be downloaded and installed automatically because this operation is not supported on your darwin/arm64."));

            const dlURL = FridaHelper.getDownloadUrl(device,(pOtions.frida != null? pOtions.frida: {}));
            this.status = new StatusMessage(51, this.status.append("[Device Manager] Please download & extract Frida server at : "+dlURL));
            this.status = new StatusMessage(52, this.status.append("[Device Manager] Then, push it to : "+FridaHelper.getFridaServerRemotePath((pOtions.frida != null? pOtions.frida: {}))));

            success = true;
        }else{
            // Install frida
            success = await FridaHelper.installServer(device, (pOtions.frida != null? pOtions.frida: {})) ;
        }

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


        if(success && (device.getPlatform()!=null)){
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
