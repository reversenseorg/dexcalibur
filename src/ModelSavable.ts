
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
 * Constant values describing a stub type.
 */


import {NodeInternalType} from "@reversense/dxc-core-api";
import {INode, SerializeOptions, Tag} from "@reversense/dexcalibur-orm";

export enum STUB_TYPE {
    METHOD= 0x1,
    FIELD= 0x2,
    ANNOTATION= 0x3,
    INSTR= 0x4,
    MISSING= 0x5,
    CLASS= 0x6,
    OBJ_TYPE= 0x7,
    BASIC_TYPE= 0x8,
    VALUE_CONST= 0x9,
    STRING_VALUE= 0xa,
    CIRCULAR= 0xb,
    VARIABLE= 0xc,
    CALL= 0xd,
    NATIVE_FUNC= 0xe,
    SYSCALL= 0xf,
    TAG,
    BYTE_ARRAY,
    PACKAGE,
    UI_EVT_TYPE,
    UI_EVT,
    UI_CMP_TYPE,
    UI_CMP,
    UI_ROLE,
    PERMISSION
}



export class Stub
{
    __type__:number = null;

    constructor(type:number, data:any, exclude:any=null){
        this.__type__ = type;
        if(exclude==null) exclude=[];

        for(let i in data){
            if(exclude.indexOf(i)==-1)
                this[i]=data[i]
        }

    }

}


export class Savable implements INode
{
    _uid:any;
    __:NodeInternalType;
    $:STUB_TYPE;
    tags:number[] = []

    constructor(pType:STUB_TYPE) {
        this.$ = pType;
    }

    export( pStubType:STUB_TYPE=null, pExclude:string[]=null):Stub{
        return new Stub(
            (pStubType!==null ? pStubType : this.$),
            this,
            pExclude
        )
    }

    import( pConfig:any):any{
        for(let i in pConfig) this[i] = pConfig[i];

        return this;
    }


    addTag(vTag:Tag){
        const uuid = vTag.getUUID();
        if(this.tags.indexOf(uuid)==-1)
            this.tags.push(uuid);
    }

    hasTag(vTag:Tag):boolean{
        const uuid = vTag.getUUID()
        for(let i=0; i<this.tags.length; i++){
            if(this.tags[i]===uuid){
                return true;
            }
        }
        return false;
    }

    getTags():number[]{
        return this.tags;
    }

    getUID(): string {
        return this._uid;
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return this;
    }
}