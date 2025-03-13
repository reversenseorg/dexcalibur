import {randomUUID} from "crypto";


import DexcaliburEngine from "../DexcaliburEngine.js";
import {Nullable} from "./IStringIndex.js";
import {EngineNode, EngineNodeUUID, NodePurpose, Operation, StateChangeEvent} from "./EngineNode.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import got from "got";
import * as Log from "../Logger.js";
import WebServer from "../WebServer.js";
import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {InternalState} from "./InternalState.js";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {ResourceThresholds} from "../billing/BusinessPlan.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {ValidationRule} from "../Validator.js";

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


    /**
     * Replace by DB request => stateless
     * @deprecated
     */
    slaves:Record<EngineNodeUUID, EngineNode> = {};

    /**
     Replace by DB request => stateless
     * @deprecated
     */
    projectMapping:Record<DexcaliburProjectUUID, EngineNode[]> = {};

    /**
     * Replace by DB request => stateless
     * @deprecated
     */
    orgMapping:Record<OrganizationUnitUUID, EngineNode[]> = {};


    /**
     * Replace by DB request => stateless
     * @deprecated
     */
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

    async recoverRunningSlaves():Promise<EngineNodeUUID[]> {
        // todo
        return [];
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


        const slaves:Record<EngineNodeUUID, EngineNode> = {};
        let slavesUuids:EngineNodeUUID[] = [];
        if(this._state==null){
            // recover mode, search running slaves

            slavesUuids = await this.recoverRunningSlaves();
        }else{
            // restore EngineNodes
            slavesUuids = this._state.getProperty('slaves');
        }

        // refresh node pool before to reload
        await this.refreshPool();

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

        return await this._state.save();
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

    async getNextPorts():Promise<{ http:number, https:number }> {
        // gather running node
        const nodes = await (this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()) as MongodbDbCollection)
            .search({
                filter: {
                    running: true
                }
            },{ merlin:false, raw:true });

        const portSlices:number[] = [];
        const ports:Record<string, number> = {};

        nodes.map(x => {
            portSlices.push(x.httpPort,x.httpsPort);
        });

        let start = this.portRange[0];
        while(portSlices.indexOf(start)>-1 && portSlices.indexOf(start+1)>-1){
            start+=2;
        }

        return {
            http: start,
            https: start+1
        };
    }


    /**
     *
     * @param pProject
     */
    async getReadySlave(pProjectUID:DexcaliburProjectUUID, pPurpose:NodePurpose,
                        pOrg:Nullable<OrganizationUnitUUID> = null):Promise<Nullable<EngineNode>>{

        let nodes = await
                this.getNodes( {
                    _projectUID: { $in: [pProjectUID] },
                    state: NodeState.IDLE,
                    running: true
                });

        console.log('Ready slave before filtering : ',nodes.length,' '+nodes.map(x => x.purpose).join(','));
        nodes = nodes.filter(x => (x.purpose==pPurpose || x.purpose==NodePurpose.ANY));
        console.log('Ready slave after filtering : ',nodes.length);

        if(nodes.length>0){
            nodes.map(x => x.setEngine(this.engine));
            await nodes[0].loadInternalState();
            return nodes[0];
        }else{
            return null;
        }
    }

    /*
     * To check if there is an existing node for this project
     * @param pProjectUID
     */
    /*isStarted(pProjectUID:string):boolean {

        const nodes = await (this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()) as MongodbDbCollection)
            .search({
                filter: {
                    _projectUID: { $in: [pProjectUID] }
                }
            },{ merlin:false, raw:true });

        const proj = this.projectMapping[pProjectUID];
        let exists = false;

        proj.map(x => {
            exists = exists || x.isStarted();
        });

        return exists;
    }*/

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

        const node =  await EngineNode.newNode(uuid, this.uuid, pProjectUID, this.engine);

        const nextPorts = await this.getNextPorts();

        node.setEngine(this.engine);
        node.setMasterUri(this.getLocalURI());
        node.setState(NodeState.NEW)
        node.setHttpPort(nextPorts.http);
        node.setHttpsPort(nextPorts.https);
        node.setPurpose(pPurpose);

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

        // save node state
        await node.saveInternalState();

        // save node
        await this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType())
            .asyncAddEntry(node.getUID(),node);

        // update node manager state
        await this.saveInternalState();

        return node; //this.slaves[uuid];
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
        const node = await (this.engine.getEngineDB()
            .getCollectionOf(EngineNode.TYPE.getType())as MongodbDbCollection)
            .asyncGetEntry({ UUID: pNodeUUID });

        node.setEngine(this.engine);
       await node.loadInternalState();

       return node;
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
    async listNodeByProject(pUser:UserAccount, pProjectUID:DexcaliburProjectUUID,
                            pPurpose:Nullable<NodePurpose> = null):Promise<EngineNode[]> {

        /*AccessControl.isAuthorized(

        )*/

        let nodes:EngineNode[] = await (this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()))
            .search({
                filter: {
                    _projectUID: { $in: [pProjectUID] },
                    running:true
                }
            },{merlin:false, raw:true});

        //let nodes = this.projectMapping[pProjectUID];
        if(nodes==null || !Array.isArray(nodes)){
            return [];
        }

        if(pPurpose!=null){
            nodes = EngineNodeManager.filterNodesByPurpose(nodes, pPurpose);
        }


        // load states
        for(let i=0;i<nodes.length; i++){
            nodes[i].setEngine(this.engine);
            await (nodes[i].loadInternalState())
        }
        return nodes;
    }

    /**
     * To get the list of nodes linked to a specific project
     *
     * @param {string} pProjectUID The project UID
     * @returns {EngineNode[]} The list of node linked to a project by its UID. If there is not node, the list is empty.
     * @method
     */
    async getNodeByProject(pProjectUID:DexcaliburProjectUUID,pPurpose:Nullable<NodePurpose> = null, pRunning:Nullable<boolean> = true):Promise<EngineNode[]> {

        let extra:any = undefined;
        if(ValidationRule.bool().test(pRunning)){
            extra = { running:pRunning };
        }

        let nodes = await (this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()) as MongodbDbCollection)
            .search({
                filter: {
                    _projectUID: { $in: [pProjectUID] },
                    ...extra
                }
            },{ merlin:false, raw:true });


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

        Logger.info("[ENGINE NODE][GOT] Notify master  : "+this.masterURI+"/api/node/webhook/state/"+pState);

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
            /*this.getNodeByProject(pProjectUID)

            nod.map(x => {
                o.slaves.push(x.toJsonObject());
            });*/
            // TODO

            Object.values(this.slaves).map(x => {
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
        let node:EngineNode = this.getNodeByUUID(vEvent.nodeUUID);

        (async ()=>{
            await this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType())
                .asyncUpdateEntry(node, { replace:false, $set:['running','state','pid']})
        })();


        if(vEvent.new==NodeState.IDLE){

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
    async killNodes(pSignal: string, pFilters:any = { running:true }, pExclude:EngineNodeUUID[] = [], pLatest = false):Promise<void> {
        let nodes = await this.getNodes(pFilters);

        console.log(nodes);
        nodes = nodes.filter(x => (pExclude.indexOf(x.getUID())==-1) )
        console.log(`[${this.engine.isSlaveNode()?'SLAVE':'MASTER'}] KILL NODES : `,nodes.map(x => `\t${(new Date(x.startedAt)).toUTCString()}\t${x.getUID()}`).join('\n'));

        if(pLatest && nodes.length>0){
            nodes = [nodes[0]];
        }

        switch (pSignal){
            case 'SIGINT':
                // controlled kill => kill children
                for(let i=0; i<nodes.length; i++){
                    try{
                        nodes[i].kill();
                        // save state
                        nodes[i].stopped(this.engine);
                    }catch (e){}
                }
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

        let owner:Nullable<UserAccountUUID>;
        for(let i=0; i<pNodePool.length; i++){
            owner = await pNodePool[i].getOwner();
            if(owner!=null){
                if((owner!=pUser.getUID()) && (!pNodePool[i].isOwnershipExpired(timeouts.user)))  {
                    continue;
                }
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

    /**
     * To print the list of nodes (running or not)
     *
     * @param pAccount
     */
    async printNodes(pAccount:UserAccount):Promise<void> {

        await this.refreshPool();

        const nodes:EngineNode[] = await this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType())
            .getAsList();

        let body = "";
        nodes.map(vNode => {
            body += `${vNode.getUID()}\t${vNode.getMaxHeapSize()}\t${vNode.purpose}\t${vNode.state}\t${vNode.httpPort}\t${vNode.running?'RUNNING':'STOPPED'}\n`;
        });
    }

    /**
     * Perform engine node healthcheck and update state in DB
     *
     * @param pNode
     */
    async refreshRunningStatus(pNode:EngineNode, pEngine:DexcaliburEngine):Promise<void> {

        if(pNode.running){
            const up = await pNode.getHcStatus(pEngine);

            console.log(pNode.getUID(),up);
            if(!up){
                pNode.stopped(this.engine);
            }
        }
    }

    /**
     * To refresh the state of all nodes, update pools
     */
    async refreshPool():Promise<void> {

        let nodes:EngineNode[] = await (this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType()))
                                    .getAsList();

        for(let i=0; i<nodes.length; i++){
            await this.refreshRunningStatus(nodes[i], this.engine);
        }

    }

    /**
     *
     * @param pFilters
     * @private
     */
    private async getNodes(pFilters: any):Promise<EngineNode[]> {
        const nodes:EngineNode[] = await (this.engine.getEngineDB()
            .getCollectionOf(EngineNode.TYPE.getType()))
            .search({
                filter: pFilters
            },{ merlin:false, raw:true });

        console.log(pFilters,nodes);

        return nodes.sort((a,b)=>{
            if(a.startedAt==-1 || a.startedAt <= b.startedAt){
                return 1;
            }else {
                return -1;
            }
        })
    }
}