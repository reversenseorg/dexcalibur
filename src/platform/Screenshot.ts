import {ImageFormat} from "./ImageFormat.js";
import {IJsonSerializable} from "@dexcalibur/dexcalibur-orm";

export default class Screenshot implements IJsonSerializable{

    data: any;
    timestamp: string;
    format: ImageFormat;
    isEmpty: boolean;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    toJsonObject():any {
        return {
            data: this.data.toString("hex"),
            timestamp: this.timestamp,
            format: this.format,
            isEmpty: this.isEmpty,
        }
    }
}