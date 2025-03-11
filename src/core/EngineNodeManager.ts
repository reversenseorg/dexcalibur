import {randomUUID} from "crypto";


import DexcaliburEngine from "../DexcaliburEngine.js";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {Nullable} from "./IStringIndex.js";
import {EngineNode, EngineNodeUUID, NodePurpose, Operation, OperationType, StateChangeEvent} from "./EngineNode.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import got from "got";
import * as Log from "../Logger.js";
import WebServer from "../WebServer.js";
import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {InternalState} from "./InternalState.js";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {ResourceThresholds} from "../billing/BusinessPlan.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const GOT = got.default;


export interface MasterNodeOptions {
    uri: string;
    ssl?: boolean;
}

export interface NodeLockTimeout {
    user: number,
    node: number
}


export enum NodeState {
    UNKNOW="unknow",
    // nothing to do, ready
    IDLE="idle",
    // busy
    BUSY="busy",
    // stopped (crash or manual stop)
    STOPPED="stopped",
    // created but not started
    NEW="new",
    // starting but webhook never called
    STARTING="starting"
}

/**
 * The aim of this class is to spawn slave node in separate process,
 * mount/configure it, establish secure communication with slave nodes
 * and maintain a routing table of project/node in order to re-route
 * API call from the master to associated slave.
 *
 * An engine instance as a unique Manager instance
 *
 * Must maintain also a mapping of user sessions / nodes / projects
 *
 * @class
 */
export class EngineNodeManager {


    static readonly HEADER_NODE_UUID = 'x-dxc-nodeuid';
    /**
     * UUID of this instance (engine node) into reversense pod
     *
     * @field
     */
    uuid:string;

    portRange: number[];

    portCounter: number = -1;

    engine:DexcaliburEngine;

    slaves:Record<EngineNodeUUID, EngineNode> = {};

    projectMapping:Record<DexcaliburProjectUUID, EngineNode[]> = {};

    orgMapping:Record<OrganizationUnitUUID, EngineNode[]> = {};

    states:Record<EngineNodeUUID, NodeState> = {};

    private _state:InternalState;

    /**
     * Base URI of the master node, used to build API URI
     * @type {Nullable<string>}
     * @field
     */
    masterURI:Nullable<string> = null;


    constructor(pMasterEngine:DexcaliburEngine, pCurrentUID:EngineNodeUUID) {
        // UUID of this engine node
        this.uuid = pCurrentUID;
        this.engine = pMasterEngine;
        this.setPortRange(10200,10300);
    }


    async loadInternalState():Promise<void>{
        this._state = await this.engine.getEngineDB().getStateByName(`engine-node-mgr-${this.uuid}`);

        let portRange = this._state.getProperty('portRange');
        if(portRange!=null) this.portRange = portRange;

        let portCounter = this._state.getProperty('portCounter');
        if(portCounter!=null) this.portCounter = portCounter;

        let masterURI = this._state.getProperty('masterURI');
        if(masterURI!=null) this.masterURI = masterURI;

        let states = this._state.getProperty('states');
        if(states!=null) this.states = states;

        // restore EngineNodes
        const slaves:Record<EngineNodeUUID, EngineNode> = {};
        const slavesUuids = this._state.getProperty('slaves');
        let tmpNode:Nullable<EngineNode> = null;
        if(slavesUuids!=null){
            for(let i=0;i<slavesUuids.length;i++){
                tmpNode = await (this.engine
                    .getEngineDB()
                    .getCollectionOf(EngineNode.TYPE.getType()) as MongodbDbCollection)
                    .asyncGetEntry({ UUID: slavesUuids[i] as string });
                if(tmpNode!=null){
                    slaves[slavesUuids[i]] = tmpNode;
                }
            }
        }
        this.slaves = slaves;

        let projectMapping = this._state.getProperty('projectMapping');
        for(let puid in projectMapping){
            this.projectMapping[puid] = [];
            for(let i=0; i<projectMapping[puid].length; i++){
                tmpNode = this.slaves[projectMapping[puid][i]];
                if(tmpNode!=null){
                    this.projectMapping[puid].push(tmpNode);
                }
            }
        }

        let orgMapping = this._state.getProperty('orgMapping');
        for(let ouid in orgMapping){
            this.orgMapping[ouid] = [];
            for(let i=0; i<orgMapping[ouid].length; i++){
                tmpNode = this.slaves[orgMapping[ouid][i]];
                if(tmpNode!=null){
                    this.orgMapping[ouid].push(tmpNode);
                }
            }
        }
    }


