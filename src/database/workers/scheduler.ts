
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

import {getEnvironmentData, parentPort, Worker} from "node:worker_threads";
import {Subject} from "rxjs";
import {JobMessage, WorkerInfo} from "../../core/Job.js";
import {SaveScheduler} from "../SaveScheduler.js";
import {NodeSchema} from "../../NodeSchema.js";


NodeSchema.init();

// retrieve config
const schedulerPpts = JSON.parse(getEnvironmentData('scheduler:data') as string) as any; // SchedulerPpts;
const schedulerDb = JSON.parse(getEnvironmentData('scheduler:dbconn') as string) as any; // SchedulerPpts;

// init
const pool:Record<string,Worker> = {};
const freeWorker:string[] = [];
const queue:Subject<any> = new Subject<any>();
let endDetection:number=0;
let objProcessed:number=0;
let objSuccess:number=0;
let wkInfo:WorkerInfo;

// create wrapper to redirect log message to parent process
function LOG(pText:string){
    parentPort.postMessage({ cmd:"log",success:true, data:pText, threadID:schedulerPpts.threadID });
}

function ERROR(pText:string){
    parentPort.postMessage({ cmd:"log", success:false, data:pText, threadID:schedulerPpts.threadID  });
}


function workerMessageListener( pMsg:any){

    if(pMsg.cmd!="save"){
        parentPort.postMessage(pMsg);
        return;
    }

    objProcessed++;

    if(pMsg.success){
        objSuccess++;
    }

    // reset end detection counter
    endDetection = 0;

    // forward result to scheduler
    parentPort.postMessage(pMsg);

    // free thread
    freeWorker.push(pMsg.threadID)
    //LOG("[THREAD] Free "+pMsg.threadID);

    // try to detect end
   /* if((freeWorker.length==schedulerPpts.pool_size) && (objProcessed==schedulerPpts.files.length) ){
        endDetection = (new Date()).getTime();
        setTimeout(()=>{
            if( (new Date()).getTime() - endDetection > (schedulerPpts.delay*1.5) ){
                LOG("[THREAD]["+objSuccess+" success / "+objProcessed+" objects] Queue has been fully processed ");
                parentPort.postMessage({
                    cmd: "complete",
                    threadID: schedulerPpts.threadID,
                    data: null
                })
                process.exit(0);
            }else{
                LOG("[THREAD] endDetection started but not reached");
            }
        }, schedulerPpts.delay*2);
    }*/
}


// configure job
queue.subscribe((vNode:any)=>{
    if(freeWorker.length>0){
        const threadID = freeWorker.pop();

        //LOG("[THREAD] Schedule "+threadID);
        pool[threadID].postMessage({
            cmd: "save",
            data: {
                node: vNode
            },
            threadID: threadID
        });


    }else{
        // delay & repost
        setTimeout(()=>{ queue.next(vNode) }, schedulerPpts.delay);
    }
});

// setup
for(let i=0; i<schedulerPpts.pool_size; i++){

    try{
        // @ts-ignore
        wkInfo = await SaveScheduler.saveWorker(schedulerDb);
        wkInfo.worker.on("message", (msg)=>{
            // response (at least updated success + object ID)
            workerMessageListener(msg);
        });
        pool[wkInfo.name] = wkInfo.worker;
        freeWorker.push(wkInfo.name);
    }catch(err){
        ERROR(err.message+"\n"+err.stack);
    }
}

parentPort.on("message", (vMsg:JobMessage)=>{
    if(vMsg.cmd=="save"){
        queue.next(vMsg.data);
    }
})



