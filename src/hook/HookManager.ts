import * as co from 'co';

import HookSession from "../HookSession.js";
import DexcaliburProject from "../DexcaliburProject.js";
import HookPrologue from "../HookPrologue.js";
import HookSet from "../HookSet.js";
import Hook from "../Hook.js";
import {Device} from "../Device.js";
import Util from "../Utils.js";
import ModelMethod from "../ModelMethod.js";
import * as Log from '../Logger.js';
import FridaHelper from "../FridaHelper.js";
import {User} from "../User.js";
import {ModelFunction} from "../ModelFunction.js";
import {HookManagerException} from "../errors/HookManagerException.js";
import HookScriptBuilder from "./HookScriptBuilder.js";
import KeyPointManager from "./KeyPointManager.js";
import KeyPoint, {KeyPointRole} from "./KeyPoint.js";
import JavaMethodHook from "./JavaMethodHook.js";
import NativeFunctionHook from "./NativeFunctionHook.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {AbstractHook} from "./AbstractHook.js";
import {HookBuilder} from "./builders/HookBuider.js";
import {HookDbApi} from "./HookDbApi.js";
import HookStrategy from "./HookStrategy.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import HookWorkspace, {HookWorkspaceState, ScriptCompilerOutput} from "./HookWorkspace.js";
import {DeviceManagerException} from "../errors/DeviceManagerException.js";
import * as Frida from 'frida';
import {RuntimeEvent} from "./RuntimeEvent.js";
import HookMessageV2 from "./HookMessageV2.js";
import HookFragmentPreset from "./HookFragmentPreset.js";
import {TagHashMap} from "../tags/TagManager.js";
import SystemCallHook from "./SystemCallHook.js";
import ModelSyscall from "../ModelSyscall.js";
import {CryptoUtils} from "../CryptoUtils.js";
import {ScriptBuilderOptions, TargetLanguage} from "./common.js";
import ModelFile from "../ModelFile.js";
import Inspector from "../Inspector.js";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException.js";
import DeviceManager from "../DeviceManager.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import AndroidInputProfile from "../android/profiles/AndroidInputProfile.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;


let FRIDA = null;


export enum HOOK_TYPE {
    NONE,
    AFTER= 0x1,
    BEFORE= 0x2,
    OVERLOAD= 0x3
}

export enum FRIDA_MODE {
    NONE,
    SPAWN,
    ATTACH_GADGET,
    ATTACH_APP,
    ATTACH_PID,
    INJECTED
}

export enum HOOKSESSION_CACHE_POLICY {
    NONE,
    FLUSH_SESSIONS,
    STORE_SESSIONS
}

export interface HookSetList {
    [id :string] :HookSet
}

export interface HookOptions {
    loadKP?:KeyPoint,
    unloadKP?:KeyPoint,
    location?:string,
    weight?:number,
    behavior?:any,
    lib?:string,
    file?:string,
    ptr_mode?:string
}

export type HookManagerLifecycleCB =  ((vHM:HookManager,vSess:HookSession)=>boolean);

interface HookManagerLifecycleHooks {
    sessionStart: HookManagerLifecycleCB[],
    sessionStop: HookManagerLifecycleCB[],
}

export const CUSTOM_HOOKSET_JAVA = "customJava";
export const CUSTOM_HOOKSET_NATIVE = "customNative";
export const CUSTOM_HOOKSET_OBJC = "customObjc";


/**
 * 
 *
 * @param {DexcaliburProject} ctx The project instance
 * @param {Boolean} nofrida If equals to 1 then the Frida script will not be loaded and Frida library not include  
 */
export class HookManager
{

    static SUPPORTED:string[] = ["java", "native", "instr", "syscall", /* "objc", "react", "js", "flutter",*/];

    db:HookDbApi = null;

    presets:HookFragmentPreset;

    context:DexcaliburProject = null;
   // logs = [];

    jhooks:JavaMethodHook[] = [];
    nhooks:NativeFunctionHook[] = [];
    shooks:SystemCallHook[] = [];


    /**
     * @deprecated
     */
    hooks:Hook[] = [];

    hooksets:HookSetList = {};
    prologues:HookPrologue[] = [];
    sessions:HookSession[] = [];

    /**
     * @deprecated
     */
    listeners:any = {};

    options:any = {
        followThread: false,
        followFork: false,
        cache_policy: HOOKSESSION_CACHE_POLICY.STORE_SESSIONS
    };


    kp_mgr:KeyPointManager;
    hk_builder:HookBuilder = null;
    builder:HookScriptBuilder = null;

    scanners:any = {}; // deprecated

    _sess = null;
    frida_disabled = false;
    private _sessTags: TagHashMap = null;

    _on:HookManagerLifecycleHooks;


    constructor(pProject:DexcaliburProject, pNofrida=false){

        this.context = pProject;
        if(pNofrida===false){
            /*( async ()=>{
                FRIDA = await import("frida");
            })();*/
            //FRIDA = require("frida");
            //FRIDA_LOAD = require("frida-load");
        }else{
            this.frida_disabled = true;
        }

        this.kp_mgr = pProject.getKeyPointManager();
        this.hk_builder = new HookBuilder( this.context );
        this.builder = new HookScriptBuilder( this );
        this.db = new HookDbApi(pProject.getProjectDB());
        this.presets = new HookFragmentPreset();

        this._on = {
            sessionStart:  [],
            sessionStop:  []
        };

        this._on.sessionStart.push((vMgr:HookManager,vSess:HookSession):boolean => {
            console.log("OnSessionStart trigged", vMgr.context);
             vMgr.context.trigger({
                 type: "action.input.record.start",
                    data: {
                        dev: vSess.getDeviceUID(),
                        session: vSess
                    }
             });
             return true;
        });

        this._on.sessionStop.push((vMgr:HookManager,vSess:HookSession):boolean => {
            console.log("OnSessionStart trigged");
            vMgr.context.trigger({
                type: "action.input.record.stop",
                data: {
                    dev: vSess.getDeviceUID(),
                    session: vSess
                }
            });
            return true;
        });
    }

    /**
     * To get key point manager
     */
    getKeyPointManager():KeyPointManager {
        return this.kp_mgr;
    }

    getDbAPI():HookDbApi {
        return this.db;
    }

    updateOptions( pName:string, pOpt:any):void {
        switch (pName) {
            case 'cache_policy':
                this.setCachePolicy(parseInt(pOpt));
                break;
            case 'followThread':
                this.options.followThread = (pOpt==true);
                break;
            case 'followFork':
                this.options.followFork = (pOpt==true);
                break;
            default:
                throw HookManagerException.OPTION_NOT_SUPPORTED(pName);
                break;
        }
    }

    /**
     * To load all hookset and Java hook from the db
     *
     * TODO : make it dependent of target app/platform (android or not)
     *
     * @method
     * @since 1.0.0
     */
    async load():Promise<void>{

        this.jhooks = await this.db.getAllJavaHook();
        this.jhooks.map( h => {
            h.setManager(this)
        });

        this.hooksets = await this.db.sets.getAll() ;

        //this.jhooks = this.db.jhooks.getAsList();
        Logger.info(`[HOOK MANAGER] Load complete { java=${this.jhooks.length}, native=${this.nhooks.length}, sets=${Object.keys(this.hooksets).length}   }`);
    }

    /**
     * To load all native hook from the db
     *
     * TODO : make it dependent of target app/platform (android or not)
     *
     * @method
     * @since 1.0.0
     */
    async loadNativeHook():Promise<void>{

        // get previously parsed lib

        // load native hooks
        this.nhooks = await this.db.getAllNativeHook(); //nhooks.getAsList();
        this.nhooks.map( h => {
            h.setManager(this);
        });
    }

    /**
     *
     */
    async initBuiltInHookSets():Promise<void>{

        // do if platform supports ( java / native / obj / kotlin ) ... add Hookset ...

        if(!await  this.db.isHookSetExists(CUSTOM_HOOKSET_JAVA)){
            //if(this.context.platform.isAndroid()){
            await this._addHookSet(new HookSet({
                id: CUSTOM_HOOKSET_JAVA,
                name: "Custom Java hooks",
                context: this.context,
                enable: true
            }));
            //}
        }


        if(!await this.db.isHookSetExists(CUSTOM_HOOKSET_NATIVE)){
            await this._addHookSet(new HookSet({
                id: CUSTOM_HOOKSET_NATIVE,
                name: "Custome native hooks",
                context: this.context,
                enable: true,
                native: true
            }));
        }
    }


