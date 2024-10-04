import EncodedToken, {EncodedTokenOptions} from "./EncodedToken.js";
import {Endianness} from "../core/Endianness.js";
import InputEventCode from "./InputEventCode.js";
import {Nullable} from "../core/IStringIndex.js";

//Source: https://docs.kernel.org/input/event-codes.html


export interface InputEventTypeOptions extends EncodedTokenOptions {
    metadata?:any;
    description?:string;
    codes?: InputEventCode[]
}

export default class InputEventType  extends EncodedToken {

    metadata?:any;
    description:string = "";
    codes: InputEventCode[] = [];


    constructor(pConfig:InputEventTypeOptions ) {
        super({
            byteSize: 2,
            endianness: Endianness.LITTLE_ENDIAN,
            ...pConfig
        });

        if (pConfig != null) {
            if(pConfig.metadata!=null) this.metadata;
            if(pConfig.codes!=null) this.codes;
            this.description = pConfig.description!;
        }
    }

    toString() {
        return this.key
    }
}

