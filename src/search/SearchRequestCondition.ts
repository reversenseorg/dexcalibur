import { INode } from "../INode.js";
import {IStringIndex} from "../core/IStringIndex.js";
import { Tag } from "../tags/Tag.js";
import Util from "../Utils.js";
import {SearchOptions} from "./MerlinSearchAPI.js";


export interface ValidateOptions {
  range?: any[],
  interval?: any[],
  regexp?: RegExp,
  exists?: boolean,

  strict?: boolean
}

/**
 * Represent a condition from a search request
 *
 * @class
 */
export class SearchRequestCondition implements IStringIndex<any>{

  static WILDCARD = '*';

  depth = 3;
  tag: Tag|null = null;
  tagKey: string|null = null;
  pattern: string|null = null;
  field: string|null = null;
  raw = "";
  regexp:boolean = false;

  opts:SearchOptions = { not:false };

  private _re:RegExp|null = null;

  constructor(pConfig:any) {
    for(let i in pConfig){
      if(this.hasOwnProperty(i)){
        (this as IStringIndex<any>)[i] = pConfig[i];
      }
    }

    if(this.regexp===true && this.pattern!=null){
      this._re = new RegExp(this.pattern);
    }
  }

  hasPattern():boolean {
    return (this.pattern != null);
  }

  turnAsRegexp(pSkipClean = false):void{
    this.regexp = true;
    let p = this.pattern;
    if(!pSkipClean){
      if(p.startsWith("/")) p = p.substring(1);
      if(p.endsWith("/")) p = p.substring(0,p.length-1);
    }
    this._re = new RegExp(p);
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
    let match = false;


    if(this.pattern != null && this.field != null){
      const o = this.field.indexOf("*");
      if(o>-1){
        let tmpMatch = false;
        Util.walkOver( pObject, (pValue:any)=>{
          if(this.regexp){
            tmpMatch = tmpMatch || ((this._re as RegExp).test(pValue));
          }else{
            tmpMatch = tmpMatch || ((pValue as string)  == this.pattern);
          }
        }, (o>0 ? this.pattern.substr(0,o-1): ""), [], this.depth);
        match = tmpMatch;

      }else{
        const val = Util.readValue(pObject, this.field);
        //console.log(pObject.getUID(),this.field, ">>> ",val);
        if(this.regexp){
          match = ((this._re as RegExp).test(val));
          //console.log("regexp match > ",(this._re as RegExp),val,match);
        }
        else if(this.isRange()){
          match = ((this.opts.range as string[]).indexOf(val)>-1);
        }else{
          match = (val === this.pattern);
          //console.log("strict match > ",this.pattern,val,match);
        }
      }
    }

    if(this.tag != null){
      match = ((this.tag as Tag).match(pObject));
    }


    return match;
  }
}
