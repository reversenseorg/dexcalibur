import * as Process from "child_process";
import * as _path_ from 'path';
import * as _fs_ from 'fs';
import { EOL } from 'os';

import UT from "./Utils";
import { Device } from "./Device";
import AppPackage from "./AppPackage";
import DeviceProfile, {ProfileMap} from './device/DeviceProfile';
import {AdbWrapperError} from "./Errors";
import * as Log from './Logger';
import DexcaliburWorkspace from "./DexcaliburWorkspace";
import {DeviceProfilingOptions, IBridge} from "./Bridge";
import {AdbBridgeException} from "./errors/AdbBridgeException";
import {
    PrivilegedExecutionPhase,
    PrivilegedExecutionStrategy,
    PrivilegedExecutionStrategyMap, PrivilegedExecutionType
} from "./PrivilegedExecutionStrategy";
import Util from "./Utils";
import {AndroidInstallOptionsEnum, AndroidPackageInstallOptions} from "./android/bridge/AndroidInstallOptions";
import {OperatingSystem} from "./OperatingSystem";

const Logger:Log.ProdLogger = Log.newLogger() as Log.ProdLogger;

import AndroidDeviceProfile from "./android/profiles/AndroidDeviceProfile";
import {NosyProfile} from "./device/profile/NosyProfile";
import {IProfile} from "./device/profile/IProfile";

enum ETransportType {
    USB     = 'U',
    WIFI    = 'W',
    TCP     = 'T'
}


const emuRE = /^emulator-/;
const PROP_RE = /^\[(?<name>.*)\]\s*:\s*\[(?<value>.*)\]$/;


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
export default class AdbWrapper implements IBridge
{
    static USB_TRANSPORT = 'U';
    static TCP_TRANSPORT = 'T';

    static DEFAULT_PRIV_STRATEGY = 'su';
    strategies:PrivilegedExecutionStrategyMap = {};

    /**
     * @field
     * @since v0.7.2
     */
    shortname:string = null;

    /**
     * @field
     */
    transport:string = AdbWrapper.USB_TRANSPORT;

    /**
     * @type {Path}
     * @field
     */
    path:string = null;

    /**
     * @field
     */
    deviceID:string = null;

    /**
     * @field
     */
    ip:string = null;

    /**
     * @field
     */
    port:number = null;

    /**
     * @field
     */
    host:string = null;

    /**
     * @field
     */
    usbQualifier:string = null;

    /**
     * Bridge connection status
     * @field
     */
    up = false;

    /**
     * 
     * @param {String} adbpath The ADB binary path 
     * @param {String} pDeviceID  (optional) The device ID to manage.
     * @constructor
     */
    constructor(adbpath:string = null, pDeviceID:string = null){

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

        this.addPrivilegedStrategy('su', new PrivilegedExecutionStrategy({
           name: 'su',
           phases: [new PrivilegedExecutionPhase({
               type: PrivilegedExecutionType.COMMAND,
               priv: true,
               bridgeCmd: "shell",
               devBin: "su",
               devBinArgs: ['-c']
           })]
        }));

    }

    /**
     * To clone. 
     * 
     * It returns a new instance of AdbWrapper
     * 
     * @param {Object} pOverride Optional. Override configuration (key/value)
     * @returns {AdbWrapper} New instance with same configuration  
     * @method
     * @since v0.7.2
     */
    clone( pOverride:any = {}):AdbWrapper{
        const o:any = new AdbWrapper(this.path, this.deviceID);
        for(const i in this){
            if(pOverride[i] !== undefined){
                o[i] = pOverride[i];
            }else{
                o[i] = this[i];
            }   
        }
        return o as AdbWrapper;
    }

    /**
     * To get connection status
     * 
     * @returns {Boolean} TRUE is connected, else FALSE
     * @method
     */
    isConnected():boolean{
        return this.up;
    }

    /**
     * 
     * @param {String} pIP IP Address
     * @method
     */
    setIpAddress(pIP:string){
        this.ip = pIP;
    }

