import {SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import DeviceProfile from "../DeviceProfile.js";
import {Nullable} from "../../core/IStringIndex.js";


export interface IProfile {
    prop:any;
    uid:string;
    onAfter?: Nullable<((pProf:DeviceProfile, pOptions:any)=>void)>;

    isNosy():boolean;
    is(pOpt:any):boolean;
    setProperty(pName:string, pValue:any);
    toJsonObject(pOptions?:SerializeOptions):any;
    toSave(pOptions?:any);
}
