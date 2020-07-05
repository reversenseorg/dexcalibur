

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
        this.path = pPath;
    }

    getLibPath(){

    }

    getAssets(){

    }

    getPath():string{
        return this.path;
    }

    setPath( pPath:string){
        this.path = pPath;
    }

    static fromJsonObject(pConfig):APK{
        let o:any = new APK();
        for(let i in pConfig) o[i] = pConfig[i];
        return o as APK;
    }

    toJsonObject():any{
        let o:any = {};
        for(let i in this) o[i] = this[i];
        return o;
    }
}
