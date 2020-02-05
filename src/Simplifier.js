'use strict';

const CONST = require("./CoreConst.js");
const CLASS = require("./CoreClass.js");
const SmaliVM = require("./SmaliVM.js");
const Util = require('./Utils.js');
var Logger = require("./Logger.js")();


const CR = ""; //\n";

class Simplifier {

    static instance = null;

    constructor(pContext){
        this.context = pContext;
        this.vm = null;
        this.simplified = {};
        
        this.parameters = null;
        this.maxdepth = -1;
        this.initParent = true;
    }


    /**
     * To get an instance of the decompiler.
     * Important : only one instance of this.decompiled should exist to
     * prevent method already analyzed, to be reprocessed.
     *  
     * @param {Project} pContext 
     */
    static getInstance(pContext){
        if(Simplifier.instance == null){
            Simplifier.instance = new Simplifier(pContext);
        }

        return Simplifier.instance;
    }

    /**
     * To perform forward and backward analysis. It allows to identify 
     *  IF statement, GOTO, and more
     * @param {Method} pMethod 
     */
    analyzeBlocks(pMethod){
        
        let blocks =  pMethod.getBasicBlocks();

        if(blocks.length == 0) return null;

        let self = null, next=null, instrStack=[];
        let entry = blocks[0], instr=null, jump=false;

        // forward analysis
        self = entry;
        for(let i=0; i<blocks.length ; i++){

            if(blocks[i].isVisited()) continue;


            instrStack.push({ i:blocks[i], t:'b' });

            instr = blocks[i].getInstructions();  
            jump = false;
            for(let k=0; k<instr.length; k++){
                
                instrStack.push({ i:instr[k], t:'i' });

                if(instr[k].opcode.type == CONST.INSTR_TYPE.IF){
                    //console.log("IF-", instr[k]);
                    next =  pMethod.getBasicBlockByLabel(instr[k].right.name, CONST.INSTR_TYPE.IF);
                    Logger.debug(`Block ${i} IF => Block ${next.offset}`)
                    blocks[i].addSuccessor(next);
                    if(next.hasPredecessor(blocks[i])==false){
                        next.addPredecessor(blocks[i]);
                    }
                    if((blocks[i+1] !== undefined) 
                        && (blocks[i].hasSuccessor(blocks[i+1])==false)){
                        
                        Logger.debug(`Block ${i} ELSE => Block ${blocks[i+1].offset}`)
                        blocks[i].addSuccessor(blocks[i+1]);

                        if(blocks[i+1].hasPredecessor(blocks[i])==false){
                            blocks[i+1].addPredecessor(blocks[i]);
                        }
                    }
                    jump = true;
                }
                else if(instr[k].opcode.type == CONST.INSTR_TYPE.GOTO){
                    Logger.debug("GOTO", instr[k]);
                    next =  pMethod.getBasicBlockByLabel(instr[k].right.name, CONST.INSTR_TYPE.GOTO);
                    Logger.debug(`Block ${i} GOTO => Block ${next.offset}`)
                    blocks[i].addSuccessor(next);
                    if(next.hasPredecessor(blocks[i])==false){
                        next.addPredecessor(blocks[i]);
                    }
                    jump = true;
                }
                else if(instr[k].opcode.type == CONST.INSTR_TYPE.RET){
                    Logger.debug(`Block ${i} RETURN`)
                    jump = true;
                }
            }

            if((jump == false)
                && (blocks[i+1] !== undefined) 
                && (blocks[i].hasSuccessor(blocks[i+1])==false)){
                
                Logger.debug(`Block ${i} CONTINUE => Block ${blocks[i+1].offset}`)
                self.addSuccessor(blocks[i+1]);
                blocks[i+1].addPredecessor(blocks[i]);
            }
            blocks[i].visit();   
        }

        // backward analysis
        /*for(let i=0; i<blocks.length ; i++){

            if(blocks[i].hasSuccessors()){
                instr = blocks[i].getSuccessors();
                for(let k=0; k<instr.length; k++){
                    if(instr[k].hasPredecessor(blocks[i])==false){
                        Logger.debug(i," predecessor of ",k);
                        instr[k].addPredecessor(blocks[i]);
                    }
                }
            } 
        }*/

        return instrStack;
    }

    /**
     * 
     * @param {Object[]} pParamValues 
     */
    setParametersValues( pParamValues){
        this.parameters = pParamValues;
    }

