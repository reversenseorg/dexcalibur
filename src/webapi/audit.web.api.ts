import {DelegateRequest, DelegateResponse, DelegateWebApi, HTTP_VERB} from "./DelegateWebApi.js";
import WebServer from "../WebServer.js";
import * as Log from "../Logger.js";
import {LicenceManager, ProductInfo} from "../credit/LicenceManager.js";
import {AssuranceScanner} from "../audit/common/AssuranceScanner.js";
import AssuranceReport from "../audit/common/AssuranceReport.js";
import AssuranceModel from "../audit/common/AssuranceModel.js";
import Control from "../audit/common/Control.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import {Nullable} from "../core/IStringIndex.js";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";

import {DexcaliburEngineMode} from "../DexcaliburEngineMode.js";
import {Policy, PolicyZone} from "../audit/Policy.js";
import {PolicyRuleFactory} from "../audit/PolicyRuleFactory.js";
import {PolicyActionFactory} from "../audit/PolicyActionFactory.js";
import Util from "../Utils.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {IControl} from "../audit/common/IControl.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;
export const AUDIT_WEB_API: DelegateWebApi = new DelegateWebApi();

const DEFAULT_OPTIONS = {
    lazyProject: true,
    nodeAffinity: DexcaliburEngineMode.MASTER
};

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
/*
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
                // am.saveReport(req.project, report);

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
);*/


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
                        reports = []; //await am.listReportsFromDB(req.user, null);
                    }
                }

                $.sendSuccess(res, reports.map(x => x.asPreview()) );
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/report/:unsafeReportUUID/:aid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                $.sendSuccess(res, (await am.getReport(
                    req.user, req.params.unsafeReportUUID, app)).toJsonObject());
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        },
        'delete': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                $.sendSuccess(res, (await am.dropReport(req.user, app, req.params.unsafeReportUUID)));
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be deleted. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be deleted. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/report/:unsafeReportUUID/:aid/kpis',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                let rep = (await am.getReport(req.user, req.params.unsafeReportUUID, app));

                if(rep!=null){
                    $.sendSuccess(res, rep.toJsonObject().indicators);
                }else{
                    throw new Error("Report not found.")
                }
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
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
    '/reports/:appUID/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.appUID as string
                );

                $.sendSuccess(res, (await am.listReportsByApp(req.user, app)).map(x =>  x.asPreview().toJsonObject()) );
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/reports/:aid/list',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                $.sendSuccess(res, (await am.getReports(
                    req.user, app)).map(x => x.toJsonObject()) );
            }catch(err){
                $.sendErrorWithLog(res,
                    AUDIT_WEB_API.name,
                    "Reports cannot be listed.",
                    err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/reports/:aid/latest',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                let rap:AssuranceReport;
                if(req.query!=null && req.query.mid!=null){
                    rap = await am.getLatestReport(req.user, app, req.query.mid as string);
                }else{
                    rap = await am.getLatestReport(req.user, app);
                }

                $.sendSuccess(res, (rap!=null ? rap.toJsonObject(): null));
            }catch(err){
                $.sendErrorAfterException(res,
                    AUDIT_WEB_API.name,
                    "Latest report of this application unit cannot be retrieved.",
                    err);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/reports/:aid/latest/kpis',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                let rap = await am.getLatestReport(req.user, app);

                if(rap!=null){
                    $.sendSuccess(res, rap.asPreview());
                }else{
                    $.sendSuccess(res, null);
                }
            }catch(err){
                $.sendErrorAfterException(res,
                    AUDIT_WEB_API.name,
                    "Latest report of this application unit cannot be retrieved.",
                    err);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/reports/:appUID/latest',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.appUID as string
                );

                const latest = await am.getLatestReport(req.user, app);
                if(latest==null){
                    throw new Error("No report found for application unit ["+app.getUID()+"]");
                }

                $.sendSuccess(res, latest.toJsonObject() );


            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        //lazyProject: true,
        //nodeAffinity: DexcaliburEngineMode.MASTER,
        ...DEFAULT_OPTIONS,
        mcp: {
            [HTTP_VERB.GET]: {
                name:'audit-get-latest-report-by-app',
                uri: '/reports/{applicationUUID}/latest',
                summary: `Return the latest report for application unit specified by its UUI in 'applicationUUID' params `,
                parameters: [{
                    name: 'applicationUUID',
                    required: true,
                    description: ApplicationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: ApplicationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "The latest Assurance Report (an assurance_report object) for the specified application unit. It is a scan report",
                    schemaDoc: AssuranceReport.TYPE.toJSONSchemaDoc()
                }]
            }
        }
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/ctrl/:modelID/:ctrl/:type',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
//                const models = await am.getModelFor(req.project, req.params.modelID);
                const model = await am.getModelByUID(req.user, req.params.modelID);
                
                if(model==null){ throw new Error("Assurance model cannot be retrieved. This organization is not authorized. "); }
                
                const ctrlNode = model.getControlNode( Util.decodeURI(req.params.ctrl));
                let ctrl:IControl = ctrlNode.ctrl;

                if(req.params.type == "ctrl"){
                    if(ctrlNode.ctrl.isControlAssessment() && ctrlNode.parent!=null){
                        ctrl = ctrlNode.parent.ctrl;
                    }
                }


                if(ctrl!=null){
                    $.sendSuccess(res, (ctrl !=null ? (ctrl as any).toJsonObject():null ) );
                }else{
                    throw new Error("Control point not found.");
                }
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        ...DEFAULT_OPTIONS,
        mcp: {
            [HTTP_VERB.GET]: {
                name:'audit-get-control-point',
                uri: '/ctrl/{modelUUID}/{ctrlUUID}/{ctrlType}',
                summary: `Return the specified Control point from the specified Assurance Model`,
                parameters: [{
                    name: 'modelUUID',
                    required: true,
                    description: AssuranceModel.TYPE.getPrimaryKey()._dscr,
                    schema: AssuranceModel.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'ctrlUUID',
                    required: true,
                    description: "The UUID of the Control point in the specified model",
                    schema: { type:"string" }
                },{
                    name: 'ctrlType',
                    required: true,
                    description: "The control type. Only support 'ctrl' for Control point.",
                    schema: { type:"string", regex:"^ctrl$" }
                }],
                responses: [{
                    description: "The whole assurance_model node. An 'assurance_model' is a referential or a set of requirements validated by Reversense platform during a scan.",
                    schema: { type:"object" }
                }]
            }
        }
    });



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/report/:unsafeReportUUID/:aid/kpi/:kpiid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );


               // (await am.getReportKpi(req.user, req.params.unsafeReportUUID, app, req.params.kpiid)).toJsonObject()

                $.sendSuccess(res, null );
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/kpis/:modelID',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
//                const models = await am.getModelFor(req.project, req.params.modelID);
                const models = await am.getModelByUID(req.user, req.params.modelID);

                $.sendSuccess(res, models.indicators.map(x => x.toJsonObject()));
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        //lazyProject: true,
        //nodeAffinity: DexcaliburEngineMode.MASTER,
        ...DEFAULT_OPTIONS,
        mcp: {
            [HTTP_VERB.GET]: {
                name:'audit-get-kpi-definition-by-model',
                uri: '/kpis/{modelUUID}',
                summary: `Return the definition and formulae for each indicators from assurance model specified by 'modelUUID' param.`,
                parameters: [{
                    name: 'modelUUID',
                    required: true,
                    description: AssuranceModel.TYPE.getPrimaryKey()._dscr,
                    schema: AssuranceModel.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: "A list of Indicator objects. Each Indicator contains definitions and template filled with values after a scan.",
                    schemaDoc: AssuranceReport.TYPE.toJSONSchemaDoc()
                }]
            }
        }
    });

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

                let previewMode:boolean = false;
                if(ValidationRule.newPinklistAssert(['0','1',"false","true"]).test(req.query.preview)){
                    previewMode = (req.query.preview==='1'||req.query.preview==='true');
                }

                $.sendSuccess(res, (previewMode? models.asPreview(): models.toJsonObject()));
            }catch(err){
                Logger.error("[API][AUDIT] Model cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Model cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        ...DEFAULT_OPTIONS,
        mcp: {
            [HTTP_VERB.GET]: {
                name:'audit-get-assurance-model-by-uuid',
                uri: '/model/{modelUID}?preview={preview}',
                summary: `Return an assurance model by its UUID. An assurance model is often heavy, use 'preview=true' to reduce the size of the response.`,
                parameters: [{
                    name: 'modelUID',
                    required: true,
                    description: AssuranceModel.TYPE.getPrimaryKey()._dscr,
                    schema: AssuranceModel.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'preview',
                    required: false,
                    description: "A boolean to say if the request return a preview or the full model. Default is 'false'.",
                    default: "false",
                    schema: { type:"boolean" }
                }],
                responses: [{
                    description: "The whole assurance_model node. An 'assurance_model' is a referential or a set of requirements validated by Reversense platform during a scan.",
                    schemaDoc: AssuranceModel.TYPE.toJSONSchemaDoc()
                }]
            }
        }
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
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
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
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER,
        mcp: {
            [HTTP_VERB.GET]: {
                name:'audit-list-assurance-models',
                uri: '/models?preview={preview}&oid={organizationUUID}',
                summary: `Return the list assurance model by its UUID. An assurance model is often heavy, always use 'preview=true' to reduce the size of the response.`,
                parameters: [{
                    name: 'organizationUUID',
                    required: true,
                    description: OrganizationUnit.TYPE.getPrimaryKey()._dscr,
                    schema: OrganizationUnit.TYPE.getPrimaryKey().toJSONSchemaPart()
                },{
                    name: 'preview',
                    required: true,
                    description: "A boolean to say if the request return a list of preview or full models.",
                    default: "true",
                    schema: { type:"boolean" }
                }],
                responses: [{
                    description: "The list of **assurance_model** node. An 'assurance_model' is a referential or a set of requirements validated by Reversense platform during a scan.",
                    schema: AssuranceModel.TYPE.toJSONSchemaPart(true)
                }]
            }
        }
    }
);


