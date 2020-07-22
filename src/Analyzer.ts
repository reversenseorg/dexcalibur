// global

import * as _fs_ from 'fs';
import Chalk from 'chalk';


import {SearchAPI} from "./SearchAPI";
import Event from "./Event.js";
import DexcaliburProject from "./DexcaliburProject";
import AnalyzerDatabase from "./AnalyzerDatabase";
import ModelClass from "./ModelClass";
import Util from "./Utils";
import {ModelClassReference, ModelFieldReference, ModelMethodReference} from "./ModelReference";
import ModelField from "./ModelField";
import {Modifier} from "./AccessFlags";
import ModelMethod from "./ModelMethod";
import ModelPackage from "./ModelPackage";
import SmaliParser from "./SmaliParser";
import * as Log from './Logger';
import ModelCall from "./ModelCall";
import ModelStringValue from "./ModelStringValue";
import {ModelObjectType} from "./ModelType";
import ModelBasicBlock from "./ModelBasicBlock";
import ModelInstruction from "./ModelInstruction";
import TagCategory from "./ModelTagCategory";
import ModelDataBlock from "./ModelDataBlock";
import {Method} from "got";
import {TAG} from "./AnalysisHelper";
import {IDatabase, IDbIndex} from "./ConnectorFactory";
import ModelFile from "./ModelFile";
import ModelSyscall from "./ModelSyscall";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


var STATS = {
    idxMethod: 0,
    idxClass: 0,
    idxField: 0,
    instrCtr: 0,
    methodCalls: 0,
    fieldCalls: 0
};


class Resolver
{

    static resolveInheritedField(pFieldRef:ModelFieldReference, pParentClass:ModelClass):ModelField{
        for(let i in pParentClass.fields){
            if(pParentClass.fields[i].name===pFieldRef.name){
                if(pParentClass.fields[i].tags.indexOf('missing')>-1){
                    return pParentClass.fields[i];
                }

                if((pParentClass.fields[i].modifiers & Modifier.PRIVATE) == Modifier.PRIVATE){
                    pParentClass.fields[i].declaringClass = pParentClass.fields[i].enclosingClass;
                    pParentClass.fields[i].enclosingClass = pParentClass;
                    return pParentClass.fields[i];
                }
            }
        }

        if(pParentClass.extends instanceof ModelClass){
            return Resolver.resolveInheritedField(pFieldRef, pParentClass.extends);
        }else
            return null;
    }



    static resolveInheritedMethod(pMethodRef:ModelMethodReference, pParentClass:ModelClass):ModelMethod{
        for(let i in pParentClass.methods){
            if(pParentClass.methods[i].name===pMethodRef.name){
                if(pParentClass.methods[i].tags.indexOf('missing')>-1){
                    return pParentClass.methods[i];
                }

                if(!(pParentClass.methods[i].modifiers & Modifier.PRIVATE)){
                    pParentClass.methods[i].declaringClass = pParentClass.methods[i].enclosingClass;
                    pParentClass.methods[i].enclosingClass = pParentClass;
                    return pParentClass.methods[i];
                }
            }
        }

        if(pParentClass.extends instanceof ModelClass){
            return Resolver.resolveInheritedMethod(pMethodRef, pParentClass.extends);
        }else
            return null;
    }


    /**
     *
     * @param {String} fqcn FQCN of the missing class
     * @param {AnalyzerDatabase} internalDB an instance of the internal DB
     */
     static createMissingClass(pFqcn:string, pAnalyzerDB:AnalyzerDatabase):ModelClass{

        // create a class instance from the FQCN value
        let missingCls:ModelClass = SmaliParser.class("L"+pFqcn+" ");
        let pkg:ModelPackage|string = null;

        // tag the class instance "missing"
        // a missing definition can help to identify obfuscated application
        missingCls.setupMissingTag();

        // update the internal DB[
        pAnalyzerDB.classes.setEntry(pFqcn, missingCls);
        pAnalyzerDB.missing.insert(missingCls, false);

        // update package
        pkg = missingCls.getPackage();
        if(pkg !== null && (typeof pkg === 'string')){
            pkg = pAnalyzerDB.packages.getEntry(pkg); // TODO ???
            //if(!(pkg instanceof ModelPackage)){
            if(pkg == null){
                pkg = new ModelPackage(missingCls.getPackage() as string);
                pAnalyzerDB.packages.setEntry((pkg as ModelPackage).name, pkg);
            }

            missingCls.setPackage(pkg as ModelPackage);
            (pkg as ModelPackage).childAppend(missingCls);
        }

        return missingCls;
    }

    static createMissingField(fieldReference:ModelFieldReference, enclosingClass:ModelClass,
                              internalDB:AnalyzerDatabase, modifiers:Modifier=Modifier.PUBLIC):ModelField{

        let missingField:ModelField = fieldReference.toField(enclosingClass);

        missingField.setupMissingTag();

        //missingField.enclosingClass = enclosingClass;
        missingField.modifiers = modifiers;

        enclosingClass.fields[missingField.signature()] = missingField;


        internalDB.fields.setEntry(missingField.signature(), missingField);
        // TODO : remove from 'missing' index ?
        internalDB.missing.insert(missingField, false);


        return missingField;
    }


