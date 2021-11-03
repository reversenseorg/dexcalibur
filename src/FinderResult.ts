import ModelMethod from "./ModelMethod";
import ModelClass from "./ModelClass";
import ModelField from "./ModelField";
import ModelCall from "./ModelCall";
import ModelStringValue from "./ModelStringValue";
import {XRef} from "./ModelReference";
import {Finder} from "./Finder";
import {IDbIndex} from "./persist/orm/DbAbstraction";
import ModelConstantValue from "./ModelConstantValue";
import {CONST} from "./CoreConst";
import ModelFile from "./ModelFile";
import Util from "./Utils";
import {ModifierFormat} from "./AccessFlags";
import ModelSyscall from "./ModelSyscall";


import * as Log from "./Logger";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class FinderJoin
{
    _finder:Finder = null;
    rootData:IDbIndex = null;
    joinData:IDbIndex = null;

    constructor(rootData,joinData,finder:Finder){
        this.rootData = rootData;
        this.joinData = joinData
        this._finder = finder;
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

            do{ pref = pref[prop[x++]] }while(x<lp);

            this.rootData.map((i,j)=>{
                let y=0, xref = j
                do{ xref = xref[prop[y++]] }while(y<lp);

                if(xref==pref)
                    res.insert(this.rootData[j], false);
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
    constructor(pData:IDbIndex, pFinder:Finder=null) {
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


    /**
     * To get all data from results as an array
     *
     * @returns {Array|Object} Data
     * @method
     */
    getData():any{
        return this.data.getAll();
    }

    readAccess():FinderResult{
        let meth:IDbIndex = this._finder.newResultSet(), obj:any=null;
        this.data.map((k,v)=>{

            if(v instanceof ModelStringValue){
                meth.insert(v.src, false);
            }
            else if(v instanceof ModelConstantValue){
                console.error("[!] Not implemented : [ValueConst].method() ")
            }
            else if(v instanceof ModelField){

                for(let k=0; k<v._getters.length; k++ ){
                    meth.insert(v._getters[k], false);
                }
            }
        });
        return new FinderResult(meth,this._finder);
    }


    writeAccess():FinderResult{
        let meth:IDbIndex = this._finder.newResultSet(), obj:any=null;
        this.data.map((k,v)=>{

            if(v instanceof ModelStringValue){
                meth.insert(v.src, false);
            }
            else if(v instanceof ModelConstantValue){
                console.error("[!] Not implemented : [ValueConst].method() ")
            }
            else if(v instanceof ModelField){

                for(let k=0; k<v._setters.length; k++ ){
                    meth.insert(v._setters[k], false);
                }
            }
        });
        return new FinderResult(meth,this._finder);
    }
    /**
     * To get reference to the method calling each object
     *
     * @method
     */
    caller():FinderResult{
        let meth:IDbIndex = this._finder.newResultSet(), obj:any=null;
        this.data.map((k,v)=>{

            if(v instanceof ModelStringValue){
                meth.insert(v.src, false);
            }
            else if(v instanceof ModelConstantValue){
                console.error("[!] Not implemented : [ValueConst].method() ")
            }
            else if(v instanceof ModelField
                || v instanceof ModelMethod
                || v instanceof ModelClass){

                for(let k=0; k<v._callers.length; k++ ){
                    meth.insert(v._callers[k], false);
                }
            }
            else if(v instanceof ModelCall){
                meth.insert(v.caller, false)
            }
        });
        return new FinderResult(meth,this._finder);
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

        resultSet.data.map((k,v)=>{
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
        //createFinderResultFromList

        pObject.map((k:any)=>{
            if(!this.contains(k))
                this.data.insert(k, false);
        });

        return this;
    }


    /**
     * To get the list of callers of each object contained into the current result set
     * @returns {FinderResult} A list of instructions using a reference to this object
     */
    callers():FinderResult{
        let data:IDbIndex = this._finder.newResultSet();

        this.data.map((k,v) => {
            for(let i in v._callers){
                data.insert(v._callers[i], false);
            }
        });
    /*
    for(let i in this.data){
        for(let k in this.data[i]._callers){
            rset.data.push(this.data[i]._callers[k]);
        }
    }*/

        return new FinderResult(data, this._finder);
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

        this.data.map((k,v)=>{
            if(v.hasOwnProperty(member)===true){
                Logger.info("[FINDER RESULT] select : <"+member+"> in entry <"+k+"> is OK");
                if(Array.isArray(v[member])){
                    v[member].map( x => {

                        //Logger.info("[FINDER RESULT] select : "+x);
                        data.insert(x, false)
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
        this.data.map((k,x)=>{
            out += x._hashcode+"\n";
        });

        return out;
    }

    dump(){
        console.log(this.toString());
    }

    toJsonObject(fields:any = null):any{
        let data:any=[];

        this.data.map((k:string|number, v:any)=>{
            if(v.toJsonObject == undefined){
                //Logger.error("[FINDER RESULT] toJsonObject : toJsonObject() not found");
                data.push(v);
            }else{
                // TODO : ensure toJsonObject format is write for all entries type
                data.push(v.toJsonObject(fields));
            }
        });
        return data;
    }

    /**Ò
     * To search references to the given objects
     * @deprecated
     */
    xref():FinderResult{
        let data:IDbIndex = this._finder.newResultSet();

        this.data.map((k:string|number, v:any)=>{
            data.insert(new XRef(v,v._callers), false);
        });

        return new FinderResult(data, this._finder);
    }

    help(){
        let t="+-------------------- HELP --------------------+";
        t += "\n\t.foreach(<fn>)\t\tExecute the function <fn> for each row of the result set";
        t += "\n\t.caller()\t\tSearch the xref for each row of the result set";
        t += "\n\t.filter(<pattern>)\tvFilter the result set by searching a pattern (same format than .find(<pattern>) )";
        t += "\n\t.ifilter(<pattern>)\t\tSame than .filter() but case insensitive";
        t += "\n\t.contains(<object>)\tvCheck the result set contains the given <object>";
        t += "\n\t.union(<FinderResult>)\tvPerform an union between two result sets";
        t += "\n\t.exclude(<pattern>)\tvExclude a subset of objects matching the pattern <pattern>";
        t += "\n\t.show()\t\tDisplay the result data with a formatted style";
        t += "\n\t.sshow()\t\tSame than .show() but with lesser data. (Small Show)";
        t += "\n\t.ssshow(<length>)\t\tSame than .sshow() but with truncate data at <length> char. (Small Small Show)";
        t += "\n\t.get(<id>)\t\tGet the <id> matching object from the result set.";
        t += "\n\t.using(<pattern>)\t\tFilter by class/field/method used by the subject";
        t += "\n\t.count()\t\tGet the count of matching object contained in the result set";
        t += "\n\t.help()\t\tThis help";
        t += "\n";

        console.log(t)
    }

    using(pattern:string, caseSensitive:boolean=true):FinderResult{
        let data:FinderResult = null;

        if(pattern == null) return this;

        data =  this._finder._find(this.data, null, "_useClass."+pattern, caseSensitive, true);
        data.union(this._finder._find(this.data, null, "_useMethod."+pattern, caseSensitive, true));
        data.union(this._finder._find(this.data, null, "_useField."+pattern, caseSensitive, true));

        return data;
    }


    exclude(pattern:string):FinderResult{
        // TODO : implement FinderResult.exclude
        throw  new Error('FinderResult.exclude is not yet implemented');
        return null;
        /*
        let arg = this._finder.cache[this._finder.cache.length-1];

        let result:FinderResult = this._finder._find(arg.index, arg.model, pattern, arg.case, arg.lazy);

        return new FinderJoin(this.data,result,this._finder);*/
    }

    intersect(property:string, pattern:any):FinderResult{
        // TODO : implement FinderResult.intersect
        throw  new Error('FinderResult.intersect is not yet implemented');
        return null;
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

    /**
     * To display data with formatting
     * Short Show
     */
    sshow(){
        let sub:any = [];
        this.data.map((k:any,x:any)=>{
            if(x instanceof ModelMethod){
                sub.push({
                    Class: x.enclosingClass.package+"."+x.enclosingClass.simpleName,
                    Method: x.name,
                });
            }
            else if(x instanceof ModelClass){
                sub.push({
                    Class: x.name
                });
            }
            else if(x instanceof ModelField){
                sub.push({
                    Class: x.enclosingClass.package+"."+x.enclosingClass.simpleName,
                    Field: x.name
                });
            }
            else if(x instanceof ModelStringValue){
                sub.push({
                    Value: x.value
                });
            }
            else if(x instanceof ModelCall){
                sub.push({
                    Type: CONST.INSTR_TYPE_LABEL[x.instr.opcode.type],
                    Calleed: x.calleed.signature()
                });
            }
            else if(x instanceof ModelFile){
                sub.push({
                    Name: x.name,
                    Extension: (x.type!=null)? x.type : "[NULL]" // CLEANUP : x.type.ext
                });
            }
            // TODO : fix *.xref into search API
            else if(x instanceof XRef){
                sub.push({ Subject: x.subject.signature() });
                if(x.noref)
                    sub.push({ Subject: "\t  No reference found" });
                else
                    for(let k in x.xref) sub.push({ Subject: "\t  "+x.xref[k].signature() });
            }
        });

        console.log(Util.makeTable(sub));
        sub = null;
    }
    /**
     * To display data with formatting
     */
    show(){
        let sub:any = [];
        this.data.map((k:any,x:any)=>{

            if(x instanceof ModelMethod){
                sub.push({
                    Class: x._hashcode.substr(0,x._hashcode.indexOf('|')),
                    Modifiers: ModifierFormat.sprintModifier(x.modifiers),
                    Method: x.name,
                });
            }
            else if(x instanceof ModelClass){
                sub.push({
                    Package: x.package,
                    SimpleName: x.simpleName
                });
            }
            else if(x instanceof ModelField){
                sub.push({
                    Class: x.enclosingClass.package+"."+x.enclosingClass.simpleName,
                    Field: x.name,
                    Modifiers: ModifierFormat.sprintModifier(x.modifiers)
                });
            }
            else if(x instanceof ModelStringValue){
            sub.push({
                Value: x.value,
                Caller: x.src.signature()
            });
        }
        else if(x instanceof ModelCall){
            sub.push({
                Type: CONST.INSTR_TYPE_LABEL[x.instr.opcode.type],
                Caller: x.caller.signature(),
                Calleed: x.calleed.signature()
            });
        }
        else if(x instanceof XRef){
            sub.push({ Subject: x.subject.signature() });
            if(x.noref)
                sub.push({ Subject: "\t  No reference found" });
            else
                for(let k in x.xref) sub.push({ Subject: "\t  "+x.xref[k].signature() });
        }
        else if(x instanceof ModelFile){
            sub.push({
                Name: x.path,
                Extension: (x.type!=null)? x.type : "[NULL]"
            });
        }
        else if(x instanceof ModelSyscall){
            sub.push({
                "num": x.sysnum.join(","),
                "Function": x.func_name,
                "Syscall": x.sys_name,
                "Params": x.args.join(","),
                "Return Type": x.ret
            });
        }
        else{
            sub.push({ Value: x.toString() });
        }
    });
    console.log(Util.makeTable(sub));
    sub = null;
}

}
