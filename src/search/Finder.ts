import {FinderResult} from "./FinderResult.js";
import {SearchPattern} from "./SearchPattern.js";


import * as Log from '../Logger.js';
import {SearchToken} from "./SearchToken.js";
import { NodeType } from "../persist/orm/NodeType.js";
import AnalyzerDatabase from "../AnalyzerDatabase.js";
import { IDatabase, IDbCollection, IDbIndex } from "../persist/orm/DbAbstraction.js";
import { NodeInternalType } from "../NodeInternalType.js";

const Logger: Log.Logger = Log.newLogger() as Log.Logger;

/*
const DataModel = {
    package: new ModelPackage("stub"),
    class: new ModelClass(),
    field: new ModelField(),
    method: new ModelMethod(),
    call: new ModelCall(),
    objectType: new ModelObjectType(),
    basicType: new ModelBasicType(),
    value: new ModelConstantValue(),
    string: new ModelStringValue(),
    syscall: new ModelSyscall(),
    file: new ModelFile(),
    datablock: new ModelDataBlock(),
    activity: new AndroidActivity(),
    receiver: new AndroidReceiver(),
    provider: new AndroidProvider(),
    service: new AndroidService(),
    permission: new AndroidPermission(),
};*/


/**
 *
 *    A search engine for DBs
 *
 *    eventType {
 *        uid:...,
 *        id:1 ,
 *        src: winlog,
 *        name: CreateProcess
 *    }
 *
 *    event{
 *        src: winlog | orc | atera
 *        ...
 *    }
 *
 *
 *
 *    event("type:CreateProcess").filter("").select('parent')
 *    byID().event(ID).select('parent')
 *
 * @class
 */
export class Finder {

  static NODE_ANY:NodeType = new NodeType('any',NodeInternalType.NONE, []);

  __DB: AnalyzerDatabase;
  __tmp: IDatabase;
  cache: any = null;

  /**
   * Latest Index UID into FinderResult DB
   * @field
   * @type {number}
   * @private
   */
  private counter = 0;

  constructor(pDatabase: AnalyzerDatabase) {
    this.__DB = pDatabase;
    this.cache = [];

    this.__tmp = this.__DB.getConnector().newTemporaryDb('finder');
  }

  static testHasModifier(pRequest: any, pData: any): boolean {
    // only element with access flag can be tested
    // access flag depends of target program
    // type_of_elements + target language = modifier or not
    /*if(pData.getLanguage !== null && pData.getLanguage().supportModifier(pData)){

    }*/
    return (pData.modifiers != null) && (pData.modifiers == pRequest.field);
  }


  /**
   * To test if "pData" is tagged with the given pattern
   *
   * @param pRequest
   * @param pData
   */
  static testHasTag(pRequest: any, pData: any): boolean {
    if (pData.tags === undefined)
      Logger.error("Object " + pData + " has not 'tags' field");

    //console.log(data.tags.indexOf(request.pattern), data.tags, request.pattern);
    return pData.tags.indexOf(pRequest.pattern) > -1;
  }

  static testNothing(): void {
    // just a mock
  }



  /**
   * To create a fresh - empty - result set
   *
   * That is an Index (a list of object) into Finder Result In-Memory DB
   *
   * @method
   * @return {IDbIndex}
   */
  newResultSet(): IDbIndex {
    this.counter++;
    return this.__tmp.newIndex('finder:' + this.counter, Finder.NODE_ANY);
  }

  updateDB(pDatabase: AnalyzerDatabase) {
    this.__DB = pDatabase;
  }

