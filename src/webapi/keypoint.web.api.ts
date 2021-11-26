import {DelegateWebApi} from "./DelegateWebApi";
import {Device} from "../Device";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer";
import {Request, Response} from "express";
import * as Log from "../Logger";
import DexcaliburProject from "../DexcaliburProject";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";
import HookSession from "../HookSession";
import FridaHelper from "../FridaHelper";
import Hook from "../Hook";
import Util from "../Utils";
import {HookSetList} from "../hook/HookManager";
import HookMessage from "../HookMessage";
import ModelMethod from "../ModelMethod";
import {ModelFunction} from "../ModelFunction";
import ModelFile from "../ModelFile";
import KeyPointManager from "../hook/KeyPointManager";
import KeyPoint from "../hook/KeyPoint";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const KEYPOINT_WEB_API: DelegateWebApi = new DelegateWebApi();



KEYPOINT_WEB_API.addAuthenticatedRoute(
    '/list',
    {
        'get': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;
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

                // ========== LOGIC

                // get hook instance by ID
                const kpm:KeyPointManager = project.getKeyPointManager();
                const o:KeyPoint[] = [];

                kpm.getKeyPoints().map( (x:KeyPoint)=>{
                    o.push(x.toJsonObject());
                })
                $.sendSuccess(res,  o);
            }catch(err){
                Logger.error("[API][KEY POINTS] Key Points cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Key Points cannot be listed. Cause : " + err.message);
            }
        }
    }
);



