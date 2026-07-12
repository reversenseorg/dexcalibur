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

import DDVM_ClassInstance from "./DDVM_ClassInstance.js";
import DDVM_Exception from "./DDVM_Exception.js";
import Util from "../Utils.js";
import * as Log from '../Logger.js';
import DDVM_Symbol from "./DDVM_Symbol.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class DDVM_VirtualArray
{
    type:any = null;
    size:number = null;
    symbolicSize:DDVM_Symbol = null;
    value:(number|DDVM_Symbol|DDVM_ClassInstance)[] = null;

    constructor( pType:any=null, pSize=null){
        this.type = pType;
        this.size = pSize;
        this.symbolicSize = null;
        this.value = [];
    }

    /**
     * To allocate a new array and fill it with given 'stringified' data
     *
     * Input must be formatted like it :
     * NUMBER   = 0123456789
     * LETTER   = abcdefABCDEF
     * HEX      = NUMBER | LETTER [ HEX ]
     * INT      = NUMBER [ INT ]
     * FLOAT    = <INT> '.' [ <INT> ]
     * CHAR     = "'" <ASCII_CHAR> "'"
     * HEX_STR  = '0x' <HEX>
     * ENTRY    = <CHAR> | <HEX_STR> | <INT> | <FLOAT>
     * ARRAY    = '[' <ENTRY> [, <ENTRY> ] ']'
     *
     * Example :
     *  [ 'n', 'u', 'l', 'l' ]
     *  [ 12, 127, 500, 30 ]
     *  [ 0x10, 0xFF, 0xbabe ]
     *  [ 0, 1. ]
     *
     * @param {String} pArrayStr
     */
    static fromString( pType:any, pArrayStr:string):DDVM_VirtualArray{
        const RE  = new RegExp('[\s\t]*\[[\s\t]*(?<ctn>.*)[\s\t]*\][\s\t]*');
        let m:RegExpExecArray = RE.exec(pArrayStr);
        if(m == null){
            throw new DDVM_Exception('VM002','Unable to parse bytearray parameter: invalid format');
        }

        let arr:DDVM_VirtualArray = new DDVM_VirtualArray(pType, 0);
        let entries:string[] = null, el:string=null;

        if(m.groups.ctn.length > 0){
            entries = m.groups.ctn.split(',');

            Logger.debugRAW(entries, m);
            /*
             * write() is used instead of push() because array size is unknown
             * and we don't want throw 'array out of bound VM error'.
             */
            for(let i:number=0; i<entries.length; i++){
                el = Util.trim(entries[i]);
                Logger.debugRAW(el);
                // char
                if(el[0] == "'" && el.length==3){
                    arr.write( arr.size, Number.parseInt( el[1], 10 ) ); // Number.parseInt( el.charCodeAt(1), 10 )
                }
                // hex
                else if(el.indexOf('0x')>-1){
                    if(el[0]=='-')
                        arr.write( arr.size, - Number.parseInt( el.substr(1), 16 ));
                    else
                        arr.write( arr.size, Number.parseInt( el, 16 ));
                }
                // float
                else if(el.indexOf('.')>-1){
                    arr.write( arr.size, Number.parseFloat(el) );
                }
                // int
                else{
                    arr.write( arr.size, Number.parseInt( el, 10) );
                }
                arr.size++;
            }
        }

        Logger.debugRAW(arr);

        return arr;
    }

    /**
     * To print array content
     */
    print():string{
        let m='[';

        m += `](size: ${this.size}, realsize:${this.value.length})`;

        return m;
    }

    realSize():number{
        return this.value.length;
    }

    length():number{
        return this.size;
    }

    getValue():(number|DDVM_Symbol|DDVM_ClassInstance)[]{
        return this.value;
    }

    read( pOffset:number):number|DDVM_Symbol|DDVM_ClassInstance{
        return this.value[pOffset];
    }

    write( pOffset:number, pObject:number|DDVM_Symbol|DDVM_ClassInstance):void{
        this.value[pOffset] = pObject;
    }

    push( pObject:number|DDVM_Symbol|DDVM_ClassInstance){
        if(this.value.length >= this.size){
            throw new DDVM_Exception('VM003','Array out of bound');
        }

        this.value.push(pObject);
    }

    pop():(number|DDVM_Symbol|DDVM_ClassInstance){
        return this.value.pop();
    }

    fillWith( pDataBlock){
        for(let i=0; i<pDataBlock.count(); i++){
            this.value.push(pDataBlock.read(i));
        }
    }

    setSymbolicSize( pSize:any):void{
        this.size = null;
        this.symbolicSize = pSize;
    }

    setConcreteSize( pSize:number):void{
        this.size = pSize;
    }

    toString():string{
        let v:string = '[', e:any=null;
        //console.log(this);
        for(let i:number=0; i<this.value.length; i++){
            e = this.value[i];
            if(typeof e === 'number'){ //instanceof Number
                if(e > 0x10 && e<0x7f){
                    v+=`'${String.fromCharCode(e)}'`;
                }else if(e < 0){
                    v+= e.toString(16).replace('-','-0x');
                }else{
                    v+= '0x'+e.toString(16);
                }
            }else if(e instanceof DDVM_ClassInstance){
                v += '<'+e.getClass().name+'@>';
            }else{
                Logger.debugRAW(e);
                v += '<other>';
            }
            v += ',';
        }
        if(v.length > 1)
            return v.substr(0, v.length-1)+']';
        else
            return '[]';

    }
}