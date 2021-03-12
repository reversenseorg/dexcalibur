import {NodeType} from "./NodeType";


export enum ModelVariableType {
  VAR='var',
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
  _t:NodeType = NodeType.VAR;
  __t:ModelVariableType = ModelVariableType.VAR;
  n:string = "";
  type:string = "";
  refs:ModelVariableReference = null;


  constructor(pConfig:any = null){

    if(pConfig!==undefined)
      for(let i in pConfig)
        this[i]=pConfig[i];

  }

  getName():string{
    return this.n;
  }

  getType():string{
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
