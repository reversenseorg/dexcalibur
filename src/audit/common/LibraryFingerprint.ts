import {NodeInternalType} from "../../NodeInternalType.js";


export enum FingerprintSource {
    JAVA,
    KOTLIN,
    ELF,
    CODE
}

/**
 *
 */
export class LibraryFingerprint {

    __:NodeInternalType = NodeInternalType.LIB_FP;
    name:string;

    type:FingerprintSource;

    description:string = "";

    constructor(pName:string, pType:FingerprintSource, pDesc:string) {
        this.name = pName;
        this.type = pType;
        this.description = pDesc;
    }
}