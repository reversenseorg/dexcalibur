import {DelegateRequest, DelegateResponse, DelegateWebApi} from "./DelegateWebApi.js";
import WebServer, {HTTP_CODE_ERROR, HTTP_CODE_SUCCESS} from "../WebServer.js";
import {Request, Response} from "express";
import * as Log from "../Logger.js";
import {LicenceManager, ProductInfo} from "../credit/LicenceManager.js";
import {AuditManager} from "../audit/AuditManager.js";
import {AssuranceScanner} from "../audit/common/AssuranceScanner.js";
import AssuranceReport from "../audit/common/AssuranceReport.js";
import AssuranceModel from "../audit/common/AssuranceModel.js";
import Control from "../audit/common/Control.js";
import {ScanFlow} from "../audit/common/ScanFlow.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import {Nullable} from "../core/IStringIndex.js";
import {TagCategory} from "@dexcalibur/dexcalibur-orm";
import {AuditManagerException} from "../audit/errors/AuditManagerException.js";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import {ValidationRule} from "../Validator.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const AUDIT_WEB_API: DelegateWebApi = new DelegateWebApi();


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/all',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const trackers = await $.context.getSignatureServer().getTrackers();
                const all = [];

                trackers.map(x => {
                    all.push(x.toJsonObject());
                })

                $.sendSuccess(res, all);
            }catch(err){
                Logger.error("[API][AUDIT] Trackers cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, " Trackers cannot be listed. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/:id',
    {
        'put': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const ctrl = new Control(req.body);
                ctrl.id = req.params.id;
                Logger.info('[API][AUDIT] Update tracker '+req.params.id);
                $.sendSuccess(res, await $.context.getSignatureServer().uppdateTracker(ctrl));
            }catch(err){
                Logger.error("[API][AUDIT] Tracker cannot be updated. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tracker cannot be updated. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/new',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const ctrl = new Control(req.body);
                $.sendSuccess(res, await $.context.getSignatureServer().addTracker(ctrl));
            }catch(err){
                Logger.error("[API][AUDIT] Tracker cannot be created. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tracker cannot be created. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);

AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/:id',
    {
        'delete': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const ctrl = new Control({ id:(req as any).param.id });
                $.sendSuccess(res, await $.context.getSignatureServer().deleteTracker(ctrl));
            }catch(err){
                Logger.error("[API][AUDIT] Tracker cannot be deleted . Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tracker cannot be deleted . Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);

/**
 *
 */
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/tracker/purpose/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                $.sendSuccess(res, await $.context.getSignatureServer().listTrackerPurpose());
            }catch(err){
                Logger.error("[API][AUDIT] Tracker purposes cannot be listed . Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tracker purposes cannot be listed . Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/dashboard/:modelID',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_NOT_LOADED("");
                }

                // ========== LOGIC
                const am = $.context.getAuditManager();
                const model = await am.getModelFor(req.user, req.project, req.params.modelID as string);
                const scanner:AssuranceScanner = LicenceManager.getProduct(req.project, model.getScannerID()) as AssuranceScanner;

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
        lazyProject: true
    }
);

// to perform a scan of the model
// deprecated since any scan must be ordered
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/scan/:modelID',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                if(req.project==null){
                    throw ProjectManagerException.PROJECT_NOT_LOADED("");
                }
                // ========== LOGIC

                const am = $.context.getAuditManager();
                const model = await am.getModelFor(req.user, req.project, req.params.modelID as string);
                const scanner:AssuranceScanner = LicenceManager.getProduct(req.project,model.scannerID) as AssuranceScanner;

                const opts = scanner.validateOptions(req.body);

                // check credit
                //scanner.hasCredit()
                await scanner.run(req.project, opts);

                const report = scanner.getReport();

                // save report
                am.saveReport(req.project, report);

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
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                if(req.project==null){
                    throw ProjectManagerException.PROJECT_NOT_LOADED("");
                }
                // ========== LOGIC

                const am = $.context.getAuditManager();
                const model = await am.getModelFor(req.user, req.project, req.params.modelID as string);
                const scanner:AssuranceScanner = LicenceManager.getProduct(req.project,model.scannerID) as AssuranceScanner;

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
        lazyProject: true
    }
);


/**
 * To scan info about a potential scan such credits required
 */
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/scanInfo',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_NOT_LOADED("");
                }
                // ========== LOGIC

                const am = $.context.getAuditManager();
                const models:AssuranceModel[] = [];
                const errs:string[] = [];
                if(Array.isArray(req.body.refs)){
                    req.body.refs.map(async (x:string) => {
                        try{
                            models.push(await am.getModelFor(req.user, req.project, req.params.modelID as string));
                        }catch(err){
                            errs.push("Model not found ["+x+"]");
                        }
                    });
                }

                const scanners:ProductInfo[] = LicenceManager.getProductByModels(req.project,models) as any;

                scanners.map(x => { x.product = x.product.toJsonObject(); })

                $.sendSuccess(res,  scanners);
            }catch(err){
                Logger.error("[API][AUDIT] Project cannot be scanned. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Project cannot be scanned. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);

AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/reports',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                const am = $.context.getAuditManager();
                let project:string;
                let projectAlive:Nullable<DexcaliburProject> = null;
                let reports:AssuranceReport[] = [];

                if(req.query.aid !=null){
                    const app = await $.context.getOrgManager().getDirectApplication(
                        req.user,
                        req.query.aid as string
                    );

                    reports = await am.listReportsByApp(req.user, app);
                }else{
                    if(req.project == null){
                        project = req.query.puid as string;
                    }else{
                        project = req.project.getUID();
                    }

                    projectAlive = $.context.getProject(project);
                    if(projectAlive != null){
                        reports = await am.listReports(req.user, projectAlive);
                    }else{
                        reports = await am.listReportsFromDB(req.user, null);
                    }
                }

                $.sendSuccess(res, reports.map(x => x.asPreview()) );
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/report/:unsafeReportUUID/:aid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                let models:string[] = [];
                models = [req.params.modelID as string]

                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                $.sendSuccess(res, await am.getReport(
                    req.user, req.params.unsafeReportUUID, app));
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);

/*
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/report/:modelID',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_NOT_LOADED("");
                }
                // ========== LOGIC
                let models:string[] = [];
                models = [req.params.modelID as string]
                const am = $.context.getAuditManager();
                const reports = await am.listReports(req.user, req.project);
                const rep:AssuranceReport[] = [];
                let report:AssuranceReport;

                for(let i=0; i<reports.length;i++) {
                    report = reports[i];
                    if(models.indexOf(report.getModel())>-1){
                        rep.push(report.toJsonObject());
                    }
                }

                $.sendSuccess(res, rep);
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);*/





AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/model/:modelID',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
//                const models = await am.getModelFor(req.project, req.params.modelID);
                const models = await am.getModelByUID(req.user, req.params.modelID);

                $.sendSuccess(res, models.toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    });

AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/model/:modelID',
    {
        'put': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_NOT_LOADED("");
                }

                // ========== LOGIC
                const am = $.context.getAuditManager();
                const model = await am.getModelFor(req.user, req.project, req.params.modelID);

                if(req.body.data.offset!=null && req.body.data.ctrl!=null){
                    model.controls[req.body.data.offset].update(req.body.data.ctrl);
                }else{
                    model.update(req.body.data);
                }

                if(req.project==null){
                    // TODO : global edit, check ACL
                    // the model UID must change
                    am.saveModel(model);
                }else{
                    // TODO : project edit, check ACL
                    // replace by backup in DB
                    am.saveModel(model,req.project);
                }
                //new AssuranceModel(req.body);

                $.sendSuccess(res, model.toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);

/**
 * To get a list of available models
 */
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/models',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC
                const am = $.context.getAuditManager();
                let models:AssuranceModel[];
                let previewMode = false;

                if(req.project!=null){
                    models =  await am.listModels(req.user, req.project);
                }else{
                    const org = await $.context.getOrgManager().getOrganization(
                        req.user,
                        req.query.oid as string
                    )
                    models =  await am.listAllModelsByOrg(req.user, org);
                }

                if(ValidationRule.newPinklistAssert(['0','1']).test(req.query.preview)){
                    previewMode = (req.query.preview==='1'? true : false);
                }


                $.sendSuccess(res, models.map(x => {
                    if(previewMode){
                        return x.asPreview();
                    }else{
                        return x.toJsonObject();
                    }
                }));
            }catch(err){
                Logger.error("[API][AUDIT] Models cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Models cannot be retrieved. See logs for details. ");
            }
        }
    },{
        lazyProject: true
    }
);


/**
 * To get a list of available models
 */
AUDIT_WEB_API.addAsyncPublicRoute(
    '/models/all',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_NOT_LOADED("");
                }

                // ========== LOGIC
                const am = $.context.getAuditManager();

                const models = await am.listModels(req.user, req.project);


                const data = models.map(x => x.toJsonObject());

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][AUDIT] List of all models cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "List of all models cannot be retrieved. See logs for details. ");
            }
        }
    },{
        lazyProject: true
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/project/:projectID/scan/start',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;
            let project:DexcaliburProject;
            let data:any = [];

            try{
                // get project and user ACL
                project = await $.context.getProjectManager().getProject(req.user, req.params.projectID);


                // ========== LOGIC
                const am = $.context.getAuditManager();

                // return results
                (await am.batchStart(req.user, project, req.body.models)).map(x => {
                    data.push(x.toJsonObject())
                });
                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][AUDIT] Scan cannot be started. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Scan cannot be started. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/project/:projectID/scan/list',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                /*
                let project = null;
                try{
                    project = AUDIT_WEB_API.doProjectSecurityChecks(req, $, {readProjectStrict:true});
                }catch(err1){
                    throw err1;
                }*/

                // ========== LOGIC
                const orders = await  $.context.getScanScheduler().listOrdersOf(req.params.projectID);
                const data = [];
                orders.map(x => data.push(x.toJsonObject()));

                //const scheduler = project.getScanScheduler();

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][AUDIT] Scans cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Scans cannot be listed. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);

AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/project/:projectID/scan/reports',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                //
                let project:Nullable<DexcaliburProject> = null;
                try{
                    project = req.project; // AUDIT_WEB_API.doProjectSecurityChecks(req, $, {readProjectStrict:true});
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
        lazyProject: true
    }
);





// deprecated
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/order/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const scheduler = $.context.getScanScheduler();
                const data:any[] = [];

                (await scheduler.listAllOrders(
                    req.user
                )).map( x => {
                  data.push(x.toJsonObject());
                })

                $.sendSuccess(res,data);
            }catch(err){
                Logger.error("[API][AUDIT] All Scans cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "All Scans cannot be listed. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/order/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.project==null){
                    throw ProjectManagerException.PROJECT_NOT_LOADED("");
                }
                const scheduler = $.context.getScanScheduler();
                const data:any[] = [];

                (await scheduler.listOrdersOf(
                    req.project
                )).map( x => {
                    data.push(x.toJsonObject());
                })

                $.sendSuccess(res,data);
            }catch(err){
                Logger.error("[API][AUDIT] All Scans cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "All Scans cannot be listed. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);


/**
 * To order a scan
 *
 *
 */
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/order/scan',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{

                if(req.body.projectUID==null){
                    throw new Error("Project UID is mandatory. Please create a project first.")
                }

                if(req.body.modelUID==null || req.body.modelUID.length==0){
                    throw new Error("Assurance Model UID is mandatory. ")
                }


                // ========== LOGIC

                const scheduler = $.context.getScanScheduler();
                let org:Nullable<OrganizationUnit> = null;
                let project:DexcaliburProject = await $.context.getProjectManager()
                    .getProject(req.user, req.body.projectUID);

                if(req.body.oid != null){
                    org = await $.context.getOrgManager().getOrganization(
                        req.user,
                        req.body.oid as string
                    );
                }

                if($.context.isStandaloneMode()){


                    /*if(req.project==null){
                        // from multi-project GUI
                        project = req.dxc.sess._project[req.body.projectUID];
                    }*/

                    const order =  ScanOrder.fromScanOptions({
                        modelUID: req.body.modelUID[0],
                        projectUID: req.body.projectUID
                    });

                    order.orgUnit = org.getUID();

                    if(req.body.aid!=null){
                        const app = await $.context.getOrgManager().getDirectApplication(req.user, req.body.aid);
                        order.appUnit = app.getUID();
                    }


                    //console.log(project);
                    const report = await scheduler.newStandaloneScan(req.user, project, order, org);

                    /*const report = await scheduler.newLocalScan(req.user, project, ScanOrder.fromScanOptions({
                        modelUID: req.body.modelUID[0],
                        projectUID: req.body.projectUID,
                    }));*/

                    console.log("SERIALIZE REPORT TO SEND TO WEB");
                    $.sendSuccess(res,report.toJsonObject());
                    return;
                }

                /*
                let targetOS = req.body.targetOS;
                if(targetOS==null){
                    targetOS =
                }*/

                // else, schedule a new scan on slave
                for(let i=0; i<req.body.modelUID.length; i++){
                    const order = ScanOrder.fromScanOptions({
                        modelUID: req.body.modelUID[i],
                        projectUID: req.body.projectUID,
                    });

                    // file upload
                    if(req.body.fileUploadID!=null){
                        order.setTargetFile(await $.uploader.getPathOf(req.body.fileUploadID));
                    }

                    scheduler.newScan(order);
                }

                /*
                req.body.modelUID.map( vModelUID => {
                    const order = ScanOrder.fromScanOptions({
                        modelUID: vModelUID,
                        projectUID: req.body.projectUID,
                    });

                    // file upload
                    if(req.body.fileUploadID!=null){
                        order.setTargetFile(await $.uploader.getPathOf(req.body.fileUploadID));
                    }

                    scheduler.newScan(order);
                });*/


                $.sendSuccess(res,{ });
            }catch(err){
                Logger.error("[API][AUDIT] Scans cannot be ordered. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Scans cannot be ordered. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);