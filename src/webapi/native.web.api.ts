import {DelegateWebApi} from "./DelegateWebApi";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer";
import {Request, Response} from "express";
import * as Log from "../Logger";
import ModelFile from "../ModelFile";
import DexcaliburProject from "../DexcaliburProject";
import {AuthenticationException} from "../errors/AuthenticationException";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException";
import {ModelFunction} from "../ModelFunction";
import {FinderResult} from "../FinderResult";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export const NATIVE_WEB_API: DelegateWebApi = new DelegateWebApi();



NATIVE_WEB_API.addAsyncAuthenticatedRoute(
    '/func',
    {
        'get': async function (req:Request, res:Response):Promise<any> {
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
                if(req.query['uid']==null){
                    throw new Error("[NATIVE::FUNC] #NAT_3 Invalid Function signature");
                }

                const fn:ModelFunction = project.find.get.func(
                    decodeURIComponent(req.query['uid'])
                );

                if(fn==null){
                    throw new Error("[NATIVE::FUNC] #NAT_4 Function not found");
                }

                if(req.query['cmd']!=null){
                    const cmd = req.query['cmd'].split(':');

                    const file:FinderResult = project.find.file('_uid:'+fn.getDeclaringFile());
                    if(file.count()==0){
                        throw new Error("[NATIVE::FUNC] #NAT_45 Declaring file not found");
                    }

                    let success = -1;
                    if(project.analyze.getNativeAnalyzer().requireAnalysis( file.get(0) as ModelFile, cmd, {fn:fn})){
                        Logger.info("Executing native analysis of func : ",cmd.join(':'));
                        success = await project.analyze.getNativeAnalyzer().scan( file.get(0) as ModelFile, cmd, { fn:fn });
                    }else{

                        Logger.info("Command(s) : "+cmd.join(':')+' already executed for '+fn.getSignature());
                        success = 1;
                    }

                    if(success>-1)
                        $.sendSuccess(res, fn.toJsonObject());
                    else
                        $.sendError(res,  fn.toJsonObject());


                }else{
                    $.sendSuccess(res, fn.toJsonObject());
                }

            }catch(err){
                Logger.error("[API][NATIVE] Fail to retrieve native function. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Fail to retrieve native function. Cause : " + err.message);
            }
        }
    }
);


NATIVE_WEB_API.addAuthenticatedRoute(
    '/analysis',
    {
        'get':  function (req:Request, res:Response):any {
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
                if(req.query['uid']==null){
                    throw new Error("[NATIVE::ANALYSIS] #NAT_1 Invalid File UID");
                }

                const search:FinderResult = project.find.file('_uid:'+req.query['uid']);
                if(search==null || search.count()==0){
                    throw new Error("[NATIVE::ANALYSIS] #NAT_2 File not found");
                }

                const cmd = (req.query['cmd']!=null ?  req.query['cmd'].split(':') : ['*']);

                if(project.analyze.getNativeAnalyzer().requireAnalysis( search.get(0), cmd, null)){

                    Logger.info("Executing native analysis : ",cmd.join(':'));
                    project.analyze.getNativeAnalyzer().scan(search.get(0) as ModelFile, cmd);
                }

                $.sendSuccess( res, (search.get(0) as ModelFile).toJsonObject({ cmd:cmd }));
            }catch(err){
                Logger.error("[API][NATIVE] Perform native analysis of function failed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Perform native analysis of function failed. Cause : " + err.message);
            }
        }
    }
);


