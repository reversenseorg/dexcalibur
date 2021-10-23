import {DelegateWebApi} from "./DelegateWebApi";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer";
import {Request, Response} from "express";
import * as Log from "../Logger";
import DexcaliburProject from "../DexcaliburProject";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";
import Util from "../Utils";
import AndroidActivity from "../android/AndroidActivity";
import AndroidReceiver from "../android/AndroidReceiver";
import AndroidProvider from "../android/AndroidProvider";
import AndroidService from "../android/AndroidService";
import {AndroidPermission} from "../android/Permissions";
import {FinderResult} from "../FinderResult";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const ANDROID_WEB_API: DelegateWebApi = new DelegateWebApi();



ANDROID_WEB_API.addAuthenticatedRoute(
    '/content',
    {
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.getAppAnalyzer().dumpManifest());
            }catch(err){
                Logger.error("[API][CODE] Search query failed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Search query failed. Cause : " + err.message);
            }
        },
        'put': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                // ========== SECURITY CHECKS

                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                const newCode:string = req.body['code[]'].join("\n");
                //hook.script = newCode;
                project.getAppAnalyzer().updateManifest(newCode);

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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.activity('name:.*').toJsonObject());
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Activities not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Activities not found. Cause : " + err.message);
            }
        }
    }
);



ANDROID_WEB_API.addAuthenticatedRoute(
    '/receivers',
    {
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.receiver('name:.*').toJsonObject());
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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.provider('name:.*').toJsonObject());
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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.service('name:.*').toJsonObject());
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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ========== LOGIC + RESPONSE
                $.sendSuccess( res, project.find.permission('name:.*').toJsonObject());
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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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

                $.sendSuccess( res, act.toJsonObject());
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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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

                $.sendSuccess( res, act.toJsonObject());
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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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

                $.sendSuccess( res, act.toJsonObject());
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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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

                $.sendSuccess( res, act.toJsonObject());
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
        'get': function (req:Request, res:Response):any {
            let $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

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
                const perm:FinderResult = project.find.permission("name:" + Util.RegExpEscape(id));

                if(perm==null){
                    throw new Error("Invalid permission ID : "+id);
                }

                //res.set('Content-Type', 'text/json');
                $.sendSuccess( res, perm.toJsonObject()[0]);
            }catch(err){
                Logger.error("[API][ANDROID ANALYZER] Permission not found. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Permission not found. Cause : " + err.message);
            }
        }
    }
);
