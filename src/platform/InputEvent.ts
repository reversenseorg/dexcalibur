import InputEventCode from "./InputEventCode.js";
import InputEventType from "./InputEventType.js";
import {InputDevice} from "./kernels/common/InputDevice.js";

export default class InputEvent {

    timestamp: number
    type: InputEventType;
    code: InputEventCode;
    value: any;
    source: string;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}