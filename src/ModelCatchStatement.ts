import ModelClass from "./ModelClass.js";
import ModelBasicBlock from "./ModelBasicBlock.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CoreDebug} from "./core/CoreDebug.js";

interface ITryCatchBoundary
{
    0: ModelClass,
    1: string|ModelBasicBlock,
    2: string|ModelBasicBlock,
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
        this.d[0] = pClass;
    }

    getException():ModelClass{
        return this.d[0];
    }

    setTryStart(pLabel:string|ModelBasicBlock){
        this.d[1] = pLabel;
    }

    getTryStart():string|ModelBasicBlock{
        return this.d[1];
    }

    setTryEnd(pLabel:string|ModelBasicBlock){
        this.d[2] = pLabel;
    }

    getTryEnd():string|ModelBasicBlock{
        return this.d[2];
    }

    setTarget(pLabel:string|ModelBasicBlock){
        this.d[3] = pLabel;
    }

    getTarget():string|ModelBasicBlock{
        return this.d[3];
    }

    toJsonObject():any {
        const o = {
            d: null
        };
        if(this.d != null){
            o.d = [];
            Object.keys(this.d).map((x)=>{
                o.d[x] = (typeof this.d[x]==='string')? this.d[x] : (this.d[x] as ModelBasicBlock).offset;
            })
        }
        CoreDebug.checkJsonSerialize(o, "ModelCatchStatement");
        return o;
    }
}
