import {CONST} from "./CoreConst";
import ModelClass from "./ModelClass";
import ModelField from "./ModelField";
import ModelMethod from "./ModelMethod";
import construct = Reflect.construct;
import {Savable, STUB_TYPE} from "./ModelSavable";
import * as Log from './Logger';

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * Represents a reference to a field in the Application bytecode
 * @class
 */
export class ModelFieldReference
{
    fullname:string=null;
    fqcn:string = null;
    field:any = null;
    name:string = null;
    isArray:boolean = false;
    _hashcode:string = "";
    tags:any = [];
    enclosingClass:ModelClass|string = null;
    declaringClass:ModelClass|string = null; // new

    /**
     *
     * @param {Object} pConfig Optional, an object wich can be used in order to initialize the instance
     * @constructor
     */
    constructor(pConfig:any=null) {
        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];

    }

    getName():string{
        return this.name;
    }

    /**
     *
     * @param {ModelClass} pClass enclosing class
     * @return {ModelField} A Field instanciate from a field reference
     * @method
     */
    toField(pClass:ModelClass):ModelField{
        let x=new ModelField();
        x.fqcn = this.fqcn;
        x.name = this.name;

        if(pClass !== null && pClass !== undefined){
            x.enclosingClass = pClass;
            x._hashcode = x.hashCode();
        }

        return x;
    }

    signature():string{
        return this.fqcn+";->"+this.name;
    }

}




/**
 * Represents a reference to a class in the Application bytecode
 * @param {string} fqcn The Full-Qualified Class Name of the class
 * @constructor
 */
export class ModelClassReference
{
    fqcn:string = null;

    constructor(pFQCN:string=null) {
        this.fqcn = pFQCN;
    }

    getName(){
        return this.fqcn;
    }

    toJsonObject(){
        Logger.debug("[MODEL:CLASS:REF] toJsonObject() is not implemented");
        return {};
    }
}


/**
 * Represents a reference to a method in the Application bytecode
 * @param {Object} cfg Optional, an object wich can be used in order to initialize the instance
 * @constructor
 */
export class ModelMethodReference
{
    fqcn:string = null;
    name:string = null;
    args:any = null;
    ret:any = null;
    enclosingClass:ModelClass = null;
    _hashcode:string = "";
    __callSignature__:string = null;
    tags:any = [];


    constructor(pConfig:any=null) {

        if(pConfig !== null){
            for(let i in pConfig) this[i] = pConfig[i];
            /* if(this.fqcn !== null && this.name !== null
                && this.args !== null && this.ret !== null){

                this.hashCode();
            } */
        }
    }


    getName(){
        return this.fqcn;
    }


    hashCode():string{
        let xargs:string = "";
        for(let i in this.args) xargs+="<"+this.args[i]._hashcode+">";
        this._hashcode =  this.fqcn+"|"+this.name+"|"+xargs+"|"+this.ret._hashcode;

        return this._hashcode;
    };

    toMethod(cls:ModelClass):ModelMethod{
        let x:ModelMethod=new ModelMethod();
       // x.fqcn = this.fqcn; //invalid
        x.name = this.name;
        x.args = this.args;
        x.ret = this.ret;
        x.__callSignature__ = this.__callSignature__;

        if(cls !== null && cls !== undefined){
            x.enclosingClass = cls;
            x._hashcode = x.hashCode();
        }

        return x;
    }

    /**
     * To generate the method signature from the reference. The aim of this value
     * is to help to resolve the symbols.
     */
    signature():string{
        let xargs:string = "";
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


        let ret:string = ""; //this.ret._hashcode;
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
    callSignature():string{
        //if(this.__callSignature__===null){

        let xargs:string = "";

        let ret:string = this.ret.signature(); // ._hashcode;
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
    }
    /*
    this.equalCallSignatureOf = function(method){
        if(this._callSignature===null) this._callSignature = this.callSignature();
        if(method._callSignature===null) this._callSignature = this.callSignature();
    };
    */

}


export class ModelRegisterReference
{
    t:any;
    i:any;

    constructor(pTypeConfig:any=null, pIdentifier:string=null) {
        if(pTypeConfig!==null && pIdentifier!==null){
            this.t = pTypeConfig;
            this.i = pIdentifier;
        }
        else if(pTypeConfig !== null) {
            for (let i in pTypeConfig)
                this[i] = pTypeConfig[i];
        }
    }

    getRX():string{
        return this.t+this.i;
    }

    isRX(pName):boolean{
        return (this.t+this.i)===pName[0];
    }

    getNext():ModelRegisterReference{
        let reg:ModelRegisterReference = new ModelRegisterReference(this.t, this.i);

        // if(this.i === 0)
        //    throw new DDVM_Exception('R001','Registers with ID up to ')

        reg.i += 1;
        return reg;
    }

    getPrevious():ModelRegisterReference{
        let reg:ModelRegisterReference = new ModelRegisterReference(this.t, this.i);

        // if(this.i === 0)
        //    throw new DDVM_Exception('R002','Registers with negative ID are not valid (r0-1.')

        reg.i -= 1;
        return reg;
    }
}



/**
 * A cross reference to a subject
 * @param {*} obj Subject object
 * @param {*} xref Reference to the subject object.
 */
export class XRef
{
    subject:any = null;
    xref:any = null;
    noref:boolean = false

    /**
     *
     * @param obj
     * @param xref {ModelMethod}
     */
    constructor(obj:any, xref:any){
        this.subject = obj;
        this.xref = xref;
        this.noref = (xref.length == 0);

        return this;
    }
}

/**
 * To represent a label used as operand into an instruction
 *
 * @class
 */
export class Tag extends Savable
{
    /**
     * Label value
     * @type {String}
     * @field
     */
    name:string = null;

    constructor(pLabel:string) {
        super(STUB_TYPE.TAG);

        this.name = pLabel;
    }
}