import {PiiCategory} from "./PiiCategory.js";
import Asset, {AssetOptions} from "../../common/Asset.js";

export interface PiiClassMap {
    [cls:string] :PiiClass
}

export interface PiiClassOptions extends AssetOptions{
    categories?:PiiCategory[];
}


export class PiiClass extends Asset {

    categories:PiiCategory[] = [];

    constructor(pOpts:PiiClassOptions) {
        super(pOpts);
        for(const i in pOpts) this[i] = pOpts[i];
    }

}