    static createMissingMethod(methodRef:ModelMethodReference, enclosingClass:ModelClass, internalDB:AnalyzerDatabase, modifiers:Modifier):ModelMethod{
        let missingMeth:ModelMethod = methodRef.toMethod(enclosingClass);

        //console.log(enclosingClass.name,missingMeth);

        missingMeth.setupMissingTag();

        missingMeth.modifiers = modifiers; // new Accessor.AccessFlags(modifiers);

        enclosingClass.methods[missingMeth.signature()] = missingMeth;


        internalDB.methods.setEntry(missingMeth.signature(), missingMeth);
        // TODO : remove from 'missing' index ?
        internalDB.missing.insert(missingMeth, false);


        return missingMeth;
    }

    static type(pAnalyzerDB:AnalyzerDatabase, pClass:string|ModelClass):ModelClass{

        if(pClass instanceof ModelClass){
            if(pAnalyzerDB.classes.hasEntry(pClass.name)===true)
                return pAnalyzerDB.classes.getEntry(pClass.name);
            else
                return Resolver.createMissingClass(pClass.getName(), pAnalyzerDB);
            // unresolvable class are created as classic Class node but are tagged "MISSING"
        }else{
            if(pAnalyzerDB.classes.hasEntry(pClass)===true)
                return pAnalyzerDB.classes.getEntry(pClass);
            else
                return Resolver.createMissingClass(pClass, pAnalyzerDB);
            // unresolvable class are created as classic Class node but are tagged "MISSING"
        }

        // unresolvable class are created as classic Class node but are tagged "MISSING"
        // return Resolver.createMissingClass(pClass as string , pAnalyzerDB);
    }


    static field(pAnalyzerDB:AnalyzerDatabase, pFieldRef:ModelFieldReference):ModelField{

        let field:ModelField = pAnalyzerDB.fields.getEntry(pFieldRef.signature());

        if(field instanceof ModelField){
            return field;
        }

        //  if the field is not indexed, its enclosingClass is explored
        let cls=pAnalyzerDB.classes.getEntry(pFieldRef.fqcn);

        // if enclosingClass not exists, create it
        if(cls == null){
            cls = Resolver.createMissingClass(pFieldRef.fqcn, pAnalyzerDB);
            return Resolver.createMissingField( pFieldRef, cls, pAnalyzerDB);
            //field = createMissingField(field, cls, db);
        }


        field = cls.fields[pFieldRef.signature()];

        if(field instanceof ModelField){
            return field;
        }


        // 2. else, if the class has super class, search inherit field
        if(cls.extends !== null){
            field = Resolver.resolveInheritedField(pFieldRef, cls.extends);

            if(field instanceof ModelField){
                cls.addInheritedField(pFieldRef, field);
                pAnalyzerDB.fields.setEntry(pFieldRef.getName(), field);

                return field;
            }
        }

        // Finally if reference is unsolvable, the a mock field is created and tagged "missing"

        return Resolver.createMissingField( pFieldRef, cls, pAnalyzerDB);
    }

    static method(pDB:AnalyzerDatabase, pMethRef:ModelMethodReference, isStaticCall:boolean):ModelMethod{

        let meth:ModelMethod = pDB.methods.getEntry(pMethRef.signature());

        // 1. search into indexed method
        if(meth instanceof ModelMethod){
            return meth;
        }

        // 2. else, search into inherited method
        let cls:ModelClass = pDB.classes.getEntry(pMethRef.fqcn);
        let access:Modifier = Modifier.PUBLIC;

        if(isStaticCall) access |= Modifier.STATIC;

        // 2.1 If there is no parent class, then the method definition is missing
        if(cls == null){
            cls = Resolver.createMissingClass(pMethRef.fqcn, pDB);


            return Resolver.createMissingMethod(pMethRef, cls, pDB,  access);
        }

        // 2.2 else, search into inherited method
        if(cls instanceof ModelClass){
            if(cls.extends instanceof ModelClass){
                meth = Resolver.resolveInheritedMethod(pMethRef, cls.extends);

                if(meth instanceof ModelMethod){
                    cls.addInheritedMethod(pMethRef, meth);
                    pDB.methods.setEntry(pMethRef.getName(), meth);

                    return meth;
                }
            }
        }

        // 4. else, mock missing method and class

        return Resolver.createMissingMethod(pMethRef, cls, pDB,  access);
    }
}


export default class Analyzer
{
    /**
     * @type {SmaliParser}
     * @field
     */
    parser:SmaliParser = null;
    db:AnalyzerDatabase = null;
    tempDB:AnalyzerDatabase = null;
    context:DexcaliburProject = null;
    finder:SearchAPI = null;
    projectionEngines:any = {};
    encoding:BufferEncoding= null;

    /**
     *
     * @param {string} pEncoding
     * @param {SearchAPI} pSearchAPI
     * @param {DexcaliburProject} pProject
     * @constructor
     */
    constructor( pEncoding:BufferEncoding, pProject:DexcaliburProject ) {

        this.parser = new SmaliParser(pProject); //.setContext(ctx);

        // Internal DB
        this.db = new AnalyzerDatabase(pProject);

        // temporary, in memory, database
        this.tempDB = new AnalyzerDatabase(pProject, 'inmemory');

        this.context = pProject;
        this.finder = pProject.find; //pSearchAPI; // pSearchAPI
        this.encoding = pEncoding;
        this.projectionEngines = {};
    }

