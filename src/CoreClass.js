//var Disassembler = require("./Disassembler.js");
var CONST = require("./CoreConst.js");
const NodeCompare = require("./NodeCompare.js");
//var VM = require("./vm.js");
var Disassembler = null;

/**
 * Constant values describing a stub type. 
 */
var STUB_TYPE={
    METHOD: 0x1,
    FIELD: 0x2,
    ANNOTATION: 0x3,
    INSTR: 0x4,
    MISSING: 0x5,
    CLASS: 0x6,
    OBJ_TYPE: 0x7,
    BASIC_TYPE: 0x8,
    VALUE_CONST: 0x9,
    STRING_VALUE: 0xa,
    CIRCULAR: 0xb,
    VARIABLE: 0xc,
    CALL: 0xd,
    NATIVE_FUNC: 0xe,
    SYSCALL: 0xf
};

var BUILTIN_TAG = {
    INTERNAL: "int",
    DYNAMIC: "dyn"
};

/**
 * Constant values dscribin a class of hookable function
 */
var FUNC_TYPE = {
    // A syscall function or SVC
    SYSCALL: 0x1,
    // Exported fucntion from a native library
    NATIVE_EXPORT: 0x2,
    // Imported function from a native library
    NATIVE_IMPORT: 0x3,
    // A Java function from a 3th party library
    JAVA_LIB: 0x4
};



function Stub(type,data,exclude){
    this.__type__ = type;

    for(let i in data){
        if(exclude.indexOf(i)==-1)
            this[i]=data[i]
    };

    return this;
}


Savable ={
    export: function(exclude){
        return new Stub(
            this.__stub_type__,
            this,
            exclude
        )
    },
    import: function(stub){
       for(let i in stub) this[i] = stub[i];

       return this;
    }
};

/**
 * Encapsulate metadata
 * @param {Object} cfg 
 */
function Metadata(cfg){
    this.alias = (cfg.alias!=null? cfg.alias : null);
    this.comment = (cfg.comment!=null? cfg.comment : null);
    this.tags = [];

    return this;
}
Metadata.prototype.setAlias = function(name){
    this.alias = name;
}
Metadata.prototype.getAlias = function(){
    return this.alias;
}

Metadata.prototype.setComment = function(value){
    this.comment = value;
}
Metadata.prototype.getComment = function(){
    return this.comment;
}

Metadata.prototype.addTag = function(name){
    if(this.tags.indexOf(name)==-1) this.tags.push(name);
}
Metadata.prototype.removeTag = function(){
    let i = -1;
    if((i=this.tags.indexOf(name))>-1){
        this.tags[i] = null;
    } 
}
Metadata.prototype.getTags = function(){
    return this.tags;
}



/**
 * TO DO
 */
function ByteArray(){
    this.length = null;
    this.osize = null;
    this.value = [];
}
ByteArray.prototype.toString = function(){

};

/**
 * A cross reference to a subject
 * @param {*} obj Subject object 
 * @param {*} xref Reference to the subject object. 
 */
function XRef(obj,xref){
    this.subject = obj;
    this.xref = xref;
    this.noref = (xref.length == 0);

    return this;
}

/**
 * To represent a primitive type 
 * @param {string} raw_type - The raw name of the type as it can be found in Smali code
 * @param {boolean} isArray - Array flag should be TRUE if the type is an array, else FALSE 
 * @constructor
 */
function BasicType(raw_type, isArray=false){
    
    this.$ = STUB_TYPE.BASIC_TYPE;
    
    this.name = CONST.TYPES[raw_type];
    this.arr = isArray;
    this._name = (CONST.WORDS[raw_type]!=undefined)? CONST.WORDS[raw_type] : "???";
    this._hashcode = raw_type;

//    this.tags = [];

    this.hashCode = ()=>{
        return this._hashcode;
    };

    this.sprint = function(){
        return "<"+this._name+">"+(this.arr?"[]":"");
    };

    return this;
}
BasicType.prototype.import = Savable.import;
BasicType.prototype.export = Savable.export;

/**
 * To check if the current type is Void
 * @returns {boolean} - Returns TRUE if the type is Void, else FALSE
 */
BasicType.prototype.isVoid = function(){
    return this.name == CONST.TYPES.V;
}

/**
 * To check if the current type is numeric (integer, long or short)
 * @returns {boolean} - Returns TRUE if the type is integer or long or short, else FALSE
 */
BasicType.prototype.isNumeric = function(){
    return [CONST.TYPES.S, CONST.TYPES.I, CONST.TYPES.J].indexOf(this.name)>-1;
    // return [CONST.TYPES.S, CONST.TYPES.I, CONST.TYPES.J].indexOf(this._hashcode)>-1;
}

/**
 * To check if the current type is an array
 * @returns {boolean} - Returns TRUE if the type is an array, else FALSE
 */
BasicType.prototype.isArray = function(){
    return this.arr;
}

/**
 * To make the signature of the current type instance
 * It has one of these forms :
 *      - "<I>" if the current type is an Integer
 *      - "<I>[]"  if the current type is an array of Integer
 * 
 * @returns {string} - Returns the signature of the type
 */
BasicType.prototype.signature = function(){
    return "<"+this._name+">"+(this.arr?"[]":"");
};

/**
 * To make an instance of Object which not contain circular reference
 * and which are ready to be serialized.
 * @returns {Object} - Returns an Object instance representing the type
 */
BasicType.prototype.toJsonObject = function(){
    let obj = new Object();
    obj.name = this._name;
    obj.arr = this.arr;
    obj.primitive = true;
    return obj;
};


/**
 * Represents a type for a given class.
 * @param {string} cls - The class name  
 * @param {boolean} isArray - The array flag
 * @constructor
 */
function ObjectType(cls, isArray=false){

    this.$ = STUB_TYPE.OBJ_TYPE;

    this.name = cls;
    this.arr = isArray;
    this._name = cls;
    this._hashcode = cls;
    this.tags = [];

    this.hashCode = ()=>{
        return this._hashcode;
    };

    this.sprint = function(){
        return "<"+this._name+">"+(this.arr?"[]":"");
    };

    return this;
}
ObjectType.prototype.import = Savable.import;
ObjectType.prototype.export = Savable.export;

/**
 * To check if the current type is a Java String 
 * @returns {boolean} - Returns TRUE if the type is a Java String, else FALSE
 */
ObjectType.prototype.isString = function(){
    return this.name == "java.lang.String";
}

/**
 * To make the signature of the current type instance
 * It has one of these forms :
 *      - "<I>" if the current type is an Integer
 *      - "<I>[]"  if the current type is an array of Integer
 * 
 * @returns {string} - Returns the signature of the type
 */
ObjectType.prototype.signature = function(){
    return "<"+this.name+">"+(this.arr?"[]":"");
};

/**
 * To make an instance of Object which not contain circular reference
 * and which are ready to be serialized.
 * @returns {Object} - Returns an Object instance representing the type
 */
ObjectType.prototype.toJsonObject = function(){
    let obj = new Object();
    obj.name = this.name;
    obj.arr = this.arr;
    obj.primitive = false;
    return obj;
};

ObjectType.prototype.addTag = function(tag){
    this.tags.push(tag);  
}
ObjectType.prototype.hasTag = function(tagName){
    return this.tags.indexOf(tagName)>-1;  
}
ObjectType.prototype.getTags = function(){
    return this.tags;   
}


/**
 * Represents a package from the application
 * @param {string} name The name of the package
 * @constructor
 */
function Package(name){
    this.name = name;
    this.meta = null;
    this.children = [];
    this.tags = [];

}

/**
 * 
 * @param {Metadata|Object} obj The metadata
 */
Package.prototype.setMetadata = function(obj){
    if(obj instanceof Metadata){
        this.meta = obj;
    }else if(typeof obj == 'object'){
        this.meta = new Metadata(obj);
    }else{
        console.log("Error : invalid Metadata type");   
    }
    return this;
}


/**
 * To append a child - class or package - to the current package
 * @param {Class|Package} obj The new child
 */
Package.prototype.childAppend = function(obj){
    this.children.push(obj);
    return this;
}
/**
 * To count children
 */
Package.prototype.getSize = function(){
    return this.children.length;
}
Package.prototype.getAbsoluteSize = function(obj){
    let absz = 0;
    for(let i in this.children){
        if(this.children[i] instanceof Class)
            absz++;
        else if(this.children[i] instanceof Package)
            absz += this.children[i].getAbsoluteSize();
    }
    return absz;
}
Package.prototype.toJsonObject = function(fields){
    let o=new Object();
    if(fields !== null){
        for(let i in fields){
            if(typeof this[fields[i]] == "object"){
                o[fields[i]] = this[fields[i]].toJsonObject();
            }else{
                o[fields[i]] = this[fields[i]];
            }
        }
    }else{
        o.name = this.name;
        o.children = [];
        for(let i in this.children){
            o.children.push(this.children[i].toJsonObject());
        }
        o.tags = this.tags;
    }
    o.absolute_size = this.getAbsoluteSize();
    o.size = this.getSize();
    return o;
}

Package.prototype.addTag = function(tag){
    this.tags.push(tag);  
}
Package.prototype.hasTag = function(tagName){
    return this.tags.indexOf(tagName)>-1; 
}
Package.prototype.getTags = function(){
    return this.tags;   
}


class SerializedObject
{
    static refs = {}; 

    constructor(obj=null){
        this.__type = null;
        //this.__format = obj.__format;
        this.__raw = null;

        if(obj!==null){
            for(let i in obj){
                this[i] = obj[i];
            }
        }
    }

