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
import WebServer, {HTTP_CODE_SUCCESS} from "../WebServer.js";
import * as Log from "../Logger.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const HEALTH_WEB_API: DelegateWebApi = new DelegateWebApi("HEALTH");


/* ================ IMPORTANT ================
 PRIVATE API :
 - This API contains Public (not authenticated) endpoints, it must be not exposed to outside
 - TODO : deny external access by configuration of reverse proxy
 ============================================= */
HEALTH_WEB_API.addAsyncAuthenticatedRoute(
    '/uuid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                res.send($.context.getNodeUUID());
            }catch(err){
                res.send("");
            }
        }
    },{
        lazyProject: true
    }
);


HEALTH_WEB_API.addAsyncPublicRoute(
    '/started',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {

            try{
                res.sendStatus(200);
            }catch(err){
                res.sendStatus(500);
            }
        }
    },{
        lazyProject: true
    }
);


HEALTH_WEB_API.addAsyncPublicRoute(
    '/ready',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(await $.context.getOrgManager().listOrganizations($.context.getInternalAcc())){
                    $.sendSuccess(res, 'OK', {raw:true});
                }else{
                    $.sendSuccess(res, 'NOK', {raw:true});
                }
            }catch(err){
                console.log(" Health check failed. Server is not ready.", err);
                //res.sendStatus(500)
                $.sendSuccess(res, 'NOK', {raw:true});
            }
        }
    },{
        lazyProject: true
    }
);
