import {expect} from 'chai';
import SmaliParser from "../dist/src/SmaliParser.js";
import {TestHelper} from "../dist/src/TestHelper.js";
import DexcaliburProject from "../dist/src/DexcaliburProject.js";
import {Modifier} from "../src/AccessFlags.js";

describe('SmaliParser', function() {

    beforeEach(function() {
        //console.log(process.cwd());
        //sinon.spy(console, 'log');
    });

    afterEach(function() {
       // console.log.restore();
    });


    describe('constructor ', function() {

        it('simple', function () {
            let parser = new SmaliParser( TestHelper.getDexcaliburProject());
            expect(parser.ctx).to.be.an.instanceOf(DexcaliburProject)
        });
    });


    describe('setContext', function() {

        it('valid', function () {
            let parser = new SmaliParser();
            expect(parser.ctx).to.be.equals(null);

            parser.setContext(TestHelper.getDexcaliburProject());
            expect(parser.ctx).to.be.an.instanceOf(DexcaliburProject);
        });
    });

    describe('isModifier - test if a word is a valid Access flag', function() {

        it('public', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('public')).to.equals(true);
        });

        it('protected', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('protected')).to.equals(true);
        });

        it('private', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('private')).to.equals(true);
        });

        it('static', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('static')).to.equals(true);
        });

        it('final', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('final')).to.equals(true);
        });

        it('synchronized', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('synchronized')).to.equals(true);
        });

        it('volatile', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('volatile')).to.equals(true);
        });

        it('bridge', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('bridge')).to.equals(true);
        });

        it('varargs', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('varargs')).to.equals(true);
        });

        it('native', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('native')).to.equals(true);
        });

        it('interface', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('interface')).to.equals(true);
        });

        it('abstract', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('abstract')).to.equals(true);
        });

        it('strictfp', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('strictfp')).to.equals(true);
        });

        it('synthetic', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('synthetic')).to.equals(true);
        });

        it('annotation', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('annotation')).to.equals(true);
        });

        it('enum', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('enum')).to.equals(true);
        });

        it('constructor', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('constructor')).to.equals(true);
        });

        it('declared-synchronized', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('declared-synchronized')).to.equals(true);
        });

        it('system (invalid access flag)', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('system')).to.equals(false);
        });

        it('.line (invalid access flag)', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('.line')).to.equals(false);
        });

        it('.method (invalid access flag)', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('.method')).to.equals(false);
        });

        it('<init> (invalid access flag)', function () {
            let parser = new SmaliParser();
            
            expect(parser.isModifier('<init>')).to.equals(false);
        });
    });

    describe('SmaliParser::modifier ', function() {


        it('string[], matchCounter', function () {
            let ctr_1 = {c:0};

            let mod = SmaliParser.modifier(
                [ 'public', 'static', 'final', 'PLAYBACK_TYPE_LOCAL:I', '=', '0x1' ],
                ctr_1
            );

            expect(mod).to.equals(Modifier.STATIC|Modifier.PUBLIC|Modifier.FINAL);
            expect(ctr_1.c).to.equals(3);
        });


        it('string[], matchCounter. Additionnal spaces', function () {
            let ctr_1 = {c:0};

            let mod = SmaliParser.modifier(
                [ 'constructor', '<init>', '(ILandroid/media/AudioAttributes;', 'III', ')V' ] ,
                ctr_1
            );

            expect(mod).to.equals(Modifier.CONSTRUCT|Modifier.PUBLIC);
            expect(ctr_1.c).to.equals(1);
        });

        it('string, matchCounter', function () {
            let ctr_1 = {c:0};

            let mod = SmaliParser.modifier(
                'public static final PLAYBACK_TYPE_LOCAL:I = 0x1',
                ctr_1
            );

            expect(mod).to.equals(Modifier.STATIC|Modifier.PUBLIC|Modifier.FINAL);
            expect(ctr_1.c).to.equals(3);
        });
    });

    describe('SmaliParser::fqcn', function() {

        it('valid 1', function () {
            let fq1 = SmaliParser.fqcn('Ljava/lang/String;');
            expect(fq1).to.be.equals('java.lang.String');
        });
        it('valid 2', function () {
            let fq1 = SmaliParser.fqcn('Ljava/lang/String$A;');
            expect(fq1).to.be.equals('java.lang.String$A');
        });
        it('valid 3', function () {
            let fq1 = SmaliParser.fqcn('Ljava/lang/String$A$1;');
            expect(fq1).to.be.equals('java.lang.String$A$1');
        });
        it('valid 4', function () {
            let fq1 = SmaliParser.fqcn('LRootClass;');
            expect(fq1).to.be.equals('RootClass');
        });
        it('valid 5', function () {
            let fq1 = SmaliParser.fqcn('LString$1$1$A;');
            expect(fq1).to.be.equals('String$1$1$A');
        });
        it('valid 6', function () {
            let fq1 = SmaliParser.fqcn(['Ljava/lang/String;']);
            expect(fq1).to.be.equals('java.lang.String');
        });
        it('invalid 1', function () {
            let fq1:any;
            try{
                fq1 = SmaliParser.fqcn('L;');
            }catch(err){
                fq1 = -1;
            }

            expect(fq1).to.be.equals(-1);
        });
        it('invalid 2', function () {
            let fq1:any;
            try{
                fq1 = SmaliParser.fqcn('L/;');
            }catch(err){
                fq1 = -1;
            }

            expect(fq1).to.be.equals(-1);
        });
        it('invalid 3', function () {
            let fq1:any;
            try{
                fq1 = SmaliParser.fqcn([]);
            }catch(err){
                fq1 = -1;
            }

            expect(fq1).to.be.equals(-1);
        });
    });


    describe('fspath ', function() {

        it('valid 1', function () {
            let parser = new SmaliParser( TestHelper.getDexcaliburProject());
            expect(parser.ctx).to.be.an.instanceOf(DexcaliburProject)
        });
    });
});