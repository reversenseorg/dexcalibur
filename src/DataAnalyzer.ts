import * as _path_ from 'path';
import * as _fs_ from 'fs';
import DexcaliburProject from "./DexcaliburProject.js";
import ModelFile from "./ModelFile.js";


import * as Log from './Logger.js';
import {BinwalkHelper} from "./BinwalkHelper.js";
import DataScope, {DataScopeMap, DataScopePpts} from "./DataScope.js";
import BusEvent from "./BusEvent.js";
import {FileAnalysisType} from "./AnalyzerConfiguration.js";
import {MagicHelper} from "./MagicHelper.js";
import {Workflow} from "./Workflow.js";
import {IAnalyzerUnit} from "./analyzer/IAnalyzerUnit.js";
import {UTIL_CONST} from "./util/UtilConstants.js";
import {AnalyzerState} from "./AnalyzerState.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {IDatabase, IDbCollection, IStringIndex} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "./core/IStringIndex.js";
import {ProjectDatabase} from "./database/ProjectDatabase.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {randomUUID} from "crypto";
import {SecurityZone} from "./security/SecurityZone.js";
import {FileFormatDetector} from "./formats/identifier/FileFormatDetector.js";
import {from, map, mergeMap, Observable, ReplaySubject, Subject} from "rxjs";
import {DataFormatManagerException} from "./formats/error/DataFormatManagerException.js";
import {IDelegatedDataAnalyzer} from "./analyzer/IDelegatedDataAnalyzer.js";
import {AndroidDataAnalyzer} from "./android/analyzer/AndroidDataAnalyzer.js";
import {IosDataAnalyzer} from "./ios/analyzer/IosDataAnalyzer.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export interface FileScanResult {
    file: ModelFile;
    src: string;
}

function checkIfSmali(root, filepath){
    if(filepath.indexOf(_path_.join(root,"smali"))==0
        && _path_.extname(filepath)==".smali")
            return true;
    
    return false;
}


export class DataAnalyzer implements IAnalyzerUnit
{
    context:DexcaliburProject = null;

    private _tmpDB:IDatabase;
    private _pdb:ProjectDatabase;

    db:IDatabase = null;

    //detector:FileTypeDetector = null;
    binwalk:BinwalkHelper = null;

    magic:MagicHelper = null;

    fmtDetector:FileFormatDetector;

    state:AnalyzerState = null;

    scopes:DataScopeMap = {};
    _wf:Workflow;

    delegate:Record<string, IDelegatedDataAnalyzer> = {};

    /**
     * To instanciante a new analyzer of raw data (file, buffer, ...)
     *
     * @param {DexcaliburProject} pCtx Project
     */
    constructor(pCtx:DexcaliburProject){
        this.context = pCtx;

        this.fmtDetector = new FileFormatDetector(1);

        this.binwalk = new BinwalkHelper();
        this.magic = new MagicHelper();

        this._initDelegatedAnalyzer();

        this.setProjectDB(this.context.getProjectDB());

        this._tmpDB = this.context.getAnalyzer().getData().getTempConnector().newTemporaryDb('data');

    }

    /**
     *
     * @param pProjectDB
     */
    setProjectDB(pProjectDB:ProjectDatabase){
        this._pdb = pProjectDB;
    }


    /**
     * To restore the analyzer state
     *
     * @param {AnalyzerState} pState
     */
    restoreState(pState:AnalyzerState):boolean {
        if(pState != null){
            this.state = pState;
            // nothing to do
            return true;
        }

        return false;
    }


    /**
     *
     * @param pName
     */
    async getDataScope(pName:string):Promise<DataScope> {
        return await (this._pdb.getCollectionOf(DataScope.TYPE.getType()) as MongodbDbCollection)
            .asyncGetEntry({ __i:pName });
    }

    /**
     *
     */
    async init():Promise<void> {
        await this.updatePresetsDataScopes();

        const scopes = this._pdb.getCollectionOf(DataScope.TYPE.getType());
        const all = await scopes.getAll();

        this.scopes = {};
        all.map( vScope => {
            this.scopes[vScope.getInternalName()] = vScope;
        })

        this.restoreState(await this._pdb.getAnalyzerState('data'));
    }

