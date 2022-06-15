import {T} from "./Types";

export enum VAL_TYPE {
    CONSTANT,
    INOUT,
    OUTPUT
}

/**
 * @class
 */
export class TypedData {
    /**
     * Data type
     * See T
     * @field {string}
     */
    t:number = T.UINT32;

    /**
     * Type or arg name
     * @field {string}
     */
    n:string = null;

    /**
     * Register number holding extra value required to
     * interpret current data
     * @field {number}
     */
    r:number = -1;

    /**
     * Meaning of the value (conceptually) : file descriptor, pointer to struct, flags, ...
     * @field {Types.L}
     */
    l:number;

    /**
     * Optional. If the mean of the data is specified, an extra value to help to parse
     * or the parser
     * @field {any}
     */
    f?:any;

    /**
     * A flag if the value is constant ('const' keyword).
     * Non-constant value can be updated bue the syscall.
     *
     * Default is FALSE
     * @field {boolean}
     */
    c:boolean = false;

    /**
     * Optional. The list of error codes which can be hold by this data.
     * It helps to define the type of return value.
     * @field {any}
     */
    e?:any;

    /**
     * The length of the data if the data is an array or a L.BUFFER
     * @type {number}
     * @field
     */
    len?:number; // size if l => BUFFER

    /**
     * The raw value
     * @type {number}
     * @field
     */
    v?:number;

    /**
     *
     * @param pCfg
     * @constructor
     */
    constructor(pCfg:any = null) {
        if(pCfg != null){
            for(let i in pCfg) this[i] = pCfg[i];
        }
    }

    /**
     *
     * @param pCfg {any} Config
     * @return {TypedData} An instance of TypedData
     * @method
     * @static
     */
    static from(pCfg:any){
        return new TypedData(pCfg);
    }

    static buffer(pType:TypedData, pSize:number =-1){
        return null; //pType.copy();
    }

    out(){
        return this.copy().update({ v: VAL_TYPE.OUTPUT });
    }

    update( pCfg:any){
        for(let i in pCfg){
            this[i] = pCfg[i];
        }
        return this;
    }

    copy( pName:string=null){
        let t:TypedData = new TypedData(this);
        if(pName!=null)  t.n = pName;
        return t;
    }

    constant(pConst = true){
        this.c  = pConst;
        return this;
    }

    asReturn( pError:any[]=[]){
        let t:TypedData = new TypedData(this);
        t.e = pError;
        return t;
    }
}