  /**
   * To parse a pattern like [native:]*ssl*.
   - wildcard : replace any char
   - case sensitive
   - add unicode
   * @param {*} dataModel
   * @param String pattern
   * @param Boolean caseSensitive
   * @param Boolean lazy If FALSE, verify if the field exists
   * @returns {SearchPattern} The parsed search pattern, ready to be used
   */
  _getTestFn(dataModel: any, pattern: string, caseSensitive: boolean, lazy: boolean = false): SearchPattern|null {

    //if(lazy===true) console.debug("LAZY mode detected !");

    if (pattern == undefined || pattern.length == 0) {
      Logger.info("[!] find : Pattern cannot be null");
      return null;
    }

    let token: string | string[] = "name", lex: number = -1, isDeepSearch: boolean = false;
    let  fn: any = null, flags: string = "";
    // test si le motif s'applique sur un champs particulier

    // parse pattern
    if (pattern.substr(0, 3) == "is.") {
      if ((lex = pattern.indexOf(":")) > -1) {
        token = pattern.substr(3, lex - 3);
        pattern = pattern.substr(lex + 1, pattern.length - lex - 1);
      } else {
        token = pattern.substr(3, pattern.length - 3);
        pattern = "";
      }

      return new SearchPattern({
        pattern: pattern,
        field: [new SearchToken(token)],
        isModifier: true,
        fn: Finder.testHasModifier
      });

      //console.debug("Modifier search ... "+token+"."+pattern+" == true");
      /*if(lazy === false){
          if(Modifier[token] !== undefined)
              return new SearchPattern({
                      pattern:pattern,
                      field: token,
                      isModifier:true,
                      fn: Finder.testHasModifier
                  });
          else{
              console.log("[!] The modifier '"+token+"' not exists for these objects");
              return null;
          }
      }else{
          //console.debug("LAZY filtering ...");
          return new SearchPattern({
              pattern:pattern,
              field:token,
              isModifier:true,
              fn: Finder.testHasModifier
          });
      }*/
    } else if (pattern.substr(0, 4) == "has.") {
      //console.debug("Tag-based request detected");
      return new SearchPattern({
        pattern: pattern.substr(4),
        isModifier: false,
        hasTag: true,
        fn: Finder.testHasTag
      });
    }
    /*
    // exact match is not a RegExp-based search
    else if(pattern.substr(0,7)=="#exact#"){
        //console.debug("Tag-based request detected");
        return new SearchPattern({
            pattern: pattern.substr(4),
            isModifier: false,
            hasTag: true,
            fn:this._test.hasExactToken
        });
    }*/


    if ((lex = pattern.indexOf(":")) > -1) {
      token = pattern.substr(0, lex);
      pattern = pattern.substr(lex + 1);
    } else {
      // DEFAULT field must be parameterized, it depends of root node
      token = "name";
      pattern = pattern; //"";
    }


    // check if it is a deep search
    if (token.indexOf(".") > -1) {
      //token = token.split(".");
      isDeepSearch = true;
      //console.debug("Deep search detected !");
    }


    // TODO : remove -non-lazy mode
    /*if (lazy === false && isDeepSearch === false && dataModel[token] === undefined) {
      Logger.info("[!] The property '" + token + "' not exists for these objects");
      return null;
    }*/

    // make corresponding regexp
    flags += (caseSensitive ? "" : "i");
    const rx = new RegExp(pattern, flags);

    if (rx != null) {
      fn = function (x:string) {
        return rx.test(x)
      };
    } else {
      Logger.raw("Nothing to test");
      fn = Finder.testNothing
    }

    let struct = false;

    // TODO : remove -non-lazy mode
    // if (lazy === false && isDeepSearch === false)
    //   struct = (dataModel[token] instanceof Array) || (dataModel[token] instanceof Object);

    return new SearchPattern({
      pattern: pattern,
      field: SearchToken.parseTokens(token),
      isStructField: struct,
      isDeepSearch: isDeepSearch,
      fn: fn,
    });
  }

  /**
   * To search an object into a specified index by a direct field value
   *
   *
   * @param index
   * @param search_pattern
   * @param includeMissing
   * @private
   */
  _findObject(index: any, search_pattern: SearchPattern, includeMissing: boolean = false): IDbIndex {
    //let field: any = undefined;

    // create a new collection to hold search results
    const tmpDb = this.__DB.getConnector().newTemporaryDb('finder:0');
    const matches = tmpDb.newIndex('root', Finder.NODE_ANY);

    let d1: number = 0, d2: number = 0;
    index.map((k: any, v: any) => {
      d1++;
      d2++;
      const field = v[search_pattern.field[0].name];

      /*if(d1<10){
          Logger.raw("Test : "+field+" == "+search_pattern.pattern);
      }*/
      if (field !== undefined && search_pattern.fn(field)) {
        matches.insert(v, false);
      }
    });

    //Logger.raw("Result size : "+matches.size());

    if (d1 != d2) {
      Logger.raw("Method DB inconsistencies detected:" + d1 + " invalid methods ");
    }
    return matches;
  }

