import {OperatingSystem} from "../OperatingSystem";
import AndroidDeviceProfile from "../android/profiles/AndroidDeviceProfile";
import DeviceProfile from "./DeviceProfile";
import GenericDeviceProfile from "./GenericDeviceProfile";

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