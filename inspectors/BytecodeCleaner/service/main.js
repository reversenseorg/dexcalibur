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
1. Find single GOTO instruction 
2. Collect next continuous basic blocks from the target label
3. Replace the GOTO instruction by the identified basic blocks
4. Remove the moved basic blocks
*/

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

function findTargetBasicBlocks(method, gotoLabel){
    console.log("Searching block at :goto_"+gotoLabel);
    let targetBBs = null, found=false, offset=0;
    if( method.instr != null && method.instr.length > 0){
        for(let i=0; i<method.instr.length ; i++){

            if(method.instr[i].goto_name === gotoLabel){
                targetBBs = [method.instr[i]];
                offset=i;
                found=true;
                //console.log(method.instr[i].stack);
                if(hasJump(method.instr[i].stack)){
                    break;
                } 
            }
            else if(found){
                targetBBs.push(method.instr[i]);
                console.log(hasJump(method.instr[i].stack));
                if(hasJump(method.instr[i].stack)){
                    break;
                } 
                    
            }

        }
    }

    return { blk:targetBBs, offset:offset };
}

function moveBasicBlock(method, bblocks, gotoLabel){
    console.log("Moving basic blocks "+bblocks.offset+"(len:"+bblocks.blk.length+") at instr goto_"+gotoLabel);
    let bbs = [], flag=false, lastWasGoto=false, endbb=0;
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
                                if(bblocks.hasReturn){

                                }else{
                                    bbs = method.instr.slice(0,bblocks.offset);
                                    bbs = bbs.concat(method.instr.slice(
                                            endbb,
                                            i+1));
                                }
                                


                                //console.log(bbs);

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
                                    console.log("Stack is null : ",bbs.length,bbs);
                                }

                                if(j==bbs[bbs.length-1].stack.length-1){
                                    bbs[bbs.length-1].stack.pop();
                                }else{
                                    //method.instr[i].stack[j] = CONST.INSTR_TYPE.NOP;
                                    console.log("Goto instruction is not the last ("+j+"/"+bbs[bbs.length-1].stack.length+")")
                                    bbs[bbs.length-1].stack[j] = null; //CONST.INSTR_TYPE.NOP ;
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

                            if(endbb<=i){
                                
                                if(i+1<method.instr.length)
                                    bbs = bbs.concat(method.instr.slice(i+1));

                            }
                            //else if(endbb<method.instr.length){
                            else if(bblocks.offset>i){

                                bbs = bbs.concat(method.instr.slice(i+1, bblocks.offset));
                                bbs = bbs.concat(method.instr.slice(endbb+1 ));
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

    if(singleGoto.length > 0){
        for(let i=0; i<singleGoto.length; i++){

            console.log("flat : ",singleGoto[i]);
            
            blocksToMove = findTargetBasicBlocks(method, singleGoto[i]);
            if(blocksToMove.blk !== null){
                method.instr = moveBasicBlock(method, blocksToMove, singleGoto[i]);
                Disassembler.method(method);
            }
        }
    }

    return true;
}



function removeBasicBlock(method, offset){
    let ctn=[];
    for(let i=0; method.instr.length; i++){
        if(offset !== i)
            ctn.push(method.instr[i]);
    }
    method.instr = ctn;
    return method;
}

function appendInstr(block_src, block_dest){
    for(let i=0; block_src.stack.length; i++){
        block_dest.stack.push(block_src.stack[i]);
    }
}

function makeGotoGraph(method){
    let graph = null, node = null, blocks={};
    for(let i=0; i<method.instr.length; i++){
        if(method.instr[i].isGotoBlock()){
            node = {
                name:method.instr[i].goto_name,
                bb: [] 
            }
            blocks[method.instr[i].goto_name] = node;
            node = [];
        }else{
            node.push(method.instr[i]);
        }
    }

}
/*

A 
| \
C  |
| /
X

  Si la derniere instructions du bloc precedent est un goto vers le bloc courant  

*/
function gotoClean(context){
    
    let subject=null, bb=null, newbb=null, xref=null;

    let DB = context.analyze.db;
    let counters = {
        nop: 0
    };


    for(let meth in DB.methods){
        subject = DB.methods[meth];
        if( subject != null && subject.instr != null && subject.instr.length > 0){
            flatternGotoOf(subject);
        }
    }    

    return { status:200, data:counters };
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
            act = gotoClean(ctx);
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
