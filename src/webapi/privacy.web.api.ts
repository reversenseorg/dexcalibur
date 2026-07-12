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
import * as Log from "../Logger.js";
import {LicenceManager} from "../credit/LicenceManager.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PRIVACY_WEB_API: DelegateWebApi = new DelegateWebApi();

// DEPRECATED ?

PRIVACY_WEB_API.addAsyncAuthenticatedRoute(
    '/dashboard',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:any = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN");

                const data = {
                    db_names: [],
                    dashboards: {}
                };

                scanner.listDashboards().map((vName)=>{
                    data.db_names.push(vName);
                    data.dashboards[vName] = scanner.getDashboard(vName).toJsonObject();
                });

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][PRIVACY] Privacy Dashboards are not accessible. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Privacy Dashboards are not accessible. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

PRIVACY_WEB_API.addAsyncAuthenticatedRoute(
    '/scan',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) =>{
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:any = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN");

                //scanner.hasCredit()
                /*scanner.scan({
                    trackersNet: true,
                    trackersLib: true,

                    perm: false,
                    piiTypes: false,
                    piiFlows: false
                });*/

                //scanner.scan()

                // get hook instance by ID
                const data = {
                    report: scanner.getReport().toJsonObject()
                };

                $.sendSuccess(res,  data);
            }catch(err){
                Logger.error("[API][PRIVACY] Project cannot be scanned. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project cannot be scanned. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

PRIVACY_WEB_API.addAsyncAuthenticatedRoute(
    '/scanModel',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:any = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN");

                //scanner.hasCredit()
                const report = await scanner.runModel(req.dxc.project);

                // save report
                //req.dxc.project

                // get hook instance by ID
                const data = {
                    report: report.toJsonObject()
                };

                $.sendSuccess(res,  data);
            }catch(err){
                Logger.error("[API][PRIVACY] Project cannot be scanned. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project cannot be scanned. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

PRIVACY_WEB_API.addAsyncAuthenticatedRoute(
    '/reports',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:any = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as any;

                // get hook instance by ID
                const data = {
                    reports: []
                };

                scanner.reports.map((vRep)=>{
                    data.reports.push(vRep.toJsonObject());
                });

                $.sendSuccess(res,  data);
            }catch(err){
                Logger.error("[API][PRIVACY] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


PRIVACY_WEB_API.addAsyncAuthenticatedRoute(
    '/model',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) =>{
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:any = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as any;

                $.sendSuccess(res,  scanner.model.toJsonObject());
            }catch(err){
                Logger.error("[API][PRIVACY] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);
