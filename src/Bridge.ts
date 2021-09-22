import * as _child_process_ from 'child_process';
import DeviceProfile from "./DeviceProfile";
import AdbWrapperFactory from "./AdbWrapperFactory";
import {Device} from "./Device";
import AppPackage from "./AppPackage";


interface BridgeFactoryList {
    [name: string] :any
}

export interface IBridge
{
    shortname:string;

    up:boolean;

    ip:string;

    port:number;

    clone():IBridge;

    isConnected():boolean;

    isReady():boolean;

    isNetworkTransport():boolean;

    isUsbTransport():boolean;

    connect( pIpAddress:string, pPortNumber:number, pDeviceID?:string):Promise<boolean>

    kill():Promise<any>;

    performProfiling():DeviceProfile;

    listDevices():Promise<Device[]>;

    listPackages(pOptions?:any):AppPackage[];

    listFiles( pPath:string, pOptions?:any):Promise<any[]>;

    pull(remote_path:string, local_path:string):string|Buffer;

    push(local_path:string, remote_path:string):string|Buffer;

    setTransport(transport_type:string);

    shellWithEH(command:string, callbacks:any):_child_process_.ChildProcess;

    shellWithEHsync(command:string):string|Buffer;

    shellAsync(command:string, deviceID?:string):Promise<any>;

    detachedShell( pCommand:string|string[], pArgs:string):Promise<boolean>;

    privilegedShell(command:string, pOptions?:any):Promise<boolean|string|Buffer>;

    shell(command:string):string|Buffer;

    getPackagePath(packageIdentifier:string):string;

    getDeviceID():string;

    readFile( pPath:string, pOptions:any):any;

    addPrivilegedStrategy( pName:string, pOptions:any):void;

    execBridgeCommand( pCommand:string):void;

    spawnShell( pOptions:any ):any;

    listProcesses( pOptions:any):Promise<any[]>;

    toJsonObject(pExcludeList:any):any;
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

