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
import {Device} from "../Device.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import DataScope from "../DataScope.js";
import * as _path_ from "path";
import {IDbCollection, IDbIndex} from "../persist/orm/DbAbstraction.js";
import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";
import * as path from "path";
import Inspector from "../Inspector.js";
import InspectorManager, {InspectorMap} from "../InspectorManager.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import FridaHelper from "../FridaHelper.js";
import {InspectorEditor} from "../inspector/InspectorEditor.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const INSPECTOR_WEB_API: DelegateWebApi = new DelegateWebApi();



/**
 *  Middleware to route requests to Inspector's web API
 */
INSPECTOR_WEB_API.addAsyncAuthenticatedRoute(
    '/inspector-api/:inspectorID',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // ========== LOGIC
                const insp:Inspector = InspectorManager.getInstance().getEnabledInspector(
                    project,
                    req.params.inspectorID
                );

                if (insp == null) {
                    throw new Error("Inspector cannot be retrieved");
                    return false;
                }

                insp.performGet(req, res);
            }catch(err){
                Logger.error("[API][PLUGINS] Request cannot be forwarded to inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Request cannot be forwarded to inspector. Cause : " + err.message);
            }


        },
        'post': async (req:DelegateRequest, res:DelegateResponse) =>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;

                // ========== LOGIC
                const insp:Inspector = InspectorManager.getInstance().getEnabledInspector(
                    project,
                    req.params.inspectorID
                );

                if (insp == null) {
                    throw new Error("Inspector cannot be retrieved");
                    return false;
                }

                insp.performPost(req, res);
            }catch(err){
                Logger.error("[API][PLUGINS] Request cannot be forwarded to inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Request cannot be forwarded to inspector. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

/**
 * To list all inspectors
 *
 */
INSPECTOR_WEB_API.addAsyncAuthenticatedRoute(
    '/inspectors/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                if(req.query['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                // ========== LOGIC
                const insp:InspectorMap = project.getInspectors()
                const data = [];

                for(const uid in insp){
                    data.push( insp[uid].toJsonObject());
                }

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][PLUGINS] List of inspectors cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "List of inspectors cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


/**
 * .../inspector/state?inspector=<UID>&_puid=<PUID>
 */
INSPECTOR_WEB_API.addAsyncAuthenticatedRoute(
    '/inspector/state',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                if(req.query['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                if(typeof req.query['insp']!=='string'){
                    throw new Error("Invalid inspector UID");
                }

                const insp = project.getInspector(req.query['insp'] as string);
                /*
                const insp = $.context
                                            .getInspectorManager()
                                            .getEnabledInspector(project, req.query['insp'] as string);
                   */
                // ========== LOGIC
                $.sendSuccess(res, {
                    state: insp.toJsonObject(),
                    plugin: (insp.factory!=null ? insp.factory.toJsonObject() : null)
                });
            }catch(err){
                Logger.error("[API][PLUGINS] Request cannot be forwarded to inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Request cannot be forwarded to inspector. Cause : " + err.message);
            }


        }
    },{
        readProject: true
    }
);



INSPECTOR_WEB_API.addAsyncAuthenticatedRoute(
    '/inspector/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                if(req.query['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }



                // ========== LOGIC
                const insp:InspectorMap = project.getInspectors()
                const data = [];

                for(const uid in insp){
                    data.push( insp[uid].toJsonObject());
                }


                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][PLUGINS] Request cannot be forwarded to inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Request cannot be forwarded to inspector. Cause : " + err.message);
            }


        }
    },{
        readProject: true
    }
);


// create InspectorFactory and one instance of Inspector from this factory
INSPECTOR_WEB_API.addAsyncAuthenticatedRoute(
    '/inspector/editor',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) =>{

            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                if(req.query['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }


                // ========== LOGIC
                const insp:InspectorEditor = project.getInspectorEditor();


                $.sendSuccess(res, {});
            }catch(err){
                Logger.error("[API][PLUGINS] Request cannot be forwarded to inspector. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Request cannot be forwarded to inspector. Cause : " + err.message);
            }


        }
    },{
        readProject: true
    }
);

