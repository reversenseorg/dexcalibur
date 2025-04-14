import {ScanFlow} from "./ScanFlow.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {ScanOrder, ScanOrderUUID} from "./ScanOrder.js";
import {Subject} from "rxjs";
import {EngineNode, NodePurpose, OperationType, ScanState} from "../../core/EngineNode.js";
import {AuditManager} from "../AuditManager.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import {AssuranceScanner} from "./AssuranceScanner.js";
import {LicenceManager} from "../../credit/LicenceManager.js";
import AssuranceReport from "./AssuranceReport.js";
import {ACTION_DATE} from "../../common/ActionDates.js";
import {UserAccount} from "../../user/UserAccount.js";
import {ApplicationUnit} from "../../organization/ApplicationUnit.js";
import {Workflow} from "../../Workflow.js";
import {ProjectManagerException} from "../../errors/ProjectManagerException.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {OrganizationUnit} from "../../organization/OrganizationUnit.js";
import {AuditManagerException} from "../errors/AuditManagerException.js";
import {BusinessPlan} from "../../billing/BusinessPlan.js";
import {NodeState} from "../../core/EngineNodeManager.js";

/**
 * Present a scan scheduler
 *
 * An engine instance has only one scan scheduler.
 * It works closely with NodeManager to spawn slave instance of dexcalibur
 * and run scan
 *
 * @class
 */
export class ScanScheduler {


    /**
     *
     * @private
     */
    private _ctx:DexcaliburEngine;



    private _lock = false;

    private _new$:Subject<ScanOrder> = new Subject<ScanOrder>();

    private _queued$:Subject<ScanOrder> = new Subject<ScanOrder>();


    private _active:ScanFlow[] = [];
    private _past:ScanFlow[] = [];

    constructor( pEngine:DexcaliburEngine) {
        this._ctx = pEngine;

        this._new$.subscribe((vOrder:ScanOrder)=>{
            this.verifyBalance(vOrder);
        });

        this._queued$.subscribe((vOrder:ScanOrder)=>{
            this.newScan(vOrder, vOrder.options);
        });
    }

    /**
     * To verify if the project owner account has enough credits to order
     * the scan
     * @param vOrder
     */
    verifyBalance(vOrder:ScanOrder){
        // TODO : verify balance width License Server and sign result
        this._queued$.next(vOrder);
    }

    private _checkLock():void {

        if(this._lock){
            throw new Error("Scan scheduler is locked");
        }
    }


    newOrder(pOrder:ScanOrder):void {
        this._new$.next(pOrder);
    }

    /**
     * To perform a scan
     * @param pProject
     * @param pOrder
     */
    async newStandaloneScan(pUser:UserAccount, pProject:DexcaliburProject,
                            pOrder:ScanOrder, pOrg:Nullable<OrganizationUnit> = null):Promise<AssuranceReport> {


        if(pOrg==null){
            throw AuditManagerException.CANNOT_SCAN_ORG_IS_MANDATORY();
        }

        const edb = this._ctx.getEngineDB();
        const am = this._ctx.getAuditManager();

        let wf:Workflow, project:DexcaliburProject;

        // prepare project if it is not yet ready
        if(!pProject.isReady()){
            wf = new Workflow({
                uid: `${pProject.getUID()}:scan:${(new Date()).getTime()}`
            });
            project = await DexcaliburProject.load(this._ctx, pProject.getUID(), pUser, null, wf);
        }else{
            project = pProject;
            wf = pProject.getWorkflow();
        }

        if(pOrder.getUUID()==null){
            await this._ctx.getScanScheduler().saveOrder(pOrder)
        }

        this._ctx.getOrgManager().verifyScanBalance(pOrder);

        pOrder.setState(ScanState.RUNNING);
        pOrder.setDate( ACTION_DATE.START );

        // check if the project is ready
        if(!project.isReady()){
            // load graph
            await project.fullscan();
        }

        if(!project.isReady()){
            //throw ScanSchedulerException.PROJECT_NOT_READY(project.getUID());
            throw ProjectManagerException.PROJECT_NOT_LOADED(project.getUID(),"scan-scheduler-new")
        }

        // check credit
        //scanner.hasCredit()

        //const report =await am.scan(pUser, pProject, pOrder.getUID());
        const report =await am.orgScan(pUser, pOrg, project, pOrder.getModelUID());

        if(pOrder.appUnit!=null){
            report.application = pOrder.appUnit;
        }

        report.setProject(project);


        //await scanner.run(project, opts);
        pOrder.setDate( ACTION_DATE.STOP );
        pOrder.setState(ScanState.GENERATE_REPORT);

        console.log("order save BEFORE REPORT SAVING> ");
        await this.saveOrder(pOrder, ['dates','state','stateDates'])
        //await edb.save(pOrder);

        console.log("report save BEFORE REPORT SAVING> ");
        //await edb.save(pOrder);

        // get report
        //const report = scanner.getReport();
        // save report
        await am.saveReport(project, report);
        //pOrder.report = report;
        pOrder.setState(ScanState.TERMINATED);
        console.log("report & order SAVED ");
        await edb.save(pOrder);
        //await edb.save(pOrder);
        // get hook instance by ID
        return report;
    }