    getSupportedHookTypes():string[] {
        return HookManager.SUPPORTED;
    }


    hasActiveInstructionHook():boolean {
        // TODO: implement instruction hooking
        return false;
    }

    /**
     * To verify if a key point depends (so has an ancestor at runtime)
     * of another key point by using its name
     *
     * @param {KeyPoint} pKeyPoint
     * @param {string} pAncestorUID
     */
    hasKeyPointAncestor( pKeyPoint:KeyPoint, pAncestorUID:string):boolean{
        let k:KeyPoint = pKeyPoint;
        let found = false;

        while(k.hasAncestor()){
            k = k.getAncestor();
            if(k.getUID() === pAncestorUID){
                found = true;
                break;
            }
        }

        return found;
    }

    /**
     * To create a new hook set
     *
     * @param pId
     * @param pOptions
     */
    async createHookSet(pId:string, pOptions:any={}):Promise<HookSet> {
        //let hs:HookSet = await this.getHookSet(pId);

        //if(hs==null){
            Logger.debug("NEW "+pId+" "+((pOptions.hasOwnProperty('name')? pOptions.name : pId))+" => "+JSON.stringify(pOptions));

            const hs = new HookSet({
                id: pId,
                name: (pOptions.hasOwnProperty('name')? pOptions.name : pId),
                context: this.context,
                description: (pOptions.hasOwnProperty('description') ? pOptions.description : ""),
                enable: (pOptions.hasOwnProperty('enable')? pOptions.enable : true),
                native: (pOptions.hasOwnProperty('native')? pOptions.native : false),
                builtin: (pOptions.hasOwnProperty('builtin')? pOptions.builtin : false),
                color: (pOptions.hasOwnProperty('color')? pOptions.color : {})
            });
            for(const k in pOptions) hs[k] = pOptions[k];

            // console.log(await this._addHookSet(hs));
            // console.log(hs);
            return hs;
    }

    registerHookSet(pHookSet:HookSet):void {
        return ;
    }

    /**
     * To get a stragtegy by its uid
     * @param pUID
     */
    async getHookStrategy(pUID:string):Promise<HookStrategy> {
        return this.db.getStrategy(pUID) ;
    }

    /**
     * To get all hook strategies
     * @param pUID
     */
    async getHookStrategies():Promise<HookStrategy[]> {
        return this.db.strategies.getAsList();
    }

    /*createHookStrategy( pStrategy:HookStrategy):boolean {
        return this.getDbAPI().createHookStrategy(pStrategy);
    }*/

    /**
     * To create hookset for each DEX file or binary file analyzed
     */
    async updateBuiltinHookset():Promise<void> {
        // create a hook set per DEX file, it mus be
        // this.context.analyze.getDexFiles();

        // create a hook set per native file into the project
        const natives = this.context.analyze.getNativeAnalyzer().getTargetFiles();
        let file:ModelFile;
        for(let i=0; i<natives.length; i++){
            file = natives[i];
            const hs = await this.getHookSet(file.getName());
            if(hs==null){
                await this._addHookSet(new HookSet({
                    id: file.getName(),
                    name: file.getName(),
                    context: this.context,
                    enable: true
                }))
            }
        }

    }

    /**
     * To flush generated code from existing hooks
     *
     * It is mandataory to update hook script when HookScriptBuilder
     * is updated
     *
     * @param pType
     */
    flushGeneratedCode(pType = "all"):void {
        if(pType==="all"){
            this.getHooks().map(x => {
                x.setGeneratedCode(null);
            });
            return;
        }

        switch (pType){
            case "java": this.jhooks.map(x => x.setGeneratedCode(null)); break;
            case "native": this.nhooks.map(x => x.setGeneratedCode(null)); break;
            case "syscall": this.shooks.map(x => x.setGeneratedCode(null)); break;
            //case "java": this.jhooks.map(x => x.setGeneratedCode(null)); break;
        }

    }

    /**
     * To get frida_disabled status.
     * 
     * @return {Boolean} Frida-feature status
     * @method
     */
    isFridaDisabled():boolean{
        return (this.frida_disabled===true);
    }

    /**
     * To print help into CLI
     * 
     * @method
     */
    help():void{
        console.log(`Module :
            NativeObserver
            Reflect
            RootBypass`);
    }

    /*
     * @deprecated
     */
    /*refreshScanner(){

        let self = this;
        UT.forEachFileOf(
            Path.join(Util.__dirname(import.meta.url), "..", "scanner"),
            function(path,file){
                let s = file.substr(0,file.lastIndexOf("."));
                if(self.scanners[s]==null){
                    self.scanners[s] = require(path);
                    self.scanners[s].injectContext(self.context);
                    Logger.info("[HookManager:refreshScanner] New scanner added : "+s);
                }
            },false);
    }*/



    /**
     * To build global hook scripts from declared and enabled hooks/inspectors.
     *
     * It should be adapted to support native/ios hooks
     * 
     * @returns {String} Hook script
     * @method
     * @deprecated
     */
    async prepareHookScript():Promise<string>{
        let script = `Java.perform(function() {
            
        `;

        // include hookset requirements
        //if(this.requiresNode.length > 0)
        //   script = this.prepareRequiresNode()+"\n"+script;
        
        //script += this.prepareRequires();
        
        for(const i in this.prologues){
            if(await this.prologues[i].isEnable()){
                script += this.prologues[i].builtScript;
            }
        }


        for(const i in this.hooks){
            if(this.hooks[i].isEnable()){
                if(this.hooks[i].hasVariables()){
                    script += this.hooks[i].setupVariables();                
                }
                script += this.hooks[i].script;
            }
        }

        script += "});"
        return script;
    }

    /**
     * To build the Frida's agent script
     *
     * @return {string}
     * @method
     */
    async buildAgentScript(pOptions:ScriptBuilderOptions = {}, pSkipTS = false):Promise<ScriptCompilerOutput> {
        let script:string = null;
        const ws:HookWorkspace = this.context.getWorkspace().getHookWorkspace();
        let compilerOutput:ScriptCompilerOutput;

        //try{
        script = await this.builder.build(pOptions);
        //console.log(script);

        Logger.info("[HOOK MANAGER] Hook script template built")
        ws.writeDefaultScript(script, this.builder.getLanguage());

        if(this.builder.getLanguage()==TargetLanguage.JS){
            compilerOutput = await  ws.compileDefaultScript();
            Logger.debug("[HOOK MANAGER] Hook script built and compiled successfully.")
        }else{
            compilerOutput = await ws.compileTsScript();
            Logger.debug("[HOOK MANAGER] TS target : frida compile done.");
        }

        return compilerOutput;
    }

    setCachePolicy( pPolicy:any):void{
        this.options.cache_policy = pPolicy;
    }

    mustFlushCache():boolean{
        return (this.options.cache_policy == HOOKSESSION_CACHE_POLICY.FLUSH_SESSIONS);
    }

    private _initMessageTags() {
        const mgr = this.context.getTagManager();
        this._sessTags =  {
            HOOK: mgr.getTag('runtime.msg.hook'),
            HOOK_ERR: mgr.getTag('runtime.msg.hk_err'),
            FRAG_ERR: mgr.getTag('runtime.msg.fr_err'),
            FS: mgr.getTag('runtime.msg.fs'),
            MEM: mgr.getTag('runtime.msg.mem'),
            TEE: mgr.getTag('runtime.msg.tee'),
            CERT: mgr.getTag('runtime.msg.cert'),
            NETWORK: mgr.getTag('runtime.msg.net'),
            NFC: mgr.getTag('runtime.msg.nfc'),
            BT: mgr.getTag('runtime.msg.bluetooth'),
        }
    }

    /**
     * To get the lis
     */
    getMessageTags():TagHashMap {

        return this._sessTags;
    }

