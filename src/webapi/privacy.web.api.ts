import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import {LicenceManager} from "../credit/LicenceManager.js";
import {GenericScanner} from "../audit/common/GenericScanner.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PRIVACY_WEB_API: DelegateWebApi = new DelegateWebApi();


PRIVACY_WEB_API.addAuthenticatedRoute(
    '/dashboard',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:GenericScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as GenericScanner;

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

PRIVACY_WEB_API.addAuthenticatedRoute(
    '/scan',
    {
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:GenericScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as GenericScanner;

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
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:GenericScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as GenericScanner;

                //scanner.hasCredit()
                const report = await scanner.runModel(req.dxc.project);

                // save report
                req.dxc.project

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

PRIVACY_WEB_API.addAuthenticatedRoute(
    '/reports',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:GenericScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as GenericScanner;

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


PRIVACY_WEB_API.addAuthenticatedRoute(
    '/model',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:GenericScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as GenericScanner;

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