    /**
     * To analyze each instruction and resolve symbols
     *
     * @param {Method} method The method to analyse
     * @param {Object} data The database to use when resolving
     * @param {Object} stats The statistics counters
     * @function
     */
    static mapInstructionFrom(pMethod:ModelMethod, data:AnalyzerDatabase, stats:any){
        let bb:ModelBasicBlock = null, instruct:ModelInstruction = null, obj = null;
        let success:boolean=false, stmt=null, tmp:any=null, t:ModelBasicBlock=null;

        if((pMethod instanceof ModelMethod)===false){
            Logger.error("[!] mapping failed : method provided is not an instance of Method.");
            throw new Error("[ANALYZER] mapping failed : method provided is not an instance of Method.")
        }

        for(let i in pMethod.instr){

            bb = pMethod.instr[i];
            //bb._parent = pMethod; // TODO : removed
            // get basic blocks

            if(bb.hasCatchStatement()){
                stmt = bb.getCatchStatements();
                for(let j=0; j<stmt.length; j++){
                    if(stmt[j].getException() != null){
                        stmt[j].setException( Resolver.type(data, stmt[j].getException().name));
                    }
                    stmt[j].setTryStart( pMethod.getTryStartBlock( stmt[j].getTryStart()));
                    stmt[j].setTryEnd( pMethod.getTryEndBlock( stmt[j].getTryEnd()));

                    if((stmt[j].getTarget() instanceof ModelBasicBlock) == false){
                        t = pMethod.getCatchBlock( stmt[j].getTarget());
                        if(t !==null)
                            stmt[j].setTarget(t);
                        else{
                            Logger.error("Target catch block not found");
                            console.log( stmt[j].getTarget());
                        }
                    }
                }
            }

            for(let j in bb.stack){
                instruct = bb.stack[j];
                instruct.iline = bb.line;
                instruct._parent = bb;

                stats.instrCtr++;
                if(instruct.isNOP()) continue;

                success = false;
                if(instruct.isDoingCall()){

                    if(instruct.right.special){
                        // ignore
                        continue;
                    }

                    instruct.right = Resolver.method(data, instruct.right, instruct.isStaticCall());


                    //instruct.right._callers.push(method);
                    instruct.right.addCaller(pMethod);

                    tmp = new ModelCall({
                        caller: pMethod,
                        calleed: instruct.right, //obj,
                        instr: instruct});

                    data.call.insert(tmp, false);

                    stats.methodCalls++;


                    if(pMethod._useClass[instruct.right.fqcn] == undefined){
                        pMethod._useClass[instruct.right.fqcn] = [];
                        pMethod._useClassCtr++;
                    }
                    if(pMethod._useMethod[instruct.right.signature()] == undefined){
                        pMethod._useMethod[instruct.right.signature()] = [];
                        pMethod._useMethodCtr++;
                    }


                    pMethod._useClass[instruct.right.fqcn].push(instruct.right.enclosingClass);
                    //method._useMethod[instruct.right.signature()].push(instruct.right);
                    pMethod._useMethod[instruct.right.signature()].push({
                        bb: i,
                        instr: j
                    });

                    success = true;
                }
                else if(instruct.isCallingField()){

                    if(instruct.right == null){
                        Logger.debug("[SAST] Call : method name is null");
                    }

                    // Never returns NULL
                    // if field not exists, return MissingReference object

                    instruct.right = Resolver.field(data, instruct.right);

                    /*
                    if(instruct.opcode.type==CONST.INSTR_TYPE.GETTER){
                        console.log(instruct.right);
                    }
                    */

                    //instruct.right = obj;
                    if(instruct.right === undefined || instruct.right._callers === undefined){
                        Logger.debug("[SAST] Call : method cannot be resolved : ", instruct.toString());
                    }

                    if(instruct.isSetter()){
                        instruct.right.addSetter(pMethod);
                    }else{
                        instruct.right.addGetter(pMethod);
                    }

                    instruct.right._callers.push(pMethod);

                    data.call.insert(new ModelCall({
                        caller: pMethod,
                        calleed: instruct.right,
                        instr: instruct
                    }), false);

                    stats.fieldCalls++;

                    if(pMethod._useClass[instruct.right.fqcn] == undefined){
                        pMethod._useClass[instruct.right.fqcn] = [];
                        pMethod._useClassCtr++;
                    }
                    if(pMethod._useField[instruct.right.signature()] == undefined){
                        pMethod._useField[instruct.right.signature()] = [];
                        pMethod._useFieldCtr++;
                    }


                    pMethod._useClass[instruct.right.fqcn].push(instruct.right.enclosingClass);
                    pMethod._useField[instruct.right.signature()].push(instruct.right);


                    success = true;
                }
                else if(instruct.isUsingString()){

                    // add USAGE: NEW/READ/WRITE

                    data.strings.insert(new ModelStringValue({
                        src: pMethod,
                        instr: instruct,
                        value: instruct.right._value }), false);
                    success=true;
                }
                // Resolve Type reference
                else if(instruct.isReferencingType()){

                    // Never returns NULL
                    // if type not exists, return MissingReference object
                    if(instruct.right instanceof ModelObjectType){


                        obj = Resolver.type(data, instruct.right.name);


                        obj._callers.push(pMethod);
                        instruct.right = obj;

                        data.call.insert(new ModelCall({
                            caller:pMethod,
                            calleed:obj,
                            instr:instruct}), false);

                        if(pMethod._useClass[obj.name] == undefined)
                            pMethod._useClass[obj.name] = [];

                        //method._useClass[obj._hashcode] = obj;
                        pMethod._useClass[obj.name].push(instruct);

                    }
                    success = true;
                }
                else
                    continue;

                if(!success){
                    data.parseErrors.insert(instruct, false);
                }

            }
        }
    }


