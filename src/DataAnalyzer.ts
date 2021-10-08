import * as _path_ from 'path';
import * as _fs_ from 'fs';
import DexcaliburProject from "./DexcaliburProject";
import ModelFile from "./ModelFile";
import {ConnectorFactory} from "./ConnectorFactory";


import * as Log from './Logger';
import {BinwalkHelper} from "./BinwalkHelper";
import DataScope, {DataScopeMap, DataScopePpts} from "./DataScope";
import Event from "./Event";
import {FileAnalysisType} from "./AnalyzerConfiguration";
import {MagicHelper} from "./MagicHelper";
import {Workflow} from "./Workflow";
import {IDatabase, IDatabaseAdapter, IDbIndex} from "./persist/orm/DbAbstraction";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


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

/*
export enum DATA_SCOPE {
    PKG="bin",
    DEVICE="dev",
    STATIC_BUFFER="sbf",
    DYN_BUFFER="dbf"
}
*/

/*
export var DATA_SCOPE:DataScopeMap = {
    PKG: (new DataScope("bin")),
    DEVICE: (new DataScope("dev")),
    STATIC_BUFFER: (new DataScope("sbf")),
    DYN_BUFFER: (new DataScope("dbf"))
}
*/


export class DataAnalyzer
{
    context:DexcaliburProject = null;
    db:IDatabase = null;
    //detector:FileTypeDetector = null;
    binwalk:BinwalkHelper = null;
    magic:MagicHelper = null;

    scopes:DataScopeMap = {};
    _wf:Workflow;

    /**
     * To instanciante a new analyzer of raw data (file, buffer, ...)
     *
     * @param {DexcaliburProject} pCtx Project
     */
    constructor(pCtx:DexcaliburProject){
        this.context = pCtx;
        this.binwalk = new BinwalkHelper();
        this.magic = new MagicHelper();


        //STATIC_BUFFER: (new DataScope("sbf")).setPpts(DataScopePpts.PATH, ws.get()),
        const ws = pCtx.getWorkspace();
        this.scopes = {
            PKG: (new DataScope("bin")).setPpts(DataScopePpts.PATH, ws.getApkDir()),
            APPDATA: (new DataScope("app")).setPpts(DataScopePpts.PATH, ws.getAppdataDir()),
            DEVICE: (new DataScope("dev")).setPpts(DataScopePpts.PATH, ws.getAppdataDir()),
            DYN_BUFFER: (new DataScope("dbf")).setPpts(DataScopePpts.PATH, ws.getRuntimeFilesDir()),
            DYN_BYTECODE: (new DataScope("bcf")).setPpts(DataScopePpts.PATH, ws.getRuntimeBcDir())
        };

        this.db = pCtx.getDB();

        // this.newDB();
    }


    setWorkflow(pWf:Workflow):void{
        this._wf = pWf;
        this.binwalk.setWorkflow(this._wf);
        this.magic.setWorkflow(this._wf);
    }

    getScope(pName:string){
        return this.scopes[pName];
    }

    /*newDB(pName:string="files.db"){
        // inmemory
        let idb:IDatabaseAdapter = ConnectorFactory.getInstance().newConnector('sqlite',this.context);
        this.db = idb.newTemporaryDb(pName);
    }*/

    indexFilesIn(pScope:DataScope):void {
        const dir = _fs_.readdirSync(pScope.getBasePath());

        if(this.context.platform.isAndroid()){
            // skip APKtool contents and files
            if(pScope.getName()=='bin'){
                dir.map( (vPath:string)=>{
                    const p = _path_.join(pScope.getBasePath(),vPath);
                    if(vPath.indexOf('smali')!=0 && vPath!='original' && _fs_.lstatSync(p).isDirectory()){
                        this.scan(p, pScope, vPath);
                    }
                })
            }else{
                dir.map( (vPath:string)=>{
                    const p = _path_.join(pScope.getBasePath(),vPath);
                    if(_fs_.lstatSync(p).isDirectory()){
                        this.scan(p, pScope, vPath);
                    }
                })
            }
        }else{
            dir.map( (vPath:string)=>{
                const p = _path_.join(pScope.getBasePath(),vPath);
                if(_fs_.lstatSync(p).isDirectory()){
                    this.scan(p, pScope, vPath);
                }
            })
        }
    }


