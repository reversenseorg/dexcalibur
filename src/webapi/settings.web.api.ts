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
import WebServer from "../WebServer.js";
import {Router, Request, Response} from "express";
import * as Log from "../Logger.js";
import {GlobalSettingsException} from "../errors/GlobalSettingsException.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {Settings} from "../Settings.js";
import ExternalSettings = Settings.ExternalSettings;
import {NodeType} from "@reversense/dexcalibur-orm";
import {ElixirUtils} from "../elixir/ElixirUtils.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const SETTINGS_WEB_API: DelegateWebApi = new DelegateWebApi();

SETTINGS_WEB_API.addAuthenticatedRoute(
    '/global',
    {
        'get': (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;
            let data:any = {}

            try{
                switch (req.query['type']){
                    /*case 'ext':
                        data = $.context.getSettings().getExternalSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'conn':
                        data = $.context.getSettings().getConnectionSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'srv':
                        data = $.context.getSettings().getServerSettings().toObject(SecurityZone.PUBLIC);
                        break;*/
                    case 'web':
                        data = $.context.getSettings().getWebserverSettings().toObject(SecurityZone.PUBLIC);
                        // override with current settings
                        data.http = $.context.getWebserver().getPort();
                        data.ws = $.context.getWebsocketServer().port;
                        break;

                    /*default:
                        data = {};
                        throw GlobalSettingsException.CATEGORY_UNKNOW();*/
                }




                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    }
)

/*
SETTINGS_WEB_API.addPublicRoute(
    '/import',
    {
        'post': (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;
            let data:any;

            try{
                switch (req.query['type']){
                    case 'ext':
                        data = $.context.getSettings().getExternalSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'srv':
                        data = $.context.getSettings().getServerSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'web':
                        data = $.context.getSettings().getWebserverSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'conn':
                        data = $.context.getSettings().getConnectionSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    default:
                        throw GlobalSettingsException.CATEGORY_UNKNOW();
                }



                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    }
)*/

SETTINGS_WEB_API.addAsyncAuthenticatedRoute(
    '/resources',
    {
        'get': (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                $.sendSuccess(res, ElixirUtils.exportDefinition( SecurityZone.PUBLIC));
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    }
)


SETTINGS_WEB_API.addAsyncAuthenticatedRoute(
    '/tools',
    {
        'get': (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;

            try{
                $.sendSuccess(res, $.getMcpRoutes());
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    }
)

/*
SETTINGS_WEB_API.addPublicRoute(
    '/import',
    {
        'post': (req:DelegateRequest, res:DelegateResponse)=>{

            const $:WebServer = req.dxc.$;
            let data:any;

            try{
                switch (req.query['type']){
                    case 'ext':
                        data = $.context.getSettings().getExternalSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'srv':
                        data = $.context.getSettings().getServerSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'web':
                        data = $.context.getSettings().getWebserverSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    case 'conn':
                        data = $.context.getSettings().getConnectionSettings().toObject(SecurityZone.PUBLIC);
                        break;
                    default:
                        throw GlobalSettingsException.CATEGORY_UNKNOW();
                }



                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][SETTINGS] Category cannot be retrieved : "+err.message+"\n\t"+err.stack);
                $.sendError(res, err.message);
            }
        }
    }
)*/
