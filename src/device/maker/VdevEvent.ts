import {Device} from "../../Device.js";
import {DeviceInstance} from "./DeviceInstance.js";


export enum VdevEventType {
    DATA,
    SPAWNED,
    ABORTED,
    STOPPED,
    READY
}

export interface VdevEvent {
    type: VdevEventType,
    data?: any
}

export interface VdevSpawnEvent extends VdevEvent{
    type: VdevEventType.SPAWNED,
    data: {
        process: any,
        startCmd: string,
        port: number
    }
}


export interface VdevReadyEvent extends VdevEvent{
    type: VdevEventType.READY,
    data: {
        process?: any,
        device: Device,
        inst: DeviceInstance
    }
}
