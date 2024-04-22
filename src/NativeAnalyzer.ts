import SmaliParser from "./SmaliParser.js";
import AnalyzerDatabase from "./AnalyzerDatabase.js";
import DexcaliburProject from "./DexcaliburProject.js";
import {SearchAPI} from "./SearchAPI.js";
import * as Log from './Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

import RadareFactory from "./R2Factory.js";
import RadareHelper from "./R2Helper.js";
import ModelFile from "./ModelFile.js";
import Platform from "./Platform.js";
import DataScope from "./DataScope.js";
import {ModelFunction} from "./ModelFunction.js";
import {ABI} from "./binary/ABI.js";
import {Workflow} from "./Workflow.js";
import {NativeAnalyzerProfile} from "./NativeAnalyzerProfile.js";
import AndroidNativeAnalyzerProfile from "./android/analyzer/AndroidNativeAnalyzerProfile.js";
import IosNativeAnalyzerProfile from "./ios/analyzer/IosNativeAnalyzerProfile.js";
import {NativeAnalyzerException} from "./errors/NativeAnalyzerException.js";
import {AnalyzerState} from "./AnalyzerState.js";
import {IDatabase, IDbCollection, Tag} from "@dexcalibur/dexcalibur-orm";
import {ProjectDatabase} from "./database/ProjectDatabase.js";
import {Nullable} from "./core/IStringIndex.js";


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


    private _pdb:ProjectDatabase;

    state:AnalyzerState = null;

    finder:SearchAPI = null;
    encoding:BufferEncoding= null;

    scope:ModelFile[] = [];

    /**
     * List of analyzed files grouped per scope
     *
     * @type {NativeFileList}
     * @field
     */
    targets:NativeFileList = {};

    /**
     * List of analyzable files grouped per scope
     *
     * @type {NativeFileList}
     * @field
     */
    targetable:NativeFileList = {};

    r2factory: RadareFactory=null;
    context:DexcaliburProject = null;

    profile:NativeAnalyzerProfile = null;

    arch:string = '';
    fmt:string[] = [];

    /**
     * List of ABI supported by this instance
     *
     * @type {NativeFileList}
     * @field
     */
    abi:ABI[] = null;

    _wf:Workflow;

    waitQueue:ModelFile[] = [];
    private fmt_tags: { [fmt:string]: Tag } = {};
    /**
     *
     * @param {string} pEncoding
     * @param {SearchAPI} pSearchAPI
     * @param {DexcaliburProject} pProject
     * @constructor
     */
    constructor( pProject:DexcaliburProject = null, pDB:AnalyzerDatabase) {

        this.r2factory = new RadareFactory(pProject);

        // Internal DB
        this.db = pDB;

        // temporary, in memory, database
        this.tempDB = new AnalyzerDatabase(pProject, 'inmemory');

        this.context = pProject;
        this.finder = pProject.find; //pSearchAPI; // pSearchAPI

        this._pdb = pProject.getProjectDB();
    }

    /**
     * To restore the analyzer state
     *
     * @param {AnalyzerState} pState
     */
    restoreState(pState:AnalyzerState):boolean {


        this.state = pState;

        if(this.state.state.openedLib==null) this.state.state.openedLib = [];

        Logger.info("[NATIVE ANALYZER] Restoring state : "+JSON.stringify(this.state.state));
        this.state.state.openedLib.map((pFileUID: string) => {

            Logger.info("[NATIVE ANALYZER] Restoring file : "+pFileUID);
            const file = this.context.getSearchEngine().get.files(pFileUID);

            if (file != null) {
                Logger.info("[NATIVE ANALYZER] Add file to analysis queue : "+file.getUID());
                this.waitQueue.push(file);

                //Logger.info("[NATIVE ANALYZER] Analyzing file : "+file.getUID());
                //this.analyzeFile(file, this.profile);
                //file.tagAs('$r');
                //this.context.dataAnalyzer.getIndex(file.getScope()).updateEntry(file);
                //this.targets[file.getScope().getName()].push(file);
            }else{
                Logger.info("[NATIVE ANALYZER] File '"+pFileUID+"' cannot be analyzed : file not found")
            }
        });

        return true;
    }

    setWorkflow(pWF:Workflow){
        this._wf = pWF;
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
     * To get the list of analyzed file only per scope
     *
     * @param {DataScope} pScope
     */
    getAnalyzedFiles(pScope:DataScope):ModelFile[]{
        return this.targets[pScope.getName()];
    }

    /**
     * To get the list of file analyzable/analyzed per scope
     *
     * @param {DataScope} pScope
     */
    getAnalyzableFiles(pScope:DataScope):ModelFile[]{
        return this.targetable[pScope.getName()];
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
            this.fmt_tags = {
                ELF: this.context.getTagManager().getTag("data.type.ELF")
            };
            this.profile = PROFILES.ANDROID_LIB;
            this.abi = pABI;
        }
        else if(pPlatform.isIOS()){
            this.fmt = ['Mach-O'];
            this.fmt_tags = {
                'Mach-O': this.context.getTagManager().getTag("data.type.Mach-O")
            };
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

    isFileAnalyzed(pFile:ModelFile|string):boolean {
        return (this.state.state.openedLib.indexOf(
            ((typeof pFile)==='string')? pFile : (pFile as ModelFile).getUID()
        )>-1);

    }

    /**
     * To check if a file is in the wait queue
     *
     * @param {ModelFile} pFile
     * @private
     */
    private _isInWaitQueue( pFile:ModelFile):boolean {
        for(let i=0; i<this.waitQueue.length; i++){
            if(this.waitQueue[i].getUID()===pFile.getUID()){
                return true;
            }
        }
        return false;
    }

    /**
     * To remove a file from the wait queue
     *
     * @param {ModelFile} pFile
     * @private
     */
    private _removeFromWaitQueue( pFile:ModelFile):void {
        this.waitQueue = this.waitQueue.filter( (f:ModelFile)=> (f.getUID()!==pFile.getUID()));
    }

    /**
     * To scan all acceptable files into given scope
     *
     * @param pScope
     * @param pOptions
     */
    async asyncScanFileByScope(pScope:DataScope, pProfile:NativeAnalyzerProfile=null, pOptions:any = {}):Promise<boolean> {


        Logger.info("[NATIVE ANALYSIS][asyncScanFileByScope] Scanning scope : ",pScope.getIndexName()," ",pScope.getBasePath());

        if(!this.targets.hasOwnProperty(pScope.getName()))
            this.targets[pScope.getName()] = [];

        if(!this.targetable.hasOwnProperty(pScope.getName()))
            this.targetable[pScope.getName()] = [];

        let idx:IDbCollection =  await this.context.getDataAnalyzer().getIndex(pScope);


        const supported_fmt = Object.keys(this.fmt_tags);
        const targetable_tag = this.context.getTagManager().getTag("analyzer.native.targetable");
        const profile = pProfile!=null ? pProfile : this.profile;

        const targetable:any = {};



        Logger.info(`[NATIVE ANALYSIS][asyncScanFileByScope]  Supported files : ${supported_fmt}`)
        // gather targetable file
        idx.map( (pOffset:number, pFile:ModelFile) => {

            Logger.debug(`[NATIVE ANALYSIS][asyncScanFileByScope] Scanning file from (scope:${pScope.getName()})[type=${pFile.type}] : ${pFile.getRelativePath()}`);

            if(supported_fmt.indexOf(pFile.type)>-1){

                const fn:string = pFile.getName();

                //pFile.addTag()
                // ABI detected into file
                // File is receivable if ABI is determined by file path if the scope is APK
                //if(this.profile.name == PROFILES.ANDROID_LIB.name){
                    if(pScope.getInternalName()== "PKG"){
                        Logger.debug("[NATIVE] ",pFile.getRelativePath()," ",JSON.stringify(this.abi)," ",this.profile.isAbiCompliant( pFile, this.abi)+"");
                        const o:number = (this.profile as AndroidNativeAnalyzerProfile).isAbiCompliant( pFile, this.abi);

                        if(o>-1){
                            if(targetable[fn] == null){
                                targetable[fn] = [];
                            }
                            targetable[fn].push({ pref:o, file:pFile})

                            pFile.addTag(this.fmt_tags[pFile.type]);
                        }
                    }else{
                        // by default, if ABI compliance check cannot be
                        // based on file path (as into apk), file is considered compliant
                        // todo : add ABI detection or let user force analysis
                        // targetable.push(pFile);

                        // this.targets[pScope.getName()].push(pFile);
                        if(targetable[fn] == null){
                            targetable[fn] = [];
                        }

                        targetable[fn].push({ pref:targetable[fn].length, file:pFile});

                        pFile.addTag(this.fmt_tags[pFile.type]);


                        /* if(pOptions==null || !pOptions.skipAuto){
                            this.analyzeFile(pFile, profile);
                        }else{
                            Logger.info("[ANALYZER] Native analysis of "+pFile.getRelativePath()+" has been skipped by configuration (#1)");
                        }*/
                    }
                //}
            }
        });

        console.log("TARGETABLE > ",targetable);


        // analyze gathered files
        for(const fname in targetable){
            // keep the file with the prefered ABI
            const prefered = targetable[fname].sort( (a,b)=> (a.pref < b.pref)).pop();
            if(prefered != null){

                const file:ModelFile = prefered.file;
                file.addTag(targetable_tag);
                this.targetable[pScope.getName()].push(file)

                // save file
                await this.context.getProjectDB().save(file);

                if(pOptions==null || !pOptions.skipAuto){
                    // default analysis
                    await this.analyzeFileAsync(file, profile);
                    // updated the list of analyzed file per scope
                    this.targets[pScope.getName()].push(file)

                }else if(this._isInWaitQueue(file)){
                    // remove the file from the queue
                    this._removeFromWaitQueue(file);
                    // analyze file
                    await this.analyzeFileAsync(file, profile);
                    // updated the list of analyzed file per scope
                    this.targets[pScope.getName()].push(file)

                }else{
                    Logger.info("[NATIVE ANALYZER] Native analysis of "+file.getRelativePath()+" has been skipped by configuration (#2)");
                }

            }else{
                Logger.error(`[NATIVE ANALYZER] Compliant ABI are detected , but none are preferred [file=${fname}, ABIs=${JSON.stringify(this.abi)}, pref=${prefered.pref}`);
            }

        }


        return true;
    }

    /**
     * To scan all acceptable files into given scope
     *
     * @param pScope
     * @param pOptions
     */
    async scanFileByScope(pScope:DataScope, pProfile:NativeAnalyzerProfile=null, pOptions:any = {}):Promise<void> {

        const da = this.context.getDataAnalyzer();

        Logger.info("[NATIVE ANALYSIS] Scanning scope : ",pScope.getIndexName()," ",pScope.getBasePath());

        if(!this.targets.hasOwnProperty(pScope.getName()))
            this.targets[pScope.getName()] = [];

        if(!this.targetable.hasOwnProperty(pScope.getName()))
            this.targetable[pScope.getName()] = [];

        let idx:IDbCollection = await da.getIndex(pScope);

        const profile = pProfile!=null ? pProfile : this.profile;

        const targetable:any = {};

        // gather targetable file
        idx.map( (pOffset:number, pFile:ModelFile) => {

            Logger.debug(`[NATIVE ANALYSIS] Scanning file from (scope:${pScope.getName()}) : ${pFile.getRelativePath()}`);

            if(this.fmt.indexOf(pFile.type)>-1){

                const fn:string = pFile.getName();

                // ABI detected into file
                // File is receivable if ABI is determined by file path if the scope is APK
                //
                if(this.profile.name == PROFILES.ANDROID_LIB.name){
                    if(pScope.getInternalName()== "PKG"){
                        Logger.info("[NATIVE] ",pFile.getRelativePath()," ",JSON.stringify(this.abi)," ",this.profile.isAbiCompliant( pFile, this.abi)+"");
                        const o:number = (this.profile as AndroidNativeAnalyzerProfile).isAbiCompliant( pFile, this.abi);

                        if(o>-1){
                            if(targetable[fn] == null){
                                targetable[fn] = [];
                            }
                            targetable[fn].push({ pref:o, file:pFile})
                        }
                    }else{
                        // by default, if ABI compliance check cannot be
                        // based on file path (as into apk), file is considered compliant
                        // todo : add ABI detection or let user force analysis
                        // targetable.push(pFile);

                        // this.targets[pScope.getName()].push(pFile);
                        if(targetable[fn] == null){
                            targetable[fn] = [];
                        }

                        targetable[fn].push({ pref:targetable[fn].length, file:pFile});



                        /* if(pOptions==null || !pOptions.skipAuto){
                            this.analyzeFile(pFile, profile);
                        }else{
                            Logger.info("[ANALYZER] Native analysis of "+pFile.getRelativePath()+" has been skipped by configuration (#1)");
                        }*/
                    }
                }
            }
        });


        // analyze gathered files
        for(const fname in targetable){
            // keep the file with the prefered ABI
            const prefered = targetable[fname].sort( (a,b)=> (a.pref < b.pref)).pop();
            if(prefered != null){

                const file:ModelFile = prefered.file;

                this.targetable[pScope.getName()].push(file)

                if(pOptions==null || !pOptions.skipAuto){
                    // default analysis
                    this.analyzeFile(file, profile);
                    // updated the list of analyzed file per scope
                    this.targets[pScope.getName()].push(file)

                }else if(this._isInWaitQueue(file)){
                    // remove the file from the queue
                    this._removeFromWaitQueue(file);
                    // analyze file
                    this.analyzeFile(file, profile);
                    // updated the list of analyzed file per scope
                    this.targets[pScope.getName()].push(file)

                }else{
                    Logger.info("[NATIVE ANALYZER] Native analysis of "+file.getRelativePath()+" has been skipped by configuration (#2)");
                }

            }else{
                Logger.error(`[NATIVE ANALYZER] Compliant ABI are detected , but none are preferred [file=${fname}, ABIs=${JSON.stringify(this.abi)}, pref=${prefered.pref}`);
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

    /**
     * To perform analysis of native file accordingly to a specified
     * analyzer profile (mainly one per architecture/technologies/target)
     *
     * @param pProfile
     */
    async scanAllFilesAsync(pProfile:NativeAnalyzerProfile = null):Promise<boolean>{

        if(!this.targets.hasOwnProperty('all'))
            this.targets.all = [];


        const profile = pProfile!=null ? pProfile : this.profile;
        let success = true;

        this._wf.computeStepUp(this.db.files.size());
        this.db.files.map( async (pOffset:number, pFile:ModelFile) => {

            if(this.fmt.indexOf(pFile.type)>-1){
                this.targets.all.push(pFile);

                const h = await this.analyzeFileAsync(pFile, profile);
                success = success && (h!=null ? true : false);
            }
        });

        return success;
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

            //pFile.tagAs('$r');
            ( async ()=>{
                const n = await helper.start(pProfile);

                Logger.info("[DB::FUNC] executed cmd : "+n);
                if(n){
                    pFile.getFunctions().map( (vFn:ModelFunction) => {
                        this.db.funcs.addEntry(vFn.signature(), vFn);
                         Logger.info("[DB::FUNC] add func : ", vFn.signature(), " ", vFn.name);
                    });


                    Logger.info("[DB::FUNC]File flagged analyzed : ", pFile.getUID());
                    if(this.state.state.openedLib.indexOf(pFile.getUID())==-1){
                        this.state.state.openedLib.push(pFile.getUID());
                        await this.state.save();
                    }
                }

            })();

        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] "+err.message)

        }

        return helper;
    }

    /**
     *
     * @param pFile
     * @param pProfile
     */
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

                pFile.tagAs('$r');
                if(this.state.state.openedLib.indexOf(pFile.getUID())==-1){
                    this.state.state.openedLib.push(pFile.getUID());
                    await this.state.save();
                }
                return helper
            }else{

                return helper
            }


        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] "+err.message)
            return null;
        }
    }

    async getHelperForFunc(pFunc:ModelFunction):Promise<RadareHelper> {

        let file = pFunc.getDeclaringFile();
        if(typeof file === 'string'){
            file = await this.context.dataAnalyzer.findFile(file)

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

            helper = await this.getHelperForFunc(pFunc); //this.r2factory.getHelperFor(pFunc.getDeclaringFile() as ModelFile);

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