import {Endianness} from "../core/Endianness.js";
import {Nullable} from "../core/IStringIndex.js";


export interface EncodedTokenOptions {
    value?: number;
    byteSize?: number;
    key?: string;
    type?:string;
    endianness?: Endianness;
}

export default class EncodedToken  {
    key: string;
    value: number;
    byteSize: number;
    type:string;
    endianness: Endianness = Endianness.LITTLE_ENDIAN;

    constructor( pConfig:Nullable<EncodedTokenOptions> = null) {
        if(pConfig!=null){
            this.key = pConfig.key!;
            this.byteSize = pConfig.byteSize!;
            this.value = pConfig.value!;
            this.endianness = pConfig.endianness!;
            this.type = pConfig.type!;
        }
    }

    equalValue(pValue:number, pValueEndianness:Endianness):boolean {
        return (this.value == pValue);
    }

    toJsonObject():any {
        return {
            key: this.key,
            value: this.value,
            byteSize: this.byteSize,
            type: this.type,
            endianness: this.endianness
        }
    }
}