    /**
     make map by linking object :
     -> resolve FQCN
     -> resolve method called
     -> create packages
     -> build classes hierarchy
     -> create additional index in the DB
     ->  ...
     */
    static buildModel(data:AnalyzerDatabase, absoluteDB:AnalyzerDatabase){

        Logger.raw("\n[*] Start object mapping ...\n------------------------------------------");

        let step:number = data.classes.size(), /*data.classesCtr,*/ g=0;
        let overrided:any = [], o:any;
        //let updateLogs = [];



        /*
        let c = 0;
        for(let i in data.classes)c++;
        console.log(Chalk.bold.red("Classes in DB : "+c));
        */

        // STEP 1
        // merge Absolute DB and Temp DB
        // if a class has been already analyzed its data will be updated
        data.classes.map((k:string, v:ModelClass)=>{

            // add class to the absoluteDb if missing
            if(absoluteDB.classes.hasEntry(k) == false){
                absoluteDB.classes.setEntry(k, v);
            }else{
                Logger.debug("[SAST] DB merge > class overrided [ ",k," ]");
                overrided.push(k);
                //absoluteDB.classes.getEntry(k).update(v);
            }

        });


        // STEP 2
        // link class with its fields and methods
        // for(let i in data.classes)
        data.classes.map((k:string, v:ModelClass)=>{

            // make sure we manipulate freshly added class
            let cls:ModelClass = absoluteDB.classes.getEntry(k);

            //  is TRUE if classes are already existing in AbsoluteDB and they are defined also into TempDB
            let override:boolean = (overrided.indexOf(k)>-1);

            let ext:any = null, requireRemap:boolean=false;


            // the current class is already defined into AbsoluteDB,
            // so, we check if we need to update superclass of classes already existing into AbsoluteDB before mapping
            if(override){
                // the v.extends is the string not a Class instance
                // we get the reference to the superclass from the freshly added class
                ext = v.getSuperClass() as ModelClass;

                try {
                    // For a given class from TempDB, we check if the reference to the superclass
                    // from the TempDB's class is the same in AbsoluteDB's class.
                    // Else it means the TempDB's class inherit from another class which directly
                    // or indirectly inherit of the superclass f AbsoluteDB's class
                    if(ext != null && cls.hasSuperClass()){
                        if((cls.getSuperClass() instanceof ModelClass)
                            && (ext.getName() != cls.getSuperClass().getName())){
                            cls.updateSuper(Resolver.type(absoluteDB, ext));
                            requireRemap = true;
                        }

                    }
                }
                catch(ex) {
                    Logger.error(ex);
                }
            }
            // resolve super classes
            else if(cls.hasSuperClass()){

    //            if (!(cls.getSuperClass() instanceof CLASS.Class)){
                if(typeof cls.getSuperClass() === "string"){
                    cls.extends = Resolver.type(absoluteDB, cls.getSuperClass() as ModelClass);
                    //cls.updateSuper( Resolver.type(absoluteDB, cls.getSuperClass()));
                }
            }

            // map interfaces
            if(override){
                // here v.extends is the string not a Class instance
                ext = v.getInterfaces();
                if(ext.length != cls.getInterfaces().length){

                    cls.removeAllInterfaces();

                    for(let i=0; i<ext.length; i++){
                        cls.addInterface(Resolver.type(absoluteDB, ext[i]));
                        requireRemap = true;
                    }

                }
            }
            else if(cls.getInterfaces() != null){
                for(let j in cls.implements){
                    cls.implements[j] = Resolver.type(absoluteDB, cls.implements[j]);
                }
            }

            // update or create field nodes relations
            if(override){
                Logger.debug("Overriding fields ",k);

                for(let j in v.fields){
                    o=v.fields[j];
                    o.fqcn = v.getName();
                    // add relation  Field -- parent --> Class
                    o.enclosingClass = v;

                    // if the field already exists, check if both differs then update field
                    if(cls.hasField(o)){
                        // TODO : Not force override
                        cls.updateField(o, true);

                        // update db if signature differs (if type differs)

                        //absoluteDB.fields.setEntry(o.signature(), o); //hashCode()
                    }
                    // if the field not exists, create it
                    else{
                        o.fqcn = cls.getName();
                        o.enclosingClass = cls;
                        cls.addField(o);
                        // if all its ok, there is not conflict
                        absoluteDB.fields.setEntry(o.signature(), o);
                    }

                    STATS.idxField++;
                }

                // TODO :  if a field is removed from the new version, tag it has "dynamically removed"

            }else{
                for(let j in cls.fields){
                    o=cls.fields[j];

                    // broadcast FQCN from Class objects to Field objects
                    o.fqcn = cls.getName();
                    o.enclosingClass = cls;

                    // data.fields[o.hashCode()] = o;
                    absoluteDB.fields.setEntry(o.signature(), o); //hashCode()

                    STATS.idxField++;
                }
            }


            // update or create methods nodes relations
            if(override){
                Logger.debug("Overriding methods ",k);

                for(let j in v.methods){
                    o=v.methods[j];

                    // add relation  Method -- parent --> Class
                    o.enclosingClass = v;

                    // if the method already exists, check if both differs then update method
                    if(cls.hasMethod(o)){
                        // TODO : Not force override
                        cls.updateMethod(o, true);

                        // update db if signature differs (if type differs)

                        //absoluteDB.fields.setEntry(o.signature(), o); //hashCode()
                    }
                    // if the field not exists, create it
                    else{
                        o.enclosingClass = cls;
                        cls.addMethod(o);
                        // if all its ok, there is not conflict
                        absoluteDB.methods.setEntry(o.signature(), o);
                    }

                    STATS.idxMethod++;
                }
            }else{
                for(let j in cls.methods){
                    o=cls.methods[j];

                    o.enclosingClass = cls;
                    //data.methods[o.signature()] = o;
                    //absoluteDB.methods[o.signature()] = o;
                    absoluteDB.methods.setEntry(o.signature(), o);


                    STATS.idxMethod++;
                }
            }
        });

        // STEP 3
        // create packages nodes
        data.classes.map((k:string,v:ModelClass)=>{

            let pkgName:string = v.package as string;
            let scr:any = null;

            // Build Package instance from the package name (string)
            if(absoluteDB.packages.hasEntry(pkgName) == false){
                absoluteDB.packages.setEntry(pkgName,  new ModelPackage(pkgName));
            }
            // Append the current class to its Package instance
            absoluteDB.packages.getEntry(pkgName).childAppend(v);
            // Replace the package name by the reference to the package instance into the class instance
            v.package = absoluteDB.packages.getEntry(pkgName);

            // discover inherited and override methods (build Class Hierarchy)
            if(v.getSuperClass() != null){
                let n:ModelClass=v, sc:ModelClass=null, supers:ModelClass[]=[];
                while((sc = n.getSuperClass() as ModelClass) !=null){
                    if(sc instanceof ModelClass){
                        scr = absoluteDB.classes.getEntry(sc.getName());
                    }else{
                        scr = absoluteDB.classes.getEntry(sc);
                    }
                    if(scr == null){
                        if(sc instanceof ModelClass){
                            Logger.debug("Class ("+sc.getName()+") not found");
                        }
                        else{
                            Logger.debug("Reference ("+sc+") not found");
                        }
                        break;
                    }
                    supers.push(scr);
                    n = scr;

                    if(scr.getSuperClass ==undefined)
                        break;
                }
                v.setSupersList(supers);
            }
        });


        Logger.info("DB size : "+absoluteDB.classes.size());

        let off:number=0, mr:number=0;
        let t:number=0, t1:number=0;


        // STEP 4
        // console : progress "bar"
        data.classes.map((k:string,v:ModelClass)=>{
            let em, om, ovr;

            if(v instanceof ModelClass){
                // analyze each instructions
                for(let j in v.methods){
                    if(v.methods[j] instanceof ModelMethod){

                        t = (new Date()).getTime();
                        Analyzer.mapInstructionFrom(v.methods[j], absoluteDB, STATS);
                        t1 = (new Date()).getTime();
                        if(t1-t>150)
                            Logger.debug((t1-t)+" : "+v.methods[j].signature());
                    }
                }

                off++;
                if(off%200==0 || off==step)
                    Logger.info(off+"/"+step+" Classes mapped ("+k+")") ;
            }
            else{
                mr++;
                if(mr%20==0) Logger.debug(mr+" missing classes");
            }
        });



        Logger.raw("[*] "+STATS.idxMethod+" methods indexed");
        Logger.raw("[*] "+STATS.idxField+" fields indexed");
        Logger.raw("[*] "+STATS.instrCtr+" instructions indexed");
        //console.log("[*] "+absoluteDB.strings.length+" strings indexed");
        Logger.raw("[*] "+STATS.methodCalls+" method calls mapped");
        Logger.raw("[*] "+STATS.fieldCalls+" field calls mapped");
        // update place where field are called
        //return data;
    }
    /**
     * To create a new temporary database
     * @return {AnalyzerDatabase}
     * @method
     */
    newTempDb():AnalyzerDatabase{
        /*this.debug = {
            notbinded: ()=>{ return new FinderResult(db.notbinded.getAll()) },
            unmapped: ()=>{ return new FinderResult(db.unmapped.getAll()) }
        };*/
        return new AnalyzerDatabase(this.context);
    }

