import {Architecture} from "../../Architecture.js";
import {OperatingSystem} from "../../OperatingSystem.js";
import {ABI, InstructionSet} from "../../binary/ABI.js";
import {Profile} from "./Profile.js";
import {Nullable} from "../../core/IStringIndex.js";
import {MemoryLayout} from "../../memory/MemoryLayout.js";

/**
 *
 * @class
 * @author Georges-B MICHEL
 */
export abstract class GenericMemoryProfile extends  Profile
{

    uid = "Generic_Memory";

    /**
     * To handle the case where the final user specify this device is emulated
     */
    phyLayout:Nullable<MemoryLayout> = null;

    nosy = false;

    abstract is(pData:any):boolean;

    abstract getLayout():Nullable<MemoryLayout>;

    static fromJsonObject( pJson:any):GenericMemoryProfile{
        return super.fromJsonObject(pJson) as GenericMemoryProfile;
    }
}