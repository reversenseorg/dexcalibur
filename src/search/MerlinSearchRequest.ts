import {MerlinSearchAPI, SearchOptions} from "./MerlinSearchAPI.js";
import {FinderResult} from "./FinderResult.js";
import {Finder} from "./Finder.js";
import {SearchRequestCondition, ValidateOptions} from "./SearchRequestCondition.js";
import Util from "../Utils.js";
import {OperatingSystem} from "../platform/OperatingSystem.js";
import {BusSubscriber} from "../Bus.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {NodeInternalType, NodeInternalTypeName}
from "@dexcalibur/dxc-core-api";;
import {CoreDebug} from "../core/CoreDebug.js";
import {MerlinPrimitive, MerlinType} from "./MerlinPrimitive.js";
import {NodeType, NodeProperty, IDbCollection, IDbIndex} from "@dexcalibur/dexcalibur-orm";
import * as Log from "../Logger.js";
import {Nullable} from "../core/IStringIndex.js";
import {SearchPattern} from "./SearchPattern.js";
import {SearchToken} from "./SearchToken.js";

const TAG_TOKEN = '@';
const SEP_TOKEN = ':';
const REL_TOKEN = '.';
const REGEXP_DELIMITER_TOKEN = '/';


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum OperationType {
  SEARCH,
  AGGR,
  FILTER,
  SIZE,
  VALIDATE,
  TIME,
  UNION,
  INTERSECT,
  JOIN,
  INNERJOIN,
  TAINT_SRC,
  TAINT_SINK,
  TAINT_STEP,
  SELECT
}


export enum Comparison {
  LTE,
  GTE,
  LT,
  GT,
  EQ
}


export interface SearchOperationArgs {
  pattern: SearchRequestCondition
}

export interface ValidateOperationArgs {
  pattern: string,
  opts?: ValidateOptions
}

export interface WindowingOperationArgs {
  offset?: number,
  limit?: number
}

export interface NestedRequestOperationArgs {
  request: MerlinSearchRequest,
  cond?: any
}

export interface InnerjoinOperationArgs {
  on: NodeProperty|string,
  cond?: SearchRequestCondition
}

// AggregationOption
export interface AggregationOperationArgs {
  on: string,
  opts?: AggregationOption,
  size?:number
}

export interface TaintOperationArgs {
  request: MerlinSearchRequest[]
}

export interface TimeOperationArgs {
  comparison: Comparison,
  field: string,
  date: number
}

export interface Operation {
  type: OperationType,
  args: SearchOperationArgs | InnerjoinOperationArgs | TimeOperationArgs | ValidateOperationArgs | WindowingOperationArgs | NestedRequestOperationArgs | AggregationOperationArgs | TaintOperationArgs ;
}

interface SearchRequestOptions {
  aggregation: boolean,
  cache: boolean,
  limit: number;
  offset: number;
  nestedOp:boolean;
}

export interface AggregationOption {
  alias: string,
  size?: number
}




export interface ValidationResult {
  success: boolean,
  force: number
}


/**
 * @class
 */
export class MerlinSearchRequest implements MerlinPrimitive{

  TYPE = MerlinType.REQUEST;

  private _live = false;

  private _ctx:MerlinSearchAPI;
  private _type:NodeType|string;
  private _oper:Operation[];
  private _aggs = 0;
  private _search = 0;

  private _evt:string[] = []

  private _options:SearchRequestOptions = {
    aggregation: false,
    cache: true,
    limit: -1,
    offset: 0,
    nestedOp: false
  };


  /**
   *
   * @param pSearchContext
   * @param pNodeType
   * @param pOper
   */
  constructor(pSearchContext:MerlinSearchAPI, pNodeType:NodeType|string, pOper:Operation[] ) {
    this._ctx = pSearchContext;
    this._type = pNodeType;
    this._oper = pOper;
  }

