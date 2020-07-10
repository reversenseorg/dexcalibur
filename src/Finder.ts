import AnalyzerDatabase from "./AnalyzerDatabase";
import {SearchAPI} from "./SearchAPI";
import {FinderResult} from "./FinderResult";
import SearchPattern from "./SearchPattern";
import ModelMethod from "./ModelMethod";
import {IDatabase, IDbCollection, IDbIndex} from "./ConnectorFactory";
import AndroidActivity from "./android/AndroidActivity";
import AndroidReceiver from "./android/AndroidReceiver";
import AndroidProvider from "./android/AndroidProvider";
import AndroidService from "./android/AndroidService";
import {AndroidPermission} from "./android/Permissions";
import ModelPackage  from './ModelPackage';
import ModelClass from "./ModelClass";
import ModelField from "./ModelField";
import ModelCall from "./ModelCall";
import {ModelBasicType, ModelObjectType} from "./ModelType";
import ModelStringValue from "./ModelStringValue";
import ModelConstantValue from "./ModelConstantValue";
import ModelSyscall from "./ModelSyscall";
import ModelDataBlock from "./ModelDataBlock";
import ModelFile from "./ModelFile";


import * as Log from './Logger';
import {Modifier} from "./AccessFlags";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

var DataModel = {
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
};




export class Finder
{
    __DB:AnalyzerDatabase = null;
    __tmp:IDatabase = null;
    cache:any = null;
    counter:number = 0;

    constructor(pDatabase:AnalyzerDatabase){
        this.__DB = pDatabase;
        this.cache = [];

        this.__tmp = this.__DB.getConnector().newTemporaryDb('finder');

        if(pDatabase != null){
            Logger.info("[SEARCH] Finder inittialized");
        }else{
            Logger.info("[SEARCH] Finder DB is empty");
        }
    }

    static testHasModifier(pRequest:any, pData:any):boolean{
        // only element with access flag can be tested
        // access flag depends of target program
        // type_of_elements + target language = modifier or not
        /*if(pData.getLanguage !== null && pData.getLanguage().supportModifier(pData)){

        }*/
        return (pData.modifiers != null) && (pData.modifiers == pRequest.field);
    }

    static testHasTag(pRequest:any, pData:any):boolean{
        if(pData.tags === undefined)
            Logger.error("Object "+pData+" has not 'tags' field");

        //console.log(data.tags.indexOf(request.pattern), data.tags, request.pattern);
        return pData.tags.indexOf(pRequest.pattern)>-1;
    }

    static testNothing():void{
        // just a mock
    }

    newResultSet():IDbIndex
    {
        this.counter++;
        return this.__tmp.newIndex('finder:'+this.counter);
    }

