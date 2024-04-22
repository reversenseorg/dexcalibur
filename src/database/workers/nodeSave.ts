
import {getEnvironmentData} from "node:worker_threads";
import {parentPort} from "worker_threads";
import {JobMessage} from "../../core/Job.js";
import {SaveRunner} from "../SaveRunner.js";
import {NodeSchema} from "../../NodeSchema.js";

NodeSchema.init();

const info = JSON.parse(getEnvironmentData('project:info') as string);
const connSettings = JSON.parse(getEnvironmentData('scheduler:dbconn') as string);
//const pdb = new ProjectDatabase();

// create wrapper to redirect log message to parent process
function LOG(pText:string){
    parentPort.postMessage({ cmd:"log",success:true, data:pText, threadID:info.threadID });
}

function ERROR(pText:string){
    parentPort.postMessage({ cmd:"log", success:false, data:pText, threadID:info.threadID  });
}

const runner = new SaveRunner(info.threadID, connSettings.options);

(runner.connectToPDB(connSettings.dbName)).then(()=>{
    parentPort.on("message", (vMessage:JobMessage)=>{
        try{
            LOG("[OOB SAVE] Saving  :"+vMessage.data);
            (runner.save(vMessage.data)).then((vResult)=>{
                LOG("[OOB SAVE] Save success")
                parentPort.postMessage({
                    cmd:"save",
                    success: vResult.success,
                    data: vResult,
                    threadID: info.threadID
                });
            })
        }catch(e){
            ERROR(e.message);
        }
    });
},(err)=>{
    ERROR("[OOB SAVE]  Connection failed : "+err.message);
}).catch((err)=>{
    ERROR(err.message);
})