  /**
   * To set the context of search request
   *
   * Some args of operations are set at this step :
   * - tags are resolved
   *
   * @param pSearchContext
   */
  setContext(pSearchContext:MerlinSearchAPI):MerlinSearchRequest {

    this._ctx = pSearchContext;

    //if(this._ctx==null){
      // resolve project-dependent args
      let opeArgs:SearchOperationArgs;
      for(let i=0; i<this._oper.length; i++){
        switch (this._oper[i].type){
          case OperationType.SEARCH:
          case OperationType.FILTER:
              try{
                opeArgs = this._oper[i].args as SearchOperationArgs;
                if((opeArgs.pattern.tagKey!=null) && (pSearchContext.getDB().ctx!=null)){
                  opeArgs.pattern.tag = pSearchContext
                      .getDB().ctx
                      .getTagManager()
                      .getTag(opeArgs.pattern.tagKey);
                }
              }catch(e){
                Logger.error(e.message);
              }
              break
        }
      }

      return this;
  }

  /**
   * Livre request operate exclusively in memory
   */
  isLiveRequest():boolean {
    return this._live;
  }

  countAggregation():number {
    return this._aggs;
  }

  countSearch():number {
    return this._search;
  }

  isRule():boolean {
    return false;
  }

  /**
   * @return {MerlinSearchAPI}
   * @method
   */
  getContext():MerlinSearchAPI {
    return this._ctx;
  }

  /**
   *
   */
  getNode():NodeType|string {
    return this._type;
  }

  addOperation( pOper:Operation):MerlinSearchRequest {
    this._oper.push(pOper);
    return this;
  }

  /**
   * To remove all operations
   *
   * @method
   */
  flushOperations():MerlinSearchRequest {
    this._oper = [];
    return this;
  }

  /**
   *
   *  dataFormat("dataSource@microsoft:aaa")
   *
   *  "field:pattern"
   *  "field@tag"
   *  "@tag"
   *
   * { pattern:"data.event_log.id:$1", elem:[1] }
   * @param {MerlinSearchAPI} pSearchContext Context
   * @param {string} pCond Condition string
   * @param {SearchOptions} pOptions Search options
   *
   */
  static parseCondition(pCond:string, pOptions:SearchOptions):SearchRequestCondition {
    const d = pCond.indexOf(':');
    const offsetTag = pCond.indexOf('@');
    let tagUID = null;
    const cond:SearchRequestCondition = new SearchRequestCondition({
      field: null,
      pattern: null,
      tag: null,
      regexp: false,
      raw: pCond,
      opts: pOptions,
      tagKey: null
    });

    if(d>-1){
      cond.field = pCond.substr(0,d);
      cond.pattern = pCond.substr(d+1);
    }else{
      cond.pattern = null;
      cond.field = (offsetTag>-1)? pCond.substr(0, offsetTag) : pCond;
      if((offsetTag > -1) && !pOptions.query_string ){
        cond.tagKey = pCond.substr(offsetTag+1);
      }
    }

    if(cond.pattern != null){
      if(/^\/.+\/[ig]*/i.test(cond.pattern)){
        cond.turnAsRegexp();
      }
    }

    return cond;
  }




