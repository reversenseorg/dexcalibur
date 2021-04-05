import * as _fs_ from 'fs';
import * as _es_ from 'event-stream';


import {CONST} from "./CoreConst";
import DexcaliburProject from "./DexcaliburProject";
import ModelMethod from "./ModelMethod";
import ModelDataBlock from "./ModelDataBlock";
import ModelBasicBlock from "./ModelBasicBlock";
import ModelCatchStatement from "./ModelCatchStatement";
import Event from "./Event";
import Bus from "./Bus";
import Util from "./Utils";
import {Modifier, ModifierFormat} from "./AccessFlags";
import ModelClass from "./ModelClass";
import * as Log from './Logger';
import {ModelBasicType, ModelObjectType} from "./ModelType";
import ModelField from "./ModelField";
import {ModelClassReference} from "./ModelReference";
import OpcodeSmaliParser from "./OpcodeSmaliParser";
import ModelInstruction from "./ModelInstruction";


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
 * Represent the Smali parser 
 * @class
 */
export default class SmaliParser
{
    inAnnotation:boolean = false;

    ctx:DexcaliburProject = null;
    state:any = null; //  state of the parser
    subject:any = null; // parsed smali file

    obj:ModelClass = null;
    objReady:any = false;

    __tmp_meth:ModelMethod = null;
    __tmp_block:ModelBasicBlock|ModelDataBlock = null;

    __instr_ctr:any = null;
    __instr_line:any = null;

    currentLine:any = null;

    self:any = this;

    constructor(context:DexcaliburProject=null){
        this.ctx = context;
    }


    setContext(context:DexcaliburProject):void{
        this.ctx = context;
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
        //console.log(src);
        // parse modifiers
        let match2:MatchCounter={c:0};
        this.obj.modifiers = SmaliParser.modifier(pInStr, match2);
        //console.log(src);


        // clean src with identified modifier
        for(let i:number=0; i<match2.c; i++)
            pInStr.shift();

        // console.log(src);
        // parse nam
        javaFqcn = SmaliParser.fqcn(pInStr);
        end = javaFqcn.lastIndexOf(".");
        this.obj.name = javaFqcn;
        //this.obj.fqcn = this.obj.name;
        this.obj.package = javaFqcn.substr(0,end);
        this.obj.simpleName = javaFqcn.substr(end+1);
        if(this.obj.name.indexOf(CONST.LEX.TOKEN.INNER_FQCN)>-1){
            this.obj.simpleName = this.obj.simpleName.substr(this.obj.simpleName.indexOf(CONST.LEX.TOKEN.INNER_FQCN)+1);
            this.obj.innerClass = true;
            this.obj.enclosingClass = new ModelClassReference(
                this.obj.name.substr(0,this.obj.name.indexOf(CONST.LEX.TOKEN.INNER_FQCN)));
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
        //console.log(src);
        // parse modifiers
        clz.modifiers = SmaliParser.modifier(pInStr, match);
        //console.log(src);

        // clean src with identified modifier
        for(let i:number=0; i<match.c; i++)
            pInStr.shift();

        // console.log(src);
        // parse nam
        javaFqcn = SmaliParser.fqcn(pInStr);
        end = javaFqcn.lastIndexOf(".");
        clz.name = javaFqcn;
        //this.obj.fqcn = this.obj.name;
        clz.package = javaFqcn.substr(0,end);
        clz.simpleName = javaFqcn.substr(end+1);
        if(clz.name.indexOf(CONST.LEX.TOKEN.INNER_FQCN)>-1){
            clz.simpleName = clz.simpleName.substr(clz.simpleName.indexOf(CONST.LEX.TOKEN.INNER_FQCN)+1);
            clz.innerClass = true;
            clz.enclosingClass = new ModelClassReference(
                clz.name.substr(0,clz.name.indexOf(CONST.LEX.TOKEN.INNER_FQCN)));
        }

        //this.obj._hashcode = this.obj.hashCode();

        Logger.debug("[parser::class] End\n---------------------------------------------");
        return clz;
    }


    type(src:string):(ModelObjectType|ModelBasicType)[]{
        let i:number=0,l:number=-1,types:(ModelObjectType|ModelBasicType)[]=[],fqn:string=null,isArray:boolean=false;

        while(i<src.length){
            if(src[i]==CONST.LEX.TOKEN.ARRAY){
                isArray=true;
                i++;
                continue;
            }

            if(src[i]==CONST.LEX.TOKEN.OBJREF){
                l=src.indexOf(";",i);
                fqn=SmaliParser.fqcn(src.substr(i,l-i+1));
                //console.log(fqn);
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
        let mod:Modifier = SmaliParser.modifier(pSource, match), raw=null, tmp=null, args=null, ret=null, sa=0, ea=0;
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

        inst = OpcodeSmaliParser.parse(src,raw_src, src_line);

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
        f.modifiers = SmaliParser.modifier(src_arr, match);
        //console.log(f.modifiers);

        // clean src with identified modifier
        for(let i=0; i<match.c; i++) src_arr.shift();
        // parse name and type
        tmp=src_arr[0].split(":");
        
        f.name=tmp[0];

        type=this.type(tmp[1]);
        if(type.length>0) f.type=type[0];

        //console.log(type.type[0]._hashcode);

        f.enclosingClass = this.obj;
        //f._hashcode = f.hashCode();//Checker.makeFieldHashcode(f.modifiers,this.obj,f.name,f.type);
        
        f.signature();
        //f.oline = src_line;

        Logger.debug("[parser::field] Hashcode : "+f._hashcode);

        src_arr.shift();

        // parse value if available
        if(src_arr.length>0){
            // TODO : parse value
            f.setValue(src_arr.pop());
        }
        return f;
    }

    getBehaviorFor(pElement:string):any{
        let mainBus:Bus = this.ctx.bus;
        const standard = {
            datablock: function(pMethod:ModelMethod, pBlock:ModelDataBlock){
                mainBus.send(new Event({
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
                this.__tmp_meth.params.push(
                    OpcodeSmaliParser.parseParam(sml, raw_src, src_line)// TODO : sml[1] replaced by sml[]
                );
                
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
                            //   console.log(sml);
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

                    //console.log(sml);
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

    parse(pSource:string):ModelClass{
        let lines:string[]=pSource.split("\n"), line:string=null, sml:string[]=null, obj:any=null;
    
        //console.log(ls);
        for(let l:number=0; l<lines.length; l++){
            line=Util.trim(lines[l]);
            if(line.length==0){
                continue;
            }
            sml=line.split(CONST.LEX.TOKEN.SPACE);

            switch(sml[0]){
                case CONST.LEX.STRUCT.CLASS:
                    sml.shift();
                    this.obj = SmaliParser.class(sml);
                    break;
                case CONST.LEX.STRUCT.IMPLEMENTS:
                    sml.shift();
                    this.obj.implements.push(SmaliParser.fqcn(sml[0]));
                    break;
                case CONST.LEX.STRUCT.SUPER:
                    sml.shift();
                    this.obj.extends = new ModelClassReference(SmaliParser.fqcn(sml[0]));
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
        //console.log(this.obj);
        //this.obj.dump();
        return this.obj;
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
}
