
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {UserGroupUUID} from "./common/UserGroup.js";


export type AccessAttributeMap = Record<string, AccessAttribute<any>>;

export interface AccessAttributeOptions<F> {
    name?:string;
    value?:F[];
    type?:Nullable<NodeInternalType>;
}
/**
 * Represents an access point
 */
export class AccessAttribute<T> {

    private _n:string;
    private _v:T[];
    private _t:NodeInternalType;


    constructor( pName:string, pValue:T[] = [], pType:NodeInternalType = NodeInternalType.USER_ACCOUNT) {
        this._n = pName;
        this._v= pValue;
        this._t = pType;
    }


    get name():string {
        return this._n;
    }

    get value():T[] {
        return this._v;
    }


    set value(v:T[]) {
        this._v = v;
    }

    /*
    get usergroup():UserGroupUUID {
        return this._t;
    }

    set usergroup(g:UserGroupUUID) {
        this._g = g;
    }*/

    is(pType:NodeInternalType):boolean {
        return (this._t===pType);
    }

    /**
     * To create an instance from a poor object
     * @param {any} pData
     */
    static from<T>(pData:AccessAttributeOptions<T>):AccessAttribute<T> {
        return new AccessAttribute<T>(pData.name, (pData.hasOwnProperty('value')? pData.value : ([] as T[]) ),pData.type);
    }

    append(pVal:T):void {
        if(this._v==null) this._v = [];

        if(this._v.indexOf(pVal)>-1) return;

        this._v.push(pVal);
    }
    /**
     * To clone without value
     *
     */
    clone():AccessAttribute<T> {
        return new AccessAttribute(this._n, [], this._t);
    }


    /**
     * To serialize into poor object ready to be serialized
     *
     * @param {boolean} pAll If true object is converted into poor object, else, only value is serialized
     * @method
     */
    toJsonObject(pAll:boolean = false):any {
        if(pAll){
            return {
                _n: this._n,
                _v: (this._v != null && this._v.hasOwnProperty('toJsonObject'))? (this._v as any).toJsonObject() : this._v,
                _t: this._t
            };
        }else{
            return (this._v != null && this._v.hasOwnProperty('toJsonObject'))? (this._v as any).toJsonObject() : this._v;
        }

    }
}