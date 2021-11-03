import * as _path_ from 'path';

export default class APK
{
    path:string = null;
    md5:string = null;
    sha1:string = null;
    sha256:string = null;

    resources:any = null;
    assets:any = null;
    libs:any = null;

    constructor( pPath:string = null){
        this.path = pPath!=null ? _path_.normalize(pPath) : pPath;
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
        return o;
    }
}
