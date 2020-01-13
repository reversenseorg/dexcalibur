'use strict';

const SmaliVM = require("./SmaliVM.js").VM;
const Util = require('./Utils.js');
var Logger = require("./Logger.js")();


const CR = ""; //\n";

class Simplifier {

    static instance = null;

    constructor(pContext){
        this.context = pContext;
        this.vm = null;
        this.simplified = {};
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


    simplify(pMethod, pLevel=0){
        let blocks = [], cs = {
            tag: null,
            intr: []
        };

        // init
        blocks =  pMethod.getBasicBlocks();
        if(blocks.length == 0) return cs;

        this.vm = new SmaliVM( pMethod, pMethod.locals, pMethod.args.length);

        // explore blocks
        this.vm.cleanVisitedBlock();
        this.vm.setSimplifyingLevel(pLevel);

        // execute smali and get simplified smali depending of select level
        cs.instr = this.startVM();

        Logger.debug(cs.instr.join("\n"));

        return cs;
    }

    startVM(){
        let ssmali=[], dec=null, f=0, ctxRST=false, pDepth=0, d=null;
        let bbs = this.vm.getEntrypoint().getBasicBlocks();
        this.vm.depth = 0;

        for(let i=0; i<bbs.length; i++){
            
            f = 0;
            ctxRST = false;

            ssmali.push("");

            if(bbs[i].isConditionalBlock()){
                this.vm.restoreContext(`:cond_${bbs[i].getCondLabel()}`);
                ctxRST = true;
                ssmali.push(`${CR}cond_${bbs[i].getCondLabel()}:`);
                f++;
            }
            if(bbs[i].isCatchBlock()){
                if(f>0) 
                    ssmali.push(`${bbs[i].getCatchLabel()}:`);
                else{
                    ssmali.push(`${CR}${bbs[i].getCatchLabel()}:`);
                    f++;
                }

                this.vm.depth++;
            }
            if(bbs[i].isGotoBlock()){

                this.vm.restoreContext(`:cond_${bbs[i].getGotoLabel()}`);
                
                if(f>0) 
                    ssmali.push(`goto_${bbs[i].getGotoLabel()}:`);
                else{
                    ssmali.push(`${CR}goto_${bbs[i].getGotoLabel()}:`);
                    f++;
                }
            }
            if(bbs[i].isTryBlock()){
                if(f==0) 
                    ssmali.push(`try{`);
                else
                    ssmali.push(`${CR}try{`);

                this.vm.depth++;
            }

            // exec basic block 
            dec = this.vm.run(bbs[i]);  

            if(!Util.isEmpty(dec.code, Util.FLAG_WS | Util.FLAG_CR | Util.FLAG_TB)){
                ssmali = ssmali.concat(dec.code);      
            }else{
                ssmali.push(`// empty block : dead code removed or block already simplified (contant propagated)`)
            }

            if(bbs[i].isTryEndBlock()){
                if(bbs[i].hasCatchStatement()){
                    d = bbs[i].getCatchStatements();
                    for(let i=0; i<d.length; i++){
                        if(d[i].getException() != null)
                            ssmali.push(`${"    ".repeat(this.vm.depth-1)}}catch(${d[i].getException().name}) ${d[i].getTarget().getCatchLabel()}`);
                        else
                            ssmali.push(`${"    ".repeat(this.vm.depth-1)}}catchall ${d[i].getTarget().getCatchLabel()}`);
                    }

                    this.vm.depth--;
                }else{
                    ssmali.push(`} try END\n`);
                    this.vm.depth--;
                }
            }
            else if(bbs[i].isCatchBlock()){
                this.vm.depth--;
            }
        }

        Logger.debug('[SIMPLIFIER] '+this.vm.countUntreated+' instructions not treated');
        return ssmali;
    }
}

module.exports = Simplifier;