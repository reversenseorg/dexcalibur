import { INode } from "../INode.js";
import {IStringIndex} from "../core/IStringIndex.js";
import { Tag } from "../tags/Tag.js";
import Util from "../Utils.js";
import {SearchOptions} from "./MerlinSearchAPI.js";


export interface ValidateOptions {
  range?: any[],
  interval?: any[],
  regexp?: RegExp,
  exists?: boolean
}

export class SearchRequestCondition implements IStringIndex{

  static WILDCARD = '*';

  depth = 3;
  tag: Tag|null = null;
  pattern: string|null = null;
  field: string|null = null;
  raw = "";
  regexp:boolean = false;

  opts:SearchOptions = { not:false };

  private _re:RegExp|null = null;

  constructor(pConfig:any) {
    for(let i in pConfig){
      if(this.hasOwnProperty(i)){
        (this as IStringIndex)[i] = pConfig[i];
      }
    }

    if(this.regexp===true && this.pattern!=null){
      this._re = new RegExp(this.pattern);
    }
  }

  hasPattern():boolean {
    return (this.pattern != null);
  }

  isQueryString():boolean {
    return (this.opts.hasOwnProperty('query_string') && (this.opts.query_string===true));
  }

  isRegExp():boolean {
    return (this.opts.hasOwnProperty('regexp') && (this.opts.regexp===true));
  }

  isStrict():boolean {
    return (this.opts.strict!=null) && this.opts.strict;
  }

  isRange():boolean {
    return (this.opts.range!=null) && (this.opts.range.length>0);
  }

  isNotMatch():boolean {
    return this.opts.not;
  }

  getRaw():string {
    return this.raw;
  }

  getRange():string[] {
    return this.opts.range as string[];
  }
  /**
   * To test a condition on in-memory object
   *
   *  process.*:explorer
   *  *:exploreer
   *
   *
   * @param pObject
   */
  test(pObject:INode):boolean {
    let match = true;


    if(this.pattern != null && this.field != null){
      const o = this.field.indexOf("*");
      if(o>-1){
        Util.walkOver( pObject, (pValue:any)=>{
          if(this.regexp){
            match = match && ((this._re as RegExp).test(pValue));
          }else{
            match = match && ((pValue as string)  == this.pattern);
          }
        }, (o>0 ? this.pattern.substr(0,o-1): ""), [], this.depth);
      }else{
        const val = Util.readValue(pObject, this.field);
        if(this.regexp){
          match = match && ((this._re as RegExp).test(val));
        }
        else if(this.isRange()){
          match = match && ((this.opts.range as string[]).indexOf(val)>-1);

        }else{
          match = match && (val  == this.pattern);
        }
      }
    }

    if(this.tag != null){
      match = match && ((this.tag as Tag).match(pObject));
    }


    return match;
  }
}