    async saveInternalState():Promise<any>{

        let prjMapping:Record<DexcaliburProjectUUID, EngineNodeUUID[]> = {};
        let orgMapping:Record<OrganizationUnitUUID, EngineNodeUUID[]> = {};
        let slaves:Record<EngineNodeUUID, EngineNodeUUID[]> = {};

        for(let prj in this.projectMapping){
            prjMapping[prj] = this.projectMapping[prj].map(x => {
                return x.getUID()
            });
        }
        for(let o in this.orgMapping){
            orgMapping[o] = this.orgMapping[o].map(x => {
                return x.getUID()
            });
        }

        this._state.setProperty('portRange', this.portRange);
        this._state.setProperty('portCounter', this.portCounter);
        this._state.setProperty('projectMapping', prjMapping);
        this._state.setProperty('orgMapping', orgMapping);
        this._state.setProperty('slaves', Object.keys(this.slaves));
        this._state.setProperty('states', this.states);
        this._state.setProperty('masterURI', this.masterURI);

        return await this.engine.getEngineDB().save(this._state);
    }

    /**
     * To retrieve the HTTP(S) URI of local instance
     *
     */
    getLocalURI():string {

        return '127.0.0.1:'+this.engine.getWebserver().getPort();
    }

    /**
     * To set the mandatory Master URI for SLAVE nodes
     *
     * @param pMasterURI
     * @param pOptions
     */
    setMasterURI(pMasterURI:string, pOptions:MasterNodeOptions):void {
        if(pOptions.ssl===true){
            this.masterURI = 'https://'+pMasterURI;
        }else{
            this.masterURI = 'http://'+pMasterURI;
        }
    }


    setPortRange(pMinPort:number, pMaxPort:number){
        this.portRange = [pMinPort,pMaxPort];
        this.portCounter = pMinPort;
    }

    /**
     *
     * @method
     */
    getNextPort():number {
        if(this.portCounter+1>this.portRange[1]){
            throw EngineNodeException.MAX_PORT_REACHED();
        }

        return (this.portCounter++);
    }

    /**
     *
     * @param pProject
     */
    hasReadySlave(pProjectUID:DexcaliburProjectUUID, pPurpose:NodePurpose):boolean{
        const engines = this.projectMapping[pProjectUID];
        if(engines.length==0){
            return false;
        }

        let ready = false;
        engines.map(x => {
            if(x.isReady() && (x.purpose===pPurpose)){
                ready = true;
            }
        })

        return ready;
    }


    /**
     *
     * @param pProject
     */
    getReadySlave(pProjectUID:DexcaliburProjectUUID, pPurpose:NodePurpose, pOrg:Nullable<OrganizationUnitUUID> = null):Nullable<EngineNode>{
        const engines = this.projectMapping[pProjectUID];
        if(engines==null || engines.length==0){
            return null;
        }

        let readyNode:Nullable<EngineNode> = null;
        engines.map(x => {
            if(x.isReady() && (x.purpose===pPurpose)){
                readyNode = x;
            }
        })

        return readyNode;
    }

    /**
     * To check if there is an existing node for this project
     * @param pProjectUID
     */
    isStarted(pProjectUID:string):boolean {
        const proj = this.projectMapping[pProjectUID];
        let exists = false;

        proj.map(x => {
            exists = exists || x.isStarted();
        });

        return exists;
    }

    generateSlaveWebhook(pSlave:IDexcaliburEngine):void {
        /*
        const crypto = require('crypto');
        console.log(crypto.randomUUID());
         */
    }

    /**
     *
     * @param pNodeUID
     * @param pState
     */
    async updateState(pNodeUID:EngineNodeUUID, pState:NodeState):Promise<void> {
        const node = this.getNodeByUUID(pNodeUID);

        Logger.info("[NODE MANAGER] Update state of [node="+pNodeUID+"][state="+pState+"]");

        node.setState(pState);
    }

    /**
     * Create a new node mapped to a project
     *
     * @param pProjectUID
     * @param pTargetOs
     */
    async createNode(pProjectUID:DexcaliburProjectUUID, pPurpose:NodePurpose, pOUID:Nullable<OrganizationUnitUUID> = null):Promise<EngineNode> {
        const uuid = randomUUID();

        const node =  EngineNode.newNode(uuid, this.uuid, pProjectUID);

        node.setEngine(this.engine);
        node.setMasterUri(this.getLocalURI());
        node.setState(NodeState.NEW)
        node.setHttpPort(this.getNextPort());
        node.setHttpsPort(this.getNextPort());

        if(process.env.DXC_NODE_HEAP_SZ){
            node.setMaxHeapSize(parseInt(process.env.DXC_NODE_HEAP_SZ,10));
        }


        if(this.projectMapping[pProjectUID]==null){
            this.projectMapping[pProjectUID] = [];
        }

        if(pOUID!=null){
            if(this.orgMapping[pOUID]==null){
                this.orgMapping[pOUID] = [];
            }

            this.orgMapping[pOUID].push(node);
        }

        this.slaves[uuid] = node;
        this.projectMapping[pProjectUID].push(node);

        // add listeners to event streams :
        node.nodeState$.subscribe((vEvent:StateChangeEvent    )=>{
           this.onNodeStateChanged(vEvent);
        });

        await node.saveInternalState();
        // save node
        await this.engine.getEngineDB().save(node);

        // save state
        await this.saveInternalState();


        return this.slaves[uuid];
    }



