import got from "got";
import * as _ps_ from "process";
import * as _path_ from "path";

import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {Nullable} from "./IStringIndex.js";
import {Subject} from "rxjs";
import * as _child_process_ from "child_process";
import DexcaliburWorkspace from "../DexcaliburWorkspace.js";
import UT from "../Utils.js";
import Util from "../Utils.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import {NodeState} from "./EngineNodeManager.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import * as Log from "../Logger.js";
import * as http from "node:http";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {UserSession} from "../user/session/UserSession.js";
import WebServer from "../WebServer.js";
import {ProjectOrder} from "../project/ProjectOrder.js";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {InternalState} from "./InternalState.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import {ValidationRule} from "../Validator.js";
import {User} from "../User.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
const GOT = got.default;


export interface EngineNodeEvent {

}

export enum NodePurpose {
    REVIEW='review',
    SCAN='scan',
    HOOK='hook',
    NEW_PRJ='newprj',
    ANY='any'
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

export interface StateChangeEvent {
    before: NodeState;
    new: NodeState;
    time: number;
    nodeUUID: string;
}

export interface PostScanEvent {
    model: string;
    success: boolean;
    report?:Nullable<any>
}

export enum OperationType {
    NONE,
    USER_WEB_REQUEST,
    APP_WEB_REQUEST,
    SCAN_ORDER,
    NEW_PROJ,
    OPEN_PROJ
}

export interface Operation {
    type: OperationType,
    /**
     * User Account or App Account UUID
     */
    owner: string,
    /**
     * Time stamp
     */
    time: number,
    data: any;

    extra?:any;
}

export type EngineNodeUUID = string;

export type Order = {
    type:OperationType.SCAN_ORDER
    order: ScanOrder
} | {
    type:OperationType.NEW_PROJ
    order: ProjectOrder
};


export interface EngineNodeOptions {
    UUID?:EngineNodeUUID;
    _engine?:Nullable<IDexcaliburEngine>;
    _projectUID?:DexcaliburProjectUUID;
    _outputBuffer?:any[];
    _errBuffer?:any[];
    _pid?:number;
    nodeState$?:Subject<StateChangeEvent>;
    purpose?:NodePurpose;
    state?:NodeState;
    masterURI?:Nullable<string>;
    _hostname?:string;
    httpPort?:number;
    httpsPort?:number;
    running?:boolean;
    activeScanSession?:Nullable<ScanOrder>;
    history?:ScanOrder[];
    waitingQueue?: Order[];
    opeQueue?: Operation[];
    opeTerminated?: Operation[];
    operation$?: Subject<Operation>;
    scanStateUpdate$?:Subject<ScanOrder>;
    parentUUID?:EngineNodeUUID;
    spawnCmd?:string;
    stdout$?:Subject<string>;
    stderr$?:Subject<string>;
    _state?:InternalState;
    nodeOpts?: Record<string, any>;
}


/**
 * Represent a running instance of DexcaliburEngine.
 *
 * It is mainly used to hold metadata about remote instances
 * when engine mode is turned to MASTER/SLAVE, and treatments are distributed
 * over several instances.
 *
 *
 * @class
 */
export class EngineNode implements INode {

    static readonly DEFAULT_MAX_HEAP_SIZE = 6192;

