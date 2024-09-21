import ModelClass from "./ModelClass.js";
import ModelBasicBlock from "./ModelBasicBlock.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "./core/CoreDebug.js";
import {NodeUtils} from "@dexcalibur/dexcalibur-orm";

enum EBoundary {
    ExceptionClass = 0,
    TryStart = 1,
    TryEnd = 2,
    Target = 3,
}

interface ITryCatchBoundary
{
    // Exception class
    0: ModelClass,
    /**
     * Try Start block
     */
    1: string|ModelBasicBlock,

    /**
     * Try End block
     */
    2: string|ModelBasicBlock,


    /**
     * Target block
     */
    3: string|ModelBasicBlock,
};

/**
 * ```
 * try {
 *  [block]
 * }catch( [ cond ] ){
 *  [block]
 * }
 *
 * ```
 */
export default class ModelCatchStatement
{
    __ = NodeInternalType.CATCH_STMT;

    d:ITryCatchBoundary = null;

    constructor(){
        this.d = {} as ITryCatchBoundary;
    }

    setException(pClass:ModelClass){
        this.d[EBoundary.ExceptionClass] = pClass;
    }

    getException():ModelClass{
        return this.d[EBoundary.ExceptionClass];
    }

    setTryStart(pLabel:string|ModelBasicBlock){
        this.d[EBoundary.TryStart] = pLabel;
    }

    getTryStart():string|ModelBasicBlock{
        return this.d[EBoundary.TryStart];
    }

    setTryEnd(pLabel:string|ModelBasicBlock){
        this.d[EBoundary.TryEnd] = pLabel;
    }

    getTryEnd():string|ModelBasicBlock{
        return this.d[EBoundary.TryEnd];
    }

    setTarget(pLabel:string|ModelBasicBlock){
        this.d[EBoundary.Target] = pLabel;
    }

    getTarget():string|ModelBasicBlock{
        return this.d[EBoundary.Target];
    }

    toJsonObject():any {
        const o = {
            d: null
        };

        if(this.d != null){
            o.d = [];
            o.d[0] = ((this.d[0]!=null && NodeUtils.isNode(this.d[0]))? this.d[0].getUID() : this.d[0] );
            Object.keys(this.d).map((x:any)=>{
                if(x==0) return;
                if(this.d[x]==null){ o.d[x]=null; return;  }

                if(typeof this.d[x]!=='string'){
                    o.d[x] = (this.d[x] as ModelBasicBlock).offset;
                }else{
                    o.d[x] =  this.d[x] ;
                }

            })
        }
        CoreDebug.checkJsonSerialize(o, "ModelCatchStatement");
        return o;
    }
}
