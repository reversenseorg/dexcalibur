const IFC = require("../../../src/InspectorFrontController.js");
var CONST = require("../../../src/CoreConst.js");
const Disassembler = require("../../../src/Disassembler.js");

var Controller =  new IFC.FrontController();

/**
 * Count NOP instructions
 */
function nopCount(context){
    let subject=null, bb=null;

    let DB = context.analyze.db;
    let counters = {
        any: 0,
        nop: 0
    };

    for(let meth in DB.methods){
        subject = DB.methods[meth];
        if( subject.instr != null && subject.instr.length > 0){
            for(let i=0; i<subject.instr.length ; i++){
                for(let j=0; j<subject.instr[i].stack.length; j++){
                    opcode = subject.instr[i].stack[j].opcode;
                    if(opcode != null && opcode.type===CONST.INSTR_TYPE.NOP){
                        counters.nop++;
                    }
                    counters.any++;
                }
            }

        }
    }    

    return { status:200, data:counters };
}




function nopClean(context){
    let subject=null, bb=null, newbb=null;

    let DB = context.analyze.db;
    let counters = {
        nop: 0
    };

    for(let meth in DB.methods){
        subject = DB.methods[meth];
        if( subject.instr != null && subject.instr.length > 0){
            for(let i=0; i<subject.instr.length ; i++){
                newbb = [];
                for(let j=0; j<subject.instr[i].stack.length; j++){

                    opcode = subject.instr[i].stack[j].opcode;
                    if(opcode != null && opcode.type !==CONST.INSTR_TYPE.NOP){
                        newbb.push(subject.instr[i].stack[j]);
                    }else{
                        counters.nop++;
                    }
                }
                subject.instr[i].stack = newbb;
            }
        }
    }    

    return { status:200, data:counters };
}



// ======= Goto =========

function gotoLocalXref(method,goto_name){
    let xref = {
        name: null,
        ref: [],
        ctr: 0 
    };

    for(let i=0; i<method.instr.length; i++){
        for(let j=0; j<method.instr[i].stack.length; j++){
            if(method.instr[i].stack[j].opcode.type === CONST.INSTR_TYPE.GOTO){
                console.log(method.instr[i].stack[j].right.name+" ... "+goto_name);
                if(method.instr[i].stack[j].right.name === goto_name){
                    //xref.name = method.instr[i].stack[j].right.name;
                    console.log("XREF found");
                    xref.ref.push({ bb: method.instr[i], offset:j  });
                    xref.ctr++;

                    if(j !== method.instr[i].stack.length-1){
                        console.log(method.signature(),"[:goto_"+goto_name,"] Not the last instruction")
                    }
                }
            }
        }
    }

    return xref;
}

/*
0. Check if the function is eligible (no cond)
1. Find single GOTO instruction 
2. Collect next contiguous basic blocks from the target label
3. Replace the GOTO instruction by the identified basic blocks
4. Remove the moved basic blocks if there was not duplicated
5. Remove empty basic block if not used (TODO during 2. ?)
*/

function checkIfEligible(method){

    let notElgible = [
        CONST.INSTR_TYPE.IF,
        CONST.INSTR_TYPE.SWITCH,
        CONST.INSTR_TYPE.MONITOR
    ];


    // count GOTOs
    if( method.instr != null && method.instr.length > 0){
        for(let i=0; i<method.instr.length ; i++){
            for(let j=0; j<method.instr[i].stack.length; j++){
                instruction = method.instr[i].stack[j];
                if(instruction.opcode != null && notElgible.indexOf(instruction.opcode.type)>-1)
                    return false;
            }
        }
    }

    return true;
}

function findSingleGoto(method){
    let found = {}, singles = [];
    

    // count GOTOs
    if( method.instr != null && method.instr.length > 0){
        for(let i=0; i<method.instr.length ; i++){

            for(let j=0; j<method.instr[i].stack.length; j++){
                instruction = method.instr[i].stack[j];
                if(instruction.opcode != null && instruction.opcode.type==CONST.INSTR_TYPE.GOTO){
                    if(found[instruction.right.name]===undefined)
                        found[instruction.right.name]=1;
                    else
                        found[instruction.right.name]+=1;

                    if(found[instruction.right.name]==1) console.log("block "+i+", instr "+j+", goto "+instruction.right.name);
                }
            }
        }
    }

    // filter
    for(let i in found){
        if(found[i]===1)
            singles.push(i);
    }

    if(singles.length > 0){
        Disassembler.method(method);
        //console.log(singles);
    }

        
    return singles;
}

