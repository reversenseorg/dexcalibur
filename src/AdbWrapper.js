const Process = require("child_process");
const UT = require("./Utils.js");
const Device = require("./Device.js");
const ApkPackage = require("./AppPackage");
const DeviceProfile = require('./DeviceProfile');
const {AdbWrapperError} = require("./Errors");

var Logger = require('./Logger.js')();


const EOL = require('os').EOL;
const _fs_ = require('fs');

const TRANSPORT = {
    USB: 'U',
    WIFI: 'W',
    TCP: 'T'
};

const emuRE = /^emulator-/;

const PROP_RE = /^\[(?<name>.*)\]\s*:\s*\[(?<value>.*)\]$/;

/*
const DEV = {
    USB: 0x1,
    EMU: 0x2,
    ADB: 0x3,
    SDB: 0x4
};
const DEV_NAME = ['unknow','udb','emu','adb','sdb'];
*/

const OS = {
    ANDROID: 0x0,
    LINUX: 0x1,
    TIZEN: 0x2
};
const OS_NAME = ['android','linux','tizen'];



/**
 * ADB wrapper
 * 
 * Can be use to manage/interact with a device connected through ADB
 * ADB Wrapper has two state :
 *  - Standard state : no device id passed to ADB
 *  - Specialized state : where all operation are done for a specific device ID 
 * 
 * @class 
 */
class AdbWrapper
{
    static USB_TRANSPORT = 'U';
    static WIFI_TRANSPORT = 'W';
    static TCP_TRANSPORT = 'T';
    
    /**
     * 
     * @param {String} adbpath The ADB binary path 
     * @param {String} pDeviceID  (optional) The device ID to manage.
     * @function
     */
    constructor(adbpath, pDeviceID = null){
        this.transport = AdbWrapper.USB_TRANSPORT;
        this.path = adbpath;
        this.deviceID = pDeviceID;
    }

    /**
     * To check if ADB is ready to be used. 
     * 
     * Actually, it checks only if ADB path is not null :(
     * TODO : check ADB server state
     * 
     * @returns {Boolean} TRUE if ADB is ready to use, else FALSE
     */
    isReady(){
        return (this.path != null) && (_fs_.existsSync(this.path));
    }

    /**
     * To init the next command, if a device ID is passed as arguments
     * then the command will use this device, else if a default device ID 
     * is configured the ID will be use, else no device ID is set. 
     * 
     * 
     * @param {String} deviceID The ID of the device to use 
     * @returns {String} The begin of the command
     */
    setup(pDeviceID = null){
        let cmd=this.path;
        if(this.transport == AdbWrapper.USB_TRANSPORT){
            if(pDeviceID != null)
                cmd += " -s "+pDeviceID;
            else if(this.deviceID != null)
                cmd += " -s "+this.deviceID;

        }else if(this.transport == AdbWrapper.TCP_TRANSPORT){
            cmd += " -e";
        }

        return cmd;
    }

    /**
     * Set the transport type
     */
    setTransport(transport_type){
        this.transport = transport_type;
    }


    /**
     * 
     * @param {*} pPackageListStr 
     */
    parsePackageList( pPackageListStr, pOptions){
        var reg = new RegExp("^package:(?<apk_name>.*)");
        var packages = [];

        if(pPackageListStr.indexOf("error:")==0){
            throw AdbWrapperError.newDeviceNotFound(`Unable to list package. ADB Error: "${pPackageListStr}"`);
        }

        pPackageListStr.split( EOL ).forEach(element => {
            var pkg = element.trim();
            let app, path = null;

            if(reg.test(pkg)) {
                var result  = reg.exec(pkg);
                if(result !== null) {
                    var pathResult = "";
                    
                    //recycle the same regex since the output is the same
                    //only take first match since this is the base apk
                    //pathResult = pathResult.split('\n')[0].trim();
                    if(reg.test(pathResult)) {
                        pathResult = reg.exec(pathResult).groups['apk_name'];
                    }

                    // package path arg
                    if(pOptions.indexOf('-f') > -1){
                        let i = result.groups['apk_name'].lastIndexOf("=");
                        path = result.groups['apk_name'].substr(0,i);
                        app = result.groups['apk_name'].substr(i+1);
                    }else{
                        path = null;
                        app = result.groups['apk_name']
                    }

                    packages.push(new ApkPackage({
                        packageIdentifier: app,
                        packagePath : path
                    }));
                }
            }
        });
        return packages;
    }

