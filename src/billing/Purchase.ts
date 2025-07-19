import {OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {ReversenseProduct, ReversenseProductUUID} from "./ReversenseProduct.js";
import {INodeRef} from "../INode.js";
import {BusinessPlanType} from "./BusinessPlan.js";
import {UserAccountUUID} from "../user/UserAccount.js";
import Util from "../Utils.js";


export interface PurchaseOptions {
    date:number;
    plan: BusinessPlanType;
    org:OrganizationUnitUUID;
    issuer:UserAccountUUID;
    subject: INodeRef;
    transaction?: any;
    product?:ReversenseProductUUID;
}


export class Purchase {

    date:number;

    org:OrganizationUnitUUID;

    plan: BusinessPlanType;

    issuer: UserAccountUUID;

    subject: INodeRef; //DexcaliburProjectUUID|ApplicationUnitUUID;

    /**
     * @deprecated
     */
    products:ReversenseProduct[] = [];

    product:ReversenseProductUUID;

    transaction:any = null;

    constructor(pOptions:PurchaseOptions) {
        this.date = pOptions.date;
        this.plan = pOptions.plan;
        this.org = pOptions.org;
        this.subject = pOptions.subject;
        this.product = pOptions.product;

        if(pOptions.transaction!=null) this.transaction = pOptions.transaction;
        if(pOptions.issuer!=null) this.issuer = pOptions.issuer;
    }



    static newSubscription(pUser:UserAccountUUID, pOrganization:OrganizationUnitUUID, pProduct:ReversenseProductUUID, pSubject:INodeRef):Purchase {
        return new Purchase({
            date: (new Date()).getTime(),
            plan: BusinessPlanType.SUBSCRIPTION,
            issuer: pUser,
            org: pOrganization,
            product: pProduct,
            subject: pSubject
        })
    }


    static newScan(pUser:UserAccountUUID, pOrganization:OrganizationUnitUUID, pProduct:ReversenseProductUUID, pSubject:INodeRef):Purchase {
        return new Purchase({
            date: (new Date()).getTime(),
            plan: BusinessPlanType.SCAN,
            issuer: pUser,
            org: pOrganization,
            product: pProduct,
            subject: pSubject
        })
    }

    /**
     * to check if a license has expired
     */
    hasExpired():boolean {
        return (Util.now()-this.date)>(365*24*3600*1000);
    }


    toJsonObject():any{
        const o = {
            date: this.date,
            plan: this.plan,
            org: this.org,
            subject: this.subject,
            issuer: this.issuer,
            transaction: this.transaction,
            product: this.product
        };

        return o;
    }
}