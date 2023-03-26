import {INode} from "../../INode.js";
import DataProperty from "./DataProperty.js";


export default class Threat {

    uid:string ;
    description:string;
    property:DataProperty;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}