    static VALIDATE = {
        uuid: ValidationRule.uuid(),
        purpose: ValidationRule.newPinklistAssert([
            NodePurpose.ANY,
            NodePurpose.SCAN,
            NodePurpose.NEW_PRJ,
            NodePurpose.REVIEW,
            NodePurpose.HOOK
        ])

    }
    static TYPE:NodeType = new NodeType(
        "engine_node",
        NodeInternalType.ENGINE_NODE,
        [
            (new NodeProperty("UUID")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("_projectUID")).type(DbDataType.STRING),
            (new NodeProperty("_outputBuffer")).type(DbDataType.STRING).def([]),
            (new NodeProperty("_errBuffer")).type(DbDataType.STRING).def([]),
            (new NodeProperty("pid")).type(DbDataType.NUMERIC).def(-1),
            (new NodeProperty("purpose")).type(DbDataType.STRING).def(NodePurpose.REVIEW),
            (new NodeProperty("state")).type(DbDataType.STRING).def(NodeState.UNKNOW),
            (new NodeProperty("masterURI")).type(DbDataType.STRING).def(null),
            (new NodeProperty("_hostname")).type(DbDataType.STRING).def(null),
            (new NodeProperty("httpPort")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("httpsPort")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("running")).type(DbDataType.BOOLEAN).def(false),
            (new NodeProperty("activeScanSession")).type(DbDataType.STRING).def(null),
            (new NodeProperty("history")).volatile().type(DbDataType.STRING).def([]),
            (new NodeProperty("waitingQueue")).volatile().type(DbDataType.STRING).def([]),
            (new NodeProperty("opeQueue")).volatile().type(DbDataType.STRING).def([]),
            (new NodeProperty("opeTerminated")).volatile().type(DbDataType.STRING).def([]),
            (new NodeProperty("parentUUID")).type(DbDataType.STRING).def(null),
            (new NodeProperty("spawnCmd")).type(DbDataType.STRING).def(null),
            (new NodeProperty("nodeOpts")).type(DbDataType.BLOB).def({}),
            (new NodeProperty("_state")).volatile().type(DbDataType.BLOB).def(null)
        ]).dataSource("ENGINE_DB");

    __ = NodeInternalType.ENGINE_NODE;

    /**
     * The UUID of the Engine instance.
     *
     * It is unique for master and all slave
     *
     * @readonly
     * @field
     */
    readonly UUID:EngineNodeUUID;

    /**
     * Instance of the engine
     *
     * @private
     */
    private _engine:Nullable<IDexcaliburEngine> = null;

    /**
     * Linked project
     * @private
     */
    private _projectUID:DexcaliburProjectUUID;

    /**
     * Buffer where STDOUT is written
     * @private
     */
    private _outputBuffer:any[] = [];

    /**
     * Buffer where STDERR is written
     * @private
     */
    private _errBuffer:any[] = [];


    /**
     * PID of the process associated to this node
     * @private
     */
    private _pid:number = -1;

    /**
     * Event stream of node state changes
     */
    nodeState$:Subject<StateChangeEvent> = new Subject<StateChangeEvent>();

    purpose:NodePurpose = NodePurpose.REVIEW;

    state:NodeState = NodeState.UNKNOW;

    masterURI:Nullable<string> = null;

    private _hostname:string = "127.0.0.1";

    httpPort:number = -1;

    httpsPort:number = -1;

    running:boolean = false;

    // errPipe:Nullable<string>;
    // outPipe:Nullable<string>;
    activeScanSession:Nullable<ScanOrder> = null;

    history:ScanOrder[] = [];

    waitingQueue: Order[] = [];

    opeQueue: Operation[] = [];
    opeTerminated: Operation[] = [];

    operation$: Subject<Operation> = new Subject<Operation>();

    /**
     * An event flow to track update of SanOrder state.
     *
     *
     * @type {Subject<ScanOrder>}
     * @field
     */
    scanStateUpdate$:Subject<ScanOrder> = new Subject<ScanOrder>();

    parentUUID:EngineNodeUUID;

    spawnCmd:string;

    stdout$:Subject<string> = new Subject();
    stderr$:Subject<string> = new Subject();

    /**
     * An object to track and save changes of EngineNode state
     *
     * @private
     */
    private _state:InternalState;

    nodeOpts:Record<string, any> = {};

    tags:TagUUID[] = [];

