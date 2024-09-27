import InputEventChangeProperties from "./InputEventChangeProperties.js";
import EncodedToken from "./EncodedToken.js";

export default class InputEventChangeType  extends EncodedToken {
    description?:string;
    properties: InputEventChangeProperties;
    tags: number[];
    metadata?:any;

    constructor( pParent: any, pConfig:any ) {
        super(pParent);
        if (pConfig != null) {
            for (const i in pConfig) this[i] = pConfig[i];
        }
    }
}