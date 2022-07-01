import * as co from 'co';
import * as md5 from 'md5';

import HookSession from "../HookSession";
import DexcaliburProject from "../DexcaliburProject";
import HookPrologue from "../HookPrologue";
import HookSet from "../HookSet";
import Hook from "../Hook";
import {Device} from "../Device";
import Util from "../Utils";
import ModelMethod from "../ModelMethod";
import * as Log from '../Logger';
import FridaHelper from "../FridaHelper";
import {TerminalSession} from "../TerminalSession";
import {User} from "../User";
import {ModelFunction} from "../ModelFunction";
import {HookManagerException} from "../errors/HookManagerException";
import HookScriptBuilder from "./HookScriptBuilder";
import KeyPointManager from "./KeyPointManager";
import KeyPoint, {KeyPointRole} from "./KeyPoint";
import JavaMethodHook from "./JavaMethodHook";
import NativeFunctionHook from "./NativeFunctionHook";
import {NodeInternalType} from "../NodeInternalType";
import {AbstractHook} from "./AbstractHook";
import {HookBuilder} from "./builders/HookBuider";
import {HookDbApi} from "./HookDbApi";
import HookStrategy from "./HookStrategy";
import HookTemplateFragment from "./HookTemplateFragment";
import HookWorkspace from "./HookWorkspace";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


var FRIDA = null;


export enum HOOK_TYPE {
    NONE,
    AFTER= 0x1,
    BEFORE= 0x2,
    OVERLOAD= 0x3
};

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
    FLUSH_SESSIONS
}

export interface HookSetList {
    [id :string] :HookSet
}


export const CUSTOM_HOOKSET_JAVA = "customJava";
export const CUSTOM_HOOKSET_NATIVE = "customNative";
export const CUSTOM_HOOKSET_OBJC = "customObjc";
/**
 * 
 * @param {DexcaliburProject} ctx The project instance
 * @param {Boolean} nofrida If equals to 1 then the Frida script will not be loaded and Frida library not include  
 */
export class HookManager
{
    cache_policy:number = HOOKSESSION_CACHE_POLICY.NONE;
    db:HookDbApi = null;

    context:DexcaliburProject = null;
   // logs = [];

    jhooks:JavaMethodHook[] = [];
    nhooks:NativeFunctionHook[] = [];

    hooks:Hook[] = [];

    hooksets:HookSetList = {};
    prologues:HookPrologue[] = [];
    sessions:HookSession[] = [];
    listeners:any = {};

    options:any = {
        followThread: false,
        followFork: false
    };


    kp_mgr:KeyPointManager = null;
    hk_builder:HookBuilder = null;
    builder:HookScriptBuilder = null;

    scanners:any = {}; // deprecated

    _sess = null;
    frida_disabled:boolean = false;

    /**
     * 
     * @param {*} pProject 
     * @param {*} nofrida 
     * @constructor
     */
    constructor(pProject:DexcaliburProject, pNofrida:boolean=false){

        this.context = pProject;
        if(pNofrida===false){
            FRIDA = require("frida");
            //FRIDA_LOAD = require("frida-load");
        }else{
            this.frida_disabled = true;
        }

        this.kp_mgr = pProject.getKeyPointManager();
        this.hk_builder = new HookBuilder( this.context );
        this.builder = new HookScriptBuilder( this );
        this.db = new HookDbApi(pProject.getDB());

        this.initBuiltInHookSets();
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
        this.options[pName] = pOpt;
    }