  /**
   * To parse a pattern like [native:]*ssl*.
   *
   * Legacy pattern :
   * ----------
   * is.<modifier>
   * has.<tag>
   * <property_path>:<pattern>
   *
   * Legacy behavior :
   * -----------
   * Every patterns are processed are case-sensitive RegExp
   *
   * New operations :
   * ----------------
   * [<property_path>]@<tag_uid>
   * <property_path>:/<regexp>/
   * <property_path>:<non-regexp>
   *
   - wildcard : replace any char
   - case sensitive
   - add unicode
   * @param {*} dataModel
   * @param String pattern
   * @param Boolean caseSensitive
   * @param Boolean lazy If FALSE, verify if the field exists
   * @returns {SearchPattern} The parsed search pattern, ready to be used
   */
  static parseCondition2(pCond: string, pOptions:SearchOptions):SearchRequestCondition {


    if (pCond == undefined || pCond.length == 0) {
      Logger.info("[!] find : Pattern cannot be null");
      return null;
    }

    let pattern = pCond;
    let token: string | string[] = "name", lex: number = -1, isDeepSearch: boolean = false;
    let tag:Nullable<string> = null;
    let  fn: any = null, flags: string = "";

    const cond:SearchRequestCondition = new SearchRequestCondition({
      field: null,
      pattern: null,
      tag: null,
      regexp: false,
      raw: pCond,
      opts: pOptions,
      tagKey: null
    });


    const tagPosition = pattern.indexOf(TAG_TOKEN);
    const sepPosition = pattern.indexOf(SEP_TOKEN);

    if(tagPosition>-1){
      if(sepPosition > -1 && tagPosition > sepPosition){
        // '@' character is not a token but a part of pattern
        // case :    <property_path>:any_val_with_@_char
      }else{
        // '@' is the token of a tag
        tag = pattern.substring(tagPosition+1);
        if(tagPosition>0)
          token = pattern.substring(0,tagPosition);
        else
          token = "";
      }
    }

    if(tag==null){
      // parse pattern
      // "is"
      if(pattern.substring(0, 3) == "is.") {
        if ((lex = pattern.indexOf(SEP_TOKEN)) > -1) {
          token = pattern.substring(3, lex - 3);
          pattern = pattern.substr(lex + 1, pattern.length - lex - 1);
        } else {
          token = pattern.substr(3, pattern.length - 3);
          pattern = "";
        }

        cond.pattern = pattern;
        cond.field = token;

      } /*else if (pattern.substring(0, 4) == "has.") {
        //console.debug("Tag-based request detected");

        cond.pattern = null;
        cond.tagKey = pattern.substring(4);
      } */else {
            if ((lex = pattern.indexOf(SEP_TOKEN)) > -1) {
              cond.field = token = pattern.substring(0, lex);
              cond.pattern = pattern = pattern.substring(lex + 1);
            } else {
              // DEFAULT field must be parameterized, it depends of root node
              cond.field = token = "name";
              //pattern = pattern; //"";
            }
      }

    }else{
      cond.field = token;
      cond.tagKey = tag;
    }

    /*
    if ((lex = pattern.indexOf(SEP_TOKEN)) > -1) {
      token = pattern.substring(0, lex);
      pattern = pattern.substring(lex + 1);
    } else {
      token = "name";
    }*/

    // check if it is a deep search
    if (token.indexOf(REL_TOKEN) > -1) {
      //token = token.split(".");
      isDeepSearch = true;
      //console.debug("Deep search detected !");
    }


    // TODO : remove -non-lazy mode
    /*if (lazy === false && isDeepSearch === false && dataModel[token] === undefined) {
      Logger.info("[!] The property '" + token + "' not exists for these objects");
      return null;
    }*/

    const lastDeliminiter = pattern.lastIndexOf(REGEXP_DELIMITER_TOKEN);
    if(pattern.length>-1
        && pattern[0]==REGEXP_DELIMITER_TOKEN
        && (lastDeliminiter > 0)){

      //const reFlags = pattern.substring(lastDeliminiter+1);

      //const rx = new RegExp(pattern.substring(1,lastDeliminiter), reFlags);

      cond.regexp = true;
      cond.turnAsRegexp();
      //cond.pattern = rx;

    }else if(pattern.length > 0){
      // Logger.raw("Strict equal > ",pattern);
      fn = function (x:string) {
        return (pattern.localeCompare(x,"en", {sensitivity: 'case'})===0);
      };
      cond.pattern = pattern;
    }

    return cond;
  }


  /**
   *
   * @param pSearchContext
   * @param pNodeType
   * @param pCondition
   * @param pOptions
   */
  static fromCondition(pSearchContext:MerlinSearchAPI, pNodeType:NodeType, pCondition:string|any, pOptions:SearchOptions):MerlinSearchRequest {
    const req = new MerlinSearchRequest(pSearchContext, pNodeType, [] );

    if((typeof pCondition)==="string"){
      if(pCondition.length>0){
        req.addOperation({
          type:OperationType.SEARCH, args:{
            pattern: MerlinSearchRequest.parseCondition2(pCondition, pOptions)
          }
        });
      }
    }else if(pCondition!=null){
      // TODO : add object-based pattern instead of string
      req.addOperation({
        type:OperationType.SEARCH, args:{
          pattern: MerlinSearchRequest.parseCondition2(pCondition, pOptions)
        }
      });
    }

    // if DexcaliburProject is available then tags are resolved in operations
    // to create ready-to-use request
    if(pSearchContext.getDB()!=null && pSearchContext.getDB().ctx!=null){
      return req.setContext(pSearchContext);
    }else
      return req;
  }