    /**
     *
     * @param {string} filePath
     * @param {string} filename
     * @param {boolean} force
     */
    file( pFilePath:string, pFilename:string, pForce:boolean=false):void{

        if(!pFilename.endsWith(".smali") && !pForce)
            return;

        // TODO : replace readFile + string.split by stream
        // config
        const streamParser = false;

        // TODO : test UTF8 support
        let src:string =null, rs:number =0, cls:ModelClass=null, o:any=null;
        let self:Analyzer = this;

        // parse file using blocking IO and string split
        if(streamParser){
            o = this.parser.parseStream(pFilePath, this.encoding, function( pClass:ModelClass){
                self.tempDB.classes.addEntry( pClass.name, pClass); // fqcn
                rs++;
            });
        }else{
            src=_fs_.readFileSync(pFilePath).toString(this.encoding);
            cls= this.parser.parse(src);
            self.tempDB.classes.addEntry( cls.name, cls); // cls.fqcn
        }
    }

    path(pPath:string):void{

        let self:Analyzer = this;
        let tempDb:AnalyzerDatabase = this.newTempDb();

        this.tempDB = tempDb;

        this.context.bus.send(new Event({
            name: "analyze.file.before",
            data: {
                path: pPath,
                analyzer: self
            }
        }));

        // check if the folder exists
        if(_fs_.existsSync(pPath)===false)
            throw new Error('[ANALYZER] Path not exists');

        // ut.forEachFileOf(path,this.file,".smali");
        //ut.forEachFileOf(path,this.file);
        Util.forEachFileOf(pPath,(vPath:string, vFile:string)=>{
            self.file( vPath, vFile,false);
        });

        STATS.idxClass = this.db.classes.size();

        Logger.raw("[*] Smali analyzing done.\n---------------------------------------")
        Logger.raw("[*] "+tempDb.classes.size()+" classes analyzed. ");

        // start object mapping
        // MakeMap(this.db);
        Analyzer.buildModel(tempDb, this.db);

        this.context.bus.send(new Event({
            name: "analyze.file.after",
            data: {
                path: pPath,
                analyzer: this
            }
        }));

        this.finder.updateDB(this.db);
    };

