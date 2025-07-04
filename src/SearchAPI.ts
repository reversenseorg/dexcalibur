import {Finder} from "./search/Finder.js";
import Util from "./Utils.js";
import AnalyzerDatabase from "./AnalyzerDatabase.js";
import ModelClass from "./ModelClass.js";
import {FinderResult} from "./search/FinderResult.js";
import ModelField from "./ModelField.js";
import ModelMethod from "./ModelMethod.js";
import ModelCall from "./ModelCall.js";
import ModelPackage from "./ModelPackage.js";
import {ModelBasicType, ModelObjectType} from "./ModelType.js";
import ModelStringValue from "./ModelStringValue.js";
import ModelSyscall from "./ModelSyscall.js";
import ModelConstantValue from "./ModelConstantValue.js";
import ModelFile from "./ModelFile.js";
import ModelDataBlock from "./ModelDataBlock.js";
import AndroidActivity from "./android/AndroidActivity.js";
import AndroidReceiver from "./android/AndroidReceiver.js";
import AndroidProvider from "./android/AndroidProvider.js";
import AndroidService from "./android/AndroidService.js";
import {AndroidPermission} from "./android/Permissions.js";
import {CONST} from "./CoreConst.js";
import {ModelFunction} from "./ModelFunction.js";
import DataScope, {DataScopeMap} from "./DataScope.js";
import {IAnalyzerUnit} from "./analyzer/IAnalyzerUnit.js";
import {SearchEngineException} from "./errors/SearchEngineException.js";
import {DataAnalyzer} from "./DataAnalyzer.js";
import {IDbCollection, IDbIndex, INode} from "@dexcalibur/dexcalibur-orm";
import {INodeRef} from "./INode.js";
import {Nullable} from "@dexcalibur/dxc-core-api";



