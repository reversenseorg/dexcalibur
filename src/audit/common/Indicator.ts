import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import { NodeInternalType } from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "../../core/CoreDebug.js";
import {Metadata} from "./Metadata.js";
import {Nullable} from "../../core/IStringIndex.js";



export enum IndicatorViewType {
    NONDE='none',
    DOUGHNUT='doughnut',
    RADAR='radar',
    CURV='curv',
    PLOT='plot',
    STACKED='stacked_bar',
    PROGRESS='progress'
}

export interface DataSegment {
    value: number;
    label:string;
    color?: string;
    [extra:string]:any;
}

export interface IndicatorOptions {
    uuid?:IndicatorUUID;
    title?:string;
    name?:string;
    description?:string;
    metadata?:any;
    rules?:any[];
    version?:any[];
    view?:any;
    enable?:boolean;
}



export interface KpiRule {
    on:string;
    data: string,
    filter? :any[],
    countNone?:boolean;
    nonePpt?:string;

}

export type IndicatorUUID = string;

/**
 * Represent a metric + data in a dashboard
 *
 * @class
 */
export class Indicator implements INode {

    __ = NodeInternalType.INDICATOR;

    static TYPE:NodeType = (new NodeType( "indicator", NodeInternalType.INDICATOR, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("title")).type(DbDataType.STRING).def(""),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("metadata")).type(DbDataType.STRING).def([]),
        (new NodeProperty("rules")).type(DbDataType.STRING).def([]),
        (new NodeProperty("data")).type(DbDataType.BLOB).def([]),
        (new NodeProperty("view")).type(DbDataType.STRING).def(null),
        (new NodeProperty("enable")).type(DbDataType.BOOLEAN).def(true),
        (new NodeProperty("version")).type(DbDataType.BLOB).def({}),
        //(new NodeProperty("metric")).type(DbDataType.STRING).def({})
    ]));

    uuid:IndicatorUUID = "";
    name:string = "";
    title:string = "";
    description:string = "";
    metadata:Metadata[] = [];
    rules:KpiRule[] = [];
    view:IndicatorViewType = IndicatorViewType.DOUGHNUT;
    enable = true;
    version:any[] = []
    tags:TagUUID[] = [];
    data?:Nullable<DataSegment[]> = [];
    // metric: Metric = null;
    // events: any[] = [];

    constructor(pConfig:IndicatorOptions) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    setUID(pUID:string):void {
        this.uuid = pUID;
    }

    getUID():IndicatorUUID {
        return this.uuid;
    }

    compare(pIndicator:Indicator):any[] {
        const diffs = [];

        const currMeta:Record<string, Metadata> = {};
        const newMeta:Record<string, Metadata> = {};

        this.metadata.map(x => {
            currMeta[x.key] = x;
        });


        for(let k in pIndicator){
            switch (k){
                case "version":
                case "rules":
                case "metadata":
                    if(this[k].length!=pIndicator[k].length){
                        diffs.push({
                            ppt: k,
                            new: pIndicator[k],
                            old: this[k],
                        })
                    }
                    break;
                case "tags":
                    const t1 = this.tags.sort((a,b)=>(a>b?1:-1));
                    const t2 = pIndicator.tags.sort((a,b)=>(a>b?1:-1));
                    if(t1.join(':')!==t2.join(':')){
                        diffs.push({
                            ppt: "tags",
                            new: pIndicator[k],
                            old: this[k],
                        })
                    }
                    break;
                default:
                    if(pIndicator[k]!==this[k]){
                        diffs.push({
                            ppt: k,
                            new: pIndicator[k],
                            old: this[k],
                        })
                    }
                    break;
            }
        }
        return diffs;
    }

    toJsonObject(pConfig:any = {}):any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            title: this.title,
            description: this.description,
            metadata: this.metadata,
            rules: this.rules,
            view: this.view,
            enable: this.enable,
            version: this.version,
            data: []
        };

        this.data.map((ds:DataSegment) => {
            o.data.push({
                value: ds.value,
                label: ds.label,
                extra: ds.extra
            })
        })

        CoreDebug.checkJsonSerialize(o, "Indicator");
        return o;
    }

    static fromJsonObject(pObj:any):Indicator {
        const i:any = new Indicator(pObj);

        return i;
    }

    /**
     * To clone the indicator and populate data
     *
     * @param pData
     */
    createWithData(pData:DataSegment[]):Indicator {
        const kpi = new Indicator(this);
        kpi.data = pData;
        return kpi;
    }
}
Indicator.TYPE.builder(Indicator);