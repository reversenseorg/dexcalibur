
/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {Finder} from "./Finder.js";

import * as Log from "../Logger.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {IDbIndex, NodeUtils, SerializeOptions} from "@reversense/dexcalibur-orm";
import passport from "passport";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class FinderJoin
{
  _finder:Finder;
  rootData:IDbIndex;
  joinData:IDbIndex;

  constructor(pRootData:IDbIndex,pJoinData:IDbIndex,pFinder:Finder){
    this.rootData = pRootData;
    this.joinData = pJoinData
    this._finder = pFinder;
  }

  // do rootData[]-joinData[]
  sub():FinderResult{
    let res:IDbIndex = this._finder.newResultSet();

    this.rootData.map((k:string|number, v:any)=>{
      // element ignored if joinData contains
      if(this.joinData.hasEntry(v))
        return;
      else
        res.insert(v, false);
    });

    return new FinderResult(res,this._finder);
  }

  on(pattern:string):FinderResult{
    let prop:string[] = pattern.split(".");
    let lp:number = prop.length, pref:any=null, res=this._finder.newResultSet(), x:number=0;

    this.joinData.map((k:string|number,v:any)=>{

      x=0;
      pref = v;

      // TODO : if data not in memory getter must trigger elastic request
      // TODO :  such request should be compiled to elastic query and queries cached
      do{ pref = pref[prop[x++]] }while(x<lp);

      this.rootData.map((i:string,j:any)=>{
        let y=0, xref = j
        do{ xref = xref[prop[y++]] }while(y<lp);

        if(xref==pref)
          res.insert({
            ...j, //this.rootData[j],
            ...v
          }, false);
          // should also contains data from joined index
      });
    });

    return new FinderResult(res,this._finder);
  };
}

/**
 * @class
 */
export class FinderResult
{
    data:IDbIndex;
    _finder:Finder;

    /**
     *
     * @param {IDbIndex} pData
     * @param {Finder} pFinder
     * @constructor
     */
    constructor(pData:IDbIndex, pFinder:Finder) {
        this.data = pData;
        this._finder = pFinder;
    }

    /**
     * To call a function for each entry (same as 'map' for Array objects)
     *
     * @param {Function} pFunc Callback function
     * @method
     */
    foreach(pFunc:any){
        this.data.map(pFunc);
    }


    list():any[] {
        return this.data.getAsList();
    }

    /**
     * To get all data from results as an array
     *
     * @returns {Array|Object} Data
     * @method
     */
    getData():any{
        return this.data.getAll();
    }

    /**
     * Perform lzing filtering
     * @param {*} pattern
     */
    filter(pattern:string, caseSensitive:boolean=true):FinderResult{
        // perform search with lazy mode
        // not detects fails
        return this._finder._find(this.data, null, pattern, caseSensitive, true);
    };

  /**
   * Case insensitive
   *
   * @param pattern
   */
  ifilter(pattern:string):FinderResult{
        // perform search with lazy mode
        // not detects fails
        return this.filter(pattern, false);
    }


    /**
     * To merge two results sets, object already present are ignored
     * @param {FinderResult} data Another result set or list of object
     * @returns {FinderResult}
     */
    union(resultSet:FinderResult):FinderResult{

        resultSet.data.map((k:string,v:any)=>{
            if(!this.contains(v))
                this.data.insert(v, false);
        });

        return this;
    }

    /**
     * Same union() but merge the data contained into the specified array
     * with
     * @param pObject
     */
    unionWithList( pObject:any[]):FinderResult {

        if(pObject==null || !Array.isArray(pObject)){
            return this;
        }

        pObject.map((k:any)=>{
            if(!this.contains(k))
                this.data.insert(k, false);
        });

        return this;
    }

    aggregate( pOptions:any):any {

    }


    /**
     * To get the count of object into the result set
     * @return {int} The count of object into the result set
     */
    count():number{
        return this.data.size();
    }

    /**
     * To get an entry from results by its offset
     *
     * @param {Number} offset
     */
    get(offset:number):any{
        return this.data.getEntry(offset);
    }