  static newLiveRequest(pSearchContext:MerlinSearchAPI, pNodeType:NodeType):MerlinSearchRequest{
    const req = new MerlinSearchRequest(pSearchContext, pNodeType, [] );
    req._live = true;
    return req;
  }

  /**
   * To import existing opertation
   *
   * from DataSourceFormat as example
   *
   * @param pOperations
   */
  importOperations( pOperations:Operation[] ):MerlinSearchRequest {
    pOperations.map(x => { this.addOperation(x) });
    return this;
  }

  /**
   *
   * @param pPattern
   * @param pOptions
   */
  validate( pPattern:string, pOptions:ValidateOptions = {exists:true}):MerlinSearchRequest {
    this.addOperation({
      type:OperationType.VALIDATE, args:{
        pattern: pPattern,
        opts: pOptions
      }
    });
    return this;
  }


  /**
   * If NO cache, then the request ll be executed on DB server, and the cache ill not be refresh
   */
  nocache():MerlinSearchRequest {
    this._options.cache = false;
    return this;
  }

  search( pRequest:string, pOptions:SearchOptions = { not:false }):MerlinSearchRequest {
    this._oper.push({ type: OperationType.SEARCH, args:{ pattern: MerlinSearchRequest.parseCondition2(pRequest,pOptions) } });
    this._search++;
    return this;
  }

  not( pRequest:string, pOptions:SearchOptions = { not:true }):MerlinSearchRequest {
     // force
    pOptions.not = true;
    this._oper.push({ type: OperationType.SEARCH, args:{ pattern: MerlinSearchRequest.parseCondition2(pRequest,pOptions) } });
    this._search++;
    return this;
  }


  after( pDate:string, pField:string = "@timestamp"):MerlinSearchRequest {
    const date = (pDate=="now")? (new Date()) : new Date(pDate);
    this._oper.push({ type: OperationType.TIME, args: { comparison:Comparison.GTE, field:pField, date:date.getTime() } });
    return this;
  }

  before( pDate:string, pField:string|null= "@timestamp"):MerlinSearchRequest {
    const date = (pDate=="now")? (new Date()) : new Date(pDate);
    this._oper.push({ type: OperationType.TIME, args: { comparison:Comparison.LTE, field:pField, date:date.getTime() } });
    return this;
  }

  filter( pRequest:string, pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    // force NOT to be false
    pOptions.not = false;
    this._oper.push({ type: OperationType.FILTER, args:{ pattern: MerlinSearchRequest.parseCondition2(pRequest,pOptions) } });
    return this;
  }

  /**
   * To perform request on data encapsulated into a bus event
   *
   * @param {string} pBusEventType Event type
   * @return {MerlinSearchRequest} The request instance
   * @method
   */
  on(pBusEventType:string):MerlinSearchRequest{
    this._evt.push(pBusEventType);
    return this;
  }

  /**
   *
   */
  hasBusSubscriber():boolean {
    return (this._evt.length>0);
  }

  getSubscribeList():string[] {
    return this._evt;
  }

  toBusSubscriber(pAssess:any):BusSubscriber {
    return BusSubscriber.from( ( pEvent)=>{
      if(this.executeLive(pEvent.getData())){
        //pAssess.addMatch();
      }
    });
  }

  /**
   *
   */
  hasAggregate(){
    if(this._options.nestedOp){
      let hasAggr = false;
      this._oper.map(x => {
        switch (x.type){
          case OperationType.UNION:
          case OperationType.INTERSECT:
          case OperationType.JOIN:
            hasAggr = hasAggr || ((x.args as NestedRequestOperationArgs).request as MerlinSearchRequest).hasAggregate();
            break;
        }
      });
      return hasAggr;
    }else{
      return (this._options.aggregation === true);
    }
  }

  select( pNodePpt:NodeProperty, pOpts?:any):MerlinSearchRequest {
    //this._oper.push({ type: OperationType.FILTER, args: { on:pNodePpt, opts:pOpts } });
    this._oper.push({ type: OperationType.INNERJOIN, args: { on:pNodePpt, opts:pOpts } });
    return this;
  }

  aggregate( pOn:string, pAggOptions:AggregationOption):MerlinSearchRequest{
    this._options.aggregation = true;
    this._oper.push({ type: OperationType.AGGR, args: { on:pOn, opts:pAggOptions } });
    this._aggs++;
    return this;
  }


