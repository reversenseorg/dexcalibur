
import {Nullable} from "@dexcalibur/dxc-core-api";


export type AccessAttributeMap = Record<string, AccessAttribute<any>>;

export interface AccessAttributeOptions<F> {
    name?:string;
    value?:F[];
}
/**
 * Represents an access point
 */
export class AccessAttribute<T> {

    private _n:string;
    private _v:T[];

    constructor( pName:string, pValue:T[] = []) {
        this._n = pName;
        this._v= pValue;
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

    /**
     * To create an instance from a poor object
     * @param {any} pData
     */
    static from<T>(pData:AccessAttributeOptions<T>):AccessAttribute<T> {
        return new AccessAttribute<T>(pData.name, (pData.hasOwnProperty('value')? pData.value : ([] as T[]) ));
    }

    append(pVal:T):void {
        if(this._v==null) this._v = [];
        this._v.push(pVal);
    }
    /**
     * To clone without value
     *
     */
    clone():AccessAttribute<T> {
        return new AccessAttribute(this._n);
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
                _v: (this._v != null && this._v.hasOwnProperty('toJsonObject'))? (this._v as any).toJsonObject() : this._v
            };
        }else{
            return (this._v != null && this._v.hasOwnProperty('toJsonObject'))? (this._v as any).toJsonObject() : this._v;
        }

    }
}