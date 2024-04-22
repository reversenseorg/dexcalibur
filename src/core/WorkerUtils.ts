
import { isMainThread, setEnvironmentData, Worker} from "node:worker_threads";
import * as _path_ from "path";
import * as _fs_ from "node:fs";
import {Nullable} from "./IStringIndex.js";


/**
 * Represent data to inject into worker environment
 *
 * @interface
 */
export interface WorkerEnvData<T> {
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
    data:T
}


export class WorkerUtils {



    /**
     * To prepare shared data and start a worker.
     *
     * The name of the worker
     *
     * @param pName
     * @param pEnvData
     */
    static async _newWorker(pCommand:string, pDirPath:string, pFilename:Nullable<string> = null, pEnvData:WorkerEnvData<any>[] = []):Promise<Worker> {

        if(pEnvData!=null && Array.isArray(pEnvData)){
            pEnvData.map((vInfo:WorkerEnvData<any>)=>{
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
        const workerPath = _path_.join(pDirPath,'workers',workerName+'.js');

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