    /**
     * To create a new hook session
     *
     * @returns {HookSession} Current - freshly created - hooking session
     * @method
     */
    async newSession():Promise<HookSession>{
        if(this._sessTags == null){
            this._initMessageTags();
        }

        // Important : not support multi-session


        const last:HookSession = this
            .sessions[this.sessions.length-1];

        const sess:HookSession =new HookSession();
        sess.setHookManager(this);

        // TODO : add configuration flush/keep previous
        if(last != null) last.active = false;

        if(this.mustFlushCache()){
            this.sessions = [];
        }else{
            // backup session and messages
            if(last != null){
                await this.db.updateHookSession(this.sessions[this.sessions.length-1]);
            }
        }


        sess.active = true;
        this.sessions.push(sess);
        await this.db.createHookSession(sess);
        return sess;
    }



    /**
     * To start hooking by spawning the target application
     *  
     * @param {String} pHookScript Hook script
     * @param {String} pAppName Application UID
     * @method
     */
    async startBySpawn(pAppName:string, pSession:HookSession, pHookScript:string= null):Promise<HookSession>{
        return await this.start(pSession, pHookScript, FRIDA_MODE.SPAWN, pAppName);
    }

    /**
     * 
     * @param {*} pAppName 
     * @param {*} pHookScript 
     */
    async startByAttachToGadget(pSession:HookSession, pHookScript:string= null):Promise<HookSession>{
        return await this.start(pSession, pHookScript, FRIDA_MODE.ATTACH_GADGET, "Gadget");
    }

    /**
     * 
     * @param {*} pPID 
     * @param {*} pHookScript 
     */
    async startByAttachTo(pPID:string=null, pSession:HookSession, pHookScript:string= null):Promise<HookSession>{
        return await this.start(pSession, pHookScript, FRIDA_MODE.ATTACH_PID, pPID);
    }

    /**
     * 
     * @param {*} pAppName 
     * @param {*} pHookScript 
     */
    async startByAttachToApp(pAppName:string, pSession:HookSession, pHookScript:string= null):Promise<HookSession>{
        return await this.start(pSession, pHookScript, FRIDA_MODE.ATTACH_APP, pAppName);
    }


    /**
     * To start hooking by spawning the target application
     *
     * @param {String} pHookScript Hook script
     * @param {String} pAppName Application UID
     * @method
     */
    async asyncStartBySpawn(pAppName:string, pSession:HookSession, pHookScript:string= null):Promise<HookSession>{
        return await this.asyncStart(pSession, pHookScript, FRIDA_MODE.SPAWN, pAppName);
    }

    /**
     *
     * @param {*} pAppName
     * @param {*} pHookScript
     */
    async asyncStartByAttachToGadget(pSession:HookSession, pHookScript:string= null):Promise<HookSession>{
        return await this.asyncStart(pSession, pHookScript, FRIDA_MODE.ATTACH_GADGET, "Gadget");
    }

    /**
     *
     * @param {*} pPID
     * @param {*} pHookScript
     */
    async asyncStartByAttachTo(pPID:string=null, pSession:HookSession, pHookScript:string= null):Promise<HookSession>{
        return await this.asyncStart(pSession, pHookScript, FRIDA_MODE.ATTACH_PID, pPID);
    }

    /**
     *
     * @param {*} pAppName
     * @param {*} pHookScript
     */
    async asyncStartByAttachToApp(pAppName:string, pSession:HookSession, pHookScript:string= null):Promise<HookSession>{
        return await this.asyncStart(pSession, pHookScript, FRIDA_MODE.ATTACH_APP, pAppName);
    }



    async saveAll(){
        await this.db.aSave();
    }
    /**
     *
     * @param pObject
     */
    async save( pObject:AbstractHook|JavaMethodHook|NativeFunctionHook|HookStrategy|HookSet|HookTemplateFragment, pCreate = false ):Promise<void>{

        switch (pObject.__) {
            case NodeInternalType.HOOK_JAVA:
                await this.db.updateJavaHook(pObject as JavaMethodHook);
                break;
            case NodeInternalType.HOOK_NATIVE:
                await this.db.updateNativeHook(pObject as NativeFunctionHook);
                break;
            case NodeInternalType.HOOK_STRATEGY:
                await this.db.updateHookStrategy(pObject as HookStrategy);
                break;
            case NodeInternalType.HOOK_SET:
                await this.db.updateHookSet(pObject as HookSet);
                break;
            case NodeInternalType.HOOK_FRAGMENT:
                await this.db.updateFragment(pObject as HookTemplateFragment);
                break;
            default:
                throw HookManagerException.CANNOT_SAVE_UNRECOGNIZED_OBJ();
                break;
        }
    }

    /**
     * To start hooking
     * 
     * start -> script ? -> NO : prepareHookScipt()
     *                   -> YES: use given script
     *       -> 
     
      * @param {*} hook_script  User provided script, can be null
      * @param {*} pType 
      * @param {*} pExtra 
      * @param {*} pDevice 
      * 
      * @method
      */
     async start(pSession:HookSession, hook_script:string, pType:FRIDA_MODE=null, pExtra:any=null, pDevice:Device=null):Promise<HookSession>{
        
        let target:Device = null;
        const PROBE_SESSION:HookSession = pSession; //this.newSession();
        
        if(hook_script == null){
            hook_script = await this.prepareHookScript();
            Logger.debug("[HOOK MANAGER] Prepared script : \n"+hook_script);
        }

        if(this.frida_disabled){
            throw new Error("[HOOK MANAGER] Frida is disabled ! Hook and session prepared but not start() ignored");
            return null;
        } 

        // retrieve default  device from project
        if(pDevice == null){
            target = this.context.getDevice();
        }
        // else, it uses specified device
        else{
            target = pDevice;
        }

        if(target == null){
            Logger.error("[HOOK MANAGER] Device not found. Reconnect your device or select a target device to continue.");
            throw new Error("[HOOK MANAGER] Device not found. Reconnect your device or select a target device to continue.");
            return null;
        }

        // start Frida
        // do spawn + attach
        const hookRoutine:any = co.wrap(function *() {
            let session:any = null, pid:any=null, applications:any=null;
            let device:any = null;

            device = yield FridaHelper.getDevice(target);

            if(device == null){
                Logger.error("[HOOK MANAGER][#2] Device not found. Reconnect your device or select a target device to continue.");
                throw new Error("[HOOK MANAGER][#2] Device not found. Reconnect your device or select a target device to continue.");
                return null;
            }

/*

            bridge = target.getDefaultBridge();
            
            if(bridge.isNetworkTransport()){
                device = yield FRIDA.getDeviceManager().addRemoteDevice(bridge.ip+':'+bridge.port);
            }else{
                device = yield FRIDA.getDevice(bridge.deviceID);
            }
  */          
            
            PROBE_SESSION.fridaDevice = device;

            switch(pType){
                case FRIDA_MODE.SPAWN:
                    pid = yield device.spawn([pExtra]);
                    PROBE_SESSION.pid = pid;
                    
                    session = yield device.attach(pid);
                    PROBE_SESSION.fridaSession = session;

                    Logger.info('spawned:', pid);
                    break;
                case FRIDA_MODE.ATTACH_APP:
                    applications = yield device.enumerateApplications();
                    for(let i=0; i<applications.length; i++){
                        if(applications[i].identifier == pExtra)
                            pid = applications[i].pid;
                    }

                    if(pid > -1) {
                        PROBE_SESSION.pid = pid;
                        session = yield device.attach(pid);
                        PROBE_SESSION.fridaSession = session;

                        Logger.info('attached to '+pExtra+" (pid="+pid+")");
                    }else{
                        throw new Error('Failed to attach to application ('+pExtra+' not running).');
                    }
                    
                    break;
                case FRIDA_MODE.ATTACH_GADGET:
                    applications = yield device.enumerateApplications();
                    if(applications.length == 1 && applications[0].name == "Gadget") {
                        PROBE_SESSION.pid = applications[0].pid;

                        session = yield device.attach(applications[0].pid);
                        PROBE_SESSION.fridaSession = session;

                        Logger.info('attached to Gadget:', pid);
                    }else
                        Logger.error('Failed to attach to Gadget.');

                    break;
                case FRIDA_MODE.ATTACH_PID:
                    PROBE_SESSION.pid = pid;

                    session = yield device.attach(pid);
                    PROBE_SESSION.fridaSession = session;

                    Logger.info('spawned:', pid);
                    break;
                default:
                    Logger.error('Failed to attach/spawn');
                    return;
            }

            const script = yield session.createScript(
                hook_script, {

                });

             // For frida-node > 11.0.2
             script.message.connect((message:string) => {
                PROBE_SESSION.push(message);//{ msg:message, d:data });
                Logger.info('[*] Message:', message);
            });    
            
        
            yield script.load();


            PROBE_SESSION.fridaScript = script;

            Logger.info('script loaded');
            //Logger.debug(script);
            yield device.resume(pid);
            Logger.info('program resumed' );
        });

        hookRoutine()
            .catch(error => {
            Logger.error('error:', error.message);
            });

        return PROBE_SESSION;
    }


