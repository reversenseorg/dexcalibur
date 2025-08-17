import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import { Purchase} from "./Purchase.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {ApplicationUnitUUID} from "../organization/ApplicationUnit.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import { ReversenseProductUUID} from "./ReversenseProduct.js";
import {INodeRef} from "../INode.js";
import {UserAccountUUID} from "../user/UserAccount.js";

export enum BusinessPlanType {
    SUBSCRIPTION= 'sub',
    SCAN='scan'
}

export interface BusinessPlanOptions {
    org?: OrganizationUnitUUID,
    wallet?: Purchase[],
    signature?: any,
    thresholds?: ResourceThresholds,
    credits?:Record<ReversenseProductUUID, Record<BusinessPlanType, number>>;
    mkpPurchases?: MarketplacePurchase[];
}

export interface MarketplacePurchase {
    date: number;
    product: ReversenseProductUUID;
    qtity: number;
    type: BusinessPlanType;
}

export interface ResourceThresholds {
    concurrentNodes: number
}

/**
 *
 */
export class BusinessPlan {


    org:OrganizationUnitUUID;

    /**
     * Internal purchases
     */
    wallet:Purchase[] = [];

    credits:Record<ReversenseProductUUID, Record<BusinessPlanType, number>> = {};

    /**
     * Marketplace purchases
     */
    mkpPurchases:MarketplacePurchase[] = [];

    signature:any;

    thresholds:ResourceThresholds = {
        concurrentNodes: 3
    };

    private _old:any = {};

    /**
     *
     * @param pOptions
     */
    constructor(pOptions:BusinessPlanOptions) {
        this.org = pOptions.org;

        if(pOptions.wallet !=null) this.wallet = pOptions.wallet;
        if(pOptions.signature !=null) this.signature = pOptions.signature;
        if(pOptions.thresholds !=null) this.thresholds = pOptions.thresholds;
        if(pOptions.credits !=null) this.credits = pOptions.credits;
        if(pOptions.mkpPurchases !=null) this.mkpPurchases = pOptions.mkpPurchases;


        ["plan","counter","freeScanQty","freeSubscriptionQty"].map(x => {
            if((pOptions as any)[x] !=null) this._old[x] = pOptions[x];
        });
    }

    isDeprecated():boolean {
        return Object.keys(this._old).length > 0;
    }

    /**
     *
     * @param {Purchase[]} pPurchases
     */
    setWallet(pPurchases:Purchase[]):void {
        this.wallet = pPurchases;
    }

    /**
     *
     * @param pOrg
     */
    static newSubscription(pOrg:OrganizationUnit, pQuotas:ResourceThresholds):BusinessPlan {
        return new BusinessPlan({
            org: pOrg.getUID(),
            wallet: [],
            signature: null,
            thresholds: pQuotas,
        })
    }

    /**
     * Chainable
     * @param {ResourceThresholds} pQuotas
     * @return {BusinessPlan}
     */
    setQuotas( pQuotas:ResourceThresholds):BusinessPlan {
        this.thresholds = pQuotas;
        return this;
    }

    /**
     * To check if there is free scan slot
     */
    hasFreeScanSlot(pProduct:ReversenseProductUUID):void {

        let credit:any = this.credits[pProduct];
        if(credit==null || credit[BusinessPlanType.SCAN]<=0){
            throw OrganizationManagerException.NO_SCAN_SLOT_AVAILABLE(this.org,pProduct);
        }
    }


    /**
     * To check if there is free scan slot
     */
    hasFreePlanSlot(pPlan:BusinessPlanType, pProduct:ReversenseProductUUID):void {


        let credit:any = this.credits[pProduct];
        if(credit==null || credit[pPlan]<=0){
            if(pPlan===BusinessPlanType.SUBSCRIPTION)
                throw OrganizationManagerException.NO_APP_SLOT_AVAILABLE(this.org,pProduct);
            else
                throw OrganizationManagerException.NO_SCAN_SLOT_AVAILABLE(this.org,pProduct);
        }
    }

