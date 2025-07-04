
import {IStringIndex} from "../core/IStringIndex.js";
import Util from "../Utils.js";
import {SearchOptions} from "./MerlinSearchAPI.js";
import {INode, Tag} from "@dexcalibur/dexcalibur-orm";

export const REGEXP_DELIMITER_TOKEN = '/';


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
  static REGEXP_DELIMITER_TOKEN = REGEXP_DELIMITER_TOKEN;
  static FIELD_TOK = '.';

  depth = 3;
  tag: Tag|null = null;
  tagKey: string|null = null;
  pattern: string|null = null;
  field: string|null = null;
  raw = "";
  regexp:boolean = false;
  error:any = null;
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

  /**
   * To enable regex search in condition
   *
   * @param {boolean} pSkipClean
   * @method
   */
  turnAsRegexp(pSkipClean = false):void{
    this.regexp = true;
    let p = this.pattern;
    if(!pSkipClean){

      const lastDeliminiter = p.lastIndexOf(REGEXP_DELIMITER_TOKEN);
      if(p.length>-1
          && p[0]==REGEXP_DELIMITER_TOKEN
          && (lastDeliminiter > 0)){

        const reFlags = p.substring(lastDeliminiter+1);
        this._re = new RegExp(p.substring(1,lastDeliminiter), reFlags);
        return;
      }
    }else{
      this._re = new RegExp(p);
    }
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
    return  (this.opts.range!=null) && (this.opts.range.length>0);
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

  setError(pOptions:any):void {
    this.error = pOptions;
  }

  hasError():boolean{
    return (this.error != null);
  }

  /**
   * To stringified and escaped regexp
   */
  getRegExpPattern():string {
    const source = this._re.source;

      return this._re.source;

  }

  /**
   * To check if a condition is only tag-based
   */
  isTagOnly():boolean {
    return (this.tagKey!=null && this.field=="");
  }

  /**
   * To check if a condition is only tag-based
   */
  hasTag():boolean {
    return (this.tagKey!=null);
  }

  /**
   * To check if a condition is applied to nested element
   */
  isNested():boolean {
    return (this.field!="" && this.field.indexOf(SearchRequestCondition.FIELD_TOK)>-1);
  }

  isFieldBased():boolean {
    return (this.field!="" && this.field.length>0);
  }

  getFieldParts():string[] {
    return  this.field.split(SearchRequestCondition.FIELD_TOK);
  }
}
