// add xml, yaml, properties, jks, bks,  parser ...
// add file type identifier

function EncodedDataType(config){
    this.mime = null;
    this.ext = null;

    if(config!=null)
        for(let i in config) this[i]=config[i];

    return this;  
}
EncodedDataType.prototype.isMIME = function(format){
    return this.mime===format;
}
EncodedDataType.prototype.isExt = function(format){
    return this.ext===format;
}


const TYPES = {
    BKS: new EncodedDataType({ ext: "bks" }),
    XML: new EncodedDataType({ ext: "xml" }),
    JSON: new EncodedDataType({ ext: "json" }),
    YAML: new EncodedDataType({ ext: "yml" }),
    PROP: new EncodedDataType({ ext: "properties" })
};




function TypeDetector(config){
    /*this.reader = null;
    this.writer = null;
    this.dumper = null;
    this.new = null;
    */
    this.stats = {};

    for(let i in config) this[i] = config[i];
    return this;
}
TypeDetector.prototype.search = function(extension){
    let ext = extension, type=null;
    for(let i in TYPES){
        if(ext==TYPES[i].ext){
            type = TYPES[i];
            this.stats[type]++;
            break;
        }
    }

    return type;
}
TypeDetector.prototype.getStats = function(){
    return this.stats;
}

module.exports = {
    TYPES: TYPES,
    TypeDetector: TypeDetector,
    EncodedDataType: EncodedDataType  
};