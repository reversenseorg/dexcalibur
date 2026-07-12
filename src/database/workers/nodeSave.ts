
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