    /**
     * to update data scope from Project DB
     *
     * @method
     */
    async updatePresetsDataScopes():Promise<void>{
        const ws = this.context.getWorkspace();
        const coll = this._pdb.getCollectionOf(DataScope.TYPE.getType());

        await coll.asyncUpdateEntry( (DataScope.create("bin", 'PKG'))
            .setPpts(DataScopePpts.PATH, (this.context.os==OperatingSystem.IOS ? ws.getAppDir() :ws.getApkDir()))
            .setPpts(DataScopePpts.PATH_SEP, UTIL_CONST.PATH_SEPARATOR.POSIX)
            .setZone(SecurityZone.PUBLIC)
            , {upsert:true});
        await coll.asyncUpdateEntry((DataScope.create("app", 'APPDATA'))
            .setPpts(DataScopePpts.PATH, ws.getAppdataDir())
            .setZone(SecurityZone.PUBLIC)
            , {upsert:true});
        await coll.asyncUpdateEntry((DataScope.create("dev", 'DEVICE'))
            .setPpts(DataScopePpts.PATH, ws.getAppdataDir())
            .setZone(SecurityZone.PUBLIC)
            , {upsert:true});
        await coll.asyncUpdateEntry((DataScope.create("dbf", 'DYN_BUFFER'))
            .setPpts(DataScopePpts.PATH, ws.getRuntimeFilesDir())
            .setZone(SecurityZone.PUBLIC)
            , {upsert:true});
        await coll.asyncUpdateEntry((DataScope.create("bcf", 'DYN_BYTECODE'))
            .setPpts(DataScopePpts.PATH, ws.getRuntimeBcDir())
            .setZone(SecurityZone.PUBLIC)
            , {upsert:true});
    }





    parseUID(pUID:string):any {
        const t = pUID.split(':');
        if( t.length < 2) throw new Error('Invalid ModelFile UID');

        return {
            scope: this.scopes[t[0]],
            hash: t[1]
        }
    }

    async findFile(pUID:string):Promise<ModelFile>{
        const o =this.parseUID(pUID);
        let f:ModelFile;

        (await this.getIndex(o.scope)).map( (vO:number, vFile:ModelFile)=>{
            if(vFile.getUID() === pUID){
                f = vFile;
            }
        });

        return f;
    }

    setWorkflow(pWf:Workflow):void{
        this._wf = pWf;
        this.binwalk.setWorkflow(this._wf);
        this.magic.setWorkflow(this._wf);
    }

    getScope(pName:string):Nullable<DataScope>{
        return this.scopes[pName];
    }


    /**
     * To load in memory, files from ProjectDB for the specified Index
     *
     * @param {DataScope} pScope
     * @method
     */
    async loadIndex(pScope:DataScope): Promise<void> {
        const coll:IDbCollection = this.context.getAnalyzer().getData().getCollection(pScope.getIndexName(), ModelFile.TYPE);
        const files = await this._pdb.getCollectionOf(ModelFile.TYPE.getType())
                                .search({ scope: pScope.getInternalName() });

        files.map((x:ModelFile) => {
            coll.addEntry(x.getRelativePath(), x);
        });
    }


