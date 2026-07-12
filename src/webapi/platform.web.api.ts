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

import {DelegateRequest, DelegateResponse, DelegateWebApi, HTTP_VERB} from "./DelegateWebApi.js";
import {Device} from "../Device.js";
import WebServer from "../WebServer.js";
import DeviceManager from "../DeviceManager.js";
import FridaHelper from "../FridaHelper.js";
import {Router, Request, Response} from "express";
import * as Log from "../Logger.js";
import PlatformManager from "../platform/PlatformManager.js";
import Platform from "../platform/Platform.js";
import {PlatformManagerException} from "../errors/PlatformManagerException.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import AssuranceReport from "../audit/common/AssuranceReport.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PLATFORM_WEB_API: DelegateWebApi = new DelegateWebApi();

PLATFORM_WEB_API.addAsyncAuthenticatedRoute(
    '/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;

            try{
                $.sendSuccess( res, {
                    platforms: PlatformManager.getInstance().getRemote()
                });
            }catch(err){
                Logger.error("[API][PLATFORM MGT] Server cannot start : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "[PLATFORM MGT] Platforms cannot be listed : "+err.message);
            }
        }
    },{
        mcp: {
            [HTTP_VERB.GET]: {
                name:'platform-list',
                uri: '/list',
                summary: `To list all platforms available, remotely  or locally installed. `,
                parameters: [],
                responses: [{
                    description: "Return two list. The list of **installed** platforms and the list of **remote** platforms available in store" ,
                    schema: { type: 'object', properties: { installed: { type: 'object' },  remote: { type: 'object' }, }}
                }]
            }
        }
    }
)


PLATFORM_WEB_API.addAsyncAuthenticatedRoute(
    '/install',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse)=>{

            let $:WebServer = req.dxc.$;

            try{

                const mgr:PlatformManager = PlatformManager.getInstance();
                const platform:Platform = mgr.getRemotePlatform(req.body['uid']);

                if(platform == null){
                    throw PlatformManagerException.PLATFORM_NOT_FOUND();
                }

                $.sendSuccess( res, {
                    status: await mgr.install(platform)
                });
            }catch(err){
                Logger.error("[API][PLATFORM MGT] Platforms cannot be installed : "+err.message+"\n\t"+err.stack);
                $.sendError(res, "[PLATFORM MGT] Platforms cannot be installed : "+err.message);
            }
        }
    },{
        mcp: {
            [HTTP_VERB.POST]: {
                name:'platform-install-remote',
                uri: '/install',
                summary: `To install the remote platform identified by the specified UID 'uid' in body.`,
                parameters: [{
                    name: 'uid',
                    required: true,
                    description: Platform.TYPE.getPrimaryKey()._dscr,
                    schema: Platform.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "Return the status of the installation process.",
                    schema: { type: 'object', properties: { status: { type: 'boolean' }}}
                }]
            }
        }
    }
)
