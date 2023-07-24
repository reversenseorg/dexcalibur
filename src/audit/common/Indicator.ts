import { Metric } from "./Metric.js";
import {CoreDebug} from "../../core/CoreDebug.js";


export interface IndicatorOptions {
    name?:string;
    description?:string;
    metric?:Metric;
    events?:any[];
    view?:any;
    enable?:boolean;
}
/**
 * Represent a metric + data in a dashboard
 */
export class Indicator {


    name:string = "";

    description:string = "";

    metric: Metric = null;

    events: any[] = [];

    view: string = "";

    enable = false;

    constructor(pConfig:IndicatorOptions) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }


    toJsonObject(pConfig:any = {}):any {
        const o:any = {};

        o.name = this.name;
        o.description = this.description;
        o.events = [];
        o.metric = null;
        o.enable = this.enable;
        if(this.metric!=null) o.metric = this.metric.name;

        CoreDebug.checkJsonSerialize(o, "Indicator");
        return o;
    }
}