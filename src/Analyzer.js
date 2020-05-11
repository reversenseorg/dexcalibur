// global
var fs = require("fs");
var Chalk = require("chalk");

var ut = require("./Utils.js");
const CLASS = require("./CoreClass.js");
var CONST = require("./CoreConst.js");
var OPCODE = require("./Opcode.js").OPCODE;
const AnalysisHelper = require("./AnalysisHelper.js");
const MemoryDb = require("./InMemoryDb.js");
const Event = require("./Event.js").Event;
const Logger = require("./Logger.js")();
var Parser = require("./SmaliParser.js");
const Accessor = require("./AccessFlags");

var SmaliParser = new Parser();


var DataModel = {
    class: new CLASS.Class(),
    field: new CLASS.Field(),
    method: new CLASS.Method(),
    call: new CLASS.Call(),
    modifier: new Accessor.AccessFlags(), // CLASS.Modifiers(),
    objectType: new CLASS.ObjectType(),
    basicType: new CLASS.BasicType()
};

var STATS = {
    idxMethod: 0,
    idxClass: 0,
    idxField: 0,
    instrCtr: 0,
    methodCalls: 0,
    fieldCalls: 0
};

function resolveInheritedField(fieldRef, parentClass){
    for(let i in parentClass.fields){
        if(parentClass.fields[i].name===fieldRef.name){
            if(parentClass.fields[i].tags.indexOf('missing')>-1){
                return parentClass.fields[i];
            }

            if(parentClass.fields[i].modifiers.private == false){ 
                parentClass.fields[i].declaringClass = parentClass.fields[i].enclosingClass;
                parentClass.fields[i].enclosingClass = parentClass;
                return parentClass.fields[i];
            }
        }  
    }

    if(parentClass.extends instanceof CLASS.Class){
        return resolveInheritedField(fieldRef, parentClass.extends);
    }else
        return null;
}



function resolveInheritedMethod(methodRef, parentClass){
    for(let i in parentClass.methods){
        if(parentClass.methods[i].name===methodRef.name){
            if(parentClass.methods[i].tags.indexOf('missing')>-1){
                return parentClass.methods[i];
            }

            if(parentClass.methods[i].modifiers.private == false){ 
                parentClass.methods[i].declaringClass = parentClass.methods[i].enclosingClass;
                parentClass.methods[i].enclosingClass = parentClass;
                return parentClass.methods[i];
            }
        }  
    }

    if(parentClass.extends instanceof CLASS.Class){
        return resolveInheritedMethod(methodRef, parentClass.extends);
    }else
        return null;
}


/**
 * 
 * @param {String} fqcn FQCN of the missing class    
 * @param {InMemoryDB} internalDB an instance of the internal DB 
 */
function createMissingClass(fqcn,internalDB){
    // create a class instance from the FQCN value
    let missingCls = SmaliParser.class("L"+fqcn+" ");
    let pkg = null;

    // tag the class instance "missing"
    missingCls.setupMissingTag();

    // update the internal DB
    internalDB.classes.setEntry(fqcn, missingCls);
    internalDB.missing.insert(missingCls);

    // update package
    if(missingCls.getPackage() !== null){
        pkg = internalDB.packages.getEntry(pkg);
        if(!(pkg instanceof CLASS.Package)){
            pkg = new CLASS.Package(missingCls.getPackage());
            internalDB.packages.setEntry(pkg.name,pkg);
        }

        missingCls.setPackage(pkg);
        pkg.childAppend(missingCls);
    }

    return missingCls;
}

function createMissingField(fieldReference, enclosingClass, internalDB, modifiers=Accessor.PUBLIC){
    let missingField = fieldReference.toField();

    missingField.setupMissingTag();

    missingField.enclosingClass = enclosingClass;
    missingField.modifiers = new  Accessor.AccessFlags(modifiers)//CLASS.Modifiers(modifiers);

    enclosingClass.fields[missingField.signature()] = missingField;


    internalDB.fields.setEntry(missingField.signature(), missingField);
    internalDB.missing.insert(missingField);


    return missingField;
}


