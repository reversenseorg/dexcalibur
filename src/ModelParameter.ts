import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {INode, SerializeOptions, TagUUID} from "@dexcalibur/dexcalibur-orm";
import ModelClass from "./ModelClass.js";
import {ModelBasicType} from "./ModelType.js";
import {UserAccountUUID} from "./user/UserAccount.js";

export interface ModelParameterOptions {

}

export interface ParamValueHookSource {
    sessions : string,
    hook: string,
    frag: string
}

export interface ParamValueUserSource {
    cause:string,
    date: number,
    user?:UserAccountUUID
}

export interface ParamValue {
    value:any;
    src: ParamValueHookSource|ParamValueUserSource,
    date: number,
    comment?: string
}
/**
 *
 */
export class ModelParameter implements INode {

    __: NodeInternalType = NodeInternalType.STRING;

    type: Nullable<ModelClass|ModelBasicType> = null;

    /**
     * The position in param list
     */
    position: number;

    uid: string;

    alias:string = "";

    tags: TagUUID[] = [];

    values: ParamValue[] = [];

    arr: boolean = false;

    name: string;


    constructor(pOptions: ModelParameterOptions) {

    }

    toJsonObject(pOption?: SerializeOptions) {
        return {
            type: (this.type!=null ? this.type.toJsonObject() : null),
            position: this.position,
            tags: this.tags,
            alias: this.alias,
            uid: this.uid

        };
    }

    getUID(){
        return this.uid;
    }
}