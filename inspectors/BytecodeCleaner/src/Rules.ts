import {CONST} from "../../../src/CoreConst";
import DexcaliburProject from "../../../src/DexcaliburProject";
import ModelMethod from "../../../src/ModelMethod";
import ModelInstruction from "../../../src/ModelInstruction";
import AnalyzerDatabase from "../../../src/AnalyzerDatabase";
import {Modifier} from "../../../src/AccessFlags";


const DEBUG = false;

export class Rules {

    static countNopOpcode(pMeth:ModelMethod):any {
        let opcode:any = null;
        const counters = {
            anyCtr: 0,
            nopCtr: 0
        };

        if( pMeth.instr != null && pMeth.instr.length > 0){
            for(let i=0; i<pMeth.instr.length ; i++){
                for(let j=0; j<pMeth.instr[i].stack.length; j++){
                    opcode = pMeth.instr[i].stack[j].opcode;
                    if(opcode != null && opcode.type===CONST.INSTR_TYPE.NOP){
                        counters.nopCtr++;
                    }
                    counters.anyCtr++;
                }
            }
        }

        return counters;
    }


    /**
     * Count NOP instructions
     */
    static nopCount(context:DexcaliburProject, pMeth:ModelMethod=null):any{

        const counters = {
            any: 0,
            nop: 0
        };

        if(pMeth==null){
            context.analyze.db.methods.map((k:any,v:ModelMethod)=>{
                const ctr:any = Rules.countNopOpcode(v);
                counters.any += ctr.anyCtr;
                counters.nop += ctr.nopCtr;
            });
        }else{
            const ctr:any = Rules.countNopOpcode(pMeth);
            counters.any = ctr.anyCtr;
            counters.nop = ctr.nopCtr;
        }

        return { status:200, data:{ success:true, data:counters }};
    }

    /**
     * To clenaup basic block by removing NOP opcodes
     * @param pMeth
     */
    static cleanNopOpcode(pMeth:ModelMethod):any {
        let opcode:any = null;
        let newbb:any;
        const counters = {
            nopCtr: 0
        };

        if( pMeth.instr != null && pMeth.instr.length > 0){
            for(let i=0; i<pMeth.instr.length ; i++){
                newbb = [];
                for(let j=0; j<pMeth.instr[i].stack.length; j++){

                    opcode = pMeth.instr[i].stack[j].opcode;
                    if(opcode != null && opcode.type !==CONST.INSTR_TYPE.NOP){
                        newbb.push(pMeth.instr[i].stack[j]);
                    }else{
                        counters.nopCtr++;
                    }
                }
                pMeth.instr[i].stack = newbb;
            }
        }

        return counters;
    }

    static nopClean(context:DexcaliburProject, pMeth:ModelMethod = null):any{
        /*
        context.analyze.db.methods.map((k,v)=>{
            let opcode:any=null;
            if( v.instr != null && v.instr.length > 0){
                for(let i=0; i<v.instr.length ; i++){
                    newbb = [];
                    for(let j=0; j<v.instr[i].stack.length; j++){

                        opcode = v.instr[i].stack[j].opcode;
                        if(opcode != null && opcode.type !==CONST.INSTR_TYPE.NOP){
                            newbb.push(v.instr[i].stack[j]);
                        }else{
                            counters.nop++;
                        }
                    }
                    v.instr[i].stack = newbb;
                }
            }
        });*/

        const counters:any = {
            nop: 0
        };

        if(pMeth==null){
            context.analyze.db.methods.map((k:any,v:ModelMethod)=>{
                const ctr:any = Rules.cleanNopOpcode(v);
                counters.nop += ctr.nopCtr;
            });
        }else{
            const ctr:any = Rules.cleanNopOpcode(pMeth);
            counters.nop = ctr.nopCtr;
        }

        return { status:200, data:{ success:true, data:counters } };
    }


