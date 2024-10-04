/**
 *
 * @class
 * @author Georges-B MICHEL
 */
import {IProfile} from "./IProfile.js";
import {DeviceProfilingOptions, IBridge} from "../../Bridge.js";


/**
 *
 *
 * A nosy profile is a profile that need to interact with the device
 * The opposite is a profiling that not require more data from the device
 * than alreadu gathered one.
 *
 * @interface
 */
export interface NosyProfile extends IProfile
{
    performProfiling( pBridge:IBridge, pOptions?:DeviceProfilingOptions):Promise<IProfile>;
}

