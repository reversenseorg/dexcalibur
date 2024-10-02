import InputEventCode from "./InputEventCode.js";
import InputEventType from "./InputEventType.js";

export default class InputSubsystem {
    name: string;
    evCode: InputEventCode[];
    evType: InputEventType[];

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}