    static init(supported_class){
        SerializedObject.refs = supported_class;
    }

    static isSerializable(obj){
        return (obj.serialize !=null) && (typeof obj.serialize==='function');
    }
    static isUnserializable(obj){
        return (obj.__type!=null) 
            && (obj.__raw!=null) 
            && (SerializedObject.refs[obj.__type]!==null);
    }

    static from(obj,type){
        let o = new SerializedObject();

        o.__type = type;
        o.__raw = obj;

        return o;
    }

    unserialize(){
        return SerializedObject
                .refs[this.__type]
                .unserialize(this.__raw);
    }    

}


class File
{
    constructor(config={}){
        this.name = (config.name!=null? config.name : null);
        this.path = (config.path!=null? config.path : null);
        this.remotePath = (config.remotePath!=null? config.remotePath : null);
        this.checksum = (config.checksum!=null? config.checksum : null);
    }

    getPath(){
        return this.path;
    }

    getRemotePath(){
        return this.remotePath;
    }


    equals(file){
        // TODO checksum
    }

    toJsonObjec(){
        let o=new Object();
        for(let i in this)
            o[i] = this[i];

        return o;
    }

    // ======

    isSerializable(){
        return true;
    }

    serialize(){

        return SerializedObject.from(this,"File");
    }

    static unserialize(obj){
        return new File(obj);
    }
}
/**
 * Represent a Class object :
 *  - Created by the parser and the ClassLoader's hook
 *  - Updated by the reference solver and the ClassLoader's hook
 * @param {object} config Optional, a hashmap with param/value to initiliaze   
 * @constructor
 */
function Class(config){
    // corresponding stub type to use during export
    this.__stub_type__ = STUB_TYPE.CLASS;
    this.$ = STUB_TYPE.CLASS;

    //this.fqcn = null;
    // the FQCN of the class
    this.name = null;

    // An alias
    this.alias = null;
    
    this.meta = null;

    // the Simple name of the class (the last part of the FQCN)
    this.simpleName = null;

    // the FQDN of the package
    // the package 
    this.package = null;

    // the name of the source file contained into the .source instruction
    this.source = null;

    // a list of modifiers of the class (public/private/protected/static/final/...)
    this.modifiers = null;

    // a list of references to the implemented interfaces
    this.implements = [];

    // a list of references to the extended classes
    this.extends = null;
    this.supers = null;

    // a list of references to the appied annotations 
    this.annotations = [];
    
    // a list of the declared method
    this.methods = {};
    this.inherit = {};

    // the count of methods inside the class
    this._methCount = 0;

    // a list of the declared fields
    this.fields = {};

    // the count of declared fields
    this._fieldCount = 0;

    // an hashmap of the inner classes, the key is the FQCN of the subject 
    this.innerClass = {};

    this.tags = [];

    /*
     if the current object is enclosed into another class, a reference to
     the enclosing class is stored here
    */
    this.enclosingClass = null;

    // private : a list of the methods containing instructions which use this class
    this._callers = [];

    // private : the unique identifier of this object in the graph
    this._hashcode = null;

    // private : TRUE if this class is binded by the OS or the VM.
    this._isBinding = null;

    this.__pretty_signature__ = null;
    this.__aliasedCallSignature__ = null;


    this.hashCode = function(){
        return this.name;
    };
    
 
    

    this.help = function(){
        let t="+-------------------- HELP --------------------+";
        t="\n[-- Methods : ]";
        t += "\n\t.dump()\tShow the class information (field, methods, modifiers, parents, etc...)";
        t += "\n\t.hasField(<string>)\tCheck if the class define the given field";
        t += "\n\t.hasMethod(<string>)\tCheck if the class define the given method";
        t += "\n\t.help()\tThis help";
        t="\n[-- Properties : ]";
        t += "\n\t.instr:<Instruction>\tGet the instruction"; 
        t += "\n\t.caller:<Method>\tGet the method performing the call"; 
        t += "\n\t.calleed:<*>\tGet the reference to the calleed";
        t += "\n";

        console.log(t);
    }

    if(config!==undefined)
        for(let i in config)
            this[i]=config[i];
    

    return this;
}
/**
 * To check if a field is defined whith the given name
 * @param {String} name The name of a field
 * @returns {Boolean} TRUE if the class contains a definition, else FALSE
 */
Class.prototype.hasField = function(name){
    return (this.fields[name]!==undefined);
};

Class.prototype.addField = function(field){
    this.fields[field.signature()] = field;
}

Class.prototype.updateField = function(field, override=false){
    let diff = this.fields[field.signature()].compare(field);
    // if not identic => update, else nothiong to do
    if(!diff.isIdentic()){
        if(override)
            this.fields[field.signature()] = field;
    }
}


/**
 * To check if a method is defined whith the given hashcode
 * @param {String} hash The hashcode of the method
 * @returns {Boolean} TRUE if the class contains a definition, else FALSE
 */
Class.prototype.hasMethod = function(hash){
    return this.methods[hash]!==undefined;
};


Class.prototype.addMethod = function(meth){
    this.methods[meth.signature()] = meth;
}

Class.prototype.updateMethod = function(meth, override=false){
    let diff = this.methods[meth.signature()].compare(meth);
    // if not identic => update, else nothiong to do
    if(!diff.isIdentic()){
        if(override)
            this.methods[meth.signature()] = meth; 
    }
}


Class.prototype.hasSuperClass = function(){
    return (this.extends != null);
}

Class.prototype.getSuperClass = function(){
    return this.extends;
}

Class.prototype.getSuperList = function(){
    return this.supers;
}

Class.prototype.setSupersList = function(superList){
    this.supers = superList;
}

Class.prototype.signature = function(){
    return this.name;
};

Class.prototype.aliasedSignature = function(){
    return this.alias;
};

 Class.prototype.prettySignature = function(override=false){
        if(!override && this.__pretty_signature__ != null){
            return this.__pretty_signature__;
        }
        this.__pretty_signature__ = this.signatureFactory("__alias_signature__","alias");
        return this.__pretty_signature__;
    }

// this.signatureFactory("__signature__","name")
// this.signatureFactory("__alias_signature__","alias")
Class.prototype.signatureFactory = function(ppt, seed){
    if(this[ppt] !== null) return this[ppt];

    this[ppt] = this[seed];

    return hash;
};

Class.prototype.getAlias = function(){
    return this.alias;
}
Class.prototype.setAlias = function(name){
    this.alias = name;
}

Class.prototype.dump = function(){
    if(this.extends!=null) 
        console.log("Class ["+this.name+"] extends ["+this.extends+"]");
    else
        console.log("Class ["+this.name+"]");
    
    if(this.source!=null)
        console.log("Source : "+this.source);

    console.log("--------------------------------------\nFields :");
    for(let k in this.fields){
        console.log( this.fields[k].sprint());
    }
    console.log("--------------------------------------\nMethods :");
    for(let k in this.methods){
        console.log( this.methods[k].sprint());
    }
}

Class.prototype.raw_import = Savable.import;
Class.prototype.import = function(obj){
    // raw impport
    this.raw_import(obj);
    // construct obj
    this.modifiers = (new Modifiers()).import(obj.modifiers);
};

Class.prototype.export = Savable.export;

Class.prototype.hasOverrideOf = function(meth){
    if(meth == null) return null;

    let cs = meth.callSignature();
    for(let k in this.methods){
        if(this.methods[k].callSignature()==cs){
            return this.methods[k];
        }
    }
    return null;
}


/**
 * To add inherited method which are not overrided 
 */
Class.prototype.addInheritedMethod = function(methodRef,parentMethod){
    this.methods[methodRef] = parentMethod;
    this.inherit[methodRef] = parentMethod;
    return this.methods[methodRef];
}

Class.prototype.addInheritedField = function(localReference, parentField){
    this.fields[localReference] = parentField;
    this.inherit[localReference] = parentField;
    return this.fields[localReference];
}


Class.prototype.toJsonObject = function(filter){
    let obj = new Object(), m=null;
    for(let i in this){
        if(["_","$"].indexOf(i[0])==-1 
            && (typeof this[i] != 'array')
            && (typeof this[i] != 'object')){

            obj[i] = this[i];
        }
        else if(i == "supers"){
            obj.supers = [];
            if(this.supers instanceof Array)
                for(let k=0; k<this.supers.length; k++){
                    if(this.supers[k] instanceof Class)
                        obj.supers.push({ 
                            name:this.supers[k].signature(),
                            alias: this.supers[k].getAlias()
                        }); // call signature
                }
        }
        else if(i == "methods"){
            obj.methods = [];
            for(let k in this.methods){
                m = this.methods[k].toJsonObject(["__signature__","__aliasedCallSignature__","__callSignature__","probing","modifiers","alias","name","tags"]);
                if(this.inherit[k] != null) m.__inherit = true;
                obj.methods.push(m); // call signature
            }
        }
        else if(i == "fields"){
            obj.fields = [];
            for(let k in this.fields){
                m = this.fields[k].toJsonObject(["__signature__","__aliasedSignature__","alias","name","tags"]);
                if(this.inherit[k] != null) m.__inherit = true;
                obj.fields.push(m);
            }
        }
        else if(i == "package"){
            obj.package = this.package.toJsonObject(["name"]);
        }
        else if(i == "tags"){
            obj.tags = this.tags;
        }
        else if(i == "extends"){
            //obj.extends = (this.extends!=null? this.extends.toJsonObject(["__signature__"]): null);
            obj.extends = (this.extends!=null? this.extends.name : null);
            //obj.extends = (this.extends!=null? { name: this.extends.name, alias:this.extends.alias } : null);
        }
        else if(i == "implements"){
            if(this.implements.length > 0){
                obj.implements = [];

                for(let x=0; x<this.implements.length; x++){
                    obj.implements.push(this.implements[x].name);
                }
            }
        }
    }   
    return obj;
};


