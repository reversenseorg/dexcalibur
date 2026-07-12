
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

