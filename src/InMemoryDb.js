
class Index
{
    constructor(name){
        this.name = name;
        this.refs = [];
    }

    insert(ref, force=false){
        if(false || this.refs.indexOf(ref)==-1)
            this.refs.push(ref);
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
}   

class Collection
{
    constructor(name){
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
}   

class InMemoryDb
{
    constructor(context){
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
}

module.exports = {
    InMemoryDb: InMemoryDb,
    Index: Index,
    Collection: Collection
};