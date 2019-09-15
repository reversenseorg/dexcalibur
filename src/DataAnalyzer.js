const FS = require("fs");
const PATH = require("path"); 
const LIB_filetypeOf = require("file-type");
const LIB_YAML = require("js-yaml");
const LIB_PROP = require("properties");
const UT = require("./Utils.js");
const FileHelper = require("./File.js");
const FileTypeHelper = require("./FileTypes.js");
const Logger = require("./Logger.js")();
const Event = require("./Event.js");
const EventType = Event.TYPE;


function checkIfSmali(root, filepath){
    if(filepath.indexOf(PATH.join(root,"smali"))==0 
        && PATH.extname(filepath)==".smali") 
            return true;
    
    return false;
}


class DataCollection
{
    constructor(config){
        this.context = null;
        this.files = [];
        this.buffers = [];

        if(config!=null)
            for(let i in config) this[i]=config[i];

    }

    pushFile(file){
        let self = this;
        //console.log(file.getType());
        if(file.getType() != null){
            switch(file.getType().ext){
                case "properties":
                    //LIB_PROP.parse();
                    LIB_PROP.parse (file.getPath(), { path: true }, function (error, obj){
                        // if (error) return console.error (error);
                        file.data = obj;
                        self.files.push(file);
                    });
                    this.files.push(file);
                    break;
                case "yml":
                    //console.log("yml here");
                    //file.data = LIB_YAML.load(
                    //console.log( FS.readFileSync(file.getPath(), 'utf8'));
                    this.files.push(file);
                    break;
                    //);
                default:
                    this.files.push(file);
                    break;
            }
        }else{
            this.files.push(file);
        }
        return this;
    }

    pushBuffer(buff){
        this.buffers.push(file);
        return this;
    }

    searchType(cmp,format){
        let coll = new DataCollection();
        coll.context = this.context;
        
        for(let i=0; i<this.files.length; i++)
            if(this.files[i] != null && this.files[i][cmp](format))
                coll.pushFile(this.files[i]);
    
        for(let i=0; i<this.buffers.length; i++)
            if(this.buffers[i] != null && this.buffers[i][cmp](format))
                coll.pushBuffer(this.buffers[i]);
        
        return coll;
    }

    searchMIME(format){
        return this.searchType('hasMIME',format);
    }
    searchExt(format){
        return this.searchType('hasExt',format);
    }
    getFiles(){
        return this.files; 
    }
    getBuffers(){
        return this.buffers; 
    }
    
}

/*
DataCollection.prototype.pushFile = function(file){
    let self = this;
    //console.log(file.getType());
    if(file.getType() != null){
        switch(file.getType().ext){
            case "properties":
                //LIB_PROP.parse();
                LIB_PROP.parse (file.getPath(), { path: true }, function (error, obj){
                    // if (error) return console.error (error);
                    file.data = obj;
                    self.files.push(file);
                });
                this.files.push(file);
                break;
            case "yml":
                //console.log("yml here");
                //file.data = LIB_YAML.load(
                //console.log( FS.readFileSync(file.getPath(), 'utf8'));
                this.files.push(file);
                break;
                //);
            default:
                this.files.push(file);
                break;
        }
    }else{
        this.files.push(file);
    }
    return this;
}
DataCollection.prototype.pushBuffer = function(buff){
    this.buffers.push(file);
    return this;
}
DataCollection.prototype.searchType = function(cmp,format){
    let coll = new DataCollection();
    coll.context = this.context;
    
    for(let i=0; i<this.files.length; i++)
        if(this.files[i] != null && this.files[i][cmp](format))
            coll.pushFile(this.files[i]);

    for(let i=0; i<this.buffers.length; i++)
        if(this.buffers[i] != null && this.buffers[i][cmp](format))
            coll.pushBuffer(this.buffers[i]);
    
    return coll;
}
DataCollection.prototype.searchMIME = function(format){
    return this.searchType('hasMIME',format);
}
DataCollection.prototype.searchExt = function(format){
    return this.searchType('hasExt',format);
}
DataCollection.prototype.searchExt = function(format){
    return this.searchType('hasExt',format);
}
DataCollection.prototype.getFiles = function(){
    return this.files; 
}
DataCollection.prototype.getBuffers = function(){
    return this.buffers; 
}
*/
function DataAnalyzer(ctx){
    this.context = ctx;
    this.db = new DataCollection();
    this.detector = new FileTypeHelper.TypeDetector();
    
    return this;    
}

DataAnalyzer.prototype.scan = function(path){
    let db = this.db;
    let detector = this.detector;
    let ctr = 0, file=null, ctx=this.context;
    //Logger.info("[DATA ANALYZER] Start scan of : ",path);

    if(path[path.length-1]=='/')
       path = path.substr(0,path.length-1);

    UT.forEachFileOf(path,function( fpath, fname){
        let type = null;

        if(checkIfSmali(path, PATH.join(fpath,fname))) return null;

        let ext = fpath.substr(fpath.lastIndexOf('.')+1); 

        //Logger.info("[DATA ANALYZER] Start analyzing file : ",fpath);
    
        type = LIB_filetypeOf( FS.readFileSync(fpath));
        // make relative path (path in the package)

        if(type != null){

            // Logger.info("[DATA ANALYZER]<1> Push file : ",fpath);
            file = new FileHelper.File({
                path: fpath,
                name: fname,
                type: type
            });
            
            ctx.bus.send(new Event.Event({
                type: "data.file.new.knownFmt",
                data: file 
            }))

            db.pushFile(file);
        }else{
            type = detector.search(ext);
            
            //console.log(type);
            if(type != null){
                //Logger.info("[DATA ANALYZER]<2> Push file : ",fpath);
                file = new FileHelper.File({
                    path: fpath,
                    name: fname,
                    type: type
                });
                db.pushFile(file);
                //console.log("Nb : "+db.files.length);

                ctx.bus.send(new Event.Event({
                    type: "data.file.new.knownExt",
                    data: file 
                }))
    
            }
            else if(ext=="smali"){
                //ignore
            }else{
                //Logger.info("[DATA ANALYZER]<3> Push file : ",fpath);
                db.pushFile(new FileHelper.File({
                    path: fpath,
                    name: fname,
                    unknow: true
                }));
            }
                
        }
        ctr++;
    },true);

    console.log("[*] "+ctr+" files analyzed");
    return this;
};

DataAnalyzer.prototype.getDB = function(){
    return this.db;
};


module.exports = {
    Analyzer: DataAnalyzer,
    Collection: DataCollection
};