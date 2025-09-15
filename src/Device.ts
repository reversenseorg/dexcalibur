import * as _fs_ from 'fs';
import * as _path_ from 'path';
import {EOL} from 'os';

import * as Log from './Logger.js';
import DeviceProfile from './device/DeviceProfile.js';
import Platform from './platform/Platform.js';
import PlatformManager from './platform/PlatformManager.js';
import DexcaliburWorkspace from './DexcaliburWorkspace.js';
import Utils from "./Utils.js";
import {BridgeInstallOptions, BridgeSuperFactory, DeviceProfilingOptions, IBridge, IBridgeFactory} from "./Bridge.js";
import ModelSyscall from "./ModelSyscall.js";
import AppPackage from "./AppPackage.js";
import {DeviceManagerException} from "./errors/DeviceManagerException.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import ModelSyscallFactory from "./ModelSyscallFactory.js";
import {Architecture} from "./Architecture.js";
import DeviceProfileFactory from './device/DeviceProfileFactory.js';
import {CoreDebug} from "./core/CoreDebug.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";


import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import DeviceManager from "./DeviceManager.js";
import {ProjectInput} from "./analyzer/ProjectInput.js";
import {CryptoUtils} from "./CryptoUtils.js";
import {DeviceTemplate, DeviceTemplateUUID} from "./device/template/DeviceTemplate.js";
import {DeviceTemplateFactory} from "./device/template/DeviceTemplateFactory.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import ScreenshotSession from "./platform/ScreenshotSession.js";
import ScreenshotAgent from "./platform/ScreenshotAgent.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface BridgeList {
    [p: string]: IBridge
}

export enum FridaServerTransport {
    USB='U',
    NETWORK='H'
}

export type DeviceUUID = string;

export interface FridaServerOptions {
    server: string,
    transport:FridaServerTransport,
    privileged:boolean,
    port:number,
    timeout:number,
    before:string
}

export interface DeviceOptions {
    type?:OperatingSystem;
    connected?:boolean;
    bridge?:IBridge;
    selected?:boolean;
    isEmulated?:boolean|null;
    uid?:string;
    id?:string;
    authorized?:boolean;
    model?:string;
    product?:string;
    device?:string;
    uidfp?:Record<string,string>;
    transportId?:string;
    usbQualifier?:string;
    profile?:DeviceProfile;
    platform?:Platform;
    frida?:FridaServerOptions;
    bridges?:BridgeList;
    enrolled?:boolean;
    offline?:boolean;
    syscalls?:ModelSyscall[];
    apps?:AppPackage[];
    os?:OperatingSystem;
    arch?:Architecture;
    emulatorOpts?:Record<string,any>;
    tpl?:DeviceTemplate;
}

export enum EmuCommand {
    START="start",
    STOP="stop",
    RUNNING_PID="pid"
}

/**
 * This class represents a device
 * 
 * @class
 * @author Georges-B MICHEL
 */
