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

import {isMainThread} from "worker_threads";
import {ModelFileOptions} from "../ModelFile.js";
import Util from "../Utils.js";
import * as _path_ from "path";
import {EOL} from "os";
import ModelFileSection from "../ModelFileSection.js";
import {ProjectDatabase} from "./ProjectDatabase.js";
import {MongodbAdapter} from "@dexcalibur/dexcalibur-orm-mongodb";
import {AppContextType} from "@dexcalibur/dexcalibur-orm";

export interface SaveResult {
    success:boolean;
    documentID?:string;
}

export class SaveRunner {


    projectDB:ProjectDatabase;

    /**
     *
     */
    duration:number = -1;

    parentPort:any = null;

    threadID:string = "";

    opts:any; //MongodbConnectorOptions;

    constructor(pThreadID:string, pConnSettings:any /*MongodbConnectorOptions*/) {
        this.threadID = pThreadID;
        this.opts = pConnSettings;
    }

    /**
     *
     */
    async connectToPDB(pDbName:string):Promise<boolean>{
        const adapter = new MongodbAdapter({
            _type: AppContextType.WEB_SERVER
        }, this.opts);

        const db = await adapter.asyncConnect(null, pDbName);
        db.open(pDbName);
        this.log("Connected to project DB ");

        this.projectDB = new ProjectDatabase(db);
        this.projectDB.name = pDbName;
        await this.projectDB.init();

        return true;
    }

    setMessagePort(pMsgPort:any, pThreadID:string){
        this.parentPort = pMsgPort;
        this.threadID = pThreadID;
    }

    log(pText:any):void {

        if(!isMainThread){
            if(this.parentPort==null) return;
            this.parentPort.postMessage({
                cmd: "log",
                data: pText,
                threadID: this.threadID
            });
        }else{
            console.log(pText);
        }

    }

    error(pText:any):void {
        if(!isMainThread){
            if(this.parentPort==null) return;
            this.parentPort.postMessage({
                cmd: "log",
                data: "",
                err: pText,
                threadID: this.threadID
            });
        }else{
            console.log(pText);
        }
    }

    /**
     *
     * @param pPath
     * @param pOptions
     */
    async save( pNode:any, pOptions:any = {}):Promise<SaveResult>{


        const result:SaveResult = {
            success: false
        };

        /*
        let o:any;
        try{
            o = await this.projectDB.saveOOB(pNode);
            result.documentID = o._id;
            result.success = true;
            this.log("[PROJECT SAVE RUNNER] Success : "+pNode.__);
        }catch(err){
            this.error("[RPOJECT SAVE RUNNER] Failed to save object \n"+err.message);
        }*/
        return result;
    }



}