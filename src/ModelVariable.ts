import {NodeInternalType} from "./NodeInternalType.js";
import {DataType} from "./types/DataType.js";
import {CoreDebug} from "./core/CoreDebug.js";


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

/**
 * Represents a local/global variable or argument of a function
 *
 * @class
 */
export class ModelVariable {
  _t:NodeInternalType = NodeInternalType.VAR;
  __t:ModelVariableLocation = ModelVariableLocation.STACK;
  n:string = "";
  type:DataType;
  refs:ModelVariableReference = null;


  constructor(pConfig:any = null){

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
    return (this.__t==ModelVariableLocation.REG);
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

}
