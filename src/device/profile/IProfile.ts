

export interface IProfile {
    prop:any;
    uid:string;

    isNosy():boolean;
    is(pOpt:any):boolean;
    setProperty(pName:string, pValue:any);
    toJsonObject(pExclude?:any):any;
    toSave(pOptions?:any);
}
