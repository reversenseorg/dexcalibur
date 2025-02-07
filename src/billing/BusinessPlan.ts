import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {ProductType, Purchase} from "./Purchase.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {ApplicationUnitUUID} from "../organization/ApplicationUnit.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";

export enum BusinessPlanType {
    SUBSCRIPTION= 'sub',
    SCAN='scan'
}

export interface BusinessPlanOptions {
    plan: BusinessPlanType,
    org: OrganizationUnitUUID,
    counter?: number,
    wallet?: Purchase[],
    signature?: any,
    thresholds?: ResourceThresholds,
    freeScanQty?: number,
    freeSubscriptionQty?: number
}

export interface ResourceThresholds {
    concurrentNodes: number
}

/**
 *
 */
export class BusinessPlan {

    plan:BusinessPlanType;

    org:OrganizationUnitUUID;

    /**
     * Number of product :
     * The product type depends on BusinessPlanType
     * - AppUnit counter for BusinessPlanType.SUBSCRIPTION
     * - DexcaliburProject for BusinessPlanType.
     */
    counter:number = 0;

    wallet:Purchase[] = [];

    freeSubscriptionQty = 10;

    freeScanQty = 5;

    signature:any;

    thresholds:ResourceThresholds = {
        concurrentNodes: 3
    };


    /**
     *
     * @param pOptions
     */
    constructor(pOptions:BusinessPlanOptions) {
        this.org = pOptions.org;
        this.plan = pOptions.plan;

        if(pOptions.counter !=null) this.counter = pOptions.counter;
        if(pOptions.wallet !=null) this.wallet = pOptions.wallet;
        if(pOptions.signature !=null) this.signature = pOptions.signature;
        if(pOptions.thresholds !=null) this.thresholds = pOptions.thresholds;
        if(pOptions.freeScanQty !=null) this.freeScanQty = pOptions.freeScanQty;
        if(pOptions.freeSubscriptionQty !=null) this.freeSubscriptionQty = pOptions.freeSubscriptionQty;
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
            plan: BusinessPlanType.SUBSCRIPTION,
            org: pOrg.getUID(),
            counter: 0,
            wallet: [],
            signature: null,
            thresholds: pQuotas,
        })
    }

    /**
     *
     * @param pOrg
     */
    static newScanWallet(pOrg:OrganizationUnit, pQuotas:ResourceThresholds):BusinessPlan {
        return new BusinessPlan({
            plan: BusinessPlanType.SCAN,
            org: pOrg.getUID(),
            counter: 0,
            wallet: [],
            signature: null,
            thresholds: pQuotas
        })
    }

    /**
     * To check if there is free scan slot
     */
    hasFreeScanSlot():void {
        if(this.plan!=BusinessPlanType.SCAN){
            throw OrganizationManagerException.BUSINESS_PLAN_NOT_SCAN_PLAN(this.org);
        }

        if(this.wallet.length >= this.counter){
            throw OrganizationManagerException.NO_SCAN_SLOT_AVAILABLE(this.org);
        }
    }

    /**
     * To check if there is free scan slot
     */
    hasFreeAppSlot(pAppUnitUUID:ApplicationUnitUUID):void {
        if(this.plan!=BusinessPlanType.SUBSCRIPTION){
            throw OrganizationManagerException.BUSINESS_PLAN_NOT_SUBS_PLAN(this.org);
        }

        let purchasedApp:Nullable<Purchase> = null;

        this.wallet.map( x => {
            if(x.type==ProductType.APP){
                if(x.id === pAppUnitUUID){
                    purchasedApp = x;
                }
            }
        });

        if(purchasedApp==null){
            if(this.wallet.length >= this.counter){
                throw OrganizationManagerException.NO_APP_SLOT_AVAILABLE(this.org);
            }
        }
    }

    /**
     *
     * @param pScannerID
     */
    canPerformScan( pScannerID:string):boolean {
        let authorized = false;

        this.wallet.map((vPurchase)=>{
            authorized = authorized || vPurchase.hasLicenseFor(pScannerID);
        });

        return authorized;
    }

    /**
     *
     */
    toJsonObject():any {
        const o =  {
            plan: this.plan,
            org: this.org,
            counter: this.counter,
            wallet: [],
            signature: this.signature,
            thresholds: this.thresholds,
            freeScanQty: this.freeScanQty,
            freeSubscriptionQty: this.freeSubscriptionQty
        };

        this.wallet.map(x => {
            o.wallet.push(x.toJsonObject());
        })

        return o;
    }

    addPurchase(pPurchase:Purchase):void{
        this.wallet.push(pPurchase);
    }

    addSubscription( pAppUnit:ApplicationUnitUUID|DexcaliburProjectUUID):void {
        if(this.freeSubscriptionQty==0){
            throw OrganizationManagerException.BUSINESS_PLAN_NOT_SUBS_PLAN(this.org);
        }

        this.wallet.push(Purchase.newSubscription(this.org,{
            id: pAppUnit
        }));

        this.freeSubscriptionQty--;
    }

    addPurchasedScan(pAppUnit:ApplicationUnitUUID|DexcaliburProjectUUID):void {
        if(this.freeScanQty==0){
            throw OrganizationManagerException.BUSINESS_PLAN_NOT_SCAN_PLAN(this.org);
        }

        this.wallet.push(Purchase.newScan(this.org,{
            id: pAppUnit
        }));
        this.freeScanQty--;
    }

    hasSubscriptionFor(pAppUnit:ApplicationUnitUUID|DexcaliburProjectUUID):boolean{

        for(let i=0; i<this.wallet.length; i++){
            if((this.wallet[i].id===pAppUnit)&&(this.wallet[i].type==ProductType.APP)){
                return true;
            }
        }

        return false;
    }

    static fromJsonObject(pObj:any):BusinessPlan {
        const bp = new BusinessPlan(pObj);

        bp.wallet = [];

        if(Array.isArray(pObj.wallet)){
            pObj.wallet.map(x => {
                bp.wallet.push(Purchase.fromJsonObject(x));
            })
        }

        return bp;
    }
}