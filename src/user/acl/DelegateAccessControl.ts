import {AccesErrCode, Access, AccessException, AccessMap, AccessProperty, AccessType} from "./Access.js";
import {AccessAttribute, AccessAttributeMap} from "./AccessAttribute.js";
import {UserAccount} from "../UserAccount.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../../Auditable.js";

/**
 *
 */
export abstract class DelegateAccessControl {


    static uid:string;

    static attr:Record<string, AccessAttribute<any>> = {};

    constructor() {

    }

    boot():void{}

    static registerAttributes<T>(pUID:string, pAttr:AccessAttribute<T>) {
        this.attr[pUID] = pAttr;
    }


    static getAttr<T>(pUID:string):AccessAttribute<T> {
        return this.attr[pUID];
    }


    check(pAccess:Access, pAccount:UserAccount, pResource?:any) {
        // nothing to do here
    }


    /**
     * To check if an attribute of a DexcaliburProject instance satisfies some constraints
     *
     * @param pAttr
     * @param pAccount
     * @param pProject
     * @param pMessage
     * @method
     */
    checkAttr(pAttr: AccessAttribute<any>, pAccount:UserAccount, pResource:Nullable<Auditable> = null, pMessage:string = ""):void {

    }
}