    /**
     * To start hooking
     *
     * start -> script ? -> NO : prepareHookScipt()
     *                   -> YES: use given script
     *       ->

     * @param {string} pHookScript User defined script (it can be null)
     * @param {*} pType
     * @param {*} pExtra
     * @param {*} pDevice
     *
     * @method
     */
    async asyncStart(pSession:HookSession, pHookScript:string, pType:FRIDA_MODE=null, pExtra:any=null, pDevice:Device=null, pScriptOpts:any ={}):Promise<HookSession>{

        let target:Device = null;
        let fridaDevice:Frida.Device = null;
        let fridaScript:Frida.Script = null;
        let script:string = pHookScript;
        let session:any = null, pid:any=null, applications:any=null;
        const PROBE_SESSION:HookSession = pSession; //this.newSession();

        // if the script is empty, it must be generated by the hook manager
        if(script == null){
            const compilerOutput = await this.buildAgentScript(
                pScriptOpts,
                (this.builder.getLanguage()==TargetLanguage.TS)
            );

            if(compilerOutput.bundle==null) {
                throw HookManagerException.CANNOT_START_HOOK_BECAUSE_SYNTAX_ERR(compilerOutput);
            }

            script = compilerOutput.bundle;
            // Logger.debug("[HOOK MANAGER] Prepared script : \n"+script);
        }

        if(this.frida_disabled){
            throw new Error("[HOOK MANAGER] Frida is disabled ! Hook and session prepared but not start() ignored");
            return null;
        }

        // retrieve default  device from project
        // else, it uses specified device
        if(pDevice == null){
            target = this.context.getDevice();
        }
        else{
            target = pDevice;
        }

        // link the device to the session
        pSession.setDevice(target);

        if(target == null){
            Logger.error("[HOOK MANAGER] Device not found. Reconnect your device or select a target device to continue.");
            throw DeviceManagerException.DEVICE_NOT_FOUND();
        }

        // start Frida

        fridaDevice = await FridaHelper.getDevice(target);

        if(fridaDevice == null){
            Logger.error("[HOOK MANAGER][#2] Device not found. Reconnect your device or select a target device to continue.");
            throw HookManagerException.FRIDA_DEVICE_NOT_FOUND(target.getUID())
            return null;
        }

        /*

                    bridge = target.getDefaultBridge();

                    if(bridge.isNetworkTransport()){
                        device = yield FRIDA.getDeviceManager().addRemoteDevice(bridge.ip+':'+bridge.port);
                    }else{
                        device = yield FRIDA.getDevice(bridge.deviceID);
                    }
          */

        PROBE_SESSION.fridaDevice = fridaDevice;

        for(let k=0; k<this._on.sessionStart.length;k++){
            if(this._on.sessionStart[k].apply(null,[this,PROBE_SESSION])===false){
                throw HookManagerException.SESSION_INTERRUPTED('start');
            }
        }

        switch(pType){
            case FRIDA_MODE.SPAWN:
                pid = await fridaDevice.spawn([pExtra]);
                PROBE_SESSION.pid = pid;

                Logger.info(`[HOOK MANAGER] async exec [SPAWN][cmd= ${pExtra} ] spawned : ${pid}`);

                session = await fridaDevice.attach(pid);
                PROBE_SESSION.fridaSession = session;

                Logger.info(`[HOOK MANAGER] async exec [SPAWN][cmd= ${pExtra} ] attached : ${pid}`);
                break;
            case FRIDA_MODE.ATTACH_APP:
                applications = await fridaDevice.enumerateApplications();
                for(let i=0; i<applications.length; i++){
                    if(applications[i].identifier == pExtra)
                        pid = applications[i].pid;
                }

                if(pid > -1) {
                    PROBE_SESSION.pid = pid;
                    session = await fridaDevice.attach(pid);
                    PROBE_SESSION.fridaSession = session;

                    Logger.info('attached to '+pExtra+" (pid="+pid+")");
                    Logger.info(`[HOOK MANAGER] async exec [ATTACH_BY_NAME][name=${applications[0].name}] : ${pid}`);
                }else{
                    throw new Error('Failed to attach to application ('+pExtra+' not running).');
                }

                break;
            case FRIDA_MODE.ATTACH_GADGET:
                applications = await fridaDevice.enumerateApplications();
                if(applications.length == 1 && applications[0].name == "Gadget") {
                    PROBE_SESSION.pid = applications[0].pid;

                    session = await fridaDevice.attach(applications[0].pid);
                    PROBE_SESSION.fridaSession = session;

                    Logger.info(`[HOOK MANAGER] async exec [ATTACH_TO_GADGET][name=Gadget] : ${pid}`);
                }else
                    Logger.error('Failed to attach to Gadget.');

                break;
            case FRIDA_MODE.ATTACH_PID:
                PROBE_SESSION.pid = pid;

                session = await fridaDevice.attach(pid);
                PROBE_SESSION.fridaSession = session;

                Logger.info(`[HOOK MANAGER] async exec [ATTACH_BY_PID][pid=${pid}]`);
                break;
            default:
                Logger.error('Failed to attach/spawn');
                return;
        }

        try{
            /*
            if(this.builder.getScriptLanguage()==ScriptLanguage.BYTECODE){
                fridaScript = await session.compileScript(script);
            }else{
                fridaScript = await session.createScript(script);
            }
             */
            fridaScript = await session.createScript(script);
        }catch(err){
            Logger.debug(err.message+"\n",err.stack);

            throw HookManagerException.SCRIPT_SYNTAX_ERROR(this.builder.getLanguage(), err.message);
        }


        //fridaScript = await session.createScript(script);
        Logger.info('[HOOK MANAGER] async exec : script created');

        // For frida-node > 11.0.2
        /*fridaScript.message.connect((message:any) => {
            PROBE_SESSION.push(message);//{ msg:message, d:data });
            Logger.info('[*] Message:', message);
        });*/

        PROBE_SESSION.fridaScript = fridaScript;
        fridaScript.message.connect(this._onScriptMessage.bind(this, PROBE_SESSION));

        Logger.info('[HOOK MANAGER] async exec : handler set');

        await fridaScript.load();
        Logger.info('[HOOK MANAGER] async exec : script loaded, pid='+pid);

        await fridaDevice.resume(pid);
        Logger.info('[HOOK MANAGER] async exec : resume');


        /*
        let isCollectDeviceEvent = true;
        if (isCollectDeviceEvent === true) {
            let deviceBridge = target.getDefaultBridge()
            PROBE_SESSION.launchDeviceEventCollector(deviceBridge);
        }*/

        return PROBE_SESSION;
    }

    _onScriptMessage( pHookSession:HookSession, pMessage:any, pData:any){
        Logger.info('[*] Message: ', JSON.stringify(pMessage));
        if(pMessage.payload!=null)
            pHookSession.push(pMessage.payload);
    }

    private async _addHookSet(pHookSet: HookSet):Promise<boolean>{

         /*if(await this.db.isHookSetExists(pHookSet.getID())){
             throw HookManagerException.EXISTING_HOOK_SET();
         }*/

         await this.db.createHookSet(pHookSet);

         //this.hooksets[pHookSet.getID()] = pHookSet;


         return true;
    }

    async getHookSets():Promise<HookSetList>{
        return await this.db.sets.getAll();
    }

    /**
     * To get the default hook set for on-demand hook
     *
     * @param pNative
     */
    async getDefaultHookSet(pNative=false):Promise<HookSet>{
         if(pNative)
            return await this.db.getHookSet(CUSTOM_HOOKSET_NATIVE);
         else
             return await this.db.getHookSet(CUSTOM_HOOKSET_JAVA);
    }