    /**
     *
     * @param pOrder
     * @param pPpt
     */
    async saveOrder(pOrder:ScanOrder, pPpt:string[] = []):Promise<ScanOrder> {
        if(pOrder.getUID()!=null){
            let order = pOrder;
            await this._ctx.getEngineDB().getCollectionOf(ScanOrder.TYPE.getType())
                .asyncUpdateEntry(pOrder, { replace:false, upsert:true, $set:pPpt });
            return order;
        }else{
            pOrder.uuid = await (this._ctx.getEngineDB()).generateFreeUuid(ScanOrder.TYPE.getType(), 'uuid');

            return await this._ctx.getEngineDB().getCollectionOf(ScanOrder.TYPE.getType())
                .asyncAddEntry(pOrder.getUUID(), pOrder);
        }

    }

    /**
     * To start a new scan
     *
     * @param pOrder
     */
    async newScanBundle(pUser:UserAccount, pProj:DexcaliburProjectUUID, pOrders:ScanOrder[], pExtraOpts:any = {}):Promise<any> {

        let node:EngineNode;

        // search node
        node = await this._ctx.nodeManager.getReadySlave(
            pProj,
            NodePurpose.ANY
        );

        // no ready node, search running, budy, node
        if(node==null){

            const projNodes = await this._ctx.getNodeManager()
                .getNodeByProject(pProj,NodePurpose.ANY,true);

            if(projNodes.length>0){
                if(await projNodes[0].checkReadyness()){
                    node = projNodes[0];
                }
            }
        }

        // if always no node, create a new one
        if(node==null){

            // search free node or node for REVIEW / HOOK
            node = await this._ctx.getProjectManager().open(
                pUser,
                pProj,
                NodePurpose.ANY,
                {
                    scanOrders: pOrders,
                    ...pExtraOpts
                });

        }else{
            node.setEngine(this._ctx);

            for(let i=0; i<pOrders.length; i++){
                pOrders[i].slaveUID=node.getUID();
                await this.saveOrder(pOrders[i], ['slaveUID']);
                await node.appendToQueue(pOrders[i], OperationType.SCAN_ORDER);
            }
        }

        return node;
    }

    /**
     * To start a new scan
     *
     * @param pOrder
     */
    async newScan(pOrder:ScanOrder, pExtraOpts:any = {}):Promise<any> {

        let node:EngineNode;
        const orderOpts = pOrder.getOption('extra');

        // check
        if(pOrder.getProjectUID()!=null){

            node = await this._ctx.nodeManager.getReadySlave(
                pOrder.getProjectUID(),
                NodePurpose.ANY
            );

            console.log("READY SLAVE FROM newScan ",node);

            if(node != null){
                pOrder.slaveUID = node.getUID();
            }
        }

        // save order
        await this.saveOrder(pOrder, ['slaveUID']);

        console.log("NEW SCAN > ",pOrder,pOrder.getUUID());

        // check ressources quotas
        if(node == null){

            // append scan order to the exec queue after project loading
            pExtraOpts.scanOrders = [pOrder];

            const owner = await this._ctx.getUserService().getAccount(
                this._ctx.getInternalAcc(), orderOpts.owner
            );

            // search free node or node for REVIEW / HOOK
            node = await this._ctx.getProjectManager().open(
                owner,
                pOrder.getProjectUID(),
                NodePurpose.ANY,
                pExtraOpts);


            pOrder.slaveUID = node.getUID();
            pOrder = await this.saveOrder(pOrder, ['slaveUID']);
        }else{
            node.appendToQueue(pOrder, OperationType.SCAN_ORDER);
        }
    }

