import {INode} from "./INode.js";
import {NodeType} from "./persist/orm/NodeType.js";
import {NodeInternalType} from "./NodeInternalType.js";
import {NodeProperty} from "./persist/orm/NodeProperty.js";
import {DbDataType, DbKeyType} from "./persist/orm/DbAbstraction.js";
import {IStringIndex} from "./core/IStringIndex.js";


export class DeviceModel implements INode {

    static TYPE:NodeType = new NodeType(
        "device_model",
        NodeInternalType.BRAND,
        [
            (new NodeProperty("_id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("brand")).type(DbDataType.STRING).def(null),
            (new NodeProperty("battery_size")).type(DbDataType.STRING).def(null),
            (new NodeProperty("battery_type")).type(DbDataType.STRING).def(null),
            (new NodeProperty("picture")).type(DbDataType.STRING).def(null),
            (new NodeProperty("os")).type(DbDataType.STRING).def(""),
            (new NodeProperty("released_at")).type(DbDataType.STRING).def(""),
            (new NodeProperty("chipset")).type(DbDataType.STRING).def(""),
            (new NodeProperty("ram")).type(DbDataType.STRING).def(""),
            (new NodeProperty("specifications")).type(DbDataType.BLOB).def({}),
            (new NodeProperty("deleted_at")).type(DbDataType.STRING).def(""),
            (new NodeProperty("created_at")).type(DbDataType.STRING).def(""),
            (new NodeProperty("updated_at")).type(DbDataType.STRING).def(""),

        ]);

    __:NodeInternalType = NodeInternalType.DEVICE_MODEL;

    _id:string = ""
    name: string = "";
    brand: string = "";
    picture: string = "";
    os: string = "";
    ram: string = "";
    chipset: string = "";
    released_at: string = "";
    battery_size: string = "";
    battery_type: string = "";
    deleted_at:string = "";
    created_at:string = "";
    updated_at:string = "";

    tags:number[] = [];

    constructor(pConfig:any) {
        if(pConfig != null){
            for(let i in pConfig){
                (this as IStringIndex<any>)[i]=pConfig[i];
            }
        }

        if(this.name==null){
            throw new Error("[BRAND] Name is mandatory");
        }
    }

    getUID():string {
        return this._id;
    }

    toJsonObject(pOption?: any): any {
        const o = {};

        // browse ppts
        for(const i in this){
            if(pOption!=null){

                // skip property if excluded
                if(pOption.exclude!=null && pOption.exclude.indexOf(i)>-1) continue;

                if(pOption.override!=null && pOption.override.hasOwnProperty(i)){
                    // @ts-ignore
                    o[i] = pOption.override[i];
                }else{
                    switch(i){
                        default:
                            // @ts-ignore
                            o[i] = this[i];
                            break;
                    }
                }
            }else {
                switch(typeof this[i]){
                    case "object":
                    default:
                        (o as IStringIndex<any>)[i] = this[i];
                        break;
                }
            }
        }

        return o;
    }
}
DeviceModel.TYPE.builder(DeviceModel);