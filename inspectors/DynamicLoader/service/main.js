const IFC = require("../../../src/InspectorFrontController.js");
var CONST = require("../../../src/CoreConst.js");
const Disassembler = require("../../../src/Disassembler.js");

var Controller =  new IFC.FrontController();

var DEBUG = false;

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

/**
 * 
 * Not clean methods containing if-* and throw instruction
 * @param {*} context 
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
            if(flatternGotoOf(subject)) gotos++;
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


function hasSingleCall(method){
    if(method == null){
        console.log("method is null");
        return false;
    }
    if(Object.entries(method._useMethod).length !== 1 ) 
        return false;

    return true;
}

/**
 * Double static heuristic is when a static method wraps inconditionnally another statis method
 */
function renameDoubleStatic(database, method){

    if(!hasSingleCall(method)) return false;

    // check if the current method is static
    if(method.getModifier().isStatic() === false) return false;

    // get the called method
    let called = database.methods[ Object.keys(method._useMethod)[0] ];
    let args = Object.values(method._useMethod)[0];
    
    if(called == null 
        || called.getModifier() == null 
        || called.getModifier().isStatic() === false) return false;

    // add arg type comparison
    let paramOnly = true;
    args[0].forEach(x=>{
        if(x.t !== CONST.LEX.TOKEN.PARAM) paramOnly = false;
    });

    if(paramOnly === false) return false;

    if(called.enclosingClass.name !== method.enclosingClass.name){
        method.setAlias(called.enclosingClass.name+"_"+called.name);
    }else{
        method.setAlias(called.name);
    }

    return true;
}


/*

*/
function getInvokedMethod(context){
    let meth = context.find.call("calleed.tags:invoked").select("calleed");
    return meth.toJsonObject();
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
        case 'refresh_reflect':
            act.data.data = getInvokedMethod(ctx);
            
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
