import {ScanFlow} from "./ScanFlow.js";
import DexcaliburEngine, {DexcaliburEngineMode} from "../../DexcaliburEngine.js";
import {ScanOrder} from "./ScanOrder.js";
import {Subject} from "rxjs";
import {EngineNode, NodePurpose} from "../../core/EngineNode.js";
import {AuditManager} from "../AuditManager.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {AssuranceScanner} from "./AssuranceScanner.js";
import {LicenceManager} from "../../credit/LicenceManager.js";
import AssuranceReport from "./AssuranceReport.js";

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
                this.newScan(vOrder);
        });
    }

    /**
     * To verify if the project owner account has enough credits to order
     * the scan
     * @param vOrder
     */
    verifyBalance(vOrder:ScanOrder){
        // TODO : verify balance and sign result
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
     *
     * @param pProject
     * @param pOrder
     */
    async newStandaloneScan(pProject:DexcaliburProject, pOrder:ScanOrder):Promise<AssuranceReport> {
        const am = AuditManager.getInstance();
        const model = await am.getModel(pProject, pOrder.getModelUID());
        const scanner:AssuranceScanner = LicenceManager.getProduct(pProject,model.scannerID) as AssuranceScanner;

        const opts = scanner.validateOptions(pOrder.options);

        scanner.setModel(model);
        // check credit
        //scanner.hasCredit()
        await scanner.run(pProject, opts);

        // get report
        const report = scanner.getReport();

        // save report
        am.saveReport(pProject, report);

        // get hook instance by ID
        return report;
    }

    /**
     * To start a new scan
     *
     * @param pOrder
     */
    async newScan(pOrder:ScanOrder):Promise<any> {

        let existingNodes:EngineNode[];
        let node:EngineNode = this._ctx.nodeManager.getReadySlave(
            pOrder.getProjectUID(),
            NodePurpose.SCAN
        );

        // check ressources quotas
        if(node == null){
            // start a new node
            node = this._ctx.nodeManager.createNode(pOrder.settings.projectUID); //, pOrder.settings.targetOS);
            node.start();
        }

        if(!await node.isBusy()){
            // send a request to order a scan to the node
            node.startScan(pOrder.getModelUID());
        }else{
            // add scan to queue
            node.appendToQueue(pOrder.getModelUID());
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