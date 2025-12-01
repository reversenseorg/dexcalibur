
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {DataType} from "./types/DataType.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {ModelRegister} from "./elixir/ModelRegister.js";
import {RegisterType} from "./elixir/common.js";


export enum ModelVariableType {
  VAR='var',
  REG='reg'
}

export enum ModelVariableLocation {
  STACK='arg',
  REG='reg'
}

interface ModelVariableReference {
  reg?:string;
  base?:string;
  offset?:string;
}

export interface ModelVariableOptions {
    n?:string;
    type?:DataType;
    refs?:ModelVariableReference[];
    reg?:Nullable<ModelRegister>;
    offset?:number;
}
/**
 * Represents a local/global variable or argument of a function
 *
 * @class
 */
export class ModelVariable {

    __:NodeInternalType = NodeInternalType.VAR;

    _t:NodeInternalType = NodeInternalType.VAR;

  __t:ModelVariableLocation = ModelVariableLocation.STACK;

  n:string = "";

  name:string = "";

  type:DataType;

  refs:ModelVariableReference = null;

  reg:Nullable<ModelRegister> = null;

  offset:number = 0;

  constructor(pConfig:Nullable<ModelVariableOptions> = null){
    if(pConfig!==undefined)
      for(let i in pConfig)
        this[i]=pConfig[i];
  }

  getName():string{
    return this.n;
  }

  /**
   * TODO
   */
  isArray():boolean {
    return false;
  }

  /**
   * To check if the variable is stored
   */
  isRegister(){
    return (this.reg!=null && this.reg.type==RegisterType.CPU);
  }

    /**
     * To check if the variable is stored
     */
    isOnStack(){
        return (this.reg!=null && this.reg.type==RegisterType.CPU && this.reg.name==="sp" && this.offset>-1);
    }


  /**
   * TODO
   */
  isPointer():boolean {
    return false;
  }

  getType():DataType{
    return this.type;
  }

  getRef():ModelVariableReference{
    return this.refs;
  }

  toJsonObject():any {
    const o:any={};
    for(const i in this){
      switch (i){
        case 'type':
          o.type = (this.type != null ? this.type.getName() : null);
          break;
        default:
          o[i]=this[i];
          break;
      }
    }
    CoreDebug.checkJsonSerialize(o, "ModelVariable");
    return o;
  }

  static fromObject(pOpts:any):ModelVariable {
      const o = new ModelVariable(pOpts);
      if(pOpts.reg!=null){
          o.reg = new ModelRegister(pOpts.reg);
      }
      return o;
  }

}
