import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import {Device} from "../Device.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import HookSession from "../HookSession.js";
import FridaHelper from "../FridaHelper.js";
import Hook from "../Hook.js";
import Util from "../Utils.js";
import {HookManager, HookSetList} from "../hook/HookManager.js";
import ModelMethod from "../ModelMethod.js";
import {ModelFunction} from "../ModelFunction.js";
import ModelFile from "../ModelFile.js";
import {AbstractHook} from "../hook/AbstractHook.js";
import {NodeInternalType} from "../NodeInternalType.js";
import KeyPoint from "../hook/KeyPoint.js";
import HookStrategy from "../hook/HookStrategy.js";
import {RuntimeEventType} from "../hook/RuntimeEvent.js";
import {InspectorFactoryException} from "../errors/InspectorFactoryException.js";
import {HookManagerException} from "../errors/HookManagerException.js";
import {WebApiWindowing} from "./internals/WebApiWindowing.js";
import {TargetLanguage} from "../hook/common.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const HOOK_WEB_API: DelegateWebApi = new DelegateWebApi();



HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/app/detach',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const strats = await (req.dxc.project as DexcaliburProject).getHookManager().getHookStrategies();
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
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
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

                const o:any = hook.toJsonObject();
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
        'put': function (req:DelegateRequest, res:DelegateResponse):any {
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
        'delete': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                const hook:AbstractHook = project.hook.getHookByID(
                    //Util.b64_decode(req.params.hookid)
                    req.params.hookid
                );


                if (hook == null) {
                    throw new Error("No probe ID given" );
                }

                const success:boolean = await project.hook.removeHook(hook);

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
    '/getBy/inspector',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                let matches:AbstractHook[] = req.dxc.project.getHookManager().getHooksByInspector(
                    req.dxc.project.getInspector(req.query.uid as string)
                );

                // serialize
                const data = [];
                matches.map( h => {
                    const o:any = h.toJsonObject();
                    if(h.__==NodeInternalType.HOOK_NATIVE){
                        if(h.getTarget() != null){
                            o.func = (h.getTarget() as ModelFunction).toJsonObject();
                        }
                    }else{
                        if(h.getTarget() != null){
                            o.method = (h.getTarget() as ModelMethod).toJsonObject();
                        }
                    }
                    data.push(o)
                });

                $.sendSuccess( res, data);

            }catch(err){
                Logger.error("[API][HOOK] Hook cannot be retrieved by inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hook cannot be retrieved by inspector. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);



HOOK_WEB_API.addAuthenticatedRoute(
    '/enable/:hookid',
    {
        'put': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;
            try{
                project = req.dxc.project;

                const dev:any={};

                if(req.params.hookid=="all"){

                    const hooks = project.hook.list();
                    for(const i in hooks){
                        hooks[i].enable(true);
                        await project.getHookManager().save(hooks[i]);
                        dev[i] = {enable: hooks[i].isEnable() };
                    }

                    $.sendSuccess(res, dev);
                }else {
                    const hook: AbstractHook = project.hook.getHookByID(
                        req.params.hookid
                    );

                    hook.enable(true);
                    await project.getHookManager().save(hook);

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
        'put': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project as DexcaliburProject;
                const dev:any={};

                if(req.params.hookid=="all"){
                    const hooks = project.hook.list();
                    for(const i in hooks){
                        hooks[i].enable(false);
                        await project.hook.save(hooks[i]);
                        dev[i] = {enable: hooks[i].isEnable() };
                    }


                    $.sendSuccess(res, dev);
                }else{
                    const hook:AbstractHook = project.hook.getHookByID(
                        req.params.hookid
                    );

                    hook.enable(false);

                    await project.hook.save(hook);

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
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                const hookMgr:HookManager = project.getHookManager();
                let data:any = [];

                if(req.query['t']!=null && req.query['s']!=null){
                    const unsafeSignature:string = decodeURIComponent(Util.b64_decode(decodeURIComponent(req.query.s  as string)));
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
                            const hooksets:HookSetList = await project.hook.getHookSets();
                            for(const i in hooksets){
                                data.push(hooksets[i].toJsonObject());
                            }
                            break;
                        case '*':
                        default:
                            const hk:AbstractHook[] = await project.hook.getHooks();
                            hk.map( (h:AbstractHook) => {
                                data.push(h.toJsonObject())
                            });
                            break;
                    }
                }else{

                    const hooksets:HookSetList = await project.hook.getHookSets();

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
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // ========== LOGIC
                if(req.params.id == null){
                    throw new Error("KeyPoint UID must be specified");
                }

                const kp:KeyPoint = await project.getKeyPointManager().getKeyPointByAttr({ name: req.params.id });

                console.log(kp, kp.getUID());
                if(await kp == null){
                    throw new Error("KeyPoint not found");
                }

                console.log(kp, kp.getUID());
                const data = {
                    load: [],
                    unload: [] //project.hook.getHookByUnloadKeyPoint(kp)
                };

                let hooks:AbstractHook[] = project.hook.getHookByLoadKeyPoint( await kp);
                hooks.map( (hx:AbstractHook)=>{
                    data.load.push( hx.toJsonObject())
                });

                hooks = project.hook.getHookByUnloadKeyPoint(await kp);
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
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;

                let sess:HookSession = await this.newSession();

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




HOOK_WEB_API.addAsyncAuthenticatedRoute(
    '/libs/update',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;
                const script = await project.hook.buildAgentScript();

                res.set('Content-Type', 'application/octet-stream');
                res.set('Content-Length', script.length+"");
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
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                let sess:HookSession[];
                const data = {sess:[]};
                let signature:string = null;


                if(req.query.sess!=null){
                    sess = [ await project.hook.getSession( req.query.sess  as string)];
                }else{
                    sess = await project.hook.getSessions();
                }


                // collect only sessions containing messages for the given method/function
                if(req.query.node){
                    signature = decodeURIComponent(Util.b64_decode(decodeURIComponent(req.query.id as string)));

                    switch(parseInt(req.query.node as string )){
                        case NodeInternalType.METHOD:
                        case NodeInternalType.FUNC:
                            sess.map( (vHSess:HookSession)=>{
                                if (!vHSess.hasMessages()) return;

                                const msg:any[] = [];
                                const msgs = vHSess.messages();


                                msgs.map( x => {
                                    if(x.type !== RuntimeEventType.HOOK) return false;

                                    if(x.node.filter( y => (y.getUID() == signature)).length > 0){
                                        msg.push( x.toJsonObject());
                                    }
                                });

                                if(msg.length > 0){
                                    data.sess.push(msg);
                                }
                            });
                            break;
                    }


                }else{
                    sess.map( x => {
                        data.sess.push(x.toJsonObject({ offset:0, size:0 }));
                    })
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
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // 2 cases :
                // - get message by targeted node
                // - get message by session
                // - both

                // gather sessions
                let sessions:HookSession[];
                if( req.query.hasOwnProperty('sess') != null   && req.query.sess != null){
                    if(req.query.sess == 'last'){
                        sessions = [project.hook.lastSession()];
                    }else{
                        sessions = [await project.hook.getSession(req.query.sess  as string)];
                    }
                }else{
                    sessions = await project.hook.getSessions();
                }

                if (sessions==null || sessions.length==0) {
                    throw HookManagerException.HOOK_SESSION_NOT_FOUND();
                }

                // gather messages  with windowing
                let startAt, size;
                if(req.dxc.filt != null){
                    startAt = (req.dxc.filt as WebApiWindowing).getStartOffset();
                    size = (req.dxc.filt as WebApiWindowing).getLength();
                }else{
                    startAt = parseInt(req.query.startAt as string);
                    size = parseInt(req.query.size as string);
                }

                const data = {};
                sessions.map( (vSess:HookSession)=>{
                    data[vSess.getSessionID()] = []
                    vSess.getMessages(startAt,size).map((vMsg)=>{
                        data[vSess.getSessionID()].push(vMsg.toJsonObject());
                    })
                });

                $.sendSuccess(res, data);

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
    '/flush/:type',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;


                if(req.params.type!="all"
                    && project.getHookManager().getSupportedHookTypes().indexOf(req.params.type)==-1){
                    $.sendSuccess(res, "Invalid hook type. Supported : all, "+
                        project.getHookManager().getSupportedHookTypes().concat(", "));
                    return;
                }

                switch (req.params.type){
                    case "all":
                        project.getHookManager().flushGeneratedCode();
                        break;
                    default:
                        project.getHookManager().flushGeneratedCode(req.params.type);
                        break;
                }


                $.sendSuccess(res, {});

            }catch(err){
                Logger.error("[API][HOOK] Hook messages cannot be flushed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook messages cannot be flushed. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


HOOK_WEB_API.addAuthenticatedRoute(
    '/new/:method',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;


                let meth:ModelMethod|ModelFunction;
                let probe:AbstractHook;
                let file:ModelFile = null;
                let opts:any = {};
                let newHook = false;

                const targetType = req.body.__ ;

                // get reference to the targeted node
                if(targetType === NodeInternalType.FUNC){

                    meth = project.find.get.func(Util.decodeURI(Util.b64_decode(Util.decodeURI(req.params.method))));
                    if (meth == null) {
                        Logger.error("[API][HOOK::FUNCTION] Function not found "+Util.b64_decode(Util.decodeURI(req.params.method)));
                        throw new Error("Method or Function not found");
                    }

                    // get the reference to the file where the function is declared
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

                    // if declaring file is found, information are added to hook options
                    // to allow to use relative offset and symbol, instead of absolute offset
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

                }
                // same as above with Java
                else if(targetType === NodeInternalType.METHOD){
                    meth = project.find.get.method(Util.decodeURI(Util.b64_decode(req.params.method)));
                    if (meth == null) {
                        Logger.error("[API][HOOK::METHOD] Method not found "+Util.decodeURI(Util.b64_decode(req.params.method)));
                        throw new Error("Method or Function not found");
                    }
                }else{
                    throw new Error("The target node is not supported.");
                }

                // prevent tries to hook class initializer (static blocks)
                if((meth.__ === NodeInternalType.METHOD) && (meth.name == "<clinit>")){
                    throw new Error("Static blocks (<clinit>) cannot be hooked");
                }

                // get instance for key points
                opts.loadKP = (req.body['loadkp']!=null ? await project.getKeyPointManager().getKeyPointByAttr({name:req.body['loadkp']}) : null);
                opts.unloadKP = (req.body['unloadkp']!=null ? await project.getKeyPointManager().getKeyPointByAttr({name:req.body['unloadkp']}) : null);

                // prepare others options
                opts.location = req.body['loc'];
                opts.weight = req.body['weight'];
                opts.behavior = req.body['behavior'];

                // search if the target function is already hooked, with same load/unload key point, and get it
                probe = project.hook.getProbe(meth, opts);

                // if the hook not exists, it is created
                if (probe == null) {
                    // create hook
                    if(meth.__ === NodeInternalType.METHOD){
                        probe = await project.hook.createJavaMethodHook(meth as ModelMethod, opts);
                    }else{
                        probe = await project.hook.createNativeFunctionHook(meth as ModelFunction, opts);
                    }
                    newHook = true;

                    // generate hook code body
                    if(req.body['lang']!=null
                        && [
                            TargetLanguage.JS,
                            TargetLanguage.TS
                        ].indexOf(req.body['lang'])>-1){

                        probe.build(req.body['lang']);
                    }else{
                        probe.build(TargetLanguage.TS);
                    }
                }

                // if a behavior is defined, update hook to add relevant fragments
                if(probe != null && opts.behavior != null){
                    // modify hook to merge existing with new
                    probe.extends( opts);
                }

                // add fragment
                //const fragOpts = req.body['frag'];
                if(opts.behavior != null){

                    if(opts.location.before){
                        probe.appendBefore(
                            project.hook.presets.generateFragment(probe, opts.behavior, 'before'), false
                        );
                    }
                    if(opts.location.after){
                        probe.appendAfter(
                            project.hook.presets.generateFragment(probe, opts.behavior, 'after'), false
                        );
                    }
                    if(opts.location.replace){
                        probe.appendAfter(
                            project.hook.presets.generateFragment(probe, opts.behavior, 'replace'), false
                        );
                    }



                    // generate hook code body
                    if(req.body['lang']!=null
                        && [
                            TargetLanguage.JS,
                            TargetLanguage.TS
                        ].indexOf(req.body['lang'])>-1){

                        probe.build(req.body['lang']);
                    }else{
                        probe.build(TargetLanguage.TS);
                    }
                }

                // save and create
                await project.hook.save(probe, newHook);

                $.sendSuccess( res, { hook: probe.toJsonObject(), hookid: probe.getGUID(), enable: probe.isEnable() });

            }catch(err){
                Logger.error("[API][HOOK] Hook messages cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Hook messages cannot be retrieved. Cause : " + err.message);
            }
        },
        'put': function (req:DelegateRequest, res:DelegateResponse):any {
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

                const status:string = req.query.enable as string;
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

