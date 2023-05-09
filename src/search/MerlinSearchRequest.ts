import {MerlinSearchAPI, SearchOptions} from "./MerlinSearchAPI.js";
import { FinderResult} from "./FinderResult.js";
import { Finder } from "./Finder.js";
import {SearchRequestCondition, ValidateOptions} from "./SearchRequestCondition.js";
import {NodeType} from "../persist/orm/NodeType.js";
import { IDbCollection } from "../persist/orm/DbAbstraction.js";
import Util from "../Utils.js";



export enum OperationType {
  SEARCH,
  AGGR,
  FILTER,
  SIZE,
  VALIDATE,
  TIME,
  UNION,
  INTERSECT,
  JOIN
}

export enum Comparison {
  LTE,
  GTE,
  LT,
  GT,
  EQ
}

export interface Operation {
  type: OperationType,
  args: any
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


export class MerlinSearchRequest {

  private _live = false;

  private _ctx:MerlinSearchAPI;
  private _type:NodeType|string;
  private _oper:Operation[];
  private _aggs = 0;
  private _search = 0;


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
   * @param pCond
   */
  static parseCondition(pSearchContext:MerlinSearchAPI, pCond:string, pOptions:SearchOptions):SearchRequestCondition {
    const d = pCond.indexOf(':');
    const offsetTag = pCond.indexOf('@');
    let tagUID = null;
    const cond:SearchRequestCondition = new SearchRequestCondition({
      field: null,
      pattern: null,
      tag: null,
      regexp: false,
      raw: pCond,
      opts: pOptions
    });

    if(d>-1){
      cond.field = pCond.substr(0,d);
      cond.pattern = pCond.substr(d+1);
      cond.tag = null;
    }else{
      cond.pattern = null;
      cond.field = (offsetTag>-1)? pCond.substr(0, offsetTag) : pCond;
      if(offsetTag > -1){
        tagUID = pCond.substr(offsetTag+1);
      }

    }

    // TODO : get Tag instance is required
    /*if(tagUID != null && !pOptions.query_string){
      const tags = pSearchContext.byID().tag(tagUID);
      if(tags.count()>0){
        cond.tag = tags.get(0);
      }
    }*/


    if(cond.pattern != null){
      if(/^\/.+\/[ig]*/i.test(cond.pattern)){
        cond.regexp = true;
      }
    }

    return cond;
  }


  static fromCondition(pSearchContext:MerlinSearchAPI, pNodeType:NodeType, pCondition:string|any, pOptions:SearchOptions):MerlinSearchRequest {
    const req = new MerlinSearchRequest(pSearchContext, pNodeType, [] );

    if((typeof pCondition)==="string"){
      if(pCondition.length>0){
        req.addOperation({
          type:OperationType.SEARCH, args:{
            pattern: MerlinSearchRequest.parseCondition(pSearchContext, pCondition, pOptions)
          }
        });
      }
    }else if(pCondition!=null){
      req.addOperation({
        type:OperationType.SEARCH, args:{
          pattern: MerlinSearchRequest.parseCondition(pSearchContext, pCondition, pOptions)
        }
      });
    }

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
    this._oper.push({ type: OperationType.SEARCH, args:{ pattern: MerlinSearchRequest.parseCondition(this._ctx, pRequest,pOptions) } });
    this._search++;
    return this;
  }

