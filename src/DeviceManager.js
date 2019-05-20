var ut = require("./Utils.js");
const AdbWrapper = require("./AdbWrapper.js");


/*

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

    
    this.profiles = function(){
        
    }
}
*/

class DeviceManager
{
    constructor(config=null){
        this.config = config;
        this.defaultDevice = null;
        this.count = 0;
        this.devices = {};
      
        this.Bridges = {
            ADB: new AdbWrapper(this.config.getAdbPath(),null)
        };
    
        //this._emuManager = new EmulatorManager();
    }


    // scan for available devices 
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

    hasNotDefault(){
        return (this.count==0)||(this.count>1 && this.defaultDevice===null);
    }
    
    setDefault(deviceId){
        if(this.defaultDevice != null){
            this.defaultDevice.selected = false;
        }
        this.defaultDevice = this.devices[deviceId];
        this.devices[deviceId].selected = true;
    };
    
    getDefault(){
        return this.defaultDevice;
    };
    
    getDevice(deviceId){
        return this.devices[deviceId];
    };
    
    getAll(){
        return this.devices;
    };
    
    toJsonObject(){
        let json = [];
        for(let i in this.devices){
            json.push(this.devices[i].toJsonObject())
        }
        return json;
    };
}


module.exports = DeviceManager;