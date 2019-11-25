
const Logger = require("./Logger.js")();
const _MD5_ = require("md5");

const DEV = {
    USB: 0x1,
    EMU: 0x2,
    ADB: 0x3,
    SDB: 0x4
};
const DEV_NAME = ['unknow','udb','emu','adb','sdb'];


const OS = {
    ANDROID: 0x0,
    LINUX: 0x1,
    TIZEN: 0x2
};
const OS_NAME = ['android','linux','tizen'];


/**
 * Represents a device
 * @param {*} cfg 
 */
class Device
{
    constructor(config=null){
        this.type = null;

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

        if(config !== null)
            for(let i in config) this[i] = config[i];    
    }

    setUID(deviceID, qualifier){
        this.uid = deviceID;
        for(let k in qualifier){
            this.uid += "/"+k+"/"+qualifier[k];
        }
        //this.uid = _MD5_(this.uid);
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

    /**
     * 
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


    /**
     * To serialize the Device to JSON string
     * @returns {String} JSON-serialized object
     * @function 
     */
    toJsonObject(){
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
}

module.exports = Device;