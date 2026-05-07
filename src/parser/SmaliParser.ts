import * as _fs_ from 'fs';
import * as _es_ from 'event-stream';


import {CONST} from "../CoreConst.js";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelMethod from "../ModelMethod.js";
import ModelDataBlock from "../ModelDataBlock.js";
import ModelBasicBlock from "../ModelBasicBlock.js";
import ModelCatchStatement from "../ModelCatchStatement.js";
import BusEvent from "../BusEvent.js";
import Bus from "../Bus.js";
import Util from "../Utils.js";
import {Modifier, ModifierFormat} from "../AccessFlags.js";
import ModelClass from "../ModelClass.js";
import * as Log from '../Logger.js';
import {ModelBasicType, ModelObjectType} from "../ModelType.js";
import ModelField from "../ModelField.js";
import {ModelClassReference, ModelFieldReference, ModelRegisterReference} from "../ModelReference.js";
import ModelInstruction from "../ModelInstruction.js";
import {RX} from "../CoreParser.js";
import {ElixirOpcodeDefinition, OPCODE} from "../Opcode.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import DalvikInstructionFormat from "../DalvikInstructionFormat.js";
import {IParser, IParserFeature, IParserOptions, IResults} from "./IParser.js";
import {Buffer} from "buffer";
import {Tag} from "@dexcalibur/dexcalibur-orm";
import {ModelRegister} from "../elixir/ModelRegister.js";
import {AndroidTypes} from "../android/AndroidTypes.js";
import {DataType} from "../types/DataType.js";
import {Dex} from "./DexParser.js";


const SML_MAIN=0;
const SML_METH=1;
const SML_ANNO=2;
const SML_PSWITCH=3;

const ERR_PARSE=0;
const LOG_DBG = false;


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface MatchCounter {
    c:number
}

var Checker = {
    isBasicType: function(c){
        return (CONST.TYPES[c] != undefined);
    },
    isObjectType: function(c){
        return c=="L";
    },
    hasAccess: function(flags:number, access:number){
        return ((flags & access) == access);
    }
    /*
    makeFnHashcode: function(modif,cls,name,args,ret){
        let xargs = "";
        for(let i in args) xargs+="<"+args[i]._hashcode+">";
        return modif._name+"|"+cls.name+"|"+name+"|"+xargs+"|"+ret._hashcode;
    },
    makeFieldHashcode: function(modif,cls,name,type){
        //console.log(type);
        return modif._name+"|"+cls.name+"|"+name+"|"+type._hashcode;
    }*/
};

/**
 *
 * @namespace
 */
export namespace Smali {


    export interface Results extends IResults<Nullable<ModelClass>> {
        ok: Nullable<ModelClass>;
    }

    interface MethodInfo {
        name:string;
        args:(ModelBasicType|ModelObjectType)[];
        ret:ModelBasicType|ModelObjectType;
    }


    export class OpcodeParser
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
            r.fqcn = OpcodeParser.fqcn(m[1]);
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
         * To parse the instruction according to opcode
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
         * Transforms parameter initializing by set string instruction
         *
         * .method parameters(IILjava/lang/String;)V
         *   .param p3, "stringParameter"
         *
         * @param src
         * @param raw_src
         * @param src_line
         */
        parseParamInContext(src:string[], raw_src:string, src_line:number):any {
            const instr = DalvikInstructionFormat.setstring(src, raw_src, this.tags);

            return { param:instr.left, name:instr.right._value };
        }



