'use strict';

const CLASS = require('./CoreClass');

/**
 * Represents an array of element
 *
 * @author Georges-B. MICHEL
 * @class
 */
class InMemoryDbIndex
{
    static __type = "Index";

    /**
     * To create a new instance
     *
     * @param {String} name
     * @constructor
     */
    constructor(name ){
        this.name = name;
        this.refs = [];
    }

    /**
     * To add an entry
     *
     * @param {*} ref
     * @param {Boolean} force
     * @method
     */
    insert(ref, force=false){
        if(force || this.refs.indexOf(ref)===-1)
            this.refs.push(ref);
    }

    // just a wrapper
    /**
     * To add an entry (alias of insert() )
     *
     * @param {*} ref
     * @method
     */
    addEntry(ref){
        this.insert(ref);
    }

    /**
     * To execute a function for each entry
     *
     * @param {function} fn Callback
     * @method
     */
    map(fn){
        for(let i=0; i<this.refs.length; i++){
            fn(i, this.refs[i]);
        }
    }

    /**
     * To get an entry by its offset
     *
     * @param {Integer} offset
     * @returns {*}
     * @method
     */
    getEntry(offset){
        return this.refs[offset];
    }

    /**
     * To get all entries
     *
     * @returns {Object[]}
     * @method
     */
    getAll(){
        return this.refs;
    }

    isCollection(){
        return false;
    }

    isIndex(){
        return true;
    }

    /**
     * To get the number of elements into the index
     *
     * @returns {Integer}
     * @method
     */
    size(){
        return this.refs.length;
    }

    /**
     * To transform current index to simple object ready to be serialized.
     *
     * @returns {{}}
     * @method
     */
    toJsonObject(){
        let o= {};

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
        let self = new InMemoryDbIndex(), o=null;
        self.name = serialized_obj.name;
        self.refs = [];
        for(let i=0; i<serialized_obj.refs.length; i++){
            if(CLASS.SerializedObject.isUnserializable(serialized_obj.refs[i])){
                o = new CLASS.SerializedObject(serialized_obj.refs[i]);
                self.refs.push(o.unserialize());
            }
            else
                self.refs.push(serialized_obj.refs[i]);
        }
        return self;
    }


    serialize(){
        let o= {};

        o.__type = InMemoryDbIndex.__type;
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

module.exports = InMemoryDbIndex;