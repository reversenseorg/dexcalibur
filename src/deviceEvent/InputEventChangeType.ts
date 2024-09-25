import InputEventChangeProperties from "./InputEventChangeProperties.js";
import EncodedToken from "./EncodedToken.js";

export default class InputEventChangeType  extends EncodedToken {
    description?:string;
    properties: InputEventChangeProperties;
    tags: number[];
    metadata?:any;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}