  union(pNestedRequest:MerlinSearchRequest):MerlinSearchRequest {
    this._options.nestedOp = true;
    this._oper.push({ type: OperationType.UNION, args: { request:pNestedRequest } });
    return this;
  }


  intersect(pNestedRequest:MerlinSearchRequest):MerlinSearchRequest {
    this._options.nestedOp = true;
    this._oper.push({ type: OperationType.INTERSECT, args: { request:pNestedRequest } });
    return this;
  }

  join(pNestedRequest:MerlinSearchRequest, pCondition:string[]):MerlinSearchRequest {
    this._options.nestedOp = true;
    this._oper.push({ type: OperationType.JOIN, args: { request:pNestedRequest, cond:pCondition } });
    return this;
  }

  /**
   *
   * @param pSize
   */
  limit(pSize:number):MerlinSearchRequest {
    this._options.limit = pSize;
    this._oper.push({ type: OperationType.SIZE, args: { limit:pSize } });
    return this;
  }

  offset(pOffset:number):MerlinSearchRequest {
    this._options.offset = pOffset;
    this._oper.push({ type: OperationType.SIZE, args: { offset:pOffset } });
    return this;
  }

  getOperations():Operation[] {
    return this._oper;
  }

  toSearchString():string {
    let s = "";
    switch (this._ctx.targetOS){
      case OperatingSystem.ANDROID:
        s += "android()";
        break;
      case OperatingSystem.TIZEN:
        s += "tizen()";
        break;
      case OperatingSystem.IOS:
        s += "ios()";
        break;
      case OperatingSystem.MACOS:
        s += "macos()";
        break;
    }


    if((typeof this._type)==="string"){
      s += "."+this._type;
    }else{
      s += "."+MerlinSearchAPI.getMethodFromNodeType((this._type as NodeType).getType());
    }


    return s+MerlinSearchRequest.stringify(this.getOperations());
  }

  static load(){

  }

