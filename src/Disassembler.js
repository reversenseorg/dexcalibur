var Chalk = require("chalk");
var Op = require("./Opcode.js");
const CONST = require("./CoreConst.js");

var OPCODE = Op.OPCODE;


function Patch(instr){
    this.patch = instr
}
Patch.prototype.alwaysTrue = function(){

}
Patch.prototype.alwaysFalse = function(){
    
}
Patch.prototype.replace = function(){
    
}
Patch.prototype.move = function(){
    
}
Patch.prototype.deploy = function(){

}

function MethodEditor(method){


    /**
     * @param {*} bbNo Basic Block index
     * @param {*} instrNo Instr index
     */
    this.taint = function(bbNo,instrNo,reg){

    };

    /**
     * 
     * @param {*} bbNo Basic Block index
     * @param {*} instrNo Instr index
     */
    this.patch = function(bbNo,instrNo){

    };

    // do return after the given instr
    this.cut = function(instrNo){

    }
}

function Disassembler(){

}

Disassembler.prototype.method = function(method){

        let bb=null, txt="", prefix="";
        
        console.log("\n  "+method.signature());
        for(let i in method.instr){


            bb=method.instr[i];

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
    };

    /*
            switch(bb.stack[j].opcode.byte){
                case OPCODE.INVOKE_STATIC.byte:
                    if(bb.stack[j+1].opcode.byte == OPCODE.MOVE_RESULT){
                        txt = bb.stack[j+1].left.t;
                        txt += bb.stack[j+1].left.i+" = ";
                    }
                    txt += bb.stack[j].right.signature()+';';
                    break;
                case OPCODE.NEW_INSTANCE.byte:
                    break;
                case OPCODE.CONST_STRING.byte:
                case OPCODE.CONST_STRING_JUMBO.byte:
                    txt = bb.stack[j+1].left.t+bb.stack[j+1].left.t+" = ";
                    txt += '"'+bb.stack[j+1].right.value+'";';
                break;
            }
            */

Disassembler.prototype.block = function(method,bb,nested,tagged){
    let before = " ".repeat((nested*2)+1);
    let ignore = [];
    //before += "╚═";

    // for each instruction
    for(let j=0; j<bb.stack.length; j++){
        txt = "\t<"+bb.offset+","+j+">\t";
        
        if(nested > 0){
            if(j==0 && nested>0 && tagged) 
                txt += (" ".repeat((nested*2)-1))+"╚═╗";
            else
                txt += before+"║";
        }
        
        if(bb.stack[j].opcode.instr.indexOf("if-")>-1){
            txt += Chalk.bold.white(bb.stack[j]._raw);
            console.log(txt);

            taggedBlock = method.getTaggedBlock(":cond_"+bb.stack[j].right.name);
            tagged = true;
            this.block(method,taggedBlock,nested+1,true);

            do{
                taggedBlock = method.getBlock(taggedBlock.offset+1);
                if(taggedBlock !==null){
                    ignore.push(taggedBlock.offset);
                    this.block(method,taggedBlock,nested,false);
                }
            }while(taggedBlock !== null && 
                (!taggedBlock.hasInstr(CONST.INSTR_TYPE.GOTO)
                ||!taggedBlock.hasInstr(CONST.INSTR_TYPE.RET)));

                
        }
        else{
            if(bb.stack[j].opcode.type===CONST.INSTR_TYPE.GOTO){
                txt += Chalk.bold.blue(bb.stack[j]._raw);
            }
            else if(bb.stack[j].opcode.instr.indexOf("invoke")>-1){
                txt += Chalk.bold.yellow(bb.stack[j]._raw);
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
        return { offset: bb.offset, ignore:ignore };
    }
};

Disassembler.prototype.methodPretty = function(method){

    let bb=null, txt="", ignore=[], state={};
    console.log("\n  "+method.signature());
    for(let i in method.instr){
        bb=method.instr[i];
        if(bb.tag !== null && bb.tag.startsWith(":cond_")) continue;
        if(ignore.indexOf(i)>-1);

        state = this.block(method,bb,0);
        ignore.concat(state.ignore);
    }

    return this;
};

Disassembler.prototype.methodFull = function(method){
    let bb=null, txt="", prefix="", bbe={}, line={}, result="";
    
    for(let i in method.instr){
        bb=method.instr[i];
        //result += 
    }
};

Disassembler.prototype.methodRaw = function(method){

    let bb=null, txt="", prefix="", bbe={}, line={}, result=[];
    
    for(let i in method.instr){
        bb=method.instr[i];
        bbe={
            tag: null,
            instr: []
        };

        /*if(bb.isGotoBlock()){
            bbe.instr.push(bb.goto_name);
        }*/
        if(bb.line>-1){
            bbe.instr.push({ value:".line "+bb.line });
        }
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

        if(bb.tag !== null){
            bbe.tag = bb.tag;
        }
        
        for(let j in bb.stack){
            if(bb.stack[j].opcode === undefined){
                console.log(bb.stack[j]._raw);
                continue;
            }

            line = {
                if: false,
                goto: false,
                invoke: false,
                const: false
            };
            line.tag = bb.tag;
            line.bb_offset = i;
            line.bb_roffset = j;

            
            if(bb.stack[j].opcode.instr.indexOf("if-")>-1){
                line.if = true;
                line.value = bb.stack[j]._raw;
                //line.value = '<i class="code-pink">'+bb.stack[j]._raw+'</i>';
            }
            else if(bb.stack[j].opcode.type==CONST.INSTR_TYPE.GOTO){
                line.goto = true;
                line.value = bb.stack[j]._raw;
                //line.value = '<i class="code-blue">'+bb.stack[j]._raw+'</i>';
            }
            else if(bb.stack[j].opcode.instr.indexOf("invoke")>-1){
                /*if(bb.stack[j].right != null && bb.stack[j].right.getAlias() != null){
                    line.value = bb.stack[j].opcode.instr;
                    line.value += " {...} ";
                    line.value += bb.stack[j].right.aliasedSignature();
                }else{*/
                    line.value = bb.stack[j]._raw;   
                //}
                //line.value = bb.stack[j]._raw;
                // line.goto = true;
                //line.value = '<u class="code-purple">'+bb.stack[j]._raw+'</u>';
            }
            else if(bb.stack[j].opcode.instr.indexOf("const-string")>-1){
                line.string = true;
                line.value = bb.stack[j]._raw;
                //line.value = bb.stack[j].opcode.instr;
                //line.value += " "+bb.stack[j].left.t+bb.stack[j].left.i+", ";
                //line.value += '<b class="code-red">"'+bb.stack[j].right._value+'"</b>';
            }
            else{
                line.value = bb.stack[j]._raw;
            }    
 

            bbe.instr.push(line);
        }
        if(bb.getTryEndName() != null){
            bbe.instr.push({ value:bb.getTryEndName() });
            bbe.instr.push({ value:bb.catch_cond });
        }
        result.push(bbe);
    }
    return result;
};

module.exports = new Disassembler();

