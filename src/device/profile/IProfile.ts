import {SerializeOptions} from "@dexcalibur/dexcalibur-orm";


export interface IProfile {
    prop:any;
    uid:string;

    isNosy():boolean;
    is(pOpt:any):boolean;
    setProperty(pName:string, pValue:any);
    toJsonObject(pOptions?:SerializeOptions):any;
    toSave(pOptions?:any);
}
