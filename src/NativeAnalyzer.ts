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
import DataScope from "./DataScope";
import {ModelFunction} from "./ModelFunction";
import {ABI} from "./binary/ABI";
import {Workflow} from "./Workflow";
import {IDatabase, IDbCollection, IDbIndex} from "./persist/orm/DbAbstraction";
import {NativeAnalyzerProfile} from "./NativeAnalyzerProfile";
import AndroidNativeAnalyzerProfile from "./android/analyzer/AndroidNativeAnalyzerProfile";
import IosNativeAnalyzerProfile from "./ios/analyzer/IosNativeAnalyzerProfile";
import {NativeAnalyzerException} from "./errors/NativeAnalyzerException";


export const PROFILES = {
    ANDROID_LIB: new AndroidNativeAnalyzerProfile({ }),
    IOS_LIB: new IosNativeAnalyzerProfile({})
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
    abi:ABI[] = null;

    _wf:Workflow;

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

    setWorkflow(pWF:Workflow){
        this._wf = pWF;
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

        this.fileDB.getIndex(pScopeType, ModelFile.TYPE).map( (pOffset:number, pFile:ModelFile) => {

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
     *
     * @param {DataScope} pScope
     */
    getAnalyzedFiles(pScope:DataScope):ModelFile[]{
        return this.targets[pScope.getName()];
    }

    /**
     * To find files which can be analyzed into internal DB
     *
     * @param pPlatform
     * @param pArch
     */
    configure( pPlatform:Platform,  pArch:string, pABI:ABI[]=null):void {
        this.arch = pArch;

        Logger.info("[NATIVE ANALYZER] configure with : ",pPlatform.getInternalName(),pArch,JSON.stringify(pABI));

        if(pPlatform.isAndroid() || pPlatform.is(['linux','tizen'])){
            this.fmt = ['ELF'];
            this.profile = PROFILES.ANDROID_LIB;
            this.abi = pABI;
        }
        else if(pPlatform.isIOS()){
            this.fmt = ['Mach-O'];
            this.profile = PROFILES.IOS_LIB;
            this.abi = pABI;
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
    scanFileByScope(pScope:DataScope, pProfile:NativeAnalyzerProfile=null, pOptions:any = {}):void {


        Logger.info("[NATIVE ANALYSIS] Scanning scope : ",pScope.getIndexName()," ",pScope.getBasePath());

        if(!this.targets.hasOwnProperty(pScope.getName()))
            this.targets[pScope.getName()] = [];

//        let idx:IDbIndex = this.fileDB.getColl(pScope.getName(), ModelFile.TYPE);
        let idx:IDbCollection = this.fileDB.getCollection(pScope.getIndexName(), ModelFile.TYPE);

        const profile = pProfile!=null ? pProfile : this.profile;

        const targetable:any = {};

        // gather targetable file
        idx.map( (pOffset:number, pFile:ModelFile) => {

            Logger.debug(`[NATIVE ANALYSIS] Scanning file from (scope:${pScope.getName()}) : ${pFile.getRelativePath()}`);

            if(this.fmt.indexOf(pFile.type)>-1){

                // ABI detected into file
                // File is receivable if ABI is determined by file path if the scope is APK
                //
                if(this.profile.name == PROFILES.ANDROID_LIB.name){
                    if(pScope.getName()=="bin"){
                        Logger.info("[NATIVE] ",pFile.getRelativePath()," ",JSON.stringify(this.abi)," ",this.profile.isAbiCompliant( pFile, this.abi)+"");
                        const o:number = this.profile.isAbiCompliant( pFile, this.abi);
                        const fn:string = pFile.getName();

                        if(o>-1){
                            if(targetable[fn] == null){
                                targetable[fn] = [];
                            }
                            targetable[fn][o] = pFile;
                        }
                    }else{
                        // by default, if ABI compliance check cannot be
                        // based on file path (as into apk), file is considered compliant
                        // todo : add ABI detection or let user force analysis
                        // targetable.push(pFile);

                        this.targets[pScope.getName()].push(pFile);

                        if(pOptions==null || !pOptions.skipAuto){
                            this.analyzeFile(pFile, profile);
                        }else{
                            Logger.info("[ANALYZER] Native analysis of "+pFile.getRelativePath()+" has been skipped by configuration (#1)");
                        }
                    }
                }
            }
        });


        // analyze gathered files
        for(let k in targetable){
            const f = targetable[k].pop();
            if(f != undefined){

                this.targets[pScope.getName()].push(f);

                if(pOptions==null || !pOptions.skipAuto){
                    this.analyzeFile(f, profile);
                }else{
                    Logger.info("[NATIVE ANALYZER] Native analysis of "+f.getRelativePath()+" has been skipped by configuration (#2)");
                }
            }else{
                Logger.error("[NATIVE ANALYZER] Compliant ABI are detected , but none are preferred (file="+f.getName()+") "+JSON.stringify(this.abi)+" "+targetable[k].length)
            }

        }

    }

    /**
     *
     * @param pProfile
     */
    scanAllFiles(pProfile:NativeAnalyzerProfile = null):void{

        if(!this.targets.hasOwnProperty('all'))
            this.targets.all = [];


        const profile = pProfile!=null ? pProfile : this.profile;

        this._wf.computeStepUp(this.db.files.size());
        this.db.files.map( (pOffset:number, pFile:ModelFile) => {

            if(this.fmt.indexOf(pFile.type)>-1){
                this.targets.all.push(pFile);

                this.analyzeFile(pFile, profile);
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

        const profile = pOptions.hasOwnProperty('profile')? pOptions.profile : this.profile;
        try{
            helper = this.r2factory.getHelperFor(pFile);
            if(helper==null){
                helper = await this.analyzeFileAsync(pFile, profile);
            }else{
                Logger.info("[NATIVE ANALYSZER] RadareHelper found for "+pFile.getUID()+": "+helper.target.getPath());
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
                         Logger.info("[DB::FUNC] add func : ", vFn.signature(), " ", vFn.name);
                    })
                }

            })();

        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] "+err.message)

        }

        return helper;
    }

    async analyzeFileAsync(pFile:ModelFile, pProfile:NativeAnalyzerProfile):Promise<RadareHelper>{
        let helper:RadareHelper;
        try{

            if(!this.r2factory.isOpened(pFile)){
                helper = this.r2factory.newLocalInstance(pFile);
            }else{
                helper = this.r2factory.getHelperFor(pFile);
            }

            const n = await helper.start(pProfile);

            //Logger.info("[DB::FUNC] executed cmd : "+n);
            if(n){
                pFile.getFunctions().map( (vFn:ModelFunction) => {
                    this.db.funcs.addEntry(vFn.signature(), vFn);
                    Logger.info("[DB::FUNC] add func : ", vFn.signature(), " ", vFn.name);
                })

                return helper
            }else{

                return helper
            }


        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] "+err.message)
            return null;
        }
    }

    getHelperForFunc(pFunc:ModelFunction):RadareHelper {

        let file = pFunc.getDeclaringFile();
        if(typeof file === 'string'){
            file = this.context.dataAnalyzer.findFile(file)

            if(file != null){
                pFunc.setDeclaringFile(file);
            }


            return this.r2factory.getHelperFor(file as ModelFile);
        }else if(ModelFile.TYPE.is(file)){
           return this.r2factory.getHelperFor(file as ModelFile);
        }else{
            throw NativeAnalyzerException.CANNOT_DISASS_VOLATILE();
        }
    }
    /**
     *
     * @param pFunc
     * @param pCommands
     * @param pProfile
     */
    async analyzeFunction(pFunc:ModelFunction, pCommands:string[], pProfile:NativeAnalyzerProfile):Promise<any>{

        let helper:RadareHelper;
        try{

            helper = this.getHelperForFunc(pFunc); //this.r2factory.getHelperFor(pFunc.getDeclaringFile() as ModelFile);

            if(helper==null){
                Logger.error("[NATIVE ANALYZER] Helper for function '"+pFunc.getSignature()+"' is not found ");
                return null;
            }

            const n = await helper.runCmd(pCommands, {
                fn: pFunc
            });

            //Logger.info("[DB::FUNC] executed cmd : "+n);
            if(n){
                Logger.info("[NATIVE ANALYZER] Function '"+pFunc.getSignature()+"' has been successfully analyzed ");
                return true;
            }else{
                Logger.error("[NATIVE ANALYZER] Analysis of function '"+pFunc.getSignature()+"' failed ");
                return false;

            }


        }catch (err) {
            Logger.error("[NATIVE ANALYZER] "+err.message, err.stack)
            return false;
        }

        return true;
    }

    analyzeMemory():void{

    }
}