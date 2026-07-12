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
import DeviceManager from "../DeviceManager.js";
import FridaHelper from "../FridaHelper.js";
import {Router, Request, Response} from "express";
import * as Log from "../Logger.js";
import {AuthenticationException} from "../errors/AuthenticationException.js";
import {DexcaliburProjectException} from "../errors/DexcaliburProjectException.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {FridaHelperException} from "../errors/FridaHelperException.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PROBE_SERVER_WEB_API: DelegateWebApi = new DelegateWebApi();

PROBE_SERVER_WEB_API.addAsyncAuthenticatedRoute(
    '/start',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse)=>{

            let device:Device = null;
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject = null;

            try{
                // ========== SECURITY CHECKS

                /*if (req.dxc == null || !$.context.getUserService().verifySession(req.dxc.sess)) {
                    throw AuthenticationException.AUTHENTICATION_FAILED();
                }

                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.dxc.project != null){
                    project = req.dxc.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }*/

                // ==== LOGIC

                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.body['dev']);
                }else{
                    project = req.project; //dxc.project;
                    // todo : remove default device
                    if(project!=null){
                        device = project.getDevice();
                    }else{
                        throw  DexcaliburProjectException.INVALID_NAME();
                    }
                }

                // req.body['path']

                // TODO : detect if frida connection works
                const serverStarted = await FridaHelper.startServer( device, {
                    path: req.body['path'],
                    privileged: (req.body['privileged']=="true"? true: false),
                    timeout: req.body['timeout']!=null ? parseInt(req.body['timeout'],10) : 250
                });

                if(serverStarted){
                    $.sendSuccess(res, {});
                }else{
                    throw FridaHelperException.SPAWN_FAILED("unknow error")
                }
            }catch(err){
                Logger.error("[API][HOOK SERVER] Server cannot start : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    },{
        readProject: true
    }
)

PROBE_SERVER_WEB_API.addAsyncAuthenticatedRoute(
    '/stop',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse)=>{

            let device:Device = null;
            let project:DexcaliburProject = null;
            let $:WebServer = req.dxc.$;

            try{
                // ========== SECURITY CHECKS


                if(req.body['project']!=null){
                    project = $.context.getActiveProjects(req.dxc.sess.getUserAccount())[req.body['project']];
                }else if(req.project != null){
                    project = req.project;
                }

                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ==== lOGIC

                if(req.body['dev']){
                    device = DeviceManager.getInstance().getDevice(req.body['dev']);
                }else{
                    device = project.getDevice();
                }
                // TODO : detect if frida connection works
                if(await FridaHelper.stopServer( device )){
                    $.sendSuccess(res, {});
                }else{
                    $.sendError(res, "Hook server cannot be stopped");
                }
            }catch(err){
                Logger.error("[API][HOOK SERVER] Server cannot be stopped : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "Hook server cannot be stopped");
            }
        }
    }
)


PROBE_SERVER_WEB_API.addAsyncAuthenticatedRoute(
    '/status',
    {
        'get': async  (req:DelegateRequest, res:DelegateResponse):Promise<any> => {

            let device: Device = null;
            let project:DexcaliburProject = null;
            let $: WebServer = req.dxc.$;

            try {
                // ========== SECURITY CHECKS
                project = req.dxc.project;




                if(project == null || !project.isReady()) {
                    throw DexcaliburProjectException.NO_PROJECT_SPECIFIED();
                }

                // ==== lOGIC

                if (req.params.dev) {
                    device = DeviceManager.getInstance().getDevice(req.params.dev  as string);
                } else {
                    device = project.getDevice();
                }

                if(await FridaHelper.getServerStatus(device))
                    $.sendSuccess(res,{});
                else
                    $.sendError(res, 'Frida server not started')

            } catch (err) {
                Logger.error("[API][HOOK SERVER] Status cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError( res, 'Frida server status cannot be retrieved : '+err.message);
            }
        }
    }
);

