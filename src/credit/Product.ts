import {CoreDebug} from "../core/CoreDebug.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

export interface ProductOptions {
    __pCode:string;
    __pVersion:string;
    __pSerial:string;
    __pKey?:string;
}

/**
 * Represent a product type
 *
 * @class
 */
export class Product {

    __ = NodeInternalType.REVERSENSE_PRODUCT;

    __pCode:string;

    __pVersion:string;

    __pSerial:string;

    __pKey?:string;

    constructor(pOpts:ProductOptions) {
        for(const i in pOpts){
            this[i]=pOpts[i];
        }
    }

    toJsonObject():any {
        const o = {
            __pCode: this.__pCode,
            __pVersion: this.__pVersion,
            __pSerial: this.__pSerial,
        };
        CoreDebug.checkJsonSerialize(o, "Product");
        return o;
    }
}