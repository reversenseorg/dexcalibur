/**
 * Represents a constant value into the Applciation bytecode
 * @param {*} value the value
 * @param {*} tags some additional tags
 * @constructor
 */
import {Savable, STUB_TYPE} from "./ModelSavable";

// ValueConst
export default class ModelConstantValue extends Savable{

    _value:any = null;
    tags:any = null;

    constructor(pValue:any=null, pTags:any=null){
        super(STUB_TYPE.VALUE_CONST);

        this._value = pValue;
        this.tags = pTags;
    }

    getValue():any{
        return this._value;
    }
}