    /**
     * To list orders from a project
     *
     * @param pProject
     */
    async listOrdersOf( pProject:DexcaliburProject|string):Promise<ScanOrder[]> {
        let projectUID:string;
        if(typeof pProject==="string"){
            projectUID = pProject;
        }else{
            projectUID = pProject.uid;
        }

        return await (this._ctx.getEngineDB().search({settings: { projectUID: projectUID }}, new ScanOrder()) as Promise<ScanOrder[]>);
    }


    /**
     * To list orders from a project
     *
     * @param pProject
     */
    async listAllOrders(pUserAccount:UserAccount):Promise<ScanOrder[]> {
        return await (this._ctx.getEngineDB().getCollectionOf(ScanOrder.TYPE.getType())
            .getAsList());
    }

    /**
     * To list orders from a project
     *
     * @param pProject
     */
    async listOrdersByApp(pUserAccount:UserAccount, pApp:ApplicationUnit):Promise<ScanOrder[]> {

        // list projects in app unit
        return await (this._ctx.getEngineDB().getCollectionOf(ScanOrder.TYPE.getType()))
            .search({ filter: { 'settings.projectUID': { $in: pApp.getReleases() } } }, {raw:true});
    }

    /**
     * To retrieve an order by its UUID
     *
     * @param pUserAccount
     * @param pOrderUUID
     */
    async getOrder(pUserAccount:UserAccount, pOrderUUID:ScanOrderUUID):Promise<ScanOrder> {


        const order = await (this._ctx.getEngineDB().getCollectionOf(ScanOrder.TYPE.getType()))
            .search({ filter: {
                'uuid':pOrderUUID
            } }, {raw:true});

        // todo : check ACL

        if(order.length>0){
            return order[0];
        }else{
            return null;
        }
    }


    /*
    start(pDelay = 0):ScanFlow[] {
        const moved:ScanFlow[] = [];
        // prevent race condition
        this._lock = true;

        this._queued.map((x, i) => {
            if(x==null) return;

            this._active.push(x);
            moved.push(x);

            //( async ()=>{
            setTimeout(()=>{
                console.log("[SCAN SCHEDULER] Start ",x.state.startDate);
                x.start();
                console.log("[SCAN SCHEDULER] End ",x.state.startDate);
            }, pDelay);


            //})();
        });

        this._queued = [];

        this._lock = false;
        this.save();

        return moved;
    }

    private _getSaveFilePath():string {
        const folder = this._ctx.getWorkspace().getAuditDir();
        return _path_.join(folder, "scheduler.json");
    }

    save():void {
        const path = this._getSaveFilePath();

        if(_fs_.existsSync(path)){
            _fs_.unlinkSync(path);
        }


        _fs_.writeFileSync(path, JSON.stringify(this.toJsonObject()));
    }

    restore():void {
        const path = this._getSaveFilePath();
        if(_fs_.existsSync(path)){
            const data = JSON.parse(_fs_.readFileSync(path, {encoding:'utf-8'}));

            data._past.map(x => {
                const sf = ScanFlow.fromJsonObject(x);
                sf.scheduler = this;
                this._past.push(  sf) ;
            });
            data._active.map(x => {
                const sf = ScanFlow.fromJsonObject(x);
                sf.scheduler = this;
                this._active.push(  sf) ;
            });
            data._queued.map(x => {
                const sf = ScanFlow.fromJsonObject(x);
                sf.scheduler = this;
                this._queued.push(  sf) ;
            });

            console.log("[SCAN SCHEDULER] Data restored.")
        }else{
            console.log("[SCAN SCHEDULER] Data cannot be restored : file is missing.")
        }
    }

    toJsonObject(){
        let o:any = {
            _past: [],
            _active: [],
            _queued: []
        };

        this._past.map(x => o._past.push(x.toJsonObject()));
        this._active.map(x => o._active.push(x.toJsonObject()));
        this._queued.map(x => o._queued.push(x.toJsonObject()));

        CoreDebug.checkJsonSerialize(o, "ScanScheduler");
        return o;
    }*/
}