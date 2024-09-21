import * as _path_ from "path";
import * as _fs_ from 'fs';

import {BridgeSuperFactory, DeviceProfilingOptions, IBridge, IBridgeFactory} from "./Bridge.js";
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import {Device} from "./Device.js";
import AdbWrapperFactory from "./AdbWrapperFactory.js";
import * as Log from './Logger.js';
import Util from "./Utils.js";
import Platform from "./Platform.js";
import PlatformManager from "./PlatformManager.js";
import StatusMessage from "./StatusMessage.js";
import FridaHelper from "./FridaHelper.js";
import {ValidationCapable, ValidationRule} from "./Validator.js";
import DexcaliburEngine from "./DexcaliburEngine.js";
import {External} from "./external/External.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {OperatingSystem} from "./OperatingSystem.js";
import {Nullable} from "./core/IStringIndex.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DeviceManagerException} from "./errors/DeviceManagerException.js";

const Logger:Log.ProdLogger = Log.newLogger() as Log.ProdLogger;


const DEVICE_FILE = "devices.json";
const DEVICE_DB = "devices.db";

let gInstance:DeviceManager = null;

interface DeviceList {
    [id :string] :Device;
}



export interface DeviceEnrollmentOptions {
    eopStrategy?: string;
    frida?:any;
    profiling?:DeviceProfilingOptions;
    rooted?:boolean;
    bridge?:string;
}

/**
 * To manager connected devices
 * 
 * @class
 */
export default class DeviceManager extends ValidationCapable
{
    bridgeFactory:BridgeSuperFactory;

    dxcWorkspace:DexcaliburWorkspace;

    /**
     * Path of the file where device are stored
     * @field
     */
    devFile:string;

    /**
     * default device to use
     * @field
     */
    defaultDevice:Device;

    /**
     * Total amount of connected devices
     * @field
     */
    count:number;

    /**
     * List of connected devices
     * @field
     */
    devices:Record<string, Device>;

    /**
     * @field
     */
    status:any;

    bridges:any;

    private _ctx:DexcaliburEngine;

    /**
     *
     */
    private _tm: External.ToolManager;

    /**
     * To create an instance of DeviceManager
     * @param {Configuration} config The configuration object
     */
    constructor(pEngine:DexcaliburEngine){
        super({
            'uid': [
                ValidationRule.newRegexpAssert(new RegExp('^.*$')) // mock
            ],
            'uid.target': [
                ValidationRule.newRegexpAssert(new RegExp('^.*$')) // mock
            ]
        });

        this._ctx = pEngine;
        this.dxcWorkspace = DexcaliburWorkspace.getInstance();

        // deprecated ??
        this.devFile = _path_.join(
            this.dxcWorkspace.getDeviceFolderLocation(), 
            DEVICE_FILE
        );


        this.defaultDevice = null;
        this.count = 0;
        this.devices = {};
        this.status = null;

        this._tm = pEngine.getToolManager();

        const adbPath = this._tm.getTool('adb').getPath();
        /**
         * Supported bridges
         * TODO : add sdb
         * @field 
         */
        this.bridges = {
            ADB: AdbWrapperFactory.getInstance(adbPath),
        };
        /*
                _path_.join(
                    this.dxcWorkspace.getBinaryFolderLocation(),
                    "platform-tools",
                    "adb"
                )
         */

        this.bridgeFactory = new BridgeSuperFactory({
                "adb": AdbWrapperFactory.getInstance(adbPath)
            });

    
    }

    searchCompatibleDevice(pTargetOS:string, pSpec:Nullable<any> = null){
        const all = this.getAll();
        switch (pTargetOS){
            case 'android':

                for(let uid in all){
                    if(all[uid].os == OperatingSystem.ANDROID){
                        if(pSpec==null){
                            return all[uid];
                        }else{
                            // todo
                        }
                    }
                }
                break;
            default:
                throw new Error("No compatible device found");
        }
    }

