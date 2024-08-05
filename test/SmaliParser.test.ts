import {expect} from 'chai';
import SmaliParser from "../dist/src/SmaliParser.js";
import {TestHelper} from "../dist/src/TestHelper.js";
import DexcaliburProject from "../dist/src/DexcaliburProject.js";
import {Modifier} from "../src/AccessFlags.js";
import {CONST} from "../src/CoreConst.js";

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


    // Source https://calebfenton.github.io/2016/07/31/understanding_dalvik_static_fields_1_of_2/
    describe('field ', function() {

        it('valid 1', function () {
            let parser = new SmaliParser();
            let src_line = 0;
            let test_line = ["private", "static", "TEST_FIELD_NAME:I", "=", "0x24"];
            let f1 = parser.field(test_line, src_line);
            expect(f1.name).to.be.equals('TEST_FIELD_NAME');
            expect(f1.type.name).to.be.equals(CONST.TYPES.I);
            expect(f1.getValue()).to.be.equals(0x24);
        });

        describe('test Field values and types', function() {

            it('valid Int', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myInt:I", "=", "-4"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.I);
                expect(f1.getValue()).to.be.equals(-4);
            });

            it('valid Short', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myShort:S", "=", "0xDEADS"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.S);
                expect(f1.getValue()).to.be.equals(0xDEAD);
            });

            it('valid Boolean', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myBoolean:Z", "=", "false"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.Z);
                expect(f1.getValue()).to.be.equals(false);
            });

            it('valid Char', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myChar:C", "=", "\n"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.C);
                expect(f1.getValue()).to.be.equals('\n');
            });

            it('valid Long', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myLong:J", "=", "1000000000l"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.J);
                expect(f1.getValue()).to.be.equals(1000000000);
            });

            it('valid Long 2', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myOtherLong:J", "=", "0x42424242L"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.J);
                expect(f1.getValue()).to.be.equals(0x42424242);
            });

            it('valid Float', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myFloat:F", "=", "NaN"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.F);
                expect(f1.getValue()).to.be.NaN;
            });

            it('valid Float 2', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "mySecondFloat:F", "=", "NaNf"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.F);
                expect(f1.getValue()).to.be.NaN;
            });

            it('valid Float 3', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myThirdFloat:F", "=", "3.14159265357"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.F);
                expect(f1.getValue()).to.be.equals(3.14159265357);
            });

            it('valid Float 4', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myFourthFloat:F", "=", "3.14159265357f"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.F);
                expect(f1.getValue()).to.be.equals(3.14159265357);
            });

            it('valid Double', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myDouble:D", "=", "10000000.9d"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.D);
                expect(f1.getValue()).to.be.equals(10000000.9);
            });

            it('valid Object null', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myObject:Ljava/lang/Object;", "=", "null"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals('java.lang.Object');
                expect(f1.getValue()).to.be.equals(null);
            });

            it('valid String', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myObject:Ljava/lang/String;", "=", "\"Neuro from the nerves, the \\\"silver\\\" paths.\""];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals('java.lang.String');
                expect(f1.getValue()).to.be.equals("Neuro from the nerves, the \"silver\" paths.");
            });

            it('valid String 2', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myObject:Ljava/lang/String;", "=", "\"2222\""];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals('java.lang.String');
                expect(f1.getValue()).to.be.equals("222");
            });


            it('valid Byte', function () {
                let parser = new SmaliParser();
                let src_line = 0;
                let test_line = ["static", "myByte:B", "=", "0x5t"];
                let f1 = parser.field(test_line, src_line);
                expect(f1.type.name).to.be.equals(CONST.TYPES.B);
                expect(f1.getValue()).to.be.equals(0x5);
            });
        });

    });
});