/**
 * To find a class's method by usins a search pattern
 * @param {String} fqcn A raw Full-Qualified Class Name 
 */
Class.prototype.initFromFQCN = function(fqcn){
    this.name = fqcn;
    this.simpleName = fqcn.substr(fqcn.lastIndexOf("$"));
    this.fqcn = fqcn;
    return this;
}

/**
 * To set the class package
 * @param {Package} pkg The package containing this class
 */
Class.prototype.setPackage = function(pkg){
    this.package = pkg;
    return this;
}

/**
 * To get the class package
 */
Class.prototype.getPackage = function(){
    return this.package;
}

/**
 * To find a class's method by usins a search pattern
 * @param {String} pattern 
 */
Class.prototype.getMethod = function(pattern){
    let res0 = [], res1=[], rx={}, match=null;
    for(let i in pattern){
        rx[i] = new RegExp(pattern[i]);
    }
    res1 = this.methods;
    for(let i in pattern){
        res0 = res1;
        res1 = [];
        for(let meth in res0){
            match = rx[i].exec(res0[meth][i]);
            if(match !== null) res1.push(res0[meth]);
        }
    }
    return res1;
};

/**
 * To find a class's field by usins a search pattern
 * @param {String} pattern 
 */
Class.prototype.getField = function(pattern){
    let res0 = [], res1=[], rx={}, match=null;
    for(let i in pattern){
        rx[i] = new RegExp(pattern[i]);
    }
    res1 = this.fields;
    for(let i in pattern){
        res0 = res1;
        res1 = [];
        for(let meth in res0){
            match = rx[i].exec(res0[meth][i]);
            if(match !== null) res1.push(res0[meth]);
        }
    }
    return res1;
}


Class.prototype.setupMissingTag = function(){
    return (this.tags.push(CONST.TAG.MISSING)); 
}
Class.prototype.removeMissingTag = function(){
    if(this.tags.length==1) 
        this.tags = [];
    else{
        let i = this.tags.indexOf(CONST.TAG.MISSING);
        let arr = this.tags.slice(0,i);
        if(i+1<this.tags.length){
            arr = arr.concat(this.tags.slice(i+1,this.tags.length-i-1));
        }
        this.tags = arr;
    }
}
Class.prototype.isMissingClass = function(){
   return (this.tags.indexOf(CONST.TAG.MISSING)>-1); 
}

Class.prototype.addTag = function(tag){
    this.tags.push(tag);   
}
Class.prototype.hasTag = function(tagName){
    return this.tags.indexOf(tagName)>-1; 
}
Class.prototype.getTags = function(){
    return this.tags;   
}

/**
 * To get the implement interface 
 */
Class.prototype.getInterfaces = function(){
    return this.implements;
}

Class.prototype.removeAllInterfaces = function(){
    this.implements = [];
}

Class.prototype.addInterface = function(inf){
    this.implements.push(inf);
}

Class.prototype.updateSuper = function(cls){
    if(cls.getSuperClass().name != this.getSuperClass().name){
        // TODO : create NodeChange
        this.extends = cls;
    }
}

/**
 * Represents a file containing a set of functions (like a shared object)
 * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance 
 * @constructor
 */
function Library(config){
    this.name = false;
    this.localPath = null;
    this.remotePath = null;
    //this.package = null;
    this.isCiphered = false;
    this.isNative = false;
    this.functions = [];

    for(let i in config) this[i]=config[i];
    return this;
}
Library.prototype.addFunc = function(fn){
    this.functions.push(fn);
    return this;
}
Library.prototype.toJsonObject = function(){
    let o =new Object();
    o.name = this.name;
    o.localPath = this.localPath;
    o.remotePath = this.remotePath;
    o.isCiphered = this.isCiphered;
    //o.package = (this.package!=null)? this.package.toJsonObject() : null;
    o.isNative = this.isNative;
    o.functions = [];
    for(let i in this.functions){
        o.functions.push(this.functions[i].toJsonObject());
    }
    return o;
}

/**
 * Represents a Syscall
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance 
 * @constructor 
 */
function Syscall(config){
    this.sysnum = []; 
    this.func_name = null;
    this.sys_name = null;
    this.args = [];
    this.ret = null;

    for(let i in config) this[i]=config[i];
    return this;
}
Syscall.prototype.toJsonObject = function(){
    let o = new Object();
    for(let i  in this) o[i] = this[i];
    o.sysnum = this.sysnum.join(","); 
    o.args = this.args.join(",");
    return o;
}

//Object.setPrototypeOf(Class.prototype,Savable);
/**
 * Represents any kind of native function :
 *      - imported/exported functions 
 *      - internal functions
 *      - syscall functions
 * @param {Object} cfg
 * @constructor 
 */
function NativeFunction(cfg){
    this.type = null; 
    this.sysnum = []; 
    this.library = null;
    this.name = null;
    this.args = [];
    this.ret = null;

    for(let i in cfg) this[i]=cfg[i];
    return this;
}

NativeFunction.prototype.toJsonObject = function(){
    let o = new Object();
}

// TDB
/**
 * Represents a call to a method, a field or a class
 * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance 
 * @constructor
 */
function Call(cfg){

    this.$ = STUB_TYPE.CALL;

    this.instr = null;
    this.caller = null;
    this.calleed = null;

    this.line = null;
    this.type = null;
    this.object = null;
    this.subject = null;

    this.tags = [];

    if(cfg !== undefined)
        for(let i in cfg) this[i] = cfg[i];

    this.print = function(){
        console.log("\t"+this.caller.hashCode()+" [:line"+this.instr.line+"] > \n\t\t"
                        +this.instr.opcode.instr+" "
                        +this.calleed.hashCode());
    };

    this.help = function(){
        let t="+-------------------- HELP --------------------+";
        t="\n[-- Methods : ]";
        t += "\n\t.print()\tPrint the call data";
        t += "\n\t.help()\tThis help";
        t="\n[-- Properties : ]";
        t += "\n\t.instr:<Instruction>\tGet the instruction"; 
        t += "\n\t.caller:<Method>\tGet the method performing the call"; 
        t += "\n\t.calleed:<*>\tGet the reference to the calleed";
        t += "\n";

        console.log(t);
    }

    return this;
}
Call.prototype.import = Savable.import;
Call.prototype.export = Savable.export;
Call.prototype.toJsonObject = function(){
    let obj = new Object();
    for(let i in this){
        if(["_","$"].indexOf(i[0])==-1 
            && (typeof this[i] != 'array')
            && (typeof this[i] != 'object')){

            obj[i] = this[i];
        }
        else if(i == "tags"){
            obj.tags = this.tags;
        }
        else if(i == "caller"){
            obj.caller = this.caller.__signature__;
        }
        else if(i == "calleed"){
            if(this.calleed instanceof Class)
                obj.callee = this.calleed.name;
            else
                obj.callee = this.calleed.__signature__;
        }
        else if(i == "instr"){
            obj.instr = this.instr.exportType(); //toJsonObject(["name"]);
        }
    }   
    return obj;
};


Call.prototype.addTag = function(tag){
    this.tags.push(tag); 
}
Call.prototype.hasTag = function(tagName){
    return this.tags.indexOf(tagName)>-1;  
}
Call.prototype.getTags = function(){
    return this.tags;   
}


/**
 * Represents an Application's Method. 
 * It contains several kind of information :
 *      - the definition with teh instructions
 *      - locations of the call to this methods (cross references)
 *      - number of local variables
 *      - references to classes called, method called, field called, ...  
 *      - eventually, some tags related to the method action
 *      - eventually, the value of the parameters at runtime
 * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance  
 * @constructor
 */