    /**
     * 
     * @param {int} pMaxDepth Max depth of the callstack
     */
    setMaxDepth( pMaxDepth=-1){
        this.maxdepth = pMaxDepth;
    }   

    setupHooks( ){
        // getMethod => should return method from  pThis class 
        this.vm.defineHook(
            "java.lang.Class.getMethod(<java.lang.String><java.lang.Class>[])<java.lang.reflect.Method>",
            function( pVM, pThis, pArgs){
                // make call signature 
                let cls = pThis.getValue(), m=null, o=null ;
                if(pVM.isImm(pArgs[0])){
                    // method name is concrete!==

                    if(pArgs[1].getValue() !== null){
                        m = pVM.getMethodFromClass( pThis.getValue(), pArgs[0].getValue(), pArgs[1].getValue().getValue());
                    }else
                        m = null;

                    console.log('method found through reflect api :', (m!=null? m.signature():null));

                    o = pVM.heap.newInstance(pVM.context.find.get.class('java.lang.reflect.Method'));
                    //o = pVM.heap.getObject(o);
                    o.linkConcrete(m);

                    pVM.stack.pushReturn( new SmaliVM.Symbol(
                        'ret',
                        SmaliVM.DTYPE.OBJECT_REF,
                        //{ obj:m, type: m.ret._name},
                        o,
                        null
                    ));
                    
                    return m;
                }else{
                    // method name is unknow, return
                    //this.vm.stack.setLocalSymbol();
                    console.log("echec");
                    return ;
                }
            }
        );

        this.vm.defineHook(
            "java.lang.reflect.Method.invoke(<java.lang.Object><java.lang.Object>[])<java.lang.Object>",
            function( pVM, pThis, pArgs){
                let m = null;

                if(pThis.getValue() == null){
                    Logger.error('[VM] [HOOK] Fail to execute Method.invoke() hook : "this" is null.');
                    return null;
                }

                console.log(pVM.stack.print());

                m = pThis.getValue().getConcrete();

                // make call signature
                if(m instanceof CLASS.Method){
                    console.log("Invoke : Method ready to be invoked ", m.signature());
                    //console.log(pArgs);
                    pVM.invoke( m, pArgs[0], pArgs.slice(1));

                    // return result from invoked method
                    //return pVM.stack.popRet();
                }else{
                    console.log("Invoke : Method not found")
                }

                //console.log("Invoje par reflect API")
                //pVM.invoke( p, );
            }
        );

        this.vm.defineHook(
            "java.lang.String.charAt(<int>)<char>",
            function( pVM, pThis, pArgs){
                let m = null;

                if(pThis.getValue() == null){
                    Logger.error('[VM] [HOOK] Fail to execute String.charAt() hook : "this" is null.');
                    return null;
                }

//                m = pThis.getValue();
                console.log(pThis);

                if(pThis.getValue().hasConcrete()){
                    pVM.stack.pushReturn( new SmaliVM.Symbol(
                        SmaliVM.VTYPE.METH,
                        SmaliVM.DTYPE.IMM_CHAR,
                        pThis.getValue().getConcrete()[pArgs[0].hasValue()?pArgs[0].getValue():pArgs[0].getCode()],
                        null
                    ));
                }else{
                    pVM.stack.pushReturn( new SmaliVM.Symbol(
                        SmaliVM.VTYPE.METH,
                        SmaliVM.DTYPE.IMM_CHAR,
                        null,
                        `[${pArgs[0].hasValue()?pArgs[0].getValue():pArgs[0].getCode()}]`
                    ));
                }

                console.log(pVM.stack.print());
            }
        );

        this.vm.defineHook(
            "java.lang.StringBuilder.append(<java.lang.String>)<java.lang.StringBuilder>",
            function( pVM, pThis, pArgs){
                let m = null;

                if(pThis.getValue() == null){
                    Logger.error('[VM] [HOOK] Fail to execute StringBuilder.append() hook : "this" is null.');
                    return null;
                }

//                m = pThis.getValue();
                console.log(pThis);

                if(pThis.getValue().hasConcrete()){
                    if(pArgs[0].getValue().hasConcrete()){
                        pVM.stack.pushReturn( new SmaliVM.Symbol(
                            SmaliVM.VTYPE.METH,
                            SmaliVM.DTYPE.IMM_CHAR,
                            pThis.getValue().getConcrete()+pArgs[0].getValue().getConcrete(),
                            null
                        ));
                    }else{
                        pVM.stack.pushReturn( new SmaliVM.Symbol(
                            SmaliVM.VTYPE.METH,
                            SmaliVM.DTYPE.IMM_CHAR,
                            null,
                            '"'+pThis.getValue().getConcrete()+'" + ('+pArgs[0].getCode()+') '
                        ));
                    }
                }else{
                    pVM.stack.pushReturn( new SmaliVM.Symbol(
                        SmaliVM.VTYPE.METH,
                        SmaliVM.DTYPE.IMM_CHAR,
                        null,
                        `+ ${pArgs[0].hasValue()? '"'+pArgs[0].getValue()+'"':pArgs[0].getCode()}`
                    ));
                }

                console.log(pVM.stack.print());
            }
        );

        // ndroid.util.Log.d(<java.lang.String><java.lang.String>)<int>
        this.vm.defineHook(
            "android.util.Log.d(<java.lang.String><java.lang.String>)<int>",
            function( pVM, pThis, pArgs){
                
                console.log(pArgs[1].getValue());

                
                if(pArgs[0].getValue().hasConcrete() 
                    && pArgs[1].getValue().hasConcrete()){
                    pVM.writeLog(pArgs[0].getValue().getConcrete()+" "+pArgs[1].getValue().getConcrete());
                }
                else if(pArgs[0].getValue().hasConcrete()){
                    pVM.writeLog(pArgs[0].getValue().getConcrete()+" <arg1>");
                }
                else if(pArgs[1].getValue().hasConcrete()){
                    pVM.writeLog("<arg0> "+pArgs[1].getValue().getConcrete());
                }else{
                    pVM.writeLog("<arg0> <arg1>");
                }

                pVM.stack.pushReturn( new SmaliVM.Symbol(
                    SmaliVM.VTYPE.METH,
                    SmaliVM.DTYPE.IMM_NUMERIC,
                    1,
                    null
                ));
            }
        );
    }