    /**
     * 
     * @param {String} pName Bridge name 
     * @since v0.7.2
     */
    getBridgeFactory( pName:string):IBridgeFactory{
        if(this.bridgeFactory.isSupported(pName)===false){
            throw new Error('[DEVICE MANAGER] Bridge not supported.');
        }

        return this.bridgeFactory.getFactory(pName);
    }



    static getInstance( pEngine:DexcaliburEngine=undefined):DeviceManager{
        if(gInstance == null){
            if(pEngine===undefined) throw new Error('[DEVICE MANAGER] Failed to create new DM instance :  engine is undefined');
            gInstance = new DeviceManager(pEngine);
        }

        return gInstance;
    }


    /**
     * To load Devices properties from DB
     *
     * Previously loaded from `<DXCWS>/.dxc/dev/devices.json` file
     * 
     * @method
     */
    async load():Promise<boolean>{
        //if(_fs_.existsSync( this.devFile) == false)
        //    return true;

        //let data:any = null;
        try{
            // load from DB
            const devs = await this._ctx.getEngineDB().listDevices();
            devs.map( (x,i) => {
                if(this.devices[ x.getUID() ]==null){
                    x.getSyscallList();
                    this.devices[ x.getUID() ] = x;
                }
            });


            // load from file
            /*
            data = JSON.parse( _fs_.readFileSync( this.devFile).toString());
            for(let i=0; i<data.length; i++){
                if( data[i].uid != null){
                    this.devices[ data[i].uid ] = Device.fromJsonObject(this.bridgeFactory, data[i]);
                    this.devices[ data[i].uid ].getSyscallList()
                }
            }
            */
            Logger.info("[DEVICE MANAGER] Known Devices : "+Object.keys(this.devices));
        } catch(err){
            Logger.error("[DEVICE MANAGER] Unable to load devices ");
            console.log(err.stack);
        }


        return true;
    }

    /**
     * To save properties of devices into `.dxc/dev/devices.json` file
     * 
     * @method
     */
    save(){

        for(let k in this.devices){
            if(this.devices[k].isEnrolled()){
                this._ctx.getEngineDB().save(this.devices[k]);
            }
        }

        /*
        if(_fs_.existsSync(this.devFile)){
            _fs_.unlinkSync(this.devFile);
        }

        const data:any = [];
        for(const i in this.devices){
            data.push( this.devices[i].toSave( {}, {
                connected: false,
                offline: false,
                bridge: {
                    up: false
                   // strategies: true
                }
            }));
        }


        _fs_.writeFileSync(
            this.devFile,
            JSON.stringify(data)
        );*/
    }

    /**
     * Remove all device saved or previously enrolled
     * 
     * @method
     */
    async clear(pDeviceID:string = null):Promise<boolean>{

        if(pDeviceID != null){
            let dev:Device;

            if(this.devices[pDeviceID]==null){
                dev = await this._ctx.getEngineDB()
                    .getCollectionOf(NodeInternalType.DEVICE)
                    .asyncGetEntry(pDeviceID);
            }else{
                dev = this.devices[pDeviceID];
            }


            // delete reference
            delete this.devices[pDeviceID];

            if(dev !=null){
                // delete from DB
                await this._ctx.getEngineDB()
                    .getCollectionOf(NodeInternalType.DEVICE)
                    .asyncRemoveEntry(dev);

            }else{
                throw  DeviceManagerException.DEVICE_NOT_FOUND(pDeviceID);
            }

        }else{
            for(let devUID in this.devices){
                // delete from DB
                await this._ctx.getEngineDB()
                    .getCollectionOf(NodeInternalType.DEVICE)
                    .asyncRemoveEntry(this.devices[devUID]);
            }

            this.devices = {};
        }

        return true;
    }


    /**
     * To turn all device tagged "connected" to "disconnected"
     */
    disconnectAll(){
        for(const uid in this.devices){
            this.devices[uid].disconnect();
        }
    }