    async getHookSet(id:string):Promise<HookSet>{
        return await this.db.getHookSet(id);
    }

    /**
     *
     * @deprecated
     * @param hookid
     */
    hasListener(hookid:string){
        return (this.listeners[hookid] != null);
    }

    // add a listener to call when the HookSession receive a HookMessage with match=true
    /**
     * @deprecated
     * @param hookid
     * @param callback
     */
    addMatchListener(hookid:string, callback:any):HookManager{
        if(this.listeners[hookid]==null)
            this.listeners[hookid] = [];

        this.listeners[hookid].push(callback);  
        return this;
    }

    /**
     *
     * @param pHookMessage
     * @deprecated
     */
    trigger(pHookMessage:any):void{

        // INFO : event.hook = HookMessage.hook = msg.id
        const hookid = Util.b64_decode(pHookMessage.hook);
        if(!this.hasListener(hookid)) return ;

        for(let i=0; i<this.listeners[hookid].length; i++){
            this.listeners[hookid][i](this.context,pHookMessage);
        }
    }

    isProbing(method:ModelMethod):boolean{
        for(const i in this.hooks){
            if(this.hooks[i].name == method.signature() && this.hooks[i].enable){
                return true;
            }
        }
        return false;
    }

    /**
     * To get all Java hooks independently of status
     *
     * @return {JavaMethodHook[]} An array of Java hooks
     * @method
     * @since 1.0.0
     */
    getJavaHooks():JavaMethodHook[] {
        return this.jhooks;
    }

    /**
     * To get all Native hooks independently of status
     *
     * @return {NativeFunctionHook[]} An array of Native hooks
     * @method
     * @since 1.0.0
     */
    getNativeHooks():NativeFunctionHook[] {
        return this.nhooks;
    }

    /**
     * To get a hook targeting the specified method of function and according to
     * additional options such as load/unload key points
     *
     * @param {(ModelMethod|ModelFunction)} The target method/function
     * @return {AbstractHook[]} An array of hooks
     * @method
     * @since 1.0.0
     */
    getProbe(method:ModelMethod|ModelFunction, pOptions:any = {}):AbstractHook{
        let h:AbstractHook[] = this.jhooks;
        let hook:AbstractHook = null;
        if(method.__ === NodeInternalType.FUNC){
            h = this.nhooks;
        }

        for(const i in h){
            Logger.raw(JSON.stringify(h[i].toJsonObject()));
            if(h[i].getTarget().getUID() == method.getUID()){
                hook = h[i];
                break;
            }
        }
        if(hook != null){
            if(pOptions.loadKP != null && hook.getLoadKeyPoint() !=null){
                if(hook.getLoadKeyPoint().getUID() !== pOptions.loadKP.getUID()){
                    return null;
                }
            }
            if(pOptions.unloadKP != null && hook.getUnloadKeyPoint() !=null){
                if(hook.getUnloadKeyPoint().getUID() !== pOptions.unloadKP.getUID()){
                    return null;
                }
            }
        }

        return hook;
    }

    /**
     * To get all hooks targeting the specified method of function
     *
     * @param {(ModelMethod|ModelFunction)} The target method/function
     * @return {AbstractHook[]} An array of hooks
     * @method
     * @since 1.0.0
     */

    getProbes(method:ModelMethod|ModelFunction):AbstractHook[]{
        let all:AbstractHook[] = this.jhooks;
        const hooks:AbstractHook[] = [];

        if(method.__ === NodeInternalType.FUNC){
            all = this.nhooks;
        }

        for(const i in all){
            if(all[i].getTarget().getUID() == method.getUID()){
                hooks.push(all[i]);
            }
        }

        return hooks;
    }

    /*
    getProbe(method:ModelMethod|ModelFunction):AbstractHook{
        for(let i in this.hooks){
            if(this.hooks[i].name == method.signature()){
                return this.hooks[i];
            }
        }
        return null;
    }*/

    /**
     * To get all hooks
     * @returns {Hook[]} An array containing all hooks
     */
    getHooks():AbstractHook[]{
        return (this.jhooks as AbstractHook[]).concat(this.nhooks).concat(this.shooks); // this.hooks;
    }

    /**
     * To find a hook by hooked method and key point
     * @param pMethod
     * @param pKeyPoint
     */
    getJavaMethodHook( pMethod:ModelMethod, pKeyPoints:any = {}):JavaMethodHook {
        let hook:JavaMethodHook = null, h:JavaMethodHook = null;
        const kpt = Object.keys(pKeyPoints).length;

        for(let i=0; i<this.jhooks.length; i++){
            h = this.jhooks[i];
            if(h.getTarget().getUID() === pMethod.getUID()){
                if(kpt == 0){
                    hook = h;
                    break;
                }else{
                    for(const kp in pKeyPoints){
                        switch (kp) {
                            case '_loadKp':
                                if(h.getLoadKeyPoint().getUID() === pKeyPoints._loadkp.getUID()){
                                    hook = h;
                                    break;
                                }
                                break;
                            case '_unloadKp':
                                if(h.getUnloadKeyPoint().getUID() === pKeyPoints._unloadkp.getUID()){
                                    hook = h;
                                    break;
                                }
                                break;
                        }
                    }
                    if(hook != null) break;
                }
            }
        }

        return hook;
    }

    /**
     * To find a hook by hooked method and key point
     * @param pMethod
     * @param pKeyPoint
     */
    getNativeFunctionHook( pFunc:ModelFunction, pKeyPoints:any = {}):NativeFunctionHook {
        let hook:NativeFunctionHook = null, h:NativeFunctionHook = null;
        const kpt = Object.keys(pKeyPoints).length;

        for(let i=0; i<this.nhooks.length; i++){
            h = this.nhooks[i];
            if(h.getTarget().getUID() === pFunc.getUID()){
                if(kpt == 0){
                    hook = h;
                    break;
                }else{
                    for(const kp in pKeyPoints){
                        switch (kp) {
                            case '_loadKp':
                                if(h.getLoadKeyPoint().getUID() === pKeyPoints._loadkp.getUID()){
                                    hook = h;
                                    break;
                                }
                                break;
                            case '_unloadKp':
                                if(h.getUnloadKeyPoint().getUID() === pKeyPoints._unloadkp.getUID()){
                                    hook = h;
                                    break;
                                }
                                break;
                        }
                    }
                    if(hook != null) break;
                }
            }
        }

        return hook;
    }



    /**
     * To count hook for a specific node type / target
     * @param pList
     * @param pNode
     * @private
     */
    private _countHook( pList:AbstractHook[], pNode:ModelFunction|ModelMethod|ModelSyscall):number {
        let c = 0;

        for(let i=0; i<pList.length; i++){

            //Logger.info(`[HOOK MANAGER] _countHook( ${JSON.stringify(pList[i])}, ${pNode} )`);
            // if(pList[i].getTarget().getUID() === pNode.getUID()){
            if((pList[i] as any)._uid === pNode.getUID()){
                c++;
            }
        }

        return c;
    }

    /**
     *
     * @param pMethod
     */
    countJavaHook( pMethod:ModelMethod):number {
        return this._countHook(this.jhooks, pMethod);
    }

    /**
     *
     * @param pFun
     */
    countNativeHook( pFun:ModelFunction):number {
        return this._countHook(this.nhooks, pFun);
    }

    /**
     *
     * @param pFun
     */
    countSysCallHook( pSysCall:ModelSyscall):number {
        return this._countHook(this.shooks, pSysCall);
    }

