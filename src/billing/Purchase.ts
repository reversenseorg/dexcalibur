import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {ApplicationUnitUUID} from "../organization/ApplicationUnit.js";

export enum ProductType {
    SCAN=NodeInternalType.PROJECT,
    APP=NodeInternalType.APP_UNIT
}

export interface PurchaseOptions {
    date:number;
    type:ProductType;
    org:OrganizationUnitUUID;
    id:DexcaliburProjectUUID|ApplicationUnitUUID;
}

export class Purchase {

    date:number;

    type:ProductType;

    org:OrganizationUnitUUID;

    id:DexcaliburProjectUUID|ApplicationUnitUUID;

    transaction:any;

    constructor(pOptions:PurchaseOptions) {
        this.date = pOptions.date;
        this.type = pOptions.type;
        this.org = pOptions.org;
        this.id = pOptions.id;
    }

    toJsonObject():any{
        return {
            date: this.date,
            type: this.type,
            org: this.org,
            id: this.id,
            transaction: this.transaction
        }
    }
}