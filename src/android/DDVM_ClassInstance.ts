/**
 * Class managing the heap area. This component handle data
 * shared by several thread. There is a single heap area per VM instance.
 *
 * This class handles class instances, class loaders, static field, and more
 *
 * @class
 * @classdesc Class managing the heap area
 */
import ModelClass from "../ModelClass.js";
import ModelField from "../ModelField.js";


export default class DDVM_ClassInstance
{
    parent:ModelClass = null;
    fields:any = null;
    initialized:boolean = false;
    concrete:any = null;

    constructor( pClass:ModelClass){
        this.parent = pClass;
        this.fields = {};
        this.initialized = false;
    }

    isInitialized():boolean{
        return this.initialized;
    }

    getClass():ModelClass{
        return this.parent;
    }

    linkConcrete( pData:any):DDVM_ClassInstance{
        this.concrete = pData;
        return this;
    }

    hasConcrete():boolean{
        return (this.concrete != null);
    }

    /**
     * To set data into an instance property
     *
     * @param {require('./CoreClass.js').Field} pField  Field description from Analyzer
     * @param {*} pData  Data to set
     */
    setField( pField:ModelField, pData:any):void{
        this.fields[pField.name] = pData;
    }

    /**
     * To get data from a specific property of the instance
     *
     * @param {require('./CoreClass.js').Field} pField  Field description from Analyzer
     * @returns {*} Data
     */
    getField( pField:ModelField):any{
        if(this.fields[pField.name] === undefined){
            return null;
        }else
            return this.fields[pField.name];
    }

    setConcrete( pData:any):DDVM_ClassInstance{
        this.concrete = pData;
        return this;
    }

    getConcrete():any{
        return this.concrete;
    }
}
