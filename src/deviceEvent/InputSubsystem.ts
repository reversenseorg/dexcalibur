import InputEventChangeType from "./InputEventChangeType.js";
import InputEventType from "./InputEventType.js";

export default class InputSubsystem {
    name: string;
    evChange: InputEventChangeType[];
    evType: InputEventType[];

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}