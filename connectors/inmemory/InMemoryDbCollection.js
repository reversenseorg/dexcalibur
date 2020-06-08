'use strict';

const CLASS = require('../../src/CoreClass');

/**
 * Represent a collection of object indexed by key
 *
 * @author Georges-B. MICHEL
 * @class
 */
class InMemoryDbCollection
{
    static __type = "Collection";

    constructor(name){
        this.name = name;
        this.ctr = 0;
        this.values = {};
    }

    setEntry(key,value){
        if(!this.hasEntry(key)){
            this.ctr++;
        }
        this.values[key] = value;
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
        let o= {};

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
        let self = new InMemoryDbCollection(), o=null;
        self.name = serialized_obj.name;
        self.ctr = serialized_obj.ctr;
        self.values = {};
        for(let i in serialized_obj.values){

            if(CLASS.SerializedObject.isUnserializable(serialized_obj.values[i])){
                o = new new CLASS.SerializedObject(serialized_obj.values[i])
                self.values[i]=o.unserialize();
            }
            else
                self.values[i]=serialized_obj.values[i];
        }
        return self;
    }

    serialize(){
        let o= {};

        o.__type = InMemoryDbCollection.__type;
        o.name = this.name;
        o.ctr = this.ctr;
        o.values = {};

        for(let i in this.values){

            if(typeof this.values[i].serialize === 'function')
                o.values[i]=this.values[i].serialize();
            if(typeof this.values[i].toJsonObject === 'function')
                o.values[i]=this.values[i].toJsonObject();
            else
                o.values[i]=this.values[i];
        }

        return o;
    }
}

module.exports = InMemoryDbCollection;