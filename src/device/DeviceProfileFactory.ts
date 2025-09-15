import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import AndroidDeviceProfile from "../android/profiles/AndroidDeviceProfile.js";
import DeviceProfile from "./DeviceProfile.js";
import GenericDeviceProfile from "./GenericDeviceProfile.js";

export default class DeviceProfileFactory {


    /**
     *
     * @param {*} pJson
     * @method
     * @static
     */
    static fromJsonObject( pJson):DeviceProfile{

        let o:DeviceProfile;
        switch(pJson.os){
            case OperatingSystem.ANDROID:
                o = AndroidDeviceProfile.fromJsonObject(pJson);
                break;
            default:
                o = GenericDeviceProfile.fromJsonObject(pJson);
                break;
        }

        return o;
    }
}