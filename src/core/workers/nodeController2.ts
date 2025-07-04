import {workerData} from "worker_threads";

console.log("RUN nodeCOntroller");
import {BackendPpts} from "../controller/EngineNodeManagerWorker.js";
import {getEnvironmentData, markAsUntransferable, parentPort} from "node:worker_threads";
import {JobMessage} from "../Job.js";
import {EngineNodeControllerRunner} from "../controller/EngineNodeControllerRunner.js";

let backendPpts:any;

try{
    //backendPpts= JSON.parse(getEnvironmentData('backend:info') as string) as BackendPpts;
    backendPpts = workerData['backend:info'];


    console.log(backendPpts);
    let runner:EngineNodeControllerRunner = new EngineNodeControllerRunner(backendPpts.engineOpts);

    runner.setMessagePort(parentPort, backendPpts.threadID);


    /*setInterval(()=>{
         runner.refreshPool().then(()=>{
             console.log("REFRESHED NODE POOL");
         }).catch(()=>{
             console.error("CANNOT REFRESH NODE POOL");
         });
     }, 10000 /* backendPpts.interval ) */

    parentPort.on("message",(vMsg:JobMessage)=>{
        switch (vMsg.cmd){
            case "stop":
                process.exit(0);
                break;
            case "start":
                console.log(`THREAD RECEIPT MSG (sleep:${backendPpts.interval}): `,vMsg);
                runner.start().then(()=>{
                    console.error("START NODE CONTROLLER");
                    parentPort.postMessage({ success:true, cmd:vMsg.cmd });
                }).catch(()=>{
                    console.error("CANNOT START NODE CONTROLLER");
                    parentPort.postMessage({ success:false, cmd:vMsg.cmd });
                })

                break;
            case "refresh":
                runner.refreshPool().then(()=>{
                    console.log("REFRESHED NODE POOL");
                    parentPort.postMessage({ success:true, cmd:vMsg.cmd });
                }).catch(()=>{
                    console.error("CANNOT REFRESH NODE POOL");
                    parentPort.postMessage({ success:false, cmd:vMsg.cmd });
                });
                break;
            default:
                parentPort.postMessage({ success:false, cmd:vMsg.cmd, msg:"unknown command" });
                break;
        }
    });

}catch(e){
    console.error(e);
    parentPort.postMessage({ success:false, cmd:null, msg:e.msg });
}


