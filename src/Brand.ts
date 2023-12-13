import {NodeType, INode} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "./NodeInternalType.js";
import {DeviceModel} from "./DeviceModel.js";
import {IStringIndex} from "./core/IStringIndex.js";


export class Brand implements INode {

    static TYPE:NodeType = new NodeType(
        "brand",
        NodeInternalType.BRAND,
        []);


    __:NodeInternalType = NodeInternalType.BRAND;

    _id:string;
    id: string = "";
    name: string;
    logo: string = "";

    models: DeviceModel[] = [];

    deleted_at:number = -1;
    created_at:number = -1;
    updated_at:number = -1;

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
Brand.TYPE.builder(Brand);