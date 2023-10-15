import DexcaliburEngine from "../DexcaliburEngine.js";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {IStringIndex} from "./IStringIndex.js";


export interface RemoteEngineMapping {
    [nodeUID:string] :IDexcaliburEngine
}


export interface ProjectNodeMapping {
    [projectUID:string] :IDexcaliburEngine
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
    UNKNOW,
    READY,
    IDDLE,
    BUSY,
    STOPPED,
    STARTING
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



    engine:DexcaliburEngine;

    slaves:RemoteEngineMapping = {};

    projectMapping:ProjectNodeMapping = {};

    sessionMapping:SessionProjectMapping = {}

    states:SlaveStates = {};


    constructor(pMasterEngine:DexcaliburEngine) {

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
        return
    }

    generateSlaveWebhook(pSlave:IDexcaliburEngine):void {
        /*
        const crypto = require('crypto');
        console.log(crypto.randomUUID());
         */
    }

    spawn(pProject:DexcaliburProject, pSettings:any):void {

    }
}