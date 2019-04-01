var ut = require("./Utils.js");
const CLASS = require("./CoreClass.js");
const FILE = require("./File.js")
var CONST = require("./CoreConst.js");


var DataModel = {
    package: new CLASS.Package("stub"),
    class: new CLASS.Class(),
    field: new CLASS.Field(),
    method: new CLASS.Method(),
    call: new CLASS.Call(),
    modifier: new CLASS.Modifiers(),
    objectType: new CLASS.ObjectType(),
    basicType: new CLASS.BasicType(),
    value: new CLASS.ValueConst(), // simplidifier ici avec string
    string: new CLASS.StringValue(),
    syscall: new CLASS.Syscall(),
    missing: new CLASS.MissingReference(),
    file: new FILE.File()
};

function PreparedRequest(name){
    this.name = name;
    this.actions = [];
    //this._run = null;

    return this;
}
PreparedRequest.prototype.pushSelect = function(name, params){
    this.actions.push({ fn:name, param:params });
    return this;
};
PreparedRequest.prototype.pushAction = function(name, params){
    this.actions.push({ fn:name, param:params });
    return this;
};
PreparedRequest.prototype.exec = function(ctx){
    let i = 0;
    let res = ctx.find;

    while(i<this.actions.length){
        res = res[this.actions[0]]
  //      if(this.actions instanceof )
        i++;
    }   
}

function SearchPattern(cfg){
    this.fn = null;
    this.pattern = null;
    this.field = null;
    this.isModifier = false;
    this.isStructField = false;
    this.isDeepSearch = false;

    // init
    if(cfg!==undefined)
        for(let i in cfg) this[i] = cfg[i];
    

    return this;
}

function FinderJoin(rootData,joinData,finder){
    this.rootData = rootData;
    this.joinData = joinData
    this._finder = finder;

}
// do rootData[]-joinData[]
FinderJoin.prototype.sub = function(){
    let res=[], x=0;

    for(let i in this.rootData){
        if(this.joinData.indexOf(this.rootData[i])>0)
            continue;
        else
            res.push(this.rootData[i]);
    }

    return new FinderResult(res,this._finder);
}

FinderJoin.prototype.on = function(pattern){
    let prop = pattern.split(".");
    let lp = prop.length, pref=null, res=[], x=0;

    for(let i in this.joinData){
        
        x=0;
        pref = this.joinData[i];

        do{ pref = pref[prop[x++]] }while(x<lp);

        for(let j in this.rootData){
            x=0; xref = this.rootData[j];
            do{ xref = xref[prop[x++]] }while(x<lp);

            if(xref==pref) 
                res.push(this.rootData[j]);
        }
    }
    
    return new FinderResult(res,this._finder);
};


function FinderResult(data,finder){
    this.data = data;
    this._finder = finder;

    this.foreach = function(fn){
        for(let i in this.data) fn(this.data[i]);
    };

    return this;
}

FinderResult.prototype.getData = function(){
    return this.data;
}

/**
 * To get reference to the method calling each object
 */
FinderResult.prototype.caller = function(){
    let meth = [], obj=null;
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
     * To check is a result set contains an object
     * @param {*} obj Should has a field _hashcode containing the unique identifier of the object
     *//*
    this.contains = function(obj){
        for(let i in this.data){
            if(obj._hashcode===this.data[i]._hashcode){
                // TODO : remove
               // console.log("[DBG] "+obj._hashcode+"  contained");
                return true;
            }
        }
        // TODO : remove
        //        console.log("[DBG] "+obj._hashcode+" not contained");
        return false;
    };*/

/**
 * To merge two results sets, object already present are ignored
 * @param {FinderResult} data Another result set or list of object
 * @returns {FinderResult} 
 */
FinderResult.prototype.union = function(resultSet){

    if(typeof resultSet === 'string' || resultSet instanceof String){
        let res = this._finder._find(resultSet);
        for(let i in res){
            if(!this.contains(res))
                this.data.push(res);
        }

    }else{
        for(let i in resultSet.data){
            if(!this.contains(resultSet.data[i]))
                this.data.push(resultSet.data[i]);
        }
    }
    
    return this;
};


/**
 * To get the list of callers of each object contained into the current result set
 * @returns {FinderResult} A list of instructions using a reference to this object
 */
FinderResult.prototype.callers = function(){
    let res = [], rset = new FinderResult();

    for(let i in this.data){ 
        for(let k in this.data[i]._callers){
            rset.data.push(this.data[i]._callers[k]);
        }
    }

    return rset;
};

/**
 * To get the count of object into the result set
 * @return {int} The count of object into the result set
 */
FinderResult.prototype.count = function(){
    let ctr = 0;
    for(let i in this.data) ctr++;
    return ctr;
};

FinderResult.prototype.get = function(offset){
    return this.data[offset];
};

FinderResult.prototype.select = function(member){
    let data = [];
    this.data.forEach(x=>{
        if(x[member] !==undefined) data.push(x[member]);
    });
    
    return new FinderResult(data,this._finder);
};

FinderResult.prototype.toString = function(){
    let out = "";
    this.foreach(function(x){ 
        out += x._hashcode+"\n";
    });
    return out;
}

FinderResult.prototype.dump = function(){
    console.log(this.toString());
};


FinderResult.prototype.toJsonObject = function(fields){
    let data=[], stub={};
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
    }
    return data;
};

