import {Finder} from "./Finder.js";
import { SearchAPISelector } from "./SearchAPISelector.js";
import {MerlinSearchRequest} from "./MerlinSearchRequest.js";
import Util from "../Utils.js";

import AnalyzerDatabase from "../AnalyzerDatabase.js";
import DataScope from "../DataScope.js";
import ModelMethod from "../ModelMethod.js";
import ModelClass from "../ModelClass.js";
import ModelPackage from "../ModelPackage.js";
import ModelField from "../ModelField.js";
import ModelFile from "../ModelFile.js";
import ModelDataBlock from "../ModelDataBlock.js";
import AndroidActivity from "../android/AndroidActivity.js";
import AndroidService from "../android/AndroidService.js";
import AndroidReceiver from "../android/AndroidReceiver.js";
import AndroidProvider from "../android/AndroidProvider.js";
import {AndroidPermission} from "../android/Permissions.js";
import ModelCall from "../ModelCall.js";
import ModelString from "../ModelString.js";
import {ModelFunction} from "../ModelFunction.js";
import ModelSyscall from "../ModelSyscall.js";
import {IAnalyzerUnit} from "../analyzer/IAnalyzerUnit.js";
import {OperatingSystem} from "../OperatingSystem.js";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;
import {CoreDebug} from "../core/CoreDebug.js";



export interface SearchOptions {
  query_string?:boolean;

  regexp?:boolean;

  range?:string[];

  not: boolean;

  copyTo?:any;

  strict?:boolean;
  exists?:boolean;
  nocase?:boolean;
}


/**
 * The SearchAPI. Allow the user to perform search into the object
 * database.
 *
 * @param {Object} data The database of objects
 * @constructor
 */
export class MerlinSearchAPI
{
  targetOS:OperatingSystem|undefined;

  _queryCache:any = [];
  _caseSensitive:boolean = true;
  _finder:Finder;
  _db:AnalyzerDatabase;
  _byID:boolean = false;
  get:SearchAPISelector;


  _analyzers:{[name:string] :IAnalyzerUnit} = {}

  constructor(pData:AnalyzerDatabase|null = null){

    this._queryCache = [];

    // set default case sensitivity for all search
    this._caseSensitive = true;

    if(pData!=null) this.setDatabase(pData);
  }

  /**
   * To get application db
   *
   * @return {ApplicationDatabase}
   * @method
   */
  getDB():AnalyzerDatabase {
    return this._db;
  }

  setDatabase(pData:AnalyzerDatabase){
    this._db = pData;
    this._finder = new Finder(this._db);
    this.get = new SearchAPISelector(this._db);
  }


  /**
   * Switch case sensitive On/Off of following search
   */
  nocase():MerlinSearchAPI{
    this._caseSensitive = false;
    return this;
  }

  byID():MerlinSearchAPI{
    this._byID = true;
    return this;
  }



  /**
   * To extract deep property from a object
   *
   * @param pAccessPath
   * @param pObject
   * @param pBlackList
   * @param pMaxDepth
   * @return {any} Property value
   * @method
   */
  extract(pAccessPath:string, pObject:any, pBlackList:string[] = [], pMaxDepth:number = -1):any {
    return Util.readValue(pObject, pAccessPath);
  }

