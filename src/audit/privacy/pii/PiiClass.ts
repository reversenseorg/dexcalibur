import {PiiCategory} from "./PiiCategory.js";

export interface PiiClassOptions {
    name?:string;
    description?:string;
    categories?:PiiCategory[];
}


export class PiiClass {

    name:string;

    description:string;

    categories:PiiCategory[] = [];

    constructor(pOpts:PiiClassOptions) {
        for(const i in pOpts) this[i] = pOpts[i];
    }

}