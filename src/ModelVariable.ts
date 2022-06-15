import {NodeInternalType} from "./NodeInternalType";
import {DataType} from "./types/DataType";


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
    let o:any={};
    for(let i in this) o[i]=this[i];
    return o;
  }

}