    /**
     * 
     * @param {String} deviceId [Optional] A specific device ID
     */
    listPackages( pOtions) {
        let ret ="";

        ret = UT.execSync(this.setup() + " shell pm list packages "+pOtions).toString("ascii");

        return this.parsePackageList(ret, pOtions);
    }


    /*
     * 
     * @param {String} deviceId [Optional] A specific device ID
     
    listPackages(deviceId = null) {
        var reg = new RegExp("^package:(?<apk_name>.*)");
        var ret = "";
        if(deviceId !== null) {
            ret = Process.execSync(this.setup(deviceId) + " shell pm list packages").toString("ascii");
            
        }
        else {
            ret = Process.execSync(this.path + " shell pm list packages").toString("ascii");
            
        }
        var packages = [];
        ret.split( EOL ).forEach(element => {
            var pkg = element.trim();
            if(reg.test(pkg)) {
                var result  = reg.exec(pkg);
                if(result !== null) {
                    var pathResult = "";
                    //getting the path for each package takes ages
                    if(deviceId !== null) {
                       // pathResult = Process.execSync(this.setup(deviceId) + " shell pm path " + result.groups['apk_name']).toString("ascii");

                    }
                    else {
                       // pathResult = Process.execSync(this.path + " shell pm path " + result.groups['apk_name']).toString("ascii");
                    }
                    //recycle the same regex since the output is the same
                    //only take first match since this is the base apk
                    //pathResult = pathResult.split('\n')[0].trim();
                    if(reg.test(pathResult)) {
                        pathResult = reg.exec(pathResult).groups['apk_name'];
                    }
                    packages.push(new ApkPackage({
                        packageIdentifier: result.groups['apk_name'],
                        packagePath : pathResult,
                        
                    }));
                }
            }
        });
        return packages;
    }*/

    /**
     * To search the path of a specific package into the device
     * 
     * @param {String} packageIdentifier The package name of the application 
     * @param {String} deviceId (Optional) The ID of the device where search the package
     * @returns {String} The path of the application package into the device
     */
    getPackagePath(packageIdentifier) {
        var reg = new RegExp("^package:(?<package_name>.*)");
        var ret = "";

        /*if(Process.env.DEXCALIBUR_ENV){
            ret = TestHelper.execSync(this.setup(deviceId) + " shell pm path " +  packageIdentifier).toString("ascii");
        }else
            ret = Process.execSync(this.setup(deviceId) + " shell pm path " +  packageIdentifier).toString("ascii");
*/
        ret = UT.execSync(this.setup() + " shell pm path " +  packageIdentifier).toString("ascii");

/*
        if(deviceId !== null) {
            ret = Process.execSync(this.setup(deviceId) + " shell pm path " +  packageIdentifier).toString("ascii");
            
        }
        else {
            ret = Process.execSync(this.path + " shell pm path " + packageIdentifier).toString("ascii");
        }*/

        var path = ret.split( require('os').EOL )[0].trim();
        if(reg.test(path)) {
            path = reg.exec(path).groups["package_name"];
            return path;
        }
        return "";
    }


    /**
     * To parse the output of "adb device -l" command
     *  
     * @param {String} pDeviceListStr the ouput of  "adb device -l" command
     * @returns {Device[]} An array of Device instances corresponding to ADB output
     */
    parseDeviceList( pDeviceListStr){
        let dev = [], ret=null,re=null, data=null, id=null, device=null, token=null;

        ret = pDeviceListStr.split(require('os').EOL);
        
        re = new RegExp("^([^\\s\\t]+)[\\s\\t]+(.*)");
        
        for(let ln in ret){

            if(UT.trim(ret[ln]).length==0 
                || ret[ln]=="List of devices attached") 
                    continue;
    
            data =  re.exec(ret[ln]);

            if(data.length<3){
                Logger.warning("Invalid device id detected : ", ret[ln]);
                continue;
            }

            //console.log(data,ret[ln]);
            id = data[1];
            data = data[2].split(" ");

            device = new Device();
            device.id = id;
            device.type = OS.ANDROID;
            device.isEmulated = data[0].match(emuRE);
            device.bridge = new AdbWrapper(this.path, id);
            device.connected = true;

            for(let i=0; i<data.length; i++){
                Logger.debug(`[DEVICE MANAGER] Parsing device list : ${data[i]}`);
                if(data[i].indexOf(':')>-1){
                    token = data[i].split(':',2);
                    switch(token[0]){
                        case 'usb':
                            device.setUsbQualifier(token[1]);
                            break;
                        case 'model':
                            device.setModel(token[1]);
                            break;
                        case 'device':
                            device.setDevice(token[1]);
                            break;
                        case 'product':
                            device.setProduct(token[1]);
                            break;
                        case 'transport_id':
                            device.setTransportId(token[1]);
                            break;
                        default:
                            Logger.debug("Unrecognized key (dual token): "+token[0]);
                            break;
                    }

                }else{
                    switch(data[i]){
                        case 'unauthorized':
                            device.flagAsUnauthorized();
                            break;
                        case 'device':
                        default:
                            Logger.debug("Unrecognized key (single token) : "+data[1]);
                            break;

                    }
                }
            }

            if(device.isEmulated)
                device.bridge.setTransport(AdbWrapper.TCP_TRANSPORT);
            
            dev.push(device);
        }

        return dev;
    }

