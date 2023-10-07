import DexcaliburEngine from "../DexcaliburEngine.js";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";


export interface RemoteEngineMapping {
    [uid:string] :IDexcaliburEngine
}


/**
 * The aim of this class is to spawn slave node in separate process,
 * mount/configure it, establish secure communication with slave nodes
 * and maintain a routing table of project/node in order to re-route
 * API call from the master to associated slave.
 *
 * An engine instance as a unique Manager instance
 *
 * @class
 */
export class EngineNodeManager {

    engine:DexcaliburEngine;

    slaves:RemoteEngineMapping = {};


    constructor(pMasterEngine:DexcaliburEngine) {

    }
}