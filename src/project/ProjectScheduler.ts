import DexcaliburEngine from "../DexcaliburEngine.js";
import {Subject} from "rxjs";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import {ScanFlow} from "../audit/common/ScanFlow.js";
import DexcaliburProject from "../DexcaliburProject.js";
import AssuranceReport from "../audit/common/AssuranceReport.js";
import {AuditManager} from "../audit/AuditManager.js";
import {AssuranceScanner} from "../audit/common/AssuranceScanner.js";
import {LicenceManager} from "../credit/LicenceManager.js";
import {EngineNode, NodePurpose, OperationType, ScanState} from "../core/EngineNode.js";
import {ACTION_DATE} from "../common/ActionDates.js";
import ts from "typescript/lib/tsserverlibrary.js";
import Project = ts.server.Project;
import {ProjectOrder} from "./ProjectOrder.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {ProjectSchedulerException} from "../errors/ProjectSchedulerException.js";
import {UserAccount} from "../user/UserAccount.js";


export class ProjectScheduler {


    /**
     *
     * @private
     */
    private _ctx:DexcaliburEngine;

    private _lock = false;

    /**
     * Stream of project orders
     *
     * @private
     */
    private _new$:Subject<ProjectOrder> = new Subject<ProjectOrder>();

    /**
     * Stream of (waiting) project orders to push to the queue
     *
     * @private
     */
    private _queued$:Subject<ProjectOrder> = new Subject<ProjectOrder>();


    constructor( pEngine:DexcaliburEngine) {
        this._ctx = pEngine;

        this._new$.subscribe(async (vOrder:ProjectOrder)=>{
            await this.verifyBalance(vOrder);
        });

        this._queued$.subscribe((vOrder:ProjectOrder)=>{
            this.newProject(vOrder);
        });
    }

    /**
     * To verify if the project order can be achieve for the organization
     *
     * @param vOrder
     */
    async verifyBalance(pOrder:ProjectOrder):Promise<void>{

        await this._ctx.getOrgManager().verifyBalance(pOrder);

        this._queued$.next(pOrder);
    }

    private _checkLock():void {
        if(this._lock){
            throw new Error(`This scheduler instance [node=${this._ctx.UID}] is locked`);
        }
    }

    /**
     * To push a new project order to the queue before balance verifying
     *
     * @param {ProjectOrder} pOrder
     */
    newOrder(pOrder:ProjectOrder):void {
        this._new$.next(pOrder);
    }

    /**
     *
     * @param pProject
     * @param pOrder
     */
    /*async newStandaloneOrder(pOrder:ProjectOrder):Promise<DexcaliburProject> {
        const edb = this._ctx.getEngineDB();
        const am = AuditManager.getInstance();


        console.log("order save NEW SCAN ORDER> ",await edb.save(pOrder));
        //await edb.save(pOrder);

        const model = await am.getModelFor(pProject, pOrder.getModelUID());
        const scanner:AssuranceScanner = LicenceManager.getProduct(pProject,model.scannerID) as AssuranceScanner;

        const opts = scanner.validateOptions(pOrder.options);

        scanner.setModel(model);

        pOrder.setState(ScanState.RUNNING);
        pOrder.setDate( ACTION_DATE.START );


        console.log("order save BEFORE SCAN START> ",await edb.save(pOrder));
        //await edb.save(pOrder);

        // check credit
        //scanner.hasCredit()
        await scanner.run(pProject, opts);
        pOrder.setDate( ACTION_DATE.STOP );
        pOrder.setState(ScanState.GENERATE_REPORT);

        console.log("order save BEFORE REPORT SAVING> ",await edb.save(pOrder));
        //await edb.save(pOrder);

        // get report
        const report = scanner.getReport();
        // save report
        am.saveReport(pProject, report);
        //pOrder.report = report;
        pOrder.setState(ScanState.TERMINATED);
        console.log("order save TERMINATED> ",await edb.save(pOrder));
        //await edb.save(pOrder);
        // get hook instance by ID
        return report;
    }*/

    /**
     * To start a new scan
     *
     * @param pOrder
     */
    async newProject(pOrder:ProjectOrder):Promise<any> {

        let existingNodes:EngineNode[];
        let node:EngineNode = await this._ctx.nodeManager.getReadySlave(
            pOrder.getProjectUID(),
            NodePurpose.NEW_PRJ,
            pOrder.getOrganizationUnit()
        );

        // check ressources quotas
        if(node==null && await this._ctx.nodeManager.canCreateNode(pOrder.getOrganizationUnit())){
            // start a new node
            node = await this._ctx.nodeManager.createNode(pOrder.settings.projectUID, NodePurpose.NEW_PRJ, pOrder.getOrganizationUnit());
            node.start("New project ordered");
        }

        if(!await node.isBusy()){
            // send a request to order a scan to the node
            node.startProject(this._ctx.getInternalAcc(),pOrder);
        }else{
            // add scan to queue
            node.appendToQueue(pOrder, OperationType.NEW_PROJ);
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
    async listAllOrders(pUser:UserAccount):Promise<ScanOrder[]> {
        return await (this._ctx.getEngineDB().getCollectionOf(new ScanOrder()).getAsList());
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