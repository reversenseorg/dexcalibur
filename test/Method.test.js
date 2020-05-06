const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
const expect = chai.expect,
    should = chai.should();

const Path = require("path");

chai.use(sinonChai);

// -- App specific --


const CLASS = require("../src/CoreClass.js");

describe('Method node', function() {

    var project = null;

    before(function(){
        try{
            //project = new Project("owasp.mstg.uncrackable1", TEST_CONFIG, 0);
        }catch(ex){
            // ignore
        }
    });

    beforeEach(function() {

        Logger = require("../src/Logger.js")({
            testMode: true,
            debugMode: false
        },true);
    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('new', function() {
        let m = new CLASS.Method({
            enclosingClass: new CLASS.Class({ name: "java.lang.Class" }),
            name: "getMethod",
            args: [
                new CLASS.ObjectType("java.lang.String"),
                new CLASS.ObjectType("java.lang.Object",true) 
            ],
            ret: new CLASS.ObjectType("java.lang.reflect.Method")
        });

        it('autoconf enclosingClass', function () {
            expect(m.enclosingClass).to.be.an.instanceOf(CLASS.Class);
            expect(m.enclosingClass.name).to.equals("java.lang.Class");
        });

        it('autoconf name', function () {
            expect(m.name).to.equals("getMethod");
        });

        it('autoconf args', function () {
            expect(m.args).to.be.an("array");
            expect(m.args.length).to.equals(2);

            expect(m.args[0]).to.be.an.instanceOf(CLASS.ObjectType);
            expect(m.args[0].name).to.equals("java.lang.String");

            expect(m.args[1]).to.be.an.instanceOf(CLASS.ObjectType);
            expect(m.args[1].name).to.equals("java.lang.Object");
            expect(m.args[1].arr).to.equals(true);
        });

        it('autoconf return', function () {
            expect(m.ret).to.be.an.instanceOf(CLASS.ObjectType);
            expect(m.ret.name).to.equals("java.lang.reflect.Method");
        });
    });

    describe('properties', function() {

        it('configuration pat', function () {
            

           // expect(p.nofrida).to.equals(0);
        });
    });
});