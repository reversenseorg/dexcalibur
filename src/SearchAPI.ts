import {Finder} from "./Finder";
import Util from "./Utils";
import AnalyzerDatabase from "./AnalyzerDatabase";
import ModelClass from "./ModelClass";
import {FinderResult} from "./FinderResult";
import ModelField from "./ModelField";
import ModelMethod from "./ModelMethod";
import ModelCall from "./ModelCall";
import ModelPackage from "./ModelPackage";
import {ModelBasicType, ModelObjectType} from "./ModelType";
import ModelStringValue from "./ModelStringValue";
import ModelSyscall from "./ModelSyscall";
import ModelConstantValue from "./ModelConstantValue";
import ModelFile from "./ModelFile";
import ModelDataBlock from "./ModelDataBlock";
import AndroidActivity from "./android/AndroidActivity";
import AndroidReceiver from "./android/AndroidReceiver";
import AndroidProvider from "./android/AndroidProvider";
import AndroidService from "./android/AndroidService";
import {AndroidPermission} from "./android/Permissions";
import {CONST} from "./CoreConst";



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
/**
 * The SearchAPI. Allow the user to perform search into the object
 * database.
 * @param {Object} data The database of objects
 * @constructor
 */
export class SearchAPI
{
    _queryCache:any = [];
    _caseSensitive:boolean = true;
    _finder:Finder = null;
    _db:AnalyzerDatabase = null;
    get:SearchAPISelector =  null;
    calls:SearchAPICallSelector = null;

    constructor(pData:AnalyzerDatabase=null){

        this._queryCache = [];

        // set default case sensitivity for all search
        this._caseSensitive = true;

        if(pData != null){
            this.setDatabase(pData);
        }
    }

    setDatabase(pData:AnalyzerDatabase){
        this._db = pData;
        this._finder = new Finder(this._db);
        this.get = new SearchAPISelector(this._db);
        this.calls = new SearchAPICallSelector(this._db, this._finder);
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

    /**
     * Switch case sensitive On/Off of following search
     */
    nocase():SearchAPI{
        this._caseSensitive = false;
        return this;
    }

    class(pattern:string):FinderResult{
        return this._finder._find(this._db.classes, DataModel.class, pattern, this._caseSensitive);
    }

    package(pattern:string):FinderResult{
        return this._finder._find(this._db.packages, DataModel.package, pattern, this._caseSensitive);
    }

    method(pattern:string):FinderResult{
        return this._finder._find(this._db.methods, DataModel.method, pattern, this._caseSensitive);
    }

    field(pattern:string):FinderResult{
        return this._finder._find(this._db.fields, DataModel.field, pattern, this._caseSensitive);
    }

    file(pattern:string):FinderResult{
        return this._finder._find(this._db.files, DataModel.file, pattern, this._caseSensitive);
    }

    array(pattern:string):FinderResult{
        return this._finder._find(this._db.datablock, DataModel.datablock, pattern, this._caseSensitive);
    }

    activity(pattern:string):FinderResult{
        return this._finder._find(this._db.activities, DataModel.activity, pattern, this._caseSensitive);
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

    string(pattern:string):FinderResult{
        return  this._finder._find(this._db.strings, DataModel.string, pattern, this._caseSensitive);
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
}