  not( pRequest:string, pOptions:SearchOptions = { not:true }):MerlinSearchRequest {

    this._oper.push({ type: OperationType.SEARCH, args:{ pattern: MerlinSearchRequest.parseCondition(this._ctx, pRequest,pOptions) } });
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
    //this._options.aggregation = true;
    //this._oper.push({ type: OperationType.FILTER, args: { cond:pCondition, opts:pOptions } });
    this._oper.push({ type: OperationType.FILTER, args:{ pattern: MerlinSearchRequest.parseCondition(this._ctx, pRequest,pOptions) } });
    //this._oper.push({ type: OperationType.SEARCH, args: { cond:pCondition, opts:pOptions } });
    return this;
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
            hasAggr = hasAggr || ((x.args.request as MerlinSearchRequest).hasAggregate());
            break;
        }
      });
      return hasAggr;
    }else{
      return (this._options.aggregation === true);
    }
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


  /**
   * To stringify a list of operations
   *
   * @param pOperations
   */
  static stringify( pOperations:Operation[]):string{
    let s = "";

    if(pOperations==null || !Array.isArray(pOperations)) return "";
    /*

  query_string?:boolean;

  regexp?:boolean;

  not: boolean;

  copyTo?:any;
     */
    pOperations.map((x:Operation)=>{
      switch (x.type){
        case OperationType.SEARCH:
          let o = ", {";
          if(x.args.pattern.opts.query_string) o += ` query_string: ${JSON.stringify(x.args.pattern.opts.query_string)},`;
          if(x.args.pattern.opts.not) o += ` not: ${JSON.stringify(x.args.pattern.opts.not)},`;
          if(x.args.pattern.opts.regexp) o += ` regexp: "${(x.args.pattern.opts.regexp as RegExp).toString()}",`;
          if(x.args.pattern.opts.range) o += ` range: [${JSON.stringify(x.args.pattern.opts.range)}],`;
          if(x.args.pattern.opts.copyTo) o += ` copyTo: ${JSON.stringify(x.args.pattern.opts.exists)},`;
          if(x.args.pattern.opts.strict) o += ` strict: ${JSON.stringify(x.args.pattern.opts.strict)},`;
          if(s.length>1) o =  o.substring(0,o.length-1);
          o += "}";

          s += `.search("${x.args.pattern.raw}"${o})`;

          break;
        case OperationType.FILTER:
          let f = ", {";
          if(x.args.pattern.opts.query_string) f += ` query_string: ${JSON.stringify(x.args.pattern.opts.query_string)},`;
          if(x.args.pattern.opts.not) f += ` not: ${JSON.stringify(x.args.pattern.opts.not)},`;
          if(x.args.pattern.opts.regexp) f += ` regexp: "${(x.args.pattern.opts.regexp as RegExp).toString()}",`;
          if(x.args.pattern.opts.range) f += ` range: [${JSON.stringify(x.args.pattern.opts.range)}],`;
          if(x.args.pattern.opts.copyTo) f += ` copyTo: ${JSON.stringify(x.args.pattern.opts.exists)},`;
          if(x.args.pattern.opts.strict) f += ` strict: ${JSON.stringify(x.args.pattern.opts.strict)},`;
          if(f.length>1) f =  f.substring(0,f.length-1);
          f += "}";

          s += `.filter("${x.args.pattern.raw}"${f})`;
          break;
        case OperationType.VALIDATE:

          console.log(x.args.opts.regexp);
          let opts = ", {";
          if(x.args.opts.range) opts += ` range: ${JSON.stringify(x.args.opts.range)},`;
          if(x.args.opts.interval) opts += ` interval: ${JSON.stringify(x.args.opts.interval)},`;
          if(x.args.opts.regexp){
            let pat:string = (x.args.opts.regexp as RegExp).toString();
            if(pat[0]=='/'&& pat[pat.length-1]=='/'){
              pat = pat.substring(1, pat.length-1);
            }


            opts += ` regexp: "${pat}",`;
          }
          if(x.args.opts.exists) opts += ` exists: ${JSON.stringify(x.args.opts.exists)},`;
          if(opts.length>1) opts =  opts.substring(0,opts.length-1);
          opts += "}";

          s += `.validate("${x.args.pattern}"${opts})`;
          break;
        case OperationType.SIZE:
          if(x.args.offset!=null){
            s += `.offset(${x.args.offset})`;
          }
          else if(x.args.limit!=null){
            s += `.limit(${x.args.limit})`;
          }
          break;
        case OperationType.TIME:
          if(x.args.comparison == Comparison.GTE){
            s += `.after("${x.args.date}", "${x.args.field}")`;
          }else{
            s += `.before("${x.args.date}", "${x.args.field}")`;
          }
          break;
        case OperationType.AGGR:
          s += `.aggregate("${x.args.on}", { alias:${x.args.opts.alias} ${x.args.size? ",size:"+x.args.size : "" })`;
          break;
        case OperationType.UNION:
          s += `.union(${MerlinSearchRequest.stringify( (x.args.request as MerlinSearchRequest).getOperations() )})`;
          break;
        case OperationType.INTERSECT:
          // s += `.intersect("${x.args.on}", { alias:${x.args.opts.alias} ${x.args.size? ",size:"+x.args.size : "" })`;
          break;
        case OperationType.JOIN:
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

    for(let i=0; i<this._oper.length; i++){
      ope = this._oper[i];
      success = 0;
      expectedSuccess = 0;
      if(ope.type != OperationType.VALIDATE) continue;

      val = Util.readValue(pData, ope.args.pattern);

      if(ope.args.opts.exists){
        expectedSuccess++;
        success += +(val != null);
      }
      if(ope.args.opts.range){
        expectedSuccess++;
        success += +(ope.args.opts.range.indexOf(val)>-1);
      }
      if(ope.args.opts.interval){
        expectedSuccess++;
        success += +((val >= ope.args.opts.interval[0])&&(val <= ope.args.opts.interval[1]));
      }
      if(ope.args.opts.regexp){
        expectedSuccess++;
        success += +(ope.args.opts.regexp.test(val));
      }
      if(ope.args.opts.strict){
        expectedSuccess++;
        success += +(pData === ope.args.pattern);
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
   * To prepare, execute the request and return the result
   *
   * @return {Promise<FinderResult>}
   * @method
   * @async
   */
  async execute():Promise<FinderResult> {

    let coll:IDbCollection;

    if((typeof this._type)==="string"){
      coll = this._ctx._db[this._type as string];
    }else{
      coll = this._ctx._db.getCollection((this._type as NodeType).getName(), this._type as NodeType);
    }

    let res:any = null;

    const tmpDb = this._ctx._db.getTempConnector().newTemporaryDb('finder:0');
    const resultIndex = tmpDb.newIndex('root', Finder.NODE_ANY);

    if(coll.search == null){
      throw new Error("Search not implemented");
    }else{
      res = await coll.search(this, resultIndex);
    }

    if(await res == null){
      console.log("ERROR in execute()");
    }

    return new FinderResult( await resultIndex, this._ctx._finder);
  }
}
