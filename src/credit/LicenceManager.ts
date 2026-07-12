
/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {UserAccount} from "../user/UserAccount.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Product} from "./Product.js";
import AssuranceModel from "../audit/common/AssuranceModel.js";
import {LicenseManagerException} from "./errors/LicenseManagerException.js";
import {ReversenseProduct} from "../billing/ReversenseProduct.js";

interface ActivatedServices {
    [ productCode:string] :any
}

export type LicenseNo = string;


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

    static shop: Record<string, ReversenseProduct> = {};

    static wallet: Record<LicenseNo, ActivatedServices> = {};
    private static constructors: Record<string, any> = {};

    /**
     *
     * @param pProject
     * @param pProductCode
     */
    static activateProduct( pProject:DexcaliburProject, pProductCode:string):Product {

        if(pProject==null){
            throw LicenseManagerException.MISSING_PROJECT();
        }

        if(LicenceManager.wallet[pProject.getLicenseNo()]==null){
            throw LicenseManagerException.LICENSE_NOT_RECOGNIZED(pProject.getLicenseNo());
        }

        const svc = LicenceManager.wallet[pProject.getLicenseNo()];

        if(this.constructors[pProductCode]==null){
            throw new Error('Unknow product');
        }
        svc[pProductCode] = new (this.constructors[pProductCode])({ pProject: pProject });

        /*
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
        */
        return svc[pProductCode];
    }

    /**
     *
     *
     * @param pProject
     * @param pProductCode
     */
    static getProduct( pProject:DexcaliburProject, pProductCode:string):Product {

        if(pProject==null){
            throw LicenseManagerException.MISSING_PROJECT();
        }

        if(LicenceManager.wallet[pProject.getLicenseNo()]==null){
            throw LicenseManagerException.LICENSE_NOT_RECOGNIZED(pProject.getLicenseNo());
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

    /**
     * To register a product locally available
     *
     * @param {ReversenseProduct} pProduct product
     */
    static registerNewProduct(pProduct:ReversenseProduct, pConstructor:any):void {
            this.shop[pProduct.getUID()] = pProduct;
            this.constructors[pProduct.getUID()] = pConstructor;

            //console.log("REGISTER PRODUCT : ",pProduct.getUID(),this.shop)
    }

    static getAvailableProducts():ReversenseProduct[] {
        return Object.values(LicenceManager.shop);
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
