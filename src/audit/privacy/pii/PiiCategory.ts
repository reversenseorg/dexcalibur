import {PiiType} from "./PiiType.js";
import Asset, {AssetOptions} from "../../common/Asset.js";

export interface PiiCategoryOptions extends AssetOptions {
    criticity?:PiiCriticity;
    types?:PiiType[];
}

export enum PiiCriticity {
    LOW,
    MEDIUM,
    SENSITIVE
}


export class PiiCategory extends Asset {

    criticity:PiiCriticity = PiiCriticity.LOW;

    types:PiiType[] = [];

    constructor(pOpts:PiiCategoryOptions) {
        super(pOpts);

        for(const i in pOpts) this[i] = pOpts[i];
    }

}