import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import { NodeInternalType } from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "../../core/CoreDebug.js";
import {Metadata, MetadataJsonSchema} from "./Metadata.js";
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
        (new NodeProperty("uuid"))
            .schema({ type:"string", pattern:"^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$"})
            .descr("Unique identifier of the indicator, in the form of a dot-separated path, eg: my.indicator.name. Indicator from source source are prefixed by 'built.' ")
            .type(DbDataType.STRING)
            .key(DbKeyType.PRIMARY),
        (new NodeProperty("name"))
            .schema({ type:"string" })
            .descr("The internal name of the indicator, must be unique within the same report. It is often equal to UUID without the 'built.' prefix.")
            .type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("title"))
            .schema({ type:"string" })
            .descr("The title of the indicators when it is rendered or integrated to the report (eg: in a dashboard).")
            .type(DbDataType.STRING).def(""),
        (new NodeProperty("description"))
            .schema({ type:"string" })
            .descr("A description to help the final user to understand what is represented by this indicator..")
            .type(DbDataType.STRING).def(""),
        (new NodeProperty("metadata"))
            .schema({ type:"array", items: MetadataJsonSchema })
            .descr("A list of metadata related to this indicators, eg: the styles, an external resource, the source of the data, the unit of measure, the type of data, etc..")
            .type(DbDataType.STRING).def([]),
        (new NodeProperty("rules"))
            .schema({ type:"array", items: MetadataJsonSchema })
            .descr("Rules are a list of aggregation rule used to count things in order to compute the values of the indicator.")
            .type(DbDataType.STRING).def([]),
        (new NodeProperty("data"))
            .schema({ type:"array", items: {type:"object"} })
            .descr("the raw data of the indicator instance. An Indicator object without data is just the template of the indictor or the KPI.")
            .type(DbDataType.BLOB).def([]),
        (new NodeProperty("view"))
            .schema({ type:"string", enum: ["doughnut", "radar", "curv", "plot", "stacked_bar", "progress",] })
            .descr("The type of view to use to render the indicator by the render engine. The default is 'doughnut'. Data are processed by the render engine accordingly to this value.")
            .type(DbDataType.STRING).def("doughnut"),
        (new NodeProperty("enable"))
            .schema({ type:"boolean" })
            .descr("A boolean flag to enable or disable this indicator. Disabled indicators are not rendered in the report, but can be used to build dashboards. Default is true.")
            .type(DbDataType.BOOLEAN).def(true),
        (new NodeProperty("version"))
            .schema({ type:"string" })
            .descr("Semver style of version number to track evolution of this indicator. Default is empty string.")
            .type(DbDataType.BLOB).def("1.0.0"),
        //(new NodeProperty("metric")).type(DbDataType.STRING).def({})
    ])).descr(`
An Indicator is a metric, optionally filed with data.

Indicator can be used:
- to build dashboards
- to define KPI template attached to a control point or assurance model
- to generate reports with data


    `);

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