
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

    __pCode:string;

    __pVersion:string;

    __pSerial:string;

    __pKey?:string;

    constructor(pOpts:ProductOptions) {
        for(const i in pOpts){
            this[i]=pOpts[i];
        }
    }
}