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

import {ModelFieldReference, ModelRegisterReference} from "./ModelReference.js";
import {RX} from "./CoreParser.js";
import {CONST} from "./CoreConst.js";
import {ModelBasicType, ModelObjectType} from "./ModelType.js";
import Util from "./Utils.js";


import * as Log from './Logger.js';
import DalvikInstructionFormat from "./DalvikInstructionFormat.js";
import {ElixirOpcodeDefinition, OPCODE} from "./Opcode.js";
import ModelInstruction from "./ModelInstruction.js";
import DexcaliburProject from "./DexcaliburProject.js";
import {Nullable} from "@reversense/dxc-core-api";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface MethodInfo {
    name:string;
    args:(ModelBasicType|ModelObjectType)[];
    ret:ModelBasicType|ModelObjectType;
}


export default class OpcodeSmaliParser
{
    static CTR = 0;

    static STATIC_TAGS = {
        STRING: CONST.TAG.STRING,
        STRING_DECL: CONST.TAG.STRING_DECL
    };

    instrCtr:number = 0;
    tags:any;
    context:DexcaliburProject;

    constructor(pProject:DexcaliburProject) {
        this.context = pProject;
        this._initTags();
    }

    private _initTags(){
        const tmgr = this.context.getTagManager();
        this.tags = {
            STRING: tmgr.getTag("data.type.string").getUUID(),
            STRING_DECL: tmgr.getTag("code.global.declare-string").getUUID()
        }
    }
    /**
     * @deprecated
     * @param name
     */
    static isModifier(name:string):boolean{
        for(let i in CONST.LEX.MODIFIER) if(CONST.LEX.MODIFIER[i]==name) return true;
        return false;
    }

    /**
     * To convert a string representing a FQCN from smali notation to java notation
     *
     * @param {String} src
     * @static
     * @function
     */
    static fqcn(pSmaliFqcn:string|string[]):string{
        if(pSmaliFqcn.length==0) return null;

        let raw:string="";
        raw = (pSmaliFqcn instanceof Array)? pSmaliFqcn[0] : pSmaliFqcn;

        while(raw.indexOf("/")>-1) raw=raw.replace("/",".");

        return raw;
    }

    static type(pSource:string):(ModelObjectType|ModelBasicType)[]{
        let i:number=0,l:number=-1,types:any=[],s:string=pSource,fqn:string=null,isArray:boolean=false;

        while(i<pSource.length){
            if(pSource[i]==CONST.LEX.TOKEN.ARRAY){
                isArray=true;
                i++;
                continue;
            }

            if(pSource[i]==CONST.LEX.TOKEN.OBJREF){
                l=pSource.indexOf(";",i);
                fqn=this.fqcn(pSource.substr(i+1,l-i-1));
                types.push(new ModelObjectType(fqn, isArray));
                i=l+1;
                isArray=false;
                continue;

            }else if( RX.PRIM_T.exec(pSource[i]) !== null){
                types.push(new ModelBasicType(pSource[i], isArray));
                i++;
                isArray = false;
                continue;
            }
            else{
                console.log("[!] Unknow type : "+pSource[i]+" (in "+pSource+")");
                break;
            }
        }

        return types;
    }

    static methodName(raw_src:string):MethodInfo{
        let raw:string=null, args:string=null, ret:string=null, ea:number=0, sa:number=0;
        let info:MethodInfo = { name:null, args:null, ret:null };

        raw = Util.trim(raw_src);

        // risque d'UTF8 / autre dans le nom, quid des regexp;
        // TODO unit test with different encoding
        info.name = raw.substr(
            0,
            sa=raw.indexOf(CONST.LEX.TOKEN.METH_ARG_B));

        args = raw.substr(
            sa+1,
            (ea=raw.indexOf(CONST.LEX.TOKEN.METH_ARG_E))-sa-1)
        info.args = this.type(Util.trim(args));

        ret=raw.substr(ea+1);
        info.ret = this.type(Util.trim(ret))[0];

        return info;
    }


    static fieldReference(src:string, raw_src:string):ModelFieldReference{
        let r:ModelFieldReference = new ModelFieldReference();
        let m:RegExpExecArray = RX.REF_FIELD.exec(src);

//		console.log(src,m);
        if(m==null){
            Logger.debug(raw_src);
            return null;
        }
        if(m.length<4)
            Logger.debug("[!] Instruction : invalid field reference :"+src);

        r.fullname = m[0];
        r.fqcn = OpcodeSmaliParser.fqcn(m[1]);
        r.field = m[2];
        r.name = m[2];
        r._hashcode = src;

        if(m[3][0]==='[')
            r.isArray = true;

        return r;
    }

