import {NodeInternalType} from "../../NodeInternalType.js";
import {INode, Node} from "../../INode.js";
import {Indicator} from "./Indicator.js";


export interface IndicatorsMap {
    [name:string] :Indicator
}

export interface DashBoardOption {
    name?:string;
    indicators?:IndicatorsMap
}
export class DashBoard extends Node {

    __:NodeInternalType = NodeInternalType.DASHBOARD;

    /**
     * Dashboard name
     * @type {string}
     * @field
     */
    name:string;


    indicators:IndicatorsMap = {};


    constructor(pConfig:DashBoardOption) {
        super(pConfig);
    }

    getIndicators():IndicatorsMap {
        return this.indicators;
    }


    getKPI(pName:string):Indicator {
        return this.indicators[pName];
    }

    toJsonObject(pConfig:any = {}):any {
        const o:any = {};

        o.name = this.name;
        o.indicators = {};
        for(const name in this.indicators){
            o.indicators[name] = this.indicators[name].toJsonObject();
        }
        return o;
    }
}