function isJump(instr){
    return instr !=null 
        && instr.opcode != null 
        && (instr.opcode.type==CONST.INSTR_TYPE.GOTO || instr.opcode.type==CONST.INSTR_TYPE.RET );
}
function hasJump(block, label=null){
    let f = false;
    if(label == null)
        block.forEach(element => {
            if(isJump(element)){
                f = true;
            }
        });
    else
        block.forEach(element => {
            if(isJump(element)){
                f = (element.right.name==label);
            }
        });

    return f;
}


function isReturn(instr){
    return instr !=null 
        && instr.opcode != null 
        && (instr.opcode.type==CONST.INSTR_TYPE.RET );
}
function hasReturn(block, label=null){
    let f = false;
    bbloccks.forEach(blk => {
        block.forEach(element => {
            if(isReturn(element)){
                f = true;
            }
        });
    })


    return f;
}


/**
 * To identifiy where is the first basic block and how many contiguous basic
 * block should be moved.
 * 
 * If the target blocks contains "return" opcode, the targeted basic blocks must be duplicated.  
 * 
 * @param {*} method 
 * @param {*} gotoLabel 
 */
function findTargetBasicBlocks(method, gotoLabel){
    console.log("Searching block at :goto_"+gotoLabel);
    let targetBBs = null, found=false, offset=0, duplicate=false;
    if( method.instr != null && method.instr.length > 0){
        for(let i=0; i<method.instr.length ; i++){

            if(method.instr[i].goto_name === gotoLabel){
                targetBBs = [method.instr[i]];
                offset=i;
                found=true;

                if(method.instr[i] == null){
                    console.log("Error");

                }
                if(method.instr[i].hasInstr(CONST.INSTR_TYPE.RET))
                    duplicate = true;

                //console.log(method.instr[i].stack);
                if(hasJump(method.instr[i].stack)){
                    break;
                } 
            }
            else if(found){
                targetBBs.push(method.instr[i]);
                console.log(hasJump(method.instr[i].stack));

                if(method.instr[i].hasInstr(CONST.INSTR_TYPE.RET))
                    duplicate = true;

                if(hasJump(method.instr[i].stack)){
                    break;
                } 
                    
            }

        }
    }
    
    // if a BB contains "return", check if previous incond BB are tagged.
    if(duplicate){
        duplicate = false;
        for(let i=offset-1; i>0 ; i--){

            if(method.instr[i].goto_name !== null){
                duplicate = true;
                break;
            }
        }
    }

    return { blk:targetBBs, offset:offset, duplicate:duplicate };
}

function moveBasicBlock(method, bblocks, gotoLabel){
    console.log("Moving basic blocks "+bblocks.offset+"(len:"+bblocks.blk.length+") at instr goto_"+gotoLabel);
    let bbs = [], flag=false, lastWasGoto=false, endbb=0, tmp=null;
    // find cut point
    if( method.instr != null && method.instr.length > 0){

        for(let i=0; i<method.instr.length ; i++){


            //if(i<=bblocks.offset){

                if(method.instr[i].stack ==undefined){
                    console.log("Stack is undefined",method.instr);
                }


                for(let j=0; j<method.instr[i].stack.length; j++){
                    
                    instruction = method.instr[i].stack[j];
                    lastWasGoto=false

                    if(instruction == null)
                        continue;

                    if(instruction.opcode != null && instruction.opcode.type==CONST.INSTR_TYPE.GOTO){
                        // check if the instruction must be patched
                        if(instruction.right.name == gotoLabel){

                            //console.log(bblocks);


                            // check if the target is before
                            endbb = bblocks.offset+bblocks.blk.length;
                            if(endbb<=i){
                                if(bblocks.duplicate){
                                    bbs = method.instr.slice(0,i);

                                }else{
                                    bbs = method.instr.slice(0,bblocks.offset);
                                    bbs = bbs.concat(method.instr.slice(
                                            endbb,
                                            i+1));
                                }
                                console.log("Targeted block before");
                            }else if(bblocks.offset>i){

                                bbs = method.instr.slice(0,i+1);
                                
                                console.log("Targeted block after");

                            }


                            //Disassembler.method(method);
                            if(method.instr[i].stack != undefined && method.instr[i].stack.length>0){
                                console.log("Remove goto instruction");


                            // si le dernier basic block est un return-* on duplique
                            // sinon on déplace 

                                if(bbs[bbs.length-1] == undefined){
                                    console.log("The new list of blocks is null : ",bbs.length,bbs);
                                }

                                if(j==bbs[bbs.length-1].stack.length-1){
                                    bbs[bbs.length-1].stack.pop();
                                }else{
                                    /*
                                    Case :
                                    
                                    nop
                                    nop
                                    goto
                                    nop

                                    Else there is a basic block segmentation error
                                    */
                                    //method.instr[i].stack[j] = CONST.INSTR_TYPE.NOP;
                                    console.log("Goto instruction is not the last ("+j+"/"+bbs[bbs.length-1].stack.length+")")
                                    tmp = [];
                                    //bbs[bbs.length-1].stack[j] = null; //CONST.INSTR_TYPE.NOP ;

                                    for(let ii=0; ii<bbs[bbs.length-1].stack.length; ii++){
                                        if(bbs[bbs.length-1].stack[ii].opcode.type==CONST.INSTR_TYPE.GOTO) continue;
                                        // ajouter un test si apres le goto c'est pas des nop

                                        tmp.push(bbs[bbs.length-1].stack[ii]);
                                    }
                                    bbs[bbs.length-1].stack = tmp;

                                    //bbs[bbs.length-1].goto_name = null;
                                }
                                
                            }
 
                            // append others basic blocks
                            if(bblocks.blk.length>0){
                                bblocks.blk[0].goto_name = null;
                                for(let l=0; l<bblocks.blk.length; l++)
                                    bbs.push(bblocks.blk[l]);
                            }   

                            flag = true;
                            lastWasGoto = true;

                            if(bblocks.duplicate){
                                frag = method.instr.slice(bblocks.offset,endbb);
                                for(let b=0; b<frag.length; b++){
                                    bbs.push(frag[b].clone());
                                    bbs = bbs.concat(method.instr.slice(i+1));
                                }
                            }else{
                                if(endbb<=i){
                                    if(i+1<method.instr.length)
                                        bbs = bbs.concat(method.instr.slice(i+1));
                                }
                                else if(bblocks.offset>i){
                                    bbs = bbs.concat(method.instr.slice(i+1, bblocks.offset));
                                    bbs = bbs.concat(method.instr.slice(endbb+1 ));
                                }
                            }
                        }
                    }
                    else if(lastWasGoto){
                        if(instruction.opcode.type !== CONST.INSTR_TYPE.NOP){
                            console.log("[ERROR] CFG changed !!!");
                        }
                    }
                }
            //}
        }
    }

    //method.instr = bbs;
    return bbs;
}



