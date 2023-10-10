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
import Control from "../audit/common/Control.js";
import {ErrorCode} from "../errors/MonitoredError.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {ScanFlow} from "../audit/common/ScanFlow.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const AUDIT_WEB_API: DelegateWebApi = new DelegateWebApi();


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/all',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                $.sendSuccess(res, await $.context.getSignatureServer().getTrackers());
            }catch(err){
                Logger.error("[API][AUDIT] Trackers cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Trackers cannot be listed. Cause : " + err.message);
            }
        }
    }
);
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/:id',
    {
        'put': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const ctrl = new Control(req.body);
                $.sendSuccess(res, await $.context.getSignatureServer().uppdateTracker(ctrl));
            }catch(err){
                Logger.error("[API][AUDIT] Tracker cannot be updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tracker cannot be updated. Cause : " + err.message);
            }
        }
    }
);
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/new',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const ctrl = new Control(req.body);
                $.sendSuccess(res, await $.context.getSignatureServer().addTracker(ctrl));
            }catch(err){
                Logger.error("[API][AUDIT] Tracker cannot be created. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tracker cannot be created. Cause : " + err.message);
            }
        }
    }
);
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/:id',
    {
        'delete': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const ctrl = new Control({ id:(req as any).param.id });
                $.sendSuccess(res, await $.context.getSignatureServer().deleteTracker(ctrl));
            }catch(err){
                Logger.error("[API][AUDIT] Tracker cannot be deleted . Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tracker cannot be deleted . Cause : " + err.message);
            }
        }
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/dashboard/:modelID',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                const am = AuditManager.getInstance();
                const model = await am.getModel(req.dxc.project, req.params.modelID as string);
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
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/scan/:modelID',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const am = AuditManager.getInstance();
                const model = await am.getModel(req.dxc.project, req.params.modelID as string);
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
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const am = AuditManager.getInstance();
                const model = await am.getModel(req.dxc.project, req.params.modelID as string);
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
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/scanInfo',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const am = AuditManager.getInstance();
                const models:AssuranceModel[] = [];
                const errs:string[] = [];
                if(Array.isArray(req.body.refs)){
                    req.body.refs.map(async (x:string) => {
                        try{
                            models.push(await am.getModel(req.dxc.project, req.params.modelID as string));
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
        readProject: true,
        readProjectStrict: true,
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
        readProject: true,
        readProjectStrict: true,
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


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/model/:modelID',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();
                const models = await am.getModel(req.dxc.project, req.params.modelID);

                $.sendSuccess(res, models.toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        },
        'put': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();
                const model = await am.getModel(req.dxc.project, req.params.modelID);

                if(req.body.data.offset!=null && req.body.data.ctrl!=null){
                    model.controls[req.body.data.offset].update(req.body.data.ctrl);
                }else{
                    model.update(req.body.data);
                }

                if(req.dxc.project==null){
                    // TODO : global edit, check ACL
                    am.saveModel(model);
                }else{
                    // TODO : project edit, check ACL
                    am.saveModel(model,req.dxc.project);
                }
                //new AssuranceModel(req.body);

                $.sendSuccess(res, model.toJsonObject());
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

AUDIT_WEB_API.addAsyncPublicRoute(
    '/models',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();

                const models = await am.listModels(req.dxc.project);

                const data = models.map(x => x.toJsonObject())

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][AUDIT] Models cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Models cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        readProject: false
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/project/:projectID/scan/start',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                //
                let project = null;
                try{
                    project = AUDIT_WEB_API.doProjectSecurityChecks(req, $, {readProjectStrict:true});
                }catch(err1){
                    throw err1;
                    /*
                    if(err1.code === ErrorCode.PROJECT + 115){
                        try{
                            project = await DexcaliburEngine.getInstance().openProject(req.dxc.sess.getUserAccount(), req.body.project);
                        }catch(err2){
                            throw new Error("Project is not ready and cannot be opened. See logs");
                        }
                    }else{
                        throw err1;
                    }*/
                }



                // ========== LOGIC
                const am = AuditManager.getInstance();
                const allModels = await am.listModels(project);
                const targetUIDs: string[] = req.body.models;
                const targetModels: AssuranceModel[] = [];
                const scanners: AssuranceScanner[] = [];
                const reports: { [model:string] :AssuranceReport[] } = {};
                const data:any = [];
                const scheduler = project.getScanScheduler();
                const flows:ScanFlow[] = [];

                // retrieve the list of targeted models
                allModels.map((vModel)=>{
                    if(targetUIDs.indexOf(vModel.getID())>-1){
                        // create one scanner per model
                        const asc = LicenceManager.getProduct( project, vModel.getScannerID()) as AssuranceScanner;
                        asc.setModel(vModel);

                        targetModels.push(vModel);
                        scanners.push(asc);
                    }
                });

                // run scanner
                for(let i=0; i<scanners.length; i++){
                    console.log("Run scans ("+i+") : "+scanners[i].name);
                    flows.push(scheduler.newScan(scanners[i]));
                    /*
                    scanners[i].run(project, {});
                    console.log("Save all reports  ("+i+") : "+scanners[i].name);
                    data[scanners[i].name] = [];
                    scanners[i].getReports().map(x => {
                        console.log("Save single reports  ("+i+") : "+scanners[i].name);
                        try{
                            const path = am.saveReport(project, x);
                            data[scanners[i].name].push(x.toJsonObject());
                        }catch(err1){
                            console.log(err1.message);
                            console.log("Save single reports  FAILED ("+i+") : "+scanners[i].name+" "+err1.stack);
                        }

                    });*/
                }

                const started = scheduler.start(200);

                // return results
                started.map(x => {
                    data.push(x.toJsonObject())
                });
                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][AUDIT] Scan cannot be started. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Scan cannot be started. Cause : " + err.message);
            }
        }
    },{
        readProject: false
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/project/:projectID/scan/list',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                //
                let project = null;
                try{
                    project = AUDIT_WEB_API.doProjectSecurityChecks(req, $, {readProjectStrict:true});
                }catch(err1){
                    throw err1;
                }

                // ========== LOGIC
                const scheduler = project.getScanScheduler();
                $.sendSuccess(res, scheduler.toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Scans cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Scans cannot be listed. Cause : " + err.message);
            }
        }
    },{
        readProject: false
    }
);

AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/project/:projectID/scan/reports',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                //
                let project = null;
                try{
                    project = AUDIT_WEB_API.doProjectSecurityChecks(req, $, {readProjectStrict:true});
                }catch(err1){
                    throw err1;
                }

                // ========== LOGIC
                const scheduler = project.getScanScheduler();
                //scheduler.getPastScans()

                $.sendSuccess(res, scheduler.toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Scans cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Scans cannot be listed. Cause : " + err.message);
            }
        }
    },{
        readProject: false
    }
);
