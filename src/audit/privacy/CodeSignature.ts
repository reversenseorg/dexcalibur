import {NodeInternalType} from "../../../src/NodeInternalType.js";

export class CodeSignature {

    node:NodeInternalType;

    pattern:string;

    constructor(pNode:NodeInternalType, pPattern:string) {
        this.node = pNode;
        this.pattern = pPattern;
    }
}