    /**
     * To get the internal database
     */
    getData():AnalyzerDatabase{
//        Logger.debug("[ERROR::DEV] Deprecated function Analyzer::getData() is called ");
        return this.db;
    }


    getContext():DexcaliburProject{
        return this.context;
    }


    /**
     * To get the absolute DB
     * @returns {AnalyzerDatabase} DB instance
     */
    getInternalDB():AnalyzerDatabase{
        return this.db;
    }

    /**
     * To add a class to the model by its FQCN
     *
     * Usefull when classes are allocated or declared at runtime
     * by using reflection technics
     *
     * @param fqcn
     */
    addClassFromFqcn(fqcn:string):ModelClass{
        let pkg:ModelPackage = null;
        let pkgn:string = fqcn.substr(0,fqcn.lastIndexOf('.'));

        if(this.db.packages.hasEntry(pkgn)==true){
            pkg = this.db.packages.getEntry(pkgn);
        }else{
            pkg = new ModelPackage(pkgn);
            //Logger.debug(pkg.toJsonObject(null).toString());
            this.db.packages.setEntry(pkgn, pkg);
        }
        //console.log(pkgn,pkg, this.db.packages.hasEntry(pkgn));
        let cls:ModelClass = new ModelClass({
            fqcn: fqcn,
            name: fqcn, // deprecated
            simpleName: fqcn.substr(fqcn.lastIndexOf('.')+1),
            package: pkg
        });

        Logger.debug('[ANALYZER] Add class from FQCN',cls.getName());
        pkg.childAppend(cls);
        this.db.classes.setEntry(fqcn, cls);

        return cls;
    }

    addTagCategory(name:string, taglist:string[]){
        this.db.tagcategories.addEntry(name, new TagCategory(name,taglist));
    }

    getTagCategories():any{
        return this.db.tagcategories.getAll();
    }


    /**
     * To initialize the list of syscalls to use
     * @param {*} syscalls
     * @function
     */
    useSyscalls(syscalls:ModelSyscall[]):void{
        //this.db.syscalls = {};
        for(let i=0; i<syscalls.length ; i++){
            for(let j=0; j<syscalls[i].sysnum.length; j++){
                if(syscalls[i].sysnum[j]>-1){
                    this.db.syscalls.addEntry(syscalls[i].sysnum[j],  syscalls[i]);
                }
            }
        }
    }

    /**
     * To analyze the decompiled class of Android.jar
     * @param {String} path Path of the folder containing .smali files
     */
    system(path:string){
        throw new Error('[ANALYZER] system() : Not implemented');

        //ut.forEachFileOf(path,this.file,".smali");
        /*
        Util.forEachFileOf(path,(path,file)=>{
            this.file(path,file,false);
        });

        STATS.idxClass = this.db.classes.size();

        Logger.raw("[*] Smali analyzing done.\n---------------------------------------")
        Logger.raw("[*] "+STATS.idxClass+" classes analyzed. ");

        // start object mapping
        Analyzer.buildModel(this.db);

        this.finder.updateDB(this.db);*/
    }

