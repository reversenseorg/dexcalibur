import SmaliParser from "./SmaliParser";
import AnalyzerDatabase from "./AnalyzerDatabase";
import DexcaliburProject from "./DexcaliburProject";
import {SearchAPI} from "./SearchAPI";
import R2Factory from "./R2Factory";


import * as Log from './Logger';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

import RadareFactory from "./R2Factory";
import RadareHelper from "./R2Helper";
import ModelFile from "./ModelFile";
import Platform from "./Platform";
import {IDatabase, IDbIndex} from "./ConnectorFactory";
import DataScope from "./DataScope";
import {ModelFunction} from "./ModelFunction";


export enum NativeAnalyzerProfile{
    ANDROID_LIB,
    IOS_LIB
}

export interface NativeFileList {
    [pScopeName:string] :ModelFile[]
}
export default class NativeAnalyzer {

    /**
     * @type {SmaliParser}
     * @field
     */
    parser:SmaliParser = null;
    db:AnalyzerDatabase = null;
    tempDB:AnalyzerDatabase = null;
    fileDB:IDatabase = null;

    finder:SearchAPI = null;
    encoding:BufferEncoding= null;

    scope:ModelFile[] = [];
    targets:NativeFileList = {};

    r2factory: RadareFactory=null;
    context:DexcaliburProject = null;

    profile:NativeAnalyzerProfile = null;

    arch:string = '';
    fmt:string[] = [];

    /**
     *
     * @param {string} pEncoding
     * @param {SearchAPI} pSearchAPI
     * @param {DexcaliburProject} pProject
     * @constructor
     */
    constructor( pProject:DexcaliburProject = null, pDB:AnalyzerDatabase, pFileDB:IDatabase) {

        this.r2factory = new RadareFactory(pProject);

        // Internal DB
        this.db = pDB;
        this.fileDB = pFileDB;

        // temporary, in memory, database
        this.tempDB = new AnalyzerDatabase(pProject, 'inmemory');

        this.context = pProject;
        this.finder = pProject.find; //pSearchAPI; // pSearchAPI
    }

    /**
     * To find files which can be analyzed into internal DB
     *
     * @param pPlatform
     * @param pArch
     */
    defineScopeFor( pPlatform:string,  pArch:string, pScopeType:string):ModelFile[] {

        let fmt:string[];
        let f:ModelFile[] = [];

        if(pPlatform=='android'){
            this.fmt = ['ELF'];
        }else{
            return;
        }

        //const basePath = this.context.getWorkspace()

        this.fileDB.getIndex(pScopeType).map( (pOffset:number, pFile:ModelFile) => {

            if(fmt.indexOf(pFile.type)>-1){
                f.push(pFile);
            }
        })

        this.scope = f;


        return f;
    }

    /**
     * To get the list of native files targeted by the native analyzer
     *
     * @return {ModelFile[]}
     * @method
     */
    getTargetFiles():ModelFile[]{
        return this.scope;
    }

    /**
     * To find files which can be analyzed into internal DB
     *
     * @param pPlatform
     * @param pArch
     */
    configure( pPlatform:Platform,  pArch:string):void {
        this.arch = pArch;

        if(pPlatform.isAndroid() || pPlatform.is(['linux','tizen'])){
            this.fmt = ['ELF'];
            this.profile = NativeAnalyzerProfile.ANDROID_LIB;
        }
        else if(pPlatform.isIOS()){
            this.fmt = ['Mach-O'];
            this.profile = NativeAnalyzerProfile.IOS_LIB;
        }
    }

    /**
     * To append a file to the current scope
     *
     * @param pFile
     */
    addFileToScope(pFile:ModelFile):void {
        this.scope.push(pFile);
    }

    /**
     * To scan all acceptable files into given scope
     *
     * @param pScope
     * @param pOptions
     */
    scanFileByScope(pScope:DataScope, pOptions:any={}):void {

        if(!this.targets.hasOwnProperty(pScope.getName()))
            this.targets[pScope.getName()] = [];

        let idx:IDbIndex = this.fileDB.getIndex(pScope.getName());

        idx.map( (pOffset:number, pFile:ModelFile) => {

            if(this.fmt.indexOf(pFile.type)>-1){
                /*if(!(pFile instanceof ModelFileExecutable)){
                    pFile = new ModelFileExecutable(pFile);
                    idx.setEntry( pOffset, new ModelFileExecutable(pFile))
                }*/
                this.targets[pScope.getName()].push(pFile);

                this.analyzeFile(pFile, this.profile);
            }
        })
    }

    scanAllFiles(pOptions:any):void{

        if(!this.targets.hasOwnProperty('all'))
            this.targets.all = [];

        this.db.files.map( (pOffset:number, pFile:ModelFile) => {

            if(this.fmt.indexOf(pFile.type)>-1){
                this.targets.all.push(pFile);

                this.analyzeFile(pFile, this.profile);
            }
        });
    }

    /*
    scan( pOptions:any= {}){
        let f:ModelFile = this.scope[0];
        Logger.info(`[NATIVE] Start analysis of [${f.name}] [${f.type}] [${f.__p.m[0]}]`);

        this.analyzeFile(f, NativeAnalyzerProfile.ANDROID_LIB);
    }*/


    requireAnalysis( pFile:ModelFile, pCommands:string[], pOptions:any):boolean {
        if(!this.r2factory.isOpened(pFile)){
            return true;
        }else{
            return (this.r2factory.getHelperFor(pFile).isReadyFor(pCommands,pOptions)===false);
        }
    }


    /**
     * To execute a set of command into r2.
     *
     * Additional arguments can be passed through 'pOptions'
     *
     * @param {ModelFile} pFile The file containing data to analyze
     * @param {string[]} pCommands
     * @param (any} pOptions Optionnal. Additional argument for the commands
     * @return {number} Number of command successfully executed
     * @async
     * @method
     * @since 1.0.0
     */
    async scan(pFile:ModelFile, pCommands:string[], pOptions:any = {}):Promise<number> {
        let helper:RadareHelper;
        let i:number;
        try{
            helper = this.r2factory.getHelperFor(pFile);
            if(helper==null){
                helper = this.analyzeFile(pFile, this.profile);
            }

            i = await helper.runCmd(pCommands, pOptions);

        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] scan : "+err.message);
            i = -1;
        }
        return i;
    }

    analyzeFile(pFile:ModelFile, pProfile:NativeAnalyzerProfile):RadareHelper{
        let helper:RadareHelper;
        try{

            if(!this.r2factory.isOpened(pFile)){
                helper = this.r2factory.newLocalInstance(pFile);
            }else{
                helper = this.r2factory.getHelperFor(pFile);
            }

            ( async ()=>{
                const n = await helper.start(pProfile);

                //Logger.info("[DB::FUNC] executed cmd : "+n);
                if(n){
                    pFile.getFunctions().map( (vFn:ModelFunction) => {
                        this.db.funcs.addEntry(vFn.signature(), vFn);
                       // Logger.info("[DB::FUNC] add func : ", JSON.stringify(vFn));
                    })
                }

            })();

        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] "+err.message)

        }
        return helper;
    }

    analyzeMemory(){

    }

}