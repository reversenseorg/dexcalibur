import InputEventCodeProperties from "./InputEventCodeProperties.js";
import EncodedToken, {EncodedTokenOptions} from "./EncodedToken.js";
import {Endianness} from "../core/Endianness.js";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";

// Source: https://cs.android.com/android/platform/superproject/main/+/main:bionic/libc/kernel/uapi/linux/input-event-codes.h
// Source: https://lxr.linux.no/#linux+v3.9.5/include/uapi/linux/input.h
// Source: https://codebrowser.dev/qt6/include/linux/input.h.html



export interface InputEventCodeOptions extends EncodedTokenOptions {
    description?:string;
    properties?: InputEventCodeProperties;
    tagUIDs?: string[];
    metadata?:any;
}

export default class InputEventCode extends EncodedToken {

    description?:string;
    properties: InputEventCodeProperties;
    /**
     * The list of names of tag to apply to InputEvent or RuntimeEvent
     */
    tagUIDs: string[] = [];
    metadata?:any;

    constructor(pConfig:InputEventCodeOptions ) {
        super({
            byteSize: 2,
            endianness: Endianness.LITTLE_ENDIAN,
            ...pConfig
        });

        if (pConfig != null) {
            this.description = pConfig.description!;
            this.properties = pConfig.properties!;
            this.tagUIDs = pConfig.tagUIDs!;
            this.metadata = pConfig.metadata!;
        }
    }


    /**
     * To create an event type which extends current instance
     *
     * It drops codes
     *
     * @param pConfig
     */
    newDerivation(pConfig:InputEventCodeOptions): InputEventCode {
        const evt = new InputEventCode(this);

        // change token if necessary
        if(pConfig.value != this.value){
            evt.key = pConfig.key;
            evt.value = pConfig.value!;
            evt.byteSize = pConfig.byteSize!;
            evt.endianness = pConfig.endianness!;
        }

        // update properties
        if(pConfig.properties != null){
            evt.properties = {
                ...this.properties,
                ...pConfig.properties
            };
        }

        return evt;
    }


    toJsonObject():any {
        const o:any = super.toJsonObject();
        o.metadata = this.metadata;
        o.description = this.description;
        o.properties = this.properties;
        o.tagUIDs = this.tagUIDs;
        return o;
    }

}