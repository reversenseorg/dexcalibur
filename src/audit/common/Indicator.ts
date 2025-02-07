import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import { NodeInternalType } from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "../../core/CoreDebug.js";


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
        (new NodeProperty("metadata")).type(DbDataType.STRING).def({}),
        (new NodeProperty("rules")).type(DbDataType.STRING).def([]),
        (new NodeProperty("view")).type(DbDataType.STRING).def(null),
        (new NodeProperty("enable")).type(DbDataType.BOOLEAN).def(true),
        (new NodeProperty("version")).type(DbDataType.BLOB).def({}),
        //(new NodeProperty("metric")).type(DbDataType.STRING).def({})
    ])).dataSource("ENGINE_DB");

    uuid:IndicatorUUID = "";
    name:string = "";
    title:string = "";
    description:string = "";
    metadata:any = {};
    rules:any[] = [];
    view:string = "";
    enable = true;
    version:any[] = []

    tags:TagUUID[] = [];
    // metric: Metric = null;
    // events: any[] = [];

    constructor(pConfig:IndicatorOptions) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    getUID():IndicatorUUID {
        return this.uuid;
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
            version: this.version
        };


        CoreDebug.checkJsonSerialize(o, "Indicator");
        return o;
    }
}
Indicator.TYPE.builder(Indicator);