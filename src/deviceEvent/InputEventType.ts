import EncodedToken from "./EncodedToken.js";

export default class InputEventType  extends EncodedToken {
    metadata?:any;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}