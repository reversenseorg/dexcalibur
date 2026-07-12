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
