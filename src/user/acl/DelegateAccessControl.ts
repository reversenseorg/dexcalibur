import {Access, AccessMap, AccessProperty, AccessType} from "./Access";
import {UserSession} from "../session/UserSession";
import {AccessAttribute, AccessAttributeMap} from "./AccessAttribute";


export abstract class DelegateAccessControl {


    static uid:string;

    static access:AccessMap = {};
    static attr:AccessAttributeMap = {};

    constructor() {

    }

    static registerAccess(pUID:string, pAccess:Access) {
        this.access[pUID] = pAccess;
    }

    static registerAttributes(pUID:string, pAttr:AccessAttribute) {
        this.attr[pUID] = pAttr;
    }


    static getAccess(pUID:string):Access {
        return this.access[pUID];
    }

    static getAttr(pUID:string):AccessAttribute {
        return this.attr[pUID];
    }

    /**
     * To get a list of access point by matching rule
     *
     * Helpful to fill access lists of user role
     *
     * @param {AccessProperty} pProperty
     * @param {string} pPattern A regexp
     */
    static getMatchingAccesses( pProperty:AccessProperty, pPattern:string|AccessType):AccessMap {
        let o:AccessMap = {};
        let r:any = null;
        switch (pProperty) {
            case AccessProperty.UID:

                r = new RegExp(pPattern as string);
                for(let k in this.access){
                    if(r.test(k))
                        o[k] = this.access[k];
                }
                break;
            case AccessProperty.TYPE:
                for(let k in this.access){
                    if(this.access[k].type == AccessType[pPattern])
                        o[k] = this.access[k];
                }
                break
            case AccessProperty.NAME:
            case AccessProperty.DESCR:

                r = new RegExp(pPattern as string);
                for(let k in this.access){
                    if(r.test(this.access[k][pProperty]))
                        o[k] = this.access[k];
                }
                break;
        }

        return o;
    }


    abstract check(pAccess:Access, pSession:UserSession, pExtra:any);

    abstract checkAttr(pAccess:AccessAttribute, pSession:UserSession, pExtra:any);
}