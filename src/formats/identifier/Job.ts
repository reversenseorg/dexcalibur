import {Worker} from "node:worker_threads";


export interface JobMessage {
    cmd: "stop" | "exec" | "start",
    data: any,
    threadID:string;
}

export interface JobWorkerMessage {
    cmd: string,
    data: any,
    err?:string,
    success:boolean,
    threadID:string
}



export interface WorkerInfo {
    worker:Worker,
    name:string
}
