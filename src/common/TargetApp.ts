import * as _path_ from 'path';
import {Nullable} from "../core/IStringIndex.js";
import {CoreDebug} from "../core/CoreDebug.js";

export enum AppFormatType {
    PACKAGE,
    BINARY_FILE,
    FOLDER
}



export default class TargetApp
{
    format:AppFormatType = AppFormatType.PACKAGE;
    type:Nullable<string> = null;

    path:string = null;
    md5:string = null;
    sha1:string = null;
    sha256:string = null;

    resources:any = null;
    assets:any = null;
    libs:any = null;

    constructor( pType:string = "", pPath:string = null){
        this.path = pPath!=null ? _path_.normalize(pPath) : pPath;
        this.type = pType!=null ? pType : null;
    }

    isPackage():boolean {
        return (this.format==AppFormatType.PACKAGE);
    }

    getLibPath(){

    }

    getAssets(){

    }

    getPath():string{
        return this.path;
    }

    setPath( pPath:string){
        this.path = _path_.normalize(pPath);
    }

    /**
     * TODO : Add NodeType definition and prevent prototype pollution
     * @param pConfig
     */
    static fromJsonObject(pConfig):TargetApp{
        let o:any = new TargetApp();
        for(let i in pConfig){
            switch(i){
                case 'path':
                    o.path = _path_.normalize(pConfig.path);
                    break;
                default:
                    o[i] = pConfig[i];
                    break;
            }
        }
        return o as TargetApp;
    }

    toJsonObject():any{
        let o:any = {};
        for(let i in this) o[i] = this[i];
        CoreDebug.checkJsonSerialize(o,"TargetApp");
        return o;
    }
}
