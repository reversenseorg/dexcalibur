const _fs_ = require("fs");

const PLATFORM_RE = new RegExp('(?<source>[^_.]+)_(?<name>[^_.]+)_(?<version>[^_.]+)_(?<vendor>[^_.]+)\.(?<format>[^.]+)');
const LOCAL_PLATFORM_RE = new RegExp('(?<source>[^_.]+)_(?<name>[^_.]+)_(?<version>[^_.]+)_(?<vendor>[^_.]+)');


class Platform
{
    constructor(pPlatformConfig,apis_path){
        
        this.uid = null;
        this.name = null;
        this.version = null;
        this.source = null;
        this.vendor = null;
        this.model = null;
        this.format = null;
        this.path = null;
        this.hash = null;
        this.size = null;
        this.remoteURL = null;
        this.localPath = null;
        this.installed = false;

        this.apiVersion = null;
        this.binaryPath = null;

        
        for(let i in pPlatformConfig) this[i] = pPlatformConfig[i];

        // deprecated
        /*if(this.binaryPath == null){
            this.binaryPath = _path_.join(apis_path,this.name+"_"+this.apiVersion);
        }*/
    
        return this;
    }

    static fromRemoteName( pName){
        let matches = PLATFORM_RE.exec(pName);

        if(matches[0] = pName){
            return new Platform({
                source: matches.groups.source,
                name: matches.groups.name,
                version: matches.groups.version,
                vendor: matches.groups.vendor,
                format: matches.groups.format
            });
        }else{
            return null;
        }

    }

    static fromLocalName( pName){
        let matches = LOCAL_PLATFORM_RE.exec(pName);

        if(matches[0] = pName){
            return new Platform({
                source: matches.groups.source,
                name: matches.groups.name,
                version: matches.groups.version,
                vendor: matches.groups.vendor
            });
        }else{
            return null;
        }
    }
    
    setSize( pSize){
        this.size = pSize;
    }

    setHash( pHash){
        this.hash = pHash;
    }

    setRemotePath( pPath){
        this.remoteURL = pPath;
    }

    getRemotePath(){
        return this.remoteURL;
    }

    setLocalPath( pPath){
        this.localPath = pPath;
        this.installed = (_fs_.existsSync(pPath) == true);
    }

    getLocalPath(){
        return this.localPath;
    }

    getUID(){
        return this.uid = `${this.source}_${this.name}_${this.version}_${this.vendor}`;
    }

    /**
     * To return the name of the folder where the  
     * Platform  is stored.
     */
    getInternalName(){
        // TODO : add file path check in order to avoid traversal path
        return this.name+"_"+this.apiVersion;
    }

    isAndroid(){
        return this.name.indexOf("android")>-1;
    }

    getPublicVersion(){
        return this.name+":"+this.version;
    } 

    getApiVersion(){
        return this.apiVersion;
    } 

    /**
     * @deprecated
     * @param {*} pPath 
     */
    setPath( pPath){
        this.path = pPath;
    }

    getBinPath(){
        return this.binaryPath;
    }

    setBinPath(path){
        this.binaryPath = path;
    }

    checkInstall(){
       return this.installed = _fs_.existsSync(this.localPath);
    }

    toJsonObject(){
        let o = new Object();

        for(let i in this){
            if(typeof this[i] == 'function') continue;
            o[i] = this[i];
        }

        return o;
    }

}


module.exports = Platform;