    /**
     * To list connected devices
     */
    listDevices(){
        Logger.info("[ADB] Enumerating connected devices ...");
        return this.parseDeviceList( 
            Process.execSync(this.setup()+" devices -l")
                .toString("ascii") );
    }

    

    /**
     * Pull a remote resource into the project workspace
     * Same as 'adb pull' commande.
     * 
     * @param {*} remote_path The path of the remote resource to download 
     * @param {*} local_path The path where the resource will be stored locally
     */
    pull(remote_path, local_path){
        return UT.execSync(this.setup()+' pull '+remote_path+' '+local_path);
    }

    /**
     * Pull a remote resource into the project workspace with Application Privileges
     * Same as 'adb pull' commande.
     * 
     * @param {*} package_name The package name
     * @param {*} remote_path The path of the remote resource to download 
     * @param {*} local_path The path where the resource will be stored locally
     */

    pullRessource(package_name,remote_path, local_path){
        if(deviceID != null) {
            var binary_blob = Process.execSync(this.setup() + 'shell "run-as '+ package_name+ ' cat ' + remote_path + '"').buffer;
            _fs_.writeFile(local_path,binary_blob,function(err) {
                if(err) {
                    Logger.error("[ADB] pullRessource() : an error occurs : "+err);
                }
            
                Logger.info("[ADB] The file was saved!");
            });
        }
    }
    /**
     * Push a local resource to a remote location
     * Same as 'adb push' commande.
     * 
     * @param {*} local_path The path of the local resource to upload 
     * @param {*} remote_path The path where the resource will be stored remotely
     */
    push(local_path, remote_path){
            return UT.execSync(this.setup()+' push '+local_path+' '+remote_path);
    }


    /**
     * Execute a command on the device
     * Same as 'adb shell' commande.
     * 
     * @param {*} command The command to execute remotely
     */
    shell(command, deviceID = null){
            return UT.execSync(this.setup()+' shell '+command);
    }

    /**
     * Execute a command on the device
     * Same as 'adb shell' commande.
     * 
     * @param {*} command The command to execute remotely
     */
    shellWithEH(command, callbacks=null){

        Logger.info("[ADB] ",this.setup()+' shell '+command);
        return Process.exec(this.setup()+' shell '+command, callbacks);

    }

    /**
     * Execute a command on the device
     * Same as 'adb shell' commande.
     * 
     * @param {*} command The command to execute remotely
     */
    shellWithEHsync(command){

            Logger.info("[ADB] ",this.setup()+' shell '+command);
            return Process.execSync(this.setup()+' shell '+command);

    }


    /**
     * Execute a command on the device via 'su -c'
     * Same as 'adb shell su -c' commande.
     * 
     * @param {*} command The command to execute remotely
     */
    privilegedShell(command){
        
            return UT.execSync(this.setup()+' shell su -c "'+command+'"');
    }


    /**
     * 
     */
    performProfiling(){
        let self = this;
        let profile = new DeviceProfile();
        let prop = this.shellWithEHsync("getprop");
        //let prop = this.shellWithEHsync("");

        // GenericProfiler
        prop = prop.toString().split("\n");
        prop.map(( ppt)=>{
            let match = PROP_RE.exec(ppt);

            if(match != null)
                profile.addProperty(match.groups.name, match.groups.value);

        });


        // TeeProfiler

        return profile;
    }
}




module.exports = AdbWrapper;
