console.log("RUN nodeCOntroller");
import * as Log from '../../Logger.js';

let Logger:Log.Logger = Log.newLogger({ quiet:true }) as Log.Logger;
import {getEnvironmentData, parentPort} from "node:worker_threads";
import {JobMessage} from "../Job.js";
import {BackendPpts} from "../controller/EngineNodeManagerWorker.js";
import {EngineNodeControllerRunner} from "../controller/EngineNodeControllerRunner.js";

const backendPpts = JSON.parse(getEnvironmentData('backend:info') as string) as BackendPpts;

let runner:EngineNodeControllerRunner = new EngineNodeControllerRunner(backendPpts.engineOpts);

runner.setMessagePort(parentPort, backendPpts.threadID);

let intervalID = null;

parentPort.on("message",(vMsg:JobMessage)=>{

    switch (vMsg.cmd){
        case "stop":
            process.exit(0);
            break;
        case "start":
            console.log("THREAD RECEIPT MSG : ",vMsg);
            (async ()=>{
                await runner.start();
                setInterval(()=>{
                    runner.refreshPool().then((vChanges)=>{
                        /*arentPort.postMessage({
                            success: true,
                            cmd: vMsg.cmd,
                            threadID: backendPpts.threadID,
                            data: vChanges
                        });*/
                    });
                }, backendPpts.interval )
            })();

            break;
    }
});

