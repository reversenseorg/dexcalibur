/**
 *
 * @class
 * @author Georges-B MICHEL
 */
import {Device} from "../../Device";
import { Profile } from "./Profile";
import {IProfile} from "./IProfile";
import {DeviceProfilingOptions, IBridge} from "../../Bridge";


/**
 * Generic class to hold results from device profiling
 */
export interface NosyProfile extends IProfile
{
    performProfiling( pBridge:IBridge, pOptions?:DeviceProfilingOptions):Promise<IProfile>;
}

