

import * as _fs_ from 'fs';
import * as _path_ from 'path';
import * as Process from 'process';
import {EOL} from 'os';
import {AndroidSyscalls} from './android/AndroidSyscalls';

import * as Log from './Logger';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

import DeviceProfile from './DeviceProfile';
import Platform from './Platform';
import PlatformManager from './PlatformManager';
import DexcaliburWorkspace from './DexcaliburWorkspace';
import Utils  from "./Utils";
import AdbWrapper from "./AdbWrapper";
import {BridgeSuperFactory, IBridge} from "./Bridge";
import ModelSyscall from "./ModelSyscall";
import AppPackage from "./AppPackage";

export enum EDevType  {
    UNKNOW=0x0,
    USB= 0x1,
    EMU= 0x2,
    ADB= 0x3,
    SDB= 0x4
};
const DEV_NAME = ['unknow','usb','emu','adb','sdb'];


export enum EOsType  {
    ANDROID= 0x0,
    LINUX= 0x1,
    TIZEN= 0x2
};
const OS_NAME = ['android','linux','tizen'];


interface BridgeList {
    [p: string]: IBridge
}



/**
 * This class represents a device
 * 
 * @class
 * @author Georges-B MICHEL
 */
export class Device
{
    /**
     * @field
     */
    type:EOsType = null;

    /**
     * Flag. TRUE if currently connected, else FALSE
     *
     * @field
     */
    connected:boolean = false;

    /**
     * Default bridge for this devices
     *
     * @field
     */
    bridge:IBridge = null; // AdbWrapper

    /**
     * Flag. TRUE if this devices is default device for instrumentation
     * @field
     * @deprecated
     */
    selected:boolean = false;

    /**
     * @field
     * @deprecated
     */
    isEmulated:boolean = false;

    /**
     * Device internal UID
     * @field
     */
    uid:string = null;

    /**
     * Real device ID
     * @field
     */
    id:string =  null;

    /**
     * TRUE if debugging is authorized, else FALSE
     * @field
     */
    authorized:boolean = true;

    /**
     * Device model
     * @field
     */
    model:string = null;

    /**
     * Device product name
     * @field
     */
    product:string = null;

    // ??s
    device:string = null;

    /**
     * Transport ID
     *
     * @field
     * @deprecated
     */
    transportId:string = null;

    /**
     * USB qualifier.
     * Change when computer-side USB port change. It help to differentiate
     * several devices with same DeviceID
     *
     * @field
     */
    usbQualifier:string = null;

    /**
     * Device profile built by DeviceProfiler
     * @type {DeviceProfile}
     * @field
     */
    profile:DeviceProfile = null;

    /**
     * Device profile built by DeviceProfiler
     * @type {DeviceProfile}
     * @field
     */
    platform:Platform = null;

    /**
     * Hold frida configuration specfic to the device
     * @type {Object}
     * @field
     */
    frida:any;

    /**
     * Hold all bridges (adb+usb, adb+tcp, sdb+usb, ssh, jtag, ...) configured for this device
     *
     * @type {AdbWrapper[]}
     * @field
     */
    bridges:BridgeList = {};

    /**
     * Flag. TRUE is the device is enrolled, else FALSE
     * @field
     */
    enrolled:boolean = false;

    /**
     * Flag. TRUE is the device is offline, else FALSE
     * @field
     */
    offline:boolean = false;

    /**
     *
     */
    syscalls:ModelSyscall[] = null;

    /**
     * List of application package installed
     *
     * @type {AppPackage[]}
     * @field
     */
    apps:AppPackage[] = [];


    //fs: DeviceFileSystem = null;



    /**
     * 
     * @param {*} config 
     * @constructor
     */
    constructor(config:any=null){

        this.frida = {
            server: null
        }

        if(config !== null)
            for(let i in config) this[i] = config[i];    
    }

    /**
     * To add a bridge to the device
     * 
     * A bridge a way to send command or interact with the device.
     * 
     * @param {AdbWrapper} pBridge 
     * @method
     */
    addBridge( pBridge:IBridge, pOverride:boolean=false){
        if(this.bridges[ pBridge.shortname ] == null || pOverride){
            this.bridges[ pBridge.shortname ] = pBridge;
        }
    }

    getBridge( pName:string):IBridge{
        if(this.bridges[pName] == null)
            throw new Error(`[DEVICE] The device ${this.uid} not support bridge ${pName}`);

        return this.bridges[pName];
    }

    setDefaultBridge( pName:string){
        this.bridge = this.getBridge(pName);
        //this.setUID(this.bridge.deviceID);
    }

    getDefaultBridge():IBridge{
        return this.bridge;
    }
    

