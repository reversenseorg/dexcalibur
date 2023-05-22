import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import {PrivacyScanner} from "../audit/privacy/PrivacyScanner.js";
import {LicenceManager} from "../credit/LicenceManager.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const PRIVACY_WEB_API: DelegateWebApi = new DelegateWebApi();


PRIVACY_WEB_API.addAuthenticatedRoute(
    '/dashboard',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:PrivacyScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as PrivacyScanner;

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
        'post': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:PrivacyScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as PrivacyScanner;

                //scanner.hasCredit()
                scanner.scan({
                    trackersNet: true,
                    trackersLib: true,

                    perm: false,
                    piiTypes: false,
                    piiFlows: false
                });

                // get hook instance by ID
                const data = {
                    report: scanner.lastReport.toJsonObject()
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
    '/scanModel',
    {
        'post': function (req:Request, res:Response):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const scanner:PrivacyScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as PrivacyScanner;

                //scanner.hasCredit()
                const report = scanner.runModel(req.dxc.project);

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

                const scanner:PrivacyScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as PrivacyScanner;

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

                const scanner:PrivacyScanner = LicenceManager.getProduct(req.dxc.project,"PRI_CLD_SSCAN") as PrivacyScanner;

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
