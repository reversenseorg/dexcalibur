import {NodeInternalType} from "@dexcalibur/dxc-core-api";;
import {INode, Node} from "../../INode.js";
import {Indicator} from "./Indicator.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {
    DbDataType,
    DbKeyType,
    NodeProperty,
    NodePropertyState,
    NodeType, TagUUID,
    ValidationRule
} from "@dexcalibur/dexcalibur-orm";


export interface IndicatorsMap {
    [name:string] :Indicator
}

export interface DashBoardOption {
    name?:string;
    uuid?:DashBoardUUID;
    description?:string;
    version?:string;
    tags?:number[];
    indicators?:IndicatorsMap;
}

export type DashBoardUUID = string;

/**
 * To describe a dashboard
 *
 * @class
 */
export class DashBoard implements INode {

    __:NodeInternalType = NodeInternalType.DASHBOARD;

    static TYPE:NodeType = (new NodeType( "dashboard", NodeInternalType.BOM, [
        (new NodeProperty("uuid"))
            .type(DbDataType.STRING)
            .addValidationRule(ValidationRule.uuid())
            .key(DbKeyType.PRIMARY),
        (new NodeProperty("tags"))
            .type(DbDataType.STRING)
            .def([]),
        (new NodeProperty("name"))
            .type(DbDataType.STRING)
            .addValidationRule(ValidationRule.utf8String()),
        (new NodeProperty("description"))
            .type(DbDataType.STRING)
            .addValidationRule(ValidationRule.utf8String()),
        (new NodeProperty("version"))
            .type(DbDataType.STRING)
            .addValidationRule(ValidationRule.utf8String()),
        (new NodeProperty("indicators"))
            .type(DbDataType.STRING)
            .sleep((x:NodePropertyState)=>{
                if(x.p==null) return {};
            })
            .def({})
    ])).dataSource("ENGINE_DB");

    uuid:DashBoardUUID;
    /**
     * Dashboard name
     * @type {string}
     * @field
     */
    name:string;

    description:string;

    version:string;

    indicators:IndicatorsMap = {};

    tags:TagUUID[] = [];

    constructor(pConfig:DashBoardOption) {

        if(pConfig.uuid!=null) this.uuid = pConfig.uuid;
        if(pConfig.name!=null) this.name = pConfig.name;
        if(pConfig.version!=null) this.version = pConfig.version;
        if(pConfig.description!=null) this.description = pConfig.description;
        if(pConfig.tags!=null) this.tags = pConfig.tags;
        if(pConfig.indicators!=null) this.indicators = pConfig.indicators;
    }

    getUID(): DashBoardUUID {
        return this.uuid;
    }

    getIndicators():IndicatorsMap {
        return this.indicators;
    }


    getKPI(pName:string):Indicator {
        return this.indicators[pName];
    }

    toJsonObject(pOptions:any = {}):any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            version: this.version,
            tags: this.tags,
            indicators: {}
        };

        for(const name in this.indicators){
            o.indicators[name] = this.indicators[name].toJsonObject();
        }

        CoreDebug.checkJsonSerialize(o, "DashBoard");
        return o;
    }
}