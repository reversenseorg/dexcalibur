const FileTypeHelper = require("./FileTypes.js");

const LOCATION = {
    package: "package",
    fs: "fs",
    datadir: "datadir"
};

function AppFile(config){
    this.name = null;
    this.type = null;
    this.size = null;
    this.path = null;
    this.location = null;
    this.trueFile = false;

    if(config != null){
        for(let i in config){
            if(i!=="type")
                this[i] = config[i];
            else{
                if(config[i] instanceof FileTypeHelper.EncodedDataType)
                   this.type = config.type;
                else 
                    this.type = new FileTypeHelper.EncodedDataType(config[i]);
            }
        } 
    }
}

AppFile.prototype.getSize = function(){
    return this.size;
}
AppFile.prototype.getPath = function(){
    return this.path;
}
AppFile.prototype.getName = function(){
    return this.name;
}
AppFile.prototype.getType = function(){
    return this.type;
}

AppFile.prototype.hasExt = function(ext){
    return (this.type != null)&&(this.type.ext==ext);
}
AppFile.prototype.hasMIME = function(mime){
    return (this.type != null)&&(this.type.mime==mime);
}

module.exports = {
    File: AppFile
};