    constructor(pOptions:EngineNodeOptions) {

        if(pOptions.UUID != null) this.UUID = pOptions.UUID;
        if(pOptions._engine != null) this._engine = pOptions._engine;
        if(pOptions._projectUID != null) this._projectUID = pOptions._projectUID;
        if(pOptions._outputBuffer != null) this._outputBuffer = pOptions._outputBuffer;
        if(pOptions._errBuffer != null) this._errBuffer = pOptions._errBuffer;
        if(pOptions._pid != null) this._pid = pOptions._pid;
        if(pOptions.nodeState$ != null) this.nodeState$ = pOptions.nodeState$;
        if(pOptions.purpose != null) this.purpose = pOptions.purpose;
        if(pOptions.state != null) this.state = pOptions.state;
        if(pOptions.masterURI != null) this.masterURI = pOptions.masterURI;
        if(pOptions._hostname != null) this._hostname = pOptions._hostname;
        if(pOptions.httpPort != null) this.httpPort = pOptions.httpPort;
        if(pOptions.httpsPort != null) this.httpsPort = pOptions.httpsPort;
        if(pOptions.running != null) this.running = pOptions.running;
        if(pOptions.activeScanSession != null) this.activeScanSession = pOptions.activeScanSession;
        if(pOptions.history != null) this.history = pOptions.history;
        if(pOptions.waitingQueue != null) this.waitingQueue = pOptions.waitingQueue;
        if(pOptions.opeQueue != null) this.opeQueue = pOptions.opeQueue;
        if(pOptions.opeTerminated != null) this.opeTerminated = pOptions.opeTerminated;
        if(pOptions.operation$ != null) this.operation$ = pOptions.operation$;
        if(pOptions.scanStateUpdate$ != null) this.scanStateUpdate$ = pOptions.scanStateUpdate$;
        if(pOptions.parentUUID != null) this.parentUUID = pOptions.parentUUID;
        if(pOptions.spawnCmd != null) this.spawnCmd = pOptions.spawnCmd;
        if(pOptions.stdout$ != null) this.stdout$ = pOptions.stdout$;
        if(pOptions.stderr$ != null) this.stderr$ = pOptions.stderr$;
        if(pOptions._state != null) this._state = pOptions._state;
        if(pOptions.nodeOpts != null) this.nodeOpts = pOptions.nodeOpts;

        this.operation$.subscribe((pOperation:Operation)=>{
            if(this.isReady()){

                // append at the end of list
                this.opeQueue.push(pOperation);

                // sort by time, get oldest (the first entry of the list)
                const oldest = this.opeQueue.shift();

                // execute, state will changed,
                // when node will finished to process request, it will notifiy
                // master of state changes and it will come back to IDLE, then the queue will be consumed again
                this.execOperation2(oldest)
                    .then((vRes)=>{
                        console.log(vRes);
                        this.opeTerminated.push(oldest);
                    },(err)=>{
                        Logger.error("[ENGINE NODE] Operation execution failed : ",err);
                    })

            }else{
                this.opeQueue.push(pOperation);
            }
        });

        this.stderr$.subscribe((vMsg)=>{
            this._errBuffer.push(vMsg);
            Logger.error(`[ENGINE NODE][${this.UUID}][STDERR] ${vMsg}`);
        });

        this.stdout$.subscribe((vMsg)=>{
            this._outputBuffer.push(vMsg);
            Logger.info(`[ENGINE NODE][${this.UUID}][STDOUT] ${vMsg}`);
        });
    }

    /**
     *
     */
    static newNode(pUUID:EngineNodeUUID, pParentUUID:EngineNodeUUID, pProjectUID:DexcaliburProjectUUID):EngineNode{
        return new EngineNode({
            UUID: pUUID,
            parentUUID: pParentUUID,
            _projectUID: pProjectUID
        });
    }

    getUID():EngineNodeUUID {
        return this.UUID;
    }

    async loadInternalState():Promise<void>{
        this._state = await this._engine.getEngineDB().getStateByName(`engine-node-${this.UUID}`);


        /*this.states = this._state.getProperty('portRange');
        this.states = this._state.getProperty('portCounter');
        this.states = this._state.getProperty('slaves');
        this.states = this._state.getProperty('projectMapping');
        this.states = this._state.getProperty('states');
        this.states = this._state.getProperty('masterURI');*/
    }


