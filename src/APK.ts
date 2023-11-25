import * as _path_ from 'path';
import {CoreDebug} from "./core/CoreDebug.js";
import {Nullable} from "./core/IStringIndex.js";
import TargetApp, {AppFormatType} from "./common/TargetApp.js";


export default class APK extends TargetApp
{
    override format:AppFormatType = AppFormatType.PACKAGE;

    constructor( pPath:string = null){
        super( pPath, 'apk');
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
    static fromJsonObject(pConfig):APK{
        let o:any = new APK();
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
        return o as APK;
    }

    toJsonObject():any{
        let o:any = {};
        for(let i in this) o[i] = this[i];
        CoreDebug.checkJsonSerialize(o,"APK");
        return o;
    }
}
