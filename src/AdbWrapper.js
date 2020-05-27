const Process = require("child_process");
const _path_ = require('path');

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
    static TCP_TRANSPORT = 'T';
    
    /**
     * 
     * @param {String} adbpath The ADB binary path 
     * @param {String} pDeviceID  (optional) The device ID to manage.
     * @constructor
     */
    constructor(adbpath, pDeviceID = null){

        /**
         * @field
         * @since v0.7.2
         */
        this.shortname = null;

        /**
         * @field
         */
        this.transport = AdbWrapper.USB_TRANSPORT;

        /**
         * @type {Path}
         * @field
         */
        this.path = adbpath;

        /**
         * @field
         */
        this.deviceID = pDeviceID;

        /**
         * @field
         */
        this.ip = null;

        /**
         * @field
         */
        this.port = null;

        /**
         * @field
         */
        this.host = null;

        /**
         * @field
         */
        this.usbQualifier = null;
    }

    /**
     * 
     * @param {String} pIP 
     * @method
     */
    setIpAddress(pIP){
        this.ip = pIP;
    }

    /**
     * 
     * @param {Integer} pNumber 
     * @method
     */
    setPortNumber(pNumber){
        this.port = pNumber;
    }

    /**
     * To check if ADB is ready to be used. 
     * 
     * Actually, it checks only if ADB path is not null :(
     * TODO : check ADB server state
     * 
     * @returns {Boolean} TRUE if ADB is ready to use, else FALSE
     * @method
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
     * @method
     */
    setup(pDeviceID = null, pReturnString =  true){
        let cmd=null;

        if(pReturnString)
            cmd = this.path;
        else
            cmd = [];

        if(this.transport == AdbWrapper.USB_TRANSPORT){
            if(pDeviceID != null){

                if(pReturnString) 
                    cmd += " -s "+pDeviceID;
                else{
                    cmd.push("-s")
                    cmd.push(pDeviceID)
                }

            }else if(this.deviceID != null){

                if(pReturnString) 
                    cmd += " -s "+this.deviceID;
                else{
                    cmd.push("-s")
                    cmd.push(this.deviceID)
                }
            }
        }else if(this.transport == AdbWrapper.TCP_TRANSPORT){
            if(pReturnString) 
                cmd += " -s "+this.ip+':'+this.port;
            else{
                cmd.push("-s")
                cmd.push(this.ip+':'+this.port)
            }

        }

        return cmd;
    }

    /**
     * @async
     * @method
     */
    async kill(){
        ret = await UT.execAsync(this.setup() + " kill-server");
        
        if(ret.stderr != null && ret.stderr.length > 0){
            throw new Error('[ADB WRAPPER] kill-server : '+ret.stderr);
        }


        return true;
    }
    /**
     * Set the transport type
     * @method
     */
    setTransport(transport_type){
        this.transport = transport_type;
    }

    /**
     * To check is the bridge use network
     * 
     * @method
     * @since v0.7.1
     */
    isNetworkTransport(){
        return (this.transport === AdbWrapper.TCP_TRANSPORT);
    }

    /**
     * @method
     * @since v0.7.1
     */
    isUsbTransport(){
        return (this.transport === AdbWrapper.TCP_TRANSPORT);
    }

    /**
     * 
     * @param {*} pIpAddress 
     * @param {*} pPortNumber 
     * @method
     */
    async connect( pIpAddress, pPortNumber){

        ret = await UT.execAsync(this.setup() + " tcpip "+pPortNumber);
        ret = await UT.execAsync(this.setup() + " connect "+pIpAddress+':'+pPortNumber);
        
        console.log(ret.stderr,ret.stdout);
        if(ret.stderr != null && ret.stderr.length > 0)
            return false;

        if(ret.stdout.indexOf(`connected to ${pIpAddress}`)==-1)
            return false;

        this.shortname = 'adb+tcp';
        this.transport = AdbWrapper.TCP_TRANSPORT;

        return true;
    }


    /**
     * 
     * @param {*} pPackageListStr 
     * @method
     */
    parsePackageList( pPackageListStr, pOptions=''){
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
     * @method
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
     * @method
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
     * @method
     */
    parseDeviceList( pDeviceListStr){
        let dev = [], ret=null,re=null, data=null, id=null, device=null, token=null;
        let bridge = null;

        Logger.debug(pDeviceListStr);

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

            device = new Device();

            id = UT.parseIPv4(data[1], true);
            if(id.valid == false){
                // USB device, Device ID is returned by ADB 
                id = data[1];
                device.id = id;
                
                bridge = new AdbWrapper(this.path, id);
                bridge.transport = AdbWrapper.USB_TRANSPORT;
                bridge.shortname = 'adb+usb';

                Logger.debug('[DEVICE MANAGER][ADB] device ADB ID over USB : ', id);
            }else{
                // TCP device, unknow Device ID
                device.id = null;
                bridge = new AdbWrapper(this.path, data[1]);

                bridge.transport = AdbWrapper.TCP_TRANSPORT;
                bridge.ip = id.ip;
                bridge.port = id.port;
                bridge.shortname = 'adb+tcp';

                Logger.debug('[DEVICE MANAGER][ADB] device ADB ID over TCP : ',data[1]);
            }

            device.addBridge(bridge);
            device.setDefaultBridge(bridge.shortname);


            id = data[1];
            data = data[2].split(" ");

//            device.setUID( 'adb:'+device.bridge.deviceID);
            //device.setUID( device.bridge.deviceID);

            // TODO : do it while profiling step
            device.type = OS.ANDROID;

            device.isEmulated = data[0].match(emuRE);
            // remove ?
            if(device.isEmulated){
                device.bridge.setTransport(AdbWrapper.TCP_TRANSPORT);
            }

            device.connected = true;

            for(let i=0; i<data.length; i++){
                Logger.debug(`[DEVICE MANAGER] Parsing device list : ${data[i]}`);
                if(data[i].indexOf(':')>-1){
                    token = data[i].split(':',2);
                    switch(token[0]){
                        case 'usb':
                            device.bridge.usbQualifier = token[1];
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
                        case 'offline':
                            device.offline = true;;
                            device.connected = false;
                            break;
                        case 'device':
                        default:
                            Logger.debug("Unrecognized key (single token) : "+data[i]);
                            break;

                    }
                }
            }


            console.log(device);
            if(device.bridge.shortname=='adb+tcp' && device.id == null){
                device.retrieveUIDfromDevice();
            }

            dev.push(device);
        }

        return dev;
    }

    /**
     * To list connected devices
     * @method
     */
    listDevices(){
        Logger.info("[ADB] Enumerating connected devices ...");
        return this.parseDeviceList( 
            UT.execSync(this.setup()+" devices -l")
                .toString("ascii") );
    }

    

    /**
     * Pull a remote resource into the project workspace
     * Same as 'adb pull' commande.
     * 
     * @param {*} remote_path The path of the remote resource to download 
     * @param {*} local_path The path where the resource will be stored locally
     * @method
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
     * @method
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
     * @method
     */
    push(local_path, remote_path){
            return UT.execSync(this.setup()+' push '+local_path+' '+remote_path);
    }


    /**
     * Execute a command on the device
     * Same as 'adb shell' commande.
     * 
     * @param {*} command The command to execute remotely
     * @method
     */
    shell(command, deviceID = null){
            return UT.execSync(this.setup()+' shell '+command);
    }

    /**
     * Execute a command on the device
     * Same as 'adb shell' commande.
     * 
     * @param {*} command The command to execute remotely
     * @method
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
     * @method
     */
    shellWithEHsync(command){

            Logger.info("[ADB] ",this.setup()+' shell '+command);
            return Process.execSync(this.setup()+' shell '+command);

    }

    /**
     * 
     * @param {String} pCommand 
     * @param {String} pArgs
     * @returns {Boolean} TRUE is success, else FALSE
     * @method
     * @async  
     */
    async detachedShell( pCommand, pArgs = "" ){
        let args = this.setup(null,false);
        let ws = require('./DexcaliburWorkspace').getInstance();
        let out = _fs_.openSync( _path_.join( ws.getTempFolderLocation(), 'out.log'), 'w+', 0o666);
        let err = _fs_.openSync( _path_.join( ws.getTempFolderLocation(), 'err.log'), 'w+', 0o666);

        args = args.concat(pCommand);
        console.log(args);
        let child = Process.spawn(this.path, args, { detached: true, stdio: [ 'ignore', out, err ] });
        child.unref();

        return true;
    }


    /**
     * Execute a command on the device via 'su -c'
     * Same as 'adb shell su -c' commande.
     * 
     * @param {*} command The command to execute remotely
     */
    async privilegedShell(command, pOptions = {detached: false}){
        if(pOptions.detached)
            return await this.detachedShell(["shell","su","-c",command]);
        else
            return UT.execSync(this.setup()+' shell su -c "'+command+'"');
    }


    /**
     * @method
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

    /**
     * 
     * @param {Object} pData Poor object
     * @returns {AdbWrapper} ADB wrapper instance
     * @method
     * @static 
     */
    static fromJsonObject( pData){
        let o = new AdbWrapper();
        for(let i in pData) o[i] = pData[i];
        return o;
    }

    /**
     * @method
     */
    toJsonObject( pExcludeList={}){
        let o = new Object();

        for(let i in this){
            if(pExcludeList[i] === false) continue;
            
            o[i] = this[i];
        } 

        return o;
    }
}



module.exports = AdbWrapper;
