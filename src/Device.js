


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
        this.id =  null;
        this.model = null;
        this.product = null;
        this.bridge = null;
        this.usb = null;
        this.selected = false;
        // the operation mode
        this.opmode = null;
        this.isEmulated = false;

        if(config !== null)
            for(let i in config) this[i] = config[i];    
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