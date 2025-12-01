import {Nullable} from "@dexcalibur/dxc-core-api";

export class FormatSignature {

    name:string;
    short = true;
    offset = 0;
    display = true;
    magic:any;
    parserID:Nullable<string> = null;
    description:Nullable<string> = null;
    extractorID:Nullable<string> = null;

    constructor(pOptions:any) {
        for(let k in pOptions) pOptions[k] = this[k] =  pOptions[k];
    }
}