/**
 * To search references to the given objects
 */
FinderResult.prototype.xref = function(){
    let data=[];

    this.foreach(function(x){
        data.push(new CLASS.XRef(x,x._callers));
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
    let data = [];

    if(pattern == null) return this;

    data =  this._finder._find(this.data, null, "_useClass."+pattern, caseSensitive, true);
    data.union(this._finder._find(this.data, null, "_useMethod."+pattern, caseSensitive, true));
    data.union(this._finder._find(this.data, null, "_useField."+pattern, caseSensitive, true));

    return new FinderResult(data,this._finder);
};

FinderResult.prototype.exclude = function(pattern){
    let res = [];
    let arg = this._finder.cache[this._finder.cache.length-1];

    let result = this._finder._find(arg.index, arg.model, pattern, arg.case, arg.lazy);
    
    return new FinderJoin(this.data,result,this._finder);
};

FinderResult.prototype.intersect = function(property,pattern){
    let res = [];
    let arg = this._finder.cache[this._finder.cache.length-1];

    let result = this._finder._find(arg.index, arg.model, pattern, arg.case, arg.lazy);
    
    return (new FinderJoin(this.data,result,this._finder)).sub();
};

/**
 * To check is a result set contains an object
 * @param {*} obj Should has a field _hashcode containing the unique identifier of the object
 */
FinderResult.prototype.contains = function(obj){
    for(let i in this.data){
        if(obj._hashcode===this.data[i]._hashcode){
            // TODO : remove
           // console.log("[DBG] "+obj._hashcode+"  contained");
            return true;
        }
    }
    // TODO : remove
    //        console.log("[DBG] "+obj._hashcode+" not contained");
    return false;
};
/**
 * To display data with formatting
 * Short Show 
 */
FinderResult.prototype.sshow = function(){
    let sub = [];
    this.foreach(function(x){
        if(x instanceof CLASS.Method){
            sub.push({ 
                Class: x.enclosingClass.package+"."+x.enclosingClass.simpleName, 
                Method: x.name,
            });
        }
        else if(x instanceof CLASS.Class){
            sub.push({
                Class: x.name
            });
        }
        else if(x instanceof CLASS.Field){
            sub.push({ 
                Class: x.enclosingClass.package+"."+x.enclosingClass.simpleName, 
                Field: x.name
            });
        }
        else if(x instanceof CLASS.StringValue){
            sub.push({ 
                Value: x.value
            });
        }
        else if(x instanceof CLASS.Call){
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
        else if(x instanceof CLASS.XRef){
            sub.push({ Subject: x.calleed.signature() });
            if(x.empty)
                sub.push({ Subject: "\t  No reference found" });
            else
                for(let k in x.xref) sub.push({ Subject: "\t  "+x.xref[k].signature() });
        }
    });
    console.log(ut.makeTable(sub));
    sub = null;
};
/**
 * To display data with formatting
 */
FinderResult.prototype.show = function(){
    let sub = [];
    this.foreach(function(x){

        if(x instanceof CLASS.Method){
            sub.push({ 
                Class: x._hashcode.substr(0,x._hashcode.indexOf('|')), 
                Modifiers: x.modifiers.sprint(),
                Method: x.name,
            });
        }
        else if(x instanceof CLASS.Class){
            sub.push({ 
                Package: x.package, 
                SimpleName: x.simpleName
            });
        }
        else if(x instanceof CLASS.Field){
            sub.push({ 
                Class: x.enclosingClass.package+"."+x.enclosingClass.simpleName, 
                Field: x.name,
                Modifiers: x.modifiers.sprint()
            });
        }
        else if(x instanceof CLASS.StringValue){
            sub.push({ 
                Value: x.value, 
                Caller: x.src.signature()
            });
        }
        else if(x instanceof CLASS.Call){
            sub.push({ 
                Type: CONST.INSTR_TYPE_LABEL[x.instr.opcode.type],
                Caller: x.caller.signature(),
                Calleed: x.calleed.signature()
            });
        }
        else if(x instanceof CLASS.XRef){
            sub.push({ Subject: x.calleed.signature() });
            if(x.empty)
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
};

/*
function Graph(){
    this.subject = null;
    this.cfg = null;
}

function Inspector(db, finder){
    this.data = db;
    this.finder = finder;
}
Inspector.prototype = {
    // Variable Type Analysis
    vta: function(method){

    },
    // Class Hierarchy Analysis
    cha: function(cls){
        
    },
    // Interprocedural Control Flow Graph
    icfg: function(activity){

    },
    // Control Flow Graph
    cfg: function(method){
        
    }
}
*/
/**
 * The Finder class represents the search engine.
 * It parses the search request, performs search, and returns a FinderResult object
 * @param {*} db 
 */
function Finder(db){
    
    this.cache = [];

    /**
     * Internal check functions used during searchs
     */
    this._test = {     
        /**
         * Check if the <data> object has the <pattern> modifier
         * 
         */
        hasModifier: function(request,data){
            return data.modifiers[request.field];
        }, 
        /**
         * Check if the <data> object is tagged with <pattern>
         * 
         */ 
        hasTag: function(request,data){
            if(data.tags === undefined) 
                console.error("Object "+data+" has not 'tags' field");

            return data.tags.indexOf(request.pattern)>-1; 
        }, 
        /**
         * Mock
         */
        NO_TEST: true
    };

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
    this._getTestFn = function(dataModel, pattern, caseSensitive, lazy=false){
        
        //if(lazy===true) console.debug("LAZY mode detected !");

        if(pattern==undefined || pattern.length==0){
            console.log("[!] find : Pattern cannot be null");
            return null;
        } 

        let token = "name", lex=-1, isDeepSearch=false, rx=null, fn=null, flags="";
        // test si le motif s'applique sur un champs particulier
        
        // parse pattern
        if(pattern.substr(0,3)=="is."){
            if(lex=pattern.indexOf(":")>-1){
                token = pattern.substr(3,lex); 
                pattern = pattern.substr(lex+1);
            }else{
                token = pattern.substr(3); 
                pattern = "";
            }
    

            //console.debug("Modifier search ... "+token+"."+pattern+" == true");
            if(lazy === false){
                if(DataModel.modifier[token] !== undefined)
                    return new SearchPattern({ 
                            pattern:pattern, 
                            field:token,  
                            isModifier:true, 
                            fn:this._test.hasModifier 
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
                    fn:this._test.hasModifier 
                });
            }
        }
        else if(pattern.substr(0,4)=="has."){
            //console.debug("Tag-based request detected");
            return new SearchPattern({ 
                pattern: pattern.substr(4),  
                isModifier: false, 
                hasTag: true, 
                fn:this._test.hasTag
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


        if((lex=pattern.indexOf(":"))>-1){
            token = pattern.substr(0,lex); 
            pattern = pattern.substr(lex+1);
        }else{
            // DEFAULT field must be parameterized 
            token = "name";
            pattern = "";
        }


        // check if it is a deep search
        if(token.indexOf(".")>-1){
            token = token.split(".");
            isDeepSearch = true;
            //console.debug("Deep search detected !");
        }


        if(lazy === false && isDeepSearch === false && dataModel[token] === undefined){
            console.log("[!] The property '"+token+"' not exists for these objects");
            return null;
        }
        
        // make corresponding regexp
        flags += (caseSensitive?"":"i");
        rx = new RegExp(pattern,flags);

        //console.debug("Running search : "+rx.toString());
        if(rx != null){
            fn = function(x){ return rx.test(x) } ;
        }else{
            fn = this._test.NO_TEST
        }

        let struct = false;
        if(lazy === false && isDeepSearch===false)
            struct = (dataModel[token] instanceof Array)||(dataModel[token] instanceof Object);
        

        return new SearchPattern({ 
            pattern: pattern, 
            field: token, 
            isStructField: struct,
            isDeepSearch: isDeepSearch,
            fn: fn, 
        });
    };

    this._findObject = function(index, search_pattern, includeMissing=false){
        let matches=[], k=0, field=undefined;
        
        //console.log(search_pattern);
        for(let i in index){

            if(!includeMissing && index[i] instanceof CLASS.MissingReference) 
                continue;

            if(index[i] instanceof CLASS.Method 
                && (index[i].modifiers === undefined || index[i].modifiers === null))
                continue;

            field = index[i][search_pattern.field];
            if(field!==undefined && search_pattern.fn(field)) 
                matches.push(index[i]);
        }
        //console.log("[*] "+matches.length+" items found");
        return matches;
    };

    /**
     * To search an object by applying the condition on nested fields.
     * The depth level is ignored, the field is searched recursively by following the path
     * give by the search argument.
     * 
     * @param {*} object 
     * @param {SearchPattern} search A search pattern containing the full path to the field to compare  
     * @returns {Boolean} Return the check result 
     */
    this.__checkDeepField = function(object,search, offset=0){
        let ref=object, i=offset;

        if(object == null) return false;

        do{
            if(ref[search.field[i]]!==undefined && ref[search.field[i]]!==null){
                if(ref[search.field[i]] instanceof Array){
                    for(let k in ref[search.field[i]]){
                        //console.log(search.field[i],ref[search.field[i]]); 
                        return this.__checkDeepField(ref[search.field[i]][k], search, i+1);
                    }
                }else{
                    ref = ref[search.field[i]];
                }
            }
            i++;
        }while(i<search.field.length);

        //console.log(ref);
        return search.fn(ref);
    };

    this._findDeepObject = function(index, search_pattern){
        let matches=[], k=0, field=undefined;
        
        for(let i in index){
            if(this.__checkDeepField(index[i], search_pattern))
                matches.push(index[i]);
        }

        return matches;
    };

 
    // TODO : Factoriser tous les finds
    this._findObjectByTag = function(index, search_pattern){
        let matches=[];
        
        for(let i in index){
            if(search_pattern.fn(search_pattern,index[i])) 
                matches.push(index[i]);
        }
        //console.log("[*] "+matches.length+" items found");
        return matches;
    };

    this._findObjectByModifier = function(index, search_pattern){
        let matches=[], k=0, field=undefined;
        
        for(let i in index){
            if(index[i].modifiers === undefined || index[i].modifiers === null)
                continue;

            if(search_pattern.fn(search_pattern,index[i])) 
                matches.push(index[i]);
        }
        //console.log("[*] "+matches.length+" items found");
        return matches;
    };

    this._listObject = function(obj_type){
        return db[obj_type];
    };
    
    this._find = function(index, model, pattern, caseSensitive, lazy=false, includeMissing=false){
        if(pattern === null || pattern === undefined) return new FinderResult(index,this);

        this.cache.push({ index:index, model:model, case:caseSensitive, lazy:lazy });

        let spatt = this._getTestFn(model, pattern, caseSensitive, lazy);
        
        if(spatt!=null){
            if(spatt.isModifier)
                return new FinderResult(this._findObjectByModifier(index, spatt), this); 
            if(spatt.hasTag)
                return new FinderResult(this._findObjectByTag(index, spatt), this); 
            else if(spatt.isDeepSearch){
                //console.debug("Running deep search ...")
                //return new FinderResult(this._findDeepObject(index, spatt), this);
                return new FinderResult(this._findDeepObject(index, spatt), this);
            }
            else
                return new FinderResult(this._findObject(index, spatt, includeMissing), this);
        }else{
            return new FinderResult([], this); 
        }
    }

    /*
    this.strings = function(pattern,caseSensitive){
        new FinderResult(this._findObject(db.fields, spatt));
    };
    */
    return this;
}

/**
 * A specialization of the searchAPI for searching missing object 
 * and around
 * @param {SearchAPI} searchAPI
 * @constructor 
 */
function MissingObjectAPI(searchAPI){
    this._search = searchAPI;
}
/**
 * To get statistics about missing reference by type
 * @returns {Object} A array of number of unique missing reference per type
 * @function
 */
MissingObjectAPI.prototype.stats = function(){
    let stats = {};
    stats.field = this.search("_log_tag:FIELD").count();
    stats.type = this.search("_log_tag:TYPE").count();
    stats.method = this.search("_log_tag:METHOD").count();
    stats.class = this.search("_log_tag:CLASS").count();
    return stats;
}
/**
 * To search object into the list of missing reference
 * @param {String} pattern The search pattern following the same syntax than the SearchAPI
 * @returns {FinderResult} A set of occurences
 * @function
 */
MissingObjectAPI.prototype.search = function(pattern){
    return this._search._finder._find(this._search._db.missing, DataModel.missing, pattern, this._search._caseSensitive, true, true);     
}
MissingObjectAPI.prototype.method = function(pattern){
    let db = this.search("_log_tag:METHOD");
    return this._search._finder._find(db.data, DataModel.method, pattern, this._search._caseSensitive, true, true);     
}
MissingObjectAPI.prototype.field = function(pattern){
    let db = this.search("_log_tag:FIELD");
    return this._search._finder._find(db.data, DataModel.field, pattern, this._search._caseSensitive, true, true);     
}
MissingObjectAPI.prototype.type = function(pattern){
    let db = this.search("_log_tag:TYPE");
    return this._search._finder._find(db.data, DataModel.type, pattern, this._search._caseSensitive, true, true);     
}

/**
 * The SearchAPI. Allow the user to perform search into the object
 * database. 
 * @param {Object} data The database of objects 
 * @constructor
 */
function SearchAPI(data){
    
    var _db = this._db = data;
    this._queryCache = [];
    
    // set default case sensitivity for all search
    this._caseSensitive = true;
  
    var finder = this._finder = new Finder(this._db);

    this.help = "Usage: .help()";
    this.help = function(){
        ut.msgBox("HELP : Search API",[
            "class(<pattern>)\t\tSearch a class by any properties",
            "field(<pattern>)\t\tSearch a field by any properties",
            "method(<pattern>)\t\tSearch a method by any properties",
            "string(<pattern>)\t\tSearch a defined string by any properties",
            "call(<pattern>)\t\tSearch a call by caller/calleed/instructions properties",
            "invoke(<pattern>|<method>)\t\tSearch a call to a given method (called) by a pattern or a method object",
            "getter(<pattern>|<field>)\t\tSearch for getter of given field by a pattern or a field object",
            "setter(<pattern>|<field>)\t\tSearch for setter of given field by a pattern or a field object",
            "new(<pattern>|<class>)\t\tSearch for new instance of a given class object or class properties ",
            "array(<pattern>|<*>)\t\tSearch for static array by method properties",
            "nocase()\t\tSwitch ON/OFF the case sensitive flag of the following search"
        ]);
    };

    /**
     * Switch case sensitive On/Off of following search
     */
    this.nocase = function(){ 
        this._caseSensitive = false; 
        return this; 
    };

    this.class = function(pattern){ return finder._find(_db.classes, DataModel.class, pattern, this._caseSensitive); };
    this.package = function(pattern){ return finder._find(_db.packages, DataModel.package, pattern, this._caseSensitive); };
    this.method = function(pattern){ return finder._find(_db.methods, DataModel.method, pattern, this._caseSensitive); };
    this.field = function(pattern){ return finder._find(_db.fields, DataModel.field, pattern, this._caseSensitive); };
    this.file = function(pattern){ return finder._find(_db.files, DataModel.file, pattern, this._caseSensitive); };

    this.call = function(pattern){ 
        return finder._find(_db.call, DataModel.call, pattern, this._caseSensitive); 
    };
    this.string = function(pattern){ 
        let rf = finder._find(_db.strings, DataModel.string, pattern, this._caseSensitive); 
        return rf;
    };
    this.syscall = function(pattern){ return finder._find(_db.syscalls, DataModel.syscall, pattern, this._caseSensitive); };
    //this.syscall = function(pattern){ return finder._find(_db.syscalls, DataModel.syscall, pattern, this._caseSensitive); };
    this.syscallnum = function(id){
        return this.syscall("sysnum:^"+id+"$");
    };
 
    this.missing = new MissingObjectAPI(this);

    this.get = {
        package: function(id){ return _db.packages[id] },
        class: function(id){ return _db.classes[id] },
        method: function(id){ return _db.methods[id] },
        field: function(id){ return _db.fields[id] },
        syscalls: function(id){ return _db.syscalls[id] }
    };
    
    
    /**
     * To seach only method call
     * @param {*} pattern 
     */
    this.invoke = function(pattern){
        let res = finder._find(
            _db.call, DataModel.call, 
            "instr.opcode.instr:invoke", false, true);

        if(pattern === null)
            return res;
        if(typeof pattern === 'string' || pattern instanceof String)
            return res.filter(pattern);
        else if(pattern instanceof CLASS.Method)
            return res.filter("calleed.__signature__:"+pattern.__signature__);
        else
            return res;
    };


    /**
     * @param {String} pattern Search pattern
     */
    this.setter = function(pattern=null){
        let res = null;
        if(pattern != null){
            res = finder._find(
                _db.call, DataModel.call, 
                "calleed."+pattern, false, true);
            res = res.filter("instr.opcode.type:"+CONST.INSTR_TYPE.SETTER);
        }
        else{
            res = finder._find(
                _db.call, DataModel.call, 
                "instr.opcode.type:"+CONST.INSTR_TYPE.SETTER, false, true);
        }
 
        return res;
    }

    /**
     * 
     * @param {String} pattern Field signature
     */
    this.settersOf = function(signature){
        return this.setter("__signature__:"+signature);
    }

    /**
     * @param {String} pattern Field signature
     */
    this.getter = function(pattern=null){
        let res = null;
        if(pattern != null){
            res = finder._find(
                _db.call, DataModel.call, 
                "calleed."+pattern, false, true);
            res = res.filter("instr.opcode.type:"+CONST.INSTR_TYPE.GETTER);
        }
        else{
            res = finder._find(
                _db.call, DataModel.call, 
                "instr.opcode.type:"+CONST.INSTR_TYPE.GETTER, false, true);
        }
 
        return res;
    }


    /**
     * @param {String} pattern Field signature
     */
    this.gettersOf = function(signature){

    
        let f = new FinderResult([this.get.field(signature)], this);

        return finder._find(
            _db.call, DataModel.call, 
            "instr.opcode.type:"+CONST.INSTR_TYPE.GETTER, false, true);

        return this.getter("__signature__:"+signature);
    }

    this.calls = {
        setter: function(pattern=null){
            let res = finder._find(
                _db.call, DataModel.call, 
                "instr.opcode.type:"+CONST.INSTR_TYPE.SETTER, false, true);
            //console.log(res);
            if(pattern !== null)
                return res.filter(pattern);
            else
                return res;
        },
        getter: function(pattern=null){
            let res = finder._find(
                _db.call, DataModel.call, 
                "instr.opcode.type:"+CONST.INSTR_TYPE.GETTER, false, true);
            
            if(pattern !== null)
                return res.filter(pattern);
            else
                return res;
        },
        print: function(){
            for(let i in _db.call) 
                _db.call[i].print();
        },
        raw: function(){
            let c = null;
            for(let i in _db.call){
                c = _db.call[i];

                console.log("\t"+c.instr._raw);
            }
        },
        //find: function(pattern){ return finder.instr(pattern,true); }
    };

    this.updateDB = function(data){
        _db = this._db = data;
    };

    /**
     * Set the flag "preparing" which means the research should not be executed.
     * Create a new PreparedRequest instance. 
     */
    this.beginPrepare = function(name){
        this.preparing = true;
        this.preparingReq = new PreparedRequest(name);
        
        return this;
    }

    /**
     * 
     */
    this.endPrepare = function(){
        this.preparing = false;
        return this.preparingReq;
    }

    /**
     * To execute a prepared request. Almost time it is when 
     * an inspector is running.
     * @param {*} preparedRequest 
     */
    this.exec = function(preparedRequest){

    }
}

module.exports = {
    SearchAPI: SearchAPI,
    SearchPattern: SearchPattern,
    // Inspector: Inspector,
    Finder: Finder,
    FinderResult: FinderResult
};