    /**
     * To load all hookset and Java hook from the db
     *
     * TODO : make it dependent of target app/platform (android or not)
     *
     * @method
     * @since 1.0.0
     */
    load(){

        this.jhooks = this.db.jhooks.getAsList();
        this.jhooks.map( h => {
            //Logger.info(h.getTarget().getUID())
            h.setManager(this)
        });

        this.hooksets = this.db.sets.getAll();
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
    loadNativeHook(){

        // get previously parsed lib

        // load native hooks
        this.nhooks = this.db.nhooks.getAsList();
        this.nhooks.map( h => {
            h.setManager(this);
        });
    }

    private initBuiltInHookSets(){

        // do if platform supports ( java / native / obj / kotlin ) ... add Hookset ...

        if(!this.db.isHookSetExists(CUSTOM_HOOKSET_JAVA)){
            //if(this.context.platform.isAndroid()){
            this._addHookSet(new HookSet({
                id: CUSTOM_HOOKSET_JAVA,
                name: "Custom Java hooks",
                context: this.context,
                enable: true
            }));
            //}
        }


        if(!this.db.isHookSetExists(CUSTOM_HOOKSET_NATIVE)){
            this._addHookSet(new HookSet({
                id: CUSTOM_HOOKSET_NATIVE,
                name: "Custome native hooks",
                context: this.context,
                enable: true,
                native: true
            }));
        }
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
    createHookSet(pId:string, pOptions:any={}):HookSet {
        let hs:HookSet = this.getHookSet(pId);
        //Logger.raw(hs);
        if(hs==null){
            Logger.raw("NEW "+pId+" "+((pOptions.hasOwnProperty('name')? pOptions.name : pId))+" => "+JSON.stringify(pOptions));
            hs = new HookSet({
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

            this._addHookSet(hs);
            return hs;
        }else{
            Logger.raw(pId+" "+hs.name+" => "+hs.toJsonObject());
            return hs;
        }
    }

    registerHookSet(pHookSet:HookSet):void{

    }

    /**
     * To get a stragtegy by its uid
     * @param pUID
     */
    getHookStrategy(pUID:string):HookStrategy {
        return this.db.strategies.getEntry(pUID);
    }

    /**
     * To get all hook strategies
     * @param pUID
     */
    getHookStrategies():HookStrategy[] {
        return this.db.strategies.getAll();
    }

    /*createHookStrategy( pStrategy:HookStrategy):boolean {
        return this.getDbAPI().createHookStrategy(pStrategy);
    }*/

    /**
     * To create hookset for each DEX file or binary file analyzed
     */
    updateBuiltinHookset():void {
        // create a hook set per DEX file, it mus be
        // this.context.analyze.getDexFiles();

        // create a hook set per native file into the project
        const natives = this.context.analyze.getNativeAnalyzer().getTargetFiles();
        natives.map( file => {
           const hs = this.getHookSet(file.getName());
           if(hs==null){
               this._addHookSet(new HookSet({
                   id: file.getName(),
                   name: file.getName(),
                   context: this.context,
                   enable: true
               }))
           }
        });
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
            Path.join(__dirname, "..", "scanner"),
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
     */
    prepareHookScript():string{
        let script:string = `Java.perform(function() {
            var DEXC_MODULE = {};
        `;

        // include hookset requirements
        //if(this.requiresNode.length > 0)
        //   script = this.prepareRequiresNode()+"\n"+script;
        
        //script += this.prepareRequires();
        
        for(let i in this.prologues){
            if(this.prologues[i].isEnable()){
                script += this.prologues[i].builtScript;
            }
        }


        for(let i in this.hooks){
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
    buildAgentScript(): string {
        let script:string = null;
        const ws:HookWorkspace = this.context.getWorkspace().getHookWorkspace();

        try{
            script = this.builder.build();
            Logger.info("[HOOK MANAGER] Hook script template built")
            ws.writeDefaultScript(script);
            script = ws.compileDefaultScript();
            Logger.info("[HOOK MANAGER] Hook script built and compiled successfully.")
        }catch(e){
            Logger.error("[HOOK MANAGER] Hook script cannot be built or compiled : "+e.message)
        }

        return script;
    }

    setCachePolicy( pPolicy:any):void{
        this.cache_policy = pPolicy;
    }

    mustFlushCache():boolean{
        return ((this.cache_policy & HOOKSESSION_CACHE_POLICY.FLUSH_SESSIONS)
            !== HOOKSESSION_CACHE_POLICY.FLUSH_SESSIONS);
    }

    /**
     * To create a new hook session
     * 
     * @returns {HookSession} Current - freshly created - hooking session
     * @method
     */
    newSession():HookSession{
        var sess:HookSession =new HookSession(this);

        // TODO : add configuration flush/keep previous
        if(this.mustFlushCache()){
            this.sessions = [];
        }
        if(this.sessions.length > 0)
            this.sessions[this.sessions.length-1].active = false;

        sess.active = true;
        this.sessions.push(sess);
        return sess;
    }



    /**
     * To start hooking by spawning the target application
     *  
     * @param {String} pHookScript Hook script
     * @param {String} pAppName Application UID
     * @method
     */
    startBySpawn(pAppName:string, pSession:HookSession, pHookScript:string= null):HookSession{
        return this.start(pSession, pHookScript, FRIDA_MODE.SPAWN, pAppName);
    }

    /**
     * 
     * @param {*} pAppName 
     * @param {*} pHookScript 
     */
    startByAttachToGadget(pSession:HookSession, pHookScript:string= null):HookSession{
        return this.start(pSession, pHookScript, FRIDA_MODE.ATTACH_GADGET, "Gadget");
    }

    /**
     * 
     * @param {*} pPID 
     * @param {*} pHookScript 
     */
    startByAttachTo(pPID:string=null, pSession:HookSession, pHookScript:string= null):HookSession{
        return this.start(pSession, pHookScript, FRIDA_MODE.ATTACH_PID, pPID);
    }

    /**
     * 
     * @param {*} pAppName 
     * @param {*} pHookScript 
     */
    startByAttachToApp(pAppName:string, pSession:HookSession, pHookScript:string= null):HookSession{
        return this.start(pSession, pHookScript, FRIDA_MODE.ATTACH_APP, pAppName);
    }

    saveAll(){
        //this.db.save();
    }
    /**
     *
     * @param pObject
     */
    save( pObject:AbstractHook|JavaMethodHook|NativeFunctionHook|HookStrategy|HookSet|HookTemplateFragment, pCreate = false ){

        switch (pObject.__) {
            case NodeInternalType.HOOK_JAVA:
                if(!pCreate){
                    this.db.updateJavaHook(pObject as JavaMethodHook);
                }else{
                    this.db.createJavaHook(pObject as JavaMethodHook);
                }
                break;
            case NodeInternalType.HOOK_NATIVE:
                if(!pCreate){
                    this.db.updateNativeHook(pObject as NativeFunctionHook);
                }else{
                    this.db.createNativeHook(pObject as NativeFunctionHook);
                }
                break;
            case NodeInternalType.HOOK_STRATEGY:
                if(!pCreate){
                    this.db.updateHookStrategy(pObject as HookStrategy);
                }else{
                    this.db.createHookStrategy(pObject as HookStrategy);
                }
                break;
            case NodeInternalType.HOOK_SET:
                if(!pCreate){
                    this.db.updateHookSet(pObject as HookSet);
                }else{
                    this.db.createHookSet(pObject as HookSet);
                }
                break;
            case NodeInternalType.HOOK_FRAGMENT:
                if(!pCreate){
                    this.db.updateFragment(pObject as HookTemplateFragment);
                }else{
                    this.db.createFragment(pObject as HookTemplateFragment);
                }
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
     
      * @param {*} hook_script 
      * @param {*} pType 
      * @param {*} pExtra 
      * @param {*} pDevice 
      * 
      * @method
      */
     start(pSession:HookSession, hook_script:string, pType:FRIDA_MODE=null, pExtra:any=null, pDevice:Device=null):HookSession{
        
        let target:Device = null;
        let PROBE_SESSION:HookSession = pSession; //this.newSession();
        
        if(hook_script == null){
            hook_script = this.prepareHookScript();
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
        let hookRoutine:any = co.wrap(function *() {
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

            const script = yield session.createScript(hook_script);

             // For frida-node > 11.0.2
             script.message.connect((message:string) => {
                PROBE_SESSION.push(message);//{ msg:message, d:data });
                //console.log('[*] Message:', message);
            });    
            
        
            yield script.load();


            PROBE_SESSION.fridaScript = script;

            Logger.info('script loaded');
            Logger.debug(script);
            yield device.resume(pid);
        });

        hookRoutine()
            .catch(error => {
            console.log(error);
            Logger.error('error:', error.message);
            });

        return PROBE_SESSION;
    }


    private _addHookSet(pHookSet: HookSet):boolean{

         if(this.db.isHookSetExists(pHookSet.getID())){
             throw HookManagerException.EXISTING_HOOK_SET();
         }

         this.db.sets.addEntry( pHookSet.getID(), pHookSet);

         //this.hooksets[pHookSet.getID()] = pHookSet;


         return true;
    }

    getHookSets():HookSetList{
        return this.db.sets.getAll();
    }

    /**
     * To get the default hook set for on-demand hook
     *
     * @param pNative
     */
    getDefaultHookSet(pNative:boolean=false):HookSet{
         if(pNative)
            return this.db.sets.getEntry(CUSTOM_HOOKSET_NATIVE);
         else
             return this.db.sets.getEntry(CUSTOM_HOOKSET_JAVA);
    }

    getHookSet(id:string):HookSet{
        return this.db.sets.getEntry(id);
    }

    hasListener(hookid:string){
        return (this.listeners[hookid] != null);
    }

    // add a listener to call when the HookSession receive a HookMessage with match=true
    addMatchListener(hookid:string, callback:any):HookManager{
        if(this.listeners[hookid]==null)
            this.listeners[hookid] = [];

        this.listeners[hookid].push(callback);  
        return this;
    }

    /**
     *
     * @param pHookMessage
     * @deprecated ?
     */
    trigger(pHookMessage:any):void{

        // INFO : event.hook = HookMessage.hook = msg.id
        let hookid = Util.b64_decode(pHookMessage.hook);
        if(!this.hasListener(hookid)) return ;

        for(let i=0; i<this.listeners[hookid].length; i++){
            this.listeners[hookid][i](this.context,pHookMessage);
        }
    }

    isProbing(method:ModelMethod):boolean{
        for(let i in this.hooks){
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
        return (this.jhooks as AbstractHook[]).concat(this.nhooks); // this.hooks;
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
     * To count hook for a specific node type / target
     * @param pList
     * @param pNode
     * @private
     */
    private _countHook( pList:AbstractHook[], pNode:ModelFunction|ModelMethod):number {
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

    createSyscallHook( pSyscalls:string[], pOpts:any, pKeyPoint:KeyPoint = null):NativeFunctionHook {
        return null;
    }

    createInstructionHook( pAddr:ModelFunction, pOpts:any, pKeyPoint:KeyPoint = null):NativeFunctionHook {
        return null;
    }

    createNativeFunctionHook( pFunc:ModelFunction, pOpts:any, pKeyPoint:KeyPoint = null):NativeFunctionHook {
        const hook:NativeFunctionHook = new NativeFunctionHook();

        hook.setGUID( md5(this.nextHookGUIDFor(pFunc)));

        if(pOpts.loadKP == null){
            hook.setLoadKeyPoint(this.getKeyPointManager().getKeyPoint("core.java.app"));
        }else{
            hook.setLoadKeyPoint(pOpts.loadKP);
        }

        if(pOpts.unloadKP !== null){
            hook.setUnloadKeyPoint(pOpts.unloadKP);
        }

        hook.setTarget(pFunc);
        hook.setManager(this);

        //hook.makeProbeFor(method);
        //this.builder.
        //hook.makeHookFor(method, pOptions);

        //hook.setMethod(method);
        // method.setProbing(true);
        pFunc.probing = true;
        pFunc.hooks.push( hook);


        if(pFunc.hasTag('ds')||pFunc.hasTag('di')){
            this.getDefaultHookSet().addHook(hook);
        }else{
            //this.getHookSetFor(method.getDeclaringFile());
            this.getDefaultHookSet().addHook(hook);
        }

        Logger.info("[HOOK MANAGER][NATIVE HOOK] Created successfully : ",hook.getTarget().getUID())
        this.nhooks.push(hook);
        this.save(hook, true);

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
     * @param pMethod
     * @param pKeyPoint
     */
    createJavaMethodHook( pMethod:ModelMethod, pOptions:any = {}):JavaMethodHook {
        const hook:JavaMethodHook = new JavaMethodHook();

        hook.setGUID( md5(this.nextHookGUIDFor(pMethod)));

        if(pOptions.loadKP == null){
            hook.setLoadKeyPoint(this.getKeyPointManager().getKeyPoint("core.java.app"));
        }else{
            hook.setLoadKeyPoint(pOptions.loadKP);
        }

        if(pOptions.unloadKP !== null){
            hook.setUnloadKeyPoint(pOptions.unloadKP);
        }

        hook.setTarget(pMethod);
        hook.setManager(this);

        //hook.makeProbeFor(method);
        //this.builder.
        //hook.makeHookFor(method, pOptions);

        //hook.setMethod(method);
        // method.setProbing(true);
        pMethod.probing = true;
        pMethod.hooks.push( hook);


        if(pMethod.hasTag('ds')||pMethod.hasTag('di')){
            this.getDefaultHookSet().addHook(hook);
        }else{
            Logger.info("hook java",JSON.stringify(pMethod));
            //this.getHookSetFor(method.getDeclaringFile());
            this.getDefaultHookSet().addHook(hook);
        }

        Logger.info("[HOOK MANAGER][JAVA HOOK] Created successfully : ",hook.getTarget().getName())
        this.jhooks.push(hook);
        this.save(hook, true);

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
    removeHook(pHook:AbstractHook):boolean{

        const uid = pHook.getGUID();
        let offset = -1;
        let coll:AbstractHook[] = null;


        if(pHook.__ == NodeInternalType.HOOK_NATIVE){//pHook.isTargetNodeType(NodeInternalType.FUNC)){
            coll = this.nhooks;
        }
        else if(pHook.__ == NodeInternalType.HOOK_JAVA){//pHook.isTargetNodeType(NodeInternalType.METHOD)){
            coll = this.jhooks;
        }

        if(coll==null){
            throw HookManagerException.HOOK_NOT_FOUND(pHook.getGUID());
        }

        coll.map( (vHook:AbstractHook, i)=>{
            if(vHook.getGUID() == uid){
                vHook.destroy(this.context);
                offset = i;
            }
        });

        if(offset > -1){
            coll.splice(offset, 1);
            return true;
        }else{
            return false;
        }

        /*let res:Hook[]=[], pop:Hook=null;
        for(let i in this.hooks){
            if(this.hooks[i].id != hook.getID()){
                res.push(this.hooks[i]);
            }else{
                pop = this.hooks[i];
            }
        }
        this.hooks = res;*/
    }

    /**
     * To get a hook by its ID
     *
     * @param {string} hookId
     */
    findHook(hookId:string):Hook{
        for(let i in this.hooks){
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
        let match:Hook[] = [];
        for(let i in this.hooks){
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
    nextHookGUIDFor(pTarget:ModelMethod|ModelFunction):string{
        //    return method.__signature__+"@@"+this.findHookByMethod(method).length;
        //Logger.info("[HOOK] nextHookIdFor ["+method.signature()+"]")
        if(pTarget.__ === NodeInternalType.METHOD){
            return pTarget.__+":"+pTarget.getUID()+"@@"+this.countJavaHook(pTarget as ModelMethod);
        }else{
            return pTarget.__+":"+pTarget.getUID()+"@@"+this.countNativeHook(pTarget as ModelFunction);
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
     * To generate a hook for a specific method/function on-demand
     *
     * All hook sets which are not "builtin: true" contain "on-demand" hook
     *
     * Depending of context, resulting hook is attached to a specific hookset :
     *  - Hookset corresponding to DEX file declaring the method (even if the DEX have been discovered at runtime)
     *  - Hookset corresponding to library declaring the function
     *
     * If the hookset has flag "dynamic:true", hook are deployed only when the associated file have been loaded.
     *
     * @param method
     * @param pOptions
     * @deprecated
     */
    /*
    probe(method:ModelMethod|ModelFunction, pOptions:any={}):Hook{
        let hook:Hook = null;
        let hs:HookSet = null;


        if(method instanceof ModelMethod){
            hook = new Hook(this.context);

            //hook.setID( this.nextHookIdFor(method));
            hook.setID( md5(this.nextHookIdFor(method)));
            
            //hook.makeProbeFor(method);
            hook.makeHookFor(method, pOptions);

            //hook.setMethod(method);
            // method.setProbing(true);
            method.probing = true;


            if(method.hasTag('ds')||method.hasTag('di')){
                this.getDefaultHookSet().addHook(hook);
            }else{
                Logger.info("hok java",JSON.stringify(method));
                //this.getHookSetFor(method.getDeclaringFile());
                this.getDefaultHookSet().addHook(hook);
            }

            Logger.info("[HOOK MANAGER][PROBE] Add : ",hook.name)
            this.hooks.push(hook);

            // trigger new probe workflow
            this.context.trigger({
                type: "probe.new",
                data: {
                    hook: hook,
                    method: method
                }
            });

        }else if(method instanceof ModelFunction){
            hook = new Hook(this.context);

            //hook.setID( this.nextHookIdFor(method));
            hook.setID( md5(this.nextHookIdFor(method)));

            //hook.makeProbeFor(method);
            hook.makeNativeHookFor(method, pOptions);
            hook.native = true;

            //hook.setMethod(method);
            // method.setProbing(true);
            method.probing = true;

            Logger.info("hok native",JSON.stringify(method));

            if(method.src !== null){
                if(typeof method.src === 'string'){
                    hs = this.getHookSet(method.src);
                    if(hs==null){
                        const f = this.context.find.file('_uid:'+method.src).get(0);
                        hs = this.createHookSet(method.src, { name: (f!=null? f.getName() : method.src), native:true});

                    }
                }else{
                    hs = this.getHookSet(method.src.getUID());
                    if(hs==null){
                        hs = this.createHookSet(method.src.getUID(), { name:method.src.getName(), native:true});
                    }
                }

                if(hs==null){
                    hs = this.getDefaultHookSet(true);
                }
                hs.addHook(hook);
            }else{
                this.getDefaultHookSet(true).addHook(hook);
            }

            Logger.info("[HOOK MANAGER][NATIVE PROBE] Add : ",hook.name)
            this.hooks.push(hook);

            this.context.trigger({
                type: "probe.new",
                data: {
                    hook: hook,
                    method: method
                }
            });
        }
        return hook;
    }*/



    addPrologue(prologue:HookPrologue):void{
        this.prologues.push( prologue.injectContext(this.context));
    }

    removePrologueOf(pHookSet:HookSet):void{
        let newList:HookPrologue[] = [];
        for(let i=0; i<this.prologues.length; i++){
            if(this.prologues[i].parentID != pHookSet.getID()){
                newList.push(this.prologues[i]);
            }   
        }
        this.prologues = newList;
    }


    removeHooksOf(pHookSet:HookSet):void{
        let newList:Hook[] = [];
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
    list():Hook[]{
        return this.hooks;
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
    getSessions():HookSession[] {
        return this.sessions;
    }
    // HookSession communication


    /**
     * init > new > cmd > exit
     * @param pUser
     * @param pSocket
     * @param pData
     */
    async processCommand( pUser:User, pSocket:any, pData:string):Promise<any>{
        let message:any, type:string = null, sess:HookSession=null;
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
                    sess = this.getSession(message.data.sessid);

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

                let success:boolean = false;
                let sess:HookSession = null;

                try{

                    sess = this.newSession();
                    sess.addOwner( pUser, message.data.localid, pSocket);

                    switch(message.data.type){
                        case "spawn-self":
                            Logger.info(`[WEBSERVER] Start hooking [app=${this.context.getPackageName()}, type=spawn-self]`);
                            sess = this.startBySpawn(this.context.getPackageName(), sess);
                            break;
                        case "spawn":
                            Logger.info(`[WEBSERVER] Start hooking [app=${message.data.app}, type=spawn]`);
                            sess = this.startBySpawn(message.data.app, sess);
                            break;
                        case "attach-gadget":
                            Logger.info(`[WEBSERVER] Start hooking [pid=Gadget, type=attach-gadget]`);
                            sess = this.startByAttachToGadget(sess);
                            break;
                        case "attach-app-self":
                            Logger.info(`[WEBSERVER] Start hooking [app=${this.context.getPackageName()}, type=attach-app-self]`);
                            sess = this.startByAttachToApp(this.context.getPackageName(), sess);
                            break;
                        case "attach-app":
                            Logger.info(`[WEBSERVER] Start hooking [app=${message.data.app}, type=attach-app-x]`);
                            sess = this.startByAttachToApp(message.data.app, sess);
                            break;
                        case "attach-pid":
                            Logger.info(`[WEBSERVER] Start hooking [pid=${message.data.pid}, type=attach-to-pid`);
                            sess = this.startByAttachTo(message.data.pid, sess );
                            break;
                        default:
                            throw  new Error('Invalid start type' );
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
                    Logger.raw(JSON.stringify(exception));
                    pSocket.sendUTF(JSON.stringify({
                        action:'start',
                        svc:"hookm",
                        data: {
                            success: false,
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
            console.log(err);
            pSocket.sendUTF(JSON.stringify({action:'err', data:{
                    msg: err.toString()
                }}));
        }
    }


    /**
     * To get a session by its Session ID
     *
     * @param {string} pSessID Session ID
     * @return {TerminalSession}
     *
     */
    getSession(pSessID:string):HookSession {
        let sess:HookSession = null;
        this.sessions.map((vSess:any)=>{
            if(vSess.getSessionID()===pSessID) sess=vSess;
        });

        return sess;
    }



    /**
     *
     * @param pKeyPoint
     */
    private _getHookByKeyPointWithRole( pKeyPoint:KeyPoint, pRole:KeyPointRole):AbstractHook[] {

        let fn:any;
        switch (pRole) {
            case 'load':
                fn = "getLoadKeyPoint";
                break;
            case 'unload':
                fn = "getUnloadKeyPoint";
                break;
            default:
                fn = "getKeyPoint";
                break;
        }
        const hk:AbstractHook[] = [];
        const uid = pKeyPoint.getUID();

        this.jhooks.map( (vHook:JavaMethodHook)=>{
            const kp = vHook[fn]()
            if(kp!=null && kp.getUID() == uid)
                hk.push(vHook);
        });

        this.nhooks.map( (vHook:NativeFunctionHook)=>{
            const kp = vHook[fn]()
            if(kp!=null && kp.getUID() == uid)
                hk.push(vHook);
        });

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
}