    async saveInternalState():Promise<any>{

    }

    /**
     * To set node's hostname
     *
     * @param pHostname
     */
    setHostname(pHostname:string):void {

        if(this.running){
            throw EngineNodeException.NODE_ALREADY_RUNNING(this.UUID,"Hostname cannot be changed because this node is running");
        }

        this._hostname = pHostname;
    }

    /**
     * To get IP address or hostname
     */
    getHostname():string {
        return this._hostname;
    }


    /**
     * To get HTTP schema + hostname + port string
     *
     * @returns {string} HTTP schema and host string
     */
    getHost():string {
        // TODO : add enforce SSL
        const ssl = this._engine.getSettings().getServerSettings().getSslSettings();
        if(ssl==null){
            // HTTP only comm mode ( port can change)
            return `http://${this.getHostname()}:${this.httpPort}`;
        }else{
            // HTTPS ( port can change)
            return `https://${this.getHostname()}:${this.httpPort}`;
        }
    }


    async setEngine(pEngine:IDexcaliburEngine):Promise<void> {
        this._engine = pEngine;
        await this.loadInternalState();
    }

    setMasterUri(pUri:string) {
        this.masterURI = pUri;
    }

    /**
     *
     */
    async start(pCause:string, pNodeOpts:string[] = []):Promise<void> {
        if(this.state!==NodeState.NEW){
            throw EngineNodeException.CANNOT_START_NODE(this.UUID, 'Invalid state of the node : '+this.state);
        }

        const hasHeapSizeOpt = pNodeOpts.find( x => (x.indexOf('--max-old-space-size=')>-1));

        if(hasHeapSizeOpt==null){
            pNodeOpts.push(`--max-old-space-size=${this.getMaxHeapSize()}`);
        }

        return await this.spawn(pCause, false, pNodeOpts);
    }

    /**
     * To open the project associated to this node.
     *
     * It assumes this node is a remote node, and NodeState is IDLE
     *
     * @async
     */
    async open():Promise<any> {

        if(this.state!==NodeState.IDLE){
            throw EngineNodeException.CANNOT_START_NODE(this.UUID, 'Invalid state of the node : '+this.state);
        }

        return GOT(
            this.getHost()+"/api/workspace/open?=",{
                searchParams: {
                    uid: this._projectUID
                }
            }
        );
    }


    /**
     * To perform the operation
     *
     * @param {Operation} pOpe
     * @method
     */
    async execOperation( pOpe:Operation):Promise<void> {
        switch (pOpe.type){
            case OperationType.SCAN_ORDER:
                (this.startScan(pOpe.data as ScanOrder))
                    .then(() => {
                        //node.opeTerminated.push(ope);
                        console.log("Next scan order has been launched");
                    });
                break;
            case OperationType.NEW_PROJ:
                (this.startProject(
                    (this._engine as DexcaliburEngine).getInternalAcc(),
                    pOpe.data as ProjectOrder,
                    pOpe.extra
                    ))
                    .then(() => {
                        //node.opeTerminated.push(ope);
                        console.log("Next scan order has been launched");
                    });
                break;
            case OperationType.USER_WEB_REQUEST:
            case OperationType.APP_WEB_REQUEST:
                // TODO : add quota, FW, etc ..
                (this.forwardWebRequest(pOpe.data.server, pOpe.data.req, pOpe.data.res))
                    .then((v)=>{
                        console.log(v);
                        console.log("Web request has been forwarded to the right node");
                    })
                break;
        }
    }


