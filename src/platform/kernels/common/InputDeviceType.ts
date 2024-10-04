import {Nullable} from "../../../core/IStringIndex.js";
import InputEventType from "../../InputEventType.js";


export interface InputDeviceTypeOptions {
    name?:string;
    pathPattern?:RegExp;
    eventTypes?:InputEventType[];
}

export class InputDeviceType {

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
}