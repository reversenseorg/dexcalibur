import InputEventCode from "./InputEventCode.js";
import InputEventType from "./InputEventType.js";
import {Nullable} from "../core/IStringIndex.js";
import {InputDeviceType} from "./kernels/common/InputDeviceType.js";
import {LinuxBusType} from "./kernels/linux/LinuxInputEventCodes.js";


export interface InputSubsystemOptions {

    devices?: Record<string, InputDeviceType>;
}
/**
 * Represent an Input subsystem. int the kernel
 */
export default class InputSubsystem {

    devices:Record<string, InputDeviceType> = {}

    constructor( pConfig:Nullable<InputSubsystemOptions> = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    /**
     * To get the input device type by path
     *
     * @param pPath
     */
    getDevTypeByPath(pPath:string): Nullable<InputDeviceType> {
        for(let k in this.devices){
            if(this.devices[k].matchPath(pPath)) return this.devices[k];
        }

        return null;
    }

    getInputDeviceByBusType(pNuber:number){
        // todo : find InputDeviceType from bus type number using LinuxBusType
    }


    /**
     * To get the input device from the name of input handle
     *
     * @param pHandleName
     */
    getInputDeviceTypeByHandle(pHandleName:string){
        let devs:InputDeviceType[] = [];

        for(let k in this.devices){
            if(new RegExp("^"+k+"[0-9]+$","g").test(pHandleName)){
                devs.push(this.devices[k]);
            }
        }

        return devs;
    }
}