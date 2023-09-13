import {MerlinSearchAPI, SearchOptions} from "./MerlinSearchAPI.js";
import {FinderResult} from "./FinderResult.js";
import {Finder} from "./Finder.js";
import {SearchRequestCondition, ValidateOptions} from "./SearchRequestCondition.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {IDbCollection, IDbIndex} from "../persist/orm/DbAbstraction.js";
import Util from "../Utils.js";
import {NodeProperty} from "../persist/orm/NodeProperty.js";
import {OperatingSystem} from "../OperatingSystem.js";
import {BusSubscriber} from "../Bus.js";
import ControlAssessment from "../audit/common/ControlAssessment.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {NodeInternalType, NodeInternalTypeName} from "../NodeInternalType.js";
import { MerlinPrimitive, MerlinType} from "./Merlin.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {TagManager} from "../tags/TagManager.js";


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
  TAINT_STEP
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
  on: NodeProperty,
  cond?: SearchRequestCondition
}

// AggregationOption
export interface AggregationOperationArgs {
  on: string,
  opts?: AggregationOption,
  size?:number
}

export interface TaintOperationArgs {
  request: MerlinSearchRequest
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

  setContext(pSearchContext:MerlinSearchAPI):void {
    this._ctx = pSearchContext;
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
      // TODO : add object-based pattern instead of string
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
     // force
    pOptions.not = true;
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
    this._oper.push({ type: OperationType.FILTER, args:{ pattern: MerlinSearchRequest.parseCondition(this._ctx, pRequest,pOptions) } });
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
              if(f.length>1) f =  f.substring(0,f.length-1);
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


          if(nnArgs.cond!=null){
            if(nnArgs.cond.opts!=null){
              if(nnArgs.cond.opts.query_string) nn += ` query_string: ${JSON.stringify(nnArgs.cond.opts.query_string)},`;
              if(nnArgs.cond.opts.not) nn += ` not: ${JSON.stringify(nnArgs.cond.opts.not)},`;
              if(nnArgs.cond.opts.regexp) nn += ` regexp: "${nnArgs.cond.opts.regexp}",`;
              if(nnArgs.cond.opts.range) nn += ` range: [${JSON.stringify(nnArgs.cond.opts.range)}],`;
              if(nnArgs.cond.opts.copyTo) nn += ` copyTo: ${JSON.stringify(nnArgs.cond.opts.exists)},`;
              if(nnArgs.cond.opts.strict) nn += ` strict: ${JSON.stringify(nnArgs.cond.opts.strict)},`;
            }

            if(nn.length>1) nn =  nn.substring(0,nn.length-1);
            nn += "}";

          }else{
            nn = "";
          }

          if(nnArgs.on != null){
            s += `.select("${nnArgs.on.getName()}"${nn})`;
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
          s += `.union(${iArgs.request.toSearchString()})`;
          // s += `.intersect("${iArgs.on}", { alias:${x.args.opts.alias} ${x.args.size? ",size:"+x.args.size : "" })`;
          break;
        case OperationType.JOIN:
          const jArgs:NestedRequestOperationArgs = x.args as NestedRequestOperationArgs;
          s += `.join(${jArgs.request.toSearchString()}, ${JSON.stringify(jArgs.cond)})`;
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
      coll = db.getDataSetFromNodeType(NodeInternalTypeName[(this._type as string)]);
    }else{
      coll = db.getDataSetFromNodeType((this._type as NodeType).getType());
    }

    // resolve Tags name
    this._resolveTagNames(pProject);

    let res:any = null;

    const tmpDb = db.getTempConnector().newTemporaryDb('finder:0');
    const resultIndex = tmpDb.newIndex('root', Finder.NODE_ANY);

    if(coll.search == null){
      throw new Error("Search not implemented");
    }else{
      res = await coll.search(this, resultIndex);
    }

    if(await res == null){
      console.log("ERROR in execute()");
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
    console.log("MerlinSearchRequest.fromJsonObject _type ! : "+pObject._type);
    const r = new MerlinSearchRequest(null, NodeInternalTypeName[pObject._type+""], pObject._oper)
    r._live = pObject._live;
    r._aggs = pObject._aggs;
    r._options = pObject._options;
    r._evt = pObject._evt;
    r._search = pObject._search;
    return r;
  }

}
