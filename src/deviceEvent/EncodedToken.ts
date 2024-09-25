import InputEventChangeProperties from "./InputEventChangeProperties.js";
import {Endianness} from "../core/Endianness.js";

export default class EncodedToken  {
    key: string;
    value: number;
    byteSize: number;
    endianness?: Endianness;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}