export class Device implements INode
{
    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid()
    }

        static TYPE:NodeType = new NodeType(
            'device',
            NodeInternalType.DEVICE,
            [
                (new NodeProperty("uid"))
                    .type(DbDataType.STRING)
                    .key(DbKeyType.PRIMARY),
                (new NodeProperty("id")).type(DbDataType.STRING),
                (new NodeProperty("type")).type(DbDataType.STRING).def(OperatingSystem.NONE),
                (new NodeProperty("model")).type(DbDataType.STRING).def(""),
                (new NodeProperty("product")).type(DbDataType.STRING).def(""),
                (new NodeProperty("platform"))
                    .type(DbDataType.BLOB)
                    .sleep( (x:NodePropertyState)=>{
                        if(x.p != null && x.p.toJsonObject!=null){
                            return (x.p as Platform).toJsonObject();
                        }else{
                            return null;
                        }
                    })
                    .wakeUp( (x:NodePropertyState)=>{
                        if(x.p != null){
                            return new Platform(x.p);
                        }else{
                            return null;
                        }
                    })
                    .def(null),
                (new NodeProperty("profile"))
                    .sleep( (x:NodePropertyState)=>{
                        if(x.p != null && x.p.toJsonObject!=null){
                            return (x.p as DeviceProfile).toJsonObject();
                        }else{
                            return null;
                        }
                    })
                    .wakeUp( (x:NodePropertyState)=>{
                        if(x.p != null){
                            return DeviceProfileFactory.fromJsonObject(x.p);
                        }else{
                            return null;
                        }
                    })
                    .type(DbDataType.BLOB).def(null),
                (new NodeProperty("transportId")).type(DbDataType.STRING).def(null),
                (new NodeProperty("usbQualifier")).type(DbDataType.STRING).def(null),
                (new NodeProperty("emulatorOpts")).type(DbDataType.BLOB).def({}),
                (new NodeProperty("enrolled")).type(DbDataType.BOOLEAN).def(false),
                (new NodeProperty("frida")).type(DbDataType.BLOB),
                (new NodeProperty("uidfp")).type(DbDataType.BLOB).def({}),
                (new NodeProperty("tpl")).type(DbDataType.BLOB)
                    .sleep( (x:NodePropertyState)=>{
                        if(x.p!=null){
                            return (x.p as DeviceTemplate).toJsonObject();
                        }else{
                            return null;
                        }
                    })
                    .wakeUp( (x:NodePropertyState)=>{
                        if(x.p!=null){
                            return new DeviceTemplate(x.p);
                        }else{
                            return null;
                        }
                    }).def(null),
                (new NodeProperty("syscalls")).type(DbDataType.BLOB)
                    .sleep( (x:NodePropertyState)=>{
                        const syscalls:any[] = [];
                        if(x.p!=null && Array.isArray(x.p)){
                            x.p.map( (sc:ModelSyscall) => {
                                syscalls.push(sc.toJsonObject());
                            });
                        }

                        return syscalls;
                    })
                    .wakeUp( (x:NodePropertyState)=>{
                        const apps:AppPackage[] = [];
                        if(x.p!=null && Array.isArray(x.p)){
                            x.p.map( app => {
                                apps.push(new AppPackage(app));
                            });
                        }

                        return apps;
                    }),
                (new NodeProperty("enrolled")).type(DbDataType.BOOLEAN).def(false),
                (new NodeProperty("os")).type(DbDataType.STRING).def(OperatingSystem.NONE),
                (new NodeProperty("arch")).type(DbDataType.STRING).def(Architecture.AARCH64),
                (new NodeProperty("apps")).type(DbDataType.BLOB)
                    .sleep( (x:NodePropertyState)=>{
                        const apps:any[] = [];
                        if(x.p!=null){
                            x.p.map( app => {
                                apps.push(app.toJsonObject());
                            });
                        }

                        return apps;
                    })
                    .wakeUp( (x:NodePropertyState)=>{
                        const apps:AppPackage[] = [];
                        if(x.p!=null){
                            x.p.map( app => {
                                apps.push(new AppPackage(app));
                            });
                        }

                        return apps;
                    }),
                (new NodeProperty("bridges"))
                    .type(DbDataType.BLOB)
                    .sleep( (x:NodePropertyState)=>{
                        const bridges:any = {};
                        if(x.p!=null){
                            for(let k in x.p){
                                bridges[k] = (x.p[k] as IBridge).toJsonObject({});
                            }
                        }

                        return bridges;
                    })
                    .wakeUp( (x:NodePropertyState)=>{
                        const bridges:any = {};
                        let fact:IBridgeFactory;
                        if(x.p!=null){
                            for(let k in x.p){
                                fact = DeviceManager.getInstance().getBridgeFactory(x.p[k].name);
                                if(fact!=null){
                                    bridges[k] = fact.fromJsonObject(x.p[k]);
                                }
                            }
                        }

                        return bridges;
                    }),


                // volatile states
                (new NodeProperty("authorized")).volatile().type(DbDataType.BOOLEAN).def(false),
                (new NodeProperty("connected")).volatile().type(DbDataType.BOOLEAN).def(false),
                (new NodeProperty("removed")).volatile().type(DbDataType.BOOLEAN).def(false),
                (new NodeProperty("bridge")).volatile().type(DbDataType.STRING).def(null),
                (new NodeProperty("selected")).volatile().type(DbDataType.STRING).def(null),
                (new NodeProperty("isEmulated")).volatile().type(DbDataType.BOOLEAN).def(false),
                (new NodeProperty("rooted")).type(DbDataType.BOOLEAN).def(false),
                (new NodeProperty("offline")).volatile().type(DbDataType.BOOLEAN).def(true)
            ]
        ).dataSource("ENGINE_DB");
        __:NodeInternalType = NodeInternalType.DEVICE;


    /**
     * UID Fingerprint
     * Required to detect duplicated device
     *
     * @field
     */
    uidfp?:Record<string,string> = {};

    /**
     * @field
     */
    type:OperatingSystem = OperatingSystem.NONE;

    /**
     * Flag. TRUE if currently connected, else FALSE
     *
     * @field
     */
    connected = false;


    /**
     * Flag. TRUE if currently connected, else FALSE
     *
     * @field
     */
    rooted = false;

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
    selected = false;

    /**
     * A field used as cache for `Device.isEmulator()` method
     *
     * @type {boolean|null} Default is NULL until `Device.isEmulator()` is called. TRUE is the device is emulated else FALSE.
     * @field
     */
    isEmulated:boolean|null = null;

    /**
     * Device internal UID
     * @field
     */
    uid:DeviceUUID = null;

    /**
     * Real device ID
     * @field
     */
    id:string =  null;

    /**
     * TRUE if debugging is authorized, else FALSE
     * @field
     */
    authorized = true;

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
     * Device profile built by DeviceProfiler after device scan
     * @type {DeviceProfile}
     * @field
     */
    platform:Platform = null;

    /**
     * Hold frida configuration specfic to the device
     * @type {Object}
     * @field
     */
    frida:FridaServerOptions = {
        server:'',
        privileged: true,
        transport: FridaServerTransport.USB,
        timeout: 250,
        port:-1,
        before:null
    };

    /**
     * Hold all bridges (adb+usb, adb+tcp, sdb+usb, ssh, jtag, ...) configured for this device
     *
     * @type {AdbWrapper[]}
     * @field
     */
    bridges:Record<string, IBridge> = {};

    /**
     * Flag. TRUE is the device is enrolled, else FALSE
     * @field
     */
    enrolled = false;

    /**
     * Flag. TRUE is the device is offline, else FALSE
     * @field
     */
    offline = false;

    /**
     *
     */
    syscalls:ModelSyscall[] = [];

    /**
     * List of application package installed
     *
     * @type {AppPackage[]}
     * @field
     */
    apps:AppPackage[] = [];


    os:OperatingSystem;

    arch:Architecture;

    tags:TagUUID[] = [];

    screenshotsSess: ScreenshotSession[];

    emulatorOpts?:Record<string, any> = {};

    tpl:Nullable<DeviceTemplate> = null;

    /**
     * Flag to store if the device has been removed, resource released,
     * and it is only kept to avoid to break audit report
     *
     * @field
     */
    removed = false;

    /**
     * 
     * @param {*} config 
     * @constructor
     */
    constructor(pConfig:DeviceOptions={}){
        for(const i in pConfig) this[i] = pConfig[i];
    }

    isRooted():boolean {
        return this.rooted;
    }

    /**
     * To add a bridge to the device
     * 
     * A bridge a way to send command or interact with the device.
     * 
     * @param {AdbWrapper} pBridge 
     * @method
     */
    addBridge( pBridge:IBridge, pOverride=false){
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
    

    setEnrolled( pStatus = true){
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
     * To check if the device is running under Android (according to user settings)
     *
     * @return {boolean} Return TRUE if
     * @method
     */
    isAndroid():boolean {
        return (this.platform != null && this.platform.isAndroid());
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
        let up = false;
        for(const i in this.bridges)
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

        // set flag to false
        this.connected = false;

        // mark device-bound bridge as down
        for(let name in this.bridges){
            this.bridges[name].up =false;
        }
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
     * To update or replace Frida Server settings
     *
     * @param {FridaServerOptions} pOptions Options to install and start frida server
     * @param {boolean} pReplace If TRUE specified options replace existing options, else the current options are updated
     * @method
     * @since 1.0.0
     */
    setFridaServerOptions( pOptions:FridaServerOptions, pReplace = false){
        if(pReplace){
            this.frida = pOptions;
        }else{
            for(const i in pOptions) this.frida[i] = pOptions[i];
        }
    }

    getFridaServerOptions():FridaServerOptions {
        return this.frida;
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
    getUID():DeviceUUID{
        return this.uid;
    }

    /**
     *
     * @param pDevice
     */
    update( pFreshDevice:Device){
        let b:IBridge=null;

        if(this.id==null){
            this.id = pFreshDevice.id;
        }

        this.bridge = pFreshDevice.bridge;

        for(const i in pFreshDevice.bridges){
            b = pFreshDevice.bridges[i];
            // replace bridge instance by new instance one
            this.bridges[i] = b;

            /*if(this.bridges[i] != null){
                this.bridges[i] = b;
            }else{
                this.bridges[i] = 
            }*/
        }

        this.model = pFreshDevice.model;
        this.device = pFreshDevice.device;
        this.product = pFreshDevice.product;
        this.transportId = pFreshDevice.transportId;
        // deprecated
        this.connected = pFreshDevice.connected;
        this.authorized = pFreshDevice.authorized;
        // deprecated
        this.usbQualifier = pFreshDevice.usbQualifier;
    }

    /**
     * To merge two Device instance referencing the same device
     * @param pDevice
     */
    merge( pDevice:Device){
        for(const i in pDevice){
            switch(i){
                case 'enrolled':
                    if(pDevice.enrolled)
                        this.enrolled = pDevice.enrolled;
                    break;
                case 'bridges':
                    for(const t in pDevice.bridges){
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
        for(const i in pDevice.bridges){
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

    execSync(pCommand:string, pOptions:any = null):any{
        return this.bridge.shellWithEHsync(pCommand, pOptions);
    }

    /**
     * To exec a command inside a detached shell
     *
     * TODO : use multi-thread
     *
     * @param {string} pCommand
     * @param {string} pOptions
     * @method
     * @async
     * @since 1.0.0
     */
    async execDetached(pCommand:string, pOptions:any = null):Promise<any>{
        return await this.bridge.detachedShell(pCommand,"", pOptions);
    }

    async privilegedExecSync(pCommand:string, pOptions:any=null):Promise<any>{
        // if and android emulator is used
        if(!this.profile.getSystemProfile().isEmulator()){
            if(pOptions == null)
                return await this.bridge.privilegedShell(pCommand);
            else
                return await this.bridge.privilegedShell(pCommand, pOptions);
        }


        return await this.bridge.detachedShell(pCommand,"", pOptions);
    }

    /**
     * To kill a process by sending SIGNAL to process with PID
     *
     * @param pPID
     * @param pSignal
     */
    async killProcess( pPID:number, pSignal:number = null):Promise<any>{
        const cmd = `kill ${pSignal!=null ? "-s "+pSignal:""} ${pPID}`;
        // isEmulator vs isPrivilegeRequired (adb root ? adb shell su ?)
        if(!this.profile.getSystemProfile().isEmulator()){
            return await this.bridge.privilegedShell(cmd);
        }else{
            return await this.bridge.detachedShell(cmd,"");
        }
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
        return this.bridge.pull(pRemotePath, pLocalPath);
    }

    /**
     * To pull a fil from a device and store it into temporary folder
     * 
     * @param {String} pRemotePath 
     * @method
     */
    pullTemp(pRemotePath:string, pOptions:any = {}):string{
        if(this.bridge == null){
            throw new Error("[DEVICE] Bridge is not ready");
        }

        const path:string = _path_.join(
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
        const success:string|Buffer = this.bridge.push( pLocalPath, pRemotePath);
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
    sendIntent(data:any, callbacks:any=null, pIntentFilter:any=null, force=false):any{
        const msg:any = {stdout:null, stderr:null};
        let pkg ='', cmd ='am start ';
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


    /**
     * Platform profiling
     *
     * @param pOptions
     */
    async performProfiling( pOptions:DeviceProfilingOptions = null){

        if(this.bridge != null){
            //this.profile = DeviceProfileFactory.update(this.bridge, this.profile, pOptions);

            this.profile = await this.bridge.performProfiling(pOptions);

            if(pOptions.type=="all" || pOptions.type=="system"){
                this.os = this.profile.getSystemProfile().getOperatingSystem();
                this.arch = this.profile.getSystemProfile().getArchitecture();
                this.getSyscallList();
            }
        }

        return true;
    }

    async updateProfiling( pProfileName:string, pOptions:any = null){
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
        for(const i in pJsonObject){
            switch(i){
                case "syscalls":
                    /*if(pJsonObject.syscalls.length>0 && !Array.isArray(pJsonObject.syscalls[0].sysnum)){
                        dev.syscalls = [];
                        pJsonObject.syscalls.map( x => {
                            let v;
                            dev.syscalls.push(v = new ModelSyscall(x));
                            Logger.info('[DEVICE] Load syscall from backup  : '+JSON.stringify(v));
                        });
                    }*/
                    break;

                case 'bridges':
                    dev.bridges = {};
                    for( const j in pJsonObject.bridges){
                        // todo : replace AdbWrapeper by BridgeFactory
                        dev.bridges[j] = pBridgeSFactory.getFactory(j).fromJsonObject( pJsonObject.bridges[j]);
                    }
                    break;

                case 'profile':
                    dev.profile = ((pJsonObject.profile != null)? DeviceProfileFactory.fromJsonObject(pJsonObject.profile) : null);
                    break;

                case 'platform':
                    dev.platform = ((pJsonObject.platform != null)? PlatformManager.getInstance().getPlatform(pJsonObject.platform) : null);
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
        
        for(const i in pOverride){
            dev[i] = pOverride[i];
        }

        return dev;
    }

    /**
     * To retrieve device specific UID from device through shell
     *
     * @method
     */
    async retrieveUID():Promise<boolean>{

        /*
        if(this.isConnected()===false || this.offline===true) 
            throw new Error('Device is offline');

        let id:string[] = null;
        const  {stdout, stderr} = await this.bridge.shellAsync('getprop ro.serialno');

        if(stderr != ''){
            throw new Error(stderr);
        }

        id = stdout.split(EOL);
        if(id[0] != undefined){
            this.id = id[0];
        }else{
            Logger.debug('[DEVICE] DeviceID retrieved from device : ',id.join(''));
        }*/

        return this.getDefaultBridge().retrieveUIDfromDevice(this);
    }

    initScreenshotSession(): ScreenshotSession {
        const screenshotSession = new ScreenshotAgent(this.getUID(), this.getDefaultBridge()).start()
        this.screenshotsSess.push(screenshotSession);
        return screenshotSession;
    }

    /**
     * To serialize the Device to JSON string
     * 
     * @param {Object} pOverride A collection overrided field
     * @returns {JsonObject} JSON-serialized object
     * @method 
     */
    toJsonObject( pOptions:SerializeOptions){
        const pOverride = (pOptions.override!=null? pOptions.override : {});
        const pExcludeList = (pOptions.exclude!=null ? pOptions.exclude : {});

        const json:any = new Object();
        for(const i in this){
            if(pExcludeList[i] === false) continue;
            
            switch(i){
                case 'type':
                    json[i] = this.type;
                    break;

                case 'bridge':
                    if(this.bridge != null){
                        json[i] = this.bridge.shortname;                        
                    }
                    break;

                case 'bridges':
                    json.bridges = {};
                        // json.bridgeData = this.bridge.toJsonObject();
                    for(const k in this.bridges){
                        json.bridges[k] = this.bridges[k].toJsonObject( { exclude:pExcludeList.bridge });
                    }
                    break;

                case 'profile':
                    json[i] = ((this[i] instanceof DeviceProfile)? this.profile.toJsonObject( { exclude:pExcludeList.profile }) : null);
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

        for(const i in pOverride){
            json[i] = pOverride[i];
        }
        CoreDebug.checkJsonSerialize(json, "Device");
        return json;
    }


    /**
     * To serialize the Device to JSON string
     *
     * @param {Object} pOverride A collection overrided field
     * @returns {JsonObject} JSON-serialized object
     * @method
     */
    toSave( pOverride:any = {}, pExcludeList:any={}){
        const json:any = new Object();
        for(const i in this){
            if(pExcludeList[i] === false) continue;

            switch(i){
                case 'type':
                    json[i] = this.type;
                    break;

                case 'bridge':
                    if(this.bridge != null){
                        json[i] = this.bridge.shortname;
                    }
                    break;

                case 'bridges':
                    json.bridges = {};
                    // json.bridgeData = this.bridge.toJsonObject();
                    for(const k in this.bridges){
                        json.bridges[k] = this.bridges[k].toJsonObject( pExcludeList.bridge);
                    }
                    break;

                case 'profile':
                    json[i] = ((this[i] instanceof DeviceProfile)? this.profile.toSave( pExcludeList.profile) : null);
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

        for(const i in pOverride){
            json[i] = pOverride[i];
        }
        return json;
    }


    getSyscallList():ModelSyscall[]{

        Logger.info("[DEVICE][SYSCALL]["+(this.syscalls == null || this.syscalls.length==0)+"] "+this.arch+" "+this.os);
        if(this.syscalls == null || this.syscalls.length==0){
            this.syscalls = ModelSyscallFactory.getSyscallListFrom(this.arch, this.os);
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

    getInstalledApp( pUpdate = false):AppPackage[] {
        if(pUpdate){
            this.updateInstalledApp();
        }
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

        switch (this.os) {
            case OperatingSystem.ANDROID:
                return ("/data/data/"+pPackageId).replace(/(\s+)/g, '\\$1');
                break;
        }

        return null;
    }

    /**
     * To get the OS type of the device
     * @deprecated Replaced by `getOS()`
     */
    getType():OperatingSystem {
        return this.type;
    }


    /**
     * To get the OS type of the device
     */
    getOS():OperatingSystem {
        return this.type;
    }

    /**
     * To install an application on the device
     *
     * @param pAppPath
     * @param pOptions
     */
    async installApp( pAppPath:string[], pOptions:any):Promise<boolean> {
        if(!this.isConnected()) {
            throw DeviceManagerException.DEVICE_NOT_CONNECTED(this.uid);
        }
        if(!this.isEnrolled()) {
            throw DeviceManagerException.DEVICE_NOT_ENROLLED(this.uid);
        }

        return this.bridge.installApp(pAppPath, pOptions);
    }

    /**
     * To install an application on the device
     *
     * @param pAppPath
     * @param pOptions
     */
    async installProject( pInputs:ProjectInput[], pOptions:any):Promise<boolean> {
        if(!this.isConnected()) {
            throw DeviceManagerException.DEVICE_NOT_CONNECTED(this.uid);
        }
        if(!this.isEnrolled()) {
            throw DeviceManagerException.DEVICE_NOT_ENROLLED(this.uid);
        }

        return this.bridge.installProject(pInputs, pOptions);
    }


    prepareInstallOptions(pOptions:any):BridgeInstallOptions {

        return this.bridge.prepareInstallOptions(pOptions);

    }

    /**
     * To check if the device is emulated or not.
     *
     * The result is cached into `isEmulated` field
     *
     * @method
     */
    isEmulator(pForce=false):boolean {
        if(!pForce && this.isEmulated!=null){
            return this.isEmulated;
        }

        let emu:boolean = false;

        // ask basic detection to bridge
        const e = this.bridge.isEmulated();
        if(e!=null) emu = e;

        // ask deep detection to device profile
        if(this.profile!=null){
            emu = this.profile.isEmulated();
        }

        return emu;
    }

    /**
     * To set the flag "isEmulated"
     *
     * @param {boolean} pFlag Default is TRUE
     * @method
     */
    setEmulatedFlag(pFlag = true):void {
        // update flag
        this.isEmulated = pFlag;

        // update device profile
        if(this.profile!=null){
            this.profile.getSystemProfile().emulated = true;
        }

        // update bridge config
        if(this.bridge!=null){
            //this.bridge.addE
        }
    }

    /**
     * A method called when a Device instance is detroy to ensure related
     * resources will be cleaned
     *
     * @method
     */
    async free():Promise<void> {
        return;
    }

    /**
     * {vbmeta: string; prodfp: string; buildfp: string; serialno: string}
     * @param pFp
     */
    setFingerprint(pFp:Record<string,string>) {
        this.uidfp = pFp;
    }

    /**
     * To get fingerprint of device required to compare devices
     *
     * @returns {Record<string, string>}
     * @method
     */
    getFingerprint():Record<string, string> {
        return this.uidfp;
    }

    equalsUIDFP(pUidfp:Record<string, string>, pMatchesCountMin:number = -1):boolean {

        //console.log(this.uidfp,pUidfp);

        // sort list of keys prior to compare each array
        let k1 = Object.keys(this.uidfp).sort();
        let k2 = Object.keys(pUidfp).sort();

        // verify if
        if(k1.join('')!==k2.join('')) return false;

        for(let i=0; i<k1.length; i++){
            if(!CryptoUtils.stringEqual(this.uidfp[k1[i]],pUidfp[k1[i]])){
                return false;
            }
        }

        return true;
    }

    /**
     * To get argument list generated to launch emulator
     *
     * @returns {any} Emulator arguments
     * @method
     */
    getEmuStartOpts():any {
        return this.emulatorOpts[EmuCommand.START];
    }

    /**
     * To get argument list generated to stop emulator
     *
     * @returns {any} Emulator arguments
     * @method
     */
    getEmuStopOpts():any {
        return this.emulatorOpts[EmuCommand.STOP];
    }

    /**
     * To get the PID of the process running the emulator
     * if the device is emulated
     *
     * @returns {number} Emulator PID
     * @method
     */
    getEmuPID():number {
        return this.emulatorOpts[EmuCommand.RUNNING_PID];
    }

    getTemplate():Nullable<DeviceTemplate> {
        return this.tpl;
    }

    setTemplate(pTpl:DeviceTemplate):void {
        this.tpl = pTpl;
    }

    setEmulatorOpts( pCmd:EmuCommand, pOpts:any):void {
        this.emulatorOpts[pCmd] = pOpts;
    }
}
Device.TYPE.builder(Device);
