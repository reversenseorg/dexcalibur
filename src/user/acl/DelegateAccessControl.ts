import {AccesErrCode, Access, AccessException, AccessMap, AccessProperty, AccessType} from "./Access.js";
import {AccessAttribute, AccessAttributeMap} from "./AccessAttribute.js";
import {UserAccount} from "../UserAccount.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../../Auditable.js";


export abstract class DelegateAccessControl {


    static uid:string;

    static attr:AccessAttributeMap = {};

    constructor() {

    }

    boot():void{}

    static registerAttributes(pUID:string, pAttr:AccessAttribute) {
        this.attr[pUID] = pAttr;
    }


    static getAttr(pUID:string):AccessAttribute {
        return this.attr[pUID];
    }


    check(pAccess:Access, pAccount:UserAccount, pResource?:any) {

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
    checkAttr(pAttr: AccessAttribute, pAccount:UserAccount, pResource:Nullable<Auditable> = null, pMessage:string = ""):void {

    }
}