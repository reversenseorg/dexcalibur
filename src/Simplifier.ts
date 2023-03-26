'use strict';


import DexcaliburProject from "./DexcaliburProject.js";
import {DexcaliburVM} from "./DexcaliburVM.js";
import ModelMethod from "./ModelMethod.js";
import ModelBasicBlock from "./ModelBasicBlock.js";
import ModelInstruction from "./ModelInstruction.js";
import {CONST} from "./CoreConst.js";
import * as Log from './Logger.js';
import DDVM_Symbol from "./android/DDVM_Symbol.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


const CR = ""; //\n";

interface Step {
    i:ModelBasicBlock|ModelInstruction;
    t:string
}


var gInstance:Simplifier = null;

export default class Simplifier
{
    context:DexcaliburProject = null;
    vm:DexcaliburVM = null;
    simplified:any = {};
    parameters:any = null;
    maxdepth:number = -1;
    initParent:boolean = true;


    constructor( pContext:DexcaliburProject ){
        this.context = pContext;
        this.vm = pContext.getVM();
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
    static getInstance(pContext:DexcaliburProject = null):Simplifier{
        if(gInstance == null && pContext != null){
            gInstance = new Simplifier(pContext);
        }

        return gInstance;
    }



    /**
     * 
     * @param {Object[]} pParamValues 
     */
    setParametersValues( pParamValues:any):void{
        this.parameters = pParamValues;
    }

    /**
     * 
     * @param {int} pMaxDepth Max depth of the callstack
     */
    setMaxDepth( pMaxDepth:number=-1):void{
        this.maxdepth = pMaxDepth;
    }

    /**
     * @method
     */
    setupHook():void{
        if(this.vm != null)
            this.vm.setupHooks();
        else
            throw new Error('[SIMPLIFIER] VM is undefined.');
    }

    /**
     * To reset the Simplifier
     * 
     */
    reset():void{
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
    setInitParentClass( pFlag:boolean):void{
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
     * @return {void}
     * @method
     * @since 0.7.x
     * @author Georges-B. MICHEL
     */
    simplify( pMethod:ModelMethod, pLevel:number=0):void{

        let blocks:ModelBasicBlock[], cs:any = {
            tag: null,
            intr: [],
            logs: [],
            events: []
        };

        // init
        blocks = pMethod.getBasicBlocks();
        if(blocks.length == 0)
            return cs;

        this.setupHook();

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

        // start to execute the method
        this.vm.softReset();

        try{
            this.vm.start(pMethod, null, this.parameters);

            //cs.instr = this.vm.pcmaker.getCode();
            cs.instr = this.vm.getPseudoCode();

            Logger.debug(cs.instr.join( require('os').EOL ));
        }catch(e){
            //console.log("VM Error caught");
            //console.log(e);
            cs.instr = ["// An exeception occured at runtime :",this.vm.printStackTrace()];
            
        }

//        cs.logs = this.vm.readLog();
        cs.logs = this.vm.getLog();


        return cs;
    }
}
