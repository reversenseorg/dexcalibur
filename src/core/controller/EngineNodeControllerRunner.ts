

import * as Log from '../../Logger.js';
import DexcaliburEngine, {DexcaliburEngineOptions} from "../../DexcaliburEngine.js";
import {Settings} from "../../Settings.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * Represent data to inject into worker environment
 *
 * @interface
 */
export interface WorkerEnvData {
    /**
     * Name of the data injected into worker env
     *
     * @type {string}
     */
    uid:string,
    /**
     * Must be serializable as JSON
     * Not support cyclic refs, and so
     *
     * @type {any}
     */
    data:any
}


export class EngineNodeControllerRunner {

    parentPort: any;

    threadID: string;

    private _engine:DexcaliburEngine;

    constructor(pOpts:DexcaliburEngineOptions) {
        this._engine = DexcaliburEngine.getInstance(pOpts);

    }

    setMessagePort(pMsgPort:any, pThreadID:string){
        this.parentPort = pMsgPort;
        this.threadID = pThreadID;
    }

    /**
     *
     */
    async start():Promise<any> {
        await this._engine.loadConfiguration( Settings.GlobalSettings.load());
        await this._engine.boot(false, "", true);
        //console.log("started");
    }

    async refreshPool():Promise<any>{
        await this._engine.getNodeManager().refreshPool();
    }
}