    private _indexFolders(pPath:string, pFolders:ModelFile[]):void {

        _fs_.readdirSync(pPath).map( vF => {
            const p = _path_.join(pPath,vF);
            if(_fs_.lstatSync(p).isDirectory()) {
                this._indexFolders(p, pFolders);
                pFolders.push(new ModelFile({
                    name: vF,
                    path: p,
                    _d: 'd'
                }));
            }
        });
    }

    /**
     * To scan the 'path' as APK content
     *
     * @param path
     * @param pType
     */
    scan(path:string, pScope:DataScope, pRelPath:string = null){

        let db:IDbIndex = this.db.getIndex(pScope.getName());
    
        if(path[path.length-1]=='/')
           path = path.substr(0,path.length-1);


        db.addEntry(new ModelFile({
            name: _path_.basename(path),
            path: path,
            _r: pRelPath,
            _d: 'd'
        }));

        if(_fs_.readdirSync(path).length==0) return;


        let files:ModelFile[]
        // if target app is Android App
        switch (this.context.getAnalyzerConfiguration().fileAnalysisMode){
            case FileAnalysisType.DEEP:
                // deep mode use only binwalk + internals
                files = this.binwalk.analyzeFolder(path, this.context, "**/*.smali");
                break;
            case FileAnalysisType.MAGIC:
                // magic mode use only magic number (file cmd)
                //files = this.magic.analyzeFolder(path, this.context, checkIfSmali);
                files = this.magic.analyzeFolder(path, this.context, "**/*.smali");
                break;
            case FileAnalysisType.SMART:
                // smart mode mixes magic and deep.
                // Huge files, executable or raw files are scanned with binwalk
                //files = this.binwalk.analyzeFolder(path, this.context, checkIfSmali);
                break;
        }




        files.map( (f) => {
            f.setScope(pScope);
            db.addEntry(f);
        });

        // complete Binwalk results with folders
        let folders:ModelFile[] = [];
        this._indexFolders(path, folders);

        folders.map( (f) => {
            f.setScope(pScope);
            db.addEntry(f);
        });


        // files.length
        Logger.info("[*] "+files.length+" files analyzed");
        return this;
    }

    "file.post_scan.DYN_BYTECODE"

    /**
     * To scan the 'path' as APK content
     *
     * @param path
     * @param pType
     */
    scanFile(pFile:ModelFile, pScope:DataScope){


        let db:IDbIndex = this.db.getIndex(pScope.getName());

        pFile._d  ='f';
        pFile.setScope(pScope);

        db.addEntry(pFile);

        // if target app is Android App
        let file:ModelFile = this.binwalk.analyze(pFile.getPath(), this.context);

        for(let p in file){
            if(pFile[p]==null)
                pFile[p] = file[p];
        }

        this.context.bus.send(new Event({
            type: "file.post_scan."+pScope.getName(),
            data: pFile
        }));
        return this;
    }

    /**
     * To get data analyzer DB holding data for all files
     *
     * @return {IDatabase} Database containing information about file for all scopes
     * @method
     * @since 1.0.0
     */
    getDB():IDatabase{
        return this.db;
    }

    /**
     * To get the index holding file of a specific scope
     *
     * Valid scope IDs are : PKG, DEV, DYN_BUFFER, ...
     *
     * @param {DataScope|string} pScope Scope or scope ID
     * @return {IDbIndex} Index containing files
     * @method
     * @since 1.0.0
     */
    getIndex(pScope:DataScope|string):IDbIndex{
        if(typeof pScope==='string')
            return this.db.getIndex(this.scopes[pScope].getName());
        else
            return this.db.getIndex(pScope.getName());
    }

    /**
     * To index a file already analyzed
     *
     * @param pFile
     * @param pScope
     */
    indexFile(pFile: ModelFile, pScope:DataScope=null):void {

        const index:IDbIndex = this.db.getIndex( pScope!=null ? pScope.getName() : pFile.scope.getName() );

        index.addEntry(pFile);

        this.context.bus.send( new Event({
            type: 'data.file.index',
            data: pFile
        }))
    }
}
