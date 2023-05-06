
import {UserAccount} from "../user/UserAccount.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Product} from "./Product.js";
import {PrivacyScanner} from "../audit/privacy/PrivacyScanner.js";

interface ActivatedServices {
    [ productCode:string] :any
}

interface ServiceWallet {
    [ projectSerial:string] :ActivatedServices
}


export class LicenceManager {

    static wallet: ServiceWallet = {};

    static activateProduct( pProject:DexcaliburProject, pProductCode:string):Product {

        if(LicenceManager.wallet[pProject.getLicenseNo()]==null){
            throw new Error("[LICENCE] License not recognized.");
        }

        const svc = LicenceManager.wallet[pProject.getLicenseNo()];
        switch (pProductCode){
            case 'PRI_CLD_SSCAN':
                // add serial/key check
                svc[pProductCode] = new PrivacyScanner({ project:pProject });
                break;
            default:
                throw new Error("Licence Server : Unknow product");
                break;
        }

        return svc[pProductCode];
    }

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

    static replenish(){
        LicenceManager.wallet["--"] = {
            PRI_CLD_SSCAN: null
        };
    }


    checkCreditBalance( pUser:UserAccount, pProduct:any):void {
        // TODO
    }
}
