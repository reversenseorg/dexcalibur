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

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const AUDIT_WEB_API: DelegateWebApi = new DelegateWebApi();


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/all',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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
    }
);
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/trackers/:id',
    {
        'put': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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

/**
 *
 */
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/tracker/purpose/list',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                $.sendSuccess(res, await $.context.getSignatureServer().listTrackerPurpose());
            }catch(err){
                Logger.error("[API][AUDIT] Tracker purposes cannot be listed . Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Tracker purposes cannot be listed . Cause : " + err.message);
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
                const model = await am.getModelFor(req.dxc.project, req.params.modelID as string);
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

// to perform a scan of the model
// deprecated since any scan must be ordered
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/scan/:modelID',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{

                // ========== LOGIC

                const am = AuditManager.getInstance();
                const model = await am.getModelFor(req.dxc.project, req.params.modelID as string);
                const scanner:AssuranceScanner = LicenceManager.getProduct(req.dxc.project,model.scannerID) as AssuranceScanner;

                const opts = scanner.validateOptions(req.body);

                // check credit
                //scanner.hasCredit()
                await scanner.run(req.dxc.project, opts);

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
                const model = await am.getModelFor(req.dxc.project, req.params.modelID as string);
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
                            models.push(await am.getModelFor(req.dxc.project, req.params.modelID as string));
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

AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/reports',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();
                let project:string;
                let projectAlive:Nullable<DexcaliburProject> = null;
                let reports:AssuranceReport[] = [];

                if(req.dxc.project == null){
                   project = req.query.puid as string;
                }else{
                   project = req.dxc.project.getUID();
                }

                projectAlive = $.context.getProject(project);
                if(projectAlive != null){
                    reports = await am.listReports(projectAlive);
                }else{
                    reports = await am.listReportsFromDB(null);
                    /*
                    reports = am.listReportsFromPath(
                        AuditManager.getReportsFolderFromPUID($.context.workspace.getLocation(), project)
                    );*/
                }


                $.sendSuccess(res, reports.map(x => x.toJsonObject()) );
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/report/:modelID',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
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
                const reports = await am.listReports(req.dxc.project);
                const rep:AssuranceReport[] = [];
                let report:AssuranceReport;

                for(let i=0; i<reports.length;i++) {
                    report = reports[i];
                    if(models.indexOf(report.getModel().getID())>-1){
                        rep.push(report.toJsonObject());
                    }
                }

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
//                const models = await am.getModelFor(req.dxc.project, req.params.modelID);
                const models = await am.getModel(req.params.modelID);

                $.sendSuccess(res, models.toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        }});

AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/model/:modelID',
    {
        'put': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();
                const model = await am.getModelFor(req.dxc.project, req.params.modelID);

                if(req.body.data.offset!=null && req.body.data.ctrl!=null){
                    model.controls[req.body.data.offset].update(req.body.data.ctrl);
                }else{
                    model.update(req.body.data);
                }

                if(req.dxc.project==null){
                    // TODO : global edit, check ACL
                    // the model UID must change
                    am.saveModel(model);
                }else{
                    // TODO : project edit, check ACL
                    // replace by backup in DB
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

/**
 * To get a list of available models
 */
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/models',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();

                const models = await am.listModels(req.dxc.project);


                const data = models.map(x => {
                    const m= new AssuranceModel({
                        id: x.getID(),
                        name: x.name,
                        description: x.description,
                        links: x.links,
                        metadata: x.metadata,
                        generic: x.generic
                    });
                    return m.toJsonObject();
                });

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][AUDIT] Models cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Models cannot be retrieved. See logs for details. ");
            }
        }
    },{
        readProject: false
    }
);


/**
 * To get a list of available models
 */
AUDIT_WEB_API.addAsyncPublicRoute(
    '/models/all',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = AuditManager.getInstance();

                const models = await am.listModels(req.dxc.project);


                const data = models.map(x => x.toJsonObject());

                $.sendSuccess(res, data);
            }catch(err){
                Logger.error("[API][AUDIT] List of all models cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "List of all models cannot be retrieved. See logs for details. ");
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
                let project:Nullable<DexcaliburProject> = null;
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






AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/order/list',
    {
        'get': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                const scheduler = $.context.getScanScheduler();
                const data:any[] = [];

                (await scheduler.listAllOrders()).map( x => {
                  data.push(x.toJsonObject());
                })

                $.sendSuccess(res,data);
            }catch(err){
                Logger.error("[API][AUDIT] All Scans cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "All Scans cannot be listed. Cause : " + err.message);
            }
        }
    },{
        readProject: false
    }
);

AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/order/scan',
    {
        'post': async function (req:DelegateRequest, res:DelegateResponse):Promise<any> {
            const $: WebServer = req.dxc.$;

            try{
                //let targetProject:Nullable<DexcaliburProject> = null;

                if(req.body.projectUID==null){
                    throw new Error("Project UID is mandatory. Please create a project first.")
                }

                if(req.body.modelUID==null || req.body.modelUID.length==0){
                    throw new Error("Assurance Model UID is mandatory. ")
                }


                // ========== LOGIC

                const scheduler = $.context.getScanScheduler();
                let project:DexcaliburProject = req.dxc.project;

                if($.context.isStandaloneMode()){

                    if(req.dxc.project==null){
                        // from multi-project GUI
                        project = req.dxc.sess._project[req.body.projectUID];
                    }

                    //console.log(project);
                    const report = await scheduler.newStandaloneScan(project, ScanOrder.fromScanOptions({
                        modelUID: req.body.modelUID[0],
                        projectUID: req.body.projectUID,
                    }));

                    console.log("SERIALIZE REPORT TO SEND TO WEB");
                    $.sendSuccess(res,report.toJsonObject());
                    return;
                }

                /*
                let targetOS = req.body.targetOS;
                if(targetOS==null){
                    targetOS =
                }*/

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
        readProject: true
    }
);