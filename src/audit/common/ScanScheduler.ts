import DexcaliburProject from "../../DexcaliburProject.js";
import {ScanFlow} from "./ScanFlow.js";
import {AssuranceScanner} from "./AssuranceScanner.js";

export class ScanScheduler {

    private _ctx:DexcaliburProject;

    private _active:ScanFlow[] = [];
    private _past:ScanFlow[] = [];

    constructor( pProject:DexcaliburProject) {
        this._ctx = pProject;
    }

    newScan(pScanner:AssuranceScanner):ScanFlow {
        const flow = new ScanFlow(this);
        flow.setScanner(pScanner);
        flow.start();

        return flow;
    }
}