  _searchInNode(pNode:any, search:any, i:number){
    if (pNode.hasOwnProperty("__")) {
      // explore linked node
      return this.__checkDeepField(this.__DB.searchNode(pNode.__, pNode.getUID()), search, i + 1);
    } else if ((typeof pNode != "object") || (pNode == null)) {
      // terminal node met, stope rseearch
      return false;
    } else {
      //console.log(search.field[i],ref[search.field[i]]);
      // explore nested JS object
      return this.__checkDeepField(pNode, search, i + 1);
    }
  }


  /**
   * To search an object by applying the condition on nested fields.
   * The depth level is ignored, the field is searched recursively by following the path
   * give by the search argument.
   *
   * @param {*} object
   * @param {SearchPattern} search A search pattern containing the full path to the field to compare
   * @returns {Boolean} Return the check result
   */
  __checkDeepField(object: any, search: SearchPattern, offset: number = 0): boolean {
    let ref = object, i = offset;

    if (object == null) return false;


    let node: any = ref[search.field[i].name];

    if (node == undefined) return false;
    // if nested ppt is an array - such ars method.args
    /*if(ref[search.field[i]] instanceof Array){
        for(let k=0; k<ref[search.field[i]].length; k++){
            if(ref[search.field[i]][k] instanceof CLASS.ObjectType){
                console.log(search.field[i], ref[search.field[i]][k].name, search.field[i+1]);
                return this.__checkDeepField( this.__DB.classes.getEntry(ref[search.field[i]][k].name), search, i+1);
            }
            else if(ref[search.field[i]][k] instanceof CLASS.BasicType){
                console.log(search.field[i], ref[search.field[i]][k].name, search.field[i+1]);
                return this.__checkDeepField( this.__DB.classes.getEntry(ref[search.field[i]][k].name), search, i+1);
            }else{
                console.log(search.field[i],ref[search.field[i]]);
                return this.__checkDeepField(ref[search.field[i]][k], search, i+1);
            }
        }
    }*/

    if (i < search.field.length - 1) {
      if (search.field[i].isIterable()) {
        if (Array.isArray(node)) {
          node.map((v: any, i: number) => {
            this._searchInNode(v, search, i);
          });
        } else if (typeof node == 'object') {
          for (let key in node) {
            this._searchInNode(node[key], search, i);
          }
        }
      } else if (Array.isArray(node)) { //instanceof Array){
        for (let k = 0; k < node.length; k++) {
          this._searchInNode(node[k], search, i);
        }
      } else {
        return this._searchInNode(node, search, i);
      }
    } else {
      ref = node;
    }


    if (ref != null) {
      return search.fn(ref);
    } else
      return false;

    /*
    do{
        if(ref[search.field[i]]!==undefined && ref[search.field[i]]!==null){
            // if nested ppt is an array - such ars method.args
            if(ref[search.field[i]] instanceof Array){
                for(let k=0; k<ref[search.field[i]].length; k++){
                    if(ref[search.field[i]][k] instanceof CLASS.ObjectType){
                        console.log(ref[search.field[i]][k].name, search.field[i+1]);
                        return this.__checkDeepField( this.__DB.classes.getEntry(ref[search.field[i]][k].name), search, i+1);
                    }
                    console.log(search.field[i],ref[search.field[i]]);
                    return this.__checkDeepField(ref[search.field[i]][k], search, i+1);
                }
            }
            // else if
            else{
                ref = ref[search.field[i]];
            }
        }else{
            // don't treat intermediate noed
            ref = null;
        }
        i++;
    }while(i<search.field.length);*/

    //console.log(ref);

  };


