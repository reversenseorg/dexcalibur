
/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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

    indexOf(value: any) {
        return this.data.indexOf(value)
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
