'use strict';

const CLASS = require("./CoreClass.js");

class Index
{
    static __type = "Index";

    constructor(name,elemnt_type = null){
        //this.etype = elemnt_type;
        this.name = name;
        this.refs = [];
    }

    insert(ref, force=false){
        if(false || this.refs.indexOf(ref)==-1)
            this.refs.push(ref);
    }

    // just a wrapper
    addEntry(ref){
        this.insert(ref);
    }
    /*
    TODO
    delete(ref,cond){
        for(let i=0; i<this.refs.length; i++)
            if(cond(this.refs[i])){
                let arr=
            }

    }
    */


    map(fn){
        for(let i=0; i<this.refs.length; i++){
            fn(i, this.refs[i]);
        }
    }

    getEntry(offset){
        return this.refs[offset];
    }

    getAll(){
        return this.refs;
    }

    isCollection(){
        return false;
    }

    isIndex(){
        return true;
    }

    size(){
        return this.refs.length;
    }

    toJsonObject(){
        let o=new Object();

        o.name = this.name;
        o.refs = [];
        for(let i=0; i<this.refs.length; i++){
            if(typeof this.refs[i].toJsonObject  === 'function'){
                o.refs[i] = this.refs[i].toJsonObject()
            }else{
                o.refs[i] = this.refs[i];
            }
        }

        return o;
    }

    // ======= serialize ======= 


    isSerializable(){
        let ret = false;
        for(let i=0; i<this.refs.length ; i++)
            ret &= this.refs[i].isSerializable();
        
        return ret;
    }

    static unserialize(serialized_obj){
        let self = new Index();
        self.name = serialized_obj.name;
        self.refs = [];
        for(let i=0; i<serialized_obj.refs.length; i++){
            if(serialized_obj.refs[i].isSerializable === true){
                self.refs.push(CLASS.SerializedObject.unserialize(serialized_obj.refs[i]));
            }
            else
                self.refs.push(serialized_obj.refs[i]);
        }
        return o;
    }


    serialize(){
        let o=new Object();

        o.__type = Index.__type;
        o.name = this.name;
        o.refs = [];

        for(let i=0; i<this.refs.length; i++){
            if(this.refs[i].isSerializable() === true){
                o.refs.push(this.refs[i].serialize());
            }else if(typeof this.refs[i].toJsonObject === 'function')
                o.refs.push(this.refs[i].toJsonObject());
            else
                o.refs.push(this.refs[i]);
        }

        return o;
    }
}   

class Collection
{
    static __type = "Collection";

    constructor(name,elemnt_type = null){
        this.name = name;
        this.ctr = 0;
        this.values = {};
    }

    setEntry(key,value){
        this.values[key] = value;
        this.ctr++;
    }

    addEntry(key,value){
        this.setEntry(key,value);
    }

    getEntry(key){
        return this.values[key];
    }

    getAll(){
        return this.values;
    }

    hasEntry(key){
        return (this.values[key] !== undefined);
    }

    map(fn){
        for(let k in this.values){
            fn(k,this.values[k]);
        }
    }

    isCollection(){
        return true;
    }

    isIndex(){
        return false;
    }

    size(){
        return this.ctr;
    }

    toJsonObject(){
        let o=new Object();

        o.name = this.name;
        o.ctr = this.ctr;
        o.values = {};
        for(let i in this.values){
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;
    }

    // ======= serialize ======= 

    isSerializable(){
        return true;
    }

    static unserialize(serialized_obj){
        let self = new Collection();
        self.name = serialized_obj.name;
        self.ctr = serialized_obj.ctr;
        self.values = {};
        for(let i in serialized_obj.values){
            if(serialized_obj.values[i].isSerializable === true){
                self.values[i]=CLASS.SerializedObject.unserialize(serialized_obj.values[i]);
            }
            else
                self.values[i]=serialized_obj.values[i];
        }
        return o;
    }

    serialize(){
        let o=new Object();

        o.__type = Collection.__type;
        o.name = this.name;
        o.ctr = this.ctr;
        o.values = {};

        for(let i in this.values){
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;
    }
}   

class InMemoryDb
{
    constructor(context=null){
        this.ctx = context;
        this.indexes = {};
        this.sizes = {};
    }

    newCollection(name){
        if(this.indexes[name]!=null) throw new Error("A collection is already set for the given name");

        this.indexes[name] = new Collection(name);
    }


    newIndex(name){
        if(this.indexes[name] != undefined) throw new Error("An index already exists for the given name");

        this.indexes[name] = new Index(name);
    }

    getIndex(name){
        return this.indexes[name];
    }

    setContext(context){
        this.ctx = context;
    }


    toJsonObject(){
        let o=new Object();

        o.indexes = {};
        for(let i in this.indexes){
            o.indexes[i] = this.indexes[i].toJsonObject();
            if(this.indexes[i] instanceof Index)
                this.indexes[i].__type = "Index";
            else
                this.indexes[i].__type = "Collection";
        }

        return o;
    }

    // ============ serialize ============

    isSerializable(){
        let ret=true;
        for(let i in this.indexes){
            ret &= this.indexes[i].isSerializable();
        }
        return ret;
    }

    unserialize(obj){
        for(let i in obj.indexes){
            if(obj.indexes[i].__type === "Index"){
                this.indexes[i] = Index.unserialize(obj.indexes[i]);
            }else{
                this.indexes[i] = Collection.unserialize(obj.indexes[i]);
            }
        }
    }

    serialize(){
        let o=new Object();

        o.indexes = {};
        for(let i in this.indexes){
            if(typeof this.indexes[i].isSerializable === 'function')
                o.indexes[i] = this.indexes[i].serialize();
            else if(typeof this.indexes[i].toJsonObject === 'function')
                o.indexes[i] = this.indexes[i].toJsonObject();
            else
                o.indexes[i] = this.indexes[i];
        }

        return o;
    }
}

module.exports = {
    InMemoryDb: InMemoryDb,
    Index: Index,
    Collection: Collection
};