  /**
   * To stringify a list of operations
   *
   * @param pOperations
   */
  static stringify( pOperations:Operation[], pNodeType:NodeInternalType|string=null):string{
    let s = "";

    if(pOperations==null || !Array.isArray(pOperations)) return "";

    let nodeType = null;

    if(pNodeType!=null){
      if(typeof (pNodeType)==="string"){
        nodeType = pNodeType;
      }else{
        nodeType = MerlinSearchAPI.getMethodFromNodeType(pNodeType);
      }
    }



    /*

  query_string?:boolean;

  regexp?:boolean;

  not: boolean;

  copyTo?:any;
     */
    pOperations.map((x:Operation,i:number)=>{
      switch (x.type){
        case OperationType.SEARCH:
          let o = ", {";
          const sArgs:SearchOperationArgs = x.args as SearchOperationArgs;

          if(sArgs.pattern !=null){
            if(sArgs.pattern.opts!=null){
              if(sArgs.pattern.opts.query_string) o += ` query_string: ${JSON.stringify(sArgs.pattern.opts.query_string)},`;
              if(sArgs.pattern.opts.not) o += ` not: ${JSON.stringify(sArgs.pattern.opts.not)},`;
              if(sArgs.pattern.opts.regexp) o += ` regexp: "${sArgs.pattern.opts.regexp}",`;
              if(sArgs.pattern.opts.range) o += ` range: [${JSON.stringify(sArgs.pattern.opts.range)}],`;
              if(sArgs.pattern.opts.copyTo) o += ` copyTo: ${JSON.stringify(sArgs.pattern.opts.copyTo)},`;
              if(sArgs.pattern.opts.strict) o += ` strict: ${JSON.stringify(sArgs.pattern.opts.strict)},`;
            }

            if(s.length>1) o =  o.substring(0,o.length-1);
            o += "}";
          }else{
            o = "";
          }

          if(nodeType==null)
            s += `.search("${sArgs.pattern.raw}"${o})`;
          else
            s += `.${nodeType}("${sArgs.pattern.raw}"${o})`;

          break;
        case OperationType.FILTER:
          let f = "";
          const fArgs:SearchOperationArgs = x.args as SearchOperationArgs;

          if(fArgs.pattern!=null){
            if(fArgs.pattern.opts!=null){
              f = ", {";
              if(fArgs.pattern.opts.query_string) f += ` query_string: ${JSON.stringify(fArgs.pattern.opts.query_string)},`;
              if(fArgs.pattern.opts.not) f += ` not: ${JSON.stringify(fArgs.pattern.opts.not)},`;
              if(fArgs.pattern.opts.regexp) f += ` regexp: "${fArgs.pattern.opts.regexp}",`;
              if(fArgs.pattern.opts.range) f += ` range: [${JSON.stringify(fArgs.pattern.opts.range)}],`;
              if(fArgs.pattern.opts.copyTo) f += ` copyTo: ${JSON.stringify(fArgs.pattern.opts.exists)},`;
              if(fArgs.pattern.opts.strict) f += ` strict: ${JSON.stringify(fArgs.pattern.opts.strict)},`;
              if(f.length>3) f =  f.substring(0,f.length-1);
              f += "}";
            }else{
              f = "";
            }

            s += `.filter("${fArgs.pattern.raw}"${f})`;
          }


          break;
        case OperationType.INNERJOIN:
          let nn = ", {";
          const nnArgs:InnerjoinOperationArgs = x.args as InnerjoinOperationArgs;

          if(x.args!=null){
            if(nnArgs.cond!=null){
              if(nnArgs.cond.opts!=null){
                if(nnArgs.cond.opts.query_string) nn += ` query_string: ${JSON.stringify(nnArgs.cond.opts.query_string)},`;
                if(nnArgs.cond.opts.not) nn += ` not: ${JSON.stringify(nnArgs.cond.opts.not)},`;
                if(nnArgs.cond.opts.regexp) nn += ` regexp: "${nnArgs.cond.opts.regexp}",`;
                if(nnArgs.cond.opts.range) nn += ` range: [${JSON.stringify(nnArgs.cond.opts.range)}],`;
                if(nnArgs.cond.opts.copyTo) nn += ` copyTo: ${JSON.stringify(nnArgs.cond.opts.copyTo)},`;
                if(nnArgs.cond.opts.strict) nn += ` strict: ${JSON.stringify(nnArgs.cond.opts.strict)},`;
              }

              if(nn.length>1) nn =  nn.substring(0,nn.length-1);
              nn += "}";

            }else{
              nn = "";
            }

            if(nnArgs.on != null){
              if(typeof nnArgs.on=="string"){
                s += `.select("${nnArgs.on}"${nn})`;
              }else{
                s += `.select("${nnArgs.on.getName()}"${nn})`;
              }

            }
          }else{
            console.error(x,this);
          }





          break;
        case OperationType.VALIDATE:
          let opts = ", {";
          const vArgs:ValidateOperationArgs = x.args as ValidateOperationArgs;
          if(vArgs.opts!=null){
            if(vArgs.opts.range) opts += ` range: ${JSON.stringify(vArgs.opts.range)},`;
            if(vArgs.opts.interval) opts += ` interval: ${JSON.stringify(vArgs.opts.interval)},`;
            if(vArgs.opts.regexp){
              let pat:string = (vArgs.opts.regexp as RegExp).toString();
              if(pat[0]=='/'&& pat[pat.length-1]=='/'){
                pat = pat.substring(1, pat.length-1);
              }


              opts += ` regexp: "${pat}",`;
            }
            if(vArgs.opts.exists) opts += ` exists: ${JSON.stringify(vArgs.opts.exists)},`;
          }

          if(opts.length>1) opts =  opts.substring(0,opts.length-1);
          opts += "}";
          s += `.validate("${vArgs.pattern}"${opts})`;
          break;
        case OperationType.SIZE:
          const wArgs:WindowingOperationArgs = x.args as WindowingOperationArgs;
          if(wArgs.offset!=null){
            s += `.offset(${wArgs.offset})`;
          }
          else if(wArgs.limit!=null){
            s += `.limit(${wArgs.limit})`;
          }
          break;
        case OperationType.TIME:
          const tArgs:TimeOperationArgs = x.args as TimeOperationArgs;
          if(tArgs.comparison == Comparison.GTE){
            s += `.after("${tArgs.date}", "${tArgs.field}")`;
          }else{
            s += `.before("${tArgs.date}", "${tArgs.field}")`;
          }
          break;
        case OperationType.AGGR:
          const aArgs:AggregationOperationArgs = x.args as AggregationOperationArgs;
          if(aArgs.opts==null){
            s += `.aggregate("${aArgs.on}", { ${aArgs.size? "size:"+aArgs.size : "" })`;
          }else{
            s += `.aggregate("${aArgs.on}", { alias:${aArgs.opts.alias} ${aArgs.size? ",size:"+aArgs.size : "" })`;
          }
          break;
        case OperationType.UNION:
          const uArgs:NestedRequestOperationArgs = x.args as NestedRequestOperationArgs;
          s += `.union(${uArgs.request.toSearchString()})`;
          break;
        case OperationType.INTERSECT:
          const iArgs:NestedRequestOperationArgs = x.args as NestedRequestOperationArgs;
          if(iArgs!= null && iArgs.request!=null){
            s += `.intersect(${iArgs.request.toSearchString()})`;
          }else{
            console.error(this,iArgs);
            s += ".intersect(UNDEFINED)";
          }

          // s += `.intersect("${iArgs.on}", { alias:${x.args.opts.alias} ${x.args.size? ",size:"+x.args.size : "" })`;
          break;
        case OperationType.JOIN:
          const jArgs:NestedRequestOperationArgs = x.args as NestedRequestOperationArgs;
          if(jArgs!=null && jArgs.request!=null){
            s += `.join(${jArgs.request.toSearchString()}, ${JSON.stringify(jArgs.cond)})`;
          }else{
            console.error(this,jArgs);
            s += ".join(UNDEFINED)";
          }

          //s += `.join( "${x.args.on}", { alias:${x.args.opts.alias} ${x.args.size? ",size:"+x.args.size : "" })`;
          break;
      }
    })
    return s;
  }

