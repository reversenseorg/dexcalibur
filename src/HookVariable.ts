
import * as Log from './Logger.js';

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * This abstract class represents a hook variable.
 *
 * The purpose of hook variables is to enable stateful hook over several
 * execution. When the template of a hook fragment contains reference to the hook variable.
 *
 *
 * @class
 */
export abstract class HookVariable
{
    data:any = null;

    getData():any{
        return this.data;
    }

    setData(pData:any):void{
        this.data = pData;
    }

    abstract write():string;
}


/**
 * This class represents an array of value held by a hook variable
 *
 * @class
 */
export class HookVariableArray extends  HookVariable
{

    constructor(data:any){
        super();
        this.setData(data);
    }

    write():string{
        let str:string=` [
            `;
        for(let i=0; i<this.data.length; i++){
            if(typeof this.data[i] == 'string'){
                str += "'"+this.data[i]+"',";
            }else if(typeof this.data[i] == 'object'){
                str += JSON.stringify(this.data[i])+",";
            }else if(typeof this.data[i] == 'number'){
                str += this.data[i]+",";
            }else{
                Logger.error('Unsupported hook variable : type of nested data not supported.');
            }
        }

        return str.substr(0,str.length-1)+`
            ],`;
    }
}

/*
DO NOT USE
*/
export class HookVariableObject extends HookVariable
{
    constructor(data){
        super();
        this.setData(data);
    }

    write():string{
        return JSON.stringify(this.data)+",";
    }
}
