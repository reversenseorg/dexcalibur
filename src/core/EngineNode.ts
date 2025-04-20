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
import {ScanOrder, ScanOrderUUID} from "../audit/common/ScanOrder.js";
import * as Log from "../Logger.js";
import * as http from "node:http";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import WebServer from "../WebServer.js";
import {ProjectOrder, ProjectOrderUUID} from "../project/ProjectOrder.js";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {InternalState} from "./InternalState.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {ValidationRule} from "../Validator.js";
import {EngineNodeClient} from "./EngineNodeClient.js";
import {WebsocketClient} from "../WebsocketClient.js";
import {K8ResourceType, K8sHelper} from "./k8s/K8sHelper.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
const GOT = got.default;

export type WebSocketClient = any;

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

export type GenericOrderTicket = {
    owner: Nullable<UserAccountUUID>;
    created?: number;
    started?: number;
    terminated?:number;
}

export interface OrderTicket<T,O> extends GenericOrderTicket {
    type: T,
    order: O
}



export type Order = OrderTicket<OperationType.SCAN_ORDER, ScanOrderUUID>
                        | OrderTicket<OperationType.NEW_PROJ|OperationType.OPEN_PROJ, ProjectOrderUUID>
                        | OrderTicket<OperationType.USER_WEB_REQUEST|OperationType.APP_WEB_REQUEST, any>;


