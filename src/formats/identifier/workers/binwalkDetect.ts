
import {getEnvironmentData, parentPort} from "node:worker_threads";
import {JobMessage} from "../Job.js";
import {BinwalkRunner} from "../BinwalkRunner.js";
import {BackendPpts} from "../FileFormatDetectorWorker.js";

const backendPpts = JSON.parse(getEnvironmentData('backend:info') as string) as BackendPpts;

let runner:BinwalkRunner = new BinwalkRunner(backendPpts.backend_path);

runner.setMessagePort(parentPort, backendPpts.threadID);

parentPort.on("message",(vMsg:JobMessage)=>{

    switch (vMsg.cmd){
        case "stop":
            process.exit(0);
            break;
        case "exec":
            try{
                const fmt = runner.analyze(vMsg.data);
                parentPort.postMessage({
                    success: true,
                    cmd: vMsg.cmd,
                    threadID: backendPpts.threadID,
                    data: {
                        file: vMsg.data,
                        fmt: fmt
                    }
                });
            }catch(err){
                parentPort.postMessage({
                    success: false,
                    cmd: vMsg.cmd,
                    threadID: backendPpts.threadID,
                    err: err.message+"\n"+err.stack,
                    data: {
                        file: vMsg.data,
                        fmt: null
                    }
                });
            }
            break;
    }
});

