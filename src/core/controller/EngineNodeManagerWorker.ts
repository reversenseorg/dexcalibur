import {Nullable} from "../IStringIndex.js";
import {isMainThread, setEnvironmentData, Worker} from "node:worker_threads";
import * as _path_ from "path";
import * as _fs_ from "node:fs";
import Util from "../../Utils.js";

import * as Log from '../../Logger.js';
import DexcaliburEngine, {DexcaliburEngineOptions} from "../../DexcaliburEngine.js";
import {DexcaliburEngineMode} from "../../DexcaliburEngineMode.js";

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
    static newNodeController( pEngine:DexcaliburEngine, pJob:any, pDelay:number ):EngineNodeManagerWorker {

        const opts = pEngine.getOptions();
        opts.engine_mode = DexcaliburEngineMode.CONTROLLER;

        const threadID = 'node-controller-'+(EngineNodeManagerWorker.ctrlCTR++);
        const worker =  EngineNodeManagerWorker._newWorker(
            'nodeController',
            'nodeController', [
                {
                    uid: 'backend:info',
                    data: {
                        engineOpts: opts,
                        interval: pDelay,
                        threadID: threadID
                    }
                }
            ]);


        const enm = new EngineNodeManagerWorker(threadID,worker);


        worker.on('message',(vMsg)=>{
            if(vMsg.cmd==='start' && vMsg.success){
                enm.startPeriodicRefresh(10000)
            }
            pJob.call(null, vMsg);
        });

        worker.on('close',(vMsg)=>{

            Logger.info("[EngineNodeManagerWorker] [queueScheduler] close ");
        });

        //worker.unref();

        return enm;
    }



    /**
     * To prepare shared data and start a worker.
     *
     * The name of the worker
     *
     * @param pName
     * @param pEnvData
     */
    static  _newWorker(pCommand:string, pFilename:Nullable<string> = null, pEnvData:WorkerEnvData[] = []):Worker {

        const data:Record<string, any> = {};

        if(pEnvData!=null && Array.isArray(pEnvData)){
            pEnvData.map((vInfo:WorkerEnvData)=>{
                data[vInfo.uid] = vInfo.data;
                /*
                setEnvironmentData(
                    vInfo.uid,
                    JSON.stringify(vInfo.data)
                );*/
            })
        }

        data['core:info'] = {
            command: pCommand
        };
        /*
        setEnvironmentData(
            'core:info',
            JSON.stringify({
                command: pCommand
            })
        );*/

        const workerName = pFilename!=null ? pFilename : pCommand;
        const workerPath = _path_.join(Util.__dirname(import.meta.url),'..','workers',workerName+'.js');

        if(!_fs_.existsSync(workerPath)){
            throw new Error("Worker ["+workerPath+"] not exists.");
        }
        // from main thread, set worker context
        const worker = new Worker(workerPath, {
            workerData: data,
            stdin: false,
            stdout: false,
            stderr: false,
            resourceLimits: {
                maxOldGenerationSizeMb: 1024,
                maxYoungGenerationSizeMb: 1024,
                codeRangeSizeMb: 256,
                stackSizeMb: 200,
            }
        });

        worker.on('exit',(err)=>{
            if(isMainThread){
                console.log(`Main Thread [worker=${workerName}][cmd=${pCommand}] exited. Code : ${err}`);
            }else{
                console.log(`Worker Thread [worker=${workerName}][cmd=${pCommand}] exited. Code : ${err}`);
            }
        });

        worker.on('error',(err)=>{
            console.log(`Node Worker error [worker=${workerName}][cmd=${pCommand}] exited. `,err);
        });

        //worker.on

        /*
        worker.on('online',()=>{
            if(isMainThread){
                console.log(`Main Thread [worker=${workerName}][cmd=${pCommand}] is online`);
            }
        });*/

        return worker;
    }

    stop():void {
        this.worker.postMessage({
            cmd: 'exit'
        })
    }

    start():void {
        this.worker.postMessage({
            cmd: 'start'
        });
    }

    refresh():void {
        this.worker.postMessage({
            cmd: 'refresh'
        });
    }


    startPeriodicRefresh(pDelay = 10000):void {
        setInterval(()=> {
            this.worker.postMessage({
                cmd: 'refresh'
            });
        }, pDelay);
    }
}