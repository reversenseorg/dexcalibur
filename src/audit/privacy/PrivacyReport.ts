import { DataFlowInfo } from "../common/DataFlowInfo.js";
import {Finding} from "../common/Finding.js";
import {PrivacyFinding} from "./PrivacyFinding.js";
import {TrackerInfo} from "./TrackerInfo.js";
import {CoreDebug} from "../../core/CoreDebug.js";

export interface PrivacyReportOptions {
    time?:number;
    threats?:PrivacyFinding<TrackerInfo>[];
    pii?:PrivacyFinding<DataFlowInfo<any>>[];
    owner?:any;
}

/**
 * Represent a pricavy report
 */
export class PrivacyReport {

    time:number = -1;

    owner:any = null;

    /**
     * Threats :
     *
     * - trackers
     * - malicious libs
     * - permission abuses
     * - API/SDK abuses
     */
    threats:PrivacyFinding<TrackerInfo>[] = [];

    /**
     * PII related findings :
     * - Data Inputs
     * - Flows
     * - Storage / Communications
     */
    pii:PrivacyFinding<DataFlowInfo<any>>[] = [];
    
    constructor(pOptions:PrivacyReportOptions) {
        for(let i in pOptions){
            this[i] = pOptions[i];
        }

        if(this.time === -1){
            this.time = (new Date()).getTime();
        }
    }

    getThreats():PrivacyFinding<TrackerInfo>[] {
        return this.threats;
    }

    addThreat(pFinding:PrivacyFinding<TrackerInfo>):void{
        this.threats.push(pFinding);
    }

    getPiiFlows():PrivacyFinding<DataFlowInfo<any>>[] {
        return this.pii;
    }

    addPii(pFinding:PrivacyFinding<DataFlowInfo<any>>):void{
        this.pii.push(pFinding);
    }

    toJsonObject():any {
        const o:any = {};

        o.time = this.time;
        o.pii = [];
        o.threats = [];

        this.pii.map(x => o.pii.push(x.toJsonObject()));
        this.threats.map(x => o.threats.push(x.toJsonObject()));
        CoreDebug.checkJsonSerialize(o, "PrivacyReport");
        return o;
    }
}