function Method(config){
    // corresponding stub type to use during export
    this.__stub_type__ = STUB_TYPE.METHOD;
    this.$ = STUB_TYPE.METHOD;

    this.alias = null;

    this.name = null;
    this.modifiers = null;
    this.args = [];
    this.ret = null;
    this.instr = [];

    this.datas = [];
    this.switches = [];
    

    this.probing = false;

    this.locals = 0;
    this.registers = 0;
    this.params = 0;

    this.enclosingClass = null;

    this._hashcode = null;

    // ========= Signatures ================

    //
    this.__callSignature__ = null;
    this.__aliasedCallSignature__ = null;
    this.__signature__ = null;
    this.__pretty_signature__ = null;

    this._callers = [];

    // store arguments values catch at runtime
    this.dyn = [];

    this._useClass = {};
    this._useClassCtr = 0;
    this._useMethod = {};
    this._useMethodCtr = 0;
    this._useField = {};
    this._useFieldCtr = 0;

    this.tags = [];

    this.isDerived = false;

    if(config!==undefined)
        for(let i in config)
            this[i]=config[i];


    this.callSignature2 = function(){
        if(this.__callSignature__===null){
            let xargs = "";
            for(let i in this.args) xargs+="<"+this.args[i]._hashcode+">";

            this.__callSignature__ = this.name+"("+xargs+")"+this.ret._hashcode;   
        } 

        return this.__callSignature__;
    };
    this.aliasedCallSignature = function(){
        if(this.__aliasedCallSignature__===null){
            let xargs = "";
//            for(let i in this.args) xargs+="<"+this.args[i].signature()+">";
            for(let i in this.args) xargs+=this.args[i].signature();

            this.__aliasedCallSignature__ = this.alias+"("+xargs+")"+this.ret.signature();   
        } 

        return this.__aliasedCallSignature__;
    }
    this.callSignature = function(){
        if(this.__callSignature__===null){
            let xargs = "";
//            for(let i in this.args) xargs+="<"+this.args[i].signature()+">";
            for(let i in this.args) xargs+=this.args[i].signature();

            this.__callSignature__ = this.name+"("+xargs+")"+this.ret.signature();   
        } 

        return this.__callSignature__;
    };

    this.hashCode = ()=>{
        let xargs = "";
        for(let i in this.args) xargs+="<"+this.args[i]._hashcode+">";
        return this.enclosingClass.name+"|"+this.name+"|"+xargs+"|"+this.ret._hashcode;
    };

    this.dump = function(){

        console.log("\t"+this._hashcode);
    };

    /**
     * To build a strings containing the method canonical name, with the arguments types and orders,
     * and the return type. This signature acts as a primary key into the DB and it is the 
     * unique identifier of a object, here a method.
     * 
     * Be aware if you modify it you can break the engine !!
     * 
     * @return {String} The method signature
     * @function  
     */
    this.signature = function(){
        if(this.__signature__ !== null) return this.__signature__;

        let xargs = "", hash="";

        for(let i in this.args) xargs+=""+this.args[i].signature()+"";
        
        if(this.fqcn !== undefined)
            hash = this.fqcn+"."+this.name+"("+xargs+")"+this.ret.signature();
        else{
            //console.log(this.ret);
            hash = this.enclosingClass.name+"."+this.name+"("+xargs+")"+this.ret.signature();
        }
        this.__signature__  = hash;
        this.callSignature();
        return hash;
    };

    this.prettySignature = function(override=false){
        if(!override && this.__pretty_signature__ != null){
            return this.__pretty_signature__;
        }
        this.__pretty_signature__ = this.signatureFactory("__alias_signature__","alias");
        return this.__pretty_signature__;
    }

    // this.signatureFactory("__signature__","name")
    // this.signatureFactory("__alias_signature__","alias")
    this.signatureFactory = function(ppt, seed){
        if(this[ppt] !== null) return this[ppt];

        let xargs = "", hash="";

        for(let i in this.args) xargs+=""+this.args[i].signatureFactory(ppt, seed)+"";
        
        if(this.fqcn !== undefined)
            hash = this.fqcn+"."+this[seed]+"("+xargs+")"+this.ret.signatureFactory(ppt, seed);
        else{
            //console.log(this.ret);
            hash = this.enclosingClass[seed]+"."+this[seed]+"("+xargs+")"+this.ret.signatureFactory(ppt, seed);
        }
        this[ppt]  = hash;
        return hash;
    };

    this.sprint = function(){
        let s="\t"+this.modifiers.sprint()+" "+this.ret.sprint()+" "+this.name+"(";
        for(let i in this.args){
            s+=((i>1)?",":"")+this.args[i].sprint();
        }
        return s+")";
    }

    this.help = function(){
        let t="+-------------------- HELP --------------------+";
        t="\n[-- Methods : ]";
        t += "\n\t.callSignature()\tGet the java signature of arguments part";
        t += "\n\t.signature()\tGet the java signature of the field";
        t += "\n\t.disass()\tShow the method contents in a gdb-style";
        t += "\n\t.help()\tThis help";
        t="\n[-- Properties : ]";
        t += "\n\t.name:<string>\tGet the short name of the method"; 
        t += "\n\t.enclosingClass:<Class>\tGet the enclosing class"; 
        t += "\n\t.modifiers:<Modifiers>\tGet the modifiers";
        t += "\n\t.args:<*Type>[]\tGet the argument types";
        t += "\n\t.ret:<*Type>\tGet the type of return value";
        t += "\n\t.locals:<int>\tGet the number de locals";
        t += "\n\t.regiters:\tGet the number de registers";
        t += "\n";

        console.log(t)
    };

    return this;
}



Method.prototype.setupMissingTag = function(){
    return (this.tags.push(CONST.TAG.MISSING)); 
}
Method.prototype.removeMissingTag = function(){
    if(this.tags.length==1) 
        this.tags = [];
    else{
        let i = this.tags.indexOf(CONST.TAG.MISSING);
        let arr = this.tags.slice(0,i);
        if(i+1<this.tags.length){
            arr = arr.concat(this.tags.slice(i+1,this.tags.length-i-1));
        }
        this.tags = arr;
    }
}
Method.prototype.isMissingClass = function(){
   return (this.tags.indexOf(CONST.TAG.MISSING)>-1); 
}

Method.prototype.raw_import = Savable.import;
Method.prototype.countUsedMethods = function(){
    return this._useMethodCtr;
}
Method.prototype.countUsedClasses = function(){
    return this._useClassCtr;
}
Method.prototype.countUsedFields = function(){
    return this._useFieldCtr;
}
Method.prototype.getDataBlocks = function(){
    return this.datas;
}
Method.prototype.getSwitchBlocks = function(){
    return this.switches;
}

Method.prototype.compare = function(meth){
    let diff = [];

    for(let i in this){
        switch(i){
            case "_useClass":
            case "_useMethod":
            case "_useField":
            case "_callers":
            case "tags":
            case "alias":
            case "__aliasedCallSignature":
                // TODO : Not yet supported
                break;
            case "__signature__":
            case "__callSignature__":
            case "name":
            case "locals":
            case "registers":
            case "params":
                obj[i] = this[i];
                break;
            case "instr":
                if(this.instr.length != meth.instr.length){
                    diff.push({ ppt:"instr", old:this.instr.length, new:field.instr.length });
                }
                break;
            case "args":
                /*obj.args = [];
                if(this.args.length != meth)
                for(let j in this.args){
                    obj.args.push(this.args[j].toJsonObject());
                }*/
                break;
            case "ret":                
                if(this.ret.signature() != meth.ret.signature()){
                    diff.push({ ppt:"ret", old:this.ret.signature(), new:field.ret.signature() });
                }
                break;
            case "enclosingClass":
                // TODO
    //            obj.enclosingClass = (this.enclosingClass!=null)? this.enclosingClass.name : "";
                break;
            case "modifiers":
//                obj.modifiers = this.modifiers.toJsonObject([
//                    "public","private","protected","abstract","native","final","constructor","static"]);
                break;
        }
    }
    return new NodeCompare(this, meth, ((diff.length>0)? diff : null));
}

Method.prototype.import = function(obj){
    // raw impport
    this.raw_import(obj);
    // estor modifiers
    this.modifiers = (new Modifiers()).import(obj.modifiers);
    // restore return type
    if(CONST.WORDS.indexOf(obj.ret.name)>-1){
        this.ret = (new BasicType()).import(obj.ret);
    }else{
        this.ret = (new ObjectType()).import(obj.ret);
    }
    // restore args type
    for(let i=0; i<obj.args.length ; i++){
        if(CONST.WORDS.indexOf(obj.args[i].name)>-1){
            this.args[i] = (new BasicType()).import(obj.args[i]);
        }else{
            this.args[i] = (new ObjectType()).import(obj.args[i]);
        }   
    }
};

Method.prototype.export = Savable.export;
Method.prototype.toJsonObject = function(fields=[],exclude=[]){
    let obj = new Object();
    if(fields.length>0){
        for(let i=0; i<fields.length; i++){
            if(this[fields[i]] != null && this[fields[i]].toJsonObject != null){
                obj[fields[i]] = this[fields[i]].toJsonObject();
            }else{
                obj[fields[i]] = this[fields[i]];
            }
        }
    }else{
        for(let i in this){

            if(exclude.indexOf(i)>-1) continue;
           // if(fields != null && fields.indexOf(i)==-1) continue;
            
            switch(i){
                case "_useClass":
                    obj._useClass = [];
                    for(let j in this._useClass){
                        if(this._useClass[i] != undefined)
                            obj._useClass.push(this._useClass[i].name);
                    }
                    break;
                case "_useMethod":
                    obj._useMethod = [];
                    for(let j in this._useMethod){
                        if(this._useMethod[i] != undefined){
                            obj._useMethod.push(this._useMethod[i].__signature__);
                        }
                    }
                    break;
                case "_useField":
                    obj._useField = [];
                    for(let j in this._useField){
                        if(this._useField[i] != undefined)
                            obj._useField.push(this._useField[i].__signature__);
                    }
                    break;
                case "_callers":
                    obj._callers = [];
                    //console.log(this._callers.length);
                    for(let j=0; j<this._callers.length ; j++){
                        if(this._callers[j] != undefined)
                            //console.log("Callers -> ",this._callers[i].signature());
                            obj._callers.push(this._callers[j].__signature__);
                    }
                    break;
                case "__signature__":
                case "__callSignature__":
                case "__aliasedCallSignature":
                case "name":
                case "alias":
                case "locals":
                case "registers":
                case "params":
                case "tags":
                    obj[i] = this[i];
                    break;
                case "instr":
                    // basic blocks data are not serialized
                    break;
                case "args":
                    obj.args = [];
                    for(let j in this.args){
                        obj.args.push(this.args[j].toJsonObject());
                    }
                    break;
                case "ret":
                    obj.ret = this.ret.toJsonObject();
                    break;
                case "enclosingClass":
                    obj.enclosingClass = (this.enclosingClass!=null)? this.enclosingClass.name : "";
                    break;
                case "modifiers":
                    if(this.modifiers != null)
                        obj.modifiers = this.modifiers.toJsonObject([
                            "public","private","protected","abstract","native","final","constructor","static"]);
                    else
                        obj.modifiers = null;
                    break;
            }
        }   
    }
    return obj;
};

