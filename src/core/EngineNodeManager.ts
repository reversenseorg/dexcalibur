import DexcaliburEngine from "../DexcaliburEngine.js";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";


export interface RemoteEngineMapping {
    [uid:string] :IDexcaliburEngine
}


export interface ProjectNodeMapping {
    [uid:string] :IDexcaliburEngine
}


/**
 * A map where every active project are mapped to
 * sessionIDs of users who opened the project
 *
 */
export interface SessionProjectMapping {
    [projectUID:string] :string[];
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



    constructor(pMasterEngine:DexcaliburEngine) {

    }
}