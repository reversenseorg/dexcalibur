import { PiiField } from "./PiiField.js";
import {MerlinRule} from "../../../search/MerlinRule.js";
import DexcaliburProject from "../../../DexcaliburProject.js";
import {MerlinSearchRequest} from "../../../search/MerlinSearchRequest.js";


export interface PiiTypeOptions {
    name?:string;
    description?:any;
    children?:any;

    fields?:PiiField[];
    rules?:MerlinSearchRequest[];
}


export class PiiType {

    name:string;

    description:string;

    children:any = null;

    fields:PiiField[] = [];

    rules:MerlinSearchRequest[] = [];

    constructor(pOpts:PiiTypeOptions) {
        for(const i in pOpts) this[i] = pOpts[i];
    }

    check(pContext:DexcaliburProject){

    }
}