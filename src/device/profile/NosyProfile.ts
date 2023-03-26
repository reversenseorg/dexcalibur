/**
 *
 * @class
 * @author Georges-B MICHEL
 */
import {IProfile} from "./IProfile.js";
import {DeviceProfilingOptions, IBridge} from "../../Bridge.js";


/**
 * Generic class to hold results from device profiling
 */
export interface NosyProfile extends IProfile
{
    performProfiling( pBridge:IBridge, pOptions?:DeviceProfilingOptions):Promise<IProfile>;
}

