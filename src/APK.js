

class APK 
{
    constructor( pPath){
        this.path = pPath;

        this.md5 = null;
        this.sha1 = null;
        this.sha256 = null;

        this.resources = null;
        this.assets = null;
        this.libs = null;
    }

    getLibPath(){

    }

    getAssets(){

    }

    getPath(){
        return this.path;
    }

    setPath( pPath){
        this.path = pPath;
    }

    static fromJsonObject(pConfig){
        let o = new APK();
        for(let i in pConfig) o[i] = pConfig[i];
        return o;
    }
    toJsonObject(){
        let o = {};
        for(let i in this) o[i] = this[i];
        return o;
    }
}

module.exports = APK;