    setEnrolled( pStatus:boolean = true){
        this.enrolled = pStatus;

        return this;
    }

    isEnrolled():boolean{
        return this.enrolled;
    }

    getProfile():DeviceProfile{
        return this.profile;
    }

    /**
     * To get enrollment status
     * 
     * @returns {Boolean} Enrollement status : TRUE if the device is enrolled and frida ready, else FALSE
     * @method
     */
    isFridaReady():boolean{
        return this.enrolled;
    }

    /**
     * To get device status : connected / disconnected
     * 
     * @returns {Boolean} TRUE if the device is connected, else FALSE  
     * @method
     */
    isConnected():boolean{
        let up:boolean = false;
        for(let i in this.bridges)
            up = up || this.bridges[i].up;
        //return (this.connected == true);
        return up;
    }

    /**
    * To get authorized status
    * 
    * @returns {Boolean} TRUE if the device is authorized, else FALSE  
    * @method
    */
    isAuthorized():boolean{
        return (this.authorized == true);
    }

    /**
     * To disconnect "logically" a device.
     * 
     * This flag is involved into connected device monitoring.
     * 
     * @method
     */
    disconnect(){
        this.connected = false;
    }

    /**
     * 
     * @param {*} pPath 
     */
    setFridaServer( pPath:string){
        this.frida.server = pPath;
    }

    /**
     * @method
     */
    getFridaServerPath():string{
        return this.frida.server;
    }

   

    /**
     * To setup internal device UID
     * 
     * Since several device can have the same DeviceID value,
     * UID is built by mixing several DeviceID with several data from `qualifier` array
     * 
     * 
     * @param {String} deviceID Value of DeviceID as returned by the device
     * @param {String[]} qualifier Additional data 
     */
    setUID(deviceID:string, qualifier:any = null){
        this.uid = deviceID;
/*        for(let k in qualifier){
            this.uid += "/"+k+"/"+qualifier[k];
        }*/
    }


    /**
     * To get device UID
     * 
     * TODO : fix typo
     * 
     * <b>Warning : Device UID is the Dexcalibur internal UID. 
     * It is not the DeviceID as returned by the device. </b>
     * 
     * @returns {String} Internal device UID
     */
    getUID():string{
        return this.uid;
    }

    update( pDevice:Device){
        let b:IBridge=null;

        if(this.id==null){
            this.id = pDevice.id;
        }

        this.bridge = pDevice.bridge;

        for(let i in pDevice.bridges){
            b = pDevice.bridges[i];
            this.bridges[i] = b;

            /*if(this.bridges[i] != null){
                this.bridges[i] = b;
            }else{
                this.bridges[i] = 
            }*/
        }

        this.model = pDevice.model;
        this.device = pDevice.device;
        this.product = pDevice.product;
        this.transportId = pDevice.transportId;
        // deprecated
        this.connected = pDevice.connected;
        this.authorized = pDevice.authorized;
        // deprecated
        this.usbQualifier = pDevice.usbQualifier;
    }

    merge( pDevice:Device){
        for(let i in pDevice){
            switch(i){
                case 'enrolled':
                    if(pDevice.enrolled)
                        this.enrolled = pDevice.enrolled;
                    break;
                case 'bridges':
                    for(let t in pDevice.bridges){
                        if(this.bridges[t] == null){
                            this.bridges[t] = pDevice.bridges[t];
                        }
                    }
                    break;
                case 'authorized':
                    if(pDevice.authorized){
                        this.authorized = true;
                    }
                    break;
                case 'connected':
                    // deprecated
                    if(pDevice.connected){
                        this.connected = true;
                    }
                    break;
                case 'profile':
                    if(pDevice.profile != null){
                        this.profile = pDevice.profile;
                    }
                    break;
                case 'bridge':
                case 'platform':
                    //
                    break;
                case 'frida':
                    if(this.frida.server == null && pDevice.frida.server != null){
                        this.frida.server = pDevice.frida.server;
                    }
                    break;
                default:
                    if(this[i] == null && pDevice[i]!=null){
                        this[i] = pDevice[i];
                    }
                    break;
            }
        }

        if(pDevice.isConnected()){
            // TODO : add configurable priority TCP, USB, ... when several choices are possible
            /*
            if device passed as argument is connected now replace default bridge.
            avoid case : 
                1/ device identified by USB
                2/ connected over TCP
                3/ disconnected from USB
                4/ restart
                4'/ ADB restart ?
                5/ try USB connection when only TCP is available
            */
           if(this.bridge == null)
                this.setDefaultBridge(pDevice.bridge.shortname);
        }
        if(pDevice.enrolled){
            this.enrolled = pDevice.enrolled;
        }
        for(let i in pDevice.bridges){
            this.bridges[i] = pDevice.bridges[i]
        }
    }