    /**
     * 
     * @param {Integer} pNumber Port number
     * @method
     */
    setPortNumber(pNumber:number){
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
    isReady():boolean{
        return (this.path != null) && (_fs_.existsSync(this.path));
    }


    /**
     *
     * @param pName
     * @param pOptions
     */
    addPrivilegedStrategy( pName:string, pStrategy:PrivilegedExecutionStrategy):void {
        this.strategies[pName] = pStrategy;
        pStrategy.setBridge(this);
    }

    /**
     *
     * @param string pName Strategy name
     */
    getStrategy(pName:string):PrivilegedExecutionStrategy {
        return this.strategies[pName];
    }

    /**
     * To execute a bridge command such as "adb root"
     * where the command is "root"
     * @param pCommand
     */
    async execBridgeCommand( pCommand:string):Promise<boolean> {
        let ret:Promise<string> = null;

        ret = await UT.execAsync(this.setup() + " "+pCommand).catch((err:string)=>{
            throw AdbBridgeException.BRIDGE_COMMAND_FAILURE(err);
        });

        return true;
    }

    /**
     * To init the next command, if a device ID is passed as arguments
     * then the command will use this device, else if a default device ID 
     * is configured the ID will be use, else no device ID is set. 
     * 
     * 
     * @param {String} deviceID The ID of the device to use 
     * @returns {String|String[]} The begin of the command
     * @method
     */
    setup(pDeviceID:string = null, pReturnString =  true):string|string[]{
        const cmd:string[]=[this.path];


        if(this.transport == AdbWrapper.USB_TRANSPORT){
            if(pDeviceID != null){

                    cmd.push("-s")
                    cmd.push(pDeviceID)

            }else if(this.deviceID != null){
                    cmd.push("-s")
                    cmd.push(this.deviceID)
                }

        }else if(this.transport == AdbWrapper.TCP_TRANSPORT){
            cmd.push("-s")
            cmd.push(this.ip+':'+this.port)
        }

        if(pReturnString){
            return cmd.join(' ');
        }else{
            return cmd;
        }

    }

    /**
     * To kill a process by its PID with the specified signal
     *
     * @param pPID
     * @param pSignal Optional.
     */
    killProcess( pPID:number, pSignal = 9):string|Buffer{
        return this.shell(" kill -"+pSignal+" "+pPID);
    }

    /**
     * To kill adb-server
     * 
     * @async
     * @method
     */
    async kill():Promise<boolean>{
        let ret:Promise<string> = null;

        ret = await UT.execAsync(this.setup() + " kill-server").catch((err:string)=>{
            throw new Error('[ADB WRAPPER] kill-server : '+err);
        });


        /*if(ret.stderr != null && ret.stderr.length > 0){
            throw new Error('[ADB WRAPPER] kill-server : '+ret.stderr);
        }*/


        return true;
    }

    /**
     * Set the transport type
     * 
     * @param {Char} transport_type 
     * @method
     */
    setTransport(transport_type:string){
        this.transport = transport_type;
    }

    /**
     * To check if the bridge uses TCP transport
     * 
     * @method
     * @returns {Boolean} TRUE if the wrapper is configured to use TCP, else FALSE
     * @since v0.7.1
     */
    isNetworkTransport():boolean{
        return (this.transport === AdbWrapper.TCP_TRANSPORT);
    }

    /**
     * To check if the bridge uses USB transport

     * 
     * @method
     * @returns {Boolean} TRUE if the wrapper is configured to use TCP, else FALSE     * 
     * @since v0.7.1
     */
    isUsbTransport():boolean{
        return (this.transport === AdbWrapper.USB_TRANSPORT);
    }

    /**
     * To connect a remote device over TCP
     * 
     * @param {String} pIpAddress IP Address of target device
     * @param {Integer} pPortNumber 
     * @param {String} pDeviceID Target device ID
     * @returns {Boolean} TRUE if success, else FALSE
     * @async
     * @method
     * @since v0.7.2
     */
    async connect( pIpAddress:string, pPortNumber:number, pDeviceID:string=null):Promise<boolean>{
        let ret:any;
        ret = await UT.execAsync(this.setup(pDeviceID) + " tcpip "+pPortNumber);
        //Logger.debug(ret);

        ret = await UT.execAsync(this.setup(pDeviceID) + " connect "+pIpAddress+':'+pPortNumber);
        //console.log(ret);
        
        if(ret.stderr != null && ret.stderr.length > 0)
            return false;

        if(ret.stdout.indexOf(`connected to ${pIpAddress}`)==-1)
            return false;

        this.shortname = 'adb+tcp';
        this.transport = AdbWrapper.TCP_TRANSPORT;
        this.deviceID = pIpAddress+':'+pPortNumber;

        return true;
    }


    /**
     * To parse the ADB output. 
     * 
     * It returns a collection of ApkPackage.
     * ```
     > let packages = adbWrapper.parsePackageList(`
    package:com.android.cts.priv.ctsshim
    ...
    `) 
     > console.log(packages)
    [{
        packageIdentifier: 'com.android.cts.priv.ctsshim',
        packagePath: '...'
    },...]
     * ```  
     * 
     * @param {String} pPackageListStr The ADB output to parse 
     * @param {String} pOptions [Optional] Additional option to pass to ADB
     * @returns {AppPackage[]} The list of package
     * @private
     * @method
     */
    parsePackageList( pPackageListStr:string, pOptions=''){
        const reg = new RegExp("^package:(?<apk_name>.*)");
        const packages:AppPackage[] = [];

        if(pPackageListStr.indexOf("error:")==0){
            throw AdbWrapperError.newDeviceNotFound(`Unable to list package. ADB Error: "${pPackageListStr}"`);
        }

        pPackageListStr.split( EOL ).forEach((element:string) => {
            const pkg = element.trim();
            let app:string, path:string = null;

            if(reg.test(pkg)) {
                const result:RegExpExecArray  = reg.exec(pkg);
                if(result !== null) {


                    // package path arg
                    if(pOptions.indexOf('-f') > -1){
                        const i = result.groups['apk_name'].lastIndexOf("=");
                        path = result.groups['apk_name'].substr(0,i);
                        app = result.groups['apk_name'].substr(i+1);
                    }else{
                        path = null;
                        app = result.groups['apk_name']
                    }

                    packages.push(new AppPackage({
                        packageIdentifier: app,
                        packagePath : path
                    }));
                }
            }
        });
        return packages;
    }

    /**
     * To list all packages installed on target device
     * 
     * @param {String} deviceId [Optional] A specific device ID
     * @returns {AppPackage[]} An array of AppPackage objects
     * @method
     */
    listPackages( pOtions=""):AppPackage[] {
        //let ret:string;

        //ret = UT.execSync(this.setup() + " shell pm list packages "+pOtions); // toString("ascii")

        return this.parsePackageList(
            UT.execSync(this.setup() + " shell pm list packages "+pOtions)
        , pOtions);
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
    getPackagePath(packageIdentifier:string):string {
        const reg = new RegExp("^package:(?<package_name>.*)");

        /*if(Process.env.DEXCALIBUR_ENV){
            ret = TestHelper.execSync(this.setup(deviceId) + " shell pm path " +  packageIdentifier).toString("ascii");
        }else
            ret = Process.execSync(this.setup(deviceId) + " shell pm path " +  packageIdentifier).toString("ascii");
*/
        const ret = UT.execSync(this.setup() + " shell pm path " +  packageIdentifier, "ascii");

/*
        if(deviceId !== null) {
            ret = Process.execSync(this.setup(deviceId) + " shell pm path " +  packageIdentifier).toString("ascii");
            
        }
        else {
            ret = Process.execSync(this.path + " shell pm path " + packageIdentifier).toString("ascii");
        }*/

        let path:string = ret.split( EOL )[0].trim();
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
    async parseDeviceList( pDeviceListStr:string):Promise<Device[]>{
        const dev:Device[] = [];
        let data:any=null, id:any=null, device:Device=null, token:any=null;
        let bridge:AdbWrapper = null;

        Logger.debug(pDeviceListStr);

        const ret = pDeviceListStr.split(EOL);
        const re = new RegExp("^([^\\s\\t]+)[\\s\\t]+(.*)");


        for(const ln in ret){

            if(UT.trim(ret[ln]).length==0 
                || ret[ln]=="List of devices attached") 
                    continue;
    
            data =  re.exec(ret[ln]);

            if(data.length<3){
                Logger.warn("Invalid device id detected : ", ret[ln]);
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
                device.id = "<pending...>";
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
            device.type = OperatingSystem.ANDROID;

            // use Device Profile instead of isEmulated flag
            device.isEmulated = data[0].match(emuRE);
            // remove ?
            if(device.isEmulated){
                device.bridge.setTransport(AdbWrapper.TCP_TRANSPORT);
            }

            device.connected = true;
            device.getDefaultBridge().up = true;

            for(let i=0; i<data.length; i++){
                Logger.debug(`[DEVICE MANAGER] Parsing device list : ${data[i]}`);
                if(data[i].indexOf(':')>-1){
                    token = data[i].split(':',2);
                    switch(token[0]){
                        case 'usb':
                            (device.bridge as AdbWrapper).usbQualifier = token[1];
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
                            device.offline = true;
                            device.connected = false;
                            device.getDefaultBridge().up = false;
                            break;
                        case 'device':
                        default:
                            Logger.debug("Unrecognized key (single token) : "+data[i]);
                            break;

                    }
                }
            }


            if(device.bridge.shortname=='adb+tcp' && device.id == null){
                try{
                    await device.retrieveUIDfromDevice();
                }catch(err){
                    // catch Device offline but nothing to do
                    Logger.error("[ADB WRAPPER] List Devices : "+err.message);
                }
            }

            dev.push(device);
        }

        return dev;
    }

    /**
     * To list connected devices
     * 
     * @returns {Device[]} A collection of Device objects
     * @async
     * @method
     */
    async listDevices():Promise<Device[]>{
        Logger.info("[ADB] Enumerating connected devices ...");
        return await this.parseDeviceList( 
            UT.execSync(this.setup()+" devices -l", "ascii")  );
    }

    

    /**
     * Pull a remote resource into the project workspace
     * Same as 'adb pull' commande.
     * 
     * @param {*} remote_path The path of the remote resource to download 
     * @param {*} local_path The path where the resource will be stored locally
     * @method
     */
    pull(remote_path:string, local_path:string):string|Buffer{
        return UT.execSync(this.setup()+' pull '+remote_path+' '+local_path);
    }

    /**
     * Pull a remote resource into the project workspace with Application Privileges
     * Same as 'adb pull' commande.
     * 
     * @param {*} package_name The package name
     * @param {*} remote_path The path of the remote resource to download 
     * @param {*} local_path The path where the resource will be stored locally
     * @deprecated
     * @method
     */

    pullRessource(package_name:string,remote_path:string, local_path:string){
        const binary_blob:Buffer = Process.execSync(this.setup() + 'shell "run-as '+ package_name+ ' cat ' + remote_path + '"');
            _fs_.writeFile(local_path,binary_blob,function(err) {
                if(err) {
                    Logger.error("[ADB] pullRessource() : an error occurs : "+err);
                }
            
                Logger.info("[ADB] The file was saved!");
            });
    }
    /**
     * Push a local resource to a remote location
     * Same as 'adb push' commande.
     * 
     * @param {*} local_path The path of the local resource to upload 
     * @param {*} remote_path The path where the resource will be stored remotely
     * @method
     */
    push(local_path:string, remote_path:string):string|Buffer{
            return UT.execSync(this.setup()+' push '+local_path+' '+remote_path);
    }


    /**
     * Execute a command on the device
     * Same as 'adb shell' commande.
     * 
     * @param {*} command The command to execute remotely
     * @method
     */
    shell(command:string):string|Buffer{
            return UT.execSync(this.setup()+' shell '+command);
    }

     /**
     * Execute a command on the device
     * Same as 'adb shell' commande.
     * 
     * @param {*} command The command to execute remotely
     * @async
     * @method
     */
    async shellAsync(command:string, deviceID = null):Promise<any>{
        return await UT.execAsync(this.setup()+' shell '+command);
    }

    /**
     * Execute a command on the device
     * Same as 'adb shell' commande.
     * 
     * @param {*} command The command to execute remotely
     * @method
     */
    shellWithEH(command:string, callbacks:any=null):Process.ChildProcess{

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
    shellWithEHsync(command:string, pOptions:any = null):string|Buffer{

            Logger.info("[ADB] ",this.setup()+' shell '+command);

            return Process.execSync(this.setup()+' shell '+command);

    }

    /**
     * To execute a command into a detached process.
     * 
     * Useful to launch side application such as frida-server
     * 
     * @param {String} pCommand 
     * @param {String} pArgs
     * @returns {Boolean} TRUE is success, else FALSE
     * @method
     * @async
     * //  pArgs = "",
     */
    async detachedShell( pCommand:string|string[], pOptions:any = { detached:true, unref:true, delay:0 } ):Promise<any>{

        let child:Process.ChildProcess=null;
        try{
            let args:string[] = this.setup(null,false) as string[];
            const ws:DexcaliburWorkspace =  DexcaliburWorkspace.getInstance();
            const time = UT.time();

            pOptions.err = _path_.join( ws.getTempFolderLocation(), (time+'_err.log'));
            pOptions.out = _path_.join( ws.getTempFolderLocation(), (time+'_out.log'));

            const out:number = _fs_.openSync( pOptions.out, 'w+', 0o666);
            const err:number = _fs_.openSync( pOptions.err, 'w+', 0o666);



            args.shift(); // remove adb path from begin
            if(pCommand[0] !== "shell"){
                args.push('shell');
            }


            args = args.concat(pCommand);
            child = Process.spawn(this.path, args, { detached: pOptions.detached, stdio: [ 'ignore', out, err ] });
            if(pOptions.unref) child.unref();
            Logger.info( `[ADB WRAPPER] detachedShell spawned: ${this.path} ,  ${args}  (opts)`);

        }catch(err){
            Logger.error('[ADB WRAPPER] Detached shell error :'+err.message);
        }

        return true;
    }

    /**
     * To execute a command into a detached process.
     *
     * Useful to launch side application such as frida-server
     *
     * @param {String} pCommand
     * @param {String} pArgs
     * @returns {Boolean} TRUE is success, else FALSE
     * @method
     * @async
     */
    spawnShell( pOptions:any ):Process.ChildProcess{
        let child:Process.ChildProcess = null;
        let ws:DexcaliburWorkspace, sid:string, outStream:_fs_.ReadStream, errStream:_fs_.ReadStream;

        //let rep:string = null;
        try{

            const args:string[] = this.setup(null,false) as string[];
            pOptions.shell = false;
            args.shift();
            args.push("shell");

            ws = DexcaliburWorkspace.getInstance();
            sid = UT.randString(6, UT.ALPHANUM);
            //outStream = _fs_.createReadStream(_path_.join( ws.getTempFolderLocation(), sid+'_out.log'), {flags:'w+', mode:0o666 });
            //errStream = _fs_.createReadStream(_path_.join( ws.getTempFolderLocation(), sid+'_err.log'), {flags:'w+', mode:0o666 });

            pOptions.stdio = 'pipe'; // ['pipe',outStream,errStream];
            child = Process.spawn(this.path, args, pOptions);

            // child.stdout = outStream;
            // child.stderr = errStream;
            //rep = Process.execSync(args.join(" "), pOptions); //{ detached: true, stdio: [ 'ignore', out, err ] });
            //child.unref();

        }catch(err){
            Logger.raw('ADB : Spawn shell error :'+err.message);
        }

        return child;
    }


    /**
     * Execute a command on the device via 'su -c'
     * Same as 'adb shell su -c' commande.
     * 
     * @param {String} command The command to execute remotely
     * @async
     * @method
     */
    async privilegedShell(command:string, pOptions:any = {detached: false, strategy:'su'}):Promise<boolean|string|Buffer>{
        Logger.info(`[ADB] Privileged exec <detached:${pOptions.detached?'true':'false'}> : ${command}`);

        if(!pOptions.hasOwnProperty('strategy') || pOptions.strategy==null){
            pOptions.strategy = AdbWrapper.DEFAULT_PRIV_STRATEGY;
        }

        const stt:PrivilegedExecutionStrategy = this.getStrategy(pOptions.strategy);


        if(pOptions.detached)
            return await this.detachedShell(stt.prepareArray( [command], this), pOptions); //["shell","su","-c",command]);
        else{

            try{
                Logger.info(this.setup()+' '+stt.prepareString(command, this));
            }catch(e){
                Logger.info(e.message);
                Logger.info(e.stack);
            }

            return UT.execSync(this.setup()+' '+stt.prepareString(command, this)) ; //' shell su -c "'+command+'"');
        }

    }


    /**
     * To perform profiling of the device associated to this adb wrapper instance.
     *  
     * 
     * @returns {DeviceProfile} The device profile of target device
     * @method
     * @async
     */
    async performProfiling(pOptions:DeviceProfilingOptions):Promise<DeviceProfile>{

        if(pOptions.profile==null){
            pOptions.profile = new AndroidDeviceProfile();
        }

        if(pOptions.type==null){
            pOptions.type = "all";
        }

        if(pOptions.tmp==null){
            pOptions.tmp = this.deviceID+"_"+UT.time();
        }

        if(pOptions.localTmp==null){
            pOptions.localTmp = _path_.join(DexcaliburWorkspace.getInstance().getTempFolderLocation(),pOptions.tmp);
        }

        if(pOptions.remoteTmp==null){
            pOptions.remoteTmp = "/data/local/tmp/"+pOptions.tmp;
        }

        // get the list of profile
        //const profs:ProfileMap = pOptions.profile.getProfiles(pOptions.hasOwnProperty('uids')? pOptions.uids : null);
        const profs:ProfileMap = (new AndroidDeviceProfile()).getProfiles(pOptions.hasOwnProperty('uids')? pOptions.uids : null);


        // create local temporary folder
        if(!_fs_.existsSync(pOptions.localTmp)){
            _fs_.mkdirSync(pOptions.localTmp);
        }

        // create remote folder
        this.shellWithEHsync(" mkdir /data/local/tmp/"+pOptions.tmp+"");

        // GenericProfiler
        pOptions.profile.update( this, pOptions);


        // perform detection not based on properties
        let freshProf:IProfile;
        for(const name in profs){
            Logger.info("[ADB][type="+pOptions.type+"] profile '"+name+"' [isNosy="+(profs[name].isNosy()?'true':'false')+"][uid="+(profs[name].uid)+"] ")
            if(pOptions.type !== "all" && pOptions.type!==name) continue;

            if(profs[name].isNosy()){
                freshProf = await (profs[name] as NosyProfile).performProfiling(this, pOptions);
                if(freshProf != null){
                    Logger.info("[ADB][type="+pOptions.type+"] profile '"+name+"' : success ")
                    pOptions.profile.updateSubProfile(name, freshProf);
                }else{
                    Logger.error("[ADB][type="+pOptions.type+"] profile '"+name+"' : failed ")
                }
            }
        }

        // perform generic detection based on properties
        pOptions.profile.refresh();


        // remove local temporary folder
        if(!_fs_.existsSync(pOptions.localTmp)){
            _fs_.unlinkSync(pOptions.localTmp);
        }

        // remove remote folder
        this.shellWithEHsync(" rm -r /data/local/tmp/"+pOptions.tmp+"");

        return pOptions.profile;
    }

    /**
     * 
     * @param {Object} pData Poor object
     * @returns {AdbWrapper} ADB wrapper instance
     * @method
     * @static 
     */
    static fromJsonObject( pData:any):AdbWrapper{
        const o:any = new AdbWrapper();
        for(const i in pData) o[i] = pData[i];
        return o as AdbWrapper;
    }

    /**
     * To tranform an instance to a simple object ready to be JSON serialized 
     * 
     * @param {Object} pExcludeList An hashmap key/value of property to exclude
     * @returns {Object} A simple object ready to be JSON serialized
     * @method
     */
    toJsonObject( pExcludeList:any={}):any{
        const o:any = {};

        for(const i in this){
            if(pExcludeList[i] === false) continue;
            if(i=='strategies') continue;
            o[i] = this[i];
        } 

        return o;
    }


    getDeviceID():string{
        return this.deviceID;
    }

    /**
     *
     * @param pPath
     * @param pOptions
     */
    async listFiles(pPath: string, pOptions?: any): Promise<any[]> {
        let out:any, cmd='ls -al ';
        const files:any[]=[];
        const rest:any = [];

        if(pOptions.hasOwnProperty('cmd')){
            cmd = pOptions.cmd;
        }




        try{
            Logger.info(JSON.stringify(pOptions));
            if(pOptions.privileged){
                out = await this.privilegedShell(cmd+pPath);
            }else{
                out = Process.execSync( this.setup() + " shell  "+cmd+pPath);
                out = out.toString();
            }
        }catch(err){
            out = err.stdout.toString();
        }

        out = out.split("\n");
        out.shift(); // total
        out.shift(); // .
        out.shift(); // ..


        if(pPath[pPath.length-1]!=='/'){
           pPath += '/';
        }

        // parse line
        out.map( (vEntry:string) => {

            let f:any = null;
            const m:any = /([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+(.+)/.exec(vEntry);

            if(m==null){
                rest.push({ src:'out', _t:'r', n:vEntry });
                return;
            }

            try{
                f = {
                    _t: m[1]!=null? (m[1][0]=='d'? 'd' : 'f') : 'f',
                    link: m[2],
                    own: m[3],
                    grp: m[4],
                    size: m[5],
                    date: m[6],
                    time: m[7],
                    n: m[8],
                    p: pPath+m[8],
                };

                if(m[1]!=null  && m[1][0]=='l'){
                    f._t = 'l';
                    const o = m[8].indexOf(' -> ');
                    if(o>-1){
                        f._d = m[8].substr(o+4);
                        f.n = m[8].substr(0,o);
                        f.p = pPath+m[8].substr(0,o);
                    }
                }

                files.push(f);
            }catch(err){
                rest.push({ src:'out', _t:'?', n:vEntry });
            }
        })

        Logger.raw(JSON.stringify(files));
        return files;
    }

    private parseProcessOut( pRaw:string):any[] {

        const pss:any[]=[] ;
        const out = pRaw.split("\n");
        const head = out.shift().split(/\s+/g); // total


        head.filter( (vHead:string, vIndex:number) => {
            return vHead.length>0;
        });

        // parse line
        out.map( (vEntry:string) => {

            const ps:any = {};
            const m:any = vEntry.split(/\s+/g);

            try{
                head.map( (vHead:string, vIndex:number) => {
                    ps[vHead] = m[vIndex];
                });
                pss.push(ps);
            }catch(err){
                Logger.error(err.msg);
            }
        });

        return pss;
    }

    async listProcesses( pOptions:any):Promise<any>{
        let out:any, cmd='ps -A ';

        if(pOptions.hasOwnProperty('cmd')){
            cmd = pOptions.cmd;
        }

        try{
            Logger.info(JSON.stringify(pOptions));
            if(pOptions.privileged){
                out = await this.privilegedShell(cmd);
            }else{
                out = Process.execSync( this.setup() + " shell  "+cmd);
                out = out.toString();
            }

            out = this.parseProcessOut(out);
        }catch(err){
            out = err.stdout.toString();
        }

        Logger.raw(out);
        return out;
    }

    /**
     *
     * @param pPath
     * @param pOptions
     * @async
     * @method
     */
    async readFile( pPath:string, pOptions:any):Promise<any> {
        let out:any, cmd='cat ';

        if(pOptions.hasOwnProperty('cmd')){
            cmd = pOptions.cmd;
        }

        try{
            Logger.info(JSON.stringify(pOptions));
            if(pOptions.privileged){
                out = await this.privilegedShell(cmd+pPath);
            }else{
                out = Process.execSync( this.setup() + " shell  "+cmd+pPath);
                out = out.toString();
            }
        }catch(err){
            out = err.stdout.toString();
        }

        Logger.raw(out);
        return out;
    }

    /**
     *
     * @param {string[]} pPath Paths of package to install
     * @param {AndroidPackageInstallOptions} pOptions Install options
     * @return
     * @async
     * @since 1.0.0
     */
   async installApp( pPath:string[], pOptions:AndroidPackageInstallOptions):Promise<boolean> {
        let cmd:string, success:boolean;

        if(pPath.length==0){
            AdbBridgeException.APK_PATH_IS_NULL();
        }

        // pick the right install command
        if(pPath.length == 1){
            cmd = "install";
        }else{
            if(pOptions.multiple){
                cmd = "install-multiple";
            }else{
                cmd = "install-multi-package";
            }
        }

        // add options
        if(pOptions.hasOwnProperty('opts')){
            cmd += pOptions.opts.join(" ");
        }

        // append apk path(s)
        cmd += " "+pPath.join(" ");

        //try{
           const out = await Util.execAsync(this.setup(null,true)+" "+cmd);
            //success = true;
        /*}catch(err){
            Logger.error("[ADB WRAPPER] installApp : ["+err.code+"] "+err.message)
            Logger.error("[ADB WRAPPER] installApp (??): ["+err.stdout.toString())
            out = err.stdout.toString();
            success = false;
        }*/

        Logger.raw("\n"+out);
        return true;
    }


    /**
     * To prepare a list oif verified options to install applications
     *
     * @param {any} pOptions
     * @return {AndroidPackageInstallOptions}
     * @method
     * @since 1.0.0
     */
    prepareInstallOptions(pOptions:any):AndroidPackageInstallOptions {
       const verifiedOpts = {
           multiple: false,
           opts: []
       };

       const validOpts = Object.keys(AndroidInstallOptionsEnum);
       for(const ppt in pOptions){
           if(validOpts.includes(ppt)){
               verifiedOpts.opts.push(AndroidInstallOptionsEnum[ppt]);
           }
       }

       return verifiedOpts;
    }
}


