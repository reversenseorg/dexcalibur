import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import AssuranceModel, {AssuranceModelUUID} from "./common/AssuranceModel.js";
import AssuranceReport, {AssuranceReportUUID} from "./common/AssuranceReport.js";
import {AuditManagerException} from "./errors/AuditManagerException.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import * as Log from "../Logger.js";
import {Nullable} from "../core/IStringIndex.js";
import {ProjectManagerException} from "../errors/ProjectManagerException.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {UserAccount} from "../user/UserAccount.js";
import AccessControl from "../user/acl/AccessControl.js";
import {AssuranceScanner} from "./common/AssuranceScanner.js";
import {ScanFlow} from "./common/ScanFlow.js";
import {LicenceManager} from "../credit/LicenceManager.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {ApplicationUnit, ApplicationUnitUUID} from "../organization/ApplicationUnit.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {GenericScanner} from "./common/GenericScanner.js";
import {ScannerFactory} from "./scanner/ScannerFactory.js";
import {BusinessPlan, BusinessPlanType} from "../billing/BusinessPlan.js";
import {ScanOrder, ScanOrderUUID} from "./common/ScanOrder.js";
import {PolicyRuleFactory} from "./PolicyRuleFactory.js";
import {Policy} from "./Policy.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {ReversenseProductUUID} from "../billing/ReversenseProduct.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {BomPurpose} from "../bom/BomPurpose.js";
import Util from "../Utils.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

const SUBDIRS = {
    REPORTS: "reports",
    MODELS: "models",
};

let gInstance:AuditManager|null = null;

const GLOBAL_MODELS_FOLDER = "models";
const PROJECT_MODELS_FOLDER = "models";

interface AssuranceModelMap {
    [id:string] : AssuranceModel;
}

interface AmCache {
    purp: Nullable<{
        time: number,
        data: BomPurpose[]
    }>
}

/**
 * Class to load, store and manage assurance model
 * in project context
 *
 * @class
 */
export class AuditManager {

    engine:DexcaliburEngine;

    scanfact: ScannerFactory;

    private _cache:AmCache = { purp:null };

    genericModels:AssuranceModel[] = [];

    constructor(pEngine:DexcaliburEngine) {

        this.engine = pEngine;
        this.scanfact = new ScannerFactory();
    }

    /**
     *
     */
    static getInstance(pEngine:DexcaliburEngine|null = null):AuditManager {
        if(gInstance==null){
            if(pEngine!=null){
                gInstance = new AuditManager(pEngine);
            }else{
                throw AuditManagerException.CANNOT_INITIALIZE();
            }
        }

        return gInstance;
    }

    /**
     * A hook of Engine initializing
     *
     * @method
     * @async
     */
    async init():Promise<void> {
        return ;
    }


    async getScanOrder(pUser:UserAccount, pOrder:ScanOrderUUID):Promise<ScanOrder>{

        let res =  await (this.engine.getEngineDB().getCollectionOf(ScanOrder.TYPE.getType()))
            .search({ uuid: pOrder });

        return (res.length>0 ? res[0] : res);
    }

    /**
     * To list assurance model of the project.
     *
     * It includes :
     * - available models
     * - custom models
     *
     *
     * @return {AssuranceModel[]}
     * @method
     */
    async listAllModels( pUser:UserAccount):Promise<Record<AssuranceModelUUID,AssuranceModel>> {
        AccessControl.isAuthorized(
            AccessControl.access.GLOBAL_MODEL_READ,
            pUser
        );
        let allModels:Record<AssuranceModelUUID,AssuranceModel> = {};

        // load from remote signature server
        const remoteSharedModels = await this.engine.getSignatureServer().getModels();
        remoteSharedModels.map(x=> {
            //x.updateControlTree(x.controls);
            allModels[x.getID()] = x;
        });


        return allModels;
    }

    /**
     * To list assurance model of the project.
     *
     * It includes :
     * - available models
     * - custom models
     *
     *
     * @return {AssuranceModel[]}
     * @method
     */
    async listAllModelsByOrg( pUser:UserAccount, pOrg:OrganizationUnit):Promise<AssuranceModel[]> {
        AccessControl.isAuthorized(
            AccessControl.access.GLOBAL_MODEL_READ,
            pUser
        );
        const all = await this.listAllModels(pUser);

        return Object.values(all);
    }


