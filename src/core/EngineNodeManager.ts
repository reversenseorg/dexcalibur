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
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const GOT = got.default;


export interface MasterNodeOptions {
    uri: string;
    ssl?: boolean;
}


export enum NodeState {
    UNKNOW="unknow",
    // nothing to do, ready
    IDDLE="iddle",
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


        /*this.states = this._state.getProperty('portRange');
        this.states = this._state.getProperty('portCounter');
        this.states = this._state.getProperty('slaves');
        this.states = this._state.getProperty('projectMapping');
        this.states = this._state.getProperty('states');
        this.states = this._state.getProperty('masterURI');*/
    }


    async saveInternalState():Promise<any>{

        let prjMapping:Record<DexcaliburProjectUUID, EngineNodeUUID[]> = {};
        let orgMapping:Record<OrganizationUnitUUID, EngineNodeUUID[]> = {};

        for(let prj in this.projectMapping){
            prjMapping[prj] = this.projectMapping[prj].map(x => {
                return x.UUID
            });
        }
        for(let o in this.orgMapping){
            orgMapping[o] = this.orgMapping[o].map(x => {
                return x.UUID
            });
        }

        this._state.setProperty('portRange', this.portRange);
        this._state.setProperty('portCounter', this.portCounter);
        this._state.setProperty('projectMapping', prjMapping);
        this._state.setProperty('orgMapping', orgMapping);
        //this._state.setProperty('slaves', this.slaves);
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
    createNode(pProjectUID:DexcaliburProjectUUID, pOUID:Nullable<OrganizationUnitUUID> = null):EngineNode {
        const uuid = randomUUID();

        const node = new EngineNode(uuid, this.uuid, pProjectUID);

        node.setEngine(this.engine);
        node.setMasterUri(this.getLocalURI());
        node.setState(NodeState.NEW)
        node.setHttpPort(this.getNextPort());
        node.setHttpsPort(this.getNextPort());

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

        // save state
        this.saveInternalState();


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
     * To get the list of nodes linked to a specific project
     *
     * @param {string} pProjectUID The project UID
     * @returns {EngineNode[]} The list of node linked to a project by its UID. If there is not node, the list is empty.
     * @method
     */
    getNodeByProject(pProjectUID:DexcaliburProjectUUID):EngineNode[] {
        const nodes = this.projectMapping[pProjectUID];
        if(nodes==null || !Array.isArray(nodes)){
            return []
        }else{
            return nodes;
        }
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
            NodeState.IDDLE,
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

        if(vEvent.new==NodeState.IDDLE){

            // add affinity
            node = this.getNodeByUUID(vEvent.nodeUUID);

            console.log(node);

            const ope:Nullable<Operation> = node.opeQueue.shift();

            if(ope==null){ return; }

                node.execOperation(ope).then(()=>{
                    console.log('onNodeStateChanged > OPE SUCCESS > ', ope.type);
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
}