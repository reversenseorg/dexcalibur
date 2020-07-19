import {OpcodeSmaliParser} from "./OpcodeSmaliParser";
import {ModelMethodReference, ModelRegisterReference, Tag} from "./ModelReference";
import {CONST} from "./CoreConst";
import ModelInstruction from "./ModelInstruction";
import {ModelBasicType, ModelObjectType} from "./ModelType";
import {PATTERN, RX} from "./CoreParser";
import Util from "./Utils";
import ModelConstantValue from "./ModelConstantValue";

import * as Log from './Logger';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class DalvikInstructionFormat {

    static move(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();

        instr.left = OpcodeSmaliParser.singleVar(src[1]);
        instr.right = OpcodeSmaliParser.singleVar(src[2]);

        return instr;
    }

    static math(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();

        instr.left = OpcodeSmaliParser.singleVar(src[1]);
        instr.right = OpcodeSmaliParser.singleVar(src[2]);

        return instr;
    }

    static addrX(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let v:ModelRegisterReference[] = OpcodeSmaliParser.multiVar(raw_src);

        instr.left = v[0];
        instr.right = v.shift();

        return instr;
    }

    static Format23x(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        //let v = OpcodeSmaliParser.multiVar(raw_src);

        let v:RegExpExecArray = RX.FORMAT23X.exec(raw_src);

        instr.left = [new ModelRegisterReference(v[2],v[3]), new ModelRegisterReference(v[5],v[6]) ];
        instr.right = new ModelRegisterReference(v[8], v[9]);

        return instr;
    }
Ò
    static singleArgs(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();

        instr.left = OpcodeSmaliParser.singleVar(src[1]);
        // la droite est la valeur de retour du dernier invoke  MOVE_RESULT
        // ou une exception MOVE_EXCPT
        //instr.right = OpcodeSmaliParser.singleVar(src[2]);

        return instr;
    }

    static noArgs(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();

        return instr;
    }

    // v0, [B
    // v0, Ljava/lang/String;
    static format21c(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let i:number = raw_src.lastIndexOf(",");

        instr.left = OpcodeSmaliParser.singleVar(raw_src.substr(0,i));

        let r :string= raw_src.substr(i+1);
        let m:RegExpExecArray = RX.FORMAT21C.exec(r);

        if(m == null){
            Logger.debug("[SmaliParser][FORMAT21C] Unable to parse : ", raw_src);
            instr.right = null;
        }else{

            if(m.groups.class!==undefined && m.groups.primitive==undefined){

                instr.right = new ModelObjectType(
                    OpcodeSmaliParser.fqcn(m.groups.class.substr(1, m.groups.class.length-2)),
                    (m.groups.isarray!==undefined)); //3
            }else
                instr.right = new ModelBasicType(m[2], (m.groups.isarray!==undefined));

        }

        return instr;
    }

    // v0, v1, [L...
    static format22c(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let i:number = raw_src.lastIndexOf(","), arr:boolean=false;

        instr.left = OpcodeSmaliParser.multiVar(raw_src.substr(0,i));

        let r:string = raw_src.substr(i+1);
        let m:RegExpExecArray = RX.FORMAT22C.exec(r);


        if(m[1]==="[")
            arr = true;

        if(m[2]=='L')
            instr.right = new ModelObjectType(OpcodeSmaliParser.fqcn(m[3]),arr);
        else
            instr.right = new ModelBasicType(m[2],arr);

        return instr;
    }


    static regField(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();

        instr.left = OpcodeSmaliParser.singleVar(src[1]);
        instr.right = OpcodeSmaliParser.fieldReference(src[2],raw_src);

        return instr;
    }

    static multRegField(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let i:number = raw_src.lastIndexOf(",");

        instr.left = OpcodeSmaliParser.multiVar(raw_src.substr(0,i));
        instr.right = OpcodeSmaliParser.fieldReference(raw_src.substr(i+1),raw_src);

        return instr;
    }

    static invoke(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let m:RegExpExecArray = RX.INVOKE.exec(raw_src), meth:any=null;
        let regs:string = raw_src.substr(0,raw_src.lastIndexOf(","));

        instr.left = OpcodeSmaliParser.multiVar(regs);


        if(m !== null){
            meth = OpcodeSmaliParser.methodName(m[m.length-1]);
            instr.right = new ModelMethodReference({
                fqcn: OpcodeSmaliParser.fqcn(m[m.length-2]),
                name: meth.name,
                args: meth.args,
                ret: meth.ret,
                special: false
            });
            if(instr.right==null) console.log(raw_src);

        }else{
            m = RX.INVOKE_SPECIAL.exec(raw_src.substr(raw_src.lastIndexOf(",")));

            if(m == null) console.log("Parsing fail : ",raw_src);

            meth = OpcodeSmaliParser.methodName(m[m.length-1]);
            instr.right = new ModelMethodReference({
                fqcn: OpcodeSmaliParser.fqcn(m[m.length-2]),
                name: meth.name,
                args: meth.args,
                ret: meth.ret,
                special: true,
            });
        }

        return instr;
    }

    static onlyTagged(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let m:RegExpExecArray = RX.TAG.exec(raw_src);


        instr.left = null;
        instr.right = new Tag(m[m.length-1]);

        return instr;
    }

    static tagged(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let m:RegExpExecArray = RX.REG_TAG.exec(raw_src);

        //if(raw_src.indexOf(":sswitch")>-1) console.log(m);

        instr.left = new ModelRegisterReference(m[1], m[2]);//new CLASS.Variable(m[1],m[2]);
        //instr.right = new CLASS.Tag(':'+m[m.length-2]+"_"+m[m.length-1]);
        instr.right = new Tag(m[m.length-1]);

        return instr;
    }

    static multTagged(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let i:number= raw_src.lastIndexOf(",");

        instr.left = OpcodeSmaliParser.multiVar(raw_src.substr(0,i));

        let m:RegExpExecArray = RX.TAG.exec(raw_src.substr(i+1));
        //instr.right = new CLASS.Tag(':'+m[m.length-2]+"_"+m[m.length-1]); //m[m.length-1]);
        instr.right = new Tag(m[m.length-1]); //m[m.length-1]);


        return instr;
    }

    static format_lit16(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let r:number = raw_src.lastIndexOf(",");

        instr.left = OpcodeSmaliParser.multiVar(raw_src.substr(0,r));//new CLASS.Variable(m[1],m[2]);
        instr.right = new ModelConstantValue(
            parseInt(raw_src.substr(r+1)), []
        );
        // , instr

        return instr;
    }

    static setlitteral(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let m:RegExpExecArray = (new RegExp(PATTERN.CONST_LIT_INSTR)).exec(raw_src);

        instr.left = new ModelRegisterReference(m[1], m[2]);//new CLASS.Variable(m[1],m[2]);
        instr.right = new ModelConstantValue(
            parseInt(m[3]), []
        );
        // 3:instr

        return instr;
    }

    static setstring(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let m:RegExpExecArray = (new RegExp(PATTERN.STR_INSTR)).exec(raw_src);


        instr.tags.push(CONST.TAG.STRING);
        instr.left = new ModelRegisterReference(m[1], m[2]);//new CLASS.Variable(m[1],m[2]);
        //instr.left.tags.push(CONST.TAG.STRING);

        instr.right = new ModelConstantValue(
            m[3], [CONST.TAG.STRING,CONST.TAG.STRING_DECL]
        );

        return instr;
    }

    static setclass(src:string[],raw_src:string):ModelInstruction{
        let instr:ModelInstruction = new ModelInstruction();
        let m:RegExpExecArray = (new RegExp(PATTERN.CONST_CLASS_INSTR)).exec(raw_src);

        //console.log(m,raw_src);
        if(m !== null && m[0] === Util.trim(raw_src)){
            instr.left = new ModelRegisterReference(m[1], m[2]);//new CLASS.Variable(m[1],m[2]);
            if(m[5] === undefined){
                instr.right = new ModelBasicType(m[3]);
            }else{
                instr.right = new ModelObjectType(OpcodeSmaliParser.fqcn(m[5]));
            }

            return instr;
        }

        m = (new RegExp(PATTERN.CONST_CLASS_MULT_INSTR)).exec(raw_src);

        //console.log(m,Core.PATTERN.CONST_CLASS_MULT_INSTR,raw_src);
        if(m==null) console.log(raw_src);
        instr.left = new ModelRegisterReference(m[1], m[2]);//new CLASS.Variable(m[1],m[2]);

        if(m[3][0]=='L')
            instr.right = new ModelObjectType(OpcodeSmaliParser.fqcn(m[5]),true);
        else
            instr.right = new ModelBasicType(m[3],true);

        return instr;
    }

    static TODO(src:string[],raw_src:string):ModelInstruction{
        return null;
    }
};
