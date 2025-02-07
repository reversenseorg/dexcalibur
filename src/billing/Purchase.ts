import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {ApplicationUnitUUID} from "../organization/ApplicationUnit.js";
import {ReversenseProduct} from "./ReversenseProduct.js";
import {ProductRelease} from "./ProductRelease.js";

export enum ProductType {
    SCAN=NodeInternalType.PROJECT,
    APP=NodeInternalType.APP_UNIT
}

export interface PurchaseOptions {
    date:number;
    type:ProductType;
    org:OrganizationUnitUUID;
    id:DexcaliburProjectUUID|ApplicationUnitUUID;
    transaction?: any;
    products?: ReversenseProduct[];
}


export class Purchase {

    date:number;

    type:ProductType;

    org:OrganizationUnitUUID;

    id:DexcaliburProjectUUID|ApplicationUnitUUID;

    products:ReversenseProduct[] = [];

    transaction:any;

    constructor(pOptions:PurchaseOptions) {
        this.date = pOptions.date;
        this.type = pOptions.type;
        this.org = pOptions.org;
        this.id = pOptions.id;
        this.transaction = pOptions.transaction;
        this.products = (pOptions.products!=null ? pOptions.products : []);
    }

    static newSubscription(pOrganization:OrganizationUnitUUID, pOptions:any):Purchase {
        return new Purchase({
            date: (new Date()).getTime(),
            type: ProductType.APP,
            org: pOrganization,
            id: pOptions.id,
            products: [
                new ReversenseProduct({
                    code: "scanner.generic",
                    name: "Privacy scanner",
                    description: "Scanner for Privacy assessment",
                    price: 6000,
                    releases: [
                        new ProductRelease({
                            version: "1.0",
                            description: "Scanner for Privacy assessment"
                        })
                    ]
                })
            ]
        })
    }

    static fromJsonObject(pObj:any):Purchase {
        const p = new Purchase({
            date: pObj.date,
            type: pObj.type,
            org: pObj.org,
            id: pObj.id,
            transaction: pObj.transaction,
            products: []
        });

        (pObj.products).map((vRawProduct:any)=>{
            p.products.push(
                ReversenseProduct.fromJsonObject(vRawProduct)
            );
        })

        return p;
    }

    static newScan(pOrganization:OrganizationUnitUUID, pOptions:any):Purchase {
        return new Purchase({
            date: (new Date()).getTime(),
            type: ProductType.SCAN,
            org: pOrganization,
            id: pOptions.id,
            products: [
                new ReversenseProduct({
                    code: "scanner.generic",
                    name: "Privacy scanner",
                    description: "Scanner for Privacy assessment",
                    price: 6000,
                    releases: [
                        new ProductRelease({
                            version: "1.0",
                            description: "Scanner for Privacy assessment"
                        })
                    ]
                })
            ]
        })
    }


    hasLicenseFor(pCode:string):boolean {
        for(let i=0; i<this.products.length; i++){
            if(this.products[i].is(pCode)){
                return true;
            }
        }
        return false;
    }

    toJsonObject():any{
        const o = {
            date: this.date,
            type: this.type,
            org: this.org,
            id: this.id,
            transaction: this.transaction,
            products: []
        };

        this.products.map(x => {
            o.products.push(x.toJsonObject());
        })

        return o;
    }
}