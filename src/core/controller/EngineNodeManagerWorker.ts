import {Nullable} from "../IStringIndex.js";
import {getEnvironmentData, isMainThread, setEnvironmentData, Worker} from "node:worker_threads";
import * as _path_ from "path";
import * as _fs_ from "node:fs";
import Util from "../../Utils.js";
import {BinwalkHelper} from "../../BinwalkHelper.js";

import * as Log from '../../Logger.js';
import {WorkerInfo} from "../Job.js";
import DexcaliburEngine, {DexcaliburEngineOptions} from "../../DexcaliburEngine.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export interface SchedulerPpts {
    backend_path: string,
    backend_type: string,
    pool_size: number,
    command: string,
    files: string[],
    threadID:string,
    delay: number
}

export interface BackendPpts {
    backend_path: string,
    threadID:string,
    engineOpts: DexcaliburEngineOptions,
    /**
     * Millisecon between each checks
     * @type {number}
     */
    interval: number
}
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


export class EngineNodeManagerWorker {

    static ctrlCTR = 0;

    worker:Worker;
    name:string;

    constructor(pName:string, pWorker:Worker) {
        this.name = pName;
        this.worker = pWorker;
    }

    /**
     * To send a command to emulated device
     *
     * @param {string} pCommand Command to execute
     * @return {Promise<Worker>} Worker spawned
     * @static
     * @method
     * @async
     */
    static async newNodeController( pEngine:DexcaliburEngine, pJob:any, pDelay:number ):Promise<EngineNodeManagerWorker> {

        const threadID = 'node-controller-'+(EngineNodeManagerWorker.ctrlCTR++);
        const worker = await EngineNodeManagerWorker._newWorker(
            'nodeController',
            'nodeController', [
                {
                    uid: 'backend:info',
                    data: {
                        engineOpts: pEngine.getOptions(),
                        interval: pDelay,
                        threadID: threadID
                    }
                }
            ]);


        worker.on('message',(vMsg)=>{
            pJob.call(null, vMsg);
        });

        worker.on('close',(vMsg)=>{

            Logger.info("[EngineNodeManagerWorker] [queueScheduler] close ");
        });


        return new EngineNodeManagerWorker(threadID,worker);
    }

    /**
     * To prepare shared data and start a worker.
     *
     * The name of the worker
     *
     * @param pName
     * @param pEnvData
     */
    static async _newWorker(pCommand:string, pFilename:Nullable<string> = null, pEnvData:WorkerEnvData[] = []):Promise<Worker> {

        if(pEnvData!=null && Array.isArray(pEnvData)){
            pEnvData.map((vInfo:WorkerEnvData)=>{
                setEnvironmentData(
                    vInfo.uid,
                    JSON.stringify(vInfo.data)
                );
            })
        }

        setEnvironmentData(
            'core:info',
            JSON.stringify({
                command: pCommand
            })
        );

        const workerName = pFilename!=null ? pFilename : pCommand;
        const workerPath = _path_.join(Util.__dirname(import.meta.url),'..','workers',workerName+'.js');

        if(!_fs_.existsSync(workerPath)){
            throw new Error("Worker ["+workerPath+"] not exists.");
        }
        // from main thread, set worker context
        const worker = new Worker(workerPath);

        worker.on('exit',(err)=>{
            if(isMainThread){
                console.log(`Main Thread [worker=${workerName}][cmd=${pCommand}] exited. Code : ${err}`);
            }
        });

        /*
        worker.on('online',()=>{
            if(isMainThread){
                console.log(`Main Thread [worker=${workerName}][cmd=${pCommand}] is online`);
            }
        });*/

        return worker;
    }

    async stop():Promise<void> {
        this.worker.postMessage({
            cmd: 'exit'
        })
    }

    async start():Promise<void> {
        this.worker.postMessage({
            cmd: 'start'
        })
    }
}