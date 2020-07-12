import { CONST } from "./CoreConst";
import {Savable, Stub, STUB_TYPE} from "./ModelSavable";


/**
 * Represent a primitive type
 * @class
 */
export class ModelBasicType extends Savable
{
    name:string = null;
    arr:boolean = false;
    _name:string = null;
    _hashcode:string = null;


    /**
     * To represent a primitive type
     * @param {string} raw_type - The raw name of the type as it can be found in Smali code
     * @param {boolean} isArray - Array flag should be TRUE if the type is an array, else FALSE
     * @constructor
     */
    constructor(raw_type:string=null, isArray:boolean=false){
        super(STUB_TYPE.BASIC_TYPE);

//        this.$ = STUB_TYPE.BASIC_TYPE;
        if(raw_type!==null){
            this.name = CONST.TYPES[raw_type];
            this._name = (CONST.WORDS[raw_type]!=undefined)? CONST.WORDS[raw_type] : "???";
            this._hashcode = raw_type;
        }
        this.arr = isArray;
    }

    import(pConfig: any): ModelBasicType {
        return super.import(pConfig);
    }

    hashcode():string{
        return this._hashcode
    }

    sprint():string{
        return "<"+this._name+">"+(this.arr?"[]":"");
    }
/*
    import(pData:any){
        this.import(pData);
    }

    export():Stub{
        return this.export();
    }*/

    /**
     * To check if the current type is Void
     * @returns {boolean} - Returns TRUE if the type is Void, else FALSE
     */
    isVoid():boolean{
        return this.name == CONST.WORDS.V; // CONST.TYPES.V
    }

    /**
     * To check if the current type is numeric (integer, long or short)
     * @returns {boolean} - Returns TRUE if the type is integer or long or short, else FALSE
     */
    isNumeric():boolean{
        return [CONST.WORDS.S, CONST.WORDS.I, CONST.WORDS.J].indexOf(this.name)>-1;
        //return [CONST.TYPES.S, CONST.TYPES.I, CONST.TYPES.J].indexOf(this.name)>-1;
        // return [CONST.TYPES.S, CONST.TYPES.I, CONST.TYPES.J].indexOf(this._hashcode)>-1;
    }

    /**
     * To check if the current type is an array
     * @returns {boolean} - Returns TRUE if the type is an array, else FALSE
     */
    isArray():boolean{
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
    signature():string{
        return "<"+this._name+">"+(this.arr?"[]":"");
    }


    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} - Returns an Object instance representing the type
     */
    toJsonObject():any{
        let obj:any = {};
        obj.name = this._name;
        obj.arr = this.arr;
        obj.primitive = true;
        return obj;
    }
}



export class ModelObjectType extends Savable
{
    name:string = null;
    arr:boolean = false;
    _name:string = null;
    _hashcode:string = null;
    tags:string[] = null;

    constructor(pFQCN:string=null, isArray:boolean=false) {
        super(STUB_TYPE.OBJ_TYPE);

        if(pFQCN!==null){
            this.name = pFQCN;
            this._name = pFQCN;
            this._hashcode = pFQCN;
        }
        this.arr = isArray;
        this.tags = [];
    }

    import(pConfig: any): ModelObjectType {
        return super.import(pConfig);
    }

    export():Stub{
        return super.export();
    }

    hashcode():string{
        return this._hashcode
    }

    sprint():string{
        return "<"+this._name+">"+(this.arr?"[]":"");
    }


    /**
     * To check if the current type is a Java String
     * @returns {boolean} - Returns TRUE if the type is a Java String, else FALSE
     */
    isString():boolean{
        return this.name == "java.lang.String";
    }
Ò
    /**
     * To make the signature of the current type instance
     * It has one of these forms :
     *      - "<I>" if the current type is an Integer
     *      - "<I>[]"  if the current type is an array of Integer
     *
     * @returns {string} - Returns the signature of the type
     */
    signature():string{
        return "<"+this.name+">"+(this.arr?"[]":"");
    }

    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} - Returns an Object instance representing the type
     */
    toJsonObject(){
        let obj:any = {};
        obj.name = this.name;
        obj.arr = this.arr;
        obj.primitive = false;
        return obj;
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

    isArray():boolean{
        return this.arr;
    }
}
