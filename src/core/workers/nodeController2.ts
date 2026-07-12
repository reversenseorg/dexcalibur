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