  class(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelClass.TYPE, pattern, pOptions);
  }

  package(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelPackage.TYPE, pattern, pOptions);
  }

  method(pattern:any|string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelMethod.TYPE, pattern, pOptions);
  }

  field(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelField.TYPE, pattern, pOptions);
  }

  file(pattern:string="", pOptions:SearchOptions = { not:false }, pScope:DataScope = null):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelFile.TYPE, pattern, pOptions);
  }

  array(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelDataBlock.TYPE, pattern, pOptions);
  }

  activity(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, AndroidActivity.TYPE, pattern, pOptions);
  }

  service(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, AndroidService.TYPE, pattern, pOptions);
  }

  receiver(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, AndroidReceiver.TYPE, pattern, pOptions);
  }

  provider(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, AndroidProvider.TYPE, pattern, pOptions);
  }

  permission(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, AndroidPermission.TYPE, pattern, pOptions);
  }

  call(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelCall.TYPE, pattern, pOptions);
  }

  strings(pattern:string|any="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelString.TYPE, pattern, pOptions);
  }

  func(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelFunction.TYPE, pattern, pOptions);
  }

  syscall(pattern:string="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{
    return MerlinSearchRequest.fromCondition(this, ModelSyscall.TYPE, pattern, pOptions);
  }


  /**
   *
   * TODO : update
   * To seach only method call
   * @param {*} pattern
   */
  invoke(pattern:string|ModelMethod="", pOptions:SearchOptions = { not:false }):MerlinSearchRequest{


    let req:MerlinSearchRequest = MerlinSearchRequest.fromCondition(this, ModelCall.TYPE, "instr.opcode.instr:invoke", pOptions);

    if(pattern === null)
      return req;
    if(typeof pattern === 'string' || pattern instanceof String)
      return req.filter(pattern as string);
    else if(pattern instanceof ModelMethod)
      return req.filter(
          "calleed."+ModelMethod.TYPE.getPrimaryKey().getName()+":"+Util.escapeRE((pattern as ModelMethod).getUID())
      );
    else
      return req;
  }


  /**
   * @param {String} pattern Search pattern
   */
  /*
  setter(pattern:string="", pOptions:SearchOptions = { not:false }):FinderResult{
    let res:FinderResult = null;
    if(pattern != null){
      res = this._finder._find(
          this._db.call, ModelCall.TYPE,
          "calleed."+pattern, false, true);
      res = res.filter("instr.opcode.type:"+CONST.INSTR_TYPE.SETTER);
    }
    else{
      res = this._finder._find(
          this._db.call, ModelCall.TYPE,
          "instr.opcode.type:"+CONST.INSTR_TYPE.SETTER, false, true);
    }

    return res;
  }
*/
  /**
   *
   * @param {String} pattern Field signature
   */
  /*
  settersOf(signature:string="", pOptions:SearchOptions = { not:false }):FinderResult{
    return this.setter("__signature__:"+signature);
  }*/

  /**
   * @param {String} pattern Field signature
   */
  /*
  getter(pattern:string="", pOptions:SearchOptions = { not:false }):FinderResult{
    let res:FinderResult = null;
    if(pattern != null){
      res = this._finder._find(
          this._db.call, ModelCall.TYPE,
          "calleed."+pattern, false, true);
      res = res.filter("instr.opcode.type:"+CONST.INSTR_TYPE.GETTER);
    }
    else{
      res = this._finder._find(
          this._db.call, ModelCall.TYPE,
          "instr.opcode.type:"+CONST.INSTR_TYPE.GETTER, false, true);
    }

    return res;
  }
*/

  /**
   * TODO : deprecated ?
   * @param {String} pattern Field signature
   */
  /*
  gettersOf(signature:string="", pOptions:SearchOptions = { not:false }):FinderResult
  {
    return this._finder._find(
        this._db.call, ModelCall.TYPE,
        "instr.opcode.type:"+CONST.INSTR_TYPE.GETTER, false, true);
  }*/

  updateDB(data:AnalyzerDatabase){
    this._db = data;
    //this._finder.updateDB(data);
  }


  static getMethodFromNodeType( pType:NodeInternalType):string {
    switch (pType){
      case NodeInternalType.METHOD: return "method";
      case NodeInternalType.CLASS: return "class";
      case NodeInternalType.FIELD: return "field";
      case NodeInternalType.STRING: return "strings";
      case NodeInternalType.PACKAGE: return "package";
      case NodeInternalType.FUNC: return "func";
      case NodeInternalType.FILE: return "file";
      case NodeInternalType.DATA_BLOCK: return "array";
      case NodeInternalType.ANDROID_ACTIVITY: return "activity";
      case NodeInternalType.ANDROID_PROVIDER: return "provider";
      case NodeInternalType.ANDROID_SERVICE: return "service";
      case NodeInternalType.ANDROID_RECEIVER: return "receiver";
      case NodeInternalType.ANDROID_PERM: return "permission";
      case NodeInternalType.SYSCALL: return "syscall";
      case NodeInternalType.CALL: return "call";
      default: throw new Error("MerlinSearchAPI : unknow node type");
    }
  }

  toJsonObject():any {
    const o = {
      targetOS: this.targetOS,
      _queryCache: this._queryCache,
      _caseSensitive: this._caseSensitive,
      _byID: this._byID,
      _analyzers: Object.keys(this._analyzers)
    };
    CoreDebug.checkJsonSerialize(o, "MerlinSearchAPI");
    return o;
  }
}