Method.prototype.disass = function(cfg){
    let disass = require("./Disassembler.js")
    
    if(cfg != null){
        if(cfg.pretty == true)
            return disass.methodPretty(this);  
        else if(cfg.raw == true)
            return disass.methodRaw(this);
    }else{
        return disass.method(this);  
    }
};



Method.prototype.getTaggedBlock = function(tag){
    for(let i in this.instr){
        if(this.instr[i].tag==tag) return this.instr[i];
    }
    return null;
};


Method.prototype.getBlock = function(offset){
    for(let i in this.instr){
        if(i==offset) return this.instr[i];
    }
    return null;
};

Method.prototype.getModifier = function(){
    return this.modifiers;
};

Method.prototype.getInstr = function(offsetBB,offsetInstr){
    for(let i in this.instr){
        if(i == offsetBB){
            for(let j in this.instr[i].stack){
                if(j == offsetInstr){
                    return this.instr[i].stack[j];
                }
            }
        }
    }
    return null;
};

Method.prototype.getInstrNearTo = function(offsetBB,offsetInstr,windowSize=3){
    let min = offsetInstr-windowSize;
    let max = offsetInstr+windowSize;
    let instr = [];

    for(let i in this.instr){
        if(i == offsetBB){
            for(let j in this.instr[i].stack){
                if(j > min && j < max){
                    instr.push(this.instr[i].stack[j]);
                }
            }
        }
    }
    return instr;
};


Method.prototype.newImplementationBy = function(cls){
    let meth = new Method();

    // partial deep copy :
    //  - primitive value are copied
    //  - object are passed by reference 
    for(let i in this){
        if(typeof this[i] != "function"){
            meth[i]=this[i];             
        }
    }
    meth.isDerived = true;
    meth.declaringClass = cls;

    return meth;
}

Method.prototype.setProbing = function(flag){
    this.probing = flag;
}

Method.prototype.addCallValue = function(dyn){
    this.dyn.push(dyn);
    return this;
}
Method.prototype.getCallValues = function(dyn){
    return this.dyn;
}
Method.prototype.getAlias = function(){
    return this.alias;
}
Method.prototype.setAlias = function(name){
    this.alias = name;
    this.__aliasedCallSignature__ = this.aliasedCallSignature();
}
Method.prototype.setEnclosingClass = function(cls){
    this.enclosingClass = cls;   
}
Method.prototype.getEnclosingClass = function(){
    return this.enclosingClass;   
}
Method.prototype.setReturnType = function(rettype){
    this.ret = rettype;   
}
Method.prototype.getReturnType = function(){
    return this.ret;   
}
Method.prototype.setArgsType = function(argsType){
    this.args = argsType;   
}
Method.prototype.getArgsType = function(){
    return this.args;   
}
Method.prototype.hasArgs = function(){
    return this.args.length > 0;   
}
Method.prototype.addTag = function(tag){
    this.tags.push(tag);   
}
Method.prototype.hasTag = function(tagName){
    return (this.tags.indexOf(tagName) > -1);   
}
Method.prototype.getTags = function(){
    return this.tags;   
}
Method.prototype.getCallers = function(){
    return this._callers;
}
Method.prototype.addCaller = function(meth){
    if(this._callers.indexOf(meth.signature()) == -1)
        this._callers.push(meth.signature());
}
Method.prototype.getMethodUsed = function(){
    return this._useMethod;
}
Method.prototype.addMethodUsed = function(method, call){
    if(this._useMethod[method.signature()] == null) 
        this._useMethod[method.signature()] = [];

    this._useMethod[method.signature()].push(call);
}
Method.prototype.getClassUsed = function(){
    return this._useClass;
}
Method.prototype.getFieldUsed = function(){
    return this._useField;
}
Method.prototype.appendBlock = function(block, callback=null){
    if(block instanceof BasicBlock){
        block.offset = this.instr.length;
        this.instr.push(block);
        if(callback != null && callback.basicblock != null) 
           callback.basicblock(this, block);
    }
    else if(block instanceof DataBlock){
        block.setParent(this, this.datas.length);
        this.datas.push(block);
        if(callback != null && callback.datablock != null) 
           callback.datablock(this, block);
    }
}
Method.prototype.getDataBlocks = function(){
    return this.datas;
}
/*
Method.prototype.getStringUsed = function(){
    return this._useMethod;
}
Method.prototype.getArrayUsed = function(){
    return this._useMethod;
}
*/
function CondTag(){
    this.name = null;

    return this;
}

function GotoBlock(){
    this.name = null;

    return this;
}

function ArrayBlock(){
    this.name = null;

    return this;
}

function SwitchBlock(){
    this.name = null;

    return this;
}

function Tag(tag){
    this.$ = STUB_TYPE.TAG;

    this.name = tag;

    return this;
}

class ArrayData
{
    constructor(dataWidth){
        this.width = dataWidth;
        this.data = [];
    }

    push(val){
        this.data.push(val)
    }

    length(){
        this.data.length();
    }
}

/**
 * To represent a specific case into a switch statement
 */
class SwitchCase
{
    constructor(value, target, type){
        this.value = value;
        this.target = target;
        this.type = type;
    }
}


/**
 * To represent a packed switch statement
 */
class SparseSwitchStatement
{
    constructor(){
        this.cases = {};
        this.length = 0;
    }

    appendCase(key,val){
        this.cases[key] = new SwitchCase(key, val, CONST.CASE_TYPE.SPARSE);
        this.length++;
    }

    getKeys(){
        return Object.keys(this.cases);
    }
}

/**
 * To represent a packed switch statement
 */
class PackedSwitchStatement
{
    constructor(start){
        this.start = start;
        this.cases = {};
        this.offset = start;
        this.length = 0;
    }

    appendCase(tag){
        this.cases[this.offset+1] = new SwitchCase(this.offset+1, tag, CONST.CASE_TYPE.PACKED);
        this.offset++;
        this.length++;
    }

    getStartValue(radix=16){
        return this.start.toString(radix);
    }

    forEach(fn){
        for(let i in this.cases) fn(i, this.cases[i]);
    }
}

class DataBlock
{
    constructor(dataWidth=null){
        this.line = -1;

        this.offset = -1;
        //this._parent = null;
        this.stack = [];
        this.tag = null;
        this.tags = [];

        this.signed = [];

        this.name = null;
        this.values = Buffer.alloc(CONST.MAX.DATABLOCK_SIZE);
        this.width = dataWidth;
        this.length = 0;

        this.uid = null;

        this.virtual64 = false; 
        if(64==dataWidth && this.values.readBigUInt64LE == null){
            this.virtual64 = true;
            this.values = [];
        }
    }

    getUID(){
        return this.uid;
    } 

    setParent(parent, offset){
        if(! parent instanceof Method) 
            throw Error("The parent of this DataBlock is not a function.");

        this.parent = parent;
        this.uid = this.parent.signature();
        this.uid += ":";
        this.uid += (this.name != null)? this.name : 'data_'+offset;
    }

    pushData(val, isNegative){
        // Increase buffer size if needed
        if(!this.virtual64 && ((this.length+1)*(this.width>>3) > this.values.length)){
            this.values = Buffer.alloc(this.values.length+32);
            this.values.fill(this.values);

        }

        // Zero padding if needed
        if(val.length < (this.width>>3)){
            let tmp = null;
            tmp = Buffer.alloc(this.width>>3);
            val.copy(tmp, 0, 0, this.length);
            val = tmp;
        }

        if(isNegative) this.signed.push(this.length);
        switch(this.width>>3){
            case 1:
                this.values.writeUInt8(val.readUInt8(0), this.length);
                break;
            case 2:
                this.values.writeUInt16LE(val.readUInt16LE(0), this.length*2);
                break;
            case 4:
                this.values.writeUInt32LE(val.readUInt32LE(0), this.length*4);
                break;
            case 8:
                if(this.virtual64 == true){
                    this.values.push(val.toString());
                    // FIXME : NodeJS < 12.0.0 not supports uint64
                    //console.log("uint64 values are not supported by this NodeJS version");
                }else{
                    this.values.writeBigUInt64LE(val.readBigUInt64LE(0), this.length*8);
                }
                break;
            default:    
                // nothing to do
                return;
        }
        this.length += 1;
    }

    read(offset){
        switch(this.width>>3){
            case 1:
                return this.values.readUInt8(offset);
            case 2:
                return this.values.readUInt16LE(offset*2);
            case 4:
                return this.values.readUInt32BE(offset*4);
            case 8:
                if(this.virtual64 == true){
                    return this.values[offset];
                    //console.log("This version of node not support 64bit integer !");
                    //return "NaN";
                }else{
                    return this.values.readBigUInt64LE(offset*8);
                }
            default:
                return "NaN";
        }
    }

    size(){
        return this.length * (this.width >> 3); 
    }
    
    count(){
        return this.length; 
    }

    getByteWidth(){
        return this.width>>3;
    }

    isInt64Array(){
        return (this.width == 64);
    }

