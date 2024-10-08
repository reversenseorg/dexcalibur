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
            this.metadata = pConfig.metadata!;
            this.codes = pConfig.codes!;
            this.description = pConfig.description!;
        }
    }

    /**
     * To create an event type which extends current instance
     *
     * It drops codes
     *
     * @param pConfig
     */
    newDerivation(pConfig:InputEventTypeOptions): InputEventType {
        const evt = new InputEventType(this);

        if(pConfig.value != this.value){
            evt.key = pConfig.key;
            evt.value = pConfig.value!;
            evt.byteSize = pConfig.byteSize!;
            evt.endianness = pConfig.endianness!;
        }

        evt.codes = [];
        return evt;
    }
    /**
     * TODO : replace pID:number by pID:Buffer
     * @param pID
     */
    getEventCodeById(pID: number, pEndianness = Endianness.LITTLE_ENDIAN):Nullable<InputEventCode> {
        return this.codes.find(x => x.equalValue(pID,pEndianness) );
    }

    toString() {
        return this.key
    }

    toJsonObject():any {

        const o:any = super.toJsonObject();
        o.metadata = this.metadata;
        o.description = this.description;
        o.codes = [];
        if(this.codes!=null){
            this.codes.map(x => o.codes.push(x.toJsonObject()));
        }
        return o;
    }
}