    /**
     * To reset the Simplifier
     * 
     */
    reset(){
        this.parameters = null;
        this.maxdepth = -1;
        this.initParent = true;
    }

    /**
     * To allow the VM to load and init parent class of the method before runtime
     * 
     * It can impact performance, especially if <clinit> calls targeted method.  
     * 
     * @param {Boolean} pFlag If TRUE, the parent class of emulated method will be loaded before runtime. Else FALSE
     */
    setInitParentClass( pFlag){
        this.initParent = pFlag;
    }


    /**
     * To simplify a given method, it produces pseudo-code including optimization:
     * 
     * Some optimization are listed below :
     *  - Concrete value propagation
     *  - Useless goto are removed
     *  - If one or more arguments have concrete values, predicate contextually true or false are resolved and removed
     *  - Some string operation are 
     * 
     * @param {require('./CoreClass.js').Method} pMethod The method to simplify
     * @param {int} pLevel Simplifying level, default is 0 
     */
    simplify(pMethod, pLevel=0){
        let blocks = [], cs = {
            tag: null,
            intr: [],
            logs: [],
            events: []
        }, instrStack = null;

        // init
        blocks =  pMethod.getBasicBlocks();
        if(blocks.length == 0) return cs;

        this.vm = SmaliVM.VM.getInstance(this.context);

        this.setupHooks();

        // to load class declaring the method to execute
        // it helps to solve concrete value stored into fields because lot of
        // fields setters are located into clinit() method. 
        this.vm.setConfig({
            loadClassFirst: true,
            mockAndroidInternals: true,
            autoInstanceArgs: (this.parameters!=null),
            simplify: pLevel,
            maxdepth: this.maxdepth,
            initParent: this.initParent
        });
        
        this.vm.simplify = pLevel;
        // start to execute the method
        this.vm.softReset();

        try{
            this.vm.start(pMethod, null, this.parameters);

            cs.instr = this.vm.pcmaker.getCode();

            Logger.debug(cs.instr.join("\n"));
        }catch(e){
            //console.log("VM Error caught");
            console.log(e);
            cs.instr = ["// An exeception occured at runtime :",this.vm.stack.print()];
            
        }

        cs.logs = this.vm.readLog();

        return cs;
    }
}

module.exports = Simplifier;