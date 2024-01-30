import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import Util from "../Utils.js";
import AndroidActivity from "../android/AndroidActivity.js";
import AndroidReceiver from "../android/AndroidReceiver.js";
import AndroidProvider from "../android/AndroidProvider.js";
import AndroidService from "../android/AndroidService.js";
import {AndroidPermission} from "../android/Permissions.js";
import {FinderResult} from "../search/FinderResult.js";
import AndroidAppAnalyzer from "../AndroidAppAnalyzer.js";
import {NodeInternalType} from "../NodeInternalType.js";
import AndroidComponent from "../android/AndroidComponent.js";
import {AndroidCodeAnalyzer} from "../android/analyzer/AndroidCodeAnalyzer.js";
import {AndroidAnalyzerException} from "../errors/android/AndroidAnalyzerException.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const ANDROID_WEB_API: DelegateWebApi = new DelegateWebApi();



ANDROID_WEB_API.addAuthenticatedRoute(
    '/content',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                $.sendSuccess( res, (project.getAppAnalyzer() as AndroidAppAnalyzer).dumpManifest());
            }catch(err){
                Logger.error("[API][CODE] Search query failed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Search query failed. Cause : " + err.message);
            }
        },
        'put': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                const newCode:string = req.body['code[]'].join("\n");
                //hook.script = newCode;
                (project.getAppAnalyzer() as AndroidAppAnalyzer).updateManifest(newCode);

                $.sendSuccess( res, {});
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Android manifest cannot be updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "[API][ANDROID ANALYZER] Android manifest cannot be updated. Cause : " + err.message);
            }
        }
    }
);


ANDROID_WEB_API.addAuthenticatedRoute(
    '/activities',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.activity('name:/.*/').toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Activities not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Activities not found. Cause : " + err.message);
            }
        }
    }
);



ANDROID_WEB_API.addAsyncAuthenticatedRoute(
    '/component/:uid',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                let depth:number;
                if(req.query.depth != null){
                    const unsafeDepth = parseInt( req.query.depth  as string, 10 );
                    depth = (unsafeDepth >= -1 && unsafeDepth < Infinity)? unsafeDepth : AndroidCodeAnalyzer.XREF_MAX_DEPTH;
                }else{
                    depth = AndroidCodeAnalyzer.XREF_MAX_DEPTH;
                }

                let cmp:AndroidComponent;
                switch (req.body.type){
                    case NodeInternalType.ANDROID_ACTIVITY:
                        cmp = project.find.get.activity(req.body.uid);
                        break;
                    case NodeInternalType.ANDROID_PROVIDER:
                        cmp = project.find.get.provider(req.body.uid);
                        break;
                    case NodeInternalType.ANDROID_RECEIVER:
                        cmp = project.find.get.receiver(req.body.uid);
                        break;
                    case NodeInternalType.ANDROID_SERVICE:
                        cmp = project.find.get.service(req.body.uid);
                        break;
                }

                const apiXref = (project.getAppAnalyzer() as AndroidAppAnalyzer).scanComponentXrefToAPI(cmp,depth,true);

                // ========== LOGIC + RESPONSE
                //$.sendSuccess( res, apiXref );

                if(apiXref!=null){
                    $.sendSuccess( res, AndroidCodeAnalyzer.classXrefListToJson(apiXref));
                }else{
                    throw AndroidAnalyzerException.ANDROID_XREF_NOT_PROCESSED(req.body.uid);
                }
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Component not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Component not found. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);



ANDROID_WEB_API.addAuthenticatedRoute(
    '/receivers',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.receiver('name:/.*/').toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Receivers not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Receivers not found. Cause : " + err.message);
            }
        }
    }
);



ANDROID_WEB_API.addAuthenticatedRoute(
    '/providers',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.provider('name:/.*/').toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Providers not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Providers not found. Cause : " + err.message);
            }
        }
    }
);


ANDROID_WEB_API.addAuthenticatedRoute(
    '/services',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.service('name:/.*/').toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Services not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Services not found. Cause : " + err.message);
            }
        }
    }
);



ANDROID_WEB_API.addAuthenticatedRoute(
    '/permissions',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.permission('name:/.*/').toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Permissions not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Permissions not found. Cause : " + err.message);
            }
        }
    }
);


// receivers

ANDROID_WEB_API.addAuthenticatedRoute(
    '/activity/:id',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                const name:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const act:AndroidActivity = project.find.get.activity(name);

                if(act==null){
                    throw new Error("Activity not found : "+name);
                }

                $.sendSuccess( res, act.toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Activities not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Activities not found. Cause : " + err.message);
            }
        }
    }
);


ANDROID_WEB_API.addAuthenticatedRoute(
    '/receiver/:id',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                const name:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const act:AndroidReceiver = project.find.get.receiver(name);

                if(act==null){
                    throw new Error("Given ID is invalid :  "+name);
                }

                $.sendSuccess( res, act.toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Receiver not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Receiver not found. Cause : " + err.message);
            }
        }
    }
);



ANDROID_WEB_API.addAuthenticatedRoute(
    '/provider/:id',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                const name:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const act:AndroidProvider = project.find.get.provider(name);

                if(act==null){
                    throw new Error("Invalid provider ID : "+name);
                }

                $.sendSuccess( res, act.toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Provider not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Provider not found. Cause : " + err.message);
            }
        }
    }
);



ANDROID_WEB_API.addAuthenticatedRoute(
    '/service/:id',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                const name:string = Util.decodeURI(Util.b64_decode(req.params.id));
                const act:AndroidService = project.find.get.service(name);

                if(act==null){
                    throw new Error("Invalid service ID : "+name);
                }

                $.sendSuccess( res, act.toJsonObject({}));
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Service not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Service not found. Cause : " + err.message);
            }
        }
    }
);



ANDROID_WEB_API.addAuthenticatedRoute(
    '/permission/:id',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                const id:string = Util.b64_decode(req.params.id);
                const perm:FinderResult = project.find.permission("name:/" + Util.RegExpEscape(id)+"/");

                if(perm==null){
                    throw new Error("Invalid permission ID : "+id);
                }

                //res.set('Content-Type', 'text/json');
                $.sendSuccess( res, perm.toJsonObject({})[0]);
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Permission not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Permission not found. Cause : " + err.message);
            }
        }
    }
);