    /**
     * To perform the operation
     *
     * @param {Operation} pOpe
     * @method
     */
    async execOperation2( pOpe:Operation):Promise<any> {
        switch (pOpe.type){
            case OperationType.SCAN_ORDER:
                return (this.startScan(pOpe.data as ScanOrder));
            case OperationType.NEW_PROJ:
                return (this.startProject(
                    (this._engine as DexcaliburEngine).getInternalAcc(),
                    pOpe.data as ProjectOrder,
                    pOpe.extra
                ));
            case OperationType.USER_WEB_REQUEST:
            case OperationType.APP_WEB_REQUEST:
                // TODO : add quota, FW, etc ..
                return (this.forwardWebRequest(pOpe.data.server, pOpe.data.req, pOpe.data.res));
            default:
                throw EngineNodeException.NOT_SUPPORTED_OPE(pOpe.type);
        }
    }

    async isBusy():Promise<boolean> {
        return (this.state!=NodeState.IDLE);
    }


    /**
     * To start scan on current (slave or standalone) node
     *
     * @param pOrder
     */
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
                    this.waitingQueue.push({
                        type: OperationType.SCAN_ORDER,
                        order: pOrder
                    } );
                    this.scanStateUpdate$.next(pOrder);
                    break;
                case NodeState.NEW:
                    this.waitingQueue.push({
                        type: OperationType.SCAN_ORDER,
                        order: pOrder
                    } );
                    //throw EngineNodeException.NEW_NODE(this.UUID,"startScan");
                    break;
                case NodeState.BUSY:
                    this.waitingQueue.push({
                        type: OperationType.SCAN_ORDER,
                        order: pOrder
                    } );
                    //throw EngineNodeException.BUSY_NODE(this.UUID,"startScan");
                    break;
                case NodeState.STOPPED:
                    throw EngineNodeException.DOWN_NODE(this.UUID,"startScan");
                    break;
            }
        }

        // save order, to make it accessible from slave Node
        this._engine.getEngineDB().save(pOrder);

        Logger.info("[ENGINE NODE] Send command to slave node : "+this.getHost()+"/api/audit/project/"+this._projectUID+"/scan/start")
        //GOT()

        if(this.activeScanSession.hasModel()){
            return GOT(
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
        }else{
            // done
            return true;
        }




        // method: 'POST', url:'/audit/project/:uid/scan/start'
        // { uid: pProjectUID, project:pProjectUID, models: pModelIds  }

    }


    /**
     * To start a project on this engine
     *
     * @param pOrder
     */
    async startProject(pAccount:UserAccount, pOrder:ProjectOrder, pExtraOpts:any = {}):Promise<any> {

        let uuidUpdated = false;
        if(pOrder.getUID()==null){
            pOrder.uuid = await this._engine.getEngineDB()
                .generateFreeUuid(ProjectOrder.TYPE.getType());
            await this._engine.getEngineDB().updateOrder(pOrder,['uuid']);
        }

        Logger.info(`[ENGINE NODE][${this.UUID}][startProject] State : ${this.state} `);

        // check if server is starting and queue is empty
        // else check if node is busy
        switch (this.state){
            case NodeState.IDLE:
                // save order, to make it accessible from slave Node
                // await this._engine.getEngineDB().save(pOrder);

                // webhook
                const wh = this.getHost()+"/api/workspace/order/"+pOrder.getUID()+"/start";

                pOrder.setWebHook(wh);

                // update
                await this._engine.getEngineDB().updateOrder(pOrder,['webhook','dates']);

                Logger.info("[ENGINE NODE] Send command to slave node : "+wh)

                let cookie="";
                if(pExtraOpts.cookie !=null){
                    for(let k in pExtraOpts.cookie){
                        cookie += `${k}=${Util.encodeURI(pExtraOpts.cookie[k])};`
                    }
                }
                if(cookie.length>0){
                    cookie = cookie.slice(0,-1);
                }

                const sess="";
                //GOT()
                return GOT(
                    wh,{
                        method: 'POST',
                        headers: {
                            'Cookie':cookie
                        },
                        body: JSON.stringify({})
                    }
                ).then(()=>{
                    console.log("Scan ordered successfully");
                });
                break;
            case NodeState.STARTING:
                pOrder.dates.start = (new Date()).getTime();
                await this._engine.getEngineDB().updateOrder(pOrder,['dates']);
                // waiting
                //this.activeScanSession.setState(ScanState.WAITING);
                //this.waitingQueue.push(pOrder);
                //this.scanStateUpdate$.next(pOrder);
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

        // save order, to make it accessible from slave Node
       /* await this._engine.getEngineDB().save(pOrder);

        Logger.info("[ENGINE NODE] Send command to slave node : "+this.getHost()+"/api/project/order/"+pOrder.getUID()+"/start")

        //GOT()
        return GOT(
            this.getHost()+"/api/project/order/"+pOrder.getUID()+"/start",{
                method: 'POST',
                body: JSON.stringify({})
            }
        ).then(()=>{
            console.log("Scan ordered successfully");
        });*/
    }

    setPurpose(pPurpose:NodePurpose):void {
        this.purpose = pPurpose;
    }

    /**
     *
     * @param pState
     */
    setState(pState:NodeState):void {
        const old = this.state;
        this.state = pState;
        this.nodeState$.next({
            before: old,
            new: this.state,
            time: Util.time(),
            nodeUUID: this.UUID
        });
    }

    setHttpPort(pPort:number):void {
        if(this.running){
            throw EngineNodeException.NODE_ALREADY_RUNNING(this.UUID,"HTTP port cannot be changed because this node is running");
        }

        this.httpPort = pPort;
    }


    setHttpsPort(pPort:number):void {
        if(this.running){
            throw EngineNodeException.NODE_ALREADY_RUNNING(this.UUID,"HTTPS port cannot be changed because ths node is running.");
        }

        this.httpsPort = pPort;
    }

    setMaxHeapSize(pSize:number):void {
        this.nodeOpts.heap_size = pSize;
    }

    getMaxHeapSize():number {
        if(this.nodeOpts!=null && this.nodeOpts.heap_size!=null){
            return this.nodeOpts.heap_size;
        }else{
            return EngineNode.DEFAULT_MAX_HEAP_SIZE;
        }
    }

    isStarted():boolean {
        return (this.state==NodeState.IDLE||this.state==NodeState.BUSY);
    }

    /**
     * Node is ready to receive command
     *
     */
    isReady():boolean {
        return (this.state===NodeState.IDLE);
    }


    /**
     * To spawn the engine node instance
     *
     * Turn EngineNode state from `NodeState.NEW` to `NodeState.STARTING`
     *
     * @method
     */
    async spawn(pCause:string, pDebug = false, pNodeOpts:string[] = []):Promise<any>{


        let child:_child_process_.ChildProcess=null;
        let opts:any = {};


        console.log( `[ENGINE NODE] Start to spawn new node [node=${this.UUID}] because : ${pCause}`);
        try{
            let args:string[] = pNodeOpts;
            const ws:DexcaliburWorkspace =  DexcaliburWorkspace.getInstance();
            const time = UT.time();


            //this.errPipe = _path_.join( ws.getTempFolderLocation(), (time+'_err.log'));
            //this.outPipe = _path_.join( ws.getTempFolderLocation(), (time+'_out.log'));

            //const out:number = _fs_.openSync( this.outPipe, 'w+', 0o666);
            //const err:number = _fs_.openSync( this.errPipe, 'w+', 0o666);

            if(process.env.DXC_BIN_PATH){
                args.push(_path_.join(process.env.DXC_BIN_PATH,'dexcalibur.js'));
            }else{
                args.push('./dist/dexcalibur.js');
            }

            args.push('--headless');
            args.push('--slave-node');
            args.push('--node-uid='+this.UUID);
            args.push('--port='+this.httpPort);
            args.push('--port-ws='+this.httpsPort); // change
            args.push('--master-uri='+this.masterURI);

            if(pDebug){
                args.push("--debug");
            }

            Logger.info('[NODE] Spawn command : node '+args.join(' '));
            //console.log('OUT FILE : '+this.outPipe);
            //console.log('ERR FILE : '+this.errPipe);

            // TODO : remove ? secret leak ?
            this.spawnCmd = args.join(' ');

            this.setState(NodeState.STARTING);

            //child = _child_process_.spawn('node', args, { detached: true, stdio: [ 'ignore', out, err ] });
            child = _child_process_.spawn('node', args, {
                detached: true,
                env: {
                    ... process.env,
                    DXC_DEBUG: (pDebug? "1" : "0")
                }
            });

            // save Process ID
            this._pid = child.pid;
            // write stdout to buffer
            child.stdout.on('data', (data) => {
                this.stdout$.next(data);
            });
            // write stderr to buffer
            child.stderr.on('data', (data) => {
                this.stderr$.next(data);
            });

            child.on('close', (code) => {
                console.log("Stopped slave ...")
                this.setState(NodeState.STOPPED);
            });

            console.log( `[ENGINE NODE] node spawned [PID=${this._pid}]:   ${args.join(' ')}  (opts)`);
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
    async appendToQueue(pOrder:ScanOrder|ProjectOrder, pOpeType:OperationType,
                        pUserAccount:Nullable<UserAccount> = null, pExtra:any = null):Promise<void> {

        pOrder.dates.waiting = (new Date()).getTime();

        // update
        await this._engine.getEngineDB().updateOrder(pOrder,['dates']);

        this.waitingQueue.push({
            type: pOpeType,
            order:pOrder
        } as any);

        if(pOpeType==OperationType.SCAN_ORDER){
            this.scanStateUpdate$.next(pOrder as ScanOrder);
        }

        this.operation$.next({
            type: pOpeType,
            owner: (pUserAccount!=null ? (pUserAccount as UserAccount).getUID() : null),
            data: pOrder,
            time: Util.time(),
            extra: pExtra
        });
    }


    /**
     *
     * @param pReq
     * @param pRes
     */
    appendRequestToQueue( pServer:WebServer, pReq:any, pRes:any):void {

        this.operation$.next({
            type: OperationType.USER_WEB_REQUEST,
            owner: (pReq.user!=null ? (pReq.user as UserAccount).getUID() : null),
            data: {
                server: pServer,
                req: pReq,
                res: pRes
            },
            time: Util.time()
        });
    }

    /**
     *
     * @param pOpe
     */
    pushOperationToQueue(pOpe:Operation):void {

    }


    /**
     * A method called when the node manager receive the startup confirmation
     * using EngineNode dedicated webhook
     *
     * Turn EngineNode state from `NodeState.STARTING` to `NodeState.IDLE`
     *
     * @method
     */
    async afterScanTerminated(pEvent:PostScanEvent):Promise<void> {

        // save report, ....
        this.setState(NodeState.IDLE);

        // checks if there is queued scan, if TRUE, consume it
        /*
        if(this.waitingQueue.length>0){
            let order = this.waitingQueue.shift()

            switch (order.type){
                case OperationType.NEW_PROJ:
                    await this.startProject(order.order);
                    break;
                case OperationType.SCAN_ORDER:
                    await this.startScan(order.order);
                    break;
            }
        }*/
    }

    /**
     * To kill this node
     *
     * @method
     */
    kill():void {
        if(this._pid==-1) return;

        try{
            _ps_.kill(this._pid);
            Logger.success(`[ENGINE NODE][NODE=${this.UUID}] Killed.`)
        }catch(e){
            Logger.error(`[ENGINE NODE][NODE=${this.UUID}] Cannot be killed : ${e.message} ${e.stack}`);
        }
    }

    getProjectUID():Nullable<DexcaliburProjectUUID> {
        return this._projectUID;
    }

    /**
     * To retrieve the owner of the node
     *
     * @returns {Nullable<UserAccountUUID>} User account UUID
     * @method
     */
    getOwner():Nullable<UserAccountUUID> {
        return this._state.getProperty('owner');
    }

    /**
     * To retrieve the owner of the node
     *
     * @returns {Nullable<UserAccountUUID>} User account UUID
     * @method
     */
    async setOwner(pUser:UserAccountUUID):Promise<void> {
        this._state.setProperty('owner', pUser);
        this._state.setProperty('ownership_time', (new Date()).getTime());
        await this.saveInternalState()
    }

    /**
     * To check if the ownership has expired according to specified timeout
     *
     * @param {number} pTimeout
     * @method
     */
    isOwnershipExpired(pTimeout:number){
        const time = this._state.getProperty('ownership_time');
        //const idletime = this._state.getProperty('idle_time');
        if(time==null) return true;

        return (time+pTimeout) < (new Date().getTime());
    }

    toJsonObject():any {
        return {
            UUID: this.UUID,
            _projectUID: this._projectUID,
            httpPort: this.httpPort,
            httpsPort: this.httpsPort,
            running: this.running,
            state: this.state,
            activeScanSession: this.activeScanSession,
            purpose: this.purpose,
            history: this.history,
            waitingQueue: this.waitingQueue,
            spawnCmd: this.spawnCmd
            //errPipe: (this.errPipe!=null),
            //outPipe: (this.outPipe!=null)
        };
    }

    /**
     *
     * @param pRequest
     * @param pResponse
     * @param pOptions
     */
    async forwardWebRequest(pServer:WebServer, pRequest:any, pResponse?:any ):Promise<any> {
        console.log(`[ASYNC] Forward request from [node=${this.parentUUID}] to [node=${this.UUID}][uri=${this.getHost()}][url=${pRequest.url}]`)
       /*console.log({
           hostname: this.getHostname(),
           port: this.httpPort,
           path: pRequest.url,
           method: pRequest.method,
           headers: pRequest.headers
       });*/

        const proxyReq = http.request({
            hostname: this.getHostname(),
            port: this.httpPort,
            path: pRequest.url,
            method: pRequest.method,
            headers: pRequest.headers
        }, (proxyRes) => {
                // Copier les headers de la réponse proxy
                //console.log("RESPONSE HEADERS > ",proxyRes.statusCode, proxyRes.headers);
                proxyRes.setEncoding('utf8');
                let rawData = '';

                proxyRes.on('data', (chunk) => {
                    console.log("RESPONSE CHUNK  > ",chunk);

                    rawData += chunk;
                });
                proxyRes.on('end', () => {

                    console.log("RESPONSE > ",rawData, proxyRes.statusCode, proxyRes.headers);
                    //pResponse.writeHead(proxyRes.statusCode, proxyRes.headers);
                    pServer.sendSuccess( pResponse, rawData);
                });

                //proxyRes.pipe(pResponse);
        });

        proxyReq.on('error', (err) => {
            console.error("REQUEST ERROR > ",err);
            pServer.sendError( pResponse, 'Proxy error (1)');
        });

        proxyReq.end();
        //pResponse.pipe(proxyReq);
    }

    forwardWebRequestSync(pServer:WebServer, pRequest:any, pResponse?:any ):any {
        console.log(`[SYNC] Forward request from [node=${this.parentUUID}] to [node=${this.UUID}][uri=${this.getHost()}]`)
        const proxyReq = http.request({
            hostname: this.getHost(),
            port: this.httpPort,
            path: pRequest.url,
            method: pRequest.method,
            headers: pRequest.headers
        }, (proxyRes) => {
            // Copier les headers de la réponse proxy
            pResponse.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(pResponse);
        });

        proxyReq.on('error', (err) => {
            console.error(err);
            pResponse.status(500).send('Erreur lors de la proxy (2)');
        });

        pResponse.pipe(proxyReq);
    }
}
EngineNode.TYPE.builder(EngineNode);