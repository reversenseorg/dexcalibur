import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer from "../WebServer";
import {Request, Response} from "express";
import * as Log from "../Logger";
import DexcaliburProject from "../DexcaliburProject";
import HookSession from "../HookSession";
import FridaHelper from "../FridaHelper";
import Hook from "../Hook";
import Util from "../Utils";
import {HookManager, HookSetList} from "../hook/HookManager";
import HookMessage from "../HookMessage";
import ModelMethod from "../ModelMethod";
import {ModelFunction} from "../ModelFunction";
import ModelFile from "../ModelFile";
import {AbstractHook} from "../hook/AbstractHook";
import {NodeInternalType} from "../NodeInternalType";
import KeyPoint from "../hook/KeyPoint";
import HookStrategy from "../hook/HookStrategy";
import HookFragmentPreset from "../hook/HookFragmentPreset";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const HOOK_WEB_API: DelegateWebApi = new DelegateWebApi();



HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/app/detach',
    {
        'post': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;

                // get hook instance by ID
                const session:HookSession = project.hook.lastSession();

                if (session.fridaScript == null) {
                    $.sendError(res, "Invalid frida script");
                }else{
                    const a:any = await session.fridaScript.unload();
                    $.sendSuccess(res,  a);
                }

            }catch(err){
                Logger.error("[API][HOOK] Hooked application cannot be detached. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hooked application cannot be detached. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);



HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/app/kill',
    {
        'post': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // get hook instance by ID
                const session:HookSession = project.hook.lastSession();

                if(session == null){
                    throw new Error("Unknow PID");
                }

                // TODO : replace by Device.killProcess( PID, SIGNAL )

                if (session.pid == null) {
                    throw new Error("Invalid PID");
                }else{
                    const o = await project.getDevice().killProcess(session.pid); // privilegedExecSync('kill '+session.pid, {detached:false});
                    $.sendSuccess(res, o);
                }
            }catch(err){
                Logger.error("[API][HOOK] Hooked application cannot be killed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hooked application cannot be killed. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);



HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/frida/exec',
    {
        'post': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;
                let newCode:string;

                if(req.body['code[]'] != null){
                    newCode = req.body['code[]'].join("\n");
                }else{
                    newCode = await (req.dxc.project as DexcaliburProject).getHookManager().buildAgentScript();
                }


                let output:any = null;
                const dev:Device = project.getDevice();

                switch(req.body.type){
                    case "spawn-self":
                        Logger.info(`[WEBSERVER] Start with frida console [app=${project.getPackageName()}, type=spawn-self]`);
                        output = await FridaHelper.exec(dev, newCode, FridaHelper.SPAWN, project.getPackageName());
                        break;
                    case "spawn":
                        Logger.info(`[WEBSERVER] Start with frida console [app=${req.body.app}, type=spawn]`);
                        output = await FridaHelper.exec(dev, newCode, FridaHelper.SPAWN, req.body.app);
                        break;
                    case "attach-gadget":
                        Logger.info(`[WEBSERVER] Start with frida console  [pid=Gadget, type=attach-gadget]`);
                        output = await FridaHelper.exec(dev, newCode, FridaHelper.ATTACH_BY_NAME, "Gadget");
                        break;
                    case "attach-app-self":
                        Logger.info(`[WEBSERVER] Start with frida console  [app=${req.body.app}, type=attach-app-self]`);
                        output = await FridaHelper.exec(dev, newCode, FridaHelper.ATTACH_BY_NAME, project.getPackageName());
                        break;
                    case "attach-app":
                        Logger.info(`[WEBSERVER] Start with frida console  [app=${req.body.app}, type=attach-app-x]`);
                        output = await FridaHelper.exec(dev, newCode, FridaHelper.ATTACH_BY_NAME, req.body.app);
                        break;
                    case "attach-pid":
                        Logger.info(`[WEBSERVER] Start with frida console  [pid=${req.body.pid}, type=attach-to-pid`);
                        output = await FridaHelper.exec(dev, newCode, FridaHelper.ATTACH_BY_PID, req.body.pid);
                        break;
                    default:
                        throw new Error('Invalid start type');
                }



                $.sendSuccess(res, { output: await output });


            }catch(err){
                Logger.error("[API][HOOK] Frida cannot be started. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Frida cannot be started. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/frida/build',
    {
        'get': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                $.sendSuccess(res, await (req.dxc.project as DexcaliburProject).getHookManager().buildAgentScript());
            }catch(err){
                Logger.error("[API][HOOK] Frida agent script cannot be built. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Frida agent script cannot be built. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/strategies',
    {
        'get': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const strats = (req.dxc.project as DexcaliburProject).getHookManager().getHookStrategies();
                const data = [];
                strats.map( (vS:HookStrategy)=> {
                    data.push( vS.toJsonObject());
                });

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][HOOK] Frida agent script cannot be built. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Frida agent script cannot be built. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

HOOK_WEB_API.addAuthenticatedRoute(
    '/global/opts',
    {
        'post': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const hm = (req.dxc.project as DexcaliburProject).getHookManager();

                for(const opt in req.body.opts){
                    hm.updateOptions( opt, req.body.opts[opt]);
                }

                $.sendSuccess(res, hm.options);
            }catch(err){
                Logger.error("[API][HOOK] Global options cannot be updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Global options cannot be updated. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

// replace /hook/:id by /hook/get/:id
HOOK_WEB_API.addAuthenticatedRoute(
    '/get/:hookid',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // get hook instance by ID
                const hook:AbstractHook = project.hook.getHookByID(
                    req.params.hookid
                );

                if (hook == null) {
                    throw new Error("Invalid hook ID given : "+req.params.hookid);
                }

                let o:any = hook.toJsonObject();
                if(hook.__==NodeInternalType.HOOK_NATIVE){
                    if(hook.getTarget() != null){
                        o.func = (hook.getTarget() as ModelFunction).toJsonObject();
                    }
                }else{
                    if(hook.getTarget() != null){
                        o.method = (hook.getTarget() as ModelMethod).toJsonObject();
                    }
                }

                $.sendSuccess( res, {hook:o});

            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hook cannot be retrieved. Cause : " + err.message);
            }
        },
        'put': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                const hook:AbstractHook = project.hook.getHookByID(
                    req.params.hookid
                );


                if (hook == null) {
                    throw  new Error("Invalid hook ID given");
                }

                // depend of fragment and optio
                //let newCode:string = req.body['code[]'].join("\n");
                //hook.script = newCode;
                //hook.modifyScript(newCode);

                $.sendSuccess( res, {});

            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be edited. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hook cannot be edited. Cause : " + err.message);
            }
        },
        'delete': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                let hook:AbstractHook = project.hook.getHookByID(
                    //Util.b64_decode(req.params.hookid)
                    req.params.hookid
                );


                if (hook == null) {
                    throw new Error("No probe ID given" );
                }

                let success:boolean = project.hook.removeHook(hook);

                if(!success){
                    throw new Error("Hook cannot be removed");
                }

                $.sendSuccess( res, {});

            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be dropped. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hook cannot be dropped. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


HOOK_WEB_API.addAuthenticatedRoute(
    '/enable/:hookid',
    {
        'put': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            try{
                project = req.dxc.project;

                let dev:any={};

                if(req.params.hookid=="all"){

                    let hooks:Hook[] = project.hook.list();
                    for(let i in hooks){
                        hooks[i].enable();
                        dev[i] = {enable: hooks[i].isEnable() };
                    }

                    $.sendSuccess(res, dev);
                }else {
                    let hook: AbstractHook = project.hook.getHookByID(
                        req.params.hookid
                    );

                    hook.enable();

                    $.sendSuccess(res, {
                        enable: hook.isEnable()
                    });
                }


            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be enabled. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook cannot be enabled. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


HOOK_WEB_API.addAuthenticatedRoute(
    '/disable/:hookid',
    {
        'put': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project as DexcaliburProject;
                let dev:any={};

                if(req.params.hookid=="all"){
                    let hooks:Hook[] = project.hook.list();
                    for(let i in hooks){
                        hooks[i].disable();
                        dev[i] = {enable: hooks[i].isEnable() };
                    }
                    $.sendSuccess(res, dev);
                }else{
                    let hook:AbstractHook = project.hook.getHookByID(
                        req.params.hookid
                    );

                    hook.enable(false);
                    // collect
                    $.sendSuccess(res, {
                        enable: hook.isEnable()
                    });
                }


            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be disabled. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook cannot be disabled. Cause : " + err.message);
            }
        }
    }, {
        readProject: true
    }
);



HOOK_WEB_API.addAuthenticatedRoute(
    '/list',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                const hookMgr:HookManager = project.getHookManager();
                let data:any = [];

                if(req.query['t']!=null && req.query['s']!=null){
                    const unsafeSignature:string = decodeURIComponent(Util.b64_decode(decodeURIComponent(req.query['s'])));
                    let target:ModelMethod|ModelFunction = null;
                    switch(req.query['t']){
                        case "func":
                            target = project.getSearchEngine().get.func(unsafeSignature);
                            break;
                        case "meth":
                            target = project.getSearchEngine().get.method(unsafeSignature);
                            break;
                    }

                    if(target != null){
                        hookMgr.getProbes(target).map( (vHook:AbstractHook) => {
                            data.push(vHook.toJsonObject());
                        });
                    }


                }else if(req.query['f'] !=null ){


                    switch(req.query['f']){
                        case 'process':
                            // group hook by process (main, isolated, fork from ..., fork #1, spawn, ...)
                            break;
                        case 'thread':
                            // group hook by future thread
                            break;
                        case 'keypoint':
                            data = project.hook.getHooks();
                            break;
                        case 'thema':
                            // group hook by process (main, isolated, fork from ..., fork #1, spawn, ...)
                            break;
                        case 'inspector':
                            const hooksets:HookSetList = project.hook.getHookSets();
                            for(const i in hooksets){
                                data.push(hooksets[i].toJsonObject());
                            }
                            break;
                        case '*':
                        default:
                            const hk:AbstractHook[] = project.hook.getHooks();
                            hk.map( (h:AbstractHook) => {
                                data.push(h.toJsonObject())
                            });
                            break;
                    }
                }else{

                    const hooksets:HookSetList = project.hook.getHookSets();

                    for(const i in hooksets){
                        data.push(hooksets[i].toJsonObject());
                    }
                }


                $.sendSuccess(res, data);


            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook cannot be listed. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

HOOK_WEB_API.addAuthenticatedRoute(
    '/list/kp/:id',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // ========== LOGIC
                if(req.params.id == null){
                    throw new Error("KeyPoint UID must be specified");
                }

                const kp:KeyPoint = project.getKeyPointManager().getKeyPoint(req.params.id);

                if(kp == null){
                    throw new Error("KeyPoint not found");
                }

                const data = {
                    load: [],
                    unload: [] //project.hook.getHookByUnloadKeyPoint(kp)
                };

                let hooks:AbstractHook[] = project.hook.getHookByLoadKeyPoint(kp);
                hooks.map( (hx:AbstractHook)=>{
                    data.load.push( hx.toJsonObject())
                });
                hooks = project.hook.getHookByUnloadKeyPoint(kp);
                hooks.map( (hx:AbstractHook)=>{
                    data.unload.push( hx.toJsonObject())
                });


                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook cannot be listed. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/start',
    {
        'post': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;

                let sess:HookSession = this.newSession();

                switch(req.body.type){
                    case "spawn-self":
                        Logger.info(`[WEBSERVER] Start hooking [app=${project.getPackageName()}, type=spawn-self]`);
                        sess = await project.hook.asyncStartBySpawn(project.getPackageName(), sess);
                        break;
                    case "spawn":
                        Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=spawn]`);
                        sess = await project.hook.asyncStartBySpawn(req.body.app, sess);
                        break;
                    case "attach-gadget":
                        Logger.info(`[WEBSERVER] Start hooking [pid=Gadget, type=attach-gadget]`);
                        sess = await project.hook.asyncStartByAttachToGadget(sess);
                        break;
                    case "attach-app-self":
                        Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=attach-app-self]`);
                        sess = await project.hook.asyncStartByAttachToApp(project.getPackageName(), sess);
                        break;
                    case "attach-app":
                        Logger.info(`[WEBSERVER] Start hooking [app=${req.body.app}, type=attach-app-x]`);
                        sess = await project.hook.asyncStartByAttachToApp(req.body.app, sess);
                        break;
                    case "attach-pid":
                        Logger.info(`[WEBSERVER] Start hooking [pid=${req.body.pid}, type=attach-to-pid`);
                        sess = await project.hook.asyncStartByAttachTo(req.body.pid, sess);
                        break;
                    default:
                        throw new Error('Invalid start type');
                }

                $.sendSuccess(res, {sessid: sess.getSessionID(), enable: true });


            }catch(err){
                Logger.error("[API][HOOK] Hooking cannot be started. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hooking cannot be started. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);




HOOK_WEB_API.addAuthenticatedRoute(
    '/libs/update',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;
                project.getWorkspace().getHookWorkspace().updateHookLibs(true);
                $.sendSuccess(res, true);
            }catch(err){
                Logger.error("[API][HOOK] Hook libs cannot be updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook libs cannot be updated. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);




HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/download',
    {
        'get': async function (req:Request, res:Response):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;
                const script = await project.hook.buildAgentScript();

                res.set('Content-Type', 'application/octet-stream');
                res.set('Content-Length', script.length);
                res.set('Content-Disposition', 'attachment; filename="hook.js"');
                res.set('Expires', '0');

                $.sendSuccess(res, script);

            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be generated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook cannot be generated. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

/**
 * To retrieve the list of sessions
 *
 */
HOOK_WEB_API.addAuthenticatedRoute(
    '/sessions',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                let sess:HookSession[] = project.hook.getSessions();
                let data:any = {sess:[]};
                let signature:string = null;

                if (sess.length == 0) {
                    $.sendSuccess(res, data);
                    return;
                }


                // collect only sessions containing messages for the given method/function
                if(req.query.filter){
                    data.sess = [];
                    signature = decodeURIComponent(Util.b64_decode(decodeURIComponent(req.query.id)));
                    switch(req.query.filter){
                        case 'meth':
                        case 'func':
                            sess.map( (vHSess:HookSession)=>{
                                if (!vHSess.hasMessages()) return;

                                let s:any  = {msg:[]};
                                vHSess.messages().map( (vMsg:HookMessage)=>{
                                    if(vMsg.msg===signature){
                                        s.msg.push(vMsg);
                                    }
                                })

                                if(s.msg.length>0){
                                    data.sess.push(s);
                                }
                            });
                            break;
                    }
                }else{
                    data.sess = [];
                }

                $.sendSuccess(res, data);


            }catch(err){
                Logger.error("[API][HOOK] Hook sessions cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook sessions cannot be listed. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);



HOOK_WEB_API.addAuthenticatedRoute(
    '/msg',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                let sess:HookSession = project.hook.lastSession();
                if (sess == null) {
                    $.sendError( res, "No past sessions found");
                    return;
                }

                let startAt = req.query.startAt;
                let size = req.query.size;

                if (!sess.hasMessages(startAt)) {
                    $.sendError( res, "No past messages found");
                    return;
                }

                $.sendSuccess(res, sess.toJsonObject(parseInt(startAt,10), parseInt(size,10)));


            }catch(err){
                Logger.error("[API][HOOK] Hook messages cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook messages cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


HOOK_WEB_API.addAuthenticatedRoute(
    '/new/:method',
    {
        'post': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;


                let meth:ModelMethod|ModelFunction;
                let probe:AbstractHook;
                let file:ModelFile = null;
                let opts:any = {};

                if((req.body['_t']!=null) && (req.body['_t']=='func')){

                    meth = project.find.get.func(Util.decodeURI(Util.b64_decode(Util.decodeURI(req.params.method))));
                    if (meth == null) {
                        Logger.error("[API][HOOK::FUNCTION] Function not found "+Util.b64_decode(Util.decodeURI(req.params.method)));
                        throw new Error("Method or Function not found");
                    }

                    const lib = meth.getDeclaringFile();
                    if( (typeof lib) ==='string'){
                        file = project.find.get.files(lib as string);
                        if(file != null){
                            // update function
                            (meth as ModelFunction).setDeclaringFile(file);
                        }
                    }else if(lib != null){
                        file = project.find.get.files((lib as ModelFile).getUID()) ;
                    }

                    //file = project.find.get.files(meth.getDeclaringFile()) file('_uid:'+meth.getDeclaringFile());
                    if(file != null){
                        opts =  {
                            lib: file,
                            file: file.getName(),
                            ptr_mode: 'relative'
                        }
                    }else{
                        opts =  {
                            ptr_mode: 'addr'
                        }
                    }

                }else{
                    meth = project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.method)));
                    if (meth == null) {
                        Logger.error("[API][HOOK::METHOD] Method not found "+Util.decodeURI(Util.b64_decode(req.params.method)));
                        throw new Error("Method or Function not found");
                    }
                }


                if((meth.__ === NodeInternalType.METHOD) && (meth.name == "<clinit>")){
                    throw new Error("Static blocks (<clinit>) cannot be hooked");
                }

                opts.loadKP = (req.body['loadkp']!=null ? project.getKeyPointManager().getKeyPoint(req.body['loadkp']) : null);
                opts.unloadKP = (req.body['unloadkp']!=null ? project.getKeyPointManager().getKeyPoint(req.body['unloadkp']) : null);
                opts.location = req.body['loc'];
                opts.weight = req.body['weight']


                probe = project.hook.getProbe(meth, opts);
                if (probe == null) {
                    if(meth.__ === NodeInternalType.METHOD){
                        probe = project.hook.createJavaMethodHook(meth as ModelMethod, opts);
                    }else{
                        probe = project.hook.createNativeFunctionHook(meth as ModelFunction, opts);
                    }
                    probe.build(project);
                }else{
                    // modify hook to merge existing with new
                    probe.extends( opts);
                }

                // add fragment
                const fragOpts = req.body['frag'];
                if(fragOpts != null){

                    if(fragOpts.before){
                        probe.appendBefore(
                            project.hook.presets.generateFragment(fragOpts, probe, fragOpts)
                        );
                    }
                    if(fragOpts.after){
                        probe.appendAfter(
                            project.hook.presets.generateFragment(fragOpts, probe, fragOpts)
                        );

                    }
                }

                project.hook.save(probe, true);

                $.sendSuccess( res, { hook: probe.toJsonObject(), hookid: probe.getGUID(), enable: probe.isEnable() });

            }catch(err){
                Logger.error("[API][HOOK] Hook messages cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook messages cannot be retrieved. Cause : " + err.message);
            }
        },
        'put': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                let meth:ModelMethod|ModelFunction;


                if((req.body['_t']!=null) && (req.body['_t']=='func')){
                    meth = project.find.get.func(Util.decodeURI(Util.b64_decode(req.params.method)));
                }else{
                    meth = project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.method)));
                }

                if (meth == null) {
                    Logger.error("[API][PROBE::METHOD] Method or Function not found "+Util.decodeURI(Util.b64_decode(req.params.method)));
                    throw new Error("Method or Function not found");
                }
                if((meth.__ === NodeInternalType.METHOD) && (meth.name == "<clinit>")){
                    throw new Error("Static blocks (<clinit>) cannot be hooked");
                }

                let status:string = req.query.enable;
                if (status === undefined) {
                    throw new Error("Invalid hook status");
                }

                const hook:AbstractHook = project.hook.getProbe(meth);
                if (status == "true")
                    hook.enable();
                else
                    hook.enable(false);

                $.sendSuccess(res, { enable: hook.isEnable() });

            }catch(err){
                Logger.error("[API][HOOK] Hook messages cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook messages cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