  _findDeepObject(index: IDbIndex | IDbCollection, search_pattern: SearchPattern): IDbIndex {
    let matches: IDbIndex = this.newResultSet();

    try {
      index.map((k:string, v:any) => {

        if (this.__checkDeepField(v, search_pattern)) {
          matches.insert(v, false);
        }
      });
    } catch (err) {
      // index is empty or an error occured during comparison
      Logger.error("[Finder::_findDeepObject] " + err.message);
    }

    return matches;
  };


  // TODO : Factoriser tous les finds
  _findObjectByTag(index: IDbIndex | IDbCollection, search_pattern: SearchPattern): IDbIndex {
    let matches: IDbIndex = this.newResultSet();

    index.map((k:string, v:any) => {
      if (search_pattern.fn(search_pattern, v))
        matches.insert(v, false);
    });
    /*
    for(let i in index){
        if(search_pattern.fn(search_pattern,index[i]))
            matches.push(index[i]);
    }*/
    //console.log("[*] "+matches.length+" items found");
    return matches;
  };

  _findObjectByModifier(index: IDbIndex | IDbCollection, search_pattern: SearchPattern): IDbIndex {
    let matches: IDbIndex = this.newResultSet();

    index.map((k:string, v:any) => {
      if (v.modifiers === undefined || v.modifiers === null)
        return;

      if (search_pattern.fn(search_pattern, v))
        matches.insert(v, false);
    });
    return matches;
  };

  /*_listObject(obj_type){
      return this.__DB[obj_type].getAll();
  };*/

  _findByID(index: IDbIndex | IDbCollection, model: NodeType, idHolder: string, pattern: string): FinderResult {

    // create a new collection to hold search results
    const tmpDb = this.__DB.getConnector().newTemporaryDb('finder:0');

    let matches: IDbIndex = tmpDb.newIndex('root', Finder.NODE_ANY);

    if(index.isCollection()){
      matches.insert( (index as IDbCollection).getEntry(pattern) , false);
    }else{
      (index as IDbIndex).map((k: any, v: any) => {
        if (v[idHolder] === pattern) {
          matches.insert(v, false);
        }
      });
    }


    /*
    index.map((k: any, v: any) => {
      if (v[idHolder] === pattern) {
        matches.insert(v, false);
        //Logger.info("[FINDER] _findByID :", JSON.stringify(v.toJsonObject()))
      }
    });*/

    return new FinderResult(matches, this);
  }

  _find(index: IDbIndex | IDbCollection, model: any, pattern: string,
        caseSensitive: boolean, lazy: boolean = false, includeMissing: boolean = false): FinderResult {

    if (pattern === null || pattern === undefined) {
      if (index.isIndex())
        return new FinderResult(index as IDbIndex, this);
      else
        throw new Error('FINDER : Invalid request');


    }

    //this.cache.push({ index:index, model:model, case:caseSensitive, lazy:lazy });

    const spatt = this._getTestFn(model, pattern, caseSensitive, lazy);

    if (spatt != null) {
      if (spatt.isModifier)
        return new FinderResult(this._findObjectByModifier(index, spatt), this);
      if (spatt.hasTag)
        return new FinderResult(this._findObjectByTag(index, spatt), this);
      else if (spatt.isDeepSearch) {
        //return new FinderResult(this._findDeepObject(index, spatt), this);
        /*if(typeof spatt.field === 'string'){
            spatt.field = spatt.field.split('.');
        }*/

        return new FinderResult(this._findDeepObject(index, spatt), this);
      } else
        return new FinderResult(this._findObject(index, spatt, includeMissing), this);
    } else {
      return new FinderResult(
        this.newResultSet(),
        this);
    }
  }

  /**
   * To create a FinderResult object from objects passed into arguments
   *
   * @param {any[]} pObjects
   * @return {FinderResult} Return a FinderResult object filled with arguments
   */
  createFinderResultFromList(pObjects: any[]): FinderResult {
    const res = this.newResultSet();
    pObjects.map((x, i) => res.insert(i, x));
    return new FinderResult(res, this);
  }
}