    /**
     * To create an syscall hook
     *
     * TODO : link to DxcAgent
     *
     * @param pAddr
     * @param pOpts
     * @param pKeyPoint
     */
    async createSyscallHook( pSyscall:ModelSyscall, pOpts:any, pKeyPoint:KeyPoint = null):Promise<SystemCallHook> {
        const tmgr = this.context.getTagManager();
        const hook:SystemCallHook = new SystemCallHook();

        hook.setGUID( CryptoUtils.md5(this.nextHookGUIDFor(pSyscall)));

        if(pOpts.loadKP == null){
            hook.setLoadKeyPoint(await this.getKeyPointManager().getKeyPointByAttr({ name:"core.java.app" }));
        }else{

            hook.setLoadKeyPoint(pOpts.loadKP);
        }

        if(pOpts.unloadKP !== null){
            hook.setUnloadKeyPoint(pOpts.unloadKP);
        }

        hook.setContext(this.context);
        hook.setTarget(pSyscall);
        hook.setManager(this);

        //hook.makeProbeFor(method);
        //hook.makeHookFor(method, pOptions);

        //hook.setMethod(method);
        // method.setProbing(true);
        pSyscall.probing = true;
        pSyscall.hooks.push( hook);


        const defaultHS = await this.getDefaultHookSet();
        if(tmgr.getTag("discover.static").match(pSyscall)
            || tmgr.getTag("discover.internal").match(pSyscall)){
            await defaultHS.addHook(hook);
        }else{
            //this.getHookSetFor(method.getDeclaringFile());
            // TODO ?
            await defaultHS.addHook(hook);
        }

        Logger.info("[HOOK MANAGER][NATIVE HOOK] Created successfully : ",hook.getTarget().getUID())
        this.shooks.push(hook);
        await this.save(hook, true);

        // trigger new probe workflow
        this.context.trigger({
            type: "probe.new",
            data: {
                hook: hook,
                func: pSyscall,
                hasUnloadKP: (pOpts.unloadKP !== null)
            }
        });

        return hook;
    }

    /**
     * To create an instruction-level hook
     *
     * TODO
     *
     * @param pAddr
     * @param pOpts
     * @param pKeyPoint
     * @method
     * @since 1.0.0
     */
    createInstructionHook( pAddr:ModelFunction, pOpts:any, pKeyPoint:KeyPoint = null):NativeFunctionHook {
        return null;
    }

    /**
     * To create a native hook targeting the specified function
     *
     * @param {ModelFunction} pFunc Function to hook
     * @param {any} pOpts Hook options
     * @param pKeyPoint
     * @method
     * @since 1.0.0
     */
    async createNativeFunctionHook( pFunc:ModelFunction, pOpts:HookOptions, pKeyPoint:KeyPoint = null):Promise<NativeFunctionHook> {
        const tmgr = this.context.getTagManager();
        const hook:NativeFunctionHook = new NativeFunctionHook();

        hook.setGUID( CryptoUtils.md5(this.nextHookGUIDFor(pFunc)));

        if(pOpts.loadKP == null){
            hook.setLoadKeyPoint(await this.getKeyPointManager().getKeyPointByAttr({name:"core.java.app"}));
        }else{
            hook.setLoadKeyPoint(pOpts.loadKP);
        }

        if(pOpts.unloadKP !== null){
            hook.setUnloadKeyPoint(pOpts.unloadKP);
        }

        hook.setContext(this.context);
        hook.setTarget(pFunc);
        hook.setManager(this);

        //hook.makeProbeFor(method);
        //this.builder.
        //hook.makeHookFor(method, pOptions);

        //hook.setMethod(method);
        // method.setProbing(true);
        pFunc.probing = true;
        pFunc.hooks.push( hook);


        const defaultHS = await this.getDefaultHookSet();
        if(tmgr.getTag("discover.static").match(pFunc)
            || tmgr.getTag("discover.internal").match(pFunc)){
             defaultHS.addHook(hook);
        }else{
            //this.getHookSetFor(method.getDeclaringFile());
            // TODO attach to another set+keypoint
            defaultHS.addHook(hook);
        }

        Logger.info("[HOOK MANAGER][NATIVE HOOK] Created successfully : ",hook.getTarget().getUID())
        this.nhooks.push(hook);
        await this.save(hook, true);

        // trigger new probe workflow
        this.context.trigger({
            type: "probe.new",
            data: {
                hook: hook,
                func: pFunc,
                hasUnloadKP: (pOpts.unloadKP !== null)
            }
        });

        return hook;
    }

    /**
     *
     * To create a java method hook at a specific key point
     *
     * @param {ModelMethod} pMethod
     * @param pKeyPoint
     * @method
     * @since 1.0.0
     */
    async createJavaMethodHook( pMethod:ModelMethod, pOptions:HookOptions = {}):Promise<JavaMethodHook> {
        const tmgr = this.context.getTagManager();
        const hook:JavaMethodHook = new JavaMethodHook();

        hook.setGUID( CryptoUtils.md5(this.nextHookGUIDFor(pMethod)));

        if(pOptions.loadKP == null){
            hook.setLoadKeyPoint(await this.getKeyPointManager().getKeyPointByAttr({ name: "core.java.app" }));
        }else{
            hook.setLoadKeyPoint(pOptions.loadKP);
        }

        if(pOptions.unloadKP !== null){
            hook.setUnloadKeyPoint(pOptions.unloadKP);
        }

        hook.setContext(this.context);
        hook.setTarget(pMethod);
        hook.setManager(this);

        //hook.makeProbeFor(method);
        //this.builder.
        //hook.makeHookFor(method, pOptions);

        //hook.setMethod(method);
        // method.setProbing(true);
        pMethod.probing = true;
        pMethod.hooks.push( hook);


        const defaultHS = await this.getDefaultHookSet();
        if( tmgr.getTag("discover.static").match(pMethod)
            || tmgr.getTag("discover.internal").match(pMethod)){
            defaultHS.addHook(hook);
        }else{
            Logger.info("hook java",JSON.stringify(pMethod));
            //this.getHookSetFor(method.getDeclaringFile());
            defaultHS.addHook(hook);
        }

        Logger.info("[HOOK MANAGER][JAVA HOOK] Created successfully : ",hook.getTarget().getName())
        this.jhooks.push(hook);
        await this.save(hook, true);

        // trigger new probe workflow
        this.context.trigger({
            type: "probe.new",
            data: {
                hook: hook,
                method: pMethod,
                hasUnloadKP: (pOptions.unloadKP !== null)
            }
        });

        return hook;
    }


    /**
     * To get a hook by its ID.
     * 
     * @param {String} id The hook ID as provide by the hook trace
     * @return {Hook} The matching hook, then null. 
     * @function
     */
    getHookByID(guid:string):AbstractHook{

        let hook:AbstractHook = null;

        this.jhooks.map( (vHook:JavaMethodHook)=>{
            if(vHook.getGUID() == guid)
                hook = vHook;
        });

        if(hook != null) return hook;

        this.nhooks.map( (vHook:NativeFunctionHook)=>{
            if(vHook.getGUID() == guid)
                hook = vHook;
        });

        return hook;
    }

    /**
     * To remove permanently a hook.
     *
     * This action cannot be undone
     *
     * @param {AbstractHook} pHook
     * @return {boolean} TRUE if successfully removed, else FALSE
     */
    async removeHook(pHook:AbstractHook):Promise<boolean>{

        const uid = pHook.getGUID();
        let offset = -1;
        let coll:AbstractHook[] = null;
        let type:NodeInternalType = null;


        if(pHook.__ == NodeInternalType.HOOK_NATIVE){//pHook.isTargetNodeType(NodeInternalType.FUNC)){,
            coll = this.nhooks;
            type = NodeInternalType.HOOK_NATIVE;
        }
        else if(pHook.__ == NodeInternalType.HOOK_JAVA){//pHook.isTargetNodeType(NodeInternalType.METHOD)){
            coll = this.jhooks;
            type = NodeInternalType.HOOK_JAVA;
        }

        if(coll==null){
            throw HookManagerException.HOOK_NOT_FOUND(pHook.getGUID());
        }


        let vHook:AbstractHook;
        for(let i=0; i<coll.length; i++){
            vHook = coll[i];
            if(vHook.getGUID() == uid){
                vHook.destroy();
                if(type == NodeInternalType.HOOK_NATIVE){//pHook.isTargetNodeType(NodeInternalType.FUNC)){,
                    coll = this.nhooks;
                    await this.db.removeNativeHook(vHook as NativeFunctionHook);
                }
                else if(type == NodeInternalType.HOOK_JAVA){//pHook.isTargetNodeType(NodeInternalType.METHOD)){
                    coll = this.jhooks;
                    await this.db.removeJavaHook(vHook as JavaMethodHook);
                }
                offset = i;
            }
        }

        /*coll.map( (vHook:AbstractHook, i)=>{
            if(vHook.getGUID() == uid){
                vHook.destroy();
                if(type == NodeInternalType.HOOK_NATIVE){//pHook.isTargetNodeType(NodeInternalType.FUNC)){,
                    coll = this.nhooks;
                    this.db.removeNativeHook(vHook as NativeFunctionHook);
                }
                else if(type == NodeInternalType.HOOK_JAVA){//pHook.isTargetNodeType(NodeInternalType.METHOD)){
                    coll = this.jhooks;
                    this.db.removeJavaHook(vHook as JavaMethodHook);
                }
                offset = i;
            }
        });*/

        if(offset > -1){
            coll.splice(offset, 1);
            return true;
        }else{
            return false;
        }
    }

