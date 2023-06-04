import { PiiField } from "./PiiField.js";
import {MerlinRule} from "../../../search/MerlinRule.js";
import DexcaliburProject from "../../../DexcaliburProject.js";
import {MerlinSearchRequest} from "../../../search/MerlinSearchRequest.js";
import Asset, {AssetOptions} from "../../common/Asset.js";
import {PiiClass} from "./PiiClass.js";
import Constraint from "../../common/Constraint.js";


export interface PiiTypeMap {
    [name:string] :PiiType
}
export interface PiiTypeOptions extends AssetOptions{
    children?:any;

    fields?:PiiField[];
    rules?:MerlinSearchRequest[];
}


export class PiiType extends Asset {

    children:any = null;

    fields:PiiField[] = [];

    rules:MerlinSearchRequest[] = [];
    signature:Constraint[] = []

    constructor(pOpts:PiiTypeOptions) {
        super(pOpts);

        for(const i in pOpts) this[i] = pOpts[i];
    }

    check(pContext:DexcaliburProject){

    }
}