    updateDB(pDatabase:AnalyzerDatabase){
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
    _getTestFn(dataModel:any, pattern:string, caseSensitive:boolean, lazy:boolean=false):SearchPattern{
        
        //if(lazy===true) console.debug("LAZY mode detected !");

        if(pattern==undefined || pattern.length==0){
            Logger.info("[!] find : Pattern cannot be null");
            return null;
        } 

        let token:string|string[] = "name", lex:number=-1, isDeepSearch:boolean=false;
        let rx:RegExp=null, fn:any=null, flags:string="";
        // test si le motif s'applique sur un champs particulier
        
        // parse pattern
        if(pattern.substr(0,3)=="is."){
            if((lex=pattern.indexOf(":"))>-1){
                token = pattern.substr(3,lex-3); 
                pattern = pattern.substr(lex+1,pattern.length-lex-1);
            }else{
                token = pattern.substr(3, pattern.length-3); 
                pattern = "";
            }

            //console.debug("Modifier search ... "+token+"."+pattern+" == true");
            //*f(lazy === false){
                //if(Modifier[token] !== undefined)
                    return new SearchPattern({ 
                            pattern:pattern, 
                            field:token,  
                            isModifier:true, 
                            fn: Finder.testHasModifier
                        });
                /*else{
                    console.log("[!] The modifier '"+token+"' not exists for these objects");
                   * return null;
                }
            }else{*/
                //console.debug("LAZY filtering ...");
                return new SearchPattern({ 
                    pattern:pattern, 
                    field:token, 
                    isModifier:true, 
                    fn: Finder.testHasModifier
                });
            //Ò}
        }
        else if(pattern.substr(0,4)=="has."){
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
            //token = token.split(".");
            isDeepSearch = true;
            //console.debug("Deep search detected !");
        }


        if(lazy === false && isDeepSearch === false && dataModel[token] === undefined){
            Logger.info("[!] The property '"+token+"' not exists for these objects");
            return null;
        }
        
        // make corresponding regexp
        flags += (caseSensitive?"":"i");
        rx = new RegExp(pattern,flags);

        if(rx != null){
            fn = function(x){ 
                return rx.test(x) 
            } ;
        }else{
            fn = Finder.testNothing
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
    }

    _findObject(index:any, search_pattern, includeMissing:boolean=false):IDbIndex{
        let matches:IDbIndex = null, field:any=undefined;
        let tmpDb:IDatabase;

        // create a new collection to hold search results
        tmpDb = this.__DB.getConnector().newTemporaryDb('finder:0');

        matches = tmpDb.newIndex('root');

        index.map((k:any,v:any)=>{
            // new design removed MissingReference
            /*if(!includeMissing && (v instanceof CLASS.MissingReference))
                return;*/

            if((v instanceof ModelMethod) && (v.modifiers === undefined || v.modifiers === null))
                return;

            field = v[search_pattern.field];
            if(field!==undefined && search_pattern.fn(field)) 
                matches.insert(v, false);
        });

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
    __checkDeepField(object:any, search:SearchPattern, offset:number=0):IDbIndex{
        let ref=object, i=offset;

        if(object == null) return false;


        if(ref[search.field[i]]!==undefined && ref[search.field[i]]!==null){
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

            if(i<search.field.length-1){
                if(ref[search.field[i]] instanceof Array){
                    for(let k=0; k<ref[search.field[i]].length; k++){
                        if(ref[search.field[i]][k] instanceof CLASS.ObjectType){
                            //console.log(search.field[i], ref[search.field[i]][k].name, search.field[i+1]);
                            return this.__checkDeepField( this.__DB.classes.getEntry(ref[search.field[i]][k].name), search, i+1);
                        }
                        else if(ref[search.field[i]][k] instanceof CLASS.BasicType){
                            // terminal node (ignore array tag)
                            return false;
                        }else{
                            //console.log(search.field[i],ref[search.field[i]]); 
                            return this.__checkDeepField(ref[search.field[i]][k], search, i+1);
                        }                
                    }
                }else{
                    if(ref[search.field[i]] instanceof CLASS.ObjectType){
                        return this.__checkDeepField( this.__DB.classes.getEntry(ref[search.field[i]].name), search, i+1);
                    }
                    else if(ref[search.field[i]] instanceof CLASS.BasicType){
                        return false;
                    }else{
                        return this.__checkDeepField(ref[search.field[i]], search, i+1);
                    }   

                    return this.__checkDeepField(ref[search.field[i]], search, i+1);
                }
            }else{
                ref = ref[search.field[i]];
            }
        }

        if(ref != null){
            return search.fn(ref);
        }else
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

    _findDeepObject(index:IDbIndex|IDbCollection, search_pattern:SearchPattern):IDbIndex{
        let matches:IDbIndex=this.newResultSet();
        
        index.map((k,v)=>{
            if(this.__checkDeepField(v, search_pattern))
                matches.insert(v, false);
        });
/*
        for(let i in index){
            if(this.__checkDeepField(index[i], search_pattern))
                matches.push(index[i]);
        }*/

        return matches;
    };

 
    // TODO : Factoriser tous les finds
    _findObjectByTag(index:IDbIndex|IDbCollection, search_pattern:SearchPattern):IDbIndex{
        let matches:IDbIndex=this.newResultSet();
        
        index.map((k,v)=>{
            if(search_pattern.fn(search_pattern,v)) 
                matches.insert(v,false);
        });
        /*
        for(let i in index){
            if(search_pattern.fn(search_pattern,index[i])) 
                matches.push(index[i]);
        }*/
        //console.log("[*] "+matches.length+" items found");
        return matches;
    };

    _findObjectByModifier(index:IDbIndex|IDbCollection, search_pattern:SearchPattern):IDbIndex{
        let matches:IDbIndex=this.newResultSet(), k=0, field=undefined;
        
        index.map((k,v)=>{
            if(v.modifiers === undefined || v.modifiers === null)
                return;

            if(search_pattern.fn(search_pattern,v)) 
                matches.insert(v, false);
        });
        return matches;
    };

    /*_listObject(obj_type){
        return this.__DB[obj_type].getAll();
    };*/
    
    _find(index:IDbIndex|IDbCollection, model:any, pattern:string,
          caseSensitive:boolean, lazy:boolean=false, includeMissing:boolean=false):FinderResult{

        if(pattern === null || pattern === undefined) return new FinderResult(index,this);

        //this.cache.push({ index:index, model:model, case:caseSensitive, lazy:lazy });

        let spatt:SearchPattern = this._getTestFn(model, pattern, caseSensitive, lazy);
        
        if(spatt!=null){
            if(spatt.isModifier)
                return new FinderResult(this._findObjectByModifier(index, spatt), this); 
            if(spatt.hasTag)
                return new FinderResult(this._findObjectByTag(index, spatt), this); 
            else if(spatt.isDeepSearch){
                console.debug("Running deep search ...")
                //return new FinderResult(this._findDeepObject(index, spatt), this);
                return new FinderResult(this._findDeepObject(index, spatt), this);
            }
            else
                return new FinderResult(this._findObject(index, spatt, includeMissing), this);
        }else{
            return new FinderResult(
                this.newResultSet(),
                this);
        }
    }

}

/*
export class MissingObjectAPI
{
    _search:SearchAPI = null;

    /**
     * A specialization of the searchAPI for searching missing object
     * and around
     * @param {SearchAPI} searchAPI
     * @constructor
     *
    constructor(pSearchApi:SearchAPI=null) {
        this._search = pSearchApi;
    }

    /**
     * To get statistics about missing reference by type
     * @returns {Object} A array of number of unique missing reference per type
     * @function
     *
    stats():any{
        let stats:any = {};
        stats.field = this.search("_log_tag:FIELD").count();
        stats.type = this.search("_log_tag:TYPE").count();
        stats.method = this.search("_log_tag:METHOD").count();
        stats.class = this.search("_log_tag:CLASS").count();
        return stats;
    }

    /*
     * To search object into the list of missing reference
     * @param {String} pattern The search pattern following the same syntax than the SearchAPI
     * @returns {FinderResult} A set of occurences
     * @function
     *
    search(pattern:string):FinderResult{
        return this._search._finder._find(this._search._db.missing, DataModel.missing, pattern, this._search._caseSensitive, true, true);
    }

    method(pattern:string):FinderResult{
        let db = this.search("_log_tag:METHOD");
        return this._search._finder._find(db.data, DataModel.method, pattern, this._search._caseSensitive, true, true);
    }

    field(pattern:string):FinderResult{
        let db = this.search("_log_tag:FIELD");
        return this._search._finder._find(db.data, DataModel.field, pattern, this._search._caseSensitive, true, true);
    }

    type(pattern:string):FinderResult{
        let db = this.search("_log_tag:TYPE");
        return this._search._finder._find(db.data, DataModel.type, pattern, this._search._caseSensitive, true, true);
    }
}*/