const DataModel = {
    package: new ModelPackage("stub"),
    class: new ModelClass(),
    field: new ModelField(),
    method: new ModelMethod(),
    funcs: new ModelFunction(),
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


export class SearchAPISelector
{
    _db:AnalyzerDatabase = null;

    constructor(pDb:AnalyzerDatabase) {
        this._db = pDb;
    }

    package(id:string):ModelPackage{
        return this._db.packages.getEntry(id)
    }

    class(id:string):ModelClass{
        return this._db.classes.getEntry(id)
    }

    method(id:string):ModelMethod{
        return this._db.methods.getEntry(id)
    }

    field(id:string):ModelField{
        return this._db.fields.getEntry(id)
    }

    syscalls(id:string):ModelSyscall{
        return this._db.syscalls.getEntry(id)
    }

    activity(id:string):AndroidActivity{
        return this._db.activities.getEntry(id)
    }

    provider(id:string):AndroidProvider{
        return this._db.providers.getEntry(id)
    }

    receiver(id:string):AndroidReceiver{
        return this._db.receivers.getEntry(id)
    }

    service(id:string):AndroidService{
        return this._db.services.getEntry(id)
    }

    permission(id:number):AndroidPermission{
        return this._db.permissions.getEntry(id)
    }

    func(id:string):ModelFunction{
        return this._db.funcs.getEntry(id);
    }

    files(id:string):ModelFile{
        return this._db.files.getEntry(id);
    }
}



export class SearchAPICallSelector
{
    _db:AnalyzerDatabase = null;
    _finder:Finder = null;

    constructor(pDb:AnalyzerDatabase, pFinder:Finder) {
        this._db = pDb;
        this._finder = pFinder;
    }


    setter(pattern:string=null):FinderResult{
        let res:FinderResult = this._finder._find(
            this._db.call, DataModel.call,
            "instr.opcode.type:"+CONST.INSTR_TYPE.SETTER, false, true);

        if(pattern !== null)
            return res.filter(pattern);
        else
            return res;
    }

    getter(pattern:string=null):FinderResult{
        let res:FinderResult = this._finder._find(
            this._db.call, DataModel.call,
            "instr.opcode.type:"+CONST.INSTR_TYPE.GETTER, false, true);

        if(pattern !== null)
            return res.filter(pattern);
        else
            return res;
    }


    /**
     * console-oriented API
     */
    print(){
        this._db.call.map((k,v) => { v.print() });
    }

    /**
     * console-oriented API
     */
    raw(){
        this._db.call.map((k,v) => { console.log("\t"+v.instr._raw) });
    }
}

interface AnalyzerUnitList {
    [name:string] :IAnalyzerUnit
}
/**
 * The SearchAPI. Allow the user to perform search into the object
 * database.
 *
 * Shoudl be replaced by MerlinSearchAPI
 *
 * @param {Object} data The database of objects
 * @constructor
 */
export class SearchAPI
{
    _queryCache:any = [];
    _caseSensitive:boolean = true;
    _finder:Finder = null;
    _db:AnalyzerDatabase = null;
    _byID:boolean = false;
    get:SearchAPISelector =  null;
    calls:SearchAPICallSelector = null;

    _analyzers:AnalyzerUnitList = {}

    constructor(pData:AnalyzerDatabase=null){

        this._queryCache = [];

        // set default case sensitivity for all search
        this._caseSensitive = true;

        if(pData != null){
            this.setDatabase(pData);
        }
    }

    /**
     * To register an external anylzer unit into finder to extend serach API
     * @param pName
     * @param pAnalyzerInstance
     */
    addAnalyzerUnit( pName:string, pAnalyzerInstance:IAnalyzerUnit){
        this._analyzers[pName] = pAnalyzerInstance;
    }

    setDatabase(pData:AnalyzerDatabase){
        this._db = pData;
        this._finder = new Finder(this._db);
        this.get = new SearchAPISelector(this._db);

        this.calls = new SearchAPICallSelector(this._db, this._finder);
    }

    getDatabase():AnalyzerDatabase {
        return this._db;
    }

    help(){
        Util.msgBox("HELP : Search API",[
            "class(<pattern>)\t\tSearch a class by any properties",
            "field(<pattern>)\t\tSearch a field by any properties",
            "method(<pattern>)\t\tSearch a method by any properties",
            "string(<pattern>)\t\tSearch a defined string by any properties",
            "call(<pattern>)\t\tSearch a call by caller/calleed/instructions properties",
            "invoke(<pattern>|<method>)\t\tSearch a call to a given method (called) by a pattern or a method object",
            "getter(<pattern>|<field>)\t\tSearch for getter of given field by a pattern or a field object",
            "setter(<pattern>|<field>)\t\tSearch for setter of given field by a pattern or a field object",
            "new(<pattern>|<class>)\t\tSearch for new instance of a given class object or class properties ",
            "array(<pattern>|<*>)\t\tSearch for static array by array properties",
            "nocase()\t\tSwitch ON/OFF the case sensitive flag of the following search"
        ]);
    };


    _oneOrMore( pIndex:IDbIndex|IDbCollection, pModel:any, pIdHolder:string, pPattern:string):FinderResult{
        if(this._byID){
            this._byID = false;
            return this._finder._findByID(pIndex, pModel, pIdHolder, pPattern);
        }else{
            return this._finder._find(pIndex, pModel, pPattern, this._caseSensitive);
        }
    }
    /**
     * Switch case sensitive On/Off of following search
     */
    nocase():SearchAPI{
        this._caseSensitive = false;
        return this;
    }

    byID():SearchAPI{
        this._byID = true;
        return this;
    }

    class(pattern:string):FinderResult{
        return this._oneOrMore(this._db.classes, DataModel.class, 'name', pattern);
    }

    package(pattern:string):FinderResult{
        return this._oneOrMore(this._db.packages, DataModel.package, 'name', pattern);
    }

    method(pattern:string):FinderResult{
        return this._oneOrMore(this._db.methods, DataModel.method, '__signature__', pattern);
        /*
        if(this._byID){
            this._byID = false;
            return this._finder._findByID(this._db.methods, DataModel.method, '__signature__', pattern);
        }else{
            return this._finder._find(this._db.methods, DataModel.method, pattern, this._caseSensitive);
        }*/
    }

    field(pattern:string):FinderResult{
        return this._oneOrMore(this._db.fields, DataModel.field, '__signature__', pattern);
        /*
        if(this._byID){
            this._byID = false;
            return this._finder._findByID(this._db.fields, DataModel.field, '__signature__', pattern);
        }else{
            return this._finder._find(this._db.fields, DataModel.field, pattern, this._caseSensitive);
        }*/
    }


    /**
     * To search files stored into DataAnalyzer DB
     *
     * @param pattern
     * @param pScope
     */
    async file(pattern:string, pScope:DataScope = null):Promise<FinderResult>{


        let fileDB:IDbCollection;

        if(!this._analyzers.hasOwnProperty('data'))
            throw  SearchEngineException.ANALYSIS_UNIT_NOT_READY('data');

        const dataAnal:DataAnalyzer = this._analyzers.data as DataAnalyzer;
        if(pScope != null){
            fileDB = (await dataAnal.getIndex(pScope));
            return this._oneOrMore(fileDB, DataModel.file, '_uid', pattern);
        }else{
            const scopes:DataScopeMap = dataAnal.scopes;
            let res:FinderResult = new FinderResult(this._finder.newResultSet(),this._finder);
            let k = 0;

            for(let i in scopes){
                if(k == 0){
                    res = this._oneOrMore(await dataAnal.getIndex(scopes[i]), DataModel.file, '_uid', pattern);
                }else{
                    res = res.union( this._oneOrMore( await dataAnal.getIndex(scopes[i]), DataModel.file, '_uid', pattern));
                }
                k++;
            }

            return res;
        }
    }

    array(pattern:string):FinderResult{
        return this._finder._find(this._db.datablock, DataModel.datablock, pattern, this._caseSensitive);
    }

    activity(pattern:string):FinderResult{
        //return this._finder._find(this._db.activities, DataModel.activity, pattern, this._caseSensitive);
        return this._oneOrMore(this._db.activities, DataModel.activity, '__id', pattern);
    }

    service(pattern:string):FinderResult{
        return this._finder._find(this._db.services, DataModel.service, pattern, this._caseSensitive);
    }

    receiver(pattern:string):FinderResult{
        return this._finder._find(this._db.receivers, DataModel.receiver, pattern, this._caseSensitive);
    }

    provider(pattern:string):FinderResult{
        return this._finder._find(this._db.providers, DataModel.provider, pattern, this._caseSensitive);
    }

    permission(pattern:string):FinderResult{
        return this._finder._find(this._db.permissions, DataModel.permission, pattern, this._caseSensitive);
    }

    call(pattern:string):FinderResult{
        return this._finder._find(this._db.call, DataModel.call, pattern, this._caseSensitive);
    }

    strings(pattern:string):FinderResult{
        return  this._finder._find(this._db.strings, DataModel.string, pattern, this._caseSensitive);
    }

    func(pattern:string):FinderResult{
        return  this._finder._find(this._db.funcs, DataModel.funcs, pattern, this._caseSensitive);
    }

    syscall(pattern:string):FinderResult{
        return this._finder._find(this._db.syscalls, DataModel.syscall, pattern, this._caseSensitive);
    }
    //this.syscall = function(pattern){ return finder._find(_db.syscalls, DataModel.syscall, pattern, this._caseSensitive); };
    /**
     * TODO
     * @param id
     */
    syscallnum(id):FinderResult{
        return this.syscall("sysnum:^"+id+"$");
    }

/*
    missing():MissingObjectAPI{
        // args = searchAPI
        return new MissingObjectAPI();
    }
*/


    /**
     *
     * TODO : update
     * To seach only method call
     * @param {*} pattern
     */
    invoke(pattern:string|ModelMethod):FinderResult{
        let res:FinderResult = this._finder._find(
            this._db.call, DataModel.call,
            "instr.opcode.instr:invoke", false, true);

        if(pattern === null)
            return res;
        if(typeof pattern === 'string' || pattern instanceof String)
            return res.filter(pattern as string);
        else if(pattern instanceof ModelMethod)
            return res.filter("calleed.__signature__:"+pattern.__signature__);
        else
            return res;
    }


    /**
     * @param {String} pattern Search pattern
     */
    setter(pattern:string=null):FinderResult{
        let res:FinderResult = null;
        if(pattern != null){
            res = this._finder._find(
                this._db.call, DataModel.call,
                "calleed."+pattern, false, true);
            res = res.filter("instr.opcode.type:"+CONST.INSTR_TYPE.SETTER);
        }
        else{
            res = this._finder._find(
                this._db.call, DataModel.call,
                "instr.opcode.type:"+CONST.INSTR_TYPE.SETTER, false, true);
        }

        return res;
    }

    /**
     *
     * @param {String} pattern Field signature
     */
    settersOf(signature:string):FinderResult{
        return this.setter("__signature__:"+signature);
    }

    /**
     * @param {String} pattern Field signature
     */
    getter(pattern:string=null):FinderResult{
        let res:FinderResult = null;
        if(pattern != null){
            res = this._finder._find(
                this._db.call, DataModel.call,
                "calleed."+pattern, false, true);
            res = res.filter("instr.opcode.type:"+CONST.INSTR_TYPE.GETTER);
        }
        else{
            res = this._finder._find(
                this._db.call, DataModel.call,
                "instr.opcode.type:"+CONST.INSTR_TYPE.GETTER, false, true);
        }

        return res;
    }


    /**
     * TODO : deprecated ?
     * @param {String} pattern Field signature
     */
    gettersOf(signature:string):FinderResult
    {
        return this._finder._find(
            this._db.call, DataModel.call,
            "instr.opcode.type:"+CONST.INSTR_TYPE.GETTER, false, true);
    }


    updateDB(data:AnalyzerDatabase){
        this._db = data;
        this._finder.updateDB(data);
    }

    /**
     *
     */
    newFinderResult():FinderResult {
        return new FinderResult(this._finder.newResultSet(),this._finder);
    }

    /**
     * To check if an object is a node reference
     *
     * @param pRef
     */
    static isNodeRef(pRef:any):boolean {
        return (pRef['__']!=null && pRef['_uid']!=null);
    }

}