    /**
     *
     * @param pNodeUUID
     */
    getNodeByUUID(pNodeUUID:EngineNodeUUID):EngineNode {
        return this.slaves[pNodeUUID];
    }

    /**
     *
     * @param pNodeUUID
     */
   async getEngineNodeByUUID(pNodeUUID:EngineNodeUUID):Promise<Nullable<EngineNode>> {

       if(pNodeUUID==DexcaliburEngine.DEFAULT_UID){
           this.slaves[pNodeUUID] = new EngineNode({ parentUUID:null, UUID:DexcaliburEngine.DEFAULT_UID });
           if(this.slaves[pNodeUUID]!=null){
               return this.slaves[pNodeUUID];
           }else{
               return new EngineNode({ parentUUID:null, UUID:DexcaliburEngine.DEFAULT_UID });
           }
       }
        return await (this.engine.getEngineDB()
            .getCollectionOf(EngineNode.TYPE.getType())as MongodbDbCollection)
            .asyncGetEntry({ UUID: pNodeUUID });
   }

    static filterNodesByPurpose(pNode:EngineNode[], pPurpose:NodePurpose):EngineNode[] {
        return pNode.filter(e => {
            if(pPurpose==NodePurpose.ANY){
                return true;
            }

            return (e.purpose===pPurpose);
        });
    }

    static filterNodesByState(pNode:EngineNode[], pState:NodeState):EngineNode[] {
        return pNode.filter(e => {
            return (e.state===pState);
        });
    }

    /**
     * To get the list of nodes linked to a specific project
     *
     * @param {string} pProjectUID The project UID
     * @returns {EngineNode[]} The list of node linked to a project by its UID. If there is not node, the list is empty.
     * @method
     */
    getNodeByProject(pProjectUID:DexcaliburProjectUUID,pPurpose:Nullable<NodePurpose> = null):EngineNode[] {
        let nodes = this.projectMapping[pProjectUID];
        if(nodes==null || !Array.isArray(nodes)){
            return [];
        }

        if(pPurpose!=null){
            nodes = EngineNodeManager.filterNodesByPurpose(nodes, pPurpose);
        }

        return nodes;
    }

    /**
     * To get the list of nodes linked to a specific organization
     *
     * @param {OrganizationUnitUUID} pOUID The project UID
     * @returns {EngineNode[]} The list of node linked to a project by its UID. If there is not node, the list is empty.
     * @method
     */
    getNodeByOrganizationUUID(pOUID:OrganizationUnitUUID):EngineNode[] {
        const nodes = this.orgMapping[pOUID];
        if(nodes==null || !Array.isArray(nodes)){
            return []
        }else{
            return nodes;
        }
    }

    /**
     * To check if there are one or more nodes linked to a project
     *
     * @param {string} pProjectUID
     * @returns {boolean} TRUE if there are nodes, else FALSE
     * @method
     */
    hasNode(pProjectUID:DexcaliburProjectUUID):boolean {
        return (this.projectMapping[pProjectUID]!=null && this.projectMapping[pProjectUID].length>0);
    }

    /**
     * SLAVE MODE
     *
     * To notify the master, the slave node has successfully started
     *
     * @param {NodeState} pState New state of the node
     */
    async notifyMaster(pState:NodeState):Promise<void> {

        if(this.masterURI==null){
            throw EngineNodeException.INVALID_MASTER_URI('notify');
        }

        const response = await GOT(this.masterURI+"/api/node/webhook/state/"+pState, {
            headers: {
                // this one is mandatory to be processed by master middleware of /api/node/** routes
                [EngineNodeManager.HEADER_NODE_UUID]: this.uuid
                // add auth, signature, signed UUID to authenticated the request using one time public key from master ...
            }
        });

        const raw = JSON.parse(response.body);
        return raw;
    }

