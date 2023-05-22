import { PiiField } from "./PiiField.js";
import {MerlinRule} from "../../../search/MerlinRule.js";
import DexcaliburProject from "../../../DexcaliburProject.js";
import {MerlinSearchRequest} from "../../../search/MerlinSearchRequest.js";
import Asset, {AssetOptions} from "../../common/Asset.js";


export interface PiiTypeOptions extends AssetOptions{
    name?:string;
    description?:any;
    children?:any;

    fields?:PiiField[];
    rules?:MerlinSearchRequest[];
}


export class PiiType extends Asset {

    name:string;

    description:string;

    children:any = null;

    fields:PiiField[] = [];

    rules:MerlinSearchRequest[] = [];

    constructor(pOpts:PiiTypeOptions) {
        super(pOpts);

        for(const i in pOpts) this[i] = pOpts[i];
    }

    check(pContext:DexcaliburProject){

    }
}