import {Nullable} from "../../core/IStringIndex.js";
import {getEnvironmentData, isMainThread, setEnvironmentData, Worker} from "node:worker_threads";
import * as _os_ from "os";
import * as _path_ from "path";
import * as _glob_ from "glob";
import * as _fs_ from "node:fs";
import Util from "../../Utils.js";
import ModelFile from "../../ModelFile.js";
import ShellHelper from "../../ShellHelper.js";
import {BinwalkHelper} from "../../BinwalkHelper.js";
import DexcaliburProject from "../../DexcaliburProject.js";

import * as Log from '../../Logger.js';
import {WorkerInfo} from "./Job.js";
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
    threadID:string
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


export class FileFormatDetectorWorker {

    static binwalkCTR = 0;
    static schedulerCTR = 0;

    /**
     * To send a command to emulated device
     *
     * @param {string} pCommand Command to execute
     * @return {Promise<Worker>} Worker spawned
     * @static
     * @method
     * @async
     */
    static async binwalkDetector(pBinaryPath:string):Promise<WorkerInfo> {

        const threadID = 'binwalk-'+(FileFormatDetectorWorker.binwalkCTR++);
        const worker = await FileFormatDetectorWorker._newWorker(
            'binwalkDetect',
            'binwalkDetect', [
                {
                    uid: 'backend:info',
                    data: {
                        backend_path: pBinaryPath,
                        threadID: threadID
                    }
                }
            ]);

        return {
            name: threadID,
            worker: worker
        };
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
    static async queueScheduler(pPoolSize:number, pFiles:string[], pJob:any, pDelay:number, pBackendPath:Nullable<string> = null):Promise<Worker> {


        const threadID = 'fmt-scheduler-'+(FileFormatDetectorWorker.schedulerCTR++);
        const backendPath = (pBackendPath!=null)? pBackendPath : BinwalkHelper.getExtPath("binwalk");

        Logger.info("[FileFormatDetectorWorker] [queueScheduler] ["+threadID+"] start [file to scan="+pFiles.length+"]");
        const worker = await FileFormatDetectorWorker._newWorker(
            'scheduler',
            'scheduler', [
                {
                    uid:'scheduler:data',
                    data: {
                        backend_path: backendPath,
                        backend_type: 'binwalk',
                        pool_size: pPoolSize,
                        command: 'detect',
                        files: pFiles,
                        threadID: threadID,
                        delay: pDelay
                    }
                }
            ]);

        worker.on('message',(vMsg)=>{
            pJob.call(null, vMsg);
        });

        worker.on('close',(vMsg)=>{

            Logger.info("[FileFormatDetectorWorker] [queueScheduler] close ");
        });

        return worker;
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
        const workerPath = _path_.join(Util.__dirname(import.meta.url),'workers',workerName+'.js');

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
}