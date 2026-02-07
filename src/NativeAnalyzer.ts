import SmaliParser from "./SmaliParser.js";
import AnalyzerDatabase from "./AnalyzerDatabase.js";
import DexcaliburProject from "./DexcaliburProject.js";
import {SearchAPI} from "./SearchAPI.js";
import * as Log from './Logger.js';
import RadareFactory from "./R2Factory.js";
import RadareHelper from "./R2Helper.js";
import ModelFile from "./ModelFile.js";
import Platform from "./platform/Platform.js";
import DataScope from "./DataScope.js";
import {ModelFunction} from "./ModelFunction.js";
import {ABI} from "./binary/ABI.js";
import {Workflow} from "./Workflow.js";
import {NativeAnalyzerProfile} from "./NativeAnalyzerProfile.js";
import AndroidNativeAnalyzerProfile from "./android/analyzer/AndroidNativeAnalyzerProfile.js";
import IosNativeAnalyzerProfile from "./ios/analyzer/IosNativeAnalyzerProfile.js";
import {NativeAnalyzerException} from "./errors/NativeAnalyzerException.js";
import {AnalyzerState} from "./AnalyzerState.js";
import {IDbCollection, Tag} from "@dexcalibur/dexcalibur-orm";
import {ProjectDatabase} from "./database/ProjectDatabase.js";
import {MetadataType} from "./audit/common/Metadata.js";
import {MetadataTopic} from "./audit/common/ControlAssessment.js";
import {STATE_PPTS} from "./Analyzer.js";
import {NativeAnalyzerCommands} from "./analyzer/NativeAnalyzerCommands.js";
import {EmulatorConfig} from "./emulator/EmulatorConfig.js";
import {MemoryAddress} from "./memory/MemoryAddress.js";
import {ModelRegister} from "./elixir/ModelRegister.js";
import ModelCpuInstruction from "./ModelCpuInstruction.js";
import {Architecture} from "./Architecture.js";
import {RegisterType} from "./elixir/common.js";
import {R2CmdResult} from "./external/R2Pipe.js";
import {Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {AbiException} from "./errors/AbiException.js";
import * as _path_ from "path";
import {IExternalNativeBackend} from "./binary/IExternalNativeBackend.js";
import {INativeHelper} from "./analyzer/INativeHelper.js";
import ModelCall from "./ModelCall.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export enum NativeBackend {
    R2="radare2",
    GHIDRA='ghidra',
    IDA='ida',
    BINARY_NINJA='bin_binja'
}

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
     * @type {Record<string, ModelFile[]>}
     * @field
     */
    targets:Record<string, ModelFile[]> = {};

    /**
     * List of analyzable files grouped per scope
     *
     * @type {Record<string, ModelFile[]>}
     * @field
     */
    targetable:Record<string, ModelFile[]> = {};

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

        if(this.state.state[STATE_PPTS.FILES_PROCESSED]!=null){
            if(this.targets==null || !Array.isArray(this.targets.all)){
                this.targets = {
                    all: []
                };
            }

            let fuid:string;
            for(let i=0; i<this.state.state[STATE_PPTS.FILES_PROCESSED].length; i++){

                fuid = this.state.state[STATE_PPTS.FILES_PROCESSED][i];
                this.context.getMerlinEngine().file({
                    _uid: fuid,
                }).executePDB(this.context).then((vFile)=>{
                    if(vFile.count()>0){
                        this.targets.all.push(vFile.get(0));
                    }else{
                        console.log(`File ${fuid} not found`);
                    }
               })
            }
        }


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
    getAnalyzedFiles(pScope:DataScope = null):ModelFile[]{
        return this.targets.all; //[pScope.getName()];
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
                'Mach-O': this.context.getTagManager().getTag("data.type.MachO")
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
                        Logger.debug("[NATIVE] ",pFile.getRelativePath()," ",JSON.stringify(this.abi)," ",this.isAbiCompliant( pFile, this.abi)+"");
                        const o:number = this.isAbiCompliant(pFile, this.abi); // (this.profile as AndroidNativeAnalyzerProfile).isAbiCompliant( pFile, this.abi);


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

                    }
            }
        });

        console.log("TARGETABLE > ",targetable);


        // analyze gathered files
        let exists:boolean;
        for(const fname in targetable){
            // keep the file with the prefered ABI
            const prefered = targetable[fname].sort( (a,b)=> (a.pref < b.pref)).pop();
            if(prefered != null){

                const file:ModelFile = prefered.file;
                exists = false;
                this.targetable[pScope.getName()].map(x => {
                    if(x.getUID()==file.getUID()){
                        exists = true;
                    }
                });

                if(exists) break;

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

        if(this.targets.hasOwnProperty('all')){
            const targeted = this.targets.all.find( (pF:ModelFile) => {
                if(pF.getUID()==pFile.getUID()){
                    return true;
                }
            });
            return (targeted == null);
        }else{
            this.targets.all = [];
            return true;
        }

        /*
        if(!this.r2factory.isOpened(pFile)){
            return true;
        }else{
            return (this.r2factory.getHelperFor(pFile).isReadyFor(pCommands,pOptions)===false);
        }*/
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

            const res  = await helper.runCmd(pCommands, pOptions);
            i = res.length;

        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] scan : "+err.message);
            i = -1;
        }
        return i;
    }

    /*
    analyzeFile(pFile:ModelFile, pProfile:NativeAnalyzerProfile):RadareHelper{
        let helper:RadareHelper;
        try{

            if(!this.r2factory.isOpened(pFile)){
                helper = await this.r2factory.newLocalInstance(pFile);
            }else{
                helper = this.r2factory.getHelperFor(pFile);
            }

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


        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] "+err.message)

        }

        return helper;
    }*/

    /**
     *
     * @param pFile
     * @param pProfile
     */
    async analyzeFileAsync(pFile:ModelFile, pProfile:NativeAnalyzerProfile):Promise<RadareHelper>{
        let helper:RadareHelper;
        try{

            if(!this.r2factory.isOpened(pFile)){
                helper = await this.r2factory.newLocalInstance(pFile);
            }else{
                helper = this.r2factory.getHelperFor(pFile);
            }

            const n = await helper.start([]);

            //Logger.info("[DB::FUNC] executed cmd : "+n);
            if(n){
                pFile.getFunctions().map( (vFn:ModelFunction) => {
                    this.db.funcs.addEntry(vFn.signature(), vFn);
                    Logger.info("[DB::FUNC] add func : ", vFn.signature(), " ", vFn.name);
                })

                //pFile.tagAs('$r');
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
        if(file !=null){
            const node = await this.context.merlin.file({ _uid: file._uid }).executePDB(this.context);

            if(node==null || node.count()==0){
                throw NativeAnalyzerException.MISSING_FILE(file._uid);
            }
            /*if(node != null){s
                pFunc.setDeclaringFile(node);
            }*/

            let helper:any = this.r2factory.getHelperFor(node.get(0));

            if(helper==null){
                helper = await this.getHelper(node.get(0));
                await helper.start([]);
            }

            return helper;

        }else {
            throw NativeAnalyzerException.CANNOT_DISASS_VOLATILE();
        }
    }
    /**
     *
     * @param pFunc
     * @param pCommands
     * @param pProfile
     */
    async analyzeFunction(pFunc:ModelFunction, pCommands:string[], pProfile:NativeAnalyzerProfile)
            :Promise<{ success:boolean, results:Nullable<R2CmdResult[]> }>{

        let helper:RadareHelper;
        let n:R2CmdResult[] = null;

        try{

            helper = await this.getHelperForFunc(pFunc); //this.r2factory.getHelperFor(pFunc.getDeclaringFile() as ModelFile);

            if(helper==null){
                Logger.error("[NATIVE ANALYZER] Helper for function '"+pFunc.getSignature()+"' is not found ");
                return null;
            }

            n = await helper.runCmd(pCommands, {
                fn: pFunc
            });

            let updatePpt:string[] = [];
            for(let i=0;i<pCommands.length;i++){
                switch (pCommands[i]){
                    case NativeAnalyzerCommands.FUNC_CMD.DECOMPILE:
                        updatePpt.push('dec');
                        break;
                    case NativeAnalyzerCommands.FUNC_CMD.DISASS:
                        updatePpt.push('instr');
                        break;
                }
            }

            if(updatePpt.length>0){
                await this.context.getProjectDB().save(pFunc, ModelFunction.TYPE.getType(), updatePpt);
            }

            let success = true;
            n.map(x => success = success && x.success);

            //Logger.info("[DB::FUNC] executed cmd : "+n);
            if(success){
                Logger.info("[NATIVE ANALYZER] Function '"+pFunc.getSignature()+"' has been successfully analyzed ");
                return {
                    success: true,
                    results: n
                };
            }else{
                Logger.error("[NATIVE ANALYZER] Analysis of function '"+pFunc.getSignature()+"' failed ");
                return {
                    success: false,
                    results: n
                };

            }


        }catch (err) {
            Logger.error("[NATIVE ANALYZER] "+err.message, err.stack)
            return  {
                success: false,
                results: n
            };
        }
    }

    analyzeMemory():void{

    }

    isReadyFor(pFile:ModelFile, pCommands:string[], pOptions:any):boolean {
        if(!this.r2factory.isOpened(pFile)){
            return true;
        }else{
            return (this.r2factory.getHelperFor(pFile).isReadyFor(pCommands,pOptions)===false);
        }
    }

    /**
     * DEfault backend is R2, but different backend (ghidra, ida, binary ninja) could be configured

     * @param pFile
     */
    async getHelper(pFile:ModelFile, pBackend:NativeBackend = NativeBackend.R2):Promise<INativeHelper> {
        switch (pBackend){
            case NativeBackend.BINARY_NINJA:
            case NativeBackend.GHIDRA:
            case NativeBackend.IDA:
                throw NativeAnalyzerException.BACKEND_NOT_SUPPORTED(pBackend);
                break;
            case NativeBackend.R2:
            default:
                if(!this.r2factory.isOpened(pFile)){
                    return await this.r2factory.newLocalInstance(pFile);
                }else{
                    return this.r2factory.getHelperFor(pFile);
                }
                break;
        }

        return null;
    }

    /**
     * To discover a new file, known as an executable file
     *
     * Disass, extract various info and more
     *
     * @method
     */
    async discover(pFile:ModelFile, pBackend = "radare2"):Promise<any> {
        let helper:any;
        try{

            helper = await this.getHelper(pFile);

            const res = await helper.start([]);

            if(res.success){
                // discover functions
                const funcs = await helper.listFunctions();

                if(funcs.length>0){
                    Logger.info("[NATIVE ANALYZER] "+funcs.length+` functions have been successfully analyzed in : ${pFile.getRelativePath()}`);
                    await this._pdb.saveMany(funcs, ModelFunction.TYPE.getType());
                }else{
                    Logger.error(`[NATIVE ANALYZER] No functions found  in : ${pFile.getRelativePath()}`);
                }


                // discover sections
                const sections = await helper.listSections();

                Logger.info("[NATIVE ANALYZER] "+sections.length+` sections have been successfully analyzed in : ${pFile.getRelativePath()}`);

                pFile.appendFunctions(funcs);
                pFile.setProgramSection(sections);
                //pFile.addTag(this.context.getTagManager().getTag("analyzed.native_func"))
                //pFile.addTag(this.context.getTagManager().getTag("analyzed.sections"))

                // discover sections
                const segs = await helper.listSegments();

                Logger.info("[NATIVE ANALYZER] "+segs.length+` segments have been successfully analyzed in : ${pFile.getRelativePath()}`);
                pFile.setSegments(segs);

                await this.markAsProcessed(pFile);

                // save file
                await this._pdb.save(pFile, ModelFile.TYPE.getType(), ['__p','sections','segments']);

                // discover strings
                const strings = await helper.listStrings();
                if(strings.length>0){
                    try{
                        await this._pdb.updateStrings(strings);
                    }catch (es){
                        Logger.error("[NATIVE ANALYZER] Strings cannot be saved successfully for : "+pFile.getRelativePath());
                        console.error(es.stack);
                    }
                }else{
                    Logger.warn("[NATIVE ANALYZER] No strings found in : "+pFile.getRelativePath());
                }

                // discover syscalls
                const sc = await helper.listSyscalls();
                if(sc.length>0){
                    try{
                        await this._pdb.saveMany(sc, ModelCall.TYPE.getType());
                    }catch (es){
                        Logger.error("[NATIVE ANALYZER] Syscalls cannot be saved successfully for : "+pFile.getRelativePath());
                        console.error(es.stack);
                    }
                }else{
                    Logger.warn("[NATIVE ANALYZER] No syscalls found in : "+pFile.getRelativePath());
                }


                // discover cross refs

                // discover JNI
            }

            if(this.state.state.openedLib.indexOf(pFile.getUID())==-1){
                this.state.state.openedLib.push(pFile.getUID());
                await this.state.save();
            }


        }catch (err) {
            Logger.error("[R2 HELPER][ERROR] "+err.message)
            console.error(err);

        }

        return helper;
    }


    /**
     * to create or update a function
     *
     * @param pFn
     * @param pSet
     */
    async saveFunction(pFn:ModelFunction, pSet:string[]=[]):Promise<ModelFunction> {
        if(pSet.length>0){
            return await this._pdb.save(pFn, { [ModelFunction.TYPE.getPrimaryKey().getName()]: pFn.getUID() }, pSet ) as ModelFunction;
        }else{
            return await this._pdb.save(pFn) as ModelFunction;
        }
    }

    /**
     *
     * @param pScope
     * @param pFile
     * @param pAction
     */
    isEligibleTo(pScope:DataScope, pFile: ModelFile, pAction:string):boolean {

        switch (pAction){
            case 'discovery':
                // discovery action is performed on packages, on some platforms, as Android,
                // files targeting differents ABI can be present. Then, they must be filtered
                if(pScope.getInternalName()== "PKG"){
                    Logger.info("[NATIVE] ",pFile.getRelativePath()," ",JSON.stringify(this.abi)," ",this.isAbiCompliant( pFile, this.abi)+"");
                    const o:number = this.isAbiCompliant( pFile, this.abi);

                    if(o>-1){
                        pFile.addTag(this.fmt_tags[pFile.type]);
                        pFile.addMeta(
                            MetadataType.TEXT,
                            MetadataTopic.PREFERED_ABI,
                            o
                        );
                        return true;
                    }
                }else{
                    // by default, if ABI compliance check cannot be
                    // based on file path (as into apk), file is considered compliant
                    // todo : add ABI detection or let user force analysis
                    // targetable.push(pFile);

                    // this.targets[pScope.getName()].push(pFile);
                    //pFile.addTag(this.fmt_tags[pFile.type]);
                }
            default:
                false;
        }


        return false;
    }

    /**
     * To verify if the file have been already scanned
     *
     * @param {ModelFile} pModelFile
     */
    hasBeenAnalyzed(pModelFile: ModelFile) {
        const list = this.state.getProperty(STATE_PPTS.FILES_PROCESSED) as string[];
        if(list==null || !Array.isArray(list)){
            return false;
        }else{
            return (list.length>0 && list.indexOf(pModelFile.getUID())>-1);
        }
    }

    /**
     * To mark a file as processed, and skip it when the project is re-open
     *
     * @param {ModelFile} pFile
     */
    async markAsProcessed(pFile: ModelFile):Promise<void> {
        if(!this.hasBeenAnalyzed(pFile)){
            if(this.state.getProperty(STATE_PPTS.FILES_PROCESSED)==null){
                this.state.setProperty(STATE_PPTS.FILES_PROCESSED, []);
            }

            this.state.getProperty(STATE_PPTS.FILES_PROCESSED).push(pFile.getUID());
            await this.state.save();
        }
    }

     async listProcessedFiles():Promise<string[]> {
        const f = await this.state.getProperty(STATE_PPTS.FILES_PROCESSED);
        if(f==null){
            return [];
        }else{
            return f;
        }
     }

    async emulateFunc(pFunc:ModelFunction, pOptions:any = { dir:"up", base: new MemoryAddress(BigInt(0x010000)) }):Promise<any> {

        if(pFunc.instr.length===0){
            throw NativeAnalyzerException.NOT_READY_TO_EMULATE("The target function has no instructions",pFunc.signature());
        }

        // setup func
        const emuConfig = new EmulatorConfig();

        emuConfig.setBaseAddress(pOptions.base);
        emuConfig.addRelativeSession(pFunc.getAddr());

        // retrieve parent file
        let file = pFunc.getDeclaringFile();
        if(file!=null){
            const node = await this.context.merlin.file({ _uid: file._uid }).executePDB(this.context);


            if(node!==null && node.count()>0){
                const decl = node.get(0) as ModelFile;


                emuConfig.addInput(
                    decl,
                    0,
                    decl.getSize(),
                    decl.getName()
                );

                decl.getSections().map(s => {

                    // filter to keep only sections mapped in memory

                    const mb = s.toMemoryBlock(emuConfig.baseAddress, pOptions.dir=="up"?1:-1)
                    mb.mappedData = decl.getUID()+":"+s.getName();

                    emuConfig.addMemory(mb, { align:0x1000 });
                    emuConfig.addInput(
                        decl,
                        s.getVirtualAddr(),
                        s.getSize(),
                        decl.getUID()+":"+s.getName()
                    );
                })
            }
        }


        // set CPU context
        const prjArch = this.context.getArchitectures()[0]
        const cpuCtx = NativeAnalyzer.getCpuContextFor(pFunc, prjArch===null? Architecture.AARCH64 : prjArch);

        for(let rg in cpuCtx){
            emuConfig.cpuContext.push(cpuCtx[rg]);
        }

        console.log(JSON.stringify(emuConfig.toConfigOptions()));

        //
        return emuConfig;
    }

    static getCpuContextFor(pFunc:ModelFunction, pArch:Architecture):Record<string,ModelRegister> {
        let ctx:Record<string,ModelRegister> = {};

        pFunc.getDisassembly().map( (vInstr:ModelCpuInstruction)=>{
            if(vInstr.disasm==null) return;
            switch (pArch){
                case Architecture.AARCH64:
                    const m = [...vInstr.disasm.matchAll(/\b([xw]([0-2]?[0-9]|3[0-1])|[xw]zr|sp)\b/g)];
                    m.map( (v:RegExpMatchArray)=>{
                        if(ctx[v[0]]==null){
                            ctx[v[0]] = new ModelRegister({
                                name: v[0],
                                id: parseInt(v[0].substring(1)),
                                type: RegisterType.CPU
                            });
                        }
                    });
                    break;
            }
        })

        pFunc.args.map(vVar => {
            if(vVar.reg==null || vVar.reg.name=="sp") return;

            if(ctx[vVar.reg.name]==null){
                ctx[vVar.reg.name] = vVar.reg;
            }else if(vVar.reg.initialValue!=null){
                ctx[vVar.reg.name].initialValue = vVar.reg.initialValue;
            }
        });

        pFunc.regvars.map(vVar => {
            if(vVar.reg==null || vVar.reg.name=="sp") return;

            if(ctx[vVar.reg.name]==null){
                ctx[vVar.reg.name] = vVar.reg;
            }else if(vVar.reg.initialValue!=null){
                ctx[vVar.reg.name].initialValue = vVar.reg.initialValue;
            }
        });
        return ctx;
    }

    /**
     * To verify if a file is compatible with a list of ABI
     *
     * It returns the offset of the ABI in the specified list
     *
     *
     * @param {ModelFile} pFile The file to verify
     * @param {ABI[]} pAbiList A list of supported ABI
     * @return {number} Offset of the ABI detected into the specified ABI list (lower offset, is the privilegied version), -1 if not found
     * @method
     */
    isAbiCompliant(pFile:ModelFile, pAbiList:ABI[]):number {

        const execTag = this.context.getTagManager().getTag("data.type.executable");

        if(!execTag.match(pFile)){
            throw AbiException.UNDETECTABLE_ABI('File is not tagged as executable');
        }

        if(pAbiList.length == 0){
            return -1;
        }

        // Future split using DataScope's path separator instead of serparator from host
        const rpath = pFile.getRelativePath();
        let alt:string[];
        let offset = -1;

        if(rpath == null){
            throw AbiException.UNDETECTABLE_ABI('File path is empty');
        }

        const s = rpath.split(_path_.sep);

        if(s[1]==='lib' && s[2]!=null){
            const top = pAbiList.length-1;

            for(let i=0; i<=top; i++){
                if(pAbiList[i]==null) continue;

                switch (this.context.os) {
                    case OperatingSystem.ANDROID:
                        alt = AndroidNativeAnalyzerProfile.abiFolders[pAbiList[i].name];
                        break;
                    default:
                        alt = [pAbiList[i].name];
                        break;
                }


                if(alt==null) continue;

                for(let j=0; j<alt.length; j++){
                    if(alt[j] === s[2]){
                        offset = top-i;
                        break;
                    }
                }
            }
        }else{
            // todo : check by extracting ABI version from ELF header
            offset = 0;
        }
        return offset;
    }
}