  /**
   * A phase is a set of combinable operation.
   * Two phases cannot be merged, all the entries matching the first phase must be found before to enter into next phase
   * Some DBMS can handle multiplse phase into the same request
   *
   * @method
   */
  getPhases():Operation[][] {
    let phases:Operation[][] = [];
    let currPhase:Operation[] = [];
    let op:Operation;
    for(let i=0; i<this._oper.length; i++){
      op = this._oper[i];
      switch (op.type){
        case OperationType.SEARCH:
        case OperationType.TIME:
        case OperationType.FILTER:
        case OperationType.VALIDATE:
          currPhase.push(this._oper[i]);
          break;
        case OperationType.UNION:
        case OperationType.INTERSECT:
        case OperationType.INNERJOIN:
        case OperationType.JOIN:
        case OperationType.AGGR:
        case OperationType.SIZE:
          phases.push(currPhase);
          phases.push([this._oper[i]]);
          currPhase = [];
          break;
      }
    }
    if(currPhase.length > 0){
      phases.push(currPhase);
    }
    return phases;
  }

  /**
   * To test specified data
   *
   * @param pData
   */
  executeLive( pData:any ):ValidationResult {
    let ope:Operation, val:any = null, force = 0, globalSuccess = 0, expectedSuccess=0, success=0 ;
    let opeArgs:ValidateOperationArgs;

    for(let i=0; i<this._oper.length; i++){
      ope = this._oper[i];
      success = 0;
      expectedSuccess = 0;

      if(ope.type != OperationType.VALIDATE) continue;

      opeArgs = ope.args as ValidateOperationArgs;
      val = Util.readValue(pData, opeArgs.pattern);

      if(opeArgs.opts && opeArgs.opts.exists){
        expectedSuccess++;
        success += +(val != null);
      }
      if(opeArgs.opts && opeArgs.opts.range){
        expectedSuccess++;
        success += +(opeArgs.opts.range.indexOf(val)>-1);
      }
      if(opeArgs.opts && opeArgs.opts.interval){
        expectedSuccess++;
        success += +((val >= opeArgs.opts.interval[0])&&(val <= opeArgs.opts.interval[1]));
      }
      if(opeArgs.opts && opeArgs.opts.regexp){
        expectedSuccess++;
        success += +(opeArgs.opts.regexp.test(val));
      }
      if(opeArgs.opts && opeArgs.opts.strict){
        expectedSuccess++;
        success += +(pData === opeArgs.pattern);
      }

      //console.log("[SearchRequest] liveExecute : ( expectedSuccess="+expectedSuccess+", success="+success+", force="+force+")")
      globalSuccess += +(expectedSuccess === success);
      force++;
    }

    return {
      success: (globalSuccess==force),
      force: force
    }
  }