    /**
     * To check is a state is valid or not
     *
     * @param {string|NodeState} pState
     * @return {boolean} TRUE is the state is valid (exists)  or FALSE
     * @method
     * @static
     */
    static isValidState(pState: string|NodeState) {
        return ([
            NodeState.NEW,
            NodeState.STARTING,
            NodeState.STOPPED,
            NodeState.IDLE,
            NodeState.BUSY,
            NodeState.UNKNOW,
        ].indexOf(pState as NodeState)>-1);
    }

    getSlaves():EngineNode[] {
        return Object.values(this.slaves);
    }

    toJsonObject(pProjectUID:Nullable<string> = null):any {
        const o = {
            uuid: this.uuid,
            master: this.masterURI,
            portRange: this.portRange,
            portCounter: this.portCounter,
            slaves: []
        };

        if(pProjectUID!=null){
            this.getNodeByProject(pProjectUID).map(x => {
                o.slaves.push(x.toJsonObject());
            });
        }else{
            Object.values(this.slaves).map(x => {
                o.slaves.push(x.toJsonObject());
            });
        }


        return o;
    }

    /**
     * Listen changes of node state.
     *
     * Some processes are triggered from here such as queued scan orders
     *
     * @param {StateChangeEvent} vEvent Change event
     * @method
     */
    onNodeStateChanged(vEvent: StateChangeEvent) {

        Logger.success(`[ENGINE NODE MANAGER][${vEvent.nodeUUID}] State changed from ${vEvent.before.toUpperCase()} to  ${vEvent.new.toUpperCase()} `)
        let node:EngineNode;

        if(vEvent.new==NodeState.IDLE){

            // add affinity
            node = this.getNodeByUUID(vEvent.nodeUUID);

            //console.log(node);

            const ope:Nullable<Operation> = node.opeQueue.shift();

            if(ope==null){ return; }

                node.execOperation2(ope).then(()=>{
                    //console.log('onNodeStateChanged > OPE SUCCESS > ', ope.type);
                    //
                });
            // next, check the queue of scan orders
            /*if (node.waitingQueue.length > 0) {
                (node.startNextQueuedScans())
                    .then(() => {
                        console.log("Next scan order has been launched");
                    });
            }*/
        }
    }

    async forwardWebRequest(pNode:EngineNode, pServer:WebServer, pReq:any, pRes:any ):Promise<any> {
        return pNode.appendRequestToQueue(pServer, pReq,pRes);
    }

    forwardWebRequestSync(pNode:EngineNode, pServer:WebServer,  pReq:any, pRes:any ):any {
        return pNode.appendRequestToQueue(pServer, pReq,pRes);
    }

    /**
     * To kill all nodes
     *
     * - SIGINT triggers a kill of any slave nodes
     * - SIGKILL don't kill children. SIGKILL is used to reboot node manager without killing children.
     *
     * @param {string} pSignal Name of signal
     * @method
     */
    killNodes(pSignal: string) {
        const nodes = this.getSlaves();
        switch (pSignal){
            case 'SIGINT':
                // controlled kill => kill children
                nodes.map(x => {
                    x.kill();
                    // save state
                    this.engine.getEngineDB().save(x).then(()=>{});
                });
                break;
            case 'SIGKILL':
                // don't kill child
                break;
        }
    }

    /**
     * To check if organization thresholds allows engine node manager to allocate more node
     *
     * @param {OrganizationUnitUUID} pOrgUUID
     */
    async canCreateNode(pOrgUUID:OrganizationUnitUUID):Promise<boolean> {

        // gather thresholds
        const thr:ResourceThresholds = await this.engine.getOrgManager().getOrganizationThresholds(
            this.engine.getInternalAcc(),
            pOrgUUID
        );

        const nodes = this.getNodeByOrganizationUUID(pOrgUUID);

        return (nodes.length<thr.concurrentNodes);
    }


    isCurrentNode(pNode:EngineNode):boolean{
        return (this.uuid === pNode.getUID());
    }

    /**
     * To allocate a node with user account
     *
     * The node is pull from a pool of NodeEngine. We assume the pool contains
     *  nodes already filtered NodeState.IDLE + ProjectUID, purpose, ...
     *
     * @param pNodePool
     * @param pUser
     */
    async allocateNode( pNodePool:EngineNode[], pUser:UserAccount, pThreshold:Nullable<NodeLockTimeout> = null):Promise<Nullable<EngineNode>>{
        let free:Nullable<EngineNode> = null;
        const timeouts = (pThreshold==null? { user:3600*100, node:3600*200 }:pThreshold );

        for(let i=0; i<pNodePool.length; i++){
            if(!pNodePool[i].isOwnershipExpired(timeouts.user))  {
                continue;
            }
            free = pNodePool[i];
        }

        if(free!=null){
            await free.setOwner(pUser.getUID());
            return free;
        }else{
            return null;
        }
    }
}