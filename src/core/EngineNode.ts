import got from "got";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {Nullable} from "./IStringIndex.js";
import {Subject} from "rxjs";
import * as Process from "child_process";
import DexcaliburWorkspace from "../DexcaliburWorkspace.js";
import UT from "../Utils.js";
import * as _path_ from "path";
import * as _fs_ from "fs";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import {NodeState} from "./EngineNodeManager.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";

const GOT = got.default;


export interface EngineNodeEvent {

}

export enum NodePurpose {
    REVIEW='review',
    SCAN='scan',
    HOOK='hook'
}

export enum ScanState {
    RUNNING="running",
    WAITING="waiting",
    IDLE="idle",
    TERMINATED="terminated",
    GENERATE_REPORT="genreport",
    ABORTED="aborted",
    CRASHED="crashed",
    /**
     * That means Scan has been never started
     */
    NONE="none"
}



export interface PostScanEvent {
    model: string;
    success: boolean;
    report?:Nullable<any>
}

/**
 * Represent a running node
 *
 * @class
 */
export class EngineNode {

    readonly UUID:string;
    private _engine:Nullable<IDexcaliburEngine> = null;

    private _projectUID:string;

    event$:Subject<any> = new Subject<any>();

    purpose:NodePurpose = NodePurpose.REVIEW;
    state:NodeState = NodeState.UNKNOW;
    masterURI:Nullable<string> = null;

    httpPort:number = -1;
    httpsPort:number = -1;
    running:boolean = false;

    errPipe:Nullable<string>;
    outPipe:Nullable<string>;

    activeScanSession:Nullable<ScanOrder> = null;

    history:ScanOrder[] = [];

    waitingQueue: ScanOrder[] = [];

    /**
     * An event flow to track update of SanOrder state.
     *
     *
     * @type {Subject<ScanOrder>}
     * @field
     */
    scanStateUpdate$:Subject<ScanOrder> = new Subject<ScanOrder>();


    constructor(pUUID:string, pProjectUID:string) {
        this.UUID = pUUID;
        this._projectUID = pProjectUID;
    }

    getHost():string {
        // TODO : add enforce SSL
        return "127.0.0.1:"+this.httpPort;
    }

    setMasterUri(pUri:string) {
        this.masterURI = pUri;
    }

    /**
     *
     */
    async start():Promise<void> {
        if(this.state!==NodeState.NEW){
            throw EngineNodeException.CANNOT_START_NODE(this.UUID, 'Invalid state of the node');
        }

        return await this.spawn();
    }



    async isBusy():Promise<boolean> {
        return false;
    }

    async startScan(pOrder:ScanOrder):Promise<any> {

        // check if server is iddle
        if(this.isReady()){

            // archive previous scan
            if(this.activeScanSession !=null){
                this.activeScanSession.setState(ScanState.TERMINATED);
                this.history.push(this.activeScanSession);
            }

            // create new scan session
            this.activeScanSession = pOrder;
            this.activeScanSession.setState(ScanState.RUNNING);

        }else{
            // check if server is starting and queue is empty
            // else check if node is busy
            switch (this.state){
                case NodeState.STARTING:
                    pOrder.dates.start = (new Date()).getTime();
                    this.activeScanSession.setState(ScanState.WAITING);
                    this.waitingQueue.push(pOrder);
                    this.scanStateUpdate$.next(pOrder);
                    break;
                case NodeState.NEW:
                    throw EngineNodeException.BUSY_NODE(this.UUID,"startScan");
                    break;
                case NodeState.BUSY:
                    throw EngineNodeException.BUSY_NODE(this.UUID,"startScan");
                    break;
                case NodeState.STOPPED:
                    throw EngineNodeException.DOWN_NODE(this.UUID,"startScan");
                    break;
            }
        }

        // save order, to make it accessible from slave Node
        this._engine.getEngineDB().save(pOrder);

        //GOT()
        GOT(
            this.getHost()+"/api/audit/project/"+this._projectUID+"/scan/start",{
                body: JSON.stringify({
                    order: this.activeScanSession.getUID(),
                    project: this._projectUID,
                    models: [this.activeScanSession.getModelUID()]
                })
            }
        ).then(()=>{
            console.log("Scan ordered successfully");
        })



        // method: 'POST', url:'/audit/project/:uid/scan/start'
        // { uid: pProjectUID, project:pProjectUID, models: pModelIds  }

    }

