import Constraint from "./Constraint.js";


export interface AssetOptions {

    id?:string;

    signature?:Constraint[];

    name?:string;

    description?:string;
}

export default class Asset  {

    id = "";

    name:string;

    description:string;

    constructor( pConfig:AssetOptions = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];

        if((this.id=="")&&(this.name!="")){
            this.id = this.name;
        }
    }
}