import {Modifier} from "./AccessFlags";
import {CONST} from "./CoreConst";
import {EOL} from 'os';
import ModelPackage from "./ModelPackage";
import ModelMethod from "./ModelMethod";
import ModelField from "./ModelField";
import NodeCompare from "./NodeCompare";
import {Savable, STUB_TYPE} from "./ModelSavable";
import {ModelClassReference, ModelFieldReference, ModelMethodReference} from "./ModelReference";
import {ModelLocation} from "./ModelLocation";
import {IPersistent} from "./persist/orm/IPersistent";
import {NodeType} from "./persist/orm/NodeType";
import {NodeInternalType} from "./NodeInternalType";
import {NodeProperty, NodePropertyState} from "./persist/orm/NodeProperty";
import {DbDataType, DbKeyType} from "./persist/orm/DbAbstraction";


interface IClassSet {
    [p: string]: ModelClass
}


interface IMethodSet {
    [p: string]: ModelMethod
}


interface IFieldSet {
    [p: string]: ModelField
}

/**
 * Represent a Class object :
 *  - Created by the parser and the ClassLoader's hook
 *  - Updated by the reference solver and the ClassLoader's hook
 * @param {object} config Optional, a hashmap with param/value to initiliaze
 * @constructor
 */
export default class ModelClass extends Savable implements IPersistent
{
    static TYPE:NodeType = new NodeType( "code_class", NodeInternalType.CLASS, []);

    __:NodeInternalType = NodeInternalType.CLASS;

    //fqcn = null;
    // the FQCN of the class
    name:string = null;

    // An alias
    alias:string = null;


    // the Simple name of the class (the last part of the FQCN)
    simpleName:string = null;

    // the FQDN of the package
    // the package
    package:ModelPackage|string = null;

    // the name of the source file contained into the .source instruction
    source:string = null;

    // a list of modifiers of the class (public/private/protected/static/final/...)
    modifiers:Modifier = null;

    // a list of references to the implemented interfaces
    implements:(ModelClass|string)[] = [];

    // a list of references to the extended classes
    extends:ModelClass|ModelClassReference = null; //ModelClassReference
    supers:(ModelClass|ModelClassReference)[] = null;

    // a list of references to the appied annotations
    annotations = [];

    // a list of the declared method
    methods:IMethodSet = {};
    inherit = {};

    // the count of methods inside the class
    _methCount:number = 0;

    // a list of the declared fields
    fields:IFieldSet = {};

    // the count of declared fields
    _fieldCount:number = 0;

    // an hashmap of the inner classes, the key is the FQCN of the subject
    // innerClass:IClassSet = {};
    innerClass:boolean = false;

    tags:any = [];

    /*
     if the current object is enclosed into another class, a reference to
     the enclosing class is stored here
    */
    enclosingClass:ModelClass|ModelClassReference = null;

    // private : a list of the methods containing instructions which use this class
    _callers:string[]|ModelMethod[] = [];

    // private : the unique identifier of this object in the graph
    _hashcode:string = null;

    // private : TRUE if this class is binded by the OS or the VM.
    _isBinding:boolean = null;

    __pretty_signature__:string = null;
    __aliasedCallSignature__:string = null;

    /**
     * Node properties
     */
    __p:any = {};

    constructor(pConfig:any=null){
        super(STUB_TYPE.CLASS);

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }

    /**
     * To get UID (FQCN)
     */
    getUID():string {
        return this.name;
    }

    set location (pLocation:ModelLocation) {
        this.__p.loc = pLocation;
    }

    get location ():ModelLocation {
        return this.__p.loc;
    }

    addLocation(pLocation:ModelLocation):void {
        this.__p.loc = pLocation;
    }

    /**
     * @deprecated
     */
    hashcode():string {
        return this.name;
    }

    help() {
        let t:string ="+-------------------- HELP --------------------+";
        t += EOL+"[-- Methods : ]";
        t += EOL+"\t.dump()\tShow the class information (field, methods, modifiers, parents, etc...)";
        t += EOL+"\t.hasField(<string>)\tCheck if the class define the given field";
        t += EOL+"\t.hasMethod(<string>)\tCheck if the class define the given method";
        t += EOL+"\t.help()\tThis help";
        t += EOL+"[-- Properties : ]";
        t += EOL+"\n\t.instr:<Instruction>\tGet the instruction";
        t += EOL+"\n\t.caller:<Method>\tGet the method performing the call";
        t += EOL+"\t.calleed:<*>\tGet the reference to the calleed";
        t += EOL;

        console.log(t);
    }


