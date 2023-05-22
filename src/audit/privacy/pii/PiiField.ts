import Asset, { AssetOptions } from "../../common/Asset.js";
import Constraint from "../../common/Constraint.js";


export interface PiiFieldOptions extends AssetOptions {
    name?:string;
    rules?:any[];
}


export class PiiField extends Asset {

    name:string;

    rules:any[] = []

    signature:Constraint[] = [];

    constructor(pOpts:PiiFieldOptions) {
        super(pOpts);

        for(const i in pOpts) this[i] = pOpts[i];
    }

}