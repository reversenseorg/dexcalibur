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
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import DexcaliburProject from "../DexcaliburProject.js";
import HookSession, {RuntimeEventFilter} from "../HookSession.js";
import FridaHelper from "../FridaHelper.js";
import Hook from "../Hook.js";
import Util from "../Utils.js";
import {HookManager, HookSetList} from "../hook/HookManager.js";
import ModelMethod from "../ModelMethod.js";
import {ModelFunction} from "../ModelFunction.js";
import ModelFile from "../ModelFile.js";
import {AbstractHook} from "../hook/AbstractHook.js";
import {NodeInternalType}
from "@reversense/dxc-core-api";;
import KeyPoint from "../hook/KeyPoint.js";
import HookStrategy from "../hook/HookStrategy.js";
import {RuntimeEvent, RuntimeEventType} from "../hook/RuntimeEvent.js";
import {InspectorFactoryException} from "../errors/InspectorFactoryException.js";
import {HookManagerException} from "../errors/HookManagerException.js";
import {WebApiWindowing} from "./internals/WebApiWindowing.js";
import {TargetLanguage} from "../hook/common.js";
import {ScriptCompilerOutput} from "../hook/HookWorkspace.js";
import {RuntimeSession} from "../runtime/RuntimeSession.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const RUNTIME_WEB_API: DelegateWebApi = new DelegateWebApi();



RUNTIME_WEB_API.addAsyncAuthenticatedRoute(
    '/session/:sessid/stats',
    {
        'post': async  (req:DelegateRequest, res:DelegateResponse) => {
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


RUNTIME_WEB_API.addAsyncAuthenticatedRoute(
    '/session/:sessid/stop',
    {
        'post': async  (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;

                // get hook instance by ID
                await project.getRuntimeManager().stopSession(req.user, req.params.sessid);

                $.sendSuccess(res,  "done");

            }catch(err){
                Logger.error("[API][HOOK] Hooked application cannot be detached. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hooked application cannot be detached. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


RUNTIME_WEB_API.addAsyncAuthenticatedRoute(
    '/session/:sessid/pause',
    {
        'post': async  (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;

                // get hook instance by ID
                await project.getRuntimeManager().pause(req.user, req.params.sessid);

                $.sendSuccess(res,  "done");

            }catch(err){
                Logger.error("[API][HOOK] Hooked application cannot be detached. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hooked application cannot be detached. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

RUNTIME_WEB_API.addAsyncAuthenticatedRoute(
    '/sessions/stats',
    {
        'get': async  (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{

                project = req.dxc.project;

                // get hook instance by ID
                const sessions:HookSession[] = await project.rtmgr.getSessionsStats(req.user);
                $.sendSuccess(res,  sessions.map(s=>s.toJsonObject()));
            }catch(err){
                Logger.error("[API][HOOK] Hooked application cannot be detached. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hooked application cannot be detached. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

RUNTIME_WEB_API.addAsyncAuthenticatedRoute(
    '/sessions/list',
    {
        'get': async  (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;
                const sessions:RuntimeSession[] = await project.rtmgr.listSessions(req.user, project.getUID());
                $.sendSuccess(res,  sessions.map(s=>s.toJsonObject()));
            }catch(err){
                Logger.error("[API][HOOK] Hooked application cannot be detached. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hooked application cannot be detached. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


RUNTIME_WEB_API.addAsyncAuthenticatedRoute(
    '/events/list',
    {
        'get': async  (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                project = req.dxc.project;
                const evt:RuntimeEvent<any>[] = await project.rtmgr.listEvents(
                    req.user, project.getUID(),
                    {
                        sess: req.query.sessid as string,
                        type: req.query.type as RuntimeEventType,
                        offset: req.query.offset ?? -1,
                        size: req.query.size ?? -1
                    });
                $.sendSuccess(res,  evt.map(s=>s.toJsonObject()));
            }catch(err){
                Logger.error("[API][HOOK] Hooked application cannot be detached. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Hooked application cannot be detached. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