    /**
     * To list assurance model of the project.
     *
     * It includes :
     * - available models
     * - custom models
     *
     *
     * @return {AssuranceModel[]}
     * @method
     */
    async listProjectModels( pUser:UserAccount, pProject:DexcaliburProject):Promise<AssuranceModel[]> {
        AccessControl.isAuthorized(
            AccessControl.access.PROJECT_MODEL_READ,
            pUser
        );

        return await (pProject.getProjectDB()
            .getCollectionOf(AssuranceModel.TYPE.getType()) as MongodbDbCollection)
            .search({});
    }


    /**
     * To list assurance model of the project.
     *
     * It includes :
     * - available models
     * - custom models
     *
     *
     * @return {AssuranceModel[]}
     * @method
     */
    async listModels( pUser:UserAccount, pProject:DexcaliburProject|null = null):Promise<AssuranceModel[]> {

        AccessControl.isAuthorized(
            AccessControl.access.GLOBAL_MODEL_READ,
            pUser
        );

        AccessControl.isAuthorized(
            AccessControl.access.PROJECT_MODEL_READ,
            pUser
        );

        if(pProject==null){
            throw ProjectManagerException.PROJECT_NOT_LOADED("");
        }


        const all = await this.listAllModels(pUser);

        if(pProject!=null){
            const projModels = await this.listProjectModels(pUser, pProject);

            // if some built-in models are not already stored in Dexcalibur or Project workspace,
            // create it
            let uid:AssuranceModelUUID;
            for(let i=0;i<projModels.length; i++){
                uid = projModels[i].getUID();
                if(all[uid]==null){
                    projModels[i].updateControlTree(projModels[i].controls);
                    all[uid] = projModels[i];
                }
            }
        }

        return Object.values(all);
    }

    /**
     * To list assurance report of the project.
     *
     * @param {DexcaliburProject} pProject
     * @return {AssuranceModel[]}
     * @method
     */
    async listReports( pUser:UserAccount, pProject:DexcaliburProject):Promise<AssuranceReport[]> {
        let x:AssuranceReport, model:AssuranceModel;

        const modelsMap: Record<AssuranceModelUUID, AssuranceModel> = {};
        (await this.listModels(pUser,pProject)).map(x => modelsMap[x.getUID()]=x);



        const reports = await this.listReportsFromDB( pUser, pProject.getUID());


        for(let i=0;i<reports.length; i++){
            x = reports[i];
            model = modelsMap[x.getModel()];

            x.setProject(pProject);
            if(model != null){
                x.setModel(model);
                // to load a report, aech node reference contained into match must be resolved
                x.cleanReferences()
            }else{
                Logger.error("[AUDIT MANAGER] listReports > model cannot be restored ",x.model);
            }
        }

        return reports;
    }



    /**
     * To list assurance reports of the project even if the project is closed
     *
     * @return {AssuranceReport[]}
     * @method
     */
    async listReportsByApp( pUser:UserAccount, pAppUnit:ApplicationUnit):Promise<AssuranceReport[]> {

        AccessControl.isAuthorized(
            AccessControl.access.AUDIT_REPORT_READ,
            pUser,
            pAppUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
            ]
        );

        const reports = await (this.engine.getEngineDB()
             .getCollectionOf(AssuranceReport.TYPE.getType()))
             .search({
                 filter: {
                     project: {
                         $in: pAppUnit.getReleases()
                     }
                 }
             },{raw:true});



