/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
SCRIPT_WEB_API.addAsyncAuthenticatedRoute(
    '/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
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
SCRIPT_WEB_API.addAsyncAuthenticatedRoute(
    '/edit/:sid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
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
        'post': async (req:DelegateRequest, res:DelegateResponse) =>{
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

SCRIPT_WEB_API.addAsyncAuthenticatedRoute(
    '/delete',
    {
        'delete': async (req:DelegateRequest, res:DelegateResponse) =>{
            try{
                if(req.dxc.project == null){
                    throw new Error("Project UID is missing or you have not right privileges.")
                }
                req.dxc.$.sendSuccess( res, req.dxc.project.find.provider('name:/.*/').toJsonObject({}));
            }catch(err){
                req.dxc.$.sendError( res, err.message);
            }
        }
    }
);

