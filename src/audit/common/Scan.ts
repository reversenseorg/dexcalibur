import {Worker, isMainThread, parentPort, workerData } from  "worker_threads";

import DexcaliburProject from "../../DexcaliburProject.js";
import AssuranceReport from "./AssuranceReport.js";
import {AssuranceScanner} from "./AssuranceScanner.js";


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


        return o ;
    }
}