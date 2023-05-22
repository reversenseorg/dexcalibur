import {PiiCategory} from "./PiiCategory.js";
import Asset, {AssetOptions} from "../../common/Asset.js";

export interface PiiClassOptions extends AssetOptions{
    name?:string;
    description?:string;
    categories?:PiiCategory[];
}


export class PiiClass extends Asset {

    name:string;

    description:string;

    categories:PiiCategory[] = [];

    constructor(pOpts:PiiClassOptions) {
        super(pOpts);
        for(const i in pOpts) this[i] = pOpts[i];
    }

}