  /**
   * To walk over every operations and replace tag name by Tag instance
   *
   * @param pProject
   * @private
   */
  private _resolveTagNames(pProject:DexcaliburProject):void {
    this.getOperations().map(x => {
      let args:SearchOperationArgs;
      switch (x.type){
        case OperationType.SEARCH:
          args = (x.args as SearchOperationArgs)
          if(args.pattern.tagKey!=null){
            try{
              args.pattern.tag = pProject.getTagManager().getTag(args.pattern.tagKey);
            }catch(err){
              console.log("Tag ["+args.pattern.tagKey+"] cannot be resolved in request ["+this.toSearchString()+"]");
            }
          }
          break;
      }
    })
  }

  /**
   * To prepare, execute the request and return the result
   *
   * @return {Promise<FinderResult>}
   * @method
   * @async
   */
  async execute(pProject:DexcaliburProject):Promise<FinderResult> {

    let coll:IDbCollection|IDbIndex;

    const db = pProject.getAnalyzer().getInternalDB();
    if((typeof this._type)==="string"){
      Logger.debug("MERLIN SEARCH REQUEST > EXECUTE > getDataSetFromNodeType "+this._type);
      coll = db.getDataSetFromNodeType(NodeInternalTypeName[(this._type as string)]);
    }else{
      Logger.debug("MERLIN SEARCH REQUEST > EXECUTE > getDataSetFromNodeType "+(this._type as NodeType).getType());
      coll = db.getDataSetFromNodeType((this._type as NodeType).getType());
    }


    // resolve Tags name
    this._resolveTagNames(pProject);

    let res:any = null;

    const tmpDb = db.getTempConnector().newTemporaryDb('finder:0');
    const resultIndex = tmpDb.newIndex('root', Finder.NODE_ANY);

    if(coll.search == null){
      Logger.debug("MERLIN SEARCH REQUEST > EXECUTE > SEARCH NOT IMPLEMENTED ");
      throw new Error("Search not implemented");
    }else{
      Logger.debug("MERLIN SEARCH REQUEST > EXECUTE > SEARCH ");
      res = await coll.search(this, resultIndex);
    }

    if(await res == null){
      Logger.debug("ERROR in execute()");
    }

    return new FinderResult( await resultIndex, pProject.getSearchEngine()._finder); // this._ctx._finder);
  }

  /**
   *
   */
  toJsonObject():any {

    let _type:any = "";
    if(typeof (this._type)==="string"){
      _type  = this._type; //NodeInternalTypeName[this._type];
    }
    else if(typeof (this._type)==="object"){

      _type = (this._type as NodeType).getType();
    }
    else{
      console.log("MerlinSearchRequest.toJsonObject _type ! : "+(typeof (this._type))+","+this._type);
      _type = this._type;
    }

      let o:any = {
        TYPE: this.TYPE,
        _live: this._live,
        _type: _type,
        _search: this._search,
        _aggs: this._aggs,
        _options: this._options,
        _evt: this._evt,
        _oper: this.getOperations(),
        __stringified: ""
      };

    this.getOperations().map((vOpe,vIdx) => {
      switch (vOpe.type){
       /* case OperationType.INNERJOIN:
          break;
        case OperationType.TAINT_SRC:
        case OperationType.TAINT_SINK:
          break;*/
        default:
          o._oper[vIdx] = vOpe;
          break;
      }
    });

      o.__stringified = MerlinSearchRequest.stringify(this.getOperations(), o._type);
    CoreDebug.checkJsonSerialize(o, "MerlinSearchRequest");
      return o;
  }


  static fromJsonObject(pObject:any):MerlinSearchRequest {
    const r = new MerlinSearchRequest(null, NodeInternalTypeName[pObject._type+""], pObject._oper)
    r._live = pObject._live;
    r._aggs = pObject._aggs;
    r._options = pObject._options;
    r._evt = pObject._evt;
    r._search = pObject._search;
    return r;
  }

}