    /**
     * To get a hook by its ID
     *
     * @param {string} hookId
     */
    findHook(hookId:string):Hook{
        for(const i in this.hooks){
            if(this.hooks[i].id == hookId){
                return this.hooks[i];
            }
        }
        return null;
    }

    /**
     * To retrieve everay hook targeting a method or a function
     * @param method
     */
    findHookByMethod(method:ModelMethod|ModelFunction):Hook[]{
        const match:Hook[] = [];
        for(const i in this.hooks){
            if(this.hooks[i].name == method.signature()){
                match.push(this.hooks[i]);
            }
        }
        return match;
    }

    /**
     * To create the GUID of the next hook
     *
     * @since 1.0.0
     * @param method
     */
    nextHookGUIDFor(pTarget:ModelMethod|ModelFunction|ModelSyscall):string{
        //    return method.__signature__+"@@"+this.findHookByMethod(method).length;
        //Logger.info("[HOOK] nextHookIdFor ["+method.signature()+"]")
        switch (pTarget.__) {
            case NodeInternalType.METHOD:
                return pTarget.__+":"+pTarget.getUID()+"@@"+this.countJavaHook(pTarget as ModelMethod);
                break;
            case NodeInternalType.FUNC:
                return pTarget.__+":"+pTarget.getUID()+"@@"+this.countNativeHook(pTarget as ModelFunction);
                break;
            case NodeInternalType.SYSCALL:
                return pTarget.__+":"+pTarget.getUID()+"@@"+this.countSysCallHook(pTarget as ModelSyscall);
                break;
        }
    }

    /**
     * @deprecated
     * @param method
     */
    nextHookIdFor(method:ModelMethod|ModelFunction):string{
    //    return method.__signature__+"@@"+this.findHookByMethod(method).length;
        //Logger.info("[HOOK] nextHookIdFor ["+method.signature()+"]")
        return method.__+":"+method.signature()+"@@"+this.findHookByMethod(method).length;
    }


    /**
     * @param prologue
     */
    addPrologue(prologue:HookPrologue):void{
        console.log(prologue);
        this.prologues.push(prologue.injectContext(this.context));
    }

    removePrologueOf(pHookSet:HookSet):void{
        const newList:HookPrologue[] = [];
        for(let i=0; i<this.prologues.length; i++){
            if(this.prologues[i].parentID != pHookSet.getID()){
                newList.push(this.prologues[i]);
            }   
        }
        this.prologues = newList;
    }


    removeHooksOf(pHookSet:HookSet):void{
        const newList:Hook[] = [];
        for(let i=0; i<this.hooks.length; i++){
            if(this.hooks[i].parentID != pHookSet.getID()){
                newList.push(this.hooks[i]);
            }   
        }
        this.hooks = newList;
    }

    /**
     * To list hooks
     * 
     * @method
     */
    list():(JavaMethodHook|NativeFunctionHook)[]{

        let hooks:any = this.getJavaHooks();

        hooks = hooks.concat(this.getNativeHooks());
        //hooks = hooks.concat(this.getObjcHooks());
        //hooks = hooks.concat(this.getSyscallHooks());

        return hooks;
    }

    /**
     * To get latest hook session
     * 
     * @returns {HookSession} Latest hook session
     * @method
     */
    lastSession():HookSession{
        if(this.sessions.length == null){
            return null;
        }
        return this.sessions[this.sessions.length-1];
    }

    /**
     * To retrieve all sessions (warning : it can be heavy)
     *
     */
    async getSessions():Promise<HookSession[]>{

        const sess:HookSession[] = await this.db.sessions.getAsList();

        sess.map(x => {
            x.setHookManager(this)
        });

        const lastSess = this.lastSession();
        if(lastSess!=null){
            if((sess.length==0) || ((sess[sess.length]!=null) && (lastSess.getSessionID()!=sess[sess.length].getSessionID()))){
                sess.push(lastSess);
            }
        }

        return sess;
    }

    /**
     * To get a session by UID
     *
     * @param {string} pUID
     */
    async getSession( pUID:string):Promise<HookSession>  {
        let cached:HookSession = null;
        for(let i=0; i<this.sessions.length; i++){
            if(this.sessions[i].getSessionID()===pUID){
                cached =  this.sessions[i];
                break;
            }
        }

        if(cached == null){
            cached = await this.db.getSession(pUID);
            this.sessions.push(cached);
        }

        return cached;
    }
    // HookSession communication