    /*
     * @deprecated
     *//*
    flattening(method){
        let instr = [], meta={};
        for(let i in method.instr){
            meta = {
                label: (method.instr[i].tag !== null)? method.instr[i].tag : null,
                line: method.instr[i].line
            }
            for(let j in method.instr[i].stack){
                instr.push(method.instr[i].stack[j]);
                if(j==0){
                    instr[instr.length-1].meta = meta;
                }
            }
        }

        return instr;
    }

    /**
     * @deprecated
     *//*
    findBasicBlocks(instr){
        let bblocks = [], blk={};

        blk = {stack:[], next:[], label:null };
        for(let i in instr){
            if(instr[i].meta !== undefined && (instr[i].meta.label !== null)){
                if(blk.stack.length > 0 && i>0){
                    blk.parent = bblocks[bblocks.length-1];
                    bblocks.push(blk);
                }

                blk = {stack:[], next:[], label:instr[i].meta.label };
                blk.stack.push(instr[i]);
            }
            else if(instr[i].opcode.type==CONST.INSTR_TYPE.IF){
                blk.stack.push(instr[i]);
                blk.parent = bblocks[bblocks.length-1];

                bblocks.push(blk);
                blk = {stack:[], next:[], label:null };
            }
            /*else if(instr[i].opcode.type==CONST.INSTR_TYPE.SWITCH){

                bblocks.push(blk);
                blk = {stack:[], next:[]};
            }*//*
            else if(instr[i].opcode.type==CONST.INSTR_TYPE.GOTO){
                //blk.node.pu
                bblocks.push(blk);
                blk = {stack:[], next:[], label:null };
            }
            /*
            else if(instr[i].opcode.flag & CONST.OPCODE_TYPE.SETS_REGISTER){
                bblocks.push(blk);
                blk = {stack:[]};
            }*//*
            else{
                blk.stack.push(instr[i]);
            }
        }

        return bblocks;
    }


    /**
     * To find a basic block by its label into a basic block list
     * @function
     * @deprecated
     *//*
    findBBbyLabel(bblocks,label){
        for(let i=0; i<bblocks.length; i++){
            bblocks[i].offset = i;
            if(bblocks[i].label !== null && bblocks[i].label==label){
                return bblocks[i];
            }
        }
        return null;
    }

    /**
     * Naive bb tree built by following only conditions and gotos (no try/catch, no switch, ...)
     * @function
     * @deprecated
     *//*
    makeTree(bblocks){
        let last = {};
        for(let i=0; i<bblocks.length; i++){
            bblocks[i].offset = i;
            if(bblocks[i].stack.length > 0){
                last = bblocks[i].stack[bblocks[i].stack.length-1];

                switch(last.opcode.type){
                    case CONST.INSTR_TYPE.IF:
                        bblocks[i].next.push({
                            jump: CONST.BRANCH.IF_TRUE,
                            block: this.findBBbyLabel(bblocks,last.right.name)
                        });
                        bblocks[i].next.push({
                            jump: CONST.BRANCH.IF_FALSE,
                            block: bblocks[i+1]
                        });
                        break;
                    case CONST.INSTR_TYPE.GOTO:
                        bblocks[i].next.push({
                            jump: CONST.BRANCH.INCONDITIONNAL_GOTO,
                            block: this.findBBbyLabel(bblocks,last.right.name)
                        });
                        break;
                    default:
                        if(bblocks[i+1] != null && bblocks[i+1].label != null){
                            bblocks[i].next.push({
                                jump: CONST.BRANCH.INCONDITIONNAL,
                                block: bblocks[i+1]
                            });
                        }
                        break;
                }
            }
        }

        return bblocks;
    }


    /**
     * Use by graph builder
     * @function
     * @deprecated
     *//*
    showBlock(blk,prefix,styleFn){

    if(blk==null) return;

    for(let i in blk.stack){
        Logger.info(prefix+styleFn("| "+blk.stack[i]._raw));
        //if()
    }
    //console.log(styleFn("-------------------------------------"));
};


    /**
     * Use by graph builder
     * @function
     * @deprecated
     *//*
    showCFG_old(bblocks, prefix=""){

    let pathTRUE = Chalk.green(prefix+"    |\n"+prefix+"    |\n"+prefix+"    |\n"+prefix+"    +-----[TRUE]-->");
    let path_len = "    +-----[TRUE]-->".length;
    let pathFALSE = Chalk.red(prefix+"    |\n"+prefix+"    |\n"+prefix+"    |\n"+prefix+"    +-----[FALSE]->");
    let pathNEXT = Chalk.yellow(prefix+"    |\n"+prefix+"    |\n"+prefix+"    |\n"+prefix+"    V");
    let mockFn = x=>x;

    for(let i=0; i<bblocks.length; i++){

        this.showBlock(bblocks[i], prefix, mockFn);

        if(bblocks[i].next.length > 1){
            prefix += " ".repeat(path_len);

            for(let j in bblocks[i].next){
                switch(bblocks[i].next[j].jump){
                    case CONST.BRANCH.IF_TRUE:
                        Logger.info(prefix+Chalk.bold.green("if TRUE :"));
                        this.showBlock(bblocks[i].next[j].block, prefix, Chalk.green);
                        break;
                    case CONST.BRANCH.IF_FALSE:
                        Logger.info(prefix+Chalk.bold.red("if FALSE :"));
                        this.showBlock(bblocks[i].next[j].block, prefix, Chalk.red);
                        break;
                }
            }
        }
        else if(bblocks[i].next.length == 1){
            Logger.info(pathNEXT);
            this.showBlock(bblocks[i].next[j].block, prefix, Chalk.white);
        }
    }
}


    /**
     * @deprecated
     *//*
    showCFG(bblocks, offset=0, prefix="", fn=null){

        if(bblocks.length==0 || bblocks[offset]==undefined){
            Logger.debug(offset+" => not block");
            return null;
        }

        let pathTRUE = Chalk.green(prefix+"    |\n"+prefix+"    |\n"+prefix+"    |\n"+prefix+"    +-----[TRUE]-->");
        let path_len = 6;"    +-----[TRUE]-->".length;
        let pathFALSE = Chalk.red(prefix+"    |\n"+prefix+"    |\n"+prefix+"    |\n"+prefix+"    +-----[FALSE]->");
        let pathNEXT = Chalk.yellow(prefix+"    |\n"+prefix+"    |\n"+prefix+"    |\n"+prefix+"    V");
        let mockFn = x=>x;


        this.showBlock(bblocks[offset], prefix, (fn==null)? mockFn : fn);


        if(bblocks[offset].next.length > 1){
            prefix += " ".repeat(path_len);

            for(let j in bblocks[offset].next){
                switch(bblocks[offset].next[j].jump){
                    case CONST.BRANCH.IF_TRUE:
                        Logger.info(prefix+Chalk.bold.green("if TRUE :"));
                        //this.showBlock(bblocks[offset].next[j], prefix, Chalk.green);
                        if(bblocks[offset].next[j].block == null){

                        }else{
                            this.showCFG(bblocks, bblocks[offset].next[j].block.offset+1, prefix, Chalk.green);
                        }
                        // this.showCFG(bblocks, bblocks[offset].next[j].offset+1, prefix);
                        break;
                    case CONST.BRANCH.IF_FALSE:
                        Logger.info(prefix+Chalk.bold.red("if FALSE :"));
                        //this.showBlock(bblocks[offset].next[j], prefix, Chalk.red);
                        this.showCFG(bblocks, offset+1, prefix, Chalk.red);
                        break;
                }
            }
        }
        else if(bblocks[offset].next.length == 1){
            this.showCFG(bblocks, offset+1, prefix, Chalk.yellow);
            //console.log(pathNEXT);
            //this.showBlock(bblocks[i].next[j].block, prefix, Chalk.white);
        }

    }

    /**
     * @deprecated
     */
    /*cfg(method){
        let instr = [], meta={}, bblocks = [], blk={};

        // list instr
        instr = this.flattening(method);


        // find basic block
        bblocks = this.findBasicBlocks(instr);

        // get tree
        bblocks = this.makeTree(bblocks);


        // show
        this.showCFG(bblocks,0);

        return bblocks;
    }*/

