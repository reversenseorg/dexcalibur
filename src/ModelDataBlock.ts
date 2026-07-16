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

import ModelMethod from "./ModelMethod.js";
import {Savable, STUB_TYPE} from "./ModelSavable.js";

import {NodeInternalType} from "@reversense/dxc-core-api";
import {NodeType, NodeProperty, DbDataType, DbKeyType, DbSerialize} from "@reversense/dexcalibur-orm";
import {ValidationRule} from "@reversense/dexcalibur-orm";
import DataScope from "./DataScope.js";
import ModelFileSection from "./ModelFileSection.js";
import {CoreDebug} from "./core/CoreDebug.js";


export default class ModelDataBlock extends Savable
{
    static TYPE:NodeType = new NodeType(
        "data_block",
        NodeInternalType.DATA_BLOCK,
        [
            (new NodeProperty("uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
            (new NodeProperty("line")).type(DbDataType.NUMERIC).def(null),
            (new NodeProperty("offset")).type(DbDataType.NUMERIC).def(null),
            (new NodeProperty("name")).type(DbDataType.STRING).def(null),
            (new NodeProperty("length")).type(DbDataType.NUMERIC).def(0),
            (new NodeProperty("values")).type(DbDataType.BLOB).def(null),
            (new NodeProperty("location")).type(DbDataType.STRING).def(null),
            (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON),
            (new NodeProperty("virtual64")).type(DbDataType.BOOLEAN).def(false),
            (new NodeProperty("width")).type(DbDataType.NUMERIC).def(1),
            (new NodeProperty("_d")).type(DbDataType.STRING).def('f'),
            (new NodeProperty("_d")).type(DbDataType.STRING).def('f'),

            (new NodeProperty("parent")).single(ModelMethod.TYPE),
        ]);

    __:NodeInternalType = NodeInternalType.DATA_BLOCK;

    line:number = -1;
    offset:number = -1;
    //stack = [];
    tag = null;
    name:string = null;
    values:any = [];
    width:number = 0;
    length:number = 0;
    uid:string = null;
    virtual64:boolean = false;
    parent:ModelMethod = null;

    constructor(dataWidth:number=null){
        super(STUB_TYPE.BYTE_ARRAY);

        this.width = dataWidth;
        this.virtual64 = false;

        if(64==dataWidth && this.values.readBigUInt64LE == null){
            this.virtual64 = true;
            this.values = [];
        }
    }

    getUID():string{
        return this.uid;
    }

    setParent(parent:ModelMethod, offset:number){
        if(!(parent instanceof ModelMethod))
            throw Error("The parent of this DataBlock is not a function.");

        this.parent = parent;
        this.uid = this.parent.signature();
        this.uid += ":";
        this.uid += (this.name != null)? this.name : 'data_'+offset;
    }

    pushData(val:any, isNegative:boolean, isShort:boolean){

        this.values.push(new Number(val));
        if(isNegative)
            this.values.push( new Number(-this.values.pop() ));

        this.length++;
        //Logger.debug( (isNegative?'-':'+')+val, this.values[this.values.length-1].toString(16) );
    }

    read(offset:number){
        return this.values[offset];
    }


    size():number{
        return this.length * (this.width >> 3);
    }

    count():number{
        return this.length;
    }

    getByteWidth():number{
        return this.width>>3;
    }

    isInt64Array():boolean{
        return (this.width == 64);
    }

    setDataWidth(width:number){
        switch(width){
            case 1:
                this.width = 8;
                break;
            case 2:
                this.width = 16;
                break;
            case 4:
                this.width = 32;
                break;
            case 8:
                this.width = 64;
                if(this.values.readBigUInt64LE == null){
                    this.virtual64 = true;
                    this.values = [];
                }
                break;
        }
    }


    toJsonObject(exclude:any=[]){
        let o:any = new Object();
        for(let i in this){
            if(exclude.indexOf(i)>-1) continue;
            if(this[i]==null) continue;
            switch(i){
                case "tags":
                    o[i] = this[i];
                    break;
                case "line":
                case "offset":
                    if(this.offset > -1)
                        o[i] = this[i];
                    break;
                case "name":
                case "length":
                case "width":
                case "uid":
                    o[i] = this[i];
                    break;
                case "parent":
                    o.parent = this.parent.signature();
                    break;
                case "values":
                    o.values = this.values;
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "ModelDataBlock");
        return o;
    }
}
ModelDataBlock.TYPE.builder(ModelDataBlock);