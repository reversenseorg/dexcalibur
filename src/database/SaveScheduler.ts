/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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