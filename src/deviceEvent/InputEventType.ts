import EncodedToken from "./EncodedToken.js";

export default class InputEventType  extends EncodedToken {
    metadata?:any;

    constructor( pParent: any, pConfig:any ) {
        super(pParent);
        if (pConfig != null) {
            for (const i in pConfig) this[i] = pConfig[i];
        }
    }
}