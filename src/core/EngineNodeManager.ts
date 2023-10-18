import {randomUUID} from "crypto";

import DexcaliburEngine from "../DexcaliburEngine.js";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {IStringIndex} from "./IStringIndex.js";
import {EngineNode} from "./EngineNode.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";


export interface RemoteEngineMapping {
    [nodeUID:string] :EngineNode
}


export interface ProjectNodeMapping {
    [projectUID:string] :EngineNode
}

export interface SlaveStates {
    [engineUID:string] :NodeState
}

export interface SlaveCallback {
    uri: string;
    engine: IDexcaliburEngine;
}

/**
 * A map where every active project are mapped to
 * sessionIDs of users who opened the project
 *
 */
export interface SessionProjectMapping {
    [projectUID:string] :string[];
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

    /**
     * UUID of this instance into reversense pod
     *
     * @field
     */
    uuid:string;

    portRange: number[] = [10200,10300];

    portCounter: number = -1;

    engine:DexcaliburEngine;

    slaves:RemoteEngineMapping = {};

    projectMapping:ProjectNodeMapping = {};

    sessionMapping:SessionProjectMapping = {}

    states:SlaveStates = {};


    constructor(pMasterEngine:DexcaliburEngine, pCurrentUID:string) {
        this.uuid = pCurrentUID;
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
    hasReadySlave(pProjectUID:string):boolean{
        const engine = this.projectMapping[pProjectUID];
        if(engine == null){
            return false;
        }


    }

    isStarted(pProjectUID:string):boolean {
        return this.projectMapping[pProjectUID].isStarted();
    }

    generateSlaveWebhook(pSlave:IDexcaliburEngine):void {
        /*
        const crypto = require('crypto');
        console.log(crypto.randomUUID());
         */
    }

    spawn(pProject:DexcaliburProject, pSettings:any):void {

    }


    updateState(pNodeUID:string, pState:NodeState):void {
        const node = this.getNodeByUUID(pNodeUID);
        node.setState(pState);
    }

    /**
     * Create a new node
     *
     * @param pProjectUID
     * @param pTargetOs
     */
    createNode(pProjectUID:string, pTargetOs:string):EngineNode {
        const uuid = randomUUID();
        const node = new EngineNode(uuid, pProjectUID);

        node.setState(NodeState.NEW)
        node.setHttpPort(this.getNextPort());
        node.setHttpsPort(this.getNextPort());

        this.projectMapping[pProjectUID] = this.slaves[uuid] = node;


        return this.slaves[uuid];
    }

    /**
     *
     * @param pNodeUUID
     */
    getNodeByUUID(pNodeUUID:string):EngineNode {
        return this.slaves[pNodeUUID];
    }

    /**
     *
     * @param pProjectUID
     */
    getNodeByProject(pProjectUID:string):EngineNode {
        return this.projectMapping[pProjectUID];
    }

    /**
     *
     * @param pProjectUID
     */
    hasNode(pProjectUID):boolean {
        return (this.projectMapping[pProjectUID]!=null);
    }
}