    setDataWidth(width){
        switch(width){
            case 1:
                this.width = 8;
                break;
            case 2:
                this.width = 15;
                break;
            case 4:
                this.width = 32;
                break;
            case 8:
                this.width = 64;
                if(this.values.readBigUInt64LE == null){
                    this.virtual64 = true;
                    this.values = [];
                }
                break;
        }
    }


    toJsonObject(exclude=[]){
        let o = new Object();
        for(let i in this){
            if(exclude.indexOf(i)>-1) continue;
            if(this[i]==null) continue;
            switch(i){
                case "tags":
                case "signed":
                    if(this[i].length > 0) 
                        o[i] = this[i];    
                    break;
                case "line":
                case "offset":       
                    if(this[i] > -1)
                        o[i] = this[i];
                    break;
                case "name":
                case "length":
                case "width":
                case "uid":
                    o[i] = this[i];
                    break;
                case "parent":
                    o.parent = this.parent.signature();
                    break;
                case "values":
                    o.values = this.values;
                    break;
            }
        } 
        return o;
    }
}

class TagCategory
{
    constructor(name, taglist){
        this.name = name;
        this.taglist = taglist;
    }

    addTag(tag){
        if(this.taglist.indexOf(tag)==-1) 
            this.taglist.push(tag);
    }

    getTags(){
        return this.taglist;
    }

    toJsonObject(){
        let o = new Object();
        o.name = this.name;
        o.taglist = this.taglist;
        return o;
    }
}

/**
 * Represents a basic block of dalvik instruction
 */
class BasicBlock
{
    /**
    * @param {Object} config Optional, an object wich can be used in order to initialize the instance 
    * @constructor
    */
    constructor(config=null){
        this.$ = STUB_TYPE.BASIC_BLOCK;

        this.line = -1;
        this.prologue = false;
        this.stack = [];

        this.offset = -1;
        this._parent = null;

        this.tag = null;
        this.tags = [];

        //  special block name
        this.cond_name = null;
        this.goto_name = null;
        this.catch_name = null;
        this.try_name = null;
        this.try_end_name = null;
        this.catch_cond = null;
        this.switch_case = null;
        this.switch_statement = null;
        
        // special child
        this.linked_try_block = null;
        this.linked_catch_block = null;
        this.duplicate = null;
        this.switch = null;
        this.array_data = null;
        this.array_data_name = null;

        if(config!=null)
            for(let i in config)
                this[i]=config[i];
    }

    //BasicBlock.prototype.export = Savable.export;
    //BasicBlock.prototype.import=  Savable.import;

    dump(){
        console.log("\tBasic Block (line "+this.line+"):\n-------------------------");
        for(let i in this.stack){
            this.stack[i].dump();
        }
        console.log("-------------------------");
    }

    clone(clean=true){
        let bb = new BasicBlock();
        for(let i in this){
            bb[i] = this[i];
        }

        if(clean){
            //bb.cond_name = null;
            //bb.goto_name = null;
            bb.catch_name = null;
            bb.try_name = null;
            bb.try_end_name = null;
            bb.catch_cond = null;
            bb.duplicate = true;
        }

        return bb;
    }

    disass(){
        let disass = require("./Disassembler.js")
        
        disass.block(this._parent,this,0);
    }


    hasInstr(type){
        for(let i in this.stack){
            if(this.stack[i].opcode.type==type) return true;
        }
        return false;
    }

    setAsConditionalBlock(name){
        this.cond_name = name;
    }
    isConditionalBlock(){
        return this.cond_name != null;
    }
    setAsGotoBlock(name){
        this.goto_name = name;
    }
    isGotoBlock(){
        return this.goto_name != null;
    }
    setAsTryBlock(name){
        this.try_name = name;
    }
    setTryEndName(name){
        this.try_end_name = name;
    }
    getTryEndName(){
        return this.try_end_name;
    }
    isTryBlock(){
        return this.try_name != null;
    }
    setAsCatchBlock(name){
        this.catch_name = name;
    }
    setCatchCond(name){
        this.catch_cond = name;
    }
    isCatchBlock(){
        return this.catch_name != null;
    }

    setAsArrayData(name){
        this.array_data_name = name;
    }
    setAsSwitchCase(name){
        this.switch_case = name;
    }
    setAsSwitchStatement(name){
        this.switch_statement = name;
    }
    isSwitchStatement(){
        return (this.switch_statement != null) && (this.switch != null);
    }
    isSwitchCase(){
        return this.switch_case != null;
    }
    setupPackedSwitchStatement(start_value){
        this.switch = new PackedSwitchStatement(start_value);
    }
    setupSparseSwitchStatement(){
        this.switch = new SparseSwitchStatement();
    }
    getSwitchStatement(){
        return this.switch;
    }
    getSwitchCaseName(){
        return this.switch_case;
    }
    getSwitchStatementName(){
        return this.switch_statement;
    }
}

/**
 * Represents an Application's Field
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance 
 * @constructor
 */
function Field(config){
    // corresponding stub type to use during export
    this.__stub_type__ = STUB_TYPE.FIELD;
    this.$ = STUB_TYPE.FIELD;

    this.alias = null;

    this.fqcn = null;
    this.name = null;
    this.modifiers = null;
    this.type = null;
    this.instr = null;

    this.enclosingClass = null;

    this.__signature__ = null;
    this.__aliasedSignature__ = null;

    this._hashcode = null;
    this._isBinding = false;

    this._callers = [];

    this._getters = [];
    this._setters = [];

    this.tags = [];

    if(config!==undefined)
        for(let i in config)
            this[i]=config[i];

    
    return this;
}


Field.prototype.setupMissingTag = function(){
    return (this.tags.push(CONST.TAG.MISSING)); 
}
Field.prototype.removeMissingTag = function(){
    if(this.tags.length==1) 
        this.tags = [];
    else{
        let i = this.tags.indexOf(CONST.TAG.MISSING);
        let arr = this.tags.slice(0,i);
        if(i+1<this.tags.length){
            arr = arr.concat(this.tags.slice(i+1,this.tags.length-i-1));
        }
        this.tags = arr;
    }
}
Field.prototype.isMissingClass = function(){
   return (this.tags.indexOf(CONST.TAG.MISSING)>-1); 
}

/**
 * To generate the aliased signature. This signature is used only by the GUI
 * component. Its aim is to improve the user experience by propagating the 
 * alias value.
 * 
 * @param {Boolean} update If TRUE the cached aliased signature is updated, else it returns the cached signature is returned
 * @returns {String} The aliased signature
 */
Field.prototype.aliasedSignature = function(update=false){
    if(!update || this.__aliasedSignature__==null){
        this.__aliasedSignature__ = this.type.signature()+"  "+this.alias;
    }
    return this.__aliasedSignature__;
}

Field.prototype.getAlias = function(){
    return this.alias;
}

Field.prototype.compare = function(field){
    let diff = [];

    for(let i in this){
        switch(i){
            case "__signature__":
            case "__aliasedSignature__":
            case "fqcn":
            case "name":
            case "_isBinding":
                if(this[i] != field[i]){
                    diff.push({ ppt:i, old:this[i], new:field[i] });
                }
                break;
            case "tags":
                // TODO : Not yet supported
                break;
            case "type":
                if(this.type != field.type){
                    diff.push({ ppt:"type", old:this.type.signature(), new:field.type.signature() });
                }
                break;
            case "modifiers":
                // TODO : Not yet supported
                break;
            case "alias":
            case "_getters":
            case "_setters":
            case "_callers":
            case "instr":
            case "enclosingClass":
            case "modifiers":
                // ignore
                break;
        }
    }

    return new NodeCompare(this, field, ((diff.length>0)? diff : null));
}

/**
 * To set an alias and update the aliased signature
 * 
 * @param {String} name The alias value
 * @function 
 */
Field.prototype.setAlias = function(name){
    this.alias = name;
    this.aliasedSignature(true);
}

Field.prototype.raw_import = Savable.import;
Field.prototype.import = function(obj){
    // raw impport
    this.raw_import(obj);
    // estor modifiers
    this.modifiers = (new Modifiers()).import(obj.modifiers);
    // restore return type
    if(CONST.WORDS.indexOf(obj.type.name)>-1){
        this.ret = (new BasicType()).import(obj.type);
    }else{
        this.ret = (new ObjectType()).import(obj.type);
    }
};
Field.prototype.addSetter = function(meth){
    if(this._setters.indexOf(meth)==-1)
        this._setters.push(meth);
}
Field.prototype.getSetters = function(){
    return this._setters;
}

Field.prototype.addGetter = function(meth){
    if(this._getters.indexOf(meth)==-1)
        this._getters.push(meth);
}
Field.prototype.getGetters = function(){
    return this._getters;
}

