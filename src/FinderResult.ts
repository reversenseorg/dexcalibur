import ModelMethod from "./ModelMethod";
import ModelClass from "./ModelClass";
import ModelField from "./ModelField";
import ModelCall from "./ModelCall";
import {ModelStringValue} from "./ModelStringValue";
import {XRef} from "./ModelReference";




export class FinderJoin
{
    constructor(rootData,joinData,finder){
        this.rootData = rootData;
        this.joinData = joinData
        this._finder = finder;
    }

    // do rootData[]-joinData[]
    sub(){
        let res=new MemoryDb.Index(), x=0;

        this.rootData.map((k,v)=>{
            // element ignored if joinData contains
            if(this.joinData.hasEntry(v))
                return;
            else
                res.insert(v);
        });

        return new FinderResult(res,this._finder);
    }

    on(pattern){
        let prop = pattern.split(".");
        let lp = prop.length, pref=null, res=new MemoryDb.Index(), x=0;

        this.joinData.map((k,v)=>{

            x=0;
            pref = v;

            do{ pref = pref[prop[x++]] }while(x<lp);

            this.rootData.map((i,j)=>{
                let y=0, xref = j
                do{ xref = xref[prop[y++]] }while(y<lp);

                if(xref==pref)
                    res.insert(this.rootData[j]);
            });
        });

        return new FinderResult(res,this._finder);
    };
}


export class FinderResult
{
    data:any;
    _finder:Finder;

    constructor(pData:any, pFinder:Finder=null) {
        this.data = pData;
        this._finder = pFinder;
    }

    foreach(pFunc:any){
        this.data.map(pFunc);
    }


    FinderResult.prototype.getData = function(){
    return this.data.getAll();
}

    /**
     * To get reference to the method calling each object
     */
    FinderResult.prototype.caller = function(){
    let meth = new MemoryDb.Index(), obj=null;
    this.data.map((k,v)=>{
        obj=this.data[i];

        if(v instanceof CLASS.StringValue){
            meth.insert(v.src);
        }
        else if(v instanceof CLASS.ValueConst){
            console.error("[!] Not implemented : [ValueConst].method() ")
        }
        else if(v instanceof CLASS.Field
            || v instanceof CLASS.Method
            || v instanceof CLASS.Class){

            for(let k=0; k<v._callers.length; k++ ){
                meth.insert(v._callers[k]);
            }
        }
        else if(v instanceof CLASS.Call){
            meth.insert(v.caller)
        }
    });/*
    for(let i in this.data){

        obj=this.data[i];

        if(obj instanceof CLASS.StringValue){
            meth.push(obj.src);
        }
        else if(obj instanceof CLASS.ValueConst){
            console.error("[!] Not implemented : [ValueConst].method() ")
        }
        else if(obj instanceof CLASS.Field
            || obj instanceof CLASS.Method
            || obj instanceof CLASS.Class){

            for(let k=0; k<obj._callers.length; k++ ){
                meth.push(obj._callers[k]);
            }
        }
        else if(obj instanceof CLASS.Call){
            meth.push(obj.caller)
        }
    }
    */
    return new FinderResult(meth,this._finder);
};

    /**
     * Perform lzing filtering
     * @param {*} pattern
     */
    FinderResult.prototype.filter = function(pattern, caseSensitive=true){
    // perform search with lazy mode
    // not detects fails
    return this._finder._find(this.data, null, pattern, caseSensitive, true);
};

    FinderResult.prototype.ifilter = function(pattern){
    // perform search with lazy mode
    // not detects fails
    return this.filter(pattern, false);
};


    /**
     * To merge two results sets, object already present are ignored
     * @param {FinderResult} data Another result set or list of object
     * @returns {FinderResult}
     */
    FinderResult.prototype.union = function(resultSet){

    if(typeof resultSet === 'string' || resultSet instanceof String){
        let res = this._finder._find(resultSet);
        res.data.map((k,v)=>{
            if(!this.contains(v))
                this.data.insert(v);
        });
    }else{
        resultSet.data.map((k,v)=>{
            if(!this.contains(v))
                this.data.insert(v);
        });
    }

    return this;
};


