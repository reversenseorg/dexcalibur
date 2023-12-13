import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import {Script} from "../Script.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const SCRIPT_WEB_API: DelegateWebApi = new DelegateWebApi();

function doSecurityChecks( pRequest:DelegateRequest, pWebServer:WebServer):DexcaliburProject {


    let project = null;

    if(pRequest.body['project']!=null){
        project = pWebServer.context.getActiveProjects(pRequest.dxc.sess.getUserAccount())[pRequest.body['project']];
    }else if(pRequest.dxc.project != null){
        project = pRequest.dxc.project;
    }

    if(project == null || !project.isReady()) {
        throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
    }

    return project;
}

/**
 * /api/application/cmp?type=[dex|ks|libs|strings] ...
 */
SCRIPT_WEB_API.addAuthenticatedRoute(
    '/list',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                project = doSecurityChecks(req, $);

                // ========== LOGIC
                const scripts = project.scriptManager.listScripts();
                const data = [];
                scripts.map( x => {
                    data.push({
                        sid: x.sid,
                        name: x.name,
                        description: x.description,
                        code: x.code,
                    });
                })
                req.dxc.$.sendSuccess( res, JSON.stringify(data));
            }catch(err){
                req.dxc.$.sendError( res, err.message);
            }
        }
    },{
        async: false,
        readProject: true
    }
);

/**
 * Script CRUD
 * Route : /edit/:sid
 */
SCRIPT_WEB_API.addAuthenticatedRoute(
    '/edit/:sid',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                project = doSecurityChecks(req, $);

                // ========== LOGIC
                const script = project.scriptManager.getScript(parseInt(req.params.sid as  string));
                const data = {
                    sid: script.sid,
                    name: script.name,
                    description: script.description,
                    code: script.code,
                };
                req.dxc.$.sendSuccess( res, JSON.stringify(data));
            }catch(err){
                req.dxc.$.sendError( res, err.message);
            }
        },
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS
                project = doSecurityChecks(req, $);

                // ========== LOGIC

                // TODO : check if current user has rights
                const script = new Script(req.body);

                // save script
                project.scriptManager.newScript(script);
                const data = {};
                req.dxc.$.sendSuccess( res, JSON.stringify(data));
            }catch(err){
                req.dxc.$.sendError( res, err.message);
            }
        }
    }
);

SCRIPT_WEB_API.addAuthenticatedRoute(
    '/delete',
    {
        'delete': function (req:DelegateRequest, res:DelegateResponse):any {
            try{
                if(req.dxc.project == null){
                    throw new Error("Project UID is missing or you have not right privileges.")
                }
                req.dxc.$.sendSuccess( res, req.dxc.project.find.provider('name:.*').toJsonObject({}));
            }catch(err){
                req.dxc.$.sendError( res, err.message);
            }
        }
    }
);

