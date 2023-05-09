import {PiiType} from "./PiiType.js";

export interface PiiCategoryOptions {
    name?:string;
    description?:string;
    criticity?:PiiCriticity;
    types?:PiiType[];
}

export enum PiiCriticity {
    LOW,
    MEDIUM,
    SENSITIVE
}


export class PiiCategory {

    name:string;

    description:string;

    criticity:PiiCriticity = PiiCriticity.LOW;

    types:PiiType[] = [];

    constructor(pOpts:PiiCategoryOptions) {
        for(const i in pOpts) this[i] = pOpts[i];
    }

}