    /**
     * To get the list of callers of each object contained into the current result set
     * @returns {FinderResult} A list of instructions using a reference to this object
     */
    FinderResult.prototype.callers = function(){
    let rset = new FinderResult();

    this.data.map((k,v) => {
        for(let i in v._callers){
            rset.data.insert(v._callers[i]);
        }
    });
    /*
    for(let i in this.data){
        for(let k in this.data[i]._callers){
            rset.data.push(this.data[i]._callers[k]);
        }
    }*/

    return rset;
};

    /**
     * To get the count of object into the result set
     * @return {int} The count of object into the result set
     */
    FinderResult.prototype.count = function(){
    return this.data.size();
};

    FinderResult.prototype.get = function(offset){
    return this.data.getEntry(offset);
};

    FinderResult.prototype.select = function(member){
    let data = new MemoryDb.Index();

    this.data.map((k,v)=>{
        if(v[member] !==undefined) data.insert(v[member]);
    });

    return new FinderResult(data,this._finder);
};

    FinderResult.prototype.toString = function(){
    let out = "";
    this.data.map((k,x)=>{
        out += x._hashcode+"\n";
    });
    return out;
}

    FinderResult.prototype.dump = function(){
    console.log(this.toString());
};


    FinderResult.prototype.toJsonObject = function(fields){
    let data=[], stub={};

    this.data.map((k,v)=>{
        if(v.toJsonObject == undefined){
            console.log("ERROR : toJsonObject() not found");
        }else if(! (v instanceof CLASS.MissingReference)){
            data.push(v.toJsonObject(fields));
        }else{
            stub = {};
            for(let k in fields) stub[fields[k]] = "[MissingReference] Object";
            data.push(stub);
        }
    });
    /*
    for(let i in this.data){
        if(this.data[i].toJsonObject == undefined){
            console.log("ERROR : toJsonObject() not found");
        }else if(! (this.data[i] instanceof CLASS.MissingReference)){
            data.push(this.data[i].toJsonObject(fields));
        }else{
            stub = {};
            for(let k in fields) stub[fields[k]] = "[MissingReference]";
            data.push(stub);
        }
    }*/
    return data;
};

    /**
     * To search references to the given objects
     */
    FinderResult.prototype.xref = function(){
    let data=new MemoryDb.Index();

    this.data.map((k,v)=>{
        data.insert(new CLASS.XRef(v,v._callers));
    });

    return new FinderResult(data,this._finder);
};

    FinderResult.prototype.help = function(){
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
};

    FinderResult.prototype.using = function(pattern){
    let data = new MemoryDb.Index();

    if(pattern == null) return this;

    data =  this._finder._find(this.data, null, "_useClass."+pattern, caseSensitive, true);
    data.union(this._finder._find(this.data, null, "_useMethod."+pattern, caseSensitive, true));
    data.union(this._finder._find(this.data, null, "_useField."+pattern, caseSensitive, true));

    return new FinderResult(data,this._finder);
};

    FinderResult.prototype.exclude = function(pattern){
    let res = new MemoryDb.Index();
    let arg = this._finder.cache[this._finder.cache.length-1];

    let result = this._finder._find(arg.index, arg.model, pattern, arg.case, arg.lazy);

    return new FinderJoin(this.data,result,this._finder);
};

    intersect(property:string, pattern:any){
        let res = new MemoryDb.Index();
        let arg = this._finder.cache[this._finder.cache.length-1];

        let result = this._finder._find(arg.index, arg.model, pattern, arg.case, arg.lazy);

        return (new FinderJoin(this.data,result,this._finder)).sub();
    }

    /**
     * To check is a result set contains an object
     * @param {*} obj Should has a field _hashcode containing the unique identifier of the object
     */
    contains(obj:any):boolean{
        let f:number=0;
        this.data.map((k:any,v:any)=>{
            if(obj._hashcode===v._hashcode) f++;
        });

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
            else if(x instanceof FILE.File){
                sub.push({
                    Name: x.name,
                    Extension: (x.type!=null)? x.type.ext : "[NULL]"
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

        console.log(ut.makeTable(sub));
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
                    Modifiers: x.modifiers.sprint(),
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
                    Modifiers: x.modifiers.sprint()
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
        else if(x instanceof FILE.File){
            sub.push({
                Name: x.path,
                Extension: (x.type!=null)? x.type.ext : "[NULL]"
            });
        }
        else if(x instanceof CLASS.Syscall){
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
    console.log(ut.makeTable(sub));
    sub = null;
}

}