    /**
     * To get a device by its ID
     *
     * Warning : DeviceID is not the internal DeviceUID but
     * the device UID set by constructor, such as AndroidID
     *
     * @param {String} pDeviceID
     * @return {Device} The device if it is found, else NULL
     * @method
     */
    getDeviceByID( pDeviceID:string):Device{
        for(const uid in this.devices){
            if(this.devices[uid].id == pDeviceID){
                return this.devices[uid];
            }
        }
        return null;
    }

    /**
     * To generate an internal DeviceUID
     *
     * @return {String} An available DeviceUID
     * @method
     */
    generateUID():string{
        const uid = Util.randString(12, Util.ALPHANUM);
        if(this.devices[uid]!=null)
            return this.generateUID();
        else
            return uid;
    }

    /**
     * To add a device to the device manager.
     *
     * The DeviceUID is regenerated.
     *
     * @param {Device} pDevice The device to add
     */
    addDevice( pDevice:Device, pReuseUID = false){
        let uid:string;

        if(pReuseUID === false){
            uid = this.generateUID();
            pDevice.setUID(uid);
        }else{
            uid = pDevice.getUID();
        }

        this.devices[uid] = pDevice;
    }

    getDeviceByIP( pIpAddress:string, pPort:number=null, pUp=true):Device{
        let d:Device=null, b:IBridge=null;
        for(const i in this.devices){
            d = this.devices[i];
            for(const k in d.bridges){
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
     * @param {Device[]} pDeviceList
     */
    updateDeviceList( pCandidateList:Device[]){
        let active = 0, b:IBridge=null, d=null, id:string=null, dev:Device=null;
        let devs:Record<string, Device> = {};


        for(let i=0; i<pCandidateList.length; i++){

            // at this step, candidate device has 1 bridge, no more.
            if(pCandidateList[i].bridge.isUsbTransport()){
                id = pCandidateList[i].bridge.getDeviceID();
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
        for(const i in this.devices){
            if(this.devices[i].id=="<pending...>"){
                for(const k in this.devices[i].bridges){
                    b = this.devices[i].bridges[k];
                    if(b.isNetworkTransport()){
                        d = this.getDeviceByIP(b.ip, b.port, false);
                        if(d == null){
                            devs[this.devices[i].uid] = this.devices[i];
                        }
                    }else{
                        d = this.getDeviceByID(b.getDeviceID());

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
    getConnectedDevices():Device[]{
        const conn:Device[]=[];
        for(const i in this.devices){
            if(this.devices[i].isConnected()){
                conn.push(this.devices[i]);
            }
        }

        return conn;
    }

    async connect( pIpAddress:string, pPortNumber:string|number, pDevice:Device):Promise<boolean>{
        let success = false, wrapper:IBridge=null;
        let port:number;

        if(typeof pPortNumber === 'string')
            port = parseInt(pPortNumber);
        else
            port = pPortNumber;

        
        for(const i in this.bridges){
            if(pDevice == null){
                wrapper = this.bridges[i].newGenericWrapper();
                success = success || await wrapper.connect(pIpAddress, port);
            }else{    
                wrapper = this.bridges[i].newSpecificWrapper(pDevice);
                success = success || await wrapper.connect(pIpAddress, port);

                // create adb wrapper with network config 
                if(success === true){
                    wrapper.ip = pIpAddress;
                    wrapper.port = port;
                    pDevice.addBridge(wrapper, true);

                    if(pDevice.bridge==null)
                        pDevice.setDefaultBridge(wrapper.shortname);
                }
            }
        }

        return (success==true);
    }

    /**
     * To remove devices from the device list if the `pProperty` field has the `pValue` value
     *
     * @param {string} pProperty
     * @param {any} pValue
     * @private
     */
    private async _removeIf( pProperty:string, pValue:any):Promise<void> {
        const clean:Record<string, Device> = {};
        let pptVal:any;

        for(let k in this.devices){
            if(this.devices[k]==null) /* remove */ continue;
            if(this.devices[k][pProperty]!==pValue){
                clean[k] = this.devices[k];
            }else{
                await this.devices[k].free();
            }
        }

        this.devices = clean;

        return ;
    }

    /**
     * To detect connected devices from each bridges and update
     * device list
     *
     * @async
     * @method
     */
    async scan(){
        let dev:Device[]=[], devID:string[], wrapper:IBridge=null, activeDev = 0, latestDefault:Device=null;
        const out:string[]=[];
        latestDefault = this.getDefault();

        // update list from DB
        await this.load();

        // mark all devices as disconnected, only detected devices will have "connected" state == true
        this.disconnectAll();

        // remove not enrolled devices
        await this._removeIf('enrolled',false);

        // refresh
        for(const type in this.bridges){

            if(this.bridges[type].isReady()){
    
                // scan for connected devices
                try{
                    // get a generic instance of the bridge
                    wrapper  = this.bridges[type].newGenericWrapper();
                    // list connected devices
                    dev = await wrapper.listDevices();
                    // merge with devices grabbed by others bridge
                    activeDev += this.updateDeviceList(dev);

                    for(const i in this.devices){
                        out.push(`[${i}] ID:${this.devices[i].id}`);
                    }

                    Util.msgBox("Enumerated devices [bridge="+type+"]", out);
                }catch(err){
                    Logger.error("Scan of connected device of [type="+type+"] bridge failed.");
                    console.log(err.stack);
                }

            }
        }

        // now

        // TODO : Warning : Only project should have default devices.
        // Deprecated
        /*
        if(activeDev==1){
    
            // 1 device -> no problem
            this.setDefault(
                this.getConnectedDevices()[0]
            );

        }else if(activeDev > 1){

            // by default, if there are several devices connected
            // a default device should be selected 

             // 1/ If default device is connected and authorized
            if(latestDefault!=null && this.devices[latestDefault.getUID()] != null
                && this.devices[latestDefault.getUID()].isConnected()
                && this.devices[latestDefault.getUID()].isAuthorized()){

                this.setDefault(latestDefault);
                return null;
            }

            // 2/ Only authorized device should be instrumented 
            devID = [];
            for(const i in this.devices){
                if(this.devices[i].isAuthorized()){
                    devID.push(i);
                }
            }

            if(devID.length > 0){
                this.setDefault(devID[0]);
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
        //}

        return null;
    }


    /**
     * To check if a device is connected, but there is not default device selected.
     * @function
     * @returns {Boolean} Return TRUE if a device is connected and if there is not default device selected.
     */
    hasNotDefault():boolean{
        return (this.count==0)||(this.count>1 && this.defaultDevice===null);
    }

    /**
     * To select a default device
     *
     * @deprecated
     *
     * @param {String} deviceId 
     * @method
     */
    setDefault(deviceId:Device|string){

        // unselect current default device
        /*if(this.defaultDevice != null){
            this.defaultDevice.selected = false;
        }*/

        if(typeof deviceId === 'string'){
            for(const i in this.devices){

                if(this.devices[i].uid === deviceId){
                    this.devices[i].selected = true;
                    this.defaultDevice = this.devices[i];
                }else{
                    this.devices[i].selected = false;
                }
            }
        }else if(deviceId instanceof Device){
            deviceId.selected = true;
            this.defaultDevice = deviceId;
        }


    }
    
    /**
     * To get the default device
     * @returns {Device} Default device
     * @method
     */
    getDefault():Device{
        return this.defaultDevice;
    }
    
    /**
     * To get a device by its deviceID
     * @param {String} deviceId Device ID
     * @returns {Device} The Device instance, else null
     * @method
     */
    getDevice(deviceId:string){
        return this.devices[deviceId];
    }
    
    /**
     * To get all devices (connected or not)
     * @returns {Object} To get an hashmap associtating to each device ID the device instance
     * @method 
     */
    getAll():Record<string, Device>{
        return this.devices;
    }
    
    /**
     * To export data to JSON
     * @returns {String} JSON payload
     * @method
     */
    toJsonObject( pExcludeList:any={}){
        const json:any = [];
        for(const i in this.devices){
            json.push(this.devices[i].toJsonObject({ exclude: pExcludeList.device }));
        }
        CoreDebug.checkJsonSerialize(json, "DeviceManager");
        return json;
    }

    /*
     * @param pDevice
     * @param pOptions
     * @async
     */
    /*async performDeviceProfiling( pDevice:Device, pOptions:DeviceProfilingOptions){
        try{
            await pDevice.performProfiling(pOptions);
            this.save();
        }catch (err){
            throw DeviceManagerException.DEVICE_PROFILING_FAILED(pDevice.getUID(),err.message);
        }

    }*/

    /**
     * To enroll a new device or an updated device
     * 
     * @param {Device|string} pDevice
     * @param {DeviceEnrollmentOptions} pOtions
     * @return {Promise<boolean>}
     * @async
     * @method
     */
    async enroll( pDevice:Device|string, pOtions:DeviceEnrollmentOptions = {}):Promise<boolean>{


        let device:Device = null, success=false;
        let targetPF:Platform, namePF:string=null;
        const pm=PlatformManager.getInstance();

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

        // set default EoP strategy
        const bridge = (pOtions.bridge!=null)? device.getBridge(pOtions.bridge) : device.getDefaultBridge();
        if(pOtions.eopStrategy != null){
            bridge.setDefaultEoPStrategy(pOtions.eopStrategy);
        }else{
            if(device.getProfile().getSystemProfile().isEmulator()){
                bridge.useEmulatorEoPStrategy();
            }else{
                bridge.useStandardEoPStrategy();
            }
        }


        // update device ID if it is unknown 
        if(device.id == null){
            await device.retrieveUIDfromDevice();
        }

        // Install frida
        if(Object.keys(bridge.strategies).length>0){//pOtions.rooted){
            success = await FridaHelper.installServer(device, (pOtions.frida != null? pOtions.frida: {})) ;

            if(success){
                Logger.info("[Device Manager] Frida server installed.\n[Device Manager] Start platform install ...");
                this.status = new StatusMessage(70, this.status.append("[Device Manager] Frida server installed.\n[Device Manager] Start platform install ..."));
            }else{

                Logger.info("[Device Manager] Fail");
                this.status = StatusMessage.newError( this.status.append("[Device Manager] Fail"));
            }
        }else{
            Logger.info("[Device Manager] Frida not installed : device is not rooted.");
        }


        // Download platform 
        namePF = 'sdk_androidapi_'+device.getProfile().getSystemProfile().getSdkVersion()+'_google';

        if( pm.isInstalled(namePF) == false){

            Logger.info("[Device Manager] Installing platform : "+namePF);
            targetPF = pm.getRemotePlatform(namePF);

            this.status = new StatusMessage(80, this.status.append("[Device Manager] Target platform is not installed. Downloading ..."));

            success = await pm.install(targetPF);
            if(success) {
                Logger.info("[Device Manager] Target platform has been installed. ...");
                device.setPlatform(targetPF)
            }else{
                Logger.error("[Device Manager] Target platform cannot be  installed. ...");
            }
        }else{
            Logger.info("[Device Manager] Platform found : "+namePF);
            device.setPlatform( pm.getLocalPlatform(namePF));
        }

        if(success){

            Logger.info("[Device Manager] Platform (SDK) of target device installed");
            this.status = StatusMessage.newSuccess( this.status.append("[Device Manager] Platform (SDK) of target device installed"));
        }else{

            Logger.info("[Device Manager] Platform install fail");
            this.status = StatusMessage.newError( this.status.append("[Device Manager] Fail"));
        }

        device.setEnrolled(true);

        // save device manager data
        this.save();

        return success;
    }


    setEnrollStatus( pStatus:StatusMessage){
        pStatus.progress =  (this.status==null? 0 : this.status.progress);
        this.status = pStatus;
    }

    /**
     *
     * TODO : add device UID as parameter (batched enrollment case)
     */
    getEnrollStatus():StatusMessage{
        return this.status;
    }

    acquire(pDevice:Device, pOptions:any){
        pDevice.getInstalledApp()
    }
}

