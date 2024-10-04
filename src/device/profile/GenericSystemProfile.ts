import {Architecture} from "../../Architecture.js";
import {OperatingSystem} from "../../platform/OperatingSystem.js";
import {ABI, InstructionSet} from "../../binary/ABI.js";
import {Profile} from "./Profile.js";

/**
 *
 * @class
 * @author Georges-B MICHEL
 */
export abstract class GenericSystemProfile extends  Profile
{

    uid = "Generic_System";

    /**
     * To handle the case where the final user specify this device is emulated
     */
    emulated = false;

    arch:Architecture = null;

    os:OperatingSystem = null;

    nosy = false;


    isNosy(): boolean {
        return this.nosy;
    }

    abstract is(pData:any):boolean;

    abstract getISAs():InstructionSet[];

    abstract getOperatingSystem(pUpdate?:boolean):OperatingSystem ;

    abstract getABI():ABI;



    /**
     * To get ABI
     *
     * @method
     */
    abstract getABIlist(pAddrSize?:number):ABI[];

    /**
     * To get SDK version
     *
     * @method
     */
    abstract getSdkVersion():string;

    /**
     * To get device architecture
     * @method
     */
    abstract getArchitecture(pUpdate?:boolean):Architecture;


    /**
     * To check from props if the device is an emulator r
     */
    isEmulator():boolean {
        return this.emulated;
    }

    static fromJsonObject( pJson:any):GenericSystemProfile{
        return super.fromJsonObject(pJson) as GenericSystemProfile;
    }
}