    /**
     * init > new > cmd > exit
     * @param pUser
     * @param pSocket
     * @param pData
     */
    async processCommand( pUser:User, pSocket:any, pData:string):Promise<any>{
        let message:any,  sess:HookSession=null;
        try{
            message = JSON.parse(pData);
            // start a new hook session
            if(message.action=="new"){

                if(message.data.localid == null){
                    throw new Error('Invalid local ID');
                }

                // if a valid session ID is provided, the user is added to
                // owners of this session. TODO : add auditors group
                if(message.data.sessid != null){
                    sess = await this.getSession(message.data.sessid);

                    if(sess != null && sess.isActive()){
                        // check permissions inside
                        sess.addOwner(pUser, message.data.localid);
                    }else{
                        sess = null;
                    }
                }

                // if session id not provided or session is invalid
                /*if(sess == null){
                    // else, create a new session
                    sess = await this.newLocalSession(
                        this.validateType(message.data.type)
                        // , pUser.getACL(TERMINAL_NEW_LOCAL)
                    );

                    sess.addOwner(pUser, message.data.localid);
                }*/


                if(sess != null){

                    Logger.info('[WEBSOCKET] Sending new session data [SESSID=',sess.getSessionID(),']');
                    pSocket.sendUTF(JSON.stringify({action:'new', data:{
                            success: true,
                            msg: 'Session opened :)',
                            localid: message.data.localid,
                            sessid: sess.getSessionID()
                        }}));
                }else{
                    Logger.error('[WEBSOCKET] Session not initialized.')
                }

            }
            /*lse if(message.action=="cmd"){
                sess = this.getSession(message.data.sessid);
                if(sess == null)
                    throw new Error('Session not found');

                if(!sess.isActive())
                    throw new Error('Session has been closed');

                if(message.data.stdin == null)
                    throw new Error('Command cannot be empty');

                sess.sendCommand(pSocket, message.data.stdin);
            }
            /*else if(message.action=="exit"){
                sess = this.getSession(message.data.sessid);
                if(sess == null)
                    throw new Error('Session not found');

                if(sess.isExited())
                    throw new Error('Session has been closed');

                sess.exit(pSocket);
            }*/
            //
            else if(message.action=="start"){

                let sess:HookSession = null;
                let script:string = null;

                Logger.info(`[HOOK MANAGER][WEBSOCKET][cmd=start]`);
                try{

                    sess = await this.newSession();
                    sess.addOwner( pUser, message.data.localid, pSocket);

                    if((message.data.script != null) && (message.data.script.length>0)){
                        script = message.data.script;
                    }

                    switch(message.data.type){
                        case "spawn-self":
                            Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [app=${this.context.getPackageName()}, type=spawn-self]`);
                            sess = await this.asyncStartBySpawn(this.context.getPackageName(), sess, script);
                            break;
                        case "spawn":
                            Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [app=${message.data.app}, type=spawn]`);
                            sess = await this.asyncStartBySpawn(message.data.app, sess, script);
                            break;
                        case "attach-gadget":
                            Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [pid=Gadget, type=attach-gadget]`);
                            sess = await this.asyncStartByAttachToGadget(sess, script);
                            break;
                        case "attach-app-self":
                            Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [app=${this.context.getPackageName()}, type=attach-app-self]`);
                            sess = await this.asyncStartByAttachToApp(this.context.getPackageName(), sess, script);
                            break;
                        case "attach-app":
                            Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [app=${message.data.app}, type=attach-app-x]`);
                            sess = await this.asyncStartByAttachToApp(message.data.app, sess, script);
                            break;
                        case "attach-pid":
                            Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [pid=${message.data.pid}, type=attach-to-pid`);
                            sess = await this.asyncStartByAttachTo(message.data.pid, sess, script );
                            break;
                        default:
                            Logger.error('[HOOK MANAGER] Invalid start type');
                            throw  new Error('[HOOK MANAGER] Invalid start type' );
                            break;
                    }

                    //                    sess.addOwner()
                    pSocket.sendUTF(JSON.stringify({
                        action:'start',
                        svc:"hookm",
                        data: {
                            success: true,
                            localid: message.data.localid,
                            sessid: (sess!=null ? sess.getSessionID() : null)
                        }
                    }));
                }catch(exception){
                    Logger.error("[HOOK MANAGER] processCommand [cmd=start] : "+exception.toString()+" \n "+exception.stack);
                    Logger.raw(JSON.stringify(exception));

                    let extra:any = null;
                    if(exception.getCode!=null && exception.getCode()==HookManagerException.ERR.CANNOT_START_HOOK_BECAUSE_SYNTAX_ERR){
                        extra = (exception as HookManagerException).getExtra();
                    }

                    pSocket.sendUTF(JSON.stringify({
                        action:'start',
                        svc:"hookm",
                        data: {
                            success: false,
                            extra: extra,
                            msg: exception.message,
                            localid: message.data.localid,
                            sessid: null
                        }
                    }));
                }


            }
            else if(message.action=="conn-last"){

                pSocket.sendUTF(JSON.stringify({
                    action:'init',
                    svc:"hookm",
                    data: {
                        localid: message.data.localid,
                        sessid:this.lastSession().getSessionID()
                    }
                }));
            }
            else if(message.action=="init"){
                if(this.lastSession())
                    pSocket.sendUTF(JSON.stringify({
                        action:'init',
                        svc:"hookm",
                        data: {
                            localid: message.data.localid,
                            sessid:this.lastSession().getSessionID()
                        }
                    }));
            }
        }catch(err){
            Logger.error("[HOOK MANAGER] processCommand : \n"+err.toString());
            pSocket.sendUTF(JSON.stringify({action:'err', data:{
                    msg: err.toString()
                }}));
        }
    }





    /**
     *
     * @param pKeyPoint
     */
    private _getHookByKeyPointWithRole( pKeyPoint:KeyPoint, pRole:KeyPointRole):AbstractHook[] {

        let fn:any;
        switch (pRole) {
            case KeyPointRole.LOAD:
                fn = "getLoadKeyPoint";
                break;
            case KeyPointRole.UNLOAD:
                fn = "getUnloadKeyPoint";
                break;
            default:
                fn = "getKeyPoint";
                break;
        }
        const hk:AbstractHook[] = [];
        const uid = pKeyPoint.getUID();
        let hook:AbstractHook;
        let kp:KeyPoint;

        for(let i=0; i<this.jhooks.length; i++) {
            hook = this.jhooks[i];

            kp = hook[fn].apply(hook, []);
            if (kp != null && kp.getUID() == uid)
                hk.push(hook);

        }


        for(let i=0; i<this.nhooks.length; i++){
            hook = this.nhooks[i];
            kp = hook[fn].apply(hook, []);
            if(kp!=null && kp.getUID() == uid)
                hk.push(hook);
        }


        return hk;
    }

    /**
     *
     * @param pKeyPoint
     */
    getHookByKeyPoint( pKeyPoint:KeyPoint):AbstractHook[] {
        return this._getHookByKeyPointWithRole( pKeyPoint, KeyPointRole.ANY);
    }

    /**
     *
     * @param pKeyPoint
     */
    getHookByLoadKeyPoint( pKeyPoint:KeyPoint):AbstractHook[] {
        return this._getHookByKeyPointWithRole( pKeyPoint, KeyPointRole.LOAD);
    }


    /**
     *
     * @param pKeyPoint
     */
    getHookByUnloadKeyPoint( pKeyPoint:KeyPoint):AbstractHook[] {
        return this._getHookByKeyPointWithRole( pKeyPoint, KeyPointRole.UNLOAD);
    }

    /**
     * To check if the hook workspace of the project is ready
     *
     * @private
     */
    private _isHookWsReady():boolean{
        return this.context.getWorkspace().getHookWorkspace().isReady();
    }


    /**
     * To push the event into global pipe.
     *
     * The hook manager will complete object according to fragment / hook / strategies
     *
     * @param  {RuntimeEvent} pEvent
     * @param  {boolean} pEmit TRUE to emit runtime event on main bus, FALSE to prevent.
     */
    newRuntimeEvent(pEvent: RuntimeEvent<HookMessageV2>, pEmit:boolean) {

        // multi-thread it ?
        const msg:HookMessageV2 = pEvent.getMessage();
        const frag = msg.getFragment();

        if(pEvent.isNotError() && frag!=null){
            if(frag.isPreProcessed() && frag.getStrategy()!=null){
                if(frag.getStrategy().onMatch != null){
                    frag.getStrategy().onMatch.apply(this.context, pEvent);
                }
            }
        }

        if(pEmit){
            this.context.bus.send(pEvent);
        }
    }


    /**
     * To get the list of hooks filtered by specified inspector
     *
     * @param {Inspector} pInspector Parent of fragments included into hooks to search
     * @return {AbstractHook[]} The list of matching hooks
     * @method
     */
    getHooksByInspector( pInspector:Inspector):AbstractHook[] {

        const frags = [];
        let matches:AbstractHook[] = [];

        pInspector.getHookSet().strats.map( (x:HookStrategy) => {
            if(x.before != null) frags.push(x.before.getUID());
            if(x.after != null) frags.push(x.after.getUID());
            if(x.replace != null) frags.push(x.replace.getUID());
        })

        // filter hooks by fragment UID
        this.getHooks().map( (h:AbstractHook)=>{
            const hf = [h.getBefore(),h.getAfter(),h.getReplace()];
            for(let j=0; j<3; j++){
                for(let i=0; i<hf[j].length; i++){
                    if( frags.indexOf(hf[j][i].getUID())>-1){
                        matches.push(h);
                        return ;
                    }
                }
            }
        });

        // deduplicate
        const h = [];
        matches = matches.filter( (vHook:AbstractHook)=>{
            if(h.indexOf(vHook.getGUID())==-1){
                h.push(vHook.getGUID());
                return true;
            }else
                return false;
        })

        return matches;
    }

    /**
     * To get workspace state
     */
    getWorkspaceState():HookWorkspaceState {
        return {
            commit: this.context.getWorkspace().getHookWorkspace().getLastcommit()
        };
    }

    /**
     * To get all enabled prologues, else all prologues
     * if `pAll` is TRUE
     *
     * @param {boolean} pAll Optional. Default is FALSE
     * @returns {HookPrologue[]} A list of prologue
     * @method
     */
    async getPrologues(pAll = false):Promise<HookPrologue[]> {

        /*
        if(!pAll){
            const pro:HookPrologue[] = [];

            for(let i=0; i<this.prologues.length; i++){
                if((await this.getHookSet(this.prologues[i].parentID)).enable){
                    pro.push(this.prologues[i]);
                }
            }

            return pro;
        }else{
            return this.prologues;
        }*/

        for(let i=0; i<this.prologues.length; i++){
            try{
                console.log(this.prologues[i].parentID, (await this.getHookSet(this.prologues[i].parentID)).enable);
            }catch (e){}

        }

        return this.prologues;
    }


    // hook
    onSessionStart( pCallback:((vMgr:HookManager, vSess:HookSession)=>boolean) ){
        this._on.sessionStart.push(pCallback);
    }

    onSessionStop( pCallback:((vMgr:HookManager, vSess:HookSession)=>boolean) ){
        this._on.sessionStop.push(pCallback);
    }
}