function createMissingMethod(methodRef, enclosingClass, internalDB, modifiers=Accessor.PUBLIC){
    let missingMeth = methodRef.toMethod();

    //console.log(enclosingClass.name,missingMeth);

    missingMeth.setupMissingTag();

    missingMeth.enclosingClass = enclosingClass;
    missingMeth.modifiers = new Accessor.AccessFlags(modifiers); //CLASS.Modifiers(modifiers);

    enclosingClass.methods[missingMeth.signature()] = missingMeth;


    internalDB.methods.setEntry(missingMeth.signature(), missingMeth);
    internalDB.missing.insert(missingMeth);


    return missingMeth;
}


var Resolver = {
    type: function(db, fqcn){

        if(fqcn instanceof CLASS.Class){ 
            if(db.classes.hasEntry(fqcn.fqcn)===true)
                return db.classes.getEntry(fqcn.fqcn);
        }else{
            if(db.classes.hasEntry(fqcn)===true)
                return db.classes.getEntry(fqcn);
        }
        
        // unresolvable class are created as classic Class node but are tagged "MISSING"
        return createMissingClass(fqcn, db);
    },
    field: function(db, fieldRef){

        let field = db.fields.getEntry(fieldRef.signature());

        if(field instanceof CLASS.Field){
           return field;
        }

        //  if the field is not indexed, its enclosingClass is explored
        let cls=db.classes.getEntry(fieldRef.fqcn);

        // if enclosingClass not exists, create it
        if(cls == null){
            cls = createMissingClass(fieldRef.fqcn, db);
            return createMissingField( fieldRef, cls, db);
            //field = createMissingField(field, cls, db);
        }

        // MissingReference type is deprecated, so this case should never been trigged
        if(cls instanceof CLASS.MissingReference){
            Logger.debug("MissingReference detected");
        }

        field = cls.fields[fieldRef.signature()];
        
        if(field instanceof CLASS.Field){
            return field;
        }


        // 2. else, if the class has super class, search inherit field
        if(cls.extends !== null){ 
            field = resolveInheritedField(fieldRef, cls.extends);
            
            if(field instanceof CLASS.Field){
                cls.addInheritedField(fieldRef, field);
                db.fields.setEntry(fieldRef, field);
                
                return field;
            }
        }

        // Finally if reference is unsolvable, the a mock field is created and tagged "missing"        

        return createMissingField( fieldRef, cls, db);
    },
    method: function(db, methRef, isStaticCall){

        let meth = db.methods.getEntry(methRef.signature());

        // 1. search into indexed method 
        if(meth instanceof CLASS.Method){
            return meth;
        }
        
        // 2. else, search into inherited method
        let cls=db.classes.getEntry(methRef.fqcn);

        let signature = methRef.signature();

        if(cls == null){
            cls = createMissingClass(methRef.fqcn, db);
            return createMissingMethod(methRef, cls, db, {
                public: true,
                static: isStaticCall
            });
        }

        // 2. else, search into inherited method
        if(cls instanceof CLASS.Class){
            if(cls.extends instanceof CLASS.Class){
                meth = resolveInheritedMethod(methRef, cls.extends);
    
                if(meth instanceof CLASS.Method){
                    cls.addInheritedMethod(methRef, meth);
                    db.methods.setEntry(methRef, meth);
                    
                    return meth;
                }
            }
        }

        // 4. else, mock missing method and class

        return createMissingMethod(methRef, cls, db,  {
            public: true,
            static: isStaticCall
        });
    }
};


/**
 * To analyze each instruction and resolve symbols
 * 
 * @param {Method} method The method to analyse 
 * @param {Object} data The database to use when resolving 
 * @param {Object} stats The statistics counters
 * @function 
 */