    /**
     * TODO
     * @param {Class} cls New class to insert into the model
     */
    updateWithClass(cls:ModelClass){

    }


    /**
     * @function
     * @deprected
     */
    _updateWithEachFileOf(filesDB:IDatabase, update_strategy:any){
        //this.db.files
        /*let idxNames:string[] = Object.keys(filesDB.getAll());


        this.db.files.map((k,v)=>{
            for(let j=0; j<filesDB.length; j++){
                update_strategy( this.db, filesDB[j], v);
            }
        });*/
    }

    /**
     * @function
     * @deprecated
     */
    updateFiles(filesDB:IDatabase, override:boolean){
        this._updateWithEachFileOf(
            filesDB,
            // check if the file can be treated
            function(db, inFile, dbFile){
                if((inFile.path == dbFile.path)||override){
                    //dbFile.update(inFile);
                }else{
                    db.files.insert(inFile);
                }
            }
        )
    }

    /**
     * @param category
     * @param inData
     */
    insertIn(category:string, inData:IDbIndex|ModelFile[]){
        if(Array.isArray(inData )){
            for(let i:number=0; i<inData.length; i++){
                this.db[category].insert(inData[i]);
            }
        }else{
            if(this.db[category] == null || this.db[category].size()==0){
                this.db[category] = inData;
            }else{
                inData.map((k:number,v:any)=>{
                    this.db[category].addEntry(v);
                })
            }
            /*
            for(let i in inData){
                this.db[category].addEntry(i, inData[i]);
            }*/
        }
    }

    static tagAsAndroidInternal( pOffset:any, pElement:any){
        pElement.addTag(TAG.Discover.Internal);
    }

    tagAllAsInternal(){
        this.db.classes.map(Analyzer.tagAsAndroidInternal);
        this.db.fields.map(Analyzer.tagAsAndroidInternal);
        this.db.methods.map(Analyzer.tagAsAndroidInternal);
        this.db.strings.map(Analyzer.tagAsAndroidInternal);
    }

    resolveMethod(ref:ModelMethodReference):ModelMethod{
        let m:ModelMethod = Resolver.method(this.db, ref, null);
        Logger.debug('[ANALYZER] Resolving method : ',m.getName());
        return m;
    }


    tagAllIf(condition:any, tag:any){
        this.tagIf(condition, "classes", tag);
        this.tagIf(condition, "fields", tag);
        this.tagIf(condition, "methods", tag);
        this.tagIf(condition, "strings", tag);
    }


    tagIf(condition:any, type:string, tag:any){
        this.db[type].map(function(k:any,v:any){
            if(condition(k,v)){
                v.addTag(tag);
            }
        });
        /*
        if(this.db[type] instanceof Array){
            this.db[type].map(function(x){
                if(condition(x)){
                    x.addTag(tag);
                }
            });
        }else{
            for(let k in this.db[type]){
                if(condition(this.db[type][k])){
                    this.db[type][k].addTag(tag);
                }
            }
        }*/
    }

    /**
     * To scan for new DataBlock and index them
     */
    updateDataBlock(){
        let dd:ModelDataBlock[]=null, dbs:string=null;

        this.db.methods.map((k:string,v:ModelMethod)=>{

            dd = v.getDataBlocks();
            for(let j=0; j<dd.length; j++){
                if(dd[j] == null) continue;
                dbs = dd[j].getUID();
                if(this.db.datablock.hasEntry(dbs) === false)
                    this.db.datablock.addEntry(dbs,dd[j]);
            }
        });
    }


}