    flagAsUnauthorized(){
        this.authorized = false;
    }

    setTransportId(id:string){
        this.transportId = id;
    }

    setUsbQualifier(id:string){
        this.usbQualifier = id;
        if(this.uid==null && this.id != null) 
            this.setUID( this.id, {
                usb: id
            });
    }

    setModel(name:string){
        this.model = name;
    }

    setProduct(name:string){
        this.product = name;
    }

    setDevice(name:string){
        this.device = name;
    }

    exec(pCommand:string, pCallbacks:any):any{
        return this.bridge.shellWithEH(pCommand, pCallbacks);
    }

    execSync(pCommand:string):any{
        return this.bridge.shellWithEHsync(pCommand);
    }


    async privilegedExecSync(pCommand:string, pOtions:any=null):Promise<any>{
        if(pOtions == null)
            return await this.bridge.privilegedShell(pCommand);
        else 
            return await this.bridge.privilegedShell(pCommand, pOtions);
    }

    getPlatform():Platform{
        return this.platform;
    }

    setPlatform( pPlatform:Platform){
        this.platform = pPlatform;
    }



    /**
     * 
     * @param {Path|String} pRemotePath 
     * @param {Path|String} pLocalPath 
     */ 
    pull(pRemotePath:string, pLocalPath:string):string|Buffer{
        let c:string|Buffer;
        c = this.bridge.pull(pRemotePath, pLocalPath);
        return c;
    }

    /**
     * To pull a fil from a device and store it into temporary folder
     * 
     * @param {String} pRemotePath 
     * @method
     */
    pullTemp(pRemotePath:string):string{
        if(this.bridge == null){
            throw new Error("[DEVICE] Bridge is not ready");
        }
        let path:string = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(),
            Utils.randString( 16, Utils.ALPHANUM)+'.remote.apk'
        );

        this.bridge.pull( pRemotePath, path);

