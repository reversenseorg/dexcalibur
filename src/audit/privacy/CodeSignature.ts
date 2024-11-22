import {NodeInternalType} from "@dexcalibur/dxc-core-api";


export class CodeSignature {

    node:NodeInternalType;

    pattern:string;

    constructor(pNode:NodeInternalType, pPattern:string) {
        this.node = pNode;
        this.pattern = pPattern;
    }
}