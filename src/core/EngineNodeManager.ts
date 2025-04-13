import * as _fs_ from "fs";

import DexcaliburEngine from "../DexcaliburEngine.js";
import {Nullable} from "./IStringIndex.js";
import {EngineNode, EngineNodeUUID, NodePurpose, StateChangeEvent} from "./EngineNode.js";
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
import {CryptoUtils} from "../CryptoUtils.js";

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
    // created but not started
    QUEUED="queued",
    // starting but webhook never called
    STARTING="starting",
    // when the node is registered (and started) but not assigned to a project
    REGISTERED="registered"
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

    static readonly DEFAULT_REG_KEY_NAME = "3f011d2b-e0b0-413f-a3de-9999b81f20a7";
    static readonly HEADER_NODE_UUID = 'x-dxc-nodeuid';
    static readonly HEADER_NODE_HOST = 'x-dxc-nodehost';


    /**
     * UUID of this instance (engine node) into reversense pod
     *
     * @field
     */
    uuid:string;

    portRange: number[];

    portCounter: number = -1;

    selfRegistration = false;

    selfRegSecret = null;

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
        if(pPurpose!=NodePurpose.ANY){
            nodes = nodes.filter(x => (x.purpose==pPurpose || x.purpose==NodePurpose.ANY));
        }
        console.log('Ready slave after filtering : ',nodes.length);

        if(nodes.length>0){
            nodes.map(x => x.setEngine(this.engine));
            await nodes[0].loadInternalState();
            return nodes[0];
        }else{

            // node with self-registration enabled, are created before to be assigned to
            // a project. In such scenario, the function must search for IDLE node with empty project UID
            nodes = await
                this.getNodes( {
                    _projectUID: null,
                    state: NodeState.IDLE,
                    running: true
                });

            console.log('Ready slave before filtering 2 : ',nodes.length,' '+nodes.map(x => x.purpose).join(','));
            if(pPurpose!=NodePurpose.ANY){
                nodes = nodes.filter(x => (x.purpose==pPurpose || x.purpose==NodePurpose.ANY));
            }
            console.log('Ready slave after filtering 2 : ',nodes.length);

            if(nodes.length>0){
                nodes.map(x => x.setEngine(this.engine));
                nodes[0].setProject(pProjectUID);
                await nodes[0].loadInternalState();
                // save changes
                await nodes[0].save(['_projectUID', 'state']);
                return nodes[0];
            }else{
                return null;
            }
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

        // generate Node UUID
        const uuid = await this.engine.getEngineDB().generateFreeUuid(EngineNode.TYPE.getType());

        // create node object but don't start it
        const node =  await EngineNode.newNode(uuid, this.uuid, pProjectUID, this.engine);

        // get next http and ws ports
        const nextPorts = await this.getNextPorts();

        node.setEngine(this.engine);
        node.setMasterUri(this.getLocalURI());
        node.setPurpose(pPurpose);

        // if self-registration mode  is enabled, the node will be queued and wait en engine start
        // and registry himself to master
        if(this.selfRegistration){
            // remote host name and port will be set during registration
            node.setState(NodeState.QUEUED);
            node.allowSelfRegistration();

            if(process.env.DXC_HOSTNAME==undefined || process.env.DXC_HOSTNAME=='localhost'){
                node.setHttpPort(nextPorts.http);
                node.setHttpsPort(nextPorts.https);
            }

        }else{
            node.setState(NodeState.NEW);
            node.setHttpPort(nextPorts.http);
            node.setHttpsPort(nextPorts.https);
        }


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
            // this.onNodeStateChanged(vEvent);

            (async ()=>{ await this.onNodeStateChanged(vEvent); })();
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


    async createFreeNode():Promise<EngineNode> {

        // generate Node UUID
        const uuid = await this.engine.getEngineDB().generateFreeUuid(EngineNode.TYPE.getType());

        const node =  await EngineNode.newNode(uuid, this.uuid, null, this.engine);

        const nextPorts = await this.getNextPorts();

        node.setEngine(this.engine);
        node.setMasterUri(this.getLocalURI());
        node.setPurpose(NodePurpose.ANY);

        // if self-registration mode  is enabled, the node will be queued and wait en engine start
        // and registry himself to master
        if(this.selfRegistration){
            // remote host name and port will be set during registration
            node.setState(NodeState.QUEUED);
            node.allowSelfRegistration();

            if(process.env.DXC_HOSTNAME==undefined || process.env.DXC_HOSTNAME=='localhost'){
                node.setHttpPort(nextPorts.http);
                node.setHttpsPort(nextPorts.https);
            }

        }else{
            node.setState(NodeState.NEW);
            node.setHttpPort(nextPorts.http);
            node.setHttpsPort(nextPorts.https);
        }


        if(process.env.DXC_NODE_HEAP_SZ){
            node.setMaxHeapSize(parseInt(process.env.DXC_NODE_HEAP_SZ,10));
        }

        this.slaves[uuid] = node;

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
    async getNodeByProject(pProjectUID:DexcaliburProjectUUID,pPurpose:Nullable<NodePurpose> = null, pRunning:Nullable<boolean> = true, pState:Nullable<NodeState[]> =null):Promise<EngineNode[]> {

        let extra:any = {};
        if(ValidationRule.bool().test(pRunning)){
            extra.running = pRunning ;
        }

        if(pState!=null && pState.length>0){
            extra.state = { $in: pState };
        }
        /*
        this.getNodes({
            _projectUID: { $in: [pProjectUID] },
            state: NodeState.IDLE,
            running: true,
            ...extra
        })*/

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

        nodes.map(x => x.setEngine(this.engine));

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
     * SLAVE MODE
     *
     * To register this node to the master when self registration is enabled
     *
     * @param {NodeState} pState New state of the node
     */
    async registerMaster(pState:Nullable<NodeState> = null):Promise<void> {

        if(this.masterURI==null){
            throw EngineNodeException.INVALID_MASTER_URI('notify');
        }

        Logger.info("[ENGINE NODE][GOT] Register master  : "+this.masterURI+"/api/node/webhook/register");

        console.log({
            method: 'POST',
            headers: {
                // this one is mandatory to be processed by master middleware of /api/node/** routes
                [EngineNodeManager.HEADER_NODE_HOST]: (process.env.DXC_PRIV_IP!=null ? process.env.DXC_PRIV_IP:'127.0.0.1'),
                ['x-dxc-'+this.getRegistrationKeyName()]: this.getRegistrationKey()
                // add auth, signature, signed UUID to authenticated the request using one time public key from master ...
            },
            json: {
                http: this.engine.getSettings().getWebserverSettings().getHttpPort(),
                https: this.engine.getSettings().getWebserverSettings().getWsPort()
            }
        });
        const response = await GOT(this.masterURI+"/api/node/webhook/register", {
            method: 'POST',
            headers: {
                // this one is mandatory to be processed by master middleware of /api/node/** routes
                [EngineNodeManager.HEADER_NODE_HOST]: (process.env.DXC_PRIV_IP!=null ? process.env.DXC_PRIV_IP:'127.0.0.1'),
                ['x-dxc-'+this.getRegistrationKeyName()]: this.getRegistrationKey()
                // add auth, signature, signed UUID to authenticated the request using one time public key from master ...
            },
            json: {
                http: this.engine.getSettings().getWebserverSettings().getHttpPort(),
                https: this.engine.getSettings().getWebserverSettings().getWsPort()
            }
        });

        if(response.body!=null){
            const repData  = JSON.parse(response.body);
            if((repData as any).success==true){
                Logger.success("[NODE MGR] Node registered : "+repData.data.uuid);
                this.uuid = repData.data.uuid;
            }
        }
        //const raw = JSON.parse(response.body);
        return;
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
    async onNodeStateChanged(vEvent: StateChangeEvent):Promise<void> {

        Logger.success(`[ENGINE NODE MANAGER][${vEvent.nodeUUID}] State changed from ${vEvent.before.toUpperCase()} to  ${vEvent.new.toUpperCase()} `)
        let node:EngineNode = this.getNodeByUUID(vEvent.nodeUUID);

        if(vEvent.new==NodeState.REGISTERED){
            node.state = NodeState.IDLE;
        }

        node.setEngine(this.engine);

        await this.engine.getEngineDB().getCollectionOf(EngineNode.TYPE.getType())
            .asyncUpdateEntry(node, { replace:false, $set:['running','state','pid']});


        if(vEvent.new==NodeState.IDLE || vEvent.new==NodeState.REGISTERED){

            node.operation$.next(null);
            /*
            //console.log(node);

            // retrieve the next operation from waiting queue
            const o = await node.nextWaitingOpe();

            if(o!=null){
                node.operation$.next(o);
            }else{
                // no more order to process
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

        nodes = nodes.filter(x => (pExclude.indexOf(x.getUID())==-1));
        //console.log(`[${this.engine.isSlaveNode()?'SLAVE':'MASTER'}] KILL NODES : \n`,nodes.map(x => `\t${(new Date(x.startedAt)).toUTCString()}\t${x.getUID()}`).join('\n'));

        if(pLatest && nodes.length>0){
            nodes = [nodes[0]];
        }

        console.log(`[${this.engine.isSlaveNode()?'SLAVE':'MASTER'}] KILL LAST NODES ON CONFLICTING PORT : \n`,nodes.map(x => `\t${(new Date(x.startedAt)).toUTCString()}\t${x.getUID()}`).join('\n'));


        switch (pSignal){
            case 'SIGINT':
                // controlled kill => kill children
                for(let i=0; i<nodes.length; i++){
                    try{
                        if(nodes[i].running){
                            nodes[i].kill();
                        }
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

            //console.log(pNode.getUID(),up,pNode.state);
            if(up===false){
                if([NodeState.QUEUED,NodeState.NEW].indexOf(pNode.state)==-1){
                    pNode.stopped(this.engine);
                }
            }else if(up===null) {
                // check/flush
                const createdDelay = ((new Date()).getTime()-pNode.createdAt)/(3600*1000)
                //console.log("Created since : ", createdDelay+" hours");
                const startDelay = ((new Date()).getTime()-pNode.startedAt)/(3600*1000);
                //console.log("Started since : ", (pNode.startedAt>-1 ? startDelay+" hours" : pNode.startedAt));

                if([NodeState.QUEUED,NodeState.NEW].indexOf(pNode.state)==-1
                    || (pNode.createdAt>-1 && createdDelay > 24)
                    || (pNode.startedAt>-1 && startDelay > 24)
                ) {
                    // mark node as stopped and flush data for node running for more than 24 hours
                    pNode.stopped(this.engine);
                }
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

        return nodes.sort((a,b)=>{
            if(a.startedAt==-1 || a.startedAt <= b.startedAt){
                return 1;
            }else {
                return -1;
            }
        })
    }

    enableSelfRegistration(pEnable:boolean):void {
        this.selfRegistration = pEnable;
    }

    setSelfRegKey(pKeyPath:string):void {
        this.selfRegSecret = pKeyPath;
    }

    /**
     * To get the name of the registration key
     *
     * @returns {string} key name
     * @method
     */
    getRegistrationKeyName():string {
        return (process.env.DXC_NODE_RKNAME!=null ?process.env.DXC_NODE_RKNAME : EngineNodeManager.DEFAULT_REG_KEY_NAME);
    }

    getRegistrationKeyPath() {
        let path:string = this.selfRegSecret;

        // path env override params
        if(process.env.DXC_NODE_REG_KEY){
            path = process.env.DXC_NODE_REG_KEY;
        }

        // check if file exists
        if(!_fs_.existsSync(path)) {
            throw EngineNodeException.REGISTRATION_SECRET_UNDEFINED();
        }

        return path;
    }

    getRegistrationKey():string {
        let path:string = this.getRegistrationKeyPath();

        // retrieve hash
        let ctn = _fs_.readFileSync(path).toString('hex');
        if(ctn[ctn.length-1]=="\n"){
            return ctn.slice(0,ctn.length-1);
        }else{
            return ctn;
        }
    }

    private async _validateRegistrationKey(pKey:Buffer):Promise<void> {

        // retrieve hash
        const hash = CryptoUtils.sha256(this.getRegistrationKey(),'hex', true);

        // hash key
        const given = CryptoUtils.sha256(pKey.toString(),'hex', true);

        if(!CryptoUtils.stringEqual(hash,given)){
            throw EngineNodeException.WRONG_REGISTRATION_KEY()
        }
    }

    private async _getNextNode():Promise<Nullable<EngineNode>> {
        let nodes = await this.getNodes({
            state: NodeState.QUEUED,
            selfReg: true,
            createdAt: { $gt: (new Date()).getTime()-(3600*1000*24) }
        });

        nodes = nodes.sort((a,b)=>{
            return (a.createdAt>b.createdAt)? -1 : 1;
        });

        //nodes.map(x => console.log(x.getUID()+" "+x.createdAt));


        if(nodes.length>0){
            return nodes[0]
        }else {
            return null;
        }
    }
    /**
     * To register a new node and attribute a node UUID to it
     *
     * @param {string} pKey Registration key
     */
    async registerNode(pKey:Buffer, pHostname:string, pOptions:any):Promise<EngineNodeUUID> {

        Logger.info(`[NODE MGR][REGISTER] Start registration of [host=${pHostname}]`);
        // authenticate node
        await this._validateRegistrationKey(pKey);
        Logger.success(`[NODE MGR][REGISTER][host=${pHostname}] Registration key verified`);

        // get node from queued node request
        let nextNode = await  this._getNextNode();

        // if the queue is empty kill the fresh node
        if(nextNode==null){
            // kill;
            nextNode = await this.createFreeNode();
            //return;
        }
        await nextNode.setEngine(this.engine);


        // assign remote slave to node
        nextNode.setHostname(pHostname, true);

        nextNode.startedAt = (new Date()).getTime();

        if(pOptions.http){
            nextNode.setHttpPort(pOptions.http, true);
        }else{
            nextNode.setHttpPort(parseInt(process.env.DXP_SLAVE_HTTP_PORT), true);
        }

        if(pOptions.https){
            nextNode.setHttpsPort(pOptions.https, true);
        }else{
            nextNode.setHttpPort(parseInt(process.env.DXP_SLAVE_HTTPS_PORT), true);
        }

        // save node state
        await nextNode.saveInternalState();

        // retrieve the next operation from waiting queue
        //const order = await nextNode.nextWaitingOpe();

        // send order to slave node

        nextNode.nodeState$.subscribe((vEvent:StateChangeEvent    )=>{
            (async ()=>{ await this.onNodeStateChanged(vEvent); })();
        });

        // change state
        nextNode.setState(NodeState.REGISTERED);
        
        return nextNode.getUID();
    }

    /**
     * To count running node
     */
    async countRunningNode():Promise<number> {
        return (await this.getNodes({ running: true })).length;
    }
}