Field.prototype.export = Savable.export;
Field.prototype.toJsonObject = function(fields=null,exclude=null){
    let obj = new Object();
    /*if(fields.length>0){
        for(let i in fields){
            if(this[fields[i]] != null && (typeof this[fields[i]] == "object")){
                obj[fields[i]] = this[fields[i]].toJsonObject();
            }else{
                obj[fields[i]] = this[fields[i]];
            }
        }
    }else{*/
        for(let i in this){

            if((fields instanceof Array) && fields.indexOf(i)==-1) continue;
            //if((exclude instanceof Array) && exclude.indexOf(i)>-1) continue;

            switch(i){
                case "_getters":
                case "_setters":
                case "_callers":
                    obj[i] = [];
                    for(let j=0; j<this[i].length; j++){
                        if(this[i][j] != undefined)
                            obj[i].push(this[i][j].__signature__); // getSignature()
                    }
                    break;
                case "__signature__":
                case "__aliasedSignature__":
                case "fqcn":
                case "name":
                case "alias":
                case "_isBinding":
                    obj[i] = this[i];
                    break;
                case "tags":
                    if(this[i].length > 0) 
                        obj[i] = this[i];
                    break;
                case "instr":
                    break;
                case "type":
                    if(obj.type != null)
                        obj.type = this.type.toJsonObject();
                    else
                        obj.type = null;
                    break;
                case "enclosingClass":
                    if(this.enclosingClass != null){
                        obj.enclosingClass = {
                            name: this.enclosingClass.name
                        };
                        if(this.enclosingClass.alias!=null) 
                            obj.enclosingClass.alias = this.enclosingClass.alias;
                    }
                    break;
                case "modifiers":
                    if(this.modifiers != null)
                        obj.modifiers = this.modifiers.toJsonObject(["private","protected"]);
                    else
                        obj.modifiers = null;
                    break;
            }
        }   
    //}
    return obj;
}

Field.prototype.help = function(){
    let t="+-------------------- HELP --------------------+";
    t += "\n\t.getCallers()\tExecute the function <fn> for each row of the result set";
    t += "\n\t.signature()\tGet the java signature of the field";
    t += "\n\t.sprint()\tPrint object in a string";
    t += "\n\t.help()\tThis help";
    t += "\n";

    console.log(t)
};

Field.prototype.sprint = function(){
    let s="\t"+this.modifiers.sprint()+" "+this.type.sprint()+" "+this.name;
    if(this.value != null)
        s+=" := "+this.value
    
    return s;
};

Field.prototype.getCallers = ()=>{
    return this._callers;
};



Field.prototype.hashCode = function(){
    if(this.enclosingClass === undefined) console.log(this);
    return this.enclosingClass.name+"|"+this.name;//+"|"+this.type._hashcode;
};


Field.prototype.signature = function(){
    if(this.__signature__ !== null) return this.__signature__;

    if(this.enclosingClass !== null)
        this.__signature__ = this.enclosingClass.name+";->"+this.name;
    else
        this.__signature__ = this.fqcn+";->"+this.name;

    return this.__signature__;
};


Field.prototype.addTag = function(tag){
    this.tags.push(tag); 
}
Field.prototype.hasTag = function(tagName){
    return this.tags.indexOf(tagName)>-1;  
}
Field.prototype.getTags = function(){
    return this.tags;   
}


// MODIFIER
/**
 * Represents the modifiers state of an Application's Class/Method/Field
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance 
 * @constructor
 */
function Modifiers(config){
    this.visibility = CONST.JAVA.PUBLIC;

    this.public = false;
    this.protected = false;
    this.private = false;

    this.static = false;
    this.abstract = false;
    this.constructor = false;
    this.final = false;
    this.enum = false;
    this.transient = false;
    this.declsync = false;
    this.bridge = false;
    this.varargs = false;
    this.native = false;
    this.interface = false;

    this._match = 0;
    this._name = "";

    this.tags = [];

 
    if(config!==undefined)
        for(let i in config)
            this[i]=config[i];


    return this;
}
Modifiers.prototype.export = Savable.export;
Modifiers.prototype.import=  Savable.import;

Modifiers.prototype.toJsonObject = function(include=null){
    let o = new Object();
    if(include instanceof Array){
        for(let i in this){
            if(include.indexOf(i)>-1 && this[i] != false)
                o[i] = this[i];
        }
    }else{
        for(let i in this){
            if(i[0]!=="_" && (typeof this[i] != "array"))
                o[i] = this[i];
        }
    }
    return o;
};

/*
Modifiers.prototype.toJsonObject = function(trueOnly){
    let o = new Object();
    if(trueOnly){
        for(let i in this){
            if(i[0]!=="_" && (typeof this[i] != "array") && this[i]==true)
                o[i] = this[i];
        }
    }else{
        for(let i in this){
            if(i[0]!=="_" && (typeof this[i] != "array"))
                o[i] = this[i];
        }
    }
    return o;
};*/

Modifiers.prototype.isNotPrivate = function(){
    return this.visibility!==CONST.JAVA.PRIVATE;
};


Modifiers.prototype.isStatic = function(){
    return this.static===true;
};

Modifiers.prototype.sprint = function(){
    let dbg="["
    if(this.static) dbg+="static,";
    if(this.final) dbg+="final,";
    if(this.volatile) dbg+="volatile,";

    switch(this.visibility){
        case CONST.JAVA.PRIVATE:
            dbg+="private";
            break;
        case CONST.JAVA.PROTECTED:
            dbg+="protected";
            break;
        case CONST.JAVA.PUBLIC:
            dbg+="public";
            break;
    }
    if(this.constructor) dbg+=",constructor";
    
    return dbg+"]";
}

/**
 * Represents a reference to a field in the Application bytecode
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance 
 * @constructor
 */
function FieldReference(config){
	this.fqcn = null;
	this.field = null;
    this.name = null;
    this.isArray = false;
    this._hashcode = "";
    this.tags = [];
    this.enclosingClass = null;

    this.tags = [];

    this.toField = function(cls){
        let x=new Field();
        x.fqcn = this.fqcn;
        x.name = this.name;

        if(cls !== null && cls !== undefined){
            x.enclosingClass = cls;
            x._hashcode = x.hashCode();
        }
        

        return x;
    };

    this.signature = function(){
        return this.fqcn+";->"+this.name;
    };

    if(config!==undefined)
        for(let i in config)
            this[i]=config[i];

	return this;
}


/**
 * Represents a reference to a class in the Application bytecode
 * @param {string} fqcn The Full-Qualified Class Name of the class 
 * @constructor
 */
function ClassReference(fqcn){
    this.fqcn = fqcn;

    return this;
}


/**
 * Represents a reference to a method in the Application bytecode
 * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance 
 * @constructor
 */
function MethodReference(cfg){
	this.fqcn = null;
    this.name = null;
    this.args = null;
    this.ret = null;
    this.enclosingClass = null;
    this._hashcode = "";
    this.__callSignature__ = null;

    this.tags = [];

   
    this.hashCode = ()=>{
        let xargs = "";
        for(let i in this.args) xargs+="<"+this.args[i]._hashcode+">";
        this._hashcode =  this.fqcn+"|"+this.name+"|"+xargs+"|"+this.ret._hashcode;

        return this._hashcode;
    };

    this.toMethod = function(cls){
        let x=new Method();
        x.fqcn = this.fqcn;
        x.name = this.name;
        x.args = this.args;
        x.ret = this.ret;
        x.__callSignature__ = this.__callSignature__;

        if(cls !== null && cls !== undefined){
            x.enclosingClass = cls;
            x._hashcode = x.hashCode();
        }

        return x;
    };

    /**
     * To generate the method signature from the reference. The aim of this value 
     * is to help to resolve the symbols.  
     */
    this.signature = function(){
        let xargs = "";
        /*
        for(let i in this.args){
            if(this.args[i]._hashcode[0]=="L"){
                xargs+="<"+this.args[i]._hashcode.substr(1,this.args[i]._hashcode.length-2)+">";
            }else{
                xargs+="<"+this.args[i]._hashcode+">";
            }
        }*/

        for(let i in this.args){
            //console.log(this.args[i]);
            xargs += this.args[i].signature();
            /*
            if(this.args[i] instanceof ObjectType){
                xargs+="<"+this.args[i]._hashcode.substr(1,this.args[i]._hashcode.length-2)+">";
            }else{
                xargs+="<"+this.args[i]._hashcode+">";
            }*/
        }


        let ret = ""; //this.ret._hashcode;
        /*if(ret[0]=="L"){
            ret = ret.substr(1, ret.length-2);
        }*/
        ret = this.ret.signature();
//        ret = "<"+ret+">";

        //if(this.enclosingClass === undefined) console.log(this._hashcode);
        if(this.fqcn !== undefined)
            return this.fqcn+"."+this.name+"("+xargs+")"+ret;//this.ret._hashcode;
        else
            return this.enclosingClass.name+"."+this.name+"("+xargs+")"+ret;//this.ret._hashcode;
        
    };

    
    /**
     * Idem as signature(), but the signature returned is not canonical 
     * (class FQCN has been remove). The aim of this signature is to resolve extended or overloaded
     * methods.
     */
    this.callSignature = function(){
        //if(this.__callSignature__===null){
            
            let xargs = "";

            let ret = this.ret.signature(); // ._hashcode;
            /*if(ret[0]=="L"){
                ret = ret.substr(1, ret.length-2);
            }*/


            for(let i in this.args){
               xargs += this.args[i].signature();
               /*
                if(this.args[i]._hashcode[0]=="L"){
                    xargs+="<"+this.args[i]._hashcode.substr(1,this.args[i]._hashcode.length-2)+">";
                }else{
                    xargs+="<"+this.args[i]._hashcode+">";
                }*/
            }
            //for(let i in this.args) xargs+="<"+this.args[i]._hashcode+">";
            
            this.__callSignature__ = this.name+"("+xargs+")"+ret;   
        //} 

        return this.__callSignature__;
    };
    /*
    this.equalCallSignatureOf = function(method){
        if(this._callSignature===null) this._callSignature = this.callSignature();
        if(method._callSignature===null) this._callSignature = this.callSignature();
    };
    */

    if(cfg !== null){
        for(let i in cfg) this[i] = cfg[i];
        /* if(this.fqcn !== null && this.name !== null 
            && this.args !== null && this.ret !== null){

            this.hashCode();
        } */
    }


	return this;
}


