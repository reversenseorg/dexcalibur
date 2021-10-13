import {Access, AccessType} from "./Access";


export interface AccessAttributeMap {
    [uid:string] :AccessAttribute
}

/**
 * Represents an access point
 */
export class AccessAttribute {

    private _n:string;
    private _v:any;

    constructor( pName:string, pValue:any = null) {
        this._n = pName;
        this._v= pValue;
    }


    get name():string {
        return this._n;
    }

    get value():string {
        return this._v;
    }


    set value(v:string) {
        this._v = v;
    }

    /**
     * To create an instance from a poor object
     * @param {any} pData
     */
    static from(pData:any):AccessAttribute {
        return new AccessAttribute(pData.name, (pData.hasOwnProperty('value')? pData.value : null));
    }

    /**
     * To clone without value
     *
     */
    clone():AccessAttribute {
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
                _v: (this._v != null && this._v.hasOwnProperty('toJsonObject'))? this._v.toJsonObject() : this._v
            };
        }else{
            return (this._v != null && this._v.hasOwnProperty('toJsonObject'))? this._v.toJsonObject() : this._v;
        }

    }
}