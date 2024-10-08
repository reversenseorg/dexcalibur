import {Nullable} from "../core/IStringIndex.js";
import {InputDeviceType} from "./kernels/common/InputDeviceType.js";
import {LinuxBusType} from "./kernels/linux/LinuxInputEventCodes.js";
import {OperatingSystem} from "./OperatingSystem.js";
import {KernelInfoFactory} from "./kernels/common/KernelFactory.js";


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


    /**
     *
     * @param pOS
     * @param pBusType
     * @param pHandle
     */
    getInputDeviceByBusType(pOS:OperatingSystem, pBusType:number, pHandle:Nullable<string> = null): Nullable<InputDeviceType>{
        let devType:Nullable<InputDeviceType>  =null;
        if(KernelInfoFactory.isLinuxBased(pOS)){
            switch (pBusType){
                case LinuxBusType.BUS_VIRTUAL:
                    devType = this.devices.event;
                    break;
                default:
                    throw new Error("There is not known InputDeviceType mapped to this bus type for this OS : bustype is unknown");
                    break;
            }
        }else{
            throw new Error("There is not known InputDeviceType mapped to this bus type for this OS : OS not supported");
        }


        return devType;
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