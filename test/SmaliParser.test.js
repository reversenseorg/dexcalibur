var chai = require('chai'),
    sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

// --- App specific ---

var SmaliParser = require('../src/SmaliParser.js');


describe('SmaliParser', function() {

    beforeEach(function() {
        //console.log(process.cwd());
        //sinon.spy(console, 'log');
    });

    afterEach(function() {
       // console.log.restore();
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

});