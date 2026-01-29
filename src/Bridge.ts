import * as _child_process_ from 'child_process';
import DeviceProfile from "./device/DeviceProfile.js";
import {Device} from "./Device.js";
import AppPackage from "./AppPackage.js";
import {AndroidPackageInstallOptions} from "./android/bridge/AndroidInstallOptions.js";
import {PrivilegedExecutionStrategy} from "./PrivilegedExecutionStrategy.js";
import {Nullable} from "./core/IStringIndex.js";
import {ProjectInput} from "./analyzer/ProjectInput.js";
import Screenshot from "./platform/Screenshot.js";
import DexcaliburProject from "./DexcaliburProject.js";

export interface DeviceProfilingOptions {
    tmp?: string;
    profile?:DeviceProfile;
    localTmp?: string;
    remoteTmp?: string;
    type?: "network" | "build" | "system" | "trust" | "acl" | "all";
    profileType?: "network" | "build" | "system" | "trust" | "acl" | "all";
    uids?:string[];
    refresh?:boolean;
    unprivileged?:boolean
}

interface BridgeFactoryList {
    [name: string] :any
}

interface PackageListOptions {
    path:boolean;
    rawOpts?:string;
}

export type BridgeInstallOptions = AndroidPackageInstallOptions;

export interface IBridge
{
    shortname:string;

    up:boolean;

    ip:string;

    port:number;


    /**
     * Map of strategies
     * @field
     */
    strategies:Record<string, PrivilegedExecutionStrategy>;

    /**
     *
     */
    defaultStrat:string;

    clone():IBridge;

    isConnected():boolean;

    isReady():boolean;

    isNetworkTransport():boolean;

    isUsbTransport():boolean;

    connect( pIpAddress:string, pPortNumber:number, pDeviceID?:string):Promise<boolean>

    kill():Promise<any>;

    performProfiling(pProfile?:DeviceProfilingOptions):Promise<DeviceProfile>;

    listDevices():Promise<Device[]>;

    listPackages(pOptions?:any):AppPackage[];

    listFiles( pPath:string, pOptions?:any):Promise<any[]>;

    pull(remote_path:string, local_path:string):string|Buffer;

    push(local_path:string, remote_path:string):string|Buffer;

    setTransport(transport_type:string);

    shellWithEH(command:string, callbacks:any):_child_process_.ChildProcess;

    shellWithEHsync(command:string, pOptions?:any):string|Buffer;

    shellAsync(command:string, deviceID?:string):Promise<any>;

    detachedShell( pCommand:string|string[], pArgs:string, pOptions?:any):Promise<any>;

    privilegedShell(command:string, pOptions?:any):Promise<boolean|string|Buffer>;

    shell(command:string):string|Buffer;

    spawn(command:string, pOptions?:any):_child_process_.ChildProcess;

    getPackagePath(packageIdentifier:string):string;

    getDeviceID():string;

    readFile( pPath:string, pOptions:any):any;

    addPrivilegedStrategy( pStrategy:PrivilegedExecutionStrategy):void;

    getStrategy( pName:string):PrivilegedExecutionStrategy;

    execBridgeCommand( pCommand:string, pBin:string, pBinArg:string[]):void;

    spawnShell( pOptions:any ):any;

    getTime(pOptions:any): string;

    performScreenshot(): Screenshot;

    listProcesses( pOptions:any):Promise<any[]>;

    toJsonObject(pExcludeList:any):any;

    installApp(pAppPath: string[], pOptions: BridgeInstallOptions): Promise<boolean>;

    installProject(pProject:DexcaliburProject, pInputs: ProjectInput[], pOptions: BridgeInstallOptions): Promise<boolean>;

    prepareInstallOptions(pOptions:any):BridgeInstallOptions;

    /**
     * To perform basic detection of emulator mainly based on device ID
     *
     * @return {boolean|null} Return TRUE if the device is emulated else FALSE. If there is not device bound to this bridge it returns NULL
     * @method
     */
    isEmulated():boolean|null;

    /**
     * To get a EoP strategy by its name
     * @param pName
     */
    getStrategy(pName:string):PrivilegedExecutionStrategy;

    /**
     * To add a named strategy to gain root privileges
     *
     * @param pName
     * @param pStrategy
     */
    addPrivilegedStrategy(pStrategy:PrivilegedExecutionStrategy):void;

    /**
     * To set the default bridge to "emulator EoP"
     */
    useEmulatorEoPStrategy(pName?:Nullable<string>):void;

    useStandardEoPStrategy(pName?:Nullable<string>):void;

    setDefaultEoPStrategy(pName:string): void;

    retrieveUIDfromDevice(pDevice:Device): Promise<boolean>;
}



export  interface IBridgeFactory
{
    isReady():boolean;

    newGenericWrapper():IBridge;

    newSpecificWrapper( pDevice:Device):IBridge;

    fromJsonObject(pObject:any):any;
}



export class BridgeSuperFactory
{
    factories:BridgeFactoryList = {};

    constructor( pConfig:any){
        for(let i in pConfig) {
            this.factories[i] = pConfig[i];
        }
    }

    isSupported( pBridgeName:string):boolean{
        return (this.factories[pBridgeName] != null);
    }

    /**
     * To get the BridgeFactory from a protocol such as "adb+tcp", "adb+usb", ...
     *
     * @param pType
     * @method
     */
    getFactory(pType:string):IBridgeFactory{
        let params:string[] = pType.split('+');

        if(this.factories[params[0]] != null){
            return this.factories[params[0]];
        }else{
            throw new Error('[BRIDGE FACTORY] unknow bridge : '+ params[0]);
        }
    }
}