    /**
     * To check if there is free scan slot
     */
    hasFreeAppSlot(pAppUnitUUID:ApplicationUnitUUID, pProduct:ReversenseProductUUID):void {


        let credit:any = this.credits[pProduct];
        if(credit==null || credit[BusinessPlanType.SUBSCRIPTION]<=0){
            throw OrganizationManagerException.NO_SCAN_SLOT_AVAILABLE(this.org,pProduct);


        }
    }

    /**
     *
     * @param pScannerID
     */
    canPerformScan( pSubject:INodeRef, pPlans:BusinessPlanType[], pProduct:ReversenseProductUUID):boolean {
        let authorized = false;

        // check for subscription or free scan credit
        let p:Purchase;
        for(let i=0; i<this.wallet.length; i++){
            p = this.wallet[i];

            if(p.subject==null) continue;

            if((pProduct===p.product) && (p.subject.__==pSubject.__) && (p.subject._uid==pSubject._uid)){
                if((pPlans.indexOf(p.plan)>-1) && !p.hasExpired()){
                    return true;
                }
            }
        }

        return false;
    }

    /**
     *
     */
    toJsonObject():any {
        const o =  {
            org: this.org,
            wallet: [],
            signature: this.signature,
            thresholds: this.thresholds,
            credits: this.credits,
            mkpPurchases: this.mkpPurchases
        };

        this.wallet.map(x => {
            o.wallet.push(x.toJsonObject());
        })

        return o;
    }

    addPurchase(pPurchase:Purchase):void{
        this.wallet.push(pPurchase);
    }

    /**
     * To active a subscription
     *
     * @param pAppUnit
     * @param pProducts
     */
    addSubscription( pUser:UserAccountUUID, pAppUnit:ApplicationUnitUUID|DexcaliburProjectUUID, pProduct:ReversenseProductUUID):void {

        // count if there is enough credit
        if(!this.hasEnoughCredit(pProduct,BusinessPlanType.SUBSCRIPTION)){
            throw OrganizationManagerException.BUSINESS_PLAN_NOT_SUBS_PLAN(this.org,pProduct);
        }

        let old:number = -1;
        // count down credits (TODO : cross check in try/catch later)
        old = this.credits[pProduct][BusinessPlanType.SUBSCRIPTION];

        if(old>0 && old<Number.MAX_VALUE){
            this.credits[pProduct][BusinessPlanType.SUBSCRIPTION] = old-1;
        }else{
            throw new Error("Invalid credit amount");
        }

        // make purchase
        this.wallet.push(Purchase.newSubscription( pUser, this.org, pProduct, {
            __: NodeInternalType.APP_UNIT,
            _uid: pAppUnit
        }));
    }

    /**
     * To check if there is enough credit to activate a specific plan for a specific product
     * @param {ReversenseProductUUID} pProduct
     * @param {BusinessPlanType}pPlan
     */
    hasEnoughCredit(pProduct:ReversenseProductUUID, pPlan:BusinessPlanType):boolean {
        const p = this.credits[pProduct];
        if(p==null) return false;
        return(p[pPlan]>0);
    }
    /**
     * To credit a subscription
     *
     * @param pAppUnit
     * @param pProducts
     */
    addCredit( pPurchase:MarketplacePurchase ):void {

        if(this.credits[pPurchase.product]==null){
            this.credits[pPurchase.product] = {
                [BusinessPlanType.SCAN]: 0,
                [BusinessPlanType.SUBSCRIPTION]: 0,
            };
        }

        this.credits[pPurchase.product][pPurchase.type] += (typeof pPurchase.qtity==='string' ? parseInt(pPurchase.qtity,10) : pPurchase.qtity);
        this.mkpPurchases.push(pPurchase);
    }


    static fromJsonObject(pObj:any):BusinessPlan {
        const bp = new BusinessPlan(pObj);

        bp.wallet = [];

        if(Array.isArray(pObj.wallet)){
            pObj.wallet.map(x => {
                bp.wallet.push(new Purchase(x));
            })
        }

        return bp;
    }

    getPurchases():MarketplacePurchase[] {
        return this.mkpPurchases;
    }
}