    setPurpose(pPurpose:NodePurpose):void {
        this.purpose = pPurpose;
    }

    /**
     *
     * @param pState
     */
    setState(pState:NodeState):void {
        this.state = pState;
    }

    setHttpPort(pPort:number):void {
        if(this.running){
            throw EngineNodeException.NODE_ALREADY_RUNNING("http port");
        }

        this.httpPort = pPort;
    }
    setHttpsPort(pPort:number):void {
        if(this.running){
            throw EngineNodeException.NODE_ALREADY_RUNNING("https port");
        }

        this.httpsPort = pPort;
    }

    isStarted():boolean {
        return (this.state==NodeState.IDDLE||this.state==NodeState.BUSY);
    }

    /**
     * Node is ready to receive command
     *
     */
    isReady():boolean {
        return (this.state===NodeState.IDDLE);
    }

    /**
     * To spawn the engine node instance
     *
     * Turn EngineNode state from `NodeState.NEW` to `NodeState.STARTING`
     *
     * @method
     */
    async spawn():Promise<any>{


        let child:Process.ChildProcess=null;
        let opts:any = {};

        try{
            let args:string[] = [];
            const ws:DexcaliburWorkspace =  DexcaliburWorkspace.getInstance();
            const time = UT.time();

            this.errPipe = _path_.join( ws.getTempFolderLocation(), (time+'_err.log'));
            this.outPipe = _path_.join( ws.getTempFolderLocation(), (time+'_out.log'));

            const out:number = _fs_.openSync( this.outPipe, 'w+', 0o666);
            const err:number = _fs_.openSync( this.errPipe, 'w+', 0o666);


            args.push('./dist/dexcalibur.js');
            args.push('--headless');
            args.push('--slave-node');
            args.push('--node-uid='+this.UUID);
            args.push('--port='+this.httpPort);
            args.push('--port-ws='+this.httpsPort); // change
            args.push('--master-uri='+this.masterURI);

            console.log('node '+args.join(' '));
            console.log('OUT FILE : '+this.outPipe);
            console.log('ERR FILE : '+this.errPipe);

            this.setState(NodeState.STARTING);

            child = Process.spawn('node', args, { detached: true, stdio: [ 'ignore', out, err ] });
            child.unref();

            console.log( `[ENGINE NODE] node spawned:   ${args}  (opts)`);

        }catch(err){
            console.error('[ENGINE NODE] Detached node error :'+err.message);
        }

        return true;
    }


    /**
     * To queue a scan order
     *
     * It add time
     *
     * @param {ScanOrder} pOrder Scan order
     * @method
     */
    appendToQueue(pOrder:ScanOrder):void {
        pOrder.dates.waiting = (new Date()).getTime();
        this.waitingQueue.push(pOrder);
        this.scanStateUpdate$.next(pOrder);
    }

    /**
     * A method called when the node manager receive the startup confirmation
     * using EngineNode dedicated webhook
     *
     * Turn EngineNode state from `NodeState.STARTING` to `NodeState.IDDLE`
     *
     * @method
     */
    async afterStart(pEvent:any):Promise<void> {

        this.setState(NodeState.IDDLE);

        // checks if there is queued scan
        if(this.waitingQueue.length>0){
            let order = this.waitingQueue.shift()
            await this.startScan(order);
        }
    }

    /**
     * A method called when the node manager receive the startup confirmation
     * using EngineNode dedicated webhook
     *
     * Turn EngineNode state from `NodeState.STARTING` to `NodeState.IDDLE`
     *
     * @method
     */
    async afterScanTerminated(pEvent:PostScanEvent):Promise<void> {

        // save report, ....

        
        this.setState(NodeState.IDDLE);

        // checks if there is queued scan, if TRUE, consume it
        if(this.waitingQueue.length>0){
            let order = this.waitingQueue.shift()
            await this.startScan(order);
        }
    }



    toJsonObject():any {
        return {
            UUID: this.UUID,
            projectUIS: this._projectUID,
            httpPort: this.httpPort,
            httpsPort: this.httpsPort,
            running: this.running,
            state: this.state,
            activeScanSession: this.activeScanSession,
            purpose: this.purpose,
            history: this.history,
            waitingQueue: this.waitingQueue,
            errPipe: (this.errPipe!=null),
            outPipe: (this.outPipe!=null)
        };
    }
}