        parseParamDirective(pLine: string, pMethod:ModelMethod):ModelInstruction {
            const paramRegex = /\.param\s+(p\d+),\s*"([^"]+)"\s*#?\s*([^=\s]+)(?:\s*=\s*(.+))?/;
            const match = pLine.match(paramRegex);

            if (!match) {
                return;
            }

            const [, registerName, paramName, typeSignature, defaultValue] = match;
            const dataType = Dex.DexFile.createTypeFromDalvikString(typeSignature); // this.parseTypeSignature(typeSignature);

            let initialValue: any = undefined;

            console.log(registerName, paramName, typeSignature, defaultValue, pLine);

            if (defaultValue) {
                /*
                initialValue = this.parseInitialValue(defaultValue);

                if(initialValue.kind!="constant") {
                    initialValue = initialValue.value;
                }else {
                    initialValue = undefined;
                }*/
            }

            pMethod.declareParameter(dataType, initialValue, paramName, parseInt(registerName,10) );
        }

        /**
         * Parse une valeur initiale
         */
        parseInitialValue(
            valueStr: string
        ): {kind:"constant"|"null"|"undefined", value?:any } {
            const trimmed = valueStr.trim();

            if (trimmed === 'null') {
                return { kind: 'null' };
            }

            if (trimmed === 'true' || trimmed === 'false') {
                return {
                    kind: 'constant',
                    value: trimmed === 'true'
                };
            }

            if (trimmed.startsWith('0x') || trimmed.startsWith('-0x')) {
                return {
                    kind: 'constant',
                    value: parseInt(trimmed, 16)
                };
            }

            if (trimmed.includes('.') || trimmed.includes('e') || trimmed.includes('E')) {
                return {
                    kind: 'constant',
                    value: parseFloat(trimmed)
                };
            }

            if (/^-?\d+[LSs]?$/.test(trimmed)) {
                const numStr = trimmed.replace(/[LSs]$/, '');
                return {
                    kind: 'constant',
                    value: parseInt(numStr, 10)
                };
            }

            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                return {
                    kind: 'constant',
                    value: trimmed.slice(1, -1)
                };
            }

            return { kind: 'undefined' };
        }

        /*
        parseTypeSignature(pTypeSignature: string):DataType {
            switch (pTypeSignature) {
                case 'V': return AndroidTypes.V;
                case 'Z': return AndroidTypes.Z;
                case 'B': return AndroidTypes.B;
                case 'S': return AndroidTypes.S;
                case 'C': return AndroidTypes.C;
                case 'I': return AndroidTypes.I;
                case 'J': return AndroidTypes.J;
                case 'F': return AndroidTypes.F;
                case 'D': return AndroidTypes.D;
                case 'Ljava/lang/String;': return new AndroidTypes.STRING;
                default:
                    if (pTypeSignature.startsWith('L')) {
                        return AndroidTypes.OBJECT;
                    }
                    if (pTypeSignature.startsWith('[')) {
                        return AndroidTypes.ARRAY;
                    }
                    return AndroidTypes.UNKNOWN;
            }
        }*/
    }

    /**
     * Represent the Smali parser
     * @class
     */
    export class Parser implements IParser<Nullable<ModelClass>>
    {
        FEATURES = [
            IParserFeature.STRUCT
        ];

        UID = "smali_1.0.0";

        FORMAT_NAMES:string[] = ["smali"];

        FILE_EXTENSIONS:string[] = [".smali"];

        inAnnotation:boolean = false;

        ctx:DexcaliburProject = null;
        state:any = null; //  state of the parser
        subject:any = null; // parsed smali file

        obj:ModelClass = null;
        objReady:any = false;

        opcodeParser:Smali.OpcodeParser;

        __tmp_meth:ModelMethod = null;
        __tmp_block:ModelBasicBlock|ModelDataBlock = null;

        __instr_ctr:any = null;

        currentLine:any = null;

        self:any = this;

        constructor(pContext:DexcaliburProject=null){
            if(pContext!=null)
                this.setContext(pContext);
        }

        /**
         * To set the context of this parser
         *
         * @param context
         */
        setContext(context:DexcaliburProject):void{
            this.ctx = context;
            this.opcodeParser = new Smali.OpcodeParser(this.ctx);
        }

        isModifier(name:string):boolean{
            for(let i in CONST.LEX.MODIFIER)
                if(CONST.LEX.MODIFIER[i]==name)
                    return true;
            return false;
        }

        static modifier(pSource:string|string[], pMatch:MatchCounter){

            if(typeof pSource === 'string')
                pSource=pSource.split(CONST.LEX.TOKEN.SPACE);

            let mod:Modifier = null, next:boolean = true;

            //if(src.length<2) return ERR_PARSE;
            for(let i=0; i<pSource.length && next; i++){

                pMatch.c++;

                switch(Util.trim(pSource[i])){
                    case CONST.LEX.MODIFIER.PRIVATE:
                        mod |= Modifier.PRIVATE;
                        break;
                    case CONST.LEX.MODIFIER.PROTECTED:
                        mod |= Modifier.PROTECTED;
                        break;
                    case CONST.LEX.MODIFIER.PUBLIC:
                        mod |= Modifier.PUBLIC;
                        break;
                    case CONST.LEX.MODIFIER.STATIC:
                        mod |= Modifier.STATIC;
                        break;
                    case CONST.LEX.MODIFIER.VOLATILE:
                        mod |= Modifier.VOLATILE;
                        break;
                    case CONST.LEX.MODIFIER.ABSTRACT:
                        mod |= Modifier.ABSTRACT;
                        break;
                    case CONST.LEX.MODIFIER.FINAL:
                        mod |= Modifier.FINAL;
                        break;
                    case CONST.LEX.MODIFIER.CONSTR:
                        mod |= Modifier.CONSTRUCT;
                        break;
                    case CONST.LEX.MODIFIER.SYNTHETIC:
                        mod |= Modifier.SYNTH;
                        break;
                    case CONST.LEX.MODIFIER.ENUM:
                        mod |= Modifier.ENUM;
                        break;
                    case CONST.LEX.MODIFIER.TRANSIENT:
                        mod |= Modifier.TRANS;
                        break;
                    case CONST.LEX.MODIFIER.DECLSYNC:
                        mod |= Modifier.DECLSYNC;
                        break;
                    case CONST.LEX.MODIFIER.BRIDGE:
                        mod |= Modifier.BRIDGE;
                        break;
                    case CONST.LEX.MODIFIER.VARARG:
                        mod |= Modifier.VARARGS;
                        break;
                    case CONST.LEX.MODIFIER.NATIVE:
                        mod |= Modifier.NATIVE;
                        break;
                    case CONST.LEX.MODIFIER.INTERFACE:
                        mod |= Modifier.INTERFACE;
                        break;
                    case CONST.LEX.MODIFIER.ANNOTATION: // todo : move
                        mod |= Modifier.ANNOTATION;
                        break;
                    case CONST.LEX.MODIFIER.STRICTFP:
                        mod |= Modifier.STRICTFP;
                        break;
                    case CONST.LEX.MODIFIER.SYNCHRONIZED:
                        mod |= Modifier.SYNC;
                        break;
                    default:
                        next=false;
                        pMatch.c--;
                        break;
                }
            }

            if((Checker.hasAccess(mod,Modifier.PRIVATE)
                ||Checker.hasAccess(mod,Modifier.PROTECTED))===false){
                mod |= Modifier.PUBLIC;
            }

            Logger.debug("[parser::modifier] "+ModifierFormat.sprintModifier(mod));

            return mod;
        }

        /**
         * To transform a string representing a FQCN from  smali notation to java notation
         * @param src
         * @return {string}
         * @method
         */
        static fqcn(src:string|string[]):string{
            if(src.length==0)
                throw new Error('[SMALI PARSER] Empty FQCN detected ( L; or L/; )');

            let raw:string;
            raw = (src instanceof Array)? src[0] : src;

            if(raw=='L;' || raw=='L/;')
                throw new Error('[SMALI PARSER] Empty FQCN detected ( L; or L/; )');

            // remove additional chars : "L"  at begin and ";" at end.
            // console.log("PARSER::FQCN > ",src);
            let s=raw.substr(1,raw.length-2);
            while(s.indexOf("/")>-1) s=s.replace("/",".");

            Logger.debug("[parser::fqcn] "+s);
            return s;
        }

        /**
         * To parse and to format a file path extracted from smali file
         *
         * @param {string} src
         * @return {string} Formatted file path
         * @method
         */
        fspath(pSource:string):string{
            let s:string = pSource;
            s = s.substr(s.indexOf(CONST.LEX.TOKEN.DELIMITER)+1);
            s = s.substr(0, s.indexOf(CONST.LEX.TOKEN.DELIMITER));
            Logger.debug("[parser::fspath] "+s);
            return s;
        }

        // char
        /*basicTypes(c){
            return CONST.TYPES[c];
        }*/

        /**
         * To create a ModelClass instance from a class reference
         * such as 'L/java/lang/String;'
         *
         * @param src
         */
        class(pInStr:string|string[]):ModelClass{
            let javaFqcn:string=null, end:number=-1; //match:number=0;

            Logger.debug("---------------------------------------------\n[parser::class] Start ");

            //console.log("[?] Instruction parsed : "+OPCODE.CTR);
            if(typeof pInStr === 'string')
                pInStr=Util.trim(pInStr).split(CONST.LEX.TOKEN.SPACE);

            if(pInStr[0]==CONST.LEX.STRUCT.CLASS)
                pInStr.shift();

            this.obj = new ModelClass();
            // parse modifiers
            let match2:MatchCounter={c:0};
            this.obj.modifiers = Parser.modifier(pInStr, match2);

            // clean src with identified modifier
            for(let i:number=0; i<match2.c; i++)
                pInStr.shift();

            // parse nam
            javaFqcn = Parser.fqcn(pInStr);
            end = javaFqcn.lastIndexOf(".");
            this.obj.name = javaFqcn;
            //this.obj.fqcn = this.obj.name;
            this.obj.package = javaFqcn.substr(0,end);
            this.obj.simpleName = javaFqcn.substr(end+1);

            /*if(this.obj.name.indexOf(CONST.LEX.TOKEN.INNER_FQCN)>-1){
                //this.obj.simpleName = this.obj.simpleName.substr(this.obj.simpleName.indexOf(CONST.LEX.TOKEN.INNER_FQCN)+1);
                this.obj.innerName = this.obj.simpleName.substr(this.obj.simpleName.indexOf(CONST.LEX.TOKEN.INNER_FQCN)+1);
                this.obj.innerClass = true;
                this.obj.enclosingClass = new ModelClassReference(
                    this.obj.name.substr(0,this.obj.name.indexOf(CONST.LEX.TOKEN.INNER_FQCN)));
            }*/

            if(this.obj.name.indexOf(CONST.LEX.TOKEN.INNER_FQCN)>-1){
                //this.obj.simpleName = this.obj.simpleName.substr(this.obj.simpleName.indexOf(CONST.LEX.TOKEN.INNER_FQCN)+1);
                this.obj.innerName = this.obj.simpleName.substr(this.obj.simpleName.lastIndexOf(CONST.LEX.TOKEN.INNER_FQCN)+1);
                this.obj.innerClass = true;
                this.obj.enclosingClass = new ModelClassReference(
                    this.obj.name.substr(0,this.obj.name.lastIndexOf(CONST.LEX.TOKEN.INNER_FQCN)));
            }

            //this.obj._hashcode = this.obj.hashCode();

            Logger.debug("[parser::class] End\n---------------------------------------------");
            return this.obj;
        }


        static class(pInStr:string|string[]):ModelClass{
            let javaFqcn:string=null, end:number=-1, match:MatchCounter={c:0};
            let clz:ModelClass;

            Logger.debug("---------------------------------------------\n[parser::class] Start ");

            //console.log("[?] Instruction parsed : "+OPCODE.CTR);
            if(typeof pInStr === 'string')
                pInStr=Util.trim(pInStr).split(CONST.LEX.TOKEN.SPACE);

            if(pInStr[0]==CONST.LEX.STRUCT.CLASS)
                pInStr.shift();

            clz = new ModelClass();
            // parse modifiers
            clz.modifiers = Parser.modifier(pInStr, match);

            // clean src with identified modifier
            for(let i:number=0; i<match.c; i++)
                pInStr.shift();

            // parse nam
            javaFqcn = Parser.fqcn(pInStr);
            end = javaFqcn.lastIndexOf(".");
            clz.name = javaFqcn;
            //this.obj.fqcn = this.obj.name;
            clz.package = javaFqcn.substr(0,end);
            clz.simpleName = javaFqcn.substr(end+1);


            if(clz.name.indexOf(CONST.LEX.TOKEN.INNER_FQCN)>-1){
                clz.innerName = clz.simpleName.substr(clz.simpleName.lastIndexOf(CONST.LEX.TOKEN.INNER_FQCN)+1);
                clz.innerClass = true;
                clz.enclosingClass = new ModelClassReference(
                    clz.name.substr(0,clz.name.lastIndexOf(CONST.LEX.TOKEN.INNER_FQCN)));
            }


            Logger.debug("[parser::class] End\n---------------------------------------------");
            return clz;
        }


        type(src:string):(ModelObjectType|ModelBasicType)[]{
            let i:number=0,l:number=-1,types:(ModelObjectType|ModelBasicType)[]=[],fqn:string=null,isArray:boolean=false;

            // remove potential whitespaces
            src = Util.trim(src, true);

            while(i<src.length){
                if(src[i]==CONST.LEX.TOKEN.ARRAY){
                    isArray=true;
                    i++;
                    continue;
                }

                if(src[i]==CONST.LEX.TOKEN.OBJREF){
                    l=src.indexOf(";",i);
                    fqn=Parser.fqcn(src.substr(i,l-i+1));
                    types.push(new ModelObjectType(fqn, isArray));
                    i=l+1;
                    isArray=false;
                    continue;

                }else if(Checker.isBasicType(src[i])){
                    types.push(new ModelBasicType(src[i], isArray));
                    i++;
                    isArray = false;
                    continue;
                }
                else{
                    Logger.info("[SMALI PARSER] Unknow type : "+src[i]+" (in "+src+")");
                    break;
                }
            }

            return types;
        }


        /**
         * To parse a method header and update method currently parsed
         */
        methodHeader(pSource:string[], pLineLocation:number){
            let match:MatchCounter = {c:0};
            let mod:Modifier = Parser.modifier(pSource, match), raw=null, tmp=null, args=null, ret=null, sa=0, ea=0;
            let argTypes = null;

            // clean src with identified modifier
            for(let i=0; i<match.c; i++) pSource.shift();

            if(pSource.length > 1){
                Logger.info("[SMALI PARSER] Method has more modifiers");
                // Logger.debug(pSource.join(' '), ModifierFormat.sprintModifier(mod));
            }

            this.__tmp_meth.modifiers = mod;
            raw = Util.trim(pSource[pSource.length-1]);

            // TODO : risque d'UTF8 / autre dans le nom, quid des regexp;
            tmp = raw.substr(0,sa=raw.indexOf(CONST.LEX.TOKEN.METH_ARG_B));
            this.__tmp_meth.name = tmp;

            args = raw.substr(sa+1,(ea=raw.indexOf(CONST.LEX.TOKEN.METH_ARG_E))-sa-1)
            argTypes = this.type(Util.trim(args));
            this.__tmp_meth.args = argTypes;

            ret=raw.substr(ea+1);
            ret = this.type(Util.trim(ret))
            if(ret.length == 0)
                console.log("[!] this.method error : return type of '"+tmp+"("+args+")' cannot be parsed.")
            //exit(0);

            this.__tmp_meth.enclosingClass = this.obj;
            this.__tmp_meth.ret = ret[0];

            //this.__tmp_meth._hashcode = this.__tmp_meth.hashCode();
        }

        instr(src:string[], raw_src:string, src_line:number):ModelInstruction{
            let inst:ModelInstruction = null;//new Instruction();

            inst = this.opcodeParser.parse(src,raw_src, src_line);

            if(inst != null){
                //console.log(inst);
            }
            //inst.operands = inst.opcode.parse(src);
            //console.log('"'+src[0]+'"',inst.opcode);
            // todo
            return inst;
        }

        field(src_arr:string[], src_line:number){
            let f:ModelField=new ModelField(), type:(ModelBasicType|ModelObjectType)[]=null, tmp:string[]=null;
            let match:MatchCounter = {c:0};

            // parse modifiers
            f.modifiers = Parser.modifier(src_arr, match);

            // clean src with identified modifier
            for(let i=0; i<match.c; i++) src_arr.shift();
            // parse name and type
            tmp=src_arr[0].split(":");

            f.name=tmp[0];

            type=this.type(tmp[1]);
            if(type.length>0) f.type=type[0];

            f.enclosingClass = this.obj;
            //f._hashcode = f.hashCode();//Checker.makeFieldHashcode(f.modifiers,this.obj,f.name,f.type);

            f.signature();
            //f.oline = src_line;

            Logger.debug("[parser::field] Hashcode : "+f._hashcode);

            src_arr.shift();

            // parse value if available
            if(src_arr.length>0){
                // TODO : parse value
                let fValue = this.parseValue(src_arr.pop(), f.type.name);
                f.setValue(fValue);
            }
            return f;
        }

        parseValue(value, type) {
            // Source: https://github.com/JesusFreke/smali/blob/master/smali/src/main/jflex/smaliLexer.jflex#L203
            switch(type) {
                case CONST.TYPES.I:
                case CONST.TYPES.B:
                case CONST.TYPES.F:
                case CONST.TYPES.D:
                case CONST.TYPES.S:
                case CONST.TYPES.J:
                    let numberFromValue = Number(value);
                    if (isNaN(numberFromValue) && value.length > 0) {
                        numberFromValue = Number(value.substring(0, value.length - 1));
                        if (isNaN(numberFromValue)) {
                            if ((value === 'NaN') || (value.substring(0, value.length - 1) === 'NaN')) {
                                return NaN;
                            }
                            else {
                                return value;
                            }
                        }
                    }
                    return numberFromValue;
                case CONST.TYPES.Z:
                    if (value === "true") {
                        return true;
                    }
                    if (value === "false") {
                        return false;
                    }
                    else {
                        return value
                    }
                default:
                    if (value === "null") {
                        return null;
                    }
                    return value;
            }
        }

        getBehaviorFor(pElement:string):any{
            let mainBus:Bus = this.ctx.bus;
            const standard = {
                datablock: function(pMethod:ModelMethod, pBlock:ModelDataBlock){
                    mainBus.send(new BusEvent({
                        type: "disass.datablock.new",
                        data: pBlock
                    }));
                }
            };

            return standard[pElement];
        }

        appendBlockTo( pMethod:ModelMethod, pBlock:ModelDataBlock|ModelBasicBlock, pCallback:any=null){
            let self=this;

            if(pBlock instanceof ModelBasicBlock){
                pMethod.appendBasicBlock(pBlock, null);
            }
            // else if ModelDataBlock
            else{
                pMethod.appendDataBlock(pBlock, this.getBehaviorFor('datablock'));
            }
        }

        method(src:string[], raw_src:string, src_line:number){
            if(this.state != SML_METH) return null;

            let sml:string[]=src, hdl:any=null, catchStmt=null, tmp:any=null;


            switch(Util.trim(sml[0])){
                case CONST.LEX.STRUCT.METHOD_BEG:
                    Logger.debug("---------------------------------------------\n[parser::method] Start ");
                    this.__tmp_meth = new ModelMethod();
                    sml.shift();

                    this.methodHeader(sml, src_line);

                    this.inAnnotation = false;
                    this.__tmp_block = new ModelBasicBlock();
                    this.__instr_ctr = 0;
                    break;
                case CONST.LEX.STRUCT.LOCALS:
                    this.__tmp_meth.locals = parseInt(sml[1],10);
                    break;
                case CONST.LEX.STRUCT.PARAMS:
                    // this.__tmp_meth.params = parseInt(sml[1],10);
                    console.log("NEW SmaliParser called");

                    try{
                        const paramDir = this.opcodeParser.parseParamDirective(raw_src, this.__tmp_meth);



                        this.__tmp_meth.params.push(
                            this.opcodeParser.parseParamInContext(sml, raw_src, src_line)// TODO : sml[1] replaced by sml[]
                        );
                    }catch(e){
                        console.log(e.stack);
                    }


                    break;
                case CONST.LEX.STRUCT.REG:
                    this.__tmp_meth.registers = parseInt(sml[1],10);
                    break;
                case ".prologue":
                    break;
                case CONST.LEX.STRUCT.LINE:

                    // .line is just a metadata associated to an instruction
                    /*if(this.__tmp_block != null && this.__tmp_block.stack.length > 0){

                        this.__tmp_meth.appendBlock(this.__tmp_block, this.__appendBlock_callback);
                        this.__tmp_block = new ModelBasicBlock();
                    }*/
                    //  && this.__tmp_block.line != null

                    // to set line number extract from basic block metadata
                    this.__tmp_block.line = parseInt(sml[1],10);
                    this.currentLine = parseInt(sml[1],10);

                    // source line number
                    //this.__tmp_block.srcln = parseInt(sml[1],10);

                    break;
                case CONST.LEX.STRUCT.PSWITCH:

                    if(sml[1] != undefined){

                        (this.__tmp_block as ModelBasicBlock).setupPackedSwitchStatement(parseInt(sml[1],16));
                    }

                    break;
                case CONST.LEX.STRUCT.SSWITCH:

                    //if(this.__tmp_block instanceof  ModelBasicBlock)
                    (this.__tmp_block as ModelBasicBlock).setupSparseSwitchStatement();

                    break;
                case CONST.LEX.STRUCT.ARRAY:

                    (this.__tmp_block as ModelDataBlock).setDataWidth(parseInt(sml[1],10));

                    break;
                case CONST.LEX.STRUCT.END:

                    if(sml[1]!=undefined && sml[1]==CONST.LEX.STRUCT.METHOD_NAME){
                        //hdl = this.__tmp_meth._hashcode;
                        this.state=SML_MAIN;
                        this.appendBlockTo( this.__tmp_meth, this.__tmp_block);

                        this.obj.methods[ this.__tmp_meth.signature()] = this.__tmp_meth;
                        this.obj._methCount++;
                        Logger.debug("[parser::method] End\n---------------------------------------------");
                    }else if(sml[1]!=undefined && sml[1]==CONST.LEX.STRUCT.ANNOTATION_NAME){
                        //this.__tmp_meth.__$in_annot = false;
                        this.inAnnotation = false;
                    }/*
                else if(sml[1]!=undefined && sml[1]==CONST.LEX.STRUCT.PSWITCH_NAME){
                    // nothing to do
                    //console.log("End of packed switch");
                }xs
                else if(sml[1]!=undefined && sml[1]==CONST.LEX.STRUCT.ARRAY_NAME){

                }*/
                    break;
                case CONST.LEX.STRUCT.ANNOT_BEG:
                    // ignore
                    // this.__tmp_meth.__$in_annot = true;
                    this.inAnnotation = true;
                    break;
                default:
                    if(this.inAnnotation){ //this.__tmp_meth.__$in_annot){
                        // ignore
                        break;
                    }

                    if(sml[0].indexOf(':cond_')>-1){
                        if(this.__tmp_block instanceof ModelDataBlock || this.__tmp_block.stack.length>0){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                            this.__tmp_block = new ModelBasicBlock();
                        }

                        //this.__tmp_block.tag = sml[0];

                        (this.__tmp_block as ModelBasicBlock).setAsConditionalBlock(sml[0].split('_')[1]);

                    }else if(sml[0].indexOf(':goto_')>-1){
                        if(this.__tmp_block instanceof ModelDataBlock){
                            if(this.__tmp_block.getByteWidth()>0){
                                this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                                this.__tmp_block = new ModelBasicBlock();
                                (this.__tmp_block as ModelBasicBlock).setAsGotoBlock(sml[0].split('_')[1]);
                            }else{
                                /*
                                :array_XX
                                :goto_AA <---- this case
                                .array-data B
                                 */
                                // ignore
                            }
                        }
                        else if(this.__tmp_block.stack.length>0){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                            this.__tmp_block = new ModelBasicBlock();
                            (this.__tmp_block as ModelBasicBlock).setAsGotoBlock(sml[0].split('_')[1]);
                        }else{
                            (this.__tmp_block as ModelBasicBlock).setAsGotoBlock(sml[0].split('_')[1]);
                        }
                        //this.__tmp_block.tag = sml[0];

                    }
                    else if(sml[0].indexOf(':try_start')>-1){
                        if(this.__tmp_block instanceof ModelDataBlock || this.__tmp_block.stack.length>0){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                            this.__tmp_block = new ModelBasicBlock();
                        }
                        //   this.__tmp_block.tag = sml[0];

                        (this.__tmp_block as ModelBasicBlock).setAsTryBlock(sml[0]);

                    }
                    else if(sml[0].indexOf(':try_end')>-1){

                        (this.__tmp_block as ModelBasicBlock).setTryEndName(sml[0]);

                        if(this.__tmp_block != null){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                            this.__tmp_block = new ModelBasicBlock();
                        }
                    }
                    // >-1
                    else if(sml[0].indexOf(CONST.LEX.LABEL.PSWITCH_DATA)==0 || sml[0].indexOf(CONST.LEX.LABEL.SSWITCH_DATA)==0){

                        if(this.__tmp_block != null){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                            this.__tmp_block = new ModelBasicBlock();
                        }

                        (this.__tmp_block as ModelBasicBlock).setAsSwitchStatement(sml[0]);
                    }
                    // >-1
                    else if(sml[0].indexOf(CONST.LEX.LABEL.PSWITCH)==0){


                        if(this.__tmp_block instanceof  ModelBasicBlock) {
                            if (this.__tmp_block.isSwitchStatement()) {
                                this.__tmp_block.switch.appendCase(sml[0]);
                            } else {

                                this.__tmp_block.setAsSwitchCase(sml[0]);
                            }
                        }
                    }
                    // >-1
                    else if(sml[0].indexOf(CONST.LEX.LABEL.SSWITCH)==0){

                        if(this.__tmp_block != null
                            && (this.__tmp_block instanceof ModelDataBlock
                                || this.__tmp_block.stack.length > 0)){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                            this.__tmp_block = new ModelBasicBlock();
                        }

                        (this.__tmp_block as ModelBasicBlock).setAsSwitchCase(sml[0]);
                    }
                    else if(sml.length > 2 && sml[2].indexOf(CONST.LEX.LABEL.SSWITCH)>-1 && sml[0].indexOf("p")==-1){

                        if(this.__tmp_block instanceof  ModelBasicBlock){
                            if(this.__tmp_block.isSwitchStatement()){
                                this.__tmp_block.switch.appendCase(sml[0],sml[2]);
                            }
                        }

                    }
                    else if(sml[0].indexOf(CONST.LEX.LABEL.ARRAY)>-1){
                        // check if tmp block not empty (data or bb)
                        if(this.__tmp_block != null){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                        }
                        this.__tmp_block = new ModelDataBlock();
                        this.__tmp_block.name = sml[0];
                    }
                    else if(sml[0].indexOf(CONST.LEX.STRUCT.CATCH_ALL)>-1){
                        catchStmt = new ModelCatchStatement();
                        catchStmt.setTryStart(sml[1].substr(1,sml[1].length));
                        catchStmt.setTryEnd(sml[3].substr(0,sml[3].length-1));
                        catchStmt.setTarget(sml[4]);


                        tmp = this.__tmp_meth.getBasicBlocks();
                        tmp[tmp.length-1].addCatchStatement(catchStmt);

                        //this.__tmp_block.addCatchStatement(catchStmt);
                    }
                    else if(sml[0].indexOf(CONST.LEX.STRUCT.CATCH)>-1){
                        catchStmt = new ModelCatchStatement();
                        catchStmt.setException(this.type(sml[1])[0]);
                        catchStmt.setTryStart(sml[2].substr(1,sml[2].length));
                        catchStmt.setTryEnd(sml[4].substr(0,sml[4].length-1));
                        catchStmt.setTarget(sml[5]);

                        tmp = this.__tmp_meth.getBasicBlocks();
                        tmp[tmp.length-1].addCatchStatement(catchStmt);
                        /*if(this.__tmp_block != null){
                            this.__tmp_meth.appendBlock(this.__tmp_block, this.__appendBlock_callback);
                            this.__tmp_block = new ModelBasicBlock();
                        }

                        this.__tmp_block.addCatchStatement(catchStmt);*/
                    }
                    else if(sml[0].indexOf(CONST.LEX.LABEL.CATCH)>-1){
                        if(this.__tmp_block != null
                            && ( this.__tmp_block instanceof ModelDataBlock
                                || this.__tmp_block.stack.length > 0 )){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                            this.__tmp_block = new ModelBasicBlock();
                        }

                        (this.__tmp_block as ModelBasicBlock).setCatchCond(raw_src);
                    }
                    else if(sml[0].indexOf(':catchall')>-1){

                        if(this.__tmp_block != null
                            && ( this.__tmp_block instanceof ModelDataBlock
                                || this.__tmp_block.stack.length > 0 )){
                            this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                            this.__tmp_block = new ModelBasicBlock();
                        }

                        (this.__tmp_block as ModelBasicBlock).setAsCatchBlock(sml[0]);

                    }
                    else if(this.__tmp_block instanceof ModelDataBlock){

                        hdl = CONST.RE.ARRAY_VALUE.exec(sml[0]);
                        if(hdl ==null) break;
                        this.__tmp_block.pushData("0x"+hdl[2], (hdl[1] != undefined), (hdl[3]=='s'));
                    }
                    else{

                        if(this.__tmp_block instanceof ModelDataBlock) console.log("Error : DataBlock instead of BasicBlock",this.__tmp_meth);
                        if(this.__tmp_block == null) console.log("Error : tmpBlock is null",this.__tmp_meth);
                        hdl = this.instr(sml,raw_src,src_line);


                        if(hdl !== null){

                            this.__instr_ctr++;
                            hdl.offset = this.__instr_ctr;
                            hdl.oline = this.__instr_ctr;
                            if(this.currentLine != null){
                                hdl.iline = this.currentLine;
                                this.currentLine = null;
                            }
                            this.__tmp_block.stack.push(hdl);

                            if(hdl.opcode.type == CONST.INSTR_TYPE.IF || hdl.opcode.type == CONST.INSTR_TYPE.GOTO ) {


                                if(this.__tmp_block instanceof ModelDataBlock || this.__tmp_block.stack.length>0){
                                    this.appendBlockTo( this.__tmp_meth, this.__tmp_block);
                                    this.__tmp_block = new ModelBasicBlock();
                                }

                            }
                        }


                        // add end of basic block on If / Goto
                        /*                    else if(this.isJumpInstruction(sml)){
                                                if(this.__tmp_block instanceof ModelDataBlock || this.__tmp_block.stack.length>0){
                                                    this.__tmp_meth.appendBlock(this.__tmp_block, this.__appendBlock_callback);
                                                    this.__tmp_block = new ModelBasicBlock();
                                                }

                                                if(this.__tmp_block == null) console.log("Error : tmpBlock is null",this.__tmp_meth);
                                                hdl = this.instr(sml,raw_src,src_line);

                                                if(hdl !== null){
                                                    this.__instr_ctr++;
                                                    hdl.offset = this.__instr_ctr;
                                                    hdl.oline = this.__instr_ctr;
                                                    this.__tmp_block.stack.push(hdl);
                                                }
                                                //this.__tmp_block.tag = sml[0];
                                                //this.__tmp_block.setAsGotoBlock(sml[0].split('_')[1]);
                                            }*/

                    }



                    break;
            }

            return true;
        }

        annotation(pSource:string|string[]):void{
            if(this.state != SML_ANNO) return null;

            let sml:string[]=[];

            sml = (Array.isArray(pSource)==false)?
                (pSource as string).split(CONST.LEX.TOKEN.SPACE)
                : (pSource as string[])  ;

            // search lexeme
            switch(Util.trim(sml[0])){
                case CONST.LEX.STRUCT.END:
                    if(sml[1]!=undefined && sml[1]=="annotation"){
                        this.state=SML_MAIN;
                    }
                    break;
            }
            //console.log("[!] this.annotation not implemented");
        }

        parse(pSource:string, pTags:Tag[] = []):ModelClass{
            let lines:string[]=pSource.split("\n"), line:string=null, sml:string[]=null, obj:any=null;

            for(let l:number=0; l<lines.length; l++){
                line=Util.trim(lines[l]);
                if(line.length==0){
                    continue;
                }
                sml=line.split(CONST.LEX.TOKEN.SPACE);

                switch(sml[0]){
                    case CONST.LEX.STRUCT.CLASS:
                        sml.shift();
                        this.obj = Parser.class(sml);
                        break;
                    case CONST.LEX.STRUCT.IMPLEMENTS:
                        sml.shift();
                        this.obj.implements.push(Parser.fqcn(sml[0]));
                        break;
                    case CONST.LEX.STRUCT.SUPER:
                        sml.shift();
                        this.obj.extends = new ModelClassReference(Parser.fqcn(sml[0]));
                        break;
                    case CONST.LEX.STRUCT.SRC:
                        this.obj.source = this.fspath(sml[1]);
                        break;
                    case CONST.LEX.STRUCT.FIELD:
                        sml.shift();
                        obj=this.field(sml,l);
                        // use an internal name which combine visibility and field name
                        //this.obj.fields[obj._hashcode] = obj;
                        this.obj.fields[obj.signature()] = obj;
                        this.obj._fieldCount++;

                        break;
                    case CONST.LEX.STRUCT.METHOD_BEG:
                        this.state = SML_METH;
                        this.method(sml,line,l);
                        break;
                    case CONST.LEX.STRUCT.ANNOT_BEG:
                        if(this.state != SML_METH){
                            this.state = SML_ANNO;
                            this.annotation(sml);
                        }
                        break;
                    default:
                        switch(this.state){
                            case SML_METH:
                                this.method(sml,line,l);
                                break;
                            case SML_PSWITCH:
                                //this.pswitch(sml,line,l);
                                Logger.error("[SMALI PARSER] Invalid state detceted : SML_PSWITCH")
                                break;
                            case SML_ANNO:
                                this.annotation(sml);
                                break;
                        }
                        break;
                }
            }

            for(let k in this.obj.methods){
                pTags.map(t => this.obj.methods[k].addTag(t));
            }
            for(let k in this.obj.fields){
                pTags.map(t => this.obj.fields[k].addTag(t));
            }

            return this.obj;
        }

        /**
         *
         * @param pBuffer
         * @param pOffset
         */
        async fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:IParserOptions = {encoding:'utf-8', raw:true, tags:[]}):Promise<Smali.Results> {
            if(pOptions.tags==null) pOptions.tags = [];

            let res = { ok:null, invalid:[] };
            try{
                res.ok = this.parse( ((pBuffer as Uint8Array).slice(pOffset) as Buffer).toString(pOptions.encoding), pOptions.tags);

                pOptions.tags.map(t => {
                    res.ok.addTag(t);
                });
            }catch(e){
                res.ok = null;
                res.invalid.push(e);
            }

            return res;
        }

        parseStream( pFilePath:string, pEncoding, pCallback){

            let _self = this, rs=null, stream=null;
            _self.obj = null;
            _self.objReady = false;

            stream =_fs_.createReadStream(pFilePath)
                .pipe(_es_.split())
                .pipe(_es_.mapSync(function(line){

                        // pause the readstream
                        stream.pause();


                        // process line here and call s.resume() when rdy
                        // function below was for logging memory usage
                        console.log(line);

                        // resume the readstream, possibly from a callback
                        stream.resume();
                    })
                        .on('error', function(err){
                            console.log('Error while reading file.', err);
                        })
                        .on('end', function(){
                            console.log('Read entire file.')
                        })
                );

        }

        description = "Smali file";
    }


}

