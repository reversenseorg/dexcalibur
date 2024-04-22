import {WorkerInfo} from "../core/Job.js";
import {WorkerEnvData, WorkerUtils} from "../core/WorkerUtils.js";
import Util from "../Utils.js";
import DexcaliburProject from "../DexcaliburProject.js";


export class SaveScheduler {

    static saveThreadCTR = 0;
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
    static async saveWorker(pConnSettings:WorkerEnvData<any>):Promise<WorkerInfo> {

        const threadID = 'save-worker-'+(SaveScheduler.saveThreadCTR++);
        const worker = await WorkerUtils._newWorker(
            'nodeSave',
            Util.__dirname(import.meta.url),
            'nodeSave', [
                {
                    uid: 'worker:info',
                    data: {
                        threadID: threadID
                    }
                },pConnSettings
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
    static async queueScheduler(pPoolSize:number, pProject:DexcaliburProject, pJob:any, pDelay:number):Promise<WorkerInfo> {


        const threadID = 'save-scheduler-'+(SaveScheduler.schedulerCTR++);

        //Logger.info("[SaveWorkerFactory] [queueScheduler] ["+threadID+"] start [file to scan="+pFiles.length+"]");
        const worker = await WorkerUtils._newWorker(
            'scheduler',
            Util.__dirname(import.meta.url),
            'scheduler', [
                {
                    uid:'scheduler:data',
                    data: {
                        pool_size: pPoolSize,
                        command: 'init',
                        threadID: threadID,
                        delay: pDelay
                    }
                },{
                    uid:'scheduler:dbconn',
                    data: {
                        projectUID: pProject.getUID(),
                        options: pProject.getProjectDB().getDb().conn.options,
                        dbname: pProject.dbName
                    }
                }
            ]);

        worker.on('message',(vMsg)=>{
            pJob.call(null, vMsg);
        });

        worker.on('close',(vMsg)=>{

            console.log("[SaveWorkerFactory] [queueScheduler] close ");
        });

        return {
            name: threadID,
            worker: worker
        };
    }

}