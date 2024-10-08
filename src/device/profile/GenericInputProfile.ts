import {Profile} from "./Profile.js";
import {InputDevice} from "../../platform/kernels/common/InputDevice.js";

export default class GenericInputProfile extends Profile {

    uid = "input_devices";

    getInputDevices():InputDevice[] {
        return [];
    }
}