function flatternGotoOf(method){

    let blocksToMove = null;
    let singleGoto = findSingleGoto(method);
    let ret = false;

    if(singleGoto.length > 0){
        for(let i=0; i<singleGoto.length; i++){

            console.log("flat : ",singleGoto[i]);
            
            blocksToMove = findTargetBasicBlocks(method, singleGoto[i]);
            if(blocksToMove.blk !== null){
                method.instr = moveBasicBlock(method, blocksToMove, singleGoto[i]);
                //Disassembler.method(method);
                ret = true;
            }
        }
    }

    return ret;
}

/*

A 
| \
C  |
| /
X

  Si la derniere instructions du bloc precedent est un goto vers le bloc courant  

*/
function gotoConditionnalClean(context){
    console.log("Conditional goto clean");
    let subject=null;
    let DB = context.analyze.db;
    let gotos = 0;


    for(let meth in DB.methods){
        if(checkIfEligible(DB.methods[meth])==false) continue;

        subject = DB.methods[meth];
        if( subject != null && subject.instr != null && subject.instr.length > 0){
            if(flatternGotoOf(subject)>0) gotos++;
        }
    }    

    return { status:200, data:{ count:gotos }};
}

function gotoClean(context){
    console.log("Inconditional goto clean");
    
    let subject=null;
    let DB = context.analyze.db;
    let counters = {
        goto: 0
    };


    for(let meth in DB.methods){
        subject = DB.methods[meth];
        if( subject != null && subject.instr != null && subject.instr.length > 0){
            if(flatternGotoOf(subject)) counters.goto++;
        }
    }    

    return { status:200, data:{ counter:counters.goto } };
}


/**
 * Delegate front controller
 */
Controller.registerHandler(IFC.HANDLER.GET, function(ctx,req,res){

    var action = req.query.action;
    var act ={
        status: 404,
        data: { error: "Action not found. "}
    };

    switch(action){
        case 'nop_count':
            act = nopCount(ctx);
            break;
        case 'nop_clean':
            act = nopClean(ctx);
            break;
        case 'goto_clean':
            if(req.query.cleanif==1)
                act = gotoConditionnalClean(ctx);
            else
                act = gotoClean(ctx);

            console.log(act.data.counter),"methods cleaned";
            break;
        case 'wrap_clean':
            //act = wrapClean(ctx);
            break;
    }

    res.status(act.status).send(act.data);
});

/*
Controller.registerHandler(IFC.HANDLER.POST, function(ctx,req,res){
    console.log("POST", req.query);
    res.send({ msg:"ok" });
});*/


module.exports = Controller;
