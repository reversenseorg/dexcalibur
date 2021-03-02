import {NodeType} from "./NodeType";


export enum ModelVariableType {
  VAR,
  REG
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

  getName():string{
    return this.n;
  }

  getType():string{
    return this.type;
  }

  getRef():ModelVariableReference{
    return this.refs;
  }
}