export type Order2 = {
    type:OperationType.SCAN_ORDER;
    order: ScanOrderUUID;
    owner: Nullable<UserAccountUUID>;
    created?: number;
    started?: number;
    terminated?:number;
} | {
    type:OperationType.NEW_PROJ|OperationType.OPEN_PROJ;
    order: ProjectOrderUUID;
    owner: Nullable<UserAccountUUID>;
    created?: number;
    started?: number;
    terminated?:number;
} | {
    type:OperationType.USER_WEB_REQUEST|OperationType.APP_WEB_REQUEST,
    owner: Nullable<UserAccountUUID>;
    created?: number;
    started?: number;
    terminated?:number;
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
    activeOpe?:Nullable<Order>;
    history?:ScanOrder[];
    waitingQueue?: Order[];
    //opeQueue?: Operation[];
    opeTerminated?: Order[];
    operation$?: Subject<Order>;
    parentUUID?:EngineNodeUUID;
    startedAt?:number;
    stoppedAt?:number;
    createdAt?:number;
    spawnCmd?:string;
    stdout$?:Subject<string>;
    stderr$?:Subject<string>;
    _state?:InternalState;
    nodeOpts?: Record<string, any>;
    selfReg?:boolean;
    _orgUUID?:OrganizationUnitUUID;
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
            (new NodeProperty("_orgUUID")).type(DbDataType.STRING).def(null),
            (new NodeProperty("_outputBuffer")).type(DbDataType.STRING).def([]),
            (new NodeProperty("_errBuffer")).type(DbDataType.STRING).def([]),
            (new NodeProperty("_pid")).type(DbDataType.NUMERIC).def(-1),
            (new NodeProperty("purpose")).type(DbDataType.STRING).def(NodePurpose.ANY),
            (new NodeProperty("state")).type(DbDataType.STRING).def(NodeState.UNKNOW),
            (new NodeProperty("masterURI")).type(DbDataType.STRING).def(null),
            (new NodeProperty("_hostname")).type(DbDataType.STRING).def(null),
            (new NodeProperty("httpPort")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("httpsPort")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("wsPort")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("wssPort")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("running")).type(DbDataType.BOOLEAN).def(false),
            (new NodeProperty("createdAt")).type(DbDataType.NUMERIC).def(-1),
            (new NodeProperty("startedAt")).type(DbDataType.NUMERIC).def(-1),
            (new NodeProperty("stoppedAt")).type(DbDataType.NUMERIC).def(-1),
            (new NodeProperty("activeScanSession")).type(DbDataType.STRING).def(null),
            (new NodeProperty("activeOpe")).type(DbDataType.BLOB)
                .sleep( (x:NodePropertyState)=>{
                    let q:any = null;
                    if(x.p!=null){
                        q = {
                            type: x.p.type,
                            owner: x.p.owner,
                            order: x.p.order, //(x.p.order as (ScanOrder|ProjectOrder)).getUID(),
                            created: (x.p.created?x.p.created : -1),
                            started: (x.p.started?x.p.started : -1),
                            terminated: (x.p.terminated?x.p.terminated : -1)
                        };
                    }
                    return q;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    let q:any = null;
                    if(x.p!=null){
                        q = {
                            type: x.p.type,
                            order: x.p.order,
                            owner: x.p.owner,
                            created: (x.p.created?x.p.created : -1),
                            started: (x.p.started?x.p.started : -1),
                            terminated: (x.p.terminated?x.p.terminated : -1)
                        };
                    }
                    return q;
                })
                .def(null),
            (new NodeProperty("history")).volatile().type(DbDataType.STRING).def([]),
            (new NodeProperty("waitingQueue")).type(DbDataType.BLOB)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p!=null){
                        const q:any[] = [];
                        if(x.p!=null && Array.isArray(x.p)){
                            x.p.map((o:Order) => {
                                q.push({
                                    type: o.type,
                                    owner: o.owner,
                                    order: o.order, //(o.order as (ScanOrder|ProjectOrder)).getUID(),
                                    created: (o.created?o.created : -1),
                                    started: (o.started?o.started : -1),
                                    terminated: (o.terminated?o.terminated : -1)
                                });
                            });
                        }
                        return q;
                    }else{
                        return [];
                    }
                })
                .wakeUp( (x:NodePropertyState)=>{
                    if(x.p!=null){
                        const q:Order[] = [];
                        if(x.p!=null && Array.isArray(x.p)){
                            x.p.map((o:any) => {
                                q.push({
                                    type: o.type,
                                    order: o.order,
                                    owner: o.owner,
                                    created: (o.created?o.created : -1),
                                    started: (o.started?o.started : -1),
                                    terminated: (o.terminated?o.terminated : -1)
                                });
                            });
                        }
                        return q;
                    }else{
                        return [];
                    }
                })
                .def([]),
            (new NodeProperty("opeQueue")).volatile().type(DbDataType.STRING).def([]),
            (new NodeProperty("opeTerminated")).volatile().type(DbDataType.STRING).def([]),
            (new NodeProperty("parentUUID")).type(DbDataType.STRING).def(null),
            (new NodeProperty("spawnCmd")).type(DbDataType.STRING).def(null),
            (new NodeProperty("nodeOpts")).type(DbDataType.BLOB).def({}),
            (new NodeProperty("selfReg")).type(DbDataType.BOOLEAN).def(false),
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
     * Aorganization unit
     * @private
     * @since 1.8.16
     */
    private _orgUUID:Nullable<OrganizationUnitUUID> = null;

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

    purpose:NodePurpose = NodePurpose.ANY;

    state:NodeState = NodeState.UNKNOW;

    masterURI:Nullable<string> = null;

    private _hostname:string = "127.0.0.1";

    httpPort:number = -1;

    httpsPort:number = -1;

    wsPort:number = -1;

    wssPort:number = -1;

    running:boolean = false;

    // errPipe:Nullable<string>;
    // outPipe:Nullable<string>;
    activeScanSession:Nullable<ScanOrder> = null;

    history:ScanOrder[] = [];

    waitingQueue: Order[] = [];

    /**
     * @deprecated
     */
    opeQueue: Operation[] = [];

    opeTerminated: Order[] = []; // Operation[]

    operation$: Subject<Nullable<Order>> = new Subject<Nullable<Order>>();

    parentUUID:EngineNodeUUID;

    spawnCmd:string;

    activeOpe:Nullable<Order> = null;

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
    private _httpClient: Nullable<EngineNodeClient>;

    startedAt = -1;
    stoppedAt = -1;
    createdAt = -1;
    /**
     * Flag.
     * TRUE if the node is allowed to start on self registration of a slave
     * @field
     */
    selfReg = false;

    /**
     * Local
     * @private
     */
    private _suspendQueue = false;


    /**
     *
     * @param {EngineNodeOptions} pOptions
     * @constructor
     */
    constructor(pOptions:EngineNodeOptions) {

        if(pOptions.UUID != null) this.UUID = pOptions.UUID;
        if(pOptions._engine != null) this._engine = pOptions._engine;
        if(pOptions._projectUID != null) this._projectUID = pOptions._projectUID;
        if(pOptions._orgUUID != null) this._orgUUID = pOptions._orgUUID;
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
        //if(pOptions.opeQueue != null) this.opeQueue = pOptions.opeQueue;
        if(pOptions.opeTerminated != null) this.opeTerminated = pOptions.opeTerminated;
        if(pOptions.operation$ != null) this.operation$ = pOptions.operation$;
        if(pOptions.parentUUID != null) this.parentUUID = pOptions.parentUUID;
        if(pOptions.spawnCmd != null) this.spawnCmd = pOptions.spawnCmd;
        if(pOptions.stdout$ != null) this.stdout$ = pOptions.stdout$;
        if(pOptions.stderr$ != null) this.stderr$ = pOptions.stderr$;
        if(pOptions._state != null) this._state = pOptions._state;
        if(pOptions.nodeOpts != null) this.nodeOpts = pOptions.nodeOpts;
        if(pOptions.startedAt != null) this.startedAt = pOptions.startedAt;
        if(pOptions.stoppedAt != null) this.stoppedAt = pOptions.stoppedAt;
        if(pOptions.selfReg != null) this.selfReg = pOptions.selfReg;
        if(pOptions.createdAt != null) this.createdAt = pOptions.createdAt;

        /**
         * All requests
         * TYPE : HTTP
         * FLOW : MAIN
         *
         */
        this.operation$.subscribe((pOrder:Order)=>{
            if(pOrder!=null && pOrder.type!=OperationType.USER_WEB_REQUEST){
                Logger.info(" NODE MAIN HANDLER TRIGGED : "+pOrder+", is ready : "+this.isReady());
            }

            if(this.isReady()){

                let oldest:Order;
                if(pOrder!=null){
                    oldest = pOrder;
                    Logger.info(`[ENGINE NODE][${this.UUID}][1] Execute operation direct : ${oldest.type} ${new Date(oldest.created)}`);
                    this.execOperation2(oldest)
                        .then((vRes)=>{
                            Logger.error(`[ENGINE NODE][${this.UUID}][1] Operation execution done : `);
                            this.opeTerminated.push(oldest);
                            this.operation$.next(null);
                        },(err)=>{
                            Logger.error(`[ENGINE NODE][${this.UUID}][1] Operation execution failed : `,err);
                            console.log(err.stack);
                        })
                }else{
                    Logger.info(`[ENGINE NODE][${this.UUID}][2] Retrieve next operation from waiting queue. State = ${this.isReady()}, Queue = ${this.waitingQueue.length}`)
                    this.nextWaitingOpe().then((vOrder)=>{
                        if(vOrder==null){
                            Logger.info(`[ENGINE NODE][${this.UUID}][2] Waiting queue is empty. State = ${this.isReady()}`)
                            if(!this.isReady()){
                                this.setState(NodeState.IDLE);
                            }
                            return;
                        }

                        Logger.info(`[ENGINE NODE][${this.UUID}][2] Execute operation from waiting queue : ${vOrder.type} ${new Date(vOrder.created)}`);
                        this.execOperation2(vOrder)
                            .then((vRes)=>{
                                Logger.success(`[ENGINE NODE][${this.UUID}][2] Operation execution done : `);
                                //console.log(vRes,vOrder);
                                this.opeTerminated.push(vOrder);
                                this.operation$.next(null);
                            },(err)=>{
                                Logger.error(`[ENGINE NODE][${this.UUID}][2] Operation execution failed : `,err);
                                console.log(err.stack);
                            })

                    });
                }
            }else{
                console.log("NEXT OPERATION BUT NODE IS NOT READY, WAITING ...",this.state,pOrder);
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
    static async newNode(pUUID:EngineNodeUUID, pParentUUID:EngineNodeUUID,
                         pProjectUID:DexcaliburProjectUUID, pEngine:DexcaliburEngine):Promise<EngineNode>{
        const node = new EngineNode({
            _engine: pEngine,
            UUID: pUUID,
            parentUUID: pParentUUID,
            _projectUID: pProjectUID,
            running: false,
            createdAt: (new Date()).getTime()
        });

        // create state in memory and in db
        await node.loadInternalState();

        node.nodeState$.subscribe((vEvent:any)=>{
            (async ()=>{
                await node.saveAll();
            })();
        });

        return node;
    }


    async saveAll():Promise<void>{
        return await this.save([
            '_pid','state','purpose',
            'spawnCmd',
            '_hostname','httpPort','httpsPort','wsPort','wssPort','masterURI',
            'selfReg', '_projectUID','_orgUUID',
            'startedAt','stoppedAt','createdAt',
            'waitingQueue','activeOpe',
            'running','parentUUID','nodeOpts','activeScanSession'
        ]);
    }

    /**
     *
     * @param pOID
     * @since 1.8.15
     */
    async attachToOrg(pOID:OrganizationUnitUUID):Promise<void> {
        this._orgUUID = pOID;
        await this.save(['_orgUUID']);
    }

    /**
     *
     * @since 1.8.15
     */
    getOrganization():OrganizationUnitUUID {
        return this._orgUUID;
    }
    /**
     *
     * @param pPpt
     */
    async save(pPpt:string[] = []):Promise<void> {
        if(this._engine==null){
            Logger.error("Engine node cannot be saved : engine instance is null");
            return;
        }

        // update node state
        await this.saveInternalState();

        // update node
        await (this._engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()))
            .asyncUpdateEntry(this, { replace:false, $set:pPpt});

        Logger.info(`[ENGINE][node=${this.UUID}] Node saved`);
    }

    getUID():EngineNodeUUID {
        return this.UUID;
    }

    async loadInternalState():Promise<void>{
        this._state = await this._engine.getEngineDB().getStateByName(`engine-node-${this.UUID}`);
    }


    async saveInternalState():Promise<any>{
        if(this._state!=null){
            await this._engine.getEngineDB().saveState(this._state);
        }
    }

    /**
     * To set node's hostname
     *
     * @param pHostname
     */
    setHostname(pHostname:string, pForce = false):void {

        if(this.running && !pForce){
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
        // const ssl = this._engine.getSettings().getServerSettings().getSslSettings();
        if(process.env.DXC_NODE_SSL=="1"){
            // HTTP only comm mode ( port can change)
            return `https://${this.getHostname()}:${this.httpsPort>-1?this.httpsPort:8443}`;
        }else{
            // HTTPS ( port can change)
            return `http://${this.getHostname()}:${this.httpPort>-1?this.httpPort:8080}`;
        }
    }


    async setEngine(pEngine:IDexcaliburEngine):Promise<void> {
        if(this._engine==null){
            this._engine = pEngine;
        }
        await this.loadInternalState();
    }

    setMasterUri(pUri:string) {
        this.masterURI = pUri;
    }

    /**
     * Trigger
     */
    async remoteStart():Promise<any> {
        // notify kube api, ...
        return;
    }

    isRunning():boolean {
        return this.running;
    }

    /**
     *
     */
    async start(pCause:string, pNodeOpts:string[] = []):Promise<void> {
        if(this.state!==NodeState.NEW && this.state!==NodeState.QUEUED){
            throw EngineNodeException.CANNOT_START_NODE(this.UUID, 'Invalid state of the node : '+this.state);
        }

            if(this.isAllowSefRegistration() && this.state==NodeState.QUEUED){
            //return; // await this.remoteStart();
        }

        const hasHeapSizeOpt = pNodeOpts.find( x => (x.indexOf('--max-old-space-size=')>-1));

        if(hasHeapSizeOpt==null){
            pNodeOpts.push(`--max-old-space-size=${this.getMaxHeapSize()}`);
        }

        this.startedAt = (new Date()).getTime();

        // gather current statefulset size
        const size = await (this._engine as DexcaliburEngine).getNodeManager().countRunningNode();
        Logger.info("[ENGINE NODE] There are "+size+" nodes running, increasing by one ....");

        if(process.env.KUBERNETES_PORT!=null){
            return await K8sHelper.scale(K8ResourceType.STATEFULSET, 'dxcslaves', size+1, "default");
        }else{
            return await this.spawn(pCause, false, pNodeOpts);
        }



    }

    /**
     * To open the project associated to this node.
     *
     * It assumes this node is a remote node, and NodeState is IDLE
     *
     * @async
     */
    async open(pExtraOpts:any):Promise<any> {

        if(this.state!==NodeState.IDLE){
            throw EngineNodeException.CANNOT_START_NODE(this.UUID, 'Invalid state of the node : '+this.state);
        }

        Logger.info("[ENGINE NODE] [OPEN] uri : "+this.getHost()+"/api/workspace/open_slave?");


        let cookie="";
        if(pExtraOpts.cookie !=null){
            for(let k in pExtraOpts.cookie){
                cookie += `${k}=${Util.encodeURI(pExtraOpts.cookie[k])};`
            }
        }
        if(cookie.length>0){
            cookie = cookie.slice(0,-1);
        }

        const data = await GOT(
            this.getHost()+"/api/workspace/open_slave?",{
                searchParams: {
                    uid: this._projectUID
                },
                headers: {
                    'Cookie':cookie
                }
            }
        );


        const resp:any = JSON.parse(data.body);
        Logger.raw('open_slave RESULT ',data.body);
        if(resp.success){

        }

        return this;
    }



    /**
     * To perform the operation
     *
     * @param {Operation} pOpe
     * @method
     */
    async execOperation2( pOrder:Order):Promise<any> {

        if(pOrder.type===OperationType.APP_WEB_REQUEST || pOrder.type===OperationType.USER_WEB_REQUEST){
            Logger.info("[ENGINE NODE] [EXEC OPE 2] Forward request");
            // TODO : add quota, FW, etc ..
            return await this.forwardWebRequest(pOrder.order.server, pOrder.order.req, pOrder.order.res);
        }

        const issuer = await (this._engine as DexcaliburEngine)
                                            .getUserService()
                                            .getAccount(
                                                (this._engine as DexcaliburEngine).getInternalAcc(),
                                                pOrder.owner
                                            );

        if(pOrder.type===OperationType.NEW_PROJ || pOrder.type===OperationType.OPEN_PROJ){
            const prjOrder = await (this._engine as DexcaliburEngine)
                .getProjectManager()
                .getProjectOrder(issuer, pOrder.order);

            if(pOrder.type===OperationType.OPEN_PROJ){

                Logger.info("[ENGINE NODE] [EXEC OPE 2] Open an existing project");
                return await (this.open(prjOrder.getOption('extra')));
            }else{

                Logger.info("[ENGINE NODE] [EXEC OPE 2] Start a new project");
                return await (this.startProject(
                    (this._engine as DexcaliburEngine).getInternalAcc(),
                    prjOrder, //pOpe.data as ProjectOrder,
                    prjOrder.getOption('extra'), /* pOpe.extra*/
                ));
            }
        }

        if(pOrder.type===OperationType.SCAN_ORDER){
            // check if the node has already loaded the project

            const scOrder = await (this._engine as DexcaliburEngine)
                .getScanScheduler().getOrder(issuer, pOrder.order)

            Logger.info("[ENGINE NODE] [EXEC OPE 2] Start scan");
            return await (this.startScan(scOrder));
        }

        throw EngineNodeException.NOT_SUPPORTED_OPE(pOrder.type);

        /*switch (pOpe.type){
            case OperationType.SCAN_ORDER:
                Logger.info("[ENGINE NODE] [EXEC OPE 2] Start scan");
                return await (this.startScan(pOpe.data as ScanOrder));
            case OperationType.NEW_PROJ:
                Logger.info("[ENGINE NODE] [EXEC OPE 2] Start new project");
                return await (this.startProject(
                    (this._engine as DexcaliburEngine).getInternalAcc(),
                    pOpe.data as ProjectOrder,
                    pOpe.extra
                ));
            case OperationType.OPEN_PROJ:
                Logger.info("[ENGINE NODE] [EXEC OPE 2] Open an existing project");
                const prjOrder = await (this._engine as DexcaliburEngine)
                                                        .getProjectManager()
                                                        .getProjectOrder(issuer, pOpe.data)
                return await (this.open(pOpe.extra));
            default:
                throw EngineNodeException.NOT_SUPPORTED_OPE(pOpe.type);
        }*/
    }

    async isBusy():Promise<boolean> {
        return (this.state!=NodeState.IDLE);
    }


    private _prepareCookieHeader(pCookies:any):any {
        let cookie="";
        if(pCookies !=null){
            for(let k in pCookies){
                cookie += `${k}=${Util.encodeURI(pCookies[k])};`
            }
        }
        if(cookie.length>0){
            return cookie.slice(0,-1);
        }else{
            return cookie;
        }
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
            const opts = pOrder.getOption('extra');

            // check if the order is already in the queue
            if(this.waitingQueue.find( o => (o.order == pOrder.getUUID())!=null)){
                return;
            }
            if(this.activeOpe!=null && this.activeOpe.order == pOrder.getUUID()){
                return;
            }

            // check if server is starting and queue is empty
            // else check if node is busy
            switch (this.state){
                case NodeState.STARTING:
                    pOrder.dates.start = (new Date()).getTime();
                    this.activeScanSession.setState(ScanState.WAITING);
                    this.waitingQueue.push({
                        type: OperationType.SCAN_ORDER,
                        order: pOrder.getUID(),
                        owner: opts.owner
                    } );
                    break;
                case NodeState.NEW:
                    // if the node is new, first open the project
                    this.waitingQueue.push({
                        type: OperationType.SCAN_ORDER,
                        order: pOrder.getUID(),
                        owner: opts.owner
                    } );
                    //throw EngineNodeException.NEW_NODE(this.UUID,"startScan");
                    break;
                case NodeState.BUSY:
                    this.waitingQueue.push({
                        type: OperationType.SCAN_ORDER,
                        order: pOrder.getUID(),
                        owner: opts.owner
                    } );
                    //throw EngineNodeException.BUSY_NODE(this.UUID,"startScan");
                    break;
                case NodeState.STOPPED:
                    throw EngineNodeException.DOWN_NODE(this.UUID,"startScan");
                    break;
            }

            return;
        }

        // save order, to make it accessible from slave Node
        //(this._engine as DexcaliburEngine).getScanScheduler().saveOrder(pOrder);

        if((this._engine as DexcaliburEngine).isSlaveNode()){
            const opts = pOrder.getOption('extra');

            const issuer = await (this._engine as DexcaliburEngine).getUserService().getAccount(
                (this._engine as DexcaliburEngine).getInternalAcc(),
                opts.owner
            );

            try{
                await this._startLocalScan(issuer, pOrder);
                this.setState(NodeState.IDLE);
            }catch(err){
                console.log(err);
            }

            return;
        }else{
            Logger.info("[ENGINE NODE][GOT] Send command to slave node : "+this.getHost()+"/api/audit/project/"+this._projectUID+"/scan/start");

            if(this.activeScanSession.hasModel()){
                return GOT(
                    this.getHost()+"/api/audit/project/"+this._projectUID+"/scan/start",{
                        method: 'POST',
                        json: {
                            order: this.activeScanSession.getUUID(),
                            project: this._projectUID,
                            _puid: this._projectUID,
                            models: [this.activeScanSession.getModelUID()],
                            scheduled: 0
                        },
                        headers: {
                            'Cookie': this._prepareCookieHeader(pOrder.getOption('extra').cookie)
                        },
                    }
                ).then(()=>{
                    console.log("Scan ordered successfully");
                })
            }else{
                // done
                return true;
            }
        }
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
                Logger.info("[ENGINE NODE][GOT] Start project  : "+wh);

                return GOT(
                    wh,{
                        method: 'POST',
                        headers: {
                            'Cookie':cookie
                        },
                        body: JSON.stringify({})
                    }
                ).then((vRes)=>{
                    Logger.info("Project ordered successfully");
                    console.log(vRes.body);
                    const r = JSON.parse(vRes.body);
                    if(r.success==true){
                        this.setPurpose(NodePurpose.ANY);
                        this.setState(NodeState.IDLE);
                    }else{
                        // kill node ?
                        this.kill();
                    }
                });
                break;
            case NodeState.STARTING:
                pOrder.dates.start = (new Date()).getTime();
                await this._engine.getEngineDB().updateOrder(pOrder,['dates']);
                // waiting
                //this.activeScanSession.setState(ScanState.WAITING);
                //this.waitingQueue.push(pOrder);
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

    setHttpPort(pPort:number, pForce = false):void {
        this._setPort('httpPort', 'HTTP', pPort, pForce);
    }

    setHttpsPort(pPort:number, pForce = false):void {
        this._setPort('httpsPort', 'HTTPS', pPort, pForce);
    }

    setWsPort(pPort:number, pForce = false):void {
        this._setPort('wsPort', 'WS', pPort, pForce);
    }

    setWssPort(pPort:number, pForce = false):void {
        this._setPort('wssPort', 'WSS', pPort, pForce);
    }

    private _setPort(pPpt:string, pShort:string, pPort:number, pForce = false):void {
        if(this.running && !pForce){
            throw EngineNodeException.NODE_ALREADY_RUNNING(this.UUID,pShort+" port cannot be changed because ths node is running.");
        }

        // TODO : add port nbumber check based on property rule
        // if(EngineNode.TYPE.getProperty(pPpt).validate())
        this[pPpt] = pPort;

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


        Logger.info( `[ENGINE NODE] Start to spawn new node [node=${this.UUID}] because : ${pCause}`);
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

            if((this._engine as DexcaliburEngine).getNodeManager().selfRegistration){

                args.push('--self-registration');
                args.push('--self-registration-secret='+(this._engine as DexcaliburEngine).getNodeManager()
                                        .getRegistrationKeyPath());
            }else{
                args.push('--node-uid='+this.UUID);
            }
            args.push('--port='+this.httpPort);
            args.push('--port-ws='+this.httpsPort); // change
            args.push('--master-uri='+this.masterURI);

            if(pDebug){
                args.push("--debug");
            }

            Logger.info('[NODE] Spawn command : node '+args.join(' '));

            // TODO : remove ? secret leak ?
            this.spawnCmd = args.join(' ');

            if(!this.isAllowSefRegistration()){
                this.setState(NodeState.STARTING);
            }


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
            this.running = true;

            await this.save(['_pid','spawnCmd','state','running']);

            // write stdout to buffer
            child.stdout.on('data', (data) => {
                this.stdout$.next(data);
            });
            // write stderr to buffer
            child.stderr.on('data', (data) => {
                const cause = Buffer.from(data).toString();

                if(cause.indexOf("EADDRINUSE")>-1){
                    // a node is tagged STOPPED but it is still running
                    // kill it
                    const port = /port: ([0-9]{1,5})/.exec(cause);
                    Logger.error("CONFLICTING PORT : "+port[1]);
                    if(port !=null && port[1]!=null && this._engine!=null){
                        (async ()=>{
                            await ((this._engine as DexcaliburEngine).getNodeManager())
                                .killNodes(
                                    'SIGINT',
                                    { running:false, httpPort: parseInt(port[1],10) },
                                    [ this.getUID() ],
                                    true
                                );
                        })();

                    }
                }

                this.stderr$.next(data);
            });

            child.on('close', (code) => {
                Logger.info("Stopped slave ...");
                (async ()=>{
                    this.running = false;
                    await this.save(['running']);
                    this.setState(NodeState.STOPPED);
                })();
            });

            Logger.info( `[ENGINE NODE] node spawned [PID=${this._pid}]:   ${args.join(' ')}  (opts)`);
        }catch(err){
            Logger.info('[ENGINE NODE] Detached node error :'+err.message);
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

        const opts = pOrder.getOption('extra');

        const orderTicket:Order = {
            type: pOpeType as any,
            owner: opts.owner, // (pUserAccount!=null ? (pUserAccount as UserAccount).getUID() : null),
            order:pOrder.getUID(),
            created: (new Date()).getTime()
        }

        // update queues and save
        this.waitingQueue.push(orderTicket);

        // update
        await this._engine.getEngineDB().updateOrder(pOrder,['dates','waitingQueue']);
        await this.save(['waitingQueue']);

        /*f(this.state == NodeState.IDLE && !await this.isBusy()){
            // TODO : notify waitingQueue updated
            // send a request to order a scan to the node
            // this.startProject(pAccount,newPrjOrder,pExtraOwnerOpts);
        }*/

        //console.log(this);
        Logger.info(`[appendToQueue] [node=${this.UUID}] [suspended=${this._suspendQueue?'true':'false'}] ${pOpeType} : Order = ${pOrder!=null? pOrder.getUID() : "NULL"}`)

        if(!this._suspendQueue){
            this.operation$.next(null);
        }
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
            order: {
                server: pServer,
                req: pReq,
                res: pRes
            },
            created: Util.time()
        });
    }


    /**
     * To kill this node
     *
     * Only work when parallelism is based on top of process
     * (not on top of self registration)
     *
     * @method
     */
    kill():void {

        if(this._pid==-1 || this._pid==null) return;

        try{
            _ps_.kill(this._pid);

            if(this._engine!=null){
                (async ()=>{ await this.stopped(this._engine as DexcaliburEngine); })();
            }
            Logger.success(`[ENGINE NODE][NODE=${this.UUID}] Killed.`)
        }catch(e){
            Logger.error(`[ENGINE NODE][NODE=${this.UUID}] Cannot be killed : ${e.message} ${e.stack}`);
        }
    }

    setProject(pUID:DexcaliburProjectUUID):void {
        this._projectUID = pUID;
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
        if(this._state!=null){
            return this._state.getProperty('owner');
        }else{
            return null;
        }
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

        if(this._state==null){
            throw new Error("State of the EngineNode is undefined or null");
        }

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
            spawnCmd: this.spawnCmd,
            pid: this._pid,
            selfReg: this.selfReg
            //errPipe: (this.errPipe!=null),
            //outPipe: (this.outPipe!=null)
        };
    }

    /**
     *
     * @param pRequest
     * @param pResponse
     * @param pOptions
     * @async
     * @method
     */
    async forwardWebRequest(pServer:WebServer, pRequest:any, pResponse?:any ):Promise<any> {
        Logger.info(`[ASYNC] Forward request from [node=${this.parentUUID}] to [node=${this.UUID}][uri=${this.getHost()}][url=${pRequest.url}]`)
       /*console.log({
           hostname: this.getHostname(),
           port: this.httpPort,
           path: pRequest.url,
           method: pRequest.method,
           headers: pRequest.headers
       });*/

        let responseSent = false;



        const proxyReq = http.request({
            hostname: this.getHostname(),
            port: this.httpPort,
            path: pRequest.url,
            method: pRequest.method,
            headers: pRequest.headers
        }, (proxyRes) => {
                // Copier les headers de la réponse proxy
                proxyRes.setEncoding('utf8');
                let rawData = '';

                proxyRes.on('data', (chunk) => {
                    // Logger.raw("RESPONSE CHUNK  > ",chunk);

                    rawData += chunk;
                });
                proxyRes.on('end', () => {

                    //Logger.raw("RESPONSE > ",rawData, proxyRes.statusCode, proxyRes.headers);
                    //pResponse.writeHead(proxyRes.statusCode, proxyRes.headers);

                    if(!responseSent){
                        responseSent = true;
                        //pServer.sendSuccess( pResponse, rawData);
                        pResponse.send(rawData);
                    }
                });

                //proxyRes.pipe(pResponse);
        });

        proxyReq.on('error', (err) => {

            Logger.error(`[ENGINE NODE][${this.UUID}] Proxy : ${err.stack}`);
//            Logger.error("[ENGINE NODE][PROXIFIED REQUEST] REQUEST ERROR > ",err);
            /*if(!responseSent){
                responseSent = true;
                pServer.sendError( pResponse, 'Proxy error (1)');
            }*/
        });

        if(/^(POST|PUT|DELETE)$/i.test(pRequest.method )){
            proxyReq.write(JSON.stringify(pRequest.body));
        }

        proxyReq.end();
        //pResponse.pipe(proxyReq);
    }

    forwardWebRequestSync(pServer:WebServer, pRequest:any, pResponse?:any ):any {
        Logger.info(`[SYNC] Forward request from [node=${this.parentUUID}] to [node=${this.UUID}][uri=${this.getHost()}]`)
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

    /**
     * To check if the node is up or not
     *
     * @since 1.8.0
     */
    async getHcStatus(pEngine:Nullable<IDexcaliburEngine> = null):Promise<Nullable<boolean>> {

        if(this._engine==null && pEngine!=null){
            this._engine = pEngine;
        }

        if(this._httpClient == null){
            this._httpClient = new EngineNodeClient(this.getHostname(), this.httpPort+"", this._engine as DexcaliburEngine);
        }

        //Logger.info("[ENGINE NODE] getHcStatus > ",this.state);

        if(this.state==NodeState.IDLE){
            return await this._httpClient.getHealthCheckResult();
        }else{
            return null;
        }
    }

    /**
     * To unscribe queues and listener when the node is dead
     *
     * @param {DexcaliburEngine} pEngine
     * @method
     */
    stopped(pEngine:DexcaliburEngine) {
        Logger.info("STOPPING "+this.getUID());
        /*
        try{
            throw new Error('STOOPING');
        }catch(e){
            console.log(e.stack)
        }*/

        // reschedule current operration
        //this.
        // free queues
        this.opeQueue = [];
        this.stdout$.unsubscribe();
        this.stderr$.unsubscribe();
        this.nodeState$.unsubscribe();

        // archive
        this.running = false;
        this.state = NodeState.STOPPED;
        this.stoppedAt = (new Date()).getTime();

        if(this._engine==null) this._engine = pEngine;

        this.save(['running','state','stoppedAt','startedAt']);
    }

    /**
     * To allow this node to start on self registration
     * of a slave
     *
     * @method
     * @since 1.8.0
     */
    allowSelfRegistration(){
        this.selfReg = true;
    }

    /**
     * To check if this node allow starting o registration of a slave node
     *
     * @returns {boolean}
     * @method
     * @since 1.8.0
     */
    isAllowSefRegistration():boolean {
        return this.selfReg;
    }


    /**
     *
     */
    async refreshWaitingQueue():Promise<any> {
        const self = await (this._engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()) as MongodbDbCollection)
            .asyncGetEntry({ UUID: this.getUID() });

        if(self==null) return ;

        this.waitingQueue = self.waitingQueue;
        this.activeOpe = self.activeOpe;
    }
    /**
     * To pop the next queued order from the waiting queue,
     * set it at active ope, update in DB and return order (or NULL)
     *
     * @method
     * @async
     * @since 1.8.0
     */
    async nextWaitingOpe():Promise<Nullable<Order>> {

        const self = await (this._engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()) as MongodbDbCollection)
            .asyncGetEntry({ UUID: this.getUID() });

        if(self==null) return null;

        let nextOpe = self.waitingQueue.shift();
        this.waitingQueue = self.waitingQueue;

        if(nextOpe!=null){
            this.activeOpe = nextOpe;
            await this.save(["activeOpe","waitingQueue"]);
        }

        return nextOpe;
    }

    /**
     * @method
     */
    createWebsocketClient():WebsocketClient {
        const c = new WebsocketClient(
            this.getHostname(),
            this.httpsPort,
        );

        c.init('term-control');
        return c;
    }

    /**
     * To check if a node is ready
     *
     */
    async checkReadyness() {
        if(this.state==NodeState.QUEUED){
            // if queued since more than 1 min, add to flush/kill queue
            return !((Util.now()-this.createdAt) > 60*1000);
        }

        return true;
    }

    /**
     *
     */
    async isWaitingQueueEmpty():Promise<boolean> {

        const self = await (this._engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()) as MongodbDbCollection)
            .asyncGetEntry({ UUID: this.getUID() });

        if(self==null){
          return true;
        }

        return (self.waitingQueue.length==0);
    }

    private async _startLocalScan(pUser:UserAccount, pOrder:ScanOrder) {

        // get project and user ACL
        const project = await (this._engine as DexcaliburEngine).getProjectManager()
                .getLocalActiveProject(pUser,pOrder.getProjectUID());

        // ========== LOGIC
        const am = (this._engine as DexcaliburEngine).getAuditManager();
        const scheduler = (this._engine as DexcaliburEngine).getScanScheduler(); //.getScanScheduler();

        let org:OrganizationUnit = null;
        if(pOrder.orgUnit!=null){
            org = await (this._engine as DexcaliburEngine).getOrgManager().getOrganization(pUser, pOrder.orgUnit);
        }

        const report = await scheduler.newStandaloneScan(pUser, project, pOrder, org);

        Logger.info("SERIALIZE REPORT TO SEND TO WEB");
    }

    suspendQueue(pStatus:boolean) {
        this._suspendQueue = pStatus;
    }

    resumeQueue() {
        this.operation$.next(null);
    }
}
EngineNode.TYPE.builder(EngineNode);