    /**
     * To select an adjacent node for each entries into result set.
     *
     * For example, if the result set is a list of 'ModelMethod' object,
     * then the list of enclosing class for each can be get using
     * `enclosingClass` parameter
     *
     * @param {String} member Relation/property name
     */
    select(member:string):FinderResult{
        let data:IDbIndex = this._finder.newResultSet();

        this.data.map((k:string,v:any)=>{
            if(v.hasOwnProperty(member)===true){
                Logger.info("[FINDER RESULT] select : <"+member+"> in entry <"+k+"> is OK");

                if(v[member]==null) return;

                if(Array.isArray(v[member])){
                    v[member].map( (x:any) => {
                        if(x!=null){
                            data.insert(x, false);
                        }
                    });
                }
                else if(!NodeUtils.isNode(v[member]) &&  typeof (v[member])==='object' ){

                    Object.values(v[member]).map(x => {
                        if(x!=null){
                            data.insert(x, false);
                        }
                    });
                }else{
                    data.insert(v[member], false);
                }
            }
        });

        return new FinderResult(data,this._finder);
    }

    toString():string{
        let out:string = "";
        this.data.map((k:string,x:any)=>{
            out += x._hashcode+"\n";
        });

        return out;
    }

    dump(){
        console.log(this.toString());
    }

    toJsonObject(pOptions:SerializeOptions = {}):any{
        let data:any=[];

        this.data.map((k:string|number, v:any)=>{
            if(v==null) return ;


            if(v.toJsonObject == undefined){
                //Logger.error("[FINDER RESULT] toJsonObject : toJsonObject() not found");
                data.push(v);
            }else{
                // TODO : ensure toJsonObject format is write for all entries type
                data.push(v.toJsonObject(pOptions));
            }

        });

        CoreDebug.checkJsonSerialize(data,"FinderResult");
        return data;
    }

    /*
     * To search references to the given objects
     * @deprecated
     */
    /*
    xref():FinderResult{
        let data:IDbIndex = this._finder.newResultSet();

        this.data.map((k:string|number, v:any)=>{
            data.insert(new XRef(v,v._callers), false);
        });

        return new FinderResult(data, this._finder);
    }*/

    help(){
        let t="+-------------------- HELP --------------------+";
        t += "\n\t.foreach(<fn>)\t\tExecute the function <fn> for each row of the result set";
        t += "\n\t.filter(<pattern>)\tvFilter the result set by searching a pattern (same format than .find(<pattern>) )";
        t += "\n\t.ifilter(<pattern>)\t\tSame than .filter() but case insensitive";
        t += "\n\t.contains(<object>)\tvCheck the result set contains the given <object>";
        t += "\n\t.union(<FinderResult>)\tvPerform an union between two result sets";
        t += "\n\t.exclude(<pattern>)\tvExclude a subset of objects matching the pattern <pattern>";
        t += "\n\t.ssshow(<length>)\t\tSame than .sshow() but with truncate data at <length> char. (Small Small Show)";
        t += "\n\t.get(<id>)\t\tGet the <id> matching object from the result set.";
        t += "\n\t.count()\t\tGet the count of matching object contained in the result set";
        t += "\n\t.help()\t\tThis help";
        t += "\n";

        console.log(t)
    }

    exclude(pattern:string, caseSensitive:boolean=true):FinderResult{
        // TODO : implement FinderResult.exclude
        let data:IDbIndex = this._finder.newResultSet();

        return this._finder._find(this.data, null, pattern, caseSensitive, true, false, true);
    }

    intersect(property:string, pattern:any):FinderResult{
        // TODO : implement FinderResult.intersect
        throw  new Error('FinderResult.intersect is not yet implemented');
        /*let res:IDbIndex = this._finder.newResultSet();
        let arg = this._finder.cache[this._finder.cache.length-1];

        let result = this._finder._find(arg.index, arg.model, pattern, arg.case, arg.lazy);

        return (new FinderJoin(this.data,result,this._finder)).sub();*/
    }

    /**
     * To check is a result set contains an object
     * @param {*} obj Should has a field _hashcode containing the unique identifier of the object
     */
    contains(obj:any):boolean{
        let f:number=0;

        // if, it is an instance of a formalized node
        if(obj.hasOwnProperty('__')){
            this.data.map((k:any,v:any)=>{
                if(v.hasOwnProperty('__')){
                    if(obj.getUID()===v.getUID()) f++;
                }else if(v.hasOwnProperty('_hashcode')){
                    if(obj._hashcode===v._hashcode) f++;
                }else{
                    throw new Error("Nodes cannot be compared (#1)");
                }
            });
        }else{
            this.data.map((k:any,v:any)=>{
                if(v.hasOwnProperty('_hashcode')){
                    if(obj._hashcode===v._hashcode) f++;
                }else{
                    throw new Error("Nodes cannot be compared (#2)");
                }
            });
        }


        // TODO : remove
        //        console.log("[DBG] "+obj._hashcode+" not contained");
        return (f>0);
    }
}
