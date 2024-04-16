
import {getEnvironmentData, parentPort, Worker} from "node:worker_threads";
import {AsyncSubject, from, Subject} from "rxjs";
import {FileFormatDetectorWorker, SchedulerPpts} from "../FileFormatDetectorWorker.js";
import {JobMessage, JobWorkerMessage, WorkerInfo} from "../Job.js";
/*
const poolSize = getEnvironmentData('pool:size') as number;
const cmd = getEnvironmentData('worker:command');
const backendPath = getEnvironmentData('backend:path') as string;
const backendType = getEnvironmentData('backend:type') as string;
const files = getEnvironmentData('files') as string[];
*/
const schedulerPpts = JSON.parse(getEnvironmentData('scheduler:data') as string) as SchedulerPpts;

const pool:Record<string,Worker> = {};
const freeWorker:string[] = [];

const queue:Subject<any> = new Subject<any>();
let wkInfo:WorkerInfo;

function LOG(pText:string){
    parentPort.postMessage({ cmd:"log",success:true, data:pText, threadID:schedulerPpts.threadID });
}

function ERROR(pText:string){
    parentPort.postMessage({ cmd:"log", success:false, data:pText, threadID:schedulerPpts.threadID  });
}

let endDetection:number=0;
let fileProcessed:number=0;
let fileSuccess:number=0;

function binwalkMessageListener( pMsg:JobWorkerMessage){

    if(pMsg.cmd!="exec"){
        parentPort.postMessage(pMsg);
        return;
    }

    fileProcessed++;

    if(pMsg.success){
        fileSuccess++;
    }

    // reset end detection counter
    endDetection = 0;

    // forward result to scheduler
    pMsg.data.backend = 'binwalk';
    parentPort.postMessage(pMsg);

    // free thread
    freeWorker.push(pMsg.threadID)
    //LOG("[THREAD] Free "+pMsg.threadID);

    // try to detect end
    if((freeWorker.length==schedulerPpts.pool_size) && (fileProcessed==schedulerPpts.files.length) ){
        endDetection = (new Date()).getTime();
        setTimeout(()=>{
            if( (new Date()).getTime() - endDetection > (schedulerPpts.delay*1.5) ){
                LOG("[THREAD]["+fileSuccess+" success / "+fileProcessed+" files] Queue has been fully processed ");
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
    }
}


// fill pool
switch (schedulerPpts.backend_type){
    case 'binwalk':

            // configure job
            queue.subscribe((vFile:string)=>{
                if(freeWorker.length>0){
                    const threadID = freeWorker.pop();

                    //LOG("[THREAD] Schedule "+threadID);
                    pool[threadID].postMessage({
                        cmd: "exec",
                        data: vFile,
                        threadID: threadID
                    });


                }else{
                    // delay & repost
                    setTimeout(()=>{ queue.next(vFile) }, schedulerPpts.delay);
                }
            });

            // setup
            for(let i=0; i<schedulerPpts.pool_size; i++){

                try{
                    // @ts-ignore
                    wkInfo = await FileFormatDetectorWorker.binwalkDetector(schedulerPpts.backend_path);
                    wkInfo.worker.on("message", (msg)=>{
                        binwalkMessageListener(msg);
                    });
                    pool[wkInfo.name] = wkInfo.worker;
                    freeWorker.push(wkInfo.name);

                    //LOG("Started FileFormatDetectorWorker.binwalkDetector ["+i+"][path="+schedulerPpts.backend_path+"]");
                }catch(err){
                    ERROR(err.message+"\n"+err.stack);
                }

                if(i==(schedulerPpts.pool_size-1) && freeWorker.length>0){
                    schedulerPpts.files.map(x =>  queue.next(x));
                }
            }


        break;
    default:
        ERROR("backendType unknow : "+schedulerPpts.backend_type);
        break;
}


