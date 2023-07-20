
import {MessagePort, MessageChannel} from "worker_threads";

import {Scan} from "./Scan.js";
import {AssuranceScanner} from "./AssuranceScanner.js";


export class RunningScan {

    scan: Scan;

    scanner: AssuranceScanner;
    private _port1:MessagePort;
    private _port2:MessagePort;



    constructor( pScan:Scan) {

    }

    suspend():void {

    }

    resume():void {

    }

    start():void {
        const { port1, port2 } = new MessageChannel();
        this._port1 = port1;
        this._port2 = port1;
    }
}