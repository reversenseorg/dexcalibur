import InputEventChangeType from "./InputEventChangeType.js";
import InputEventType from "./InputEventType.js";

export default class InputEvent {

    timestamp: number
    type: InputEventType;
    changeType: InputEventChangeType;
    value: any;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}