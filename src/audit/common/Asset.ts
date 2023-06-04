import Constraint from "./Constraint.js";


export interface AssetOptions {

    signature?:Constraint[];

    name?:string;

    description?:string;
}

export default class Asset  {

    name:string;

    description:string;

    constructor( pConfig:AssetOptions = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}