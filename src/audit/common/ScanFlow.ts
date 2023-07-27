import {ScanScheduler} from "./ScanScheduler.js";
import AssuranceModel from "./AssuranceModel.js";
import {UserAccount} from "../../user/UserAccount.js";
import {AssuranceScanner} from "./AssuranceScanner.js";
import {CoreDebug} from "../../core/CoreDebug.js";

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

    scheduler:ScanScheduler;

    state:ScanFlowState = {
        startDate: -1,
        endDate: -1,
        success: false,
        lastStatus: "",
        progress: -1,
        cost: 0
    };

    scanner:AssuranceScanner|null = null;

    constructor(pScheduler:ScanScheduler) {
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
}