        return reports;
    }

    /**
     * To list assurance reports of the project even if the project is closed
     *
     * @return {AssuranceReport[]}
     * @method
     */
    async listReportsFromDB( pUser:UserAccount, pProjectUID:Nullable<DexcaliburProjectUUID>):Promise<AssuranceReport[]> {

        AccessControl.isAuthorized(
            AccessControl.access.AUDIT_REPORT_READ,
            pUser
        );

        const all:AssuranceReport[] = await this.engine.getEngineDB().listScanReports();
        let reports:AssuranceReport[] = [];

        if(pProjectUID==null){
            reports = all;
        }else{
            all.map(x => {
                if(x.project==pProjectUID){
                    try{
                        reports.push(x);
                    }catch (e){

                    }

                }
            });
        }


        return reports;
    }

    async getModelFor( pUser:UserAccount, pProject:DexcaliburProject, pModelID:AssuranceModelUUID):Promise<AssuranceModel> {
        const models = await this.listModels(pUser, pProject);
        let model:AssuranceModel = null;
        for(let i=0; i<models.length; i++){
            if(models[i].id===pModelID){
                model = models[i];
            }
        }

        if(model==null){
            throw AuditManagerException.MODEL_NOT_FOUND(pModelID);
        }

        return model;
    }

    /**
     *
     * @param pUser
     * @param pModelID
     * @deprecated ?
     */
    async getModel( pUser:UserAccount, pModelID:AssuranceModelUUID):Promise<AssuranceModel> {
        const models = await this.listModels(pUser);
        let model:AssuranceModel = null;
        for(let i=0; i<models.length; i++){
            if(models[i].id===pModelID){
                model = models[i];
            }
        }

        if(model==null){
            throw AuditManagerException.MODEL_NOT_FOUND(pModelID);
        }

        return model;
    }

    /**
     * To retrieve an assurance model by its uid
     * @param pUser
     * @param pModelID
     */
    async getModelByUID( pUser:UserAccount, pModelID:AssuranceModelUUID):Promise<Nullable<AssuranceModel>> {

        // TODO check assurance ACL
        const remoteSharedModels = await this.engine.getSignatureServer().getAssuranceModel(pModelID);

        if(remoteSharedModels==null){
            throw AuditManagerException.MODEL_NOT_FOUND(pModelID);
        }

        remoteSharedModels.updateControlTree(remoteSharedModels.controls);

        return remoteSharedModels;
    }




    /**
     * To save an assurance model into global or project workspace
     *
     * Final location depends of context :
     *  - If a projet is open and active, the model will be saved into project folder
     *  - If there is not active project, the model ll be save into Dexcalibur configuration folder into the workspace
     *
     *  @param {AssuranceModel} pModel The assurance model to save
     *  @param {DexcaliburProject|null} pProject Default NULL. The active project or null
     *  @return {void}
     *  @throws {AuditManagerException}
     *  @method
     *  @async
     */
    async saveModel(pModel:AssuranceModel, pProject:DexcaliburProject|null = null):Promise<void>{
        try{
            if(pProject!=null){
                await pProject.getProjectDB().save(pModel);
            }else{
                await this.engine.getEngineDB().save(pModel);
            }
        }catch (err){
            throw AuditManagerException.CANNOT_SAVE_MODEL(pModel.getID(),err.message);
        }
    }


    /**
     *
     * @param pProject
     * @param pReport
     * @return {Promise<void>} Path of the report file
     * @method
     */
    async saveReport( pProject:DexcaliburProject, pReport:AssuranceReport):Promise<void> {

        try{
            // save into DB
            const uuid = await this.engine.getEngineDB().generateFreeUuid(
                AssuranceReport.TYPE.getType(),
                AssuranceReport.TYPE.getPrimaryKey().getName()
            );

            pReport.uid = uuid;

            const coll:MongodbDbCollection = this.engine.getEngineDB().getCollectionOf(AssuranceReport.TYPE.getType()) as MongodbDbCollection;

            const ctrls = pReport.controls;

            //pReport.matches = {};
            console.log("Save report");
            await this.engine.getEngineDB().save(pReport);

            // save structure without matches

            console.log("Save report controls")

           /*
            for(let i=0; i<ctrls.length; i++){
                await coll.asyncUpdateEntry(
                    { uid: pReport.getUID() },
                    { upsert:false, $set:{
                        controls: {

                        }
                    }}
                );
            }*/



            // add matches sequentially




        }catch (err){
            console.log(err,err.code);
        }


        return ;
    }

    /**
     *
     * @param pProject
     * @param pReport
     * @return {string} Path of the report file
     * @method
     */
    async updateReport( pProject:DexcaliburProject, pReport:AssuranceReport, pPpt:string[]):Promise<void> {


        await (this.engine.getEngineDB().getCollectionOf(AssuranceReport.TYPE.getType()))
            .asyncUpdateEntry( pReport, { replace:false, $set:pPpt })

        return ;
    }

    async batchStart( pUser:UserAccount, pProject:DexcaliburProject, pModels:AssuranceModelUUID[]):Promise<ScanFlow[]> {

        const allModels = await this.listModels(pUser, pProject);
        const targetModels: AssuranceModel[] = [];
        const scanners: AssuranceScanner[] = [];
        //const reports: Record<AssuranceModelUUID, AssuranceReport[]> = {};
        const scheduler = pProject.getScanScheduler();
        const flows:ScanFlow[] = [];

        // retrieve the list of targeted models
        allModels.map((vModel)=>{
            if(pModels.indexOf(vModel.getID())>-1){
                // create one scanner per model
                const asc = LicenceManager.getProduct( pProject, vModel.getScannerID()) as AssuranceScanner;
                asc.setModel(vModel);

                targetModels.push(vModel);
                scanners.push(asc);
            }
        });

        // run scanner
        for(let i=0; i<scanners.length; i++){
            flows.push(scheduler.newScan(scanners[i]));
        }

        return  scheduler.start(200);
    }

    async getScanner(pUser:UserAccount,  pProject:DexcaliburProject, pName:string):Promise<AssuranceScanner> {
        return this.scanfact.createScanner(pProject,pName);
    }

    /**
     *
     * @param pUser
     * @param pProject
     * @param pModel
     */
    async scan(pUser:UserAccount, pProject:DexcaliburProject, pModel:AssuranceModelUUID):Promise<AssuranceReport> {

        // get model with ACL
        const model = await this.getModelByUID(pUser, pModel);

        // get scanner required by model
        const scanner:GenericScanner = LicenceManager.getProduct(pProject, model.getScannerID()) as GenericScanner;


        // set model to scan
        scanner.setModel(model);

        //scanner.hasCredit()
        return await scanner.runModel(pProject);
    }

    /**
     * Internal API
     *
     * License (subscription or Scan) is checked earlier
     *
     * @param pUser
     * @param pProject
     * @param pModel
     */
    async orgScan(pUser:UserAccount, pOrg:OrganizationUnit, pProject:DexcaliburProject, pModel:AssuranceModelUUID):Promise<AssuranceReport> {

        // get model with ACL
        const model = await this.getModelByUID(pUser, pModel);
        const scanner = await this.getScanner(pUser, pProject, model.getScannerID());

        // get scanner required by model
        // const scanner:GenericScanner = LicenceManager.getProduct(pProject, model.getScannerID()) as GenericScanner;

        // set model to scan
        scanner.setModel(model);

        //scanner.hasCredit()
        await scanner.run(pProject, {});


        return scanner.getReport();
    }

    /**
     * To buy a subscription to a specified product already provisionned.
     *
     * If the organization has not enough credits, an exception is thrown
     *
     * @param {UserAccount} pUser
     * @param {OrganizationUnit} pOrg
     * @param {ApplicationUnitUUID} pAppUnit
     * @param {ReversenseProductUUID} pProduct
     * @return {Promise<void>}
     * @async
     * @method
     */
    async activateApplicationSubscription(pUser:UserAccount, pOrg:OrganizationUnit,
                                          pAppUnit:ApplicationUnitUUID, pProduct:ReversenseProductUUID):Promise<void>{
        let bp: BusinessPlan;

        try{
            bp = pOrg.getBusinessPlan();
        }catch (e){
            // create bp
            pOrg.setBusinessPlan(new BusinessPlan({
                org: pOrg.getUID()
            }));
            bp = pOrg.getBusinessPlan();
        }

        if(bp.canPerformScan({ __:NodeInternalType.APP_UNIT, _uid:pAppUnit },[BusinessPlanType.SUBSCRIPTION],pProduct)){
            Logger.info(`License already activated for : ${pAppUnit}`);
            return;
        }

        bp.addSubscription(pUser.getUID(),pAppUnit,pProduct);

        await this.engine.getOrgManager().updateBusinessPlan(pUser, pOrg);


        return ;
    }

    /**
     *
     * @param pUser
     * @param pOrg
     * @param pAppUnit
     * @param pProduct
     *
     * @deprecated
     */
    async activateApplicationScan(pUser:UserAccount, pOrg:OrganizationUnit, pAppUnit:ApplicationUnitUUID, pProduct:ReversenseProductUUID):Promise<void>{
        if(pOrg.getBusinessPlan()==null){
            // TODO : instead of set subscription plan, add scan purchase
            // create bp
            pOrg.setBusinessPlan(new BusinessPlan({
                org: pOrg.getUID()
            }));
        }
    }

    /**
     *
     * @param pUser
     * @param pOrg
     * @param pAppUnit
     * @param pProduct
     *
     * @deprecated
     */
    async buyApplicationScan(pUser:UserAccount, pOrg:OrganizationUnit, pAppUnit:ApplicationUnitUUID, pProduct:ReversenseProductUUID):Promise<void>{
        if(pOrg.getBusinessPlan()==null){
            // TODO : instead of set subscription plan, add scan purchase
            // create bp
            pOrg.setBusinessPlan(new BusinessPlan({
                org: pOrg.getUID()
            }));
        }


    }

    /**
     * To retrieve an assurance model by its uid
     * @param pUser
     * @param pModelID
     */
    async getReport( pUser:UserAccount, pReportUUID:AssuranceReportUUID, pApp:ApplicationUnit):Promise<Nullable<AssuranceReport>> {

        // TODO check assurance ACL
        const report = await (this.engine.getEngineDB()
            .getCollectionOf(AssuranceReport.TYPE.getType())as MongodbDbCollection)
            .asyncGetEntry({ uid: pReportUUID, application:pApp.getUID() })

        if(report==null){
            throw AuditManagerException.REPORT_NOT_FOUND(pReportUUID);
        }

        return report;
    }


    /**
     * To retrieve an assurance model by its uid
     * @param pUser
     * @param pModelID
     */
    async getReports( pUser:UserAccount, pApp:ApplicationUnit, pLimit = -1):Promise<AssuranceReport[]> {

        AccessControl.isAuthorized(
            AccessControl.access.AUDIT_REPORT_READ,
            pUser,
            pApp,
            [
                OrganizationAccessControl.attr.APP_MEMBER,
                OrganizationAccessControl.attr.OWNER,
            ]
        );

        // TODO check assurance ACL
        const reports = await (this.engine.getEngineDB()
            .getCollectionOf(AssuranceReport.TYPE.getType())as MongodbDbCollection)
            .search({ application:pApp.getUID() });


        return reports;
    }


    /**
     * To retrieve an assurance model by its uid
     * @param pUser
     * @param pModelID
     */
    async getLatestReport( pUser:UserAccount, pApp:ApplicationUnit):Promise<Nullable<AssuranceReport>> {

        let reports = await this.getReports(pUser, pApp);

        // sort by create date
        if(reports.length==0) return null;

        reports = reports.sort((r1:AssuranceReport, r2:AssuranceReport)=>{
            return (r1.time>r2.time ? 1 : -1);
        })

        return reports[0];
    }

    async dropReportsByApp(pAppUnitUUID:ApplicationUnitUUID):Promise<void> {

        const rep = await (this.engine.getEngineDB().getCollectionOf(AssuranceReport.TYPE.getType()) as MongodbDbCollection)
            .search({
                application: pAppUnitUUID
            },{raw:true, merlin:false})

        for(let i=0; i<rep.length; i++){
            await (this.engine.getEngineDB().getCollectionOf(AssuranceReport.TYPE.getType()) as MongodbDbCollection)
                .asyncRemoveEntry(rep[i]);
        }

    }


    async dropReportsByProject(pAccount:UserAccount, pProjectUUID:DexcaliburProjectUUID, pAppUnit:Nullable<ApplicationUnit> = null):Promise<void> {

        let reports:AssuranceReport[];
        let success = false;

        if(pAppUnit==null){
            AccessControl.isAuthorized(
                AccessControl.access.SRV_INSTANCE_MGT,
                pAccount
            );


            reports = await this.engine.getEngineDB().getCollectionOf(AssuranceReport.TYPE.getType())
                .search({
                    project: pProjectUUID
                });

            for(let i=0; i<reports.length; i++){
                success = await this.engine.getEngineDB().getCollectionOf(AssuranceReport.TYPE.getType())
                    .asyncRemoveEntry(reports[i]);

                if(success){
                    Logger.success(`[AUDIT MANAGER] dropReportsByProject (1) : Report ${reports[i].getUID()} dropped successfully`);
                }else{
                    Logger.error(`[AUDIT MANAGER] dropReportsByProject (1) : Report ${reports[i].getUID()} cannot be dropped`);
                }
            }

        }else{
            AccessControl.isAuthorized(
                AccessControl.access.AUDIT_REPORT_DEL,
                pAccount,
                pAppUnit,
                [
                    OrganizationAccessControl.attr.APP_MEMBER,
                    OrganizationAccessControl.attr.OWNER,
                ]
            );

            reports = await this.engine.getEngineDB().getCollectionOf(AssuranceReport.TYPE.getType())
                .search({
                    project: pProjectUUID,
                    application: pAppUnit.getUID()
                });

            for(let i=0; i<reports.length; i++){
                success = await this.engine.getEngineDB().getCollectionOf(AssuranceReport.TYPE.getType())
                    .asyncRemoveEntry(reports[i]);


                if(success){
                    Logger.success(`[AUDIT MANAGER] dropReportsByProject (2) : Report ${reports[i].getUID()} dropped successfully`);
                }else{
                    Logger.error(`[AUDIT MANAGER] dropReportsByProject (2) : Report ${reports[i].getUID()} cannot be dropped`);
                }
            }
        }
    }

    /**
     *
     * @param pModel
     */
    async getDefaultPolicyFromModel(pModel:AssuranceModel):Promise<Policy> {
        return PolicyRuleFactory.fromModel(pModel.getUID());
    }


    /**
     * To retrieve the list of scan reports by project (a specific version of the application unit)
     *
     * @param {UserAccount} pUser
     * @param {DexcaliburProjectUUID} pProject Project UUID
     * @returns {AssuranceReport[]} The list of reports
     * @async
     * @method
     */
    async getReportsByAppRelease(pUser:UserAccount, pApp:ApplicationUnit, pProjectUUID:DexcaliburProjectUUID):Promise<AssuranceReport[]> {
        AccessControl.isAuthorized(
            AccessControl.access.AUDIT_REPORT_READ,
            pUser,
            pApp,
            [
                OrganizationAccessControl.attr.APP_MEMBER,
                OrganizationAccessControl.attr.OWNER,
            ]
        );

        // check if oroject is a valid release
        if(!pApp.hasRelease(pProjectUUID)){
            throw OrganizationManagerException.INVALID_APP_RELEASE(pApp.getUID(),pProjectUUID);
        }


        // TODO check assurance ACL
        const reports = await (this.engine.getEngineDB()
            .getCollectionOf(AssuranceReport.TYPE.getType())as MongodbDbCollection)
            .search({
                project: pProjectUUID
            });


        return reports;
    }

    /**
     * To retrieve the list of scan reports by project (a specific version of the application unit)
     *
     * @param {UserAccount} pUser
     * @param {DexcaliburProjectUUID} pProject Project UUID
     * @returns {AssuranceReport[]} The list of reports
     * @async
     * @method
     */
    async getReportsByNearAppRelease(pUser:UserAccount, pApp:ApplicationUnit,
                     pProject:DexcaliburProject, pUpper:boolean, pSameTags:boolean = true ):Promise<AssuranceReport[]> {



        // check if oroject is a valid release
        if(!pApp.hasRelease(pProject.getUID())){
            throw OrganizationManagerException.INVALID_APP_RELEASE(pApp.getUID(),pProject.getUID());
        }

        // search release according to tags
        const rel = await this.engine.getProjectManager().listProjectByAppUnit(pUser, pApp)

        // TODO


        // TODO check assurance ACL
        const reports = await (this.engine.getEngineDB()
            .getCollectionOf(AssuranceReport.TYPE.getType())as MongodbDbCollection)
            .search({
                project: null
            });


        return [];
    }

    async listPurposes(pForce = false):Promise<BomPurpose[]> {
        if(this._cache.purp==null || pForce || ((Util.now() - this._cache.purp.time)>(3600*1000))){
            this._cache.purp = {
                time: Util.now(),
                data: await this.engine.getSignatureServer().getBomPurposes()
            };
        }

        return this._cache.purp.data;
    }
}