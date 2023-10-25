import * as _vm_ from "vm"

import {ScanSchedulerProject} from "./ScanSchedulerProject.js";
import AssuranceModel from "./AssuranceModel.js";
import {UserAccount} from "../../user/UserAccount.js";
import {AssuranceScanner} from "./AssuranceScanner.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {isMainThread, MessageChannel, parentPort, Worker, moveMessagePortToContext} from "worker_threads";
import Util from "../../Utils.js";

export interface ScanFlowState {
    startDate: number,
    endDate:number,
    success: boolean,
    lastStatus: string,
    progress: number,
    model?: AssuranceModel,
    user?: UserAccount,
    cost: number
}

export class ScanFlow {

    scheduler:ScanSchedulerProject;

    state:ScanFlowState = {
        startDate: -1,
        endDate: -1,
        success: false,
        lastStatus: "",
        progress: -1,
        cost: 0
    };

    scanner:AssuranceScanner|null = null;

    constructor(pScheduler:ScanSchedulerProject|null) {
        this.scheduler = pScheduler;
    }

    getState():ScanFlowState {
        return this.state;
    }

    setScanner(pScanner: AssuranceScanner) {
        this.scanner = pScanner;
    }

    start():void {
        this.state.startDate = new Date().getTime();
        this.state.progress = 1;

        if(isMainThread){

            const subContext = _vm_.createContext({
                __flow:this,
                __scheduler: this.scheduler,
                __scanner: this.scanner,
                __state: this.state
            });

            const worker = new Worker(`
                const { parentPort } = require('node:worker_threads');
                
                console.log("CALL FROM WORKER VM");
              
                parentPort.once('message', (value)=>{
                
                    console.log("CALL FROM WORKER VM LISTENER");
                
                    try{
                        __flow.startScan();
                        value.managedPort.postMessage(JSON.stringify({msg:'Scan DONE', report: __flow.scanner.getReport().toJsonObject()}));
                    }catch(err){
                        value.managedPort.postMessage('Scan ERROR : '+err.message);
                    }
                });
                
                `,{
                eval:true,
                workerData: {
                    __flow:this
                }
            });
            const subChannel = new MessageChannel();

            // @ts-ignore
            //const contextifiedPort = moveMessagePortToContext(subChannel.port1, subContext);
            worker.postMessage({ managedPort: contextifiedPort }, [contextifiedPort]);


            subChannel.port2.on('message', (value)=>{
                console.log("receipt msg from contextifiedPort : "+JSON.stringify(value));
            });
        }else{

            console.log("CALL FROM WORKER (SHOULD NOT BE CALLED).");
            parentPort.once('message', (value)=>{
                value.managedPort.postMessage('test');

                (async ()=>{ await this.scanner.run(this.scheduler.getProject(), {}); });
                value.managedPort.close();
            });
        }
    }

    async startScan():Promise<void> {
        return await this.scanner.run(this.scheduler.getProject(), {});
    }

    toJsonObject():any {
        let o:any = {
            startDate: this.state.startDate,
            endDate:this.state.endDate,
            success: this.state.success,
            lastStatus: this.state.lastStatus,
            progress: this.state.progress,
            model: (this.state.model!=null? this.state.model.getID() : null),
            user: (this.state.user!=null? this.state.user.getUID() : null),
            cost: this.state.cost
        };

        CoreDebug.checkJsonSerialize(o, "ScanFlow");
        return o;
    }

    static fromJsonObject(pObject:any):ScanFlow {
        const sf = new ScanFlow(null);
        sf.state = pObject;
        return sf;
    }
}