/**
 * To get a list of available models
 */
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
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
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
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
                project = await $.context.getProjectManager().getLocalActiveProject(req.user, req.params.projectID);

                // ========== LOGIC
                const am = $.context.getAuditManager();

                console.log(req.body)

                if(req.body.scheduled==0){

                    const scheduler = $.context.getScanScheduler(); //.getScanScheduler();

                    let order:ScanOrder;
                    if(req.body.order!=null){
                        order = await $.context.getAuditManager().getScanOrder(req.user,req.body.order);
                    }else{
                        order =  ScanOrder.fromScanOptions({
                            modelUID: req.body.modelUID[0],
                            projectUID: req.body.projectUID
                        });
                    }

                    if(order==null){
                        throw new Error("Scan order not found in DB")
                    }

                    let org:OrganizationUnit = null;
                    if(order.orgUnit!=null){
                        org = await $.context.getOrgManager().getOrganization(req.user, order.orgUnit);
                    }

                    //console.log(project);
                    const report = await scheduler.newStandaloneScan(req.user, project, order, org);

                    /*const report = await scheduler.newLocalScan(req.user, project, ScanOrder.fromScanOptions({
                        modelUID: req.body.modelUID[0],
                        projectUID: req.body.projectUID,
                    }));*/

                    console.log("SERIALIZE REPORT TO SEND TO WEB");
                    $.sendSuccess(res,report.toJsonObject());
                }else{
                    // return results
                    (await am.batchStart(req.user, project, req.body.models)).map(x => {
                        data.push(x.toJsonObject())
                    });
                    $.sendSuccess(res, data);
                }


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
        lazyProject: true,
        mcp: {
            [HTTP_VERB.POST]: {
                name:'audit-list-scan-orders',
                uri: '/project/{projectUUID}/scan/list',
                summary: `Return the list of **scan orders** for a project specified by its UUID using "projectUUID" parameter. A scan order is the order to scan a specific application versions versus on or several specific assurance model.`,
                parameters: [{
                    name: 'projectUUID',
                    required: true,
                    description: DexcaliburProject.TYPE.getPrimaryKey()._dscr,
                    schema: DexcaliburProject.TYPE.getPrimaryKey().toJSONSchemaPart()
                }],
                responses: [{
                    description: `
                    The list of scan ordered for the specified project. 
                    
                    A scan order is :
                    ${ScanOrder.TYPE.getDescr()}
                    `,
                    schemaDoc: AssuranceModel.TYPE.toJSONSchemaDoc()
                }]
            }
        }
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
                    project = req.project;
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
                let app:Nullable<ApplicationUnit> = null;
                let project:DexcaliburProject = await $.context.getProjectManager()
                    .getProject(req.user, req.body.projectUID);

                if(req.body.oid != null){
                    org = await $.context.getOrgManager().getOrganization(
                        req.user,
                        req.body.oid as string
                    );
                }


                if(req.body.aid!=null){
                    app = await $.context.getOrgManager().getDirectApplication(req.user, req.body.aid);
                }

                let bundled = false;
                if(req.body.bundle=="1"){
                    bundled = true;
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


                    order.orgUnit = org!=null?org.getUID():null;
                    order.appUnit = app!=null?app.getUID():null;


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

                const orders:ScanOrder[] = [];
                // else, schedule a new scan on slave
                for(let i=0; i<req.body.modelUID.length; i++){
                    const order = ScanOrder.fromScanOptions({
                        modelUID: req.body.modelUID[i],
                        projectUID: req.body.projectUID
                    });

                    order.orgUnit = org!=null?org.getUID():project.getOrgUID();
                    order.appUnit = app!=null?app.getUID():null;
                    // file upload
                    if(req.body.fileUploadID!=null){
                        order.setTargetFile(await $.uploader.getPathOf(req.body.fileUploadID));
                    }

                    order.addOption('extra', {
                        cookie: req.cookies,
                        owner: req.user.getUID()
                    });

                    // TODO : remove
                    /*order.options = {
                        cookie: req.cookies
                    };*/

                    orders.push(order);

                    // it will save order and push it to queue
                    /*await scheduler.newScan(order, {
                        cookie: req.cookies
                    });*/
                }

                if(!bundled){
                    for(let i=0;i<orders.length;i++){
                        await scheduler.newScan(orders[i], {
                            cookie: req.cookies
                        });
                    }
                }else{
                    await  scheduler.newScanBundle(
                        req.user,
                        req.body.projectUID,
                        orders,{
                            orgUnit: project.getOrgUID(),
                            cookie: req.cookies
                        }
                    );
                }

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


/**
 * To order a scan
 *
 *
 */
AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/policies/create',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                if(req.body.policy!=null && req.body.policy.scope==null){
                    throw new Error("Policy scope is mandatory.");
                }

                if(!Policy.VALIDATE.scopeZone.test(req.body.policy.scope.type)){
                    throw new Error("Scope not supported");
                }

                // target org
                const org = await $.context.getOrgManager().getOrganization(req.user, req.body.oid);

                if(req.body.policy.model==null){
                    throw new Error("Assurance Model UID is mandatory. ")
                }

                let proto:Nullable<Policy> = Policy.fromUnsafeObject(req.body.policy);
                let policy:Nullable<Policy> = null;
                switch (req.body.policy.scope.type){
                    case PolicyZone.ORG:
                        policy = await $.context.getOrgManager().updateOrgAppPolicy(req.user, org, proto);
                        break;
                    case PolicyZone.APP:
                        const app = await $.context.getOrgManager().getApplication(req.user, req.body.oid, req.body.policy.scope.uid);
                        policy = await $.context.getOrgManager().updateOrgAppPolicy(req.user, app, proto);
                        break;
                    default:
                        throw new Error("Scope not supported");
                }


                if(policy!=null){
                    $.sendSuccess( res, policy.toJsonObject());
                }else{
                    throw new Error("Create failure");
                }
            }catch(err){
                Logger.error("[API][AUDIT] Policy cannot be created. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Policy cannot be created. Cause : " + err.message);
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
    '/policies/model/:aid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // target org
                //const org = await $.context.getOrgManager().getOrganization(req.user, req.params.oid);

                // target org
                const model = await $.context.getAuditManager().getModelByUID(req.user, req.params.aid);

                if(model!=null){
                    $.sendSuccess( res, (await $.context.getAuditManager().getDefaultPolicyFromModel(model)).toJsonObject());
                }else{
                    $.sendSuccess(res,null);
                }
            }catch(err){
                Logger.error("[API][AUDIT] Scans cannot be ordered. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Scans cannot be ordered. Cause : " + err.message);
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
    '/policy/:scope/:oid/:pid',
    {
        'put': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(req.user, req.params.oid);


                // target org
                let scope:Nullable<OrganizationUnit|ApplicationUnit> = null;
                if(req.params.scope==="org"){
                    scope = await $.context.getOrgManager().getOrganization(req.user, req.params.oid);
                }else if(req.params.scope==="app"){
                    scope = await $.context.getOrgManager().getDirectApplication(req.user, req.params.oid);
                }

                if(scope==null){
                    throw new Error("Scope not supported");
                }

                const policy = await $.context.getOrgManager()
                        .updateOrgAppPolicy(req.user, scope, Policy.fromUnsafeObject(req.body.policy));


                $.sendSuccess( res, {
                    uid: policy.getUID()
                });
            }catch(err){
                Logger.error("[API][AUDIT] Policy cannot be modified. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Policy cannot be modified. Cause : " + err.message);
            }
        },
        'delete': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // target org
                let scope:Nullable<OrganizationUnit|ApplicationUnit> = null;
                if(req.params.scope==="org"){
                    scope = await $.context.getOrgManager().getOrganization(req.user, req.params.oid);
                }else if(req.params.scope==="app"){
                    scope = await $.context.getOrgManager().getDirectApplication(req.user, req.params.oid);
                }

                if(scope==null){
                    throw new Error("Scope not supported");
                }

                await $.context.getOrgManager()
                    .updateOrgAppPolicy(req.user, scope,
                        new Policy({ uuid:req.params.pid }), true );

                $.sendSuccess( res, {});
            }catch(err){
                Logger.error("[API][AUDIT] Policy cannot be modified. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Policy cannot be modified. Cause : " + err.message);
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
    '/policy/:scope/:oid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // target org
                const org = await $.context.getOrgManager().getOrganization(req.user, req.params.oid);

                $.sendSuccess( res, org.policies.map(x => x.toJsonObject()));
            }catch(err){
                Logger.error("[API][AUDIT] Policy cannot be modified. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Policies cannot be retrieved. Cause : " + err.message);
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
    '/policies/actions',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // target org
                $.sendSuccess( res,  PolicyActionFactory.listActions());
            }catch(err){
                Logger.error("[API][AUDIT] Policy cannot be modified. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Policies cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/bom/purposes',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                const am = $.context.getAuditManager();
                $.sendSuccess(res, await am.listPurposes());
            }catch(err){
                Logger.error("[API][AUDIT] BOM purposes cannot be listed. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "BOM purposes cannot be listed.");
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);


AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/report/:unsafeReportUUID/:aid',
    {
        'get': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                const rep = (await am.getReport(req.user, req.params.unsafeReportUUID, app));
                if(req.query.preview != null
                    && (typeof req.query.preview==='string')
                    && parseInt(req.query.preview,10)===1){
                    $.sendSuccess(res, rep.asPreview());
                }else{
                    $.sendSuccess(res, rep.toJsonObject());
                }

            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);



AUDIT_WEB_API.addAsyncAuthenticatedRoute(
    '/report/:unsafeReportUUID/:aid/export/:type',
    {
        'post': async (req:DelegateRequest, res:DelegateResponse) => {
            const $: WebServer = req.dxc.$;

            try{
                // ========== LOGIC
                const am = $.context.getAuditManager();
                const app:ApplicationUnit = await  $.context.getOrgManager().getDirectApplication(
                    req.user,
                    req.params.aid as string
                );

                const rep = (await am.getReport(req.user, req.params.unsafeReportUUID, app));
                let sanitizedOpts:any = {};

                if(ValidationRule.structure({
                    appendApp: ValidationRule.bool(),
                    appendDevice: ValidationRule.bool(),
                    appendPlatform: ValidationRule.bool(),
                    clean: ValidationRule.bool(),
                    embedKpis: ValidationRule.bool(),
                    groupSampleByNode: ValidationRule.bool(),
                    sampling: ValidationRule.bool(),
                    samplingSize: ValidationRule.number(0,1000),
                }).test(req.body.opts)){
                    sanitizedOpts = req.body.opts;
                }else{
                    throw new Error("Invalid export options.");
                }

                let ex:any;
                switch (req.params.type){
                    case "json":
                        ex = await $.context.getAuditManager().exportJson(req.user, rep, sanitizedOpts);
                        $.sendSuccess( res, ex);
                        break;
                    default:
                        throw new Error("Unknown export type.");
                }
            }catch(err){
                Logger.error("[API][AUDIT] Report cannot be retrieved. Cause : " + err.message + "\n\t" + err.stack);
                $.sendError(res, "Report cannot be retrieved. Cause : " + err.message);
            }
        }
    },{
        lazyProject: true,
        nodeAffinity: DexcaliburEngineMode.MASTER
    }
);

