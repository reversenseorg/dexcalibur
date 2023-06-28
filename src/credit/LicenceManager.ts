
import {UserAccount} from "../user/UserAccount.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Product} from "./Product.js";
import {PrivacyScanner} from "../audit/privacy/PrivacyScanner.js";
import {GenericScanner} from "../audit/common/GenericScanner.js";
import AssuranceModel from "../audit/common/AssuranceModel.js";

interface ActivatedServices {
    [ productCode:string] :any
}

interface ServiceWallet {
    [ projectSerial:string] :ActivatedServices
}


export interface ProductInfo {
    product: Product,
    cost:number,
    balance:number
}


export interface CompositeProductInfo {
    products: ProductInfo[],
    totalCost:number
}

export class LicenceManager {

    static wallet: ServiceWallet = {};

    /**
     *
     * @param pProject
     * @param pProductCode
     */
    static activateProduct( pProject:DexcaliburProject, pProductCode:string):Product {

        if(LicenceManager.wallet[pProject.getLicenseNo()]==null){
            throw new Error("[LICENCE] License not recognized.");
        }

        const svc = LicenceManager.wallet[pProject.getLicenseNo()];
        switch (pProductCode){
            case 'scanner.privacy':
                // add serial/key check
                svc['scanner.privacy'] = new PrivacyScanner({ project:pProject });
                break;
            case 'scanner.generic':
                // add serial/key check
                svc['scanner.generic'] = new GenericScanner({ project:pProject });
                break;
            default:
                throw new Error("Licence Server : Unknow product");
                break;
        }

        return svc[pProductCode];
    }

    /**
     *
     *
     * @param pProject
     * @param pProductCode
     */
    static getProduct( pProject:DexcaliburProject, pProductCode:string):Product {

        if(LicenceManager.wallet[pProject.getLicenseNo()]==null){
            throw new Error("[LICENCE] License not recognized.");
        }

        const svc = LicenceManager.wallet[pProject.getLicenseNo()];
        if(svc[pProductCode]!=null){
            // TODO : add credit balance check with key
            return svc[pProductCode];
        }else{
            return LicenceManager.activateProduct(pProject,pProductCode);
        }
    }

    /**
     *
     * @param pProject
     * @param pModels
     */
    static getProductByModels(pProject:DexcaliburProject, pModels:AssuranceModel[]):CompositeProductInfo {
        const p:{[key:string] :ProductInfo } = {};
        let total = 0;

        pModels.map(x => {
            const prod = LicenceManager.getProduct(pProject, x.scannerID)

            if(p[prod.__pCode]==null){
                p[prod.__pCode] = {
                    product: prod,
                    cost: 0,
                    balance: 10
                }
            }

            p[prod.__pCode].cost += 1;
            total += 1;
        });


        return {
            products: Object.values(p),
            totalCost: total
        };
    }

    static replenish(){
        LicenceManager.wallet["--"] = {
            "scanner.privacy": null,
            "scanner.generic": null
        };
    }


    checkCreditBalance( pUser:UserAccount, pProduct:any):void {
        // TODO
    }
}
