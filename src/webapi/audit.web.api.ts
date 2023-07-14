import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import {PrivacyScanner} from "../audit/privacy/PrivacyScanner.js";
import {LicenceManager, ProductInfo} from "../credit/LicenceManager.js";
import {AuditManager} from "../audit/AuditManager.js";
import {AssuranceScanner} from "../audit/common/AssuranceScanner.js";
import AssuranceReport from "../audit/common/AssuranceReport.js";
import AssuranceModel from "../audit/common/AssuranceModel.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const AUDIT_WEB_API: DelegateWebApi = new DelegateWebApi();


AUDIT_WEB_API.addAuthenticatedRoute(
    '/dashboard/:modelID',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                const am = AuditManager.getInstance();
                const model = am.getModel(req.dxc.project, req.params.modelID as string);
                const scanner:AssuranceScanner = LicenceManager.getProduct(req.dxc.project, model.getScannerID()) as AssuranceScanner;

                const data = {
                    db_names: [],
                    dashboards: {}
                };

                /*
                scanner.listDashboards().map((vName)=>{
                    data.db_names.push(vName);
                    data.dashboards[vName] = scanner.getDashboard(vName).toJsonObject();
                });*/

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][AUDIT] Audit Dashboards are not accessible. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Audit Dashboards are not accessible. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


AUDIT_WEB_API.addAuthenticatedRoute(
    '/scan/:modelID',
    {
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const am = AuditManager.getInstance();
                const model = am.getModel(req.dxc.project, req.params.modelID as string);
                const scanner:AssuranceScanner = LicenceManager.getProduct(req.dxc.project,model.scannerID) as AssuranceScanner;

                const opts = scanner.validateOptions(req.body);

                // check credit
                //scanner.hasCredit()
                scanner.run(req.dxc.project, opts);

                const report = scanner.getReport();

                // save report
                am.saveReport(req.dxc.project, report);

                // get hook instance by ID
                const data = {
                    report: report.toJsonObject()
                };

                $.sendSuccess(res,  data);
            }catch(err){
                Logger.error("[API][AUDIT] Project cannot be scanned. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project cannot be scanned. Cause : " + err.message);
            }
        },
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const am = AuditManager.getInstance();
                const model = am.getModel(req.dxc.project, req.params.modelID as string);
                const scanner:AssuranceScanner = LicenceManager.getProduct(req.dxc.project,model.scannerID) as AssuranceScanner;

                // get hook instance by ID
                const data = {
                    scanner: scanner.toJsonObject()
                };

                $.sendSuccess(res,  data);
            }catch(err){
                Logger.error("[API][AUDIT] Project cannot be scanned. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project cannot be scanned. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


/**
 * To scan info about a potential scan such credits required
 */
AUDIT_WEB_API.addAuthenticatedRoute(
    '/scanInfo',
    {
        'post': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const am = AuditManager.getInstance();
                const models:AssuranceModel[] = [];
                const errs:string[] = [];
                if(Array.isArray(req.body.refs)){
                    req.body.refs.map((x:string) => {
                        try{
                            models.push(am.getModel(req.dxc.project, req.params.modelID as string));
                        }catch(err){
                            errs.push("Model not found ["+x+"]");
                        }
                    });
                }

                const scanners:ProductInfo[] = LicenceManager.getProductByModels(req.dxc.project,models) as any;

                scanners.map(x => { x.product = x.product.toJsonObject(); })

                $.sendSuccess(res,  scanners);
            }catch(err){
                Logger.error("[API][AUDIT] Project cannot be scanned. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project cannot be scanned. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

AUDIT_WEB_API.addAuthenticatedRoute(
    '/reports',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();
                const reports = am.listReports(req.dxc.project);
                $.sendSuccess(res, reports.map(x => x.toJsonObject()) );
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);



AUDIT_WEB_API.addAuthenticatedRoute(
    '/reports',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();
                const reports = am.listReports(req.dxc.project);
                $.sendSuccess(res, reports.map(x => x.toJsonObject()) );
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);

AUDIT_WEB_API.addAuthenticatedRoute(
    '/report/:modelID',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                let models:string[] = [];
                models = [req.params.modelID as string]
                /*
                if(typeof (req.params.modelID)==="string"){
                    models = [req.params.modelID as string];
                }else if(Array.isArray(req.params.modelID)){
                    models = req.params.modelID as string[];
                }else{
                    throw new Error("Invalid model ID");
                }*/

                const am = AuditManager.getInstance();
                const reports = am.listReports(req.dxc.project);
                const rep:AssuranceReport[] = [];

                reports.map(( vReport, vIndex)=>{
                    if(models.indexOf(vReport.getModel().getID())>-1){
                        rep.push(vReport.toJsonObject());
                    }
                });

                $.sendSuccess(res, rep);
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true
    }
);


AUDIT_WEB_API.addAuthenticatedRoute(
    '/model/:modelID',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();
                const models = am.getModel(req.dxc.project, req.params.modelID);

                $.sendSuccess(res, models.toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        },
        'put': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();
                const models = am.getModel(req.dxc.project, req.params.modelID);

                if(req.dxc.project==null){
                    // TODO : global edit, check ACL

                }else{
                    // TODO : project edit, check ACL
                }
                //new AssuranceModel(req.body);

                $.sendSuccess(res, models.toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: true,
        readProjectStrict: false
    }
);

AUDIT_WEB_API.addPublicRoute(
    '/models',
    {
        'get': function (req:DelegateRequest, res:DelegateResponse):any {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();

                const models = am.listModels(req.dxc.project);

                $.sendSuccess(res, models.map(x => x.toJsonObject()));
            }catch(err){
                Logger.error("[API][AUDIT] Models cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Models cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: false
    }
);