    /**
     * To return a list of basic block from a specified label
     * @param method
     * @param goto_name
     */
    static gotoLocalXref(method:ModelMethod, goto_name:string):any{
        const xref:any = {
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

    /**
     *
     * @param method
     */
    static checkIfEligible(method:ModelMethod):boolean{

        const notElgible = [
            CONST.INSTR_TYPE.IF,
            CONST.INSTR_TYPE.SWITCH,
            CONST.INSTR_TYPE.MONITOR
        ];
        let instruction:ModelInstruction;

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

    /**
     * To gather GOTO label whith only a single jump to this label.
     *
     * @param method
     */
    static findSingleGoto(method:ModelMethod):string[]{
        const found:any = {}, singles:any = [];
        let instruction:ModelInstruction;

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

                        //if(found[instruction.right.name]==1) console.log("block "+i+", instr "+j+", goto "+instruction.right.name);
                    }
                }
            }
        }

        // filter
        for(const i in found){
            if(found[i]===1)
                singles.push(i);
        }

        if(singles.length > 0){
//        Disassembler.method(method);
            //console.log(singles);
        }


        return singles;
    }


    static nextSingleGoto(method:ModelMethod):any{
        const found:any = {}, singles:any = [];
        let instruction:ModelInstruction;

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
                    }
                }
            }
        }

        // filter
        for(const i in found){
            if(found[i]===1)
                return i;
        }



        return null;
    }

    /**
     * To check if an instruction do statically an inconditionnal jump or not
     * @param instr
     */
    static isJump(instr:ModelInstruction):boolean{
        return instr !=null
            && instr.opcode != null
            && (instr.opcode.type==CONST.INSTR_TYPE.GOTO || instr.opcode.type==CONST.INSTR_TYPE.RET );
    }

    /**
     * To check if a basic block contains jump to another block
     * @param block
     * @param label
     */
    static hasJump(block:ModelInstruction[], label=null){
        let f = false;
        if(label == null)
            block.forEach(element => {
                if(Rules.isJump(element)){
                    f = true;
                }
            });
        else
            block.forEach(element => {
                if(Rules.isJump(element)){
                    f = (element.right.name==label);
                }
            });

        return f;
    }


    static isReturn(instr:ModelInstruction):boolean{
        return instr !=null
            && instr.opcode != null
            && (instr.opcode.type==CONST.INSTR_TYPE.RET );
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
    static findTargetBasicBlocks(method:ModelMethod, gotoLabel:string):any{
        //console.log("Searching block at :goto_"+gotoLabel);
        let targetBBs:any = null, found:any=false, offset:any=0, duplicate:any=false;
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
                    if(Rules.hasJump(method.instr[i].stack)){
                        if(DEBUG) console.log("block has jump :",method.instr[i].goto_name,gotoLabel,targetBBs);
                        break;
                    }
                }
                else if(found){
                    targetBBs.push(method.instr[i]);
                    //console.log(hasJump(method.instr[i].stack));

                    if(method.instr[i].hasInstr(CONST.INSTR_TYPE.RET))
                        duplicate = true;

                    if(Rules.hasJump(method.instr[i].stack)){
                        if(DEBUG) console.log("block has jump POST :",gotoLabel,targetBBs[targetBBs.length-1].stack);
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

    static moveBasicBlock(method:any, bblocks:any, gotoLabel:any):any{
        //console.log("Moving basic blocks "+bblocks.offset+"(len:"+bblocks.blk.length+") at instr goto_"+gotoLabel);
        let bbs:any = [], flag:any=false, lastWasGoto:any=false, endbb:any=0, tmp:any=null;
        let instruction:any, frag:any;
        // find cut point
        if( method.instr != null && method.instr.length > 0){

            for(let i=0; i<method.instr.length ; i++){


                for(let j=0; j<method.instr[i].stack.length; j++){

                    instruction = method.instr[i].stack[j];
                    lastWasGoto=false

                    if(instruction == null){
                        continue;
                    }

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
                                //console.log("Targeted block before");
                            }else if(bblocks.offset>i){

                                bbs = method.instr.slice(0,i+1);

                                //console.log("Targeted block after");

                            }


                            //Disassembler.method(method);
                            if(method.instr[i].stack != undefined && method.instr[i].stack.length>0){
                                //    console.log("Remove goto instruction");


                                // si le dernier basic block est un return-* on duplique
                                // sinon on déplace

                                if(bbs[bbs.length-1] == undefined){
                                    //console.log("The new list of blocks is null : ",bbs.length,bbs);
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
                                    tmp = [];

                                    for(let ii=0; ii<bbs[bbs.length-1].stack.length; ii++){
                                        if(bbs[bbs.length-1].stack[ii].opcode.type==CONST.INSTR_TYPE.GOTO) continue;

                                        tmp.push(bbs[bbs.length-1].stack[ii]);
                                    }
                                    bbs[bbs.length-1].stack = tmp;

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
                                    //console.log(i+1,bblocks.offset, endbb+1, method.instr.slice(i+1, bblocks.offset));
                                    bbs = bbs.concat(method.instr.slice(i+1, bblocks.offset));
                                    bbs = bbs.concat(method.instr.slice(endbb ));
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

            }
        }

        //method.instr = bbs;
        return bbs;
    }


    /**
     * @deprecated
     * @param method
     * @return {boolean}
     */
    static  flatternGotoOf(method:ModelMethod){

        const blocksToMove = null;
        const singleGoto = Rules.findSingleGoto(method);
        const ret = false;
        const disass = false;
        /*
            if(singleGoto.length > 0){
                singleGoto.sort();

                if(DEBUG){
                    Disassembler.method(method);
                }

                for(let i=0; i<singleGoto.length; i++){

                    //console.log("flat : ",singleGoto[i]);
                    if(DEBUG){
                        Disassembler.method(method);
                    }

                    blocksToMove = findTargetBasicBlocks(method, singleGoto[i]);
                    if(blocksToMove.blk !== null){

                        if(DEBUG){
                            blocksToMove.blk.forEach(x=>console.log(x.stack));
                            console.log(blocksToMove, singleGoto[i])
                        }

                        method.instr = moveBasicBlock(method, blocksToMove, singleGoto[i]);
                        if(DEBUG)
                            Disassembler.method(method);
                        ret = true;
                    }
                }
            }*/

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

    /**
     *
     * Not clean methods containing if-* and throw instruction
     * @param {*} context
     */
    static  gotoConditionnalClean(context:DexcaliburProject){
        console.log("Conditional goto clean");
        let gotos = 0;


        context.analyze.db.methods.map((k:any,v:ModelMethod)=>{
            if(Rules.checkIfEligible(v)==false) return;

            if( v != null && v.instr != null && v.instr.length > 0){
                if(Rules.flatternGotoOf(v)) gotos++;
            }
        });

        return { status:200, data:{ count:gotos }};
    }

    static gotoClean(context:DexcaliburProject){
        console.log("Inconditional goto clean");

        const counters:any = {
            goto: 0
        };

        context.analyze.db.methods.map((k:any,v:ModelMethod)=>{
            if( v != null && v.instr != null && v.instr.length > 0){
                if(Rules.flatternGotoOf(v)) counters.goto++;
            }
        });

        return { status:200, data:{ counter:counters.goto } };
    }


    static hasSingleCall(pMethod:ModelMethod){
        if(pMethod == null){
            console.log("method is null");
            return false;
        }
        if(Object.entries(pMethod._useMethod).length !== 1 )
            return false;

        return true;
    }

    /**
     * TODO
     * Double static heuristic is when a static method wraps  another static method
     */
    static renameDoubleStatic(database:AnalyzerDatabase, method:ModelMethod, pContext:DexcaliburProject):boolean{
        if(!Rules.hasSingleCall(method)) return false;


        // check if the current method is static
        if((method.getModifier() & Modifier.STATIC) === 0) return false;


        // get the called method
        const called:ModelMethod = database.methods.getEntry( Object.keys(method._useMethod)[0] );
        const args:any= Object.values(method._useMethod)[0];

        if(called == null
            || called.getModifier() == null
            || ((called.getModifier() & Modifier.STATIC) === 0)) return false;

        //let args = called.args;

        // add arg type comparison
        let paramOnly = 0;
        if(args.length > 0){
            args.map( pLocation => {
                const instr:any = method.getInstr(pLocation.bb,pLocation.instr);
                if(instr != null){
                    instr.left.map( vParam => {
                        if(vParam.t !== CONST.LEX.TOKEN.PARAM) paramOnly++;// = false;
                    })
                }
            })
            /*
            console.log(args, args[0], method.getInstr(args[0].bb,args[0].instr)) ;
            args[0].forEach(x=>{
                if(x.t !== CONST.LEX.TOKEN.PARAM) paramOnly = false;
            });*/
        }

        if(paramOnly > 0) return false;

        if(called.enclosingClass.name !== method.enclosingClass.name){
            method.setAlias(called.enclosingClass.name+"_"+called.name);
        }else{
            method.setAlias(called.name);
        }

        return true;
    }


    /**
     * TODO renameStaticInterface
     * static
     * test/toto;->doSomething(Ltest/blabla;Ljava/lang/String;)Ljava/io/File;
     *
     * invoke-virtual {p0, p1}, Ltest/blabla;->a0cc175b9(Ljava/lang/String;)Ljava/io/File;
     *    move-result-object v0
     * return-object v0
     */

    static renameStaticInterface(database:AnalyzerDatabase, method:ModelMethod, pContext:DexcaliburProject):boolean{

        if(!Rules.hasSingleCall(method)) return false;
        if(method.args.length==0) return false;

        // get the called method
        const called:ModelMethod = database.methods.getEntry( Object.keys(method._useMethod)[0] );
        const args:any = Object.values(method._useMethod)[0];
        //let param = method.args[0];

        // check if the called method is not null
        if(called == null){
            // if is often caused by extended methods which cannot be resolved

            // parsing error found
            console.log("[ERROR] The called method is NULL. It seems to  be a parsing error. Caller : ",method.signature());
            return false;
        }

        // check if the method is not static
        // TODO :  add check based on the opcode type instead of the modifiers of the called method
        if(called.getModifier() == null
            || ((called.getModifier() & Modifier.STATIC) === 0)) return false;


        // check if the first param of the caller is an
        // instance of the class who defines the called method
        if(method.args[0].name !== called.enclosingClass.name)
            return false;

        // check if each parameter of the called method are parameter of the caller
        // {p0, p1} or {p0 ... p5}

        let paramOnly = 0;
        if(args.length > 0){
            args.map( pLocation => {
                const instr = method.getInstr(pLocation.bb,pLocation.instr);
                if(instr != null){
                    instr.left.map( vParam => {
                        if(vParam.t !== CONST.LEX.TOKEN.PARAM)
                            paramOnly++; // = false;
                    })
                }
            })
        }

        if(paramOnly > 0) return false;

        // check if some parameters of the called method are defined statically and locally
        if(called.enclosingClass.name !== method.enclosingClass.name){
            method.setAlias(called.enclosingClass.name+"_"+called.name);

        }else{
            method.setAlias(called.name);
        }

        return true;
    }



    static wrapClean(context:DexcaliburProject, pMethod:ModelMethod = null):any{

        const db:AnalyzerDatabase = context.analyze.getInternalDB();
        const ctr:any = {
            doubleStatic: {
                ctr: 0,
                o: []
            },
            staticInterface: {
                ctr: 0,
                o: []
            }
        };

        // scan with several heuristic
        db.methods.map((k:any,v:ModelMethod)=>{
            if(Rules.renameDoubleStatic(db, v, context)){
                ctr.doubleStatic.ctr++;
                ctr.doubleStatic.o.push(v.signature());
                return;
            }
            if(Rules.renameStaticInterface(db, v, context)){
                ctr.staticInterface.ctr++;
                ctr.staticInterface.o.push(v.signature());
                return;
            }
        });


        return { status:200, data:{ success:true, data:{ counter:ctr } }  };
    }


}













// ======= Goto =========