        return path;
    }

    /**
     * To push an executable binary 
     * 
     * @param {Path|String} pLocalPath 
     * @param {Path|String} pRemotePath 
     */
    pushBinary( pLocalPath:string, pRemotePath:string):string|Buffer{
        let success:string|Buffer = this.bridge.push( pLocalPath, pRemotePath);
        if(success === undefined || success === null){
            throw new Error(`[DEVICE] Fail to push '${pLocalPath}' file to '${pRemotePath}'`);
        }

        return this.bridge.shell(`chmod 777 ${pRemotePath}`);
    }

    /**
     * 
     * @param {*} pPkgIdentifier 
     * @param {*} pLocalPath 
     * @returns {Boolean} Return TRUE if file has been successfully downloaded, else FALSE
     * @throws {BridgeException} 
     */
    pullPackage( pPkgIdentifier:string, pLocalPath:string):boolean{
        let path:string = null;

        // get package path of the app
        path = this.bridge.getPackagePath(pPkgIdentifier);

        // pull the file
        this.bridge.pull( path, pLocalPath);       

        return _fs_.existsSync(pLocalPath);
    }



    /**
     * 
     * @deprecated
     * @param {Object} data 
     * @param {Object} callbacks 
     * @param {IntentFilter} pIntentFilter An intance of the intent filter 
     * @param {Boolean} force 
     */
    sendIntent(data:any, callbacks:any=null, pIntentFilter:any=null, force:boolean=false):any{
        let msg:any = {stdout:null, stderr:null};
        let pkg:string='', cmd:string='am start ';
        let act:any = null, cat:any=null;
        let cb:any = null;

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
    /*
    hasFile(file:string, privileged:boolean=true):boolean{
        let ret="", i=0;

        if(privileged)
            ret = this.bridge.hasFilePrivileged(file).toString("ascii");
        else
            ret = this.bridge.hasFile(file).toString("ascii");
            
        return (ret.indexOf(file)==0);
    };*/


    async performProfiling( pOptions){

        if(this.bridge != null){
            this.profile = await this.bridge.performProfiling();
        }

        return true;
    }


    /**
     * To unserialize a Device from JSON string
     * 
     * @param {*} pJsonObject 
     * @param {*} pOverride 
     * @returns {String} JSON-serialized object
     * @method 
     */
    static fromJsonObject(pBridgeSFactory:BridgeSuperFactory, pJsonObject:any, pOverride:any = {}):Device{
        let dev:any = new Device();
        for(let i in pJsonObject){
            switch(i){
                case 'type':
                    dev.type = OS_NAME.indexOf(pJsonObject[i]);
                    break;

                case 'bridges':
                    dev.bridges = {};
                    for( let j in pJsonObject.bridges){
                        // todo : replace AdbWrapeper by BridgeFactory
                        dev.bridges[j] = pBridgeSFactory.getFactory(j).fromJsonObject( pJsonObject.bridges[j]);
                    }
                    break;

                case 'profile':
                    dev[i] = ((pJsonObject[i] != null)? DeviceProfile.fromJsonObject(pJsonObject[i]) : null);
                    break;

                case 'platform':
                    dev[i] = ((pJsonObject[i] != null)? PlatformManager.getInstance().getPlatform(pJsonObject[i]) : null);
                    break;
                
                default:
                    dev[i] = pJsonObject[i];
                    break;
            }      
            
        }

        dev = dev as Device;

        if(dev.bridge != null){
            dev.setDefaultBridge(dev.bridge);
        }
        
        for(let i in pOverride){
            dev[i] = pOverride[i];
        }

        return dev;
    }

    /**
     * To retrieve device specific UID from device through shell
     *
     * @method
     */
    async retrieveUIDfromDevice():Promise<boolean>{
        if(this.isConnected()===false || this.offline===true) 
            throw new Error('Device is offline');

        let id:string[] = null;
        let {stdout, stderr} = await this.bridge.shellAsync('getprop ro.serialno');

        if(stderr != ''){
            throw new Error(stderr);
        }

        id = stdout.split(EOL);
        if(id[0] != undefined){
            this.id = id[0];
        }else{
            Logger.debug('[DEVICE] DeviceID retrieved from device : ',id.join(''));
        }

        return true;
    }

    /**
     * To serialize the Device to JSON string
     * 
     * @param {Object} pOverride A collection overrided field
     * @returns {JsonObject} JSON-serialized object
     * @method 
     */
    toJsonObject( pOverride:any = {}, pExcludeList:any={}){
        let json:any = new Object();
        for(let i in this){
            if(pExcludeList[i] === false) continue;
            
            switch(i){
                case 'type':
                    json[i] = OS_NAME[this.type];
                    break;

                case 'bridge':
                    if(this.bridge != null){
                        json[i] = this.bridge.shortname;                        
                    }
                    break;

                case 'bridges':
                    json.bridges = {};
                        // json.bridgeData = this.bridge.toJsonObject();
                    for(let k in this.bridges){
                        json.bridges[k] = this.bridges[k].toJsonObject( pExcludeList.bridge);     
                    };
                    break;

                case 'profile':
                    json[i] = ((this[i] instanceof DeviceProfile)? this.profile.toJsonObject( pExcludeList.profile) : null);
                    break;

                case 'platform':
                    json[i] = ((this[i] instanceof Platform)? this.platform.getUID() : null);
                    break;
            
                case 'connected':
                    json[i] = this.isConnected();
                    break;

                default:
                    json[i] = this[i];
                    break;
            }                  
        }

        for(let i in pOverride){
            json[i] = pOverride[i];
        }
        return json;
    }

    getSyscallList():ModelSyscall[]{
        if(this.syscalls == null){
            if(this.type===EOsType.ANDROID){
                this.syscalls = AndroidSyscalls;
            }
        }

        return this.syscalls;
    }

    /**
     *
     * @param {AppPackage[]} pApps List of installed application
     * @return {AppPackage[]} Application removed
     */
    updateInstalledApp( pBridge:IBridge = null, pOtions:any = '-f'):void {
        let bridge:IBridge, apps:AppPackage[];

        // get bridge
        if(pBridge==null)
            bridge = this.getDefaultBridge();
        else
            bridge = pBridge;

        // list apps
        this.apps = bridge.listPackages(pOtions);
    }

    getInstalledApp():AppPackage[] {
        return this.apps;
    }

    /**
     * To get an installed application by package identifier
     *
     * @param {string} pPackageId
     * @return {AppPackage}
     * @method
     * @since 1.0.0
     */
    getApplicationByID( pPackageId:string):AppPackage{
        for(let i=0; i<this.apps.length;  i++){
            if(this.apps[i].packageIdentifier==pPackageId){
                return this.apps[i];
            }
        }
        return null;
    }

    /**
     * To get absolute path of the folder containing application data
     * of specified app
     *
     * @param {string} pPackageId Application package ID
     * @return {string} Folder absolute path
     * @method
     * @since 1.0.0
     */
    getDataPathOf( pPackageId:string): string {

        if(this.type===EOsType.ANDROID){
            return ("/data/data/"+pPackageId).replace(/(\s+)/g, '\\$1');
        }

        return null;
    }

    /**
     * To get the OS type of the device
     */
    getType():string {
        return OS_NAME[this.type];
    }
}
