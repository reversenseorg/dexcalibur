var Process = require("child_process");
var ut = require("./Utils.js");
const AdbWrapper = require("./AdbWrapper.js");

var DEV = {
    USB: 0x1,
    EMU: 0x2,
    ADB: 0x3,
    SDB: 0x4
};
var DEV_NAME = ['unknow','udb','emu','adb','sdb'];


var OS = {
    ANDROID: 0x0,
    LINUX: 0x1,
    TIZEN: 0x2
};
var OS_NAME = ['android','linux','tizen'];

/**
 * Represents a device
 * @param {*} cfg 
 */
function Device(cfg){
    this.type = null;
    this.id =  null;
    this.model = null;
    this.product = null;
    this.bridge = null;
    this.usb = null;
    this.selected = false;
    // the operation mode
    this.opmode = null;

    for(let i in cfg) this[i] = cfg[i];
    return this;
}

/**
 * To check if the given file path exists on the device
 * @param {string} adbPath The ADB binary path
 * @param {*} device 
 * @param {string} file The file path to check
 * @returns {boolean} Returns TRUE if the file exists on the device, else FALSE
 * @function 
 */
Device.prototype.isFileExists = function(adbPath, device,file){
    let adb=adbPath, ret="", path="", i=0;

    ret = Process.execSync(adb+" -s "+this.id+" shell su -c '"+file+"'").toString("ascii");
    
    if(ret.indexOf(file)==0)
        return true;
    else
        return false;
};

Device.prototype.toJsonObject = function(){
    let json = new Object();
    for(let i in this){
        if(i=='type'){
            json[i] = OS_NAME[this[i]];
        }
        else if(i=='bridge'){
            json[i] = DEV_NAME[this[i]];
        }
        else{
            json[i] = this[i];
        }
    }
    return json;
}



function EmulatorProfile(cfg){
    this.API_version = 19;
    this.OS = OS.ANDROID;

    for(let i in cfg) this[i] = cfg[i];

    return this;
}


function EmulatorManager(){
    this.profiles = {
        "Android_nexus": new EmulatorProfile({ API_version:19, OS:OS.ANDROID })
    }

    /**
     * Display the list of profile
     */
    this.profiles = function(){
        
    }
}


/**
 * Represents the Dexcalibur device manager. 
 * It supports several kind of device, including :
 *      - Tizen device
 *      - Android device
 *      - (TO DO) Linux desktop    
 * @param {} cfg 
 * @constructor
 */
function DeviceManager(cfg){
    this.config = cfg;
    this.defaultDevice = null;
    this.count = 0;
    this.devices = {};
  
    this.Bridges = {
        ADB: new AdbWrapper(this.config.getAdbPath(),null)
    };

    this._emuManager = new EmulatorManager();

    this.emulator = function(){
        return this._emuManager;
    }

    // discover plugged devices
    this.scan = function(){
        // TODO : scan for new devices
        let ret="", dev=[], device=null,re=null,id=null;
        /*
        if(config.useEmulator){
            let dev = new Device(DEV.EMU,"default",);
            this.devices.emu
            adb+=" -e";
        }
*/
        if(this.config.adbPath !== null){
            
            ret = Process.execSync(this.config.adbPath+" devices -l").toString("ascii");
            ret = ret.split("\n");
            //re = new RegExp("([0-9A-Za-f]+).*device\susb:([^\s]+)\sproduct:([^\s]+)\smodel:([^\s]+)\sdevice:([^\s]+)");
            re = new RegExp("^([0-9A-Za-f]+).*device (.*)$");

            this.devices = [];
            this.count = 0;
            
            for(let ln in ret){
                if(ut.trim(ret[ln]).length==0 
                    || ret[ln]=="List of devices attached") 
                        continue;

                
                data =  re.exec(ret[ln]);
                if(data.length<3)
                    continue;

                console.log(data,ret[ln]);
                id = data[1];
                data = data[2].split(" ");

                device = new Device({
                    type: OS.ANDROID,
                    id: id,
                    bridge: new AdbWrapper(this.config.adbPath, id),
                    usb: data[0].substr(data[1].indexOf(":"),data[0].length),
                    model: data[2].substr(data[2].indexOf(":"),data[2].length),
                    product: data[1].substr(data[1].indexOf(":"),data[1].length)
                });
                
                this.devices[device.id] = device;
                dev.push(device.id+"   "+device.model)
                this.count++;
            }

            if(this.count==1){
                this.setDefault(device.id);
            }
            ut.msgBox("Android devices",dev);
        }

    };
    // at init, discover plugged devices
    
    //this.scan();    

    return this;
};


DeviceManager.prototype.hasNotDefault = function(){
    return (this.count==0)||(this.count>1 && this.defaultDevice===null);
}

DeviceManager.prototype.setDefault = function(deviceId){
    if(this.defaultDevice != null){
        this.defaultDevice.selected = false;
    }
    this.defaultDevice = this.devices[deviceId];
    this.devices[deviceId].selected = true;
};

DeviceManager.prototype.getDefault = function(deviceId){
    return this.defaultDevice;
};

DeviceManager.prototype.getDevice = function(deviceId){
    return this.devices[deviceId];
};

DeviceManager.prototype.getAll = function(){
    return this.devices;
};

DeviceManager.prototype.toJsonObject = function(){
    let json = [];
    for(let i in this.devices){
        json.push(this.devices[i].toJsonObject())
    }
    return json;
};

module.exports = DeviceManager;