

import * as  LIB_filetypeOf from"file-type";
import * as _path_ from 'path';
import * as _fs_ from 'fs';

import * as LIB_YAML from "js-yaml";
import * as LIB_PROP from "properties";
import DexcaliburProject from "./DexcaliburProject";
import {FileTypeDetector} from "./FileTypes";
import ModelFile from "./ModelFile";
import {ConnectorFactory, IDatabase, IDatabaseAdapter, IDbIndex} from "./ConnectorFactory";
import Event from "./Event";
import Util from "./Utils";


function checkIfSmali(root, filepath){
    if(filepath.indexOf(_path_.join(root,"smali"))==0
        && _path_.extname(filepath)==".smali")
            return true;
    
    return false;
}

/*
export class DataCollection
{
    files:any = null;
    buffers:any = null;

    constructor(config:any = undefined){
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
                    //console.log( _fs_.readFileSync(file.getPath(), 'utf8'));
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

    pushBuffer(buff:any){
        this.buffers.push(buff);
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
    
}*/

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
                //console.log( _fs_.readFileSync(file.getPath(), 'utf8'));
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

export enum DATA_SCOPE {
    PKG="bin",
    DEVICE="dev",
    STATIC_BUFFER="sbf",
    DYN_BUFFER="dbf"
}

export class DataAnalyzer
{
    context:DexcaliburProject = null;
    db:IDatabase = null;
    detector:FileTypeDetector = null;

    constructor(pCtx:DexcaliburProject){
        this.context = pCtx;
        this.detector = new FileTypeDetector();

        this.newDB();
    }

    newDB(pName:string="data"){
        let idb:IDatabaseAdapter = ConnectorFactory.getInstance().newConnector('inmemory',this.context);
        this.db = idb.newTemporaryDb(pName);
    }

    scan(path:string, pType:DATA_SCOPE=DATA_SCOPE.PKG){
        let db:IDbIndex = this.db.getIndex(pType);
        let detector = this.detector;
        let ctr:number = 0, file:ModelFile=null, ctx:DexcaliburProject=this.context;
        //Logger.info("[DATA ANALYZER] Start scan of : ",path);
    
        if(path[path.length-1]=='/')
           path = path.substr(0,path.length-1);
    
        Util.forEachFileOf(path,function( fpath:string, fname:string){
            let type:any = null;
    
            //  TODO : remove
            if(checkIfSmali(path, _path_.join(fpath,fname))) return null;
    
            let ext = fpath.substr(fpath.lastIndexOf('.')+1); 
    
            //Logger.info("[DATA ANALYZER] Start analyzing file : ",fpath);
        
            type = LIB_filetypeOf( _fs_.readFileSync(fpath));
            // make relative path (path in the package)
    
            if(type != null){
    
                // Logger.info("[DATA ANALYZER]<1> Push file : ",fpath);
                file = new ModelFile({
                    path: fpath,
                    name: fname,
                    type: type
                });
                
                ctx.bus.send(new Event({
                    type: "data.file.new.knownFmt",
                    data: file 
                }))
    
                db.addEntry(file);
            }else{
                type = detector.search(ext);
                
                //console.log(type);
                if(type != null){
                    //Logger.info("[DATA ANALYZER]<2> Push file : ",fpath);
                    file = new ModelFile({
                        path: fpath,
                        name: fname,
                        type: type
                    });
                    db.addEntry(file);
                    //console.log("Nb : "+db.files.length);
    
                    ctx.bus.send(new Event({
                        type: "data.file.new.knownExt",
                        data: file 
                    }))
        
                }
                else if(ext=="smali"){
                    //ignore
                }else{
                    //Logger.info("[DATA ANALYZER]<3> Push file : ",fpath);
                    db.addEntry(new ModelFile({
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
    }

    getDB():IDatabase{
        return this.db;
    }

    getIndex(pType:DATA_SCOPE):IDbIndex{
        return this.db.getIndex(pType);
    }
}