    static reg(src:string):RegExpExecArray{
        return RX.REF_REG.exec(src);
    }

    static singleVar(src:string):ModelRegisterReference{
        let m:RegExpExecArray = RX.REF_REG.exec(src);

        if(m==null){
            Logger.debug("Invalid opcode detected");
            Logger.debug(src);
            return null;
        }

        if(m.length!=3)
            Logger.debug("[!] Instruction : invalid register reference :"+src);

        // return {t:m[1],i:m[2]};//new CLASS.Variable(m[1],m[2]);
        return new ModelRegisterReference(m[1], m[2]);
    }

    static multiVar(raw_src:string):ModelRegisterReference[]{
        let m:RegExpExecArray = null, v:ModelRegisterReference[] = [];

        m = RX.REF_REG_MULT.exec(raw_src);

        if(m == null) m = RX.REF_REG_INTER.exec(raw_src);

        if(m !== null){
            for(let i=1; i<m.length; i++){
                if(m[i] !== undefined){
                    //console.log(m[i],raw_src);
                    v.push(this.singleVar(m[i]));
                }
            }
        }else{
            m = RX.REF_REG_INV.exec(raw_src);
            if(m !== null) {
                //v.push({t: m[1], i: m[2]});
                v.push(new ModelRegisterReference(m[1], m[2]))
            }else if(Util.trim(raw_src) !== "{}")
                console.log(raw_src,m);
        }

        return v;
    }

    /**
     * TODO : unit test with encoded string
     * @param {String} src
     * @static
     * @function
     * @deprecated
     */
    static stringValue(src:string):string{
        let m = RX.STR_VAL.exec(src);

        if(m.length!=2)
            console.log("[!] Instruction : invalid string value :"+src);

        return m[1];
    }


    /**
     * To find an opcode by its number
     * @param {number} instr Instruction name
     * @return {any} Opcode
     * @static
     * @method
     */
    static findOpcode(byte:number):any{
        for(let op in OPCODE){
            // if(i==10) console.log(instr,OPCODE[op].instr);
            if(byte==OPCODE[op].byte) return OPCODE[op];
        }
        return null;
    }


    /**
     * To find a Dalvik opcode by its literal name
     *
     * @param {string} instr Instruction name
     * @return {any} Opcode
     * @method
     */
    findInContext(instr:string):Nullable<ElixirOpcodeDefinition>{
        for(const op in OPCODE){
            if(instr==OPCODE[op].instr) return OPCODE[op];
        }
        //throw new Error(`Instruction not found (2) : unknown opcode for : ${instr}`);
        return null;
    }

    /**
     *
     * @param src
     * @param raw_src
     * @param src_line
     */
    parse(src:string[], raw_src:string, src_line:number):ModelInstruction{
        let op:ElixirOpcodeDefinition = this.findInContext(src[0]), instr:ModelInstruction = null;
        this.instrCtr++;

        // return UNKNOW instr
        if(op == null) return null;

        if(op.parse != undefined){
            instr = op.parse(src,raw_src.substr(raw_src.indexOf(CONST.LEX.TOKEN.SPACE)),this.tags);
            instr.opcode = op;
            //instr.oline = src_line; // line number into smali file
            instr._raw = raw_src;
        }

        return instr;
        /* if(op.byte == OPCODE.SGET_CHAR.byte)
            console.log("[!] Instr sget-char : "+raw_instr.join(" "));*/
    }

    /**
     *
     * To parse param name is such case:
     *
     * .method parameters(IILjava/lang/String;)V
     *   .param p3, "stringParameter"
     *
     * @param src
     * @param raw_src
     * @param src_line
     */
    static parseParam(src:string[], raw_src:string, src_line:number):any{
        const instr = DalvikInstructionFormat.setstring(src, raw_src, {
            STRING: CONST.TAG.STRING,
            STRING_DECL: CONST.TAG.STRING_DECL
        });
        return { param:instr.left, name:instr.right._value };
    }

    /**
     *
     * To parse param name is such case:
     *
     * .method parameters(IILjava/lang/String;)V
     *   .param p3, "stringParameter"
     *
     * @param src
     * @param raw_src
     * @param src_line
     */
    parseParamInContext(src:string[], raw_src:string, src_line:number):any{
        const instr = DalvikInstructionFormat.setstring(src, raw_src, this.tags);
        return { param:instr.left, name:instr.right._value };
    }
}