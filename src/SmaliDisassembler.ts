import Chalk from 'chalk';
import ModelMethod from "./ModelMethod";
import ModelBasicBlock from "./ModelBasicBlock";
import {ModelPackedSwitchStatement, ModelSwitchCase} from "./ModelSwitch";
import {CONST} from "./CoreConst";
import ModelCatchStatement from "./ModelCatchStatement";
import * as Log from "./Logger";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class SmaliDisassembler
{
    constructor() {

    }

    method( pMethod:ModelMethod):SmaliDisassembler{

        let bb:any=null, txt:string="", prefix:string="";

        console.log("\n  "+pMethod.signature());
        for(let i in pMethod.instr){


            bb=pMethod.instr[i];

            if(bb.tag !== null){
                prefix = Chalk.bold.blue(bb.tag)+"   ";
            }else{
                prefix = "";
            }


            if(bb.cond_name != null)
                console.log("\n :cond_"+bb.cond_name+"\n");
            if(bb.goto_name != null)
                console.log("\n :goto_"+bb.goto_name+"\n");

            for(let j in bb.stack){
                if(bb.stack[j] == null || bb.stack[j].opcode === undefined) continue;

                txt = prefix+"\t<"+i+","+j+">\t";

                if(bb.stack[j].opcode.instr.indexOf("if-")>-1){
                    txt += Chalk.bold.white(bb.stack[j]._raw);
                }
                else if(bb.stack[j].opcode.instr.indexOf("goto")>-1){
                    txt += Chalk.bold.blue(bb.stack[j]._raw);
                }
                else if(bb.stack[j].opcode.instr.indexOf("invoke")>-1){
                    if(bb.stack[j].right.alias != null){
                        txt += Chalk.bold.yellow(
                            bb.stack[j].opcode.instr+" {...} "+bb.stack[j].right.prettySignature());
                    }else{
                        txt += Chalk.bold.yellow(bb.stack[j]._raw);
                    }
                }
                else if(bb.stack[j].opcode.type == CONST.INSTR_TYPE.NOP){
                    txt += "nop";
                }
                else if(bb.stack[j].opcode.instr.indexOf("const-string")>-1){
                    txt += bb.stack[j].opcode.instr;
                    txt += " "+bb.stack[j].left.t+bb.stack[j].left.i+", ";
                    txt += Chalk.bold.red('"'+bb.stack[j].right._value+'"');
                }
                else{
                    txt += bb.stack[j]._raw;
                }
                console.log(txt);
            }
        }

        return this;
    }


    block( pMethod:ModelMethod, pBblock:ModelBasicBlock, nested:number=0, tagged:boolean=false){
        let before:string = " ".repeat((nested*2)+1);
        let ignore:any = [];
        let txt:string = "";
        let taggedBlock:ModelBasicBlock;
        //before += "╚═";

        // for each instruction
        for(let j=0; j<pBblock.stack.length; j++){
            txt = "\t<"+pBblock.offset+","+j+">\t";

            if(nested > 0){
                if(j==0 && nested>0 && tagged)
                    txt += (" ".repeat((nested*2)-1))+"╚═╗";
                else
                    txt += before+"║";
            }

            if(pBblock.stack[j].opcode.instr.indexOf("if-")>-1){
                txt += Chalk.bold.white(pBblock.stack[j]._raw);
                console.log(txt);

                taggedBlock = pMethod.getTaggedBlock(":cond_"+pBblock.stack[j].right.name);
                tagged = true;
                this.block(pMethod,taggedBlock,nested+1,true);

                do{
                    taggedBlock = pMethod.getBlock(taggedBlock.offset+1);
                    if(taggedBlock !==null){
                        ignore.push(taggedBlock.offset);
                        this.block(pMethod,taggedBlock,nested,false);
                    }
                }while(taggedBlock !== null &&
                (!taggedBlock.hasInstr(CONST.INSTR_TYPE.GOTO)
                    ||!taggedBlock.hasInstr(CONST.INSTR_TYPE.RET)));


            }
            else{
                if(pBblock.stack[j].opcode.type===CONST.INSTR_TYPE.GOTO){
                    txt += Chalk.bold.blue(pBblock.stack[j]._raw);
                }
                else if(pBblock.stack[j].opcode.instr.indexOf("invoke")>-1){
                    txt += Chalk.bold.yellow(pBblock.stack[j]._raw);
                }
                else if(pBblock.stack[j].opcode.instr.indexOf("const-string")>-1){
                    txt += pBblock.stack[j].opcode.instr;
                    txt += " "+pBblock.stack[j].left.t+pBblock.stack[j].left.i+", ";
                    txt += Chalk.bold.red('"'+pBblock.stack[j].right._value+'"');
                }
                else{
                    txt += pBblock.stack[j]._raw;
                }
                Logger.debug(txt);
            }
            return { offset: pBblock.offset, ignore:ignore };
        }
    }

    /**
     * @deprecated
     * @param pMethod
     */
    methodPretty( pMethod:ModelMethod):SmaliDisassembler{

        let bb:any=null, ignore:any=[], state:any={};

        console.log("\n  "+pMethod.signature());
        for(let i in pMethod.instr){
            bb=pMethod.instr[i];
            if(bb.tag !== null && bb.tag.startsWith(":cond_")) continue;
            //if(ignore.indexOf(i)>-1);

            state = this.block( pMethod, bb,0);
            ignore.concat(state.ignore);
        }

        return this;
    }


    methodRaw( pMethod:ModelMethod):any{

        let bb:ModelBasicBlock=null, txt:string="", prefix:ModelCatchStatement[];
        let bbe:any={}, line:any={}, result:any=[], c:any={};
        let placeholder:number = -1, ln:number = -1;

        for(let i in pMethod.instr){
            bb=pMethod.instr[i];
            bbe={
                tag: null,
                instr: []
            };

            if(bb.isGotoBlock()){
                bbe.instr.push({ value:":goto_"+bb.goto_name });
            }
            if(bb.isConditionalBlock()){
                bbe.instr.push({ value:":cond_"+bb.cond_name });
            }
            if(bb.isTryBlock()){
                bbe.instr.push({ value:bb.try_name });
            }
            if(bb.isCatchBlock()){
                bbe.instr.push({ value:bb.catch_name });
            }
            if(bb.isSwitchCase()){
                bbe.instr.push({ value:bb.getSwitchCaseName() });
            }

            if(bb.isSwitchStatement()){

                bbe.instr.push({ value:bb.getSwitchStatementName() });

                if(bb.switch != null){

                    if(bb.switch instanceof ModelPackedSwitchStatement){
                        bbe.instr.push({ value:".packed-switch 0x"+parseInt(bb.switch.getStartValue()).toString(16) });
                    }else{
                        bbe.instr.push({ value:".sparse-switch" });
                    }

                    //bbe.instr.push({ value:bb.switch.name+" 0x"+bb.switch.getStartValue() });

                    for(let j in bb.switch.cases){
                        c = bb.switch.cases[j];
                        if(c instanceof ModelSwitchCase){
                            if(c.type == CONST.CASE_TYPE.PACKED)
                                bbe.instr.push({ value:"    :pswitch_"+c.value.toString(16) });
                            else
                                bbe.instr.push({ value:"    "+c.value+" -> "+c.target });

                        }

                    }

                    if(bb.switch instanceof ModelPackedSwitchStatement){
                        bbe.instr.push({ value:".end packed-switch " });
                    }else{
                        bbe.instr.push({ value:".end sparse-switch" });
                    }
                }
            }
            else if(bb.switch_statement != null || bb.switch != null){
                //console.log(bb);
            }

            if(bb.tag !== null){
                bbe.tag = bb.tag;
            }

            if(bb.stack.length > 0){
                let j:number = 0;

                ln = -1;
                do {
                    if(bb.stack[j].iline != ln){
                        //bbe.instr.push({ value:".line "+bb.stack[j].iline });
                        ln = bb.stack[j].iline;
                        bbe.instr.push({ value:`.line ${ln}`});
                    }

                    if(bb.stack[j].opcode === undefined){
                        j++
                        continue;
                    }

                    line = {
                        if: false,
                        goto: false,
                        invoke: false,
                        const: false,
                        tag: bb.tag,
                        bb_offset: i,
                        bb_roffset: j
                    };

                    if(bb.stack[j].opcode.instr.indexOf("if-")>-1){
                        line.if = true;
                        line.value = bb.stack[j]._raw;
                    }
                    else if(bb.stack[j].opcode.type==CONST.INSTR_TYPE.GOTO){
                        line.goto = true;
                        line.value = bb.stack[j]._raw;
                    }
                    else if(bb.stack[j].opcode.instr.indexOf("invoke")>-1){
                        line.value = bb.stack[j]._raw;
                    }
                    else if(bb.stack[j].opcode.instr.indexOf("const-string")>-1){
                        line.string = true;
                        line.value = bb.stack[j]._raw;
                    }
                    else{
                        line.value = bb.stack[j]._raw;
                    }

                    bbe.instr.push(line);
                    j++;

                }while(j<bb.stack.length);
            }



            if(bb.getTryEndName() != null){
                bbe.instr.push({ value:bb.getTryEndName() });
            }
            if(bb.hasCatchStatement()){
                prefix = bb.getCatchStatements();
                for(let k=0; k<prefix.length; k++){
                    if(prefix[k].getException()==null)
                        txt = `.catchall {${(prefix[k].getTryStart() as ModelBasicBlock).getTryStartLabel()} .. ${(prefix[k].getTryEnd() as ModelBasicBlock).getTryEndName()}} ${(prefix[k].getTarget() as ModelBasicBlock).getCatchLabel()}`;
                    else
                        txt = `.catch ${prefix[k].getException().name} {${(prefix[k].getTryStart() as ModelBasicBlock).getTryStartLabel()} .. ${(prefix[k].getTryEnd() as ModelBasicBlock).getTryEndName()}} ${(prefix[k].getTarget() as ModelBasicBlock).getCatchLabel()}`;

                    bbe.instr.push({ value:txt });
                }

            }

            result.push(bbe);
        }

        let d=null;

        for(let j in pMethod.datas){
            d = pMethod.datas[j];
            bbe={
                tag: null,
                instr: []
            };

            bbe.instr.push({ value: d.name });
            bbe.instr.push({ value:CONST.LEX.STRUCT.ARRAY+"  "+d.getByteWidth() });
            for(let k=0; k<d.count(); k++){
                c = (d.read(k) < 0x7f && d.read(k) > 0x10)? "// '"+String.fromCharCode(d.read(k))+"'" : '';

                if(d.read(k)>=0)
                    bbe.instr.push({ value:`    0x${d.read(k).toString(16)}  ${c}` });
                else
                    bbe.instr.push({ value:`    ${d.read(k).toString(16).replace('-','-0x')}  ${c}` });
            }
            bbe.instr.push({ value:CONST.LEX.STRUCT.END+"  "+CONST.LEX.STRUCT.ARRAY_NAME});
            result.push(bbe);
        }
        return result;
    }
}



