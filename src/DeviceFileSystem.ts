import {IBridge} from "./Bridge";


class DeviceFileSystem {

    type: string = null;

    bridge: IBridge = null;

    constructor( pBridge:IBridge) {
        this.bridge = pBridge;
    }

    list( pPath:string, pOptions:any){

    }
}