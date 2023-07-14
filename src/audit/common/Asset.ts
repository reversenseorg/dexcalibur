import Constraint from "./Constraint.js";


export interface AssetOptions {

    id?:string;

    signature?:Constraint[];

    name?:string;

    description?:string;

    styles?:any;
}

export default class Asset  {

    id = "";

    name:string;

    description:string;

    styles:any = {}

    constructor( pConfig:AssetOptions = null) {

        if(pConfig.id!=null) this.id = pConfig.id;
        if(pConfig.name!=null) this.name = pConfig.name;
        if(pConfig.description!=null) this.description = pConfig.description;
        if(pConfig.styles!=null) this.styles = pConfig.styles;


        if((this.id=="")&&(this.name!="")){
            this.id = this.name;
        }
    }
}