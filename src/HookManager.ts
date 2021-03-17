
import * as co from 'co';
import * as fs from 'fs';
import * as md5 from 'md5';
import * as Path from 'path';

import HookSession from "./HookSession";
import DexcaliburProject from "./DexcaliburProject";
import HookPrologue from "./HookPrologue";
import HookSet from "./HookSet";
import Hook from "./Hook";
import {Device} from "./Device";
import Util from "./Utils";
import ModelMethod from "./ModelMethod";
import * as Log from './Logger';
import FridaHelper from "./FridaHelper";
import ModelClass from "./ModelClass";
import {TerminalSession} from "./TerminalSession";
import {HookSessionMap, TerminalSessionMap, User} from "./User";
import {ModelFunction} from "./ModelFunction";

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


/**
 * 
 * @param {DexcaliburProject} ctx The project instance
 * @param {Boolean} nofrida If equals to 1 then the Frida script will not be loaded and Frida library not include  
 */
export class HookManager
{
    cache_policy:number = HOOKSESSION_CACHE_POLICY.NONE;
    context:DexcaliburProject = null;
   // logs = [];
    hooks:Hook[] = [];
    hooksets:HookSetList = {};
    prologues:HookPrologue[] = [];
    sessions:HookSession[] = [];
    requires:string[] = [];
    //requiresNode = [];
    listeners:any = {};

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

        //
        this.hooksets.custom = new HookSet({
            id: "custom",
            name: "On-Demand hooks",
            context: pProject,
            enable: true
        });
        this.hooksets.customNative = new HookSet({
            id: "customNative",
            name: "On-Demand native hooks",
            context: pProject,
            enable: true,
            native: true
        });
    }

    /**
     * To create a new hook set
     *
     * @param pId
     * @param pOptions
     */
    createHookSet(pId:string, pOptions:any={}):HookSet {
        let hs:HookSet = this.getHookSet(pId);
        if(hs==null){
            hs = new HookSet({
                id: pId,
                name: (pOptions.hasOwnProperty('name')? pOptions.name : pId),
                context: this.context,
                enable: (pOptions.hasOwnProperty('enable')? pOptions.enable : true),
                native: (pOptions.hasOwnProperty('native')? pOptions.native : false)
            });
            for(let k in pOptions) hs[k] = pOptions[k];

            this.addHookSet(hs);
            return hs;
        }else{
            return null;
        }
    }

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
           if(fs==null){
               this.addHookSet(new HookSet({
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
     * To add a required JS library (declared into 'requires' folder)
     *
     * @param {string[]} requires
     * @method 
     */
    addRequires(requires:string[]):void{
        for(let i=0; i<requires.length; i++){
            if(this.requires.indexOf(requires[i])==-1){
                this.requires.push(requires[i]);
            }
        }
    };

    /**
     * To remove specific JS libraries from libraries required.
     *
     * @param {*} requires
     * @method 
     */
    removeRequires(requires:string[]):void{
        let offset=-1;
        for(let i=0; i<requires.length; i++){
            offset = this.requires.indexOf(requires[i]);
            if(offset>-1) this.requires[offset] = null;
        }
    };

    /**
     * To insert required modules into the generated Frida script
     *
     * 
     * @method
     */
    prepareRequires():string{
        let req:any = "", loaded:any = {};
        for(let i=0; i<this.requires.length; i++){
            if(this.requires[i]!=null && loaded[this.requires[i]]==null){
                req += fs.readFileSync(Path.join(__dirname,"requires",this.requires[i]+".js"));
                loaded[this.requires[i]] = true;
            }
        }  

        return req;
    }


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
        
        script += this.prepareRequires();
        
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


    addHookSet(set:HookSet):boolean{
        if(this.hooksets[set.getID()]!=null){
            console.log("[Error] HookManager : An hook set already exists for this ID");
            return false;
        }
        this.hooksets[set.getID()] = set;

        return true;   
    }

    getHookSets():HookSetList{
        return this.hooksets;   
    }

    /**
     * To get the default hook set for on-demand hook
     *
     * @param pNative
     */
    getDefaultHookSet(pNative:boolean=false):HookSet{
         if(pNative)
            return this.hooksets.customNative;
         else
            return this.hooksets.custom;;
    }

    getHookSet(id:string):HookSet{
        return this.hooksets[id];   
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
     * 
     */
    getProbe(method:ModelMethod|ModelFunction):Hook{
        for(let i in this.hooks){
            if(this.hooks[i].name == method.signature()){
                return this.hooks[i];
            }
        }
        return null;
    }

    /**
     * To get all hooks
     * @returns {Hook[]} An array containing all hooks
     */
    getHooks():Hook[]{
        return this.hooks;
    }

    /**
     * To get a hook by its ID.
     * 
     * @param {String} id The hook ID as provide by the hook trace
     * @return {Hook} The matching hook, then null. 
     * @function
     */
    getHookByID(id:string):Hook{
        for(let i in this.hooks){
            if(this.hooks[i].id == id){
                return this.hooks[i];
            }
        }
        return null;
    }

    removeHook(hook:Hook):Hook{
        let res:Hook[]=[], pop:Hook=null;
        for(let i in this.hooks){
            if(this.hooks[i].id != hook.getID()){
                res.push(this.hooks[i]);
            }else{
                pop = this.hooks[i];
            }
        }
        this.hooks = res;
        return pop;
    }

    findHook(hookId:string):Hook{
        for(let i in this.hooks){
            if(this.hooks[i].id == hookId){
                return this.hooks[i];
            }
        }
        return null;
    }

    findHookByMethod(method:ModelMethod|ModelFunction):Hook[]{
        let match:Hook[] = [];
        for(let i in this.hooks){
            if(this.hooks[i].name == method.signature()){
                match.push(this.hooks[i]);
            }
        }
        return match;
    }

    nextHookIdFor(method:ModelMethod|ModelFunction):string{
    //    return method.__signature__+"@@"+this.findHookByMethod(method).length;
        Logger.info("[HOOK] nextHookIdFor ["+method.signature()+"]")
        return method.signature()+"@@"+this.findHookByMethod(method).length;
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
     */
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
                        const f = this.context.find.file('uid:'+method.src).get(0);
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
        }
        return hook;
    }



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

}
