import {Nullable} from "../../../core/IStringIndex.js";
import InputEventType from "../../InputEventType.js";
import {IInputDeviceDecoder} from "./IInputDeviceDecoder.js";
import InputEventCode from "../../InputEventCode.js";
import {Endianness} from "../../../core/Endianness.js";


export interface InputDeviceTypeOptions {
    name?:string;
    pathPattern?:RegExp;
    eventTypes?:InputEventType[];
    decoder?:Nullable<IInputDeviceDecoder>;
}

export class InputDeviceType {

    decoder?:Nullable<IInputDeviceDecoder> = null;
    name:string;

    /**
     * A pattern to detect if a devices is an input device of this type
     *
     * `/dev/input/eventX`  is a generic input event interface
     * `/dev/input/jsX`  is a joy stick interface for input subsystem
     * `/dev/input/mouseX`  is a mouse interface for input subsystem
     *
     *
     */
    pathPattern: RegExp;

    eventTypes:InputEventType[] = [];

    constructor(pOptions:Nullable<InputDeviceTypeOptions>) {

        if(pOptions!=null){
            this.decoder = pOptions.decoder!;
            this.name = pOptions.name!;
            this.pathPattern = pOptions.pathPattern!;
            this.eventTypes = pOptions.eventTypes!;

            if(this.decoder!=null && this.decoder.deviceType==null){
                this.decoder.deviceType = this;
            }
        }
    }

    isReadyToDecode():boolean {
        return (this.decoder!=null && this.decoder.deviceType!=null);
    }

    /**
     * To detect if a device path match this type of device
     *
     *
     * @param pPath
     */
    matchPath(pPath:string):boolean {
        if(this.pathPattern==null) return false;

        return this.pathPattern.test(pPath);
    }

    /**
     * TODO : replace pID:number by pID:Buffer
     * @param pID
     */
    getEventTypeById(pID: number, pEndianness = Endianness.LITTLE_ENDIAN):Nullable<InputEventType> {
        return this.eventTypes.find(x => x.equalValue(pID,pEndianness) );
    }

    toJsonObject():any {
        const o:any = {
            name: this.name,
            pathPattern: this.pathPattern.toString(),
            eventTypes: this.eventTypes
        };

        return o;
    }
}