    /**
     * To check if a field is defined whith the given name
     * @param {String} name The name of a field
     * @returns {Boolean} TRUE if the class contains a definition, else FALSE
     */
    hasField(name:string):boolean{
        return (this.fields[name]!==undefined);
    }


    addField(field:ModelField){
        this.fields[field.signature()] = field;
    }

    updateField(field:ModelField, override:boolean=false){
        let diff:NodeCompare = this.fields[field.signature()].compare(field);
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
    hasMethod(hash:string):boolean{
        return this.methods[hash]!==undefined;
    }


    addMethod(meth:ModelMethod){
        this.methods[meth.signature()] = meth;
    }

    updateMethod(meth:ModelMethod, override:boolean=false){
        let diff:NodeCompare = this.methods[meth.signature()].compare(meth);
        // if not identic => update, else nothiong to do
        if(!diff.isIdentic()){
            if(override)
                this.methods[meth.signature()] = meth;
        }
    }


    hasSuperClass():boolean{
        return (this.extends != null);
    }

    getSuperClass():ModelClass|ModelClassReference{
        return this.extends;
    }

    getSuperList():(ModelClass|ModelClassReference)[]{
        return this.supers;
    }

    setSupersList(superList:ModelClass[]){
        this.supers = superList;
    }

    getName():string{
        return this.name;
    }

    signature():string{
        return this.name;
    }

    aliasedSignature():string{
        return this.alias;
    }

    /**
     * Broken
     *
     * @param override
     * @deprecated
     */
    prettySignature(override:boolean=false):string{
        if(!override && this.__pretty_signature__ != null){
            return this.__pretty_signature__;
        }
        this.__pretty_signature__ = this.signatureFactory("__alias_signature__","alias");
        return this.__pretty_signature__;
    }

// this.signatureFactory("__signature__","name")
// this.signatureFactory("__alias_signature__","alias")
    /**
     * TODO remove ? broken ? useless ?
     *
     * @param ppt
     * @param seed
     * @deprecated
     */
    signatureFactory(ppt:string, seed:string):string{
        if(this[ppt] !== null) return this[ppt];

        this[ppt] = this[seed];

        return this[seed];
    }

    getAlias():string{
        return this.alias;
    }

    setAlias(name:string){
        this.alias = name;
    }

    hasAliasedMethod( pAlias:string):boolean{
        let f = false;
        for(let f in this.methods){
            if(this.methods[f].getAlias()===pAlias)
                return true;
        }
        return false;
    }

    hasAliasedField( pAlias:string):boolean{
        let f = false;
        for(let f in this.fields){
            if(this.fields[f].getAlias()===pAlias)
                return true;
        }
        return false;
    }

    /**
     * To dump class into stdout / console
     *
     * @method
     */
    dump(){
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

    raw_import(data:any) {
        for(let i in data) this[i] = data[i];
    }

    import(obj:any){
        // raw impport
        this.raw_import(obj);

        // construct obj
        this.modifiers = obj.modifiers;
    }


    hasOverrideOf(meth:ModelMethod):ModelMethod{
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
    addInheritedMethod(methodRef:string|ModelMethodReference, parentMethod:ModelMethod):ModelMethod{
        let n:string=(methodRef instanceof ModelMethodReference) ? methodRef.getName() : methodRef;

        this.methods[n] = parentMethod;
        this.inherit[n] = parentMethod;
        return this.methods[n];
    }

    /**
     *
     * @param localReference
     * @param parentField
     */
    addInheritedField(localReference:string|ModelFieldReference, parentField:ModelField):ModelField{

        let n:string=(localReference instanceof ModelFieldReference) ? localReference.getName() : localReference;

        this.fields[n] = parentField;
        this.inherit[n] = parentField;
        return this.fields[n];
    }


    toJsonObject():any{
        let obj:any = {}, m=null;
        for(let i in this){
            if(["_","$"].indexOf(i[0])==-1
                && (Array.isArray(this[i])===false)
                && (typeof this[i] != 'object')){

                obj[i] = this[i];
            }
            else if(i == '__'){
                obj.__ = this.__;
            }
            else if(i == "supers"){
                obj.supers = [];
                if(this.supers instanceof Array)
                    for(let k=0; k<this.supers.length; k++){
                        if(this.supers[k] instanceof ModelClass)
                            obj.supers.push({
                                name: (this.supers[k] as ModelClass).signature(),
                                alias: (this.supers[k] as ModelClass).getAlias()
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
                    m = this.fields[k].toJsonObject(["__signature__","__aliasedSignature__","alias","name","tags","type","modifiers"]);
                    if(this.inherit[k] != null) m.__inherit = true;
                    obj.fields.push(m);
                }
            }
            else if(i == "package"){
                if(this.package instanceof  ModelPackage)
                    obj.package = this.package.toJsonObject(["name"]);
                else
                    obj.package = {name:this.package};
            }
            else if(i == "tags"){
                obj.tags = this.tags;
            }
            else if(i == "extends"){
                //obj.extends = (this.extends!=null? this.extends.toJsonObject(["__signature__"]): null);
                obj.extends = (this.extends!=null && (this.extends instanceof ModelClass))? this.extends.name : null;
                //obj.extends = (this.extends!=null? { name: this.extends.name, alias:this.extends.alias } : null);
            }
            else if(i == "implements"){
                if(this.implements.length > 0){
                    obj.implements = [];

                    for(let x=0; x<this.implements.length; x++){
                        if( this.implements[x] instanceof  ModelClass)
                           obj.implements.push( (this.implements[x] as ModelClass).name);
                    }
                }
            }
            else if(i == "__p"){
                if(this.__p.loc != null){
                    obj.location = this.__p.loc.toJsonObject();
                }
            }
        }
        return obj;
    }


    /**
     * To find a class's method by usins a search pattern
     * @param {String} fqcn A raw Full-Qualified Class Name
     */
    initFromFQCN(fqcn:string):ModelClass{
        this.name = fqcn;
        this.simpleName = fqcn.substr(fqcn.lastIndexOf("$"));
        return this;
    }

    /**
     * To set the class package
     * @param {Package} pkg The package containing this class
     */
    setPackage(pkg:ModelPackage):ModelClass{
        this.package = pkg;
        return this;
    }

    /**
     * To get the class package
     */
    getPackage():ModelPackage|string{
        return this.package;
    }

    /**
     * To find a class's method by usins a search pattern
     * @param {String} pattern
     */
    getMethod(pattern:any, pExactMatch:number=0):ModelMethod[]{
        let res0:any = [], res1:any=[], rx:any={}, match:any=null;
        if(pExactMatch != CONST.EXACT_MATCH){
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
        }else{
            res1 = this.methods;
            for(let i in pattern){
                res0 = res1;
                res1 = [];
                for(let meth in res0){
                    if(pattern[i] === res0[meth][i])
                        res1.push(res0[meth]);
                }
            }
        }

        return res1;
    }



    /**
     * To find a class's field by usins a search pattern
     * @param {String} pattern
     * @return {ModelField} Field
     */
    getField(pattern:any):ModelField[]{
        let res0:any = [], res1:any=[], rx:any={}, match:any=null;
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

    /**
     * To get all static fields declared or inherited
     * @returns {ModelField[]} An array of fields
     */
    getStaticFields():ModelField[]{
        let f:ModelField[] = [];
        for(let i in this.fields){
            if((this.fields[i].modifiers & Modifier.STATIC)>0){
                f.push(this.fields[i]);
            }
        }
        return f;
    }

    /**
     * To get <clinit> method
     * TODO : do it during analysis
     * @returns {Method}
     */
    getClInit():ModelMethod{
        for(const i in this.methods){
            if(this.methods[i].name == "<clinit>"){
                return this.methods[i];
            }
        }
        return null;
    }

    setupMissingTag(){
        return (this.tags.push(CONST.TAG.MISSING));
    }

    removeMissingTag(){
        if(this.tags.length==1)
            this.tags = [];
        else{
            let i:number = this.tags.indexOf(CONST.TAG.MISSING);
            let arr:string[] = this.tags.slice(0,i);
            if(i+1<this.tags.length){
                arr = arr.concat(this.tags.slice(i+1,this.tags.length-i-1));
            }
            this.tags = arr;
        }
    }

    isMissingClass():boolean{
        return (this.tags.indexOf(CONST.TAG.MISSING)>-1);
    }

    addTag(tag:string){
        this.tags.push(tag);
    }
    hasTag(tagName:string):boolean{
        return this.tags.indexOf(tagName)>-1;
    }
    getTags():string[]{
        return this.tags;
    }

    /**
     * To get the implement interface
     */
    getInterfaces():(ModelClass|string)[]{
        return this.implements;
    }

    removeAllInterfaces(){
        this.implements = [];
    }

    addInterface(inf:ModelClass){
        this.implements.push(inf);
    }

    updateSuper(cls:ModelClass){
        if(cls.getSuperClass().getName() != this.getSuperClass().getName()){
            // TODO : create NodeChange
            this.extends = cls;
        }
    }
}

