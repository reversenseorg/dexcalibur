const Path = require("path");

function Platform(platformConfig,apis_path){
    
    this.name = null;
    this.version = null;
    this.apiVersion = null;
    this.binaryPath = null;
    
    for(let i in platformConfig) this[i] = platformConfig[i];

    if(this.binaryPath == null){
        this.binaryPath = Path.join(apis_path,this.name+"_"+this.apiVersion);
    }
 
    return this;
}

/**
 * To return the name of the folder where the  
 * Platform  is stored.
 */
Platform.prototype.getInternalName = function(){
    // TODO : add file path check in order to avoid traversal path
    return this.name+"_"+this.version;
}

Platform.prototype.isAndroid = function(){
    return this.name.indexOf("android")>-1;
}

Platform.prototype.getPublicVersion = function(){
    return this.name+":"+this.version;
} 

Platform.prototype.getApiVersion = function(){
    return this.apiVersion;
} 

Platform.prototype.getBinPath = function(){
    return this.binaryPath;
}
Platform.prototype.setBinPath = function(path){
    this.binaryPath = path;
}

Platform.prototype.toJsonObject = function(){
    let o = new Object();

    for(let i in this){
        if(typeof this[i] == 'function') continue;
        o[i] = this[i];
    }

    return o;
}

module.exports = Platform;