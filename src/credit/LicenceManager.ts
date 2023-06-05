
import {UserAccount} from "../user/UserAccount.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {Product} from "./Product.js";
import {PrivacyScanner} from "../audit/privacy/PrivacyScanner.js";
import {GenericScanner} from "../audit/common/GenericScanner.js";

interface ActivatedServices {
    [ productCode:string] :any
}

interface ServiceWallet {
    [ projectSerial:string] :ActivatedServices
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
            "scanner.privacy": null,
            "scanner.generic": null
        };
    }


    checkCreditBalance( pUser:UserAccount, pProduct:any):void {
        // TODO
    }
}
