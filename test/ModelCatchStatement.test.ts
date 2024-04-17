
import chai = require("chai");

import ModelCatchStatement from "../src/ModelCatchStatement.js";
import ModelBasicBlock from "../src/ModelBasicBlock.js";
import ModelClass from "../src/ModelClass.js";


let expect:Chai.ExpectStatic = chai.expect;



describe('CatchStatement', function() {


    describe('new', function() {

        it('new', function(){
            let mod:ModelCatchStatement = new ModelCatchStatement();
            expect(mod).to.be.an.instanceOf(ModelCatchStatement);
        });
    });

    describe('setException / getException', function() {

        let mod:ModelCatchStatement = new ModelCatchStatement();

        it('normal', function(){
            mod.setException(new ModelClass({ name:'a.b.Test', simpleName:'Test' }));

            expect(mod.getException()).to.be.an.instanceOf(ModelClass);
            expect(mod.getException().name).to.equals('a.b.Test');
        });
    });

    describe('setTryStart / getTryStart', function() {

        let mod:ModelCatchStatement = new ModelCatchStatement();

        it('with string args', function(){
            mod.setTryStart("try_start_1");
            expect(mod.getTryStart()).to.equals("try_start_1");
        });

        it('with BB args', function(){
            let bbStart:ModelBasicBlock = new ModelBasicBlock({ try_name: "try_start_1", line:100 });
            let bbEnd:ModelBasicBlock = new ModelBasicBlock({ try_name: "try_end_1", line:2000 });

            mod.setTryStart(bbStart);

            expect(mod.getTryStart()).to.be.an.instanceOf(ModelBasicBlock);

            let bb = mod.getTryStart() as ModelBasicBlock;

            expect(bb.getTryStartLabel()).to.equals("try_start_1");
        });

    });

    describe('setTryEnd / getTryEnd', function() {

        let mod:ModelCatchStatement = new ModelCatchStatement();

        it('with string args', function(){
            mod.setTryEnd("try_end_1");
            expect(mod.getTryEnd()).to.equals("try_end_1");
        });

        it('with BB args', function(){
            let bbEnd:ModelBasicBlock = new ModelBasicBlock({ try_name: "try_end_1", line:2000 });

            mod.setTryEnd(bbEnd);

            expect(mod.getTryEnd()).to.be.an.instanceOf(ModelBasicBlock);

            let bb = mod.getTryEnd() as ModelBasicBlock;

            expect(bb.getTryEndLabel()).to.equals("try_start_1");
        });

    });

    // TODO setTarget / getTarget unit test
    /*
    describe('setTarget / getTarget', function() {

        let mod:ModelCatchStatement = new ModelCatchStatement();

        it('with string args', function(){
            mod.setTarget("try_end_1");
            expect(mod.getTarget()).to.equals("try_end_1");
        });

        it('with BB args', function(){
            let bbEnd:ModelBasicBlock = new ModelBasicBlock({ try_name: "try_end_1", line:2000 });

            mod.setTryEnd(bbEnd);

            expect(mod.getTryEnd()).to.be.an.instanceOf(ModelBasicBlock);

            let bb = mod.getTryEnd() as ModelBasicBlock;

            expect(bb.getTryEndLabel()).to.equals("try_start_1");
        });

    });*/
});