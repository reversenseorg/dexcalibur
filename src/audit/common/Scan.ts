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

import {Worker, isMainThread, parentPort, workerData } from  "worker_threads";

import DexcaliburProject from "../../DexcaliburProject.js";
import AssuranceReport from "./AssuranceReport.js";
import {AssuranceScanner} from "./AssuranceScanner.js";
import {CoreDebug} from "../../core/CoreDebug.js";


export interface ScanOption {
    uid?:string;
    project?:DexcaliburProject;
    scanner?:AssuranceScanner;

    dates?:DateMap;
}

export interface DateMap {
    start: number[];
    stop: number[];
    finish: number | null;
    abort: number | null;
}

export class Scan {

    uid:string;

    project:DexcaliburProject;

    scanner:AssuranceScanner;

    reports:AssuranceReport[];

    sharedData:SharedArrayBuffer = new SharedArrayBuffer(1024*40);

    dates:DateMap;

    constructor( pConfig:ScanOption) {
        if(pConfig.uid) this.uid = pConfig.uid;
        if(pConfig.project) this.project = pConfig.project;
        if(pConfig.scanner) this.scanner = pConfig.scanner;
        if(pConfig.dates) this.dates = pConfig.dates;

    }

    getScanner():AssuranceScanner {
        return this.scanner;
    }

    start():void{
        if(isMainThread){
            this.dates.start.push((new Date()).getTime());
            const worker = new Worker(__filename, {workerData: "hello"});
            worker.on("message", msg => console.log(`Worker message received: ${msg}`));
            worker.on("error", err => console.error(err));
            worker.on("exit", code => console.log(`Worker exited with code ${code}.`));
        }else{

        }

    }

    stop():void{
        this.dates.stop.push((new Date()).getTime());
    }

    abort():void{
        this.dates.abort = (new Date()).getTime();
    }

    finish():void{
        this.dates.finish = (new Date()).getTime();
    }


    /**
     * To unserialize
     *
     * @param pConfig
     */
    static fromJsonObject(pConfig:any) :Scan {
        return new Scan(pConfig);
    }

    /**
     * To prepare an instance to be serialized
     *
     * @return {any}
     */
    toJsonObject():any {
        const o = {
            uid: this.uid,
            project: this.project.uid,
            models: [],
            dates: this.dates
        };

        CoreDebug.checkJsonSerialize(o, "Scan");
        return o ;
    }
}