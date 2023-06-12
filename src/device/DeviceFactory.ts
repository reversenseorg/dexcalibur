import {Device, DeviceOptions} from "../Device.js";
import {OperatingSystem} from "../OperatingSystem.js";

export interface AndroidDeviceOptions extends DeviceOptions{

}

export interface CorelliumDeviceOptions extends AndroidDeviceOptions{
    api?:string;
}

/**
 * The main factory to create device from scratch
 *
 * @class
 */
export class DeviceFactory {

    /**
     *
     * @param pOptions
     */
    static newAndroidDevice(pOptions:AndroidDeviceOptions){
        const dev = new Device({
            os: OperatingSystem.ANDROID,
            type: OperatingSystem.ANDROID,
            ...pOptions
        });

        return dev;
    }


    static newCorelliumDevice(pOptions:CorelliumDeviceOptions){
        const dev = new Device({
            os: OperatingSystem.ANDROID,
            type: OperatingSystem.ANDROID,
            ...pOptions
        });

        return dev;
    }
}