function mapInstructionFrom(method, data, stats){
    let bb = null, instruct = null, obj = null, x = null, success=false, stmt=null, tmp=null, t=0,t1=0;

    if(! method instanceof CLASS.Method){
        Logger.error("[!] mapping failed : method provided is not an instance of Method.");
    }

    for(let i in method.instr){

        bb = method.instr[i];
        bb._parent = method;
        // get basic blocks
        
        if(bb.hasCatchStatement()){
            stmt = bb.getCatchStatements();
            for(let j=0; j<stmt.length; j++){
                if(stmt[j].getException() != null){
                    stmt[j].setException( Resolver.type(data, stmt[j].getException().name));
                }
                stmt[j].setTryStart( method.getTryStartBlock( stmt[j].getTryStart()));
                stmt[j].setTryEnd( method.getTryEndBlock( stmt[j].getTryEnd()));

                if((stmt[j].getTarget() instanceof CLASS.BasicBlock) == false){
                    t = method.getCatchBlock( stmt[j].getTarget());
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
            instruct.line = bb.line;    
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
                instruct.right.addCaller(method);
                
                tmp = new CLASS.Call({ 
                    caller: method, 
                    calleed: instruct.right, //obj, 
                    instr: instruct});

                data.call.insert(tmp);

                stats.methodCalls++;


                if(method._useClass[instruct.right.fqcn] == undefined){
                    method._useClass[instruct.right.fqcn] = [];
                    method._useClassCtr++;
                }
                if(method._useMethod[instruct.right.signature()] == undefined){
                    method._useMethod[instruct.right.signature()] = [];
                    method._useMethodCtr++;
                }


                method._useClass[instruct.right.fqcn].push(instruct.right.enclosingClass);
                //method._useMethod[instruct.right.signature()].push(instruct.right);
                method._useMethod[instruct.right.signature()].push({
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
                    Logger.debug("[SAST] Call : method cannot be resolved : ", instruct);
                }

                if(instruct.isSetter()){
                    instruct.right.addSetter(method);
                }else{
                    instruct.right.addGetter(method);
                }
                
                instruct.right._callers.push(method);
 
                data.call.insert(new CLASS.Call({ 
                    caller: method, 
                    calleed: instruct.right, 
                    instr: instruct
                }));

                stats.fieldCalls++;
                
                if(method._useClass[instruct.right.fqcn] == undefined){
                    method._useClass[instruct.right.fqcn] = [];
                    method._useClassCtr++;
                }
                if(method._useField[instruct.right.signature()] == undefined){
                    method._useField[instruct.right.signature()] = [];
                    method._useFieldCtr++;
                }
                
                
                method._useClass[instruct.right.fqcn].push(instruct.right.enclosingClass);
                method._useField[instruct.right.signature()].push(instruct.right);


                success = true;
            }
            else if(instruct.isUsingString()){

                // add USAGE: NEW/READ/WRITE

                data.strings.insert(new CLASS.StringValue({ 
                    src: method, 
                    instr: instruct, 
                    value: instruct.right._value }));
                success=true;
            }
            // Resolve Type reference
            else if(instruct.isReferencingType()){

                // Never returns NULL
                // if type not exists, return MissingReference object
                if(instruct.right instanceof CLASS.ObjectType){

                    
                    obj = Resolver.type(data, instruct.right.name);
                    
                    
                    obj._callers.push(method); 
                    instruct.right = obj;

                    data.call.insert(new CLASS.Call({ 
                        caller:method, 
                        calleed:obj, 
                        instr:instruct}));

                    if(method._useClass[obj.name] == undefined)
                        method._useClass[obj.name] = [];

                    //method._useClass[obj._hashcode] = obj;
                    method._useClass[obj.name].push(instruct);

                }
                success = true;
            }
            else   
                continue;

            if(!success){
                data.parseErrors.insert(instruct);
            }
                
        }
    }
}


/*
 make map by linking object :
 -> resolve FQCN
 -> resolve method called
 and create additional index in the DB
 */
function MakeMap(data,absoluteDB){
    
    Logger.raw("\n[*] Start object mapping ...\n------------------------------------------");
    let step = data.classes.size(), /*data.classesCtr,*/ g=0;   
    let overrided = [];
    //let updateLogs = [];



    /*
    let c = 0;
    for(let i in data.classes)c++;
    console.log(Chalk.bold.red("Classes in DB : "+c));
    */

    // merge Absolute DB and Temp DB
    // if a class has been already analyzed its data will be updated
    data.classes.map((k,v)=>{

        // add class to the absoluteDb if missing
        if(absoluteDB.classes.hasEntry(k) == false){
            absoluteDB.classes.setEntry(k, v);
        }else{
            Logger.debug("[SAST] DB merge > class overrided [ ",k," ]");
            overrided.push(k);
            //absoluteDB.classes.getEntry(k).update(v);
        }

    });
    

    // link class with its fields and methods
    // for(let i in data.classes)
    data.classes.map((k,v)=>{

        // make sure we manipulate freshly added class
        cls = absoluteDB.classes.getEntry(k);

        //  is TRUE if classes are already existing in AbsoluteDB and they are defined also into TempDB
        let override = (overrided.indexOf(k)>-1);

        let ext = null, greater=null, smaller=null, requireRemap=false, clsSuper=null;
        

        // the current class is already defined into AbsoluteDB,
        // so, we check if we need to update superclass of classes already existing into AbsoluteDB before mapping
        if(override){ 
            // the v.extends is the string not a Class instance
            // we get the reference to the superclass from the freshly added class
            ext = v.getSuperClass();

            try {
                // For a given class from TempDB, we check if the reference to the superclass 
                // from the TempDB's class is the same in AbsoluteDB's class.
                // Else it means the TempDB's class inherit from another class which directly 
                // or indirectly inherit of the superclass f AbsoluteDB's class 
                if(ext != null && cls.hasSuperClass()){
                    if((cls.getSuperClass() instanceof CLASS.Class) 
                        && (ext!=cls.getSuperClass().getName())){                        
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
                cls.extends = Resolver.type(absoluteDB, cls.getSuperClass());
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
                o.fqcn = v.fqcn;
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
                    o.fqcn = cls.fqcn;
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
                o.fqcn = cls.fqcn;
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
    
    // create packages nodes 
    data.classes.map((k,v)=>{


        // Build Package instance from the package name (string)
        if(absoluteDB.packages.hasEntry(v.package) == false){
            absoluteDB.packages.setEntry(v.package,  new CLASS.Package(v.package));
        }
        // Append the current class to its Package instance
        absoluteDB.packages.getEntry(v.package).childAppend(v);
        // Replace the package name by the reference to the package instance into the class instance
        v.package = absoluteDB.packages.getEntry(v.package);

        // discover inherited and override methods (build Class Hierarchy)
        if(v.getSuperClass() != null){
            let n=v, sc=null, supers=[];
            while((sc = n.getSuperClass()) !=null){
                if(sc instanceof CLASS.Class){
                    scr = absoluteDB.classes.getEntry(sc.name);
                }else{
                    scr = absoluteDB.classes.getEntry(sc);
                }
                if(scr == null){
                    if(sc instanceof CLASS.Class){
                        Logger.debug("Class ("+sc.name+") not found");
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

    let off=0; mr=0;
    let t=0, t1=0;

    // console : progress "bar"
    data.classes.map((k,v)=>{
        let em, om, ovr;

        if(v instanceof CLASS.Class){
            // analyze each instructions
            for(let j in v.methods){
                if(v.methods[j] instanceof CLASS.Method){
                    //mapInstructionFrom(data.classes[i].methods[j], data, STATS);
                    t = (new Date()).getTime();
                    mapInstructionFrom(v.methods[j], absoluteDB, STATS);
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

/*
class ApplicationMap
{
    constructor(){
        this.indexes = [];
    }
}*/

class AnalyzerDatabase
{
    constructor(context){
        this.ctx = context;
        this.db = new MemoryDb.InMemoryDb(context);

        this.db.newCollection("classes");
        this.db.newCollection("fields");
        this.db.newCollection("methods");

        this.db.newIndex("call");
        this.db.newIndex("unmapped");
        this.db.newIndex("notbinded");
        this.db.newIndex("notloaded");
        this.db.newIndex("strings");
        this.db.newCollection("packages");
        this.db.newCollection("syscalls");
        this.db.newIndex("missing");
        this.db.newIndex("parseErrors");
        this.db.newIndex("files");
        this.db.newIndex("buffers");
        this.db.newCollection("datablock");
        this.db.newCollection("tagcategories");

        this.db.newCollection("activities");
        this.db.newCollection("receivers");
        this.db.newCollection("services");
        this.db.newCollection("providers");
        this.db.newIndex("permissions");


        this.classes = this.db.getIndex("classes");
        this.fields = this.db.getIndex("fields");
        this.methods = this.db.getIndex("methods");
        this.call = this.db.getIndex("call");
        this.unmapped = this.db.getIndex("unmapped");
        this.notbinded = this.db.getIndex("notbinded");
        this.notloaded = this.db.getIndex("notloaded");
        this.missing = this.db.getIndex("missing");
        this.parseErrors = this.db.getIndex("parseErrors");
        this.strings = this.db.getIndex("strings");
        this.packages = this.db.getIndex("packages");
        this.files = this.db.getIndex("files");
        this.buffers = this.db.getIndex("buffers");
        this.datablock = this.db.getIndex("datablock");
        this.tagcategories = this.db.getIndex("tagcategories");
        this.syscalls = this.db.getIndex("syscalls");

        this.activities = this.db.getIndex("activities");
        this.receivers = this.db.getIndex("receivers");
        this.services = this.db.getIndex("services");
        this.providers = this.db.getIndex("providers");
        this.permissions = this.db.getIndex("permissions");

        this.manifest = null;
    }

    getDatabase(){
        return this.db;
    }

    setManifest(manifest){
        this.manifest = manifest;
    }

    getManifest(){
        return this.manifest;
    }
}


/**
 * Represents the Application map and the entrypoint for all analysis tasks
 * 
 * @param {string} encoding The file encoding to use when the bytecode is read (default: raw)  
 * @param {Finder} finder The instance of search engine
 * @constructor
 */
function Analyzer(encoding, finder, ctx=null){
    SmaliParser.setContext(ctx);

    var db = this.db = new AnalyzerDatabase(ctx);

    let tempDb = this.tempDb = new AnalyzerDatabase(ctx); 

    this.context = ctx;
    this.finder = finder;

    this.projectionEngines = {};

    var config = {
        wsPath: null,
        encoding: encoding
    };

    this.newTempDb = function(){
        return new AnalyzerDatabase(ctx);
    }

    this.file = function(filePath, filename, force=false){


        //console.log(filePath, filename.endsWith(".smali"));

        if(!filename.endsWith(".smali") && !force)
            return;

        // TODO : replace readFile + string.split by stream

        // TODO : test UTF8 support
        let src=null, rs=0, cls=null, o=null;
        let stremParser = false;
        // parse file using blocking IO and string split
        if(stremParser){
            o = SmaliParser.parseStream(filePath, config.encoding, function( pClass){
                tempDb.classes.addEntry(pClass.fqcn, pClass);
                rs++;
            });
        }else{
            src=fs.readFileSync(filePath,config.encoding);
            cls= SmaliParser.parse(src);
            tempDb.classes.addEntry(cls.fqcn, cls);
        }

        
        // parse file using stream
        //while(rs<1);
        

        //tempDb.classes[cls.fqcn] = cls;
        //tempDb.classesCtr += 1;
        /* 
        db.classes[cls.fqcn] = cls;
        db.classesCtr+=1; */
    };

    this.debug = {
        notbinded: ()=>{ return new FinderResult(db.notbinded.getAll()) },
        unmapped: ()=>{ return new FinderResult(db.unmapped.getAll()) }
    };


    this.path = function(path){
        
        ctx.bus.send(new Event({
            name: "analyze.file.before",
            data: {
                path: path,
                analyzer: this
            }
        }));


        tempDb = this.newTempDb();

        // TODO : hcek if path exists;
        // ut.forEachFileOf(path,this.file,".smali");
        //ut.forEachFileOf(path,this.file);
        ut.forEachFileOf(path,(path,file)=>{
            this.file(path,file,false);
        });

        STATS.idxClass = this.db.classes.size();
        
        Logger.raw("[*] Smali analyzing done.\n---------------------------------------")
        Logger.raw("[*] "+tempDb.classes.size()+" classes analyzed. ");
        
        // start object mapping
        // MakeMap(this.db);
        MakeMap(tempDb, this.db);
        
        ctx.bus.send(new Event({
            name: "analyze.file.after",
            data: {
                path: path,
                analyzer: this
            }
        }));

        this.finder.updateDB(this.db);
    };

    /**
     * To get the internal database
     */
    this.getData = function(){
        Logger.debug("[ERROR::DEV] Deprecated function Analyzer::getData() is called ");
        return this._db;
    }
}

Analyzer.prototype.getContext = function(){
    return this.context;
}


/**
 * To get the absolute DB 
 * @returns {AnalyzerDatabase} DB instance
 */
Analyzer.prototype.getInternalDB = function(){
    return this.db;
}


Analyzer.prototype.addClassFromFqcn = function(fqcn){
    let pkg = null;
    let pkgn = fqcn.substr(0,fqcn.lastIndexOf('.'));
    if(this.db.packages.hasEntry(pkgn)==true){
        pkg = this.db.packages.getEntry(pkgn);
    }else{
        pkg = new CLASS.Package(pkgn);
        Logger.debug(pkg);
        this.db.packages.setEntry(pkgn, pkg);
    }
    //console.log(pkgn,pkg, this.db.packages.hasEntry(pkgn));
    var cls = new CLASS.Class({
        fqcn: fqcn,
        name: fqcn, // deprecated
        simpleName: fqcn.substr(fqcn.lastIndexOf('.')+1),
        package: pkg    
    });

    Logger.debug(cls);
    pkg.childAppend(cls);
    this.db.classes.setEntry(fqcn, cls);

    return cls;
}

Analyzer.prototype.addTagCategory = function(name, taglist){
    this.db.tagcategories.addEntry(name, new CLASS.TagCategory(name,taglist));
}

Analyzer.prototype.getTagCategories = function(){
    return this.db.tagcategories.getAll();
}


/**
 * To initialize the list of syscalls to use
 * @param {*} syscalls 
 * @function
 */
Analyzer.prototype.useSyscalls = function(syscalls){
    //this.db.syscalls = {};
    for(let i=0; i<syscalls.length ; i++){
        for(let j=0; j<syscalls[i].sysnum.length; j++){
            if(syscalls[i].sysnum[j]>-1){
                this.db.syscalls.addEntry(syscalls[i].sysnum[j],  syscalls[i]);
            }
        }
    }
};

/**
 * To analyze the decompiled class of Android.jar
 * @param {String} path Path of the folder containing .smali files
 */
Analyzer.prototype.system = function(path){
    // TODO : hcek if path exists;
    //ut.forEachFileOf(path,this.file,".smali");
    ut.forEachFileOf(path,(path,file)=>{
        this.file(path,file,false);
    });

    STATS.idxClass = this.db.classes.size();
    
    Logger.raw("[*] Smali analyzing done.\n---------------------------------------")
    Logger.raw("[*] "+STATS.idxClass+" classes analyzed. ");
    
    // start object mapping
    MakeMap(this.db);

    this.finder.updateDB(this.db);

}

/**
 * @deprecated
 */
Analyzer.prototype.flattening = function(method){
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
 * @deprected
 */
Analyzer.prototype.findBasicBlocks = function(instr){
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
        }*/
        else if(instr[i].opcode.type==CONST.INSTR_TYPE.GOTO){
            //blk.node.pu
            bblocks.push(blk);
            blk = {stack:[], next:[], label:null };
        }
        /*
        else if(instr[i].opcode.flag & CONST.OPCODE_TYPE.SETS_REGISTER){
            bblocks.push(blk);
            blk = {stack:[]};
        }*/
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
 */
Analyzer.prototype.findBBbyLabel = function(bblocks,label){
    for(let i=0; i<bblocks.length; i++){
        bblocks[i].offset = i;
        if(bblocks[i].label !== null && bblocks[i].label==label){
            return bblocks[i];
        }
    }
    return null;
};

/**
 * Naive bb tree build by following only conditions and gotos (no try/catch, no switch, ...)
 * @function
 * @deprecated
 */
Analyzer.prototype.makeTree = function(bblocks){
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
 */
Analyzer.prototype.showBlock = function(blk,prefix,styleFn){
    
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
 */
Analyzer.prototype.showCFG_old = function(bblocks, prefix=""){

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
 */
Analyzer.prototype.showCFG = function(bblocks, offset=0, prefix="", fn=null){

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
Analyzer.prototype.cfg = function(method){
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
}

/**
 * TODO
 * @param {Class} cls New class to insert into the model 
 */
Analyzer.prototype.updateWithClass = function(cls){
    
};


/**
 * @function
 * @deprected
 */
Analyzer.prototype._updateWithEachFileOf = function(filesDB, update_strategy){
    //this.db.files 
    this.db.files.map((k,v)=>{
        for(let j=0; j<filesDB.length; j++){
            update_strategy( this.db, filesDB[j], v);
        }
    });
};

/**
 * @function
 * @deprecated
 */
Analyzer.prototype.updateFiles = function(filesDB, override){
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
};

Analyzer.prototype.insertIn = function(category, inData){
    if(inData instanceof Array){
        for(let i=0; i<inData.length; i++){
            this.db[category].insert(inData[i]);
        }
    }else{
        for(let i in inData){
            this.db[category].addEntry(i, inData[i]);
        }
    }
}

function tagAsAndroidInternal( pOffset, pElement){
    pElement.addTag(AnalysisHelper.TAG.Discover.Internal);
}

Analyzer.prototype.tagAllAsInternal = function(){
    this.db.classes.map(tagAsAndroidInternal);
    this.db.fields.map(tagAsAndroidInternal);
    this.db.methods.map(tagAsAndroidInternal);
    this.db.strings.map(tagAsAndroidInternal);
}

Analyzer.prototype.resolveMethod = function(ref){
    let m = Resolver.method(this.db, ref);
    Logger.debug(m);
    return m;
}


Analyzer.prototype.tagAllIf = function(condition, tag){
    this.tagIf(condition, "classes", tag);
    this.tagIf(condition, "fields", tag);
    this.tagIf(condition, "methods", tag);
    this.tagIf(condition, "strings", tag);
}


Analyzer.prototype.tagIf = function(condition, type, tag){
    this.db[type].map(function(k,v){
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
Analyzer.prototype.updateDataBlock = function(){
    let dd=null, dbs=null;

    this.db.methods.map((k,v)=>{

        dd = v.getDataBlocks();
        for(let j=0; j<dd.length; j++){
            if(dd[j] == null) continue;
            dbs = dd[j].getUID();
            if(this.db.datablock.hasEntry(dbs) === false)
                this.db.datablock.addEntry(dbs,dd[j]);
        }
    });
    /*
    for(let i in this.db.methods){
        dd = this.db.methods[i].getDataBlocks();
        for(let j=0; j<dd.length; j++){
            if(dd[j] == null) continue;
            dbs = dd[j].getUID();
            if(this.db.datablock[dbs] == null)
                this.db.datablock[dbs] = dd[j];
        }
    }*/
}




module.exports = Analyzer;
