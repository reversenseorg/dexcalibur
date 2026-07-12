
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