    _indexFolders(pPath:string, pFolders:ModelFile[]):void {

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
     *
     * @param pScope
     */
    hasIndexed(pScope:DataScope):boolean {
        const indexed = this.state.getProperty('indexedScopes');
        return (indexed!=null && indexed.indexOf(pScope.getName())>-1);
    }


    /**
     * To detect the format of a file
     *
     * @param {string} pPath
     * @param {string} pSkipGlob
     * @param {Nullable<FileAnalysisType>} pAnalysisType Default is NULL, and is retrieved from context settings.
     * @return {ModelFile[]} Instance of ModelFile for each analyzed file
     * @private
     * @method
     */
     _detectFileFormatFolder(pPath:string, pSkipGlob:string, pAnalysisType:Nullable<FileAnalysisType>=null):Subject<ModelFile[]>{

        let obsFiles = new ReplaySubject<ModelFile[]>(3);
        let files:ModelFile[]
        let type:FileAnalysisType = pAnalysisType;
        if(type==null){
            type = this.context.getAnalyzerConfiguration().fileAnalysisMode;
        }


        switch (type){
            case FileAnalysisType.DEEP:
                // deep mode use only binwalk + internals
                this.fmtDetector.setBackend(this.binwalk);
                this.fmtDetector.analyzeFolder(pPath, this.context, pSkipGlob).then((vList:Subject<ModelFile[]>)=>{
                    vList.pipe(
                        map((vF)=>{
                            obsFiles.next(vF);
                            return vF;
                        })
                    ).subscribe((vFiles)=>{
                        console.log("Debug vFiles > "+vFiles.length);
                    })
                })
                break;
            case FileAnalysisType.MAGIC:
                files = this.magic.analyzeFolder(pPath, this.context, pSkipGlob);
                obsFiles.next(files);
                break;
            case FileAnalysisType.SMART:
                // smart mode mixes magic and deep.
                files = this.smartScan(pPath, this.context, pSkipGlob);
                obsFiles.next(files);
                break;
        }

        return obsFiles;
    }


    /**
     * To detect the format of a file
     *
     * @param {string} pPath
     * @param {string} pSkipGlob
     * @param {Nullable<FileAnalysisType>} pAnalysisType Default is NULL, and is retrieved from context settings.
     * @return {ModelFile[]} Instance of ModelFile for each analyzed file
     * @private
     * @method
     */
    _detectFileFormatFrom(pPaths:string[], pAnalysisType:Nullable<FileAnalysisType>=null):Subject<ModelFile[]>{

        let obsFiles = new ReplaySubject<ModelFile[]>(3);
        let files:ModelFile[]
        let type:FileAnalysisType = pAnalysisType;
        if(type==null){
            type = this.context.getAnalyzerConfiguration().fileAnalysisMode;
        }

        switch (type){
            case FileAnalysisType.SMART:
            case FileAnalysisType.DEEP:
                // deep mode use only binwalk + internals
                this.fmtDetector.setBackend(this.binwalk);
                this.fmtDetector.analyzeFiles(pPaths, this.context).then((vList:Subject<ModelFile[]>)=>{
                    vList.pipe(
                        map((vF)=>{
                            obsFiles.next(vF);
                            return vF;
                        })
                    ).subscribe((vFiles)=>{
                        console.log("Debug vFiles > "+vFiles.length);
                    })
                })
                //files = this.binwalk.analyzeFolder(pPath, this.context, pSkipGlob);
                break;
            case FileAnalysisType.MAGIC:
                // magic mode use only magic number (file cmd)
                //files = this.magic.analyzeFolder(path, this.context, checkIfSmali);
                files = this.magic.analyzeFiles(pPaths, this.context);
                obsFiles.next(files);
                break;
            // smart scan is deprecated
            /*case FileAnalysisType.SMART:
                // smart mode mixes magic and deep.
                // scan lib/ folder
                // scan unknow + assets
                files = this.smartScan(pPath, this.context, pSkipGlob);
                obsFiles.next(files);
                break;*/
        }

        return obsFiles;
    }

    /**
     * To scan the 'path' as APK content
     *
     * @param path
     * @param pType
     */
    async scan(path:string, pScope:DataScope, pRelPath:string = null):Promise<Observable<ModelFile[]>>{

        //console.log("DATA ANALYZER SCOPE > ",path,pScope)
        let db:IDbCollection = this._pdb.getCollectionOf(ModelFile.TYPE.getType()); //.getCollection(pScope.getIndexName(), ModelFile.TYPE);
    
        if(path[path.length-1]=='/')
           path = path.substr(0,path.length-1);


        // upsert
        let f = new ModelFile({
            name: _path_.basename(path),
            path: path,
            scope: pScope,
            _r: pRelPath==null ? '/' : pRelPath,
            _d: 'd'
        });
        try{
            // _uid:f.getUID(),
            let file = await db.asyncUpdateEntry(f,{replace:true, upsert:true, filter:{ _r:f._r, __i:pScope.__i  }});
        }catch(err){
            Logger.error(err.message,err.stack);
            console.log(f);
        }


        if(_fs_.readdirSync(path).length==0){
            return from([]);
        }

        let skipGlob:string;

        switch(this.context.os){
            case OperatingSystem.ANDROID:
                skipGlob = "**/*.smali";
                break;
            default:
                skipGlob = "";
                break;
        }

        // scan file formats
        return this._detectFileFormatFolder(path, skipGlob)
            .pipe(
                mergeMap( async(vFiles:ModelFile[])=>{

                    // consolidate and save files
                    for(let i=0;i<vFiles.length; i++){
                        vFiles[i].setScope(pScope);
                        vFiles[i] = await db.asyncAddEntry({
                            _r:vFiles[i].getRelativePath(),
                            scope:vFiles[i].getScope().getUID()
                        }, vFiles[i]);
                    }

                    // complete Binwalk results with folders
                    let folders:ModelFile[] = [];
                    this._indexFolders(path, folders);

                    for(let i=0;i<folders.length; i++){
                        folders[i].setScope(pScope);
                        folders[i] = await db.asyncAddEntry({
                            _r:folders[i].getRelativePath(),
                            scope:folders[i].getScope().getUID()
                        }, folders[i]);
                    }


                    // files.length
                    Logger.info("[*] "+vFiles.length+" files analyzed");

                    return vFiles;
                })
            );
    }


    /**
     * To detect potentials file formats on the specified file
     *
     * @param {ModelFile} pFile
     * @param {DataScope} pScope
     * @return {DataAnalyzer} Analyzer instance
     * @method
     */
    scanFile(pFile:ModelFile, pScope:DataScope):DataAnalyzer{

        // TODO : change
        let idx:IDbCollection = this._pdb.getFileScope(pScope.getIndexName());

        pFile._d  ='f';
        pFile.setScope(pScope);

        //idx.addEntry(pFile);
        idx.setEntry(pFile.getRelativePath(), pFile);

        // if target app is Android App
        let file:ModelFile;
        try{
            file = this.binwalk.analyze(pFile.getPath(), this.context);

            for(let p in file){
                if(pFile[p]==null)
                    pFile[p] = file[p];
            }

            this.context.bus.send(new BusEvent({
                type: "file.post_scan."+pScope.getName(),
                data: pFile
            }));
        }catch (err){
            Logger.error("[DataAnalyzer][scanFile] Error :"+err.message);
        }

        return this;
    }

    /**
     * To get data analyzer DB holding data for all files
     *
     * @return {IDatabase} Database containing information about file for all scopes
     * @method
     * @since 1.0.0
     */
    getDB():IDbCollection{
        return this._pdb.getCollectionOf(ModelFile.TYPE.getType());
    }


    /**
     *
     * @param pPath
     * @param pScope
     */
    async getFile( pPath:string, pScope:DataScope|string):Promise<ModelFile> {
        const res = await this._pdb.getCollectionOf(ModelFile.TYPE.getType()).search({
            _r: pPath,
            scope: (typeof pScope!=='string'? pScope.getUID() : pScope)
        });

        if(res.length>0){
            return res[0];
        }else{
            return null;
        }
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
    async getIndex(pScope:DataScope|string):Promise<IDbCollection>{


        const files = await this.getFilesFromScope(pScope);
        const data = this._tmpDB.newCollection('data:0:'+randomUUID(),ModelFile.TYPE);

        files.map(x => data.addEntry(x.getRelativePath(), x));
        return data;

    }

    /**
     * To free a temporary collection
     *
     * @param pColl
     */
    free(pColl:IDbCollection){
        //TODO
    }


    /**
     * To get a list of all files into the specified DataScope
     *
     * @param {DataScope|string} pScope DataScope instance or internal name of the scope
     * @param {IStringIndex<any>} pScope Optional. Additional filters can be put here
     * @return {Promise<ModelFile[]>} Promise. A list of file
     * @async
     * @method
     */
    async getFilesFromScope(pScope:DataScope|string, pExtraFilters:IStringIndex<any> = {}):Promise<ModelFile[]>{

        const coll = this._pdb.getCollectionOf(ModelFile.TYPE.getType());
        const filter = {
            scope:(typeof pScope==='string'? pScope : pScope.getInternalName()),
            ... pExtraFilters
        };

        return await coll.search(filter);
    }



    /**
     * To index a file already analyzed
     *
     * @param pFile
     * @param pScope
     */
    async indexFile(pFile: ModelFile, pScope:DataScope=null):Promise<ModelFile> {



        if(pScope != null){
            pFile.scope = pScope;
        }

        pFile = await this._pdb.getCollectionOf(pFile).asyncUpdateEntry(pFile,{upsert:true, filter:{ _r: pFile.getRelativePath(), scope:pFile.getScope().getUID() }});
//        index.setEntry(pFile.getRelativePath(), pFile);


        this.context.bus.send( new BusEvent({
            type: 'data.file.index',
            data: pFile
        }))

        return pFile;
    }

    /**
     * To combine data carving-based and magic-number based detection
     *
     * Useful to perform a first scan with good results
     * @deprecated
     *
     */
    smartScan(pPath:string, pProject:DexcaliburProject, pSkipGlob:string):ModelFile[] {

        let results:ModelFile[] = [];
        // Huge files, executable or raw files are scanned with binwalk
        const baseFiles = this.magic.analyzeFolder(pPath, pProject, pSkipGlob);

        results = baseFiles;

        /*switch (pProject.os){
            case OperatingSystem.ANDROID:
                // search inside /libs/

                // check any unknown file or executable (.so, ELF, ...)

                break;
            case OperatingSystem.ANDROID:
                break;
            case OperatingSystem.ANDROID:
                break;
        }*/

        return results;
    }

    /**
     * To parse a list of files
     *
     * @param {ModelFile[]} pFiles List of files to parse
     */
    async analyze(pFiles:ModelFile[], pCreateMode = false):Promise<void>{

        let vFile:ModelFile;

        for(let i=0;i<pFiles.length; i++){
            vFile = pFiles[i];
            if(vFile.getType()==null){

                if(this.context.platform.isAndroid() && this.delegate[OperatingSystem.ANDROID]!=null) {
                    Logger.info("[DATA ANALYZER][DELEGATED > ANDROID] Invoked ");
                    if(vFile.getPath().endsWith(".smali")){
                        return;
                    }
                }

                let parserConstructors:any[];
                let results:any, fmt:string;

                try{
                    // todo : replace file extension by
                    fmt = _path_.extname(vFile.getPath());
                    parserConstructors = this.context.getDataFormatMgr().getParserByFileExtension<any>(fmt);

                    if(parserConstructors.length > 0){
                        results = await (parserConstructors[0]).fromBuffer(
                            _fs_.readFileSync(vFile.getRealPath())
                        );

                        vFile.data = results;

                        this.context.trigger({
                            type: "data.file.parsed",
                            data: {
                                file: vFile,
                                parser: parserConstructors[0],// (parserConstructors[0]).UID,
                                format: fmt,
                                saved: pCreateMode
                            }
                        });
                    }
                }catch(err){
                    if(err.code==DataFormatManagerException.CODE.NOT_PARSABLE){
                        Logger.info(err.message);
                    }else{
                        Logger.error(err.message,err.stack);
                        // push to workflow / task manager / etc ...
                    }
                }

            }
        }


    }


    /**
     * To init delegated data analyzer
     *
     * @private
     */
    private _initDelegatedAnalyzer() {
        switch (this.context.os){
            case OperatingSystem.ANDROID:
                this.delegate[OperatingSystem.ANDROID] = new AndroidDataAnalyzer(this.context);
                break;
            case OperatingSystem.IOS:
                this.delegate[OperatingSystem.IOS] = new IosDataAnalyzer(this.context);
                break;
        }
    }

    /**
     * To scan the 'path' as APK content
     *
     * @param path
     * @param pType
     */
    async detectFmtFiles(pFiles:ModelFile[], pScope:DataScope):Promise<Observable<ModelFile[]>>{

        let db:IDbCollection = this.context.getProjectDB().getCollectionOf(ModelFile.TYPE.getType());


        let  files:Record<string,ModelFile>={};
        for(let i=0; i<pFiles.length; i++){
            files[pFiles[i].getRealPath()] = pFiles[i] as ModelFile;
        }

        // scan file formats
        return this._detectFileFormatFrom(Object.keys(files))
            .pipe(
                mergeMap( async(vFiles:ModelFile[])=>{

                    // consolidate and save files
                    for(let i=0;i<vFiles.length; i++){
                        files[vFiles[i].getRealPath()].__t = vFiles[i].__t;
                        files[vFiles[i].getRealPath()].__p = vFiles[i].__p;
                        files[vFiles[i].getRealPath()].type = vFiles[i].type;
                        await this.context.getProjectDB().save(vFiles[i], null, ['__p','__t','type']);
                    }

                    // files.length
                    Logger.info("[*] "+vFiles.length+" files analyzed");

                    return vFiles;
                })
            );
    }
}