/**
 * Represents an instruction from the Application bytecode
 * @param {Object} config Optional, an object wich can be used in order to initialize the instance 
 * @constructor
 */
function Instruction(config){

    this.$ = STUB_TYPE.INSTR;

	this._raw = null;
	this._call = null;
    this._parent = null;


    // operands
    this.opcode = null;
    this.left = null;
    this.right = null;
    
    // experimental
    this.read = false;

    // info
	this.offset = 0;
    
    // VM
    this.value = null;

    // TODO : should be inherit
    this.tags = [];

    if(config!==undefined)
        for(let i in config)
            this[i]=config[i];


    return this;
}
Instruction.prototype.export = Savable.export;
Instruction.prototype.import=  Savable.import;
//Instruction.prototype.

Instruction.prototype.eval = function(vm){
    vm.restore(this.operands);
    this.opcode.eval(vm,this.operands);
};

Instruction.prototype.setCalledObj = function(obj){
    this._call = obj;
};

Instruction.prototype.isUsingString = function(){
    return (this.right !== undefined) && (this.opcode.reftype==CONST.OPCODE_REFTYPE.STRING);
};

Instruction.prototype.isCallingField = function(){
    return (this.right !== undefined) && (this.opcode.reftype==CONST.OPCODE_REFTYPE.FIELD);
};

Instruction.prototype.isStaticCall = function(){
    return (this.opcode.flag & CONST.OPCODE_TYPE.STATIC_CALL);
};

Instruction.prototype.isSetter = function(){
    return (this.opcode.type==CONST.INSTR_TYPE.SETTER);
};

Instruction.prototype.isGetter = function(){
    return (this.opcode.type==CONST.INSTR_TYPE.GETTER);
};

Instruction.prototype.isNOP = function(){
    return (this.opcode.type==CONST.INSTR_TYPE.NOP);
};

Instruction.prototype.isDoingCall = function(){
    return (this.right !== undefined) && (this.opcode.reftype==CONST.OPCODE_REFTYPE.METHOD);
};

Instruction.prototype.isReferencingType = function(){
    return (this.right !== undefined) && (this.opcode.reftype==CONST.OPCODE_REFTYPE.TYPE);
};

Instruction.prototype.dump = function(){
    console.log(("\t".repeat(tab))+this.opcode);
};

Instruction.prototype.printRaw = function(tab=2){
    console.log(("\t".repeat(tab))+this._raw);
};
Instruction.prototype.exportType = function(){
    return CONST.INSTR_TYPE_LABEL[this.opcode.type];
}
Instruction.prototype.toJsonObject = function(parent){
    let o = new Object();
    o.raw = this._raw;
    o.offset = this.offset;
    o.location = { offset:this.offset, bb:null };
    o.method = "";

    if(this._parent instanceof BasicBlock){
        o.offset.bb = this._parent.offset;
        if(this._parent._parent instanceof Method){
            o.method = this._parent._parent.signature();
        }
    }
    //o.parent =  this.parent.toJsonObject();
    return o;
};


Instruction.prototype.addTag = function(tag){
    this.tags.push(tag);  
}
Instruction.prototype.hasTag = function(tagName){
    return this.tags.indexOf(tagName)>-1; 
}
Instruction.prototype.getTags = function(){
    return this.tags;   
}

/**
 * Represents a reference to a missing Class/Method/Field. 
 * When a reference to a type cannot be resolved during tree building, 
 * the original reference (Class/Method/Field) is encapsulate into a MissingReference object
 * 
 * @param {int} type The type of reference according to the OPCODE_REFTYPE list
 * @param {Object} data The data to encapsulate
 * @param {Class} type The enclosing class if it's a reference to a Method or a Field
 * @constructor
 */
class MissingReference
{
    constructor(type, data, enclosingClass){
        this._log_tag = "";
        this._type = type;
        this._callers = [];
        this.enclosingClass = enclosingClass; 
        this.tags = [];

        for(let i in data)
            if(this[i] ===undefined) this[i] = data[i];
                

        switch(this._type){
            case CONST.OPCODE_REFTYPE.TYPE:
                this._log_tag = "[TYPE]";
                break;
            case CONST.OPCODE_REFTYPE.FIELD:
                this._log_tag = "[FIELD]";
                break;
            case CONST.OPCODE_REFTYPE.METHOD:
                this._log_tag = "[METHOD]";
                break;
            case CONST.OPCODE_REFTYPE.STRING:
                this._log_tag = "[STRING]";
                break;
        }

        //this._val = data;

        this.dump = ()=>{
            console.log(this._log_tag+" "+this._val);
        };

        return this;
    }

    toJsonObject(include=null){
        let o = new Object();
        for(let i in this){

            if(include instanceof Array && include.indexOf(i)==-1) continue;

            switch(i){
                case "_log_tag":
                case "_type":
                case "tags":
                    o[i] = this[i];
                    break;
                case "_callers":
                    if(this._callers.length > 0){
                        o._callers = [];
                        for(let i=0; i<this._callers.length; i++) o._callers.push(
                            this._callers[i].toJsonObject(["__signature__","alias"])
                        );
                    }
                    break;
                case "enclosingClass":
                    if(o[i] != null){
                        o[i] = this[i].toJsonObject(["name","alias"]);
                    }
                    break;
            }
        }

        return o;
    }

    addTag(tag){
        this.tags.push(tag); 
    }

    hasTag(tagName){
        return this.tags.indexOf(tagName)>-1; 
    }

    getTags(){
        return this.tags;   
    }
}
/**
 * Represents a reference to a variable in the Application bytecode
 * @param {char} type The type of variable reference (local, register, params)
 * @param {int} id The register ID  / stack offset of the variable
 * @constructor
 */
function Variable(type,id){
    this.$ = STUB_TYPE.VARIABLE;
    this.id = id;
    this.type = type;
    this.tags = [];
    
    return this;
}
Variable.prototype.import = Savable.import;
Variable.prototype.export = Savable.export;

Variable.prototype.addTag = function(tag){
    this.tags.push(tag);  
}
Variable.prototype.hasTag = function(tagName){
    return this.tags.indexOf(tagName)>-1; 
}
Variable.prototype.getTags = function(){
    return this.tags;   
}

/**
 * Represents a constant value into the Applciation bytecode
 * @param {*} value the value
 * @param {*} tags some additional tags
 * @constructor
 */
function ValueConst(value,tags){
    this.$ = STUB_TYPE.VALUE_CONST;
    this._value = value;
    this.tags = tags;

    return this;
}
ValueConst.prototype.import = Savable.import;
ValueConst.prototype.export = Savable.export;

/*
{ 
                    src:method._hashcode, 
                    instr:instruct, 
                    value:instruct.right._value }

*/
function StringValue(cfg){
    this.src = null;
    this.instr = null;
    this.value = null;
    this.tags = [];

    for(let i in cfg)
        this[i] = cfg[i];

    return this;
}
StringValue.prototype.import = Savable.import;
StringValue.prototype.export = Savable.export;
StringValue.prototype.toJsonObject = function(){
    let o = new Object();
    o.value = this.value;
    o.instr = this.instr.toJsonObject();
    o.tags = this.tags;
    //console.log(this.instr);
    return o;
};

StringValue.prototype.addTag = function(tag){
    this.tags.push(tag);    
}
StringValue.prototype.hasTag = function(tagName){
    return this.tags.indexOf(tagName)>-1;   
}
StringValue.prototype.getTags = function(){
    return this.tags;   
}

function NodeMap(){
    this.data = {};
}

function NodeList(){
    this.data = [];
}
NodeList.prototype.push = function(node){
    this.data.push(node);
}
NodeList.prototype.count = function(node){
    this.data.length;
}
NodeList.prototype.getBy = function(field,val){
    let res = new NodeList();
    for(let i in this.data){
        if(this.data[i][field] !== undefined 
            && this.data[i][field]===val){
                res.push(this.data[i]);
        }
    }
    return res;
}



function NodeDB(){
    // classesCtr = 0,
    // methodsCtr = 0,
    // fieldsCtr = 0,
    
    this.classes = {};
    this.fields = {};
    this.methods = {};
    this.strings = [];
    this.packages = [];
    
    
    this.call = [];
    this.unmapped = [];
    this.notbinded = [];
    this.notloaded = [];
    this.missing =  [];
    this.parseErrors = [];   
}

var all_exports = {
    Package: Package,
    Class: Class,
    Method: Method,
    Field: Field,
    Modifiers: Modifiers,
    DataBlock: DataBlock,
    BasicBlock: BasicBlock,
    ObjectType: ObjectType,
    BasicType: BasicType,
    Call: Call,
    FieldReference: FieldReference,
    MethodReference: MethodReference,
    ClassReference: ClassReference,
    Instruction: Instruction,
    MissingReference: MissingReference,
    ValueConst: ValueConst,
    Variable: Variable,
    StringValue: StringValue,
    XRef: XRef,
    Tag: Tag,
    Stub: Stub,
    STUB_TYPE: STUB_TYPE,
    ByteArray: ByteArray,
    NativeFunction: NativeFunction,
    Library: Library,
    Syscall: Syscall,
    FUNC_TYPE: FUNC_TYPE,
    BUILTIN_TAG: BUILTIN_TAG,
    SwitchCase: SwitchCase,
    PackedSwitchStatement: PackedSwitchStatement,
    TagCategory: TagCategory,
    File: File,
    SerializedObject: SerializedObject
}; 

SerializedObject.init(all_exports);

module.exports = all_exports;