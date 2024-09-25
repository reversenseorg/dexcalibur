import InputEvent from "./InputEvent.js";
import {Device} from "../Device.js";

export default class EventRecordSession {
    startTime: number;
    duration: number;
    events: InputEvent[];
    device: Device;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}