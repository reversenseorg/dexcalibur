import DexcaliburEngine from "../DexcaliburEngine.js";
import {ReversenseProduct, ReversenseProductUUID} from "../billing/ReversenseProduct.js";
import {LicenceManager} from "../credit/LicenceManager.js";
import {UserAccount} from "../user/UserAccount.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import AccessControl from "../user/acl/AccessControl.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {MarketplaceException} from "./MarketplaceException.js";
import Util from "../Utils.js";
import {BusinessPlanType} from "../billing/BusinessPlan.js";
import {SemVerComparison, SemVerHelper} from "../util/semver/SemverHelper.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";


/**
 * Represent the manager to pull information and plugins from
 * marketplace
 *
 * @class
 */
export class MarketplaceManager {

    /**
     * @type {DexcaliburEngine}
     * @private
     */
    private _ctx:DexcaliburEngine;



    /**
     * To create
     *
     * @param pEngine
     */
    constructor(pEngine:DexcaliburEngine) {
        this._ctx = pEngine;
    }

    listLocallyAvailableProducts():ReversenseProduct[] {
        return LicenceManager.getAvailableProducts();
    }

    /**
     * To list products from DB
     */
    async listProducts():Promise<ReversenseProduct[]> {
        const coll = this._ctx.getEngineDB().getCollectionOf(ReversenseProduct.TYPE.getType());
        const prods = await coll.search({
            filter: {}
        },{raw:true});

        return prods;
    }


    /**
     * To list products from DB
     */
    async updateProduct(pProduct: ReversenseProduct, pPpt:string[] = []):Promise<void> {

        const coll = this._ctx.getEngineDB().getCollectionOf(ReversenseProduct.TYPE.getType());

        const prod = await coll.search({ name: pProduct.getUID() },{raw:true});
        if(prod.length>0){
            // update
            //coll.asyncUpdateEntry(db.asyncUpdateEntry(pProject, {replace:false, $set:pAtomicPpts});)

            const opt:any =  {replace: !(pPpt.length>0)  }
            if(pPpt.length>0){
                opt.$set = pPpt;
            }
            await coll.asyncUpdateEntry(pProduct,opt);
        }else{
            // create
            await coll.asyncAddEntry(pProduct.getUID(), pProduct);
        }


        return ;
    }

    async checkForUpdates():Promise<void> {
        const existings:Record<ReversenseProductUUID, ReversenseProduct> = {};
        const presets:Record<ReversenseProductUUID, ReversenseProduct> = {};


        (await this.listProducts()).map(item => {
            existings[item.getUID()] = item;
        });

        (LicenceManager.getAvailableProducts()).map(item => {
            presets[item.getUID()] = item;
        });

        let rp:ReversenseProduct, cmp:SemVerComparison;
        for(let n in presets) {
            rp = existings[n];
            if(rp==null){
                await this.updateProduct(presets[n]);
                continue;
            }

            if(rp.version!=presets[n].version){
                cmp = SemVerHelper.compare(rp.version, presets[n].version);
                if(cmp.newest.raw==presets[n].version){
                    await this.updateProduct(presets[n]);
                    continue;
                }
            }
        }
    }
    /**
     *
     * @param pUser
     * @param pOrg
     * @param pProductID
     * @param pPlan
     * @param pQtt
     */
    async buyProduct( pUser:UserAccount, pOrg:OrganizationUnit, pProductID:string, pPlan:BusinessPlanType, pQtt:number):Promise<boolean> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUser,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        // get product
        let product:Nullable<ReversenseProduct> = this.listLocallyAvailableProducts().find(x => (x.getUID()===pProductID));

        if(product==null){
            throw MarketplaceException.PRODUCT_NOT_FOUND(pProductID);
        }


        // add credit
        pOrg.getBusinessPlan().addCredit({
            date: Util.now(),
            qtity: pQtt,
            type: pPlan,
            product: pProductID
        });

        await this._ctx.getOrgManager().updateOrganization(pUser, pOrg, {businessPlan:pOrg.getBusinessPlan()});

        return true;
    }

    /**
     *
     * @param pOrg
     */
    listProductsOwnedBy(pOrg: OrganizationUnit):ReversenseProduct[] {
        const p:Record<string,ReversenseProduct> = {};


        pOrg.getBusinessPlan().wallet.map(vPurchase =>{
            vPurchase.products.map(vvPurchase =>{
                if(p[vvPurchase.getUID()]==null){
                    p[vvPurchase.getUID()] = vvPurchase;
                }
            })
        });

        return Object.values(p);
    }

    async getProduct(pProduct: ReversenseProductUUID):Promise<Nullable<ReversenseProduct>> {
        const coll = this._ctx.getEngineDB().getCollectionOf(ReversenseProduct.TYPE.getType());
        return (await coll as MongodbDbCollection).asyncGetEntry({ code:pProduct });
    }
}