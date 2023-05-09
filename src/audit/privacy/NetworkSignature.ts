import {NodeInternalType} from "../../../src/NodeInternalType.js";

export class NetworkSignature {

    protocol:string;

    pattern:string;

    constructor(pProtocol:string, pPattern:string) {
        this.protocol = pProtocol;
        this.pattern = pPattern;
    }
}