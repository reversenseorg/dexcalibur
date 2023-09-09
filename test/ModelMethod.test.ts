import {expect} from 'chai';
import ModelClass from "../dist/src/ModelClass.js";
import {ModelObjectType} from "../dist/src/ModelType.js";
import ModelMethod from "../dist/src/ModelMethod.js";


describe('ModelMethod node', function() {


    before(function(){
    });

    beforeEach(function() {

    });

    afterEach(function() {
       // console.log.restore();
    });
    
    describe('new', function() {
        let m = new ModelMethod({
            enclosingClass: new ModelClass({ name: "java.lang.Class" }),
            name: "getMethod",
            args: [
                new ModelObjectType("java.lang.String"),
                new ModelObjectType("java.lang.Object",true)
            ],
            ret: new ModelObjectType("java.lang.reflect.Method")
        });

        it('autoconf enclosingClass', function () {
            expect(m.enclosingClass).to.be.an.instanceOf(ModelClass);
            expect(m.enclosingClass.name).to.equals("java.lang.Class");
        });

        it('autoconf name', function () {
            expect(m.name).to.equals("getMethod");
        });

        it('autoconf args', function () {
            expect(m.args).to.be.an("array");
            expect(m.args.length).to.equals(2);

            expect(m.args[0]).to.be.an.instanceOf(ModelObjectType);
            expect(m.args[0].name).to.equals("java.lang.String");

            expect(m.args[1]).to.be.an.instanceOf(ModelObjectType);
            expect(m.args[1].name).to.equals("java.lang.Object");
            expect(m.args[1].arr).to.equals(true);
        });

        it('autoconf return', function () {
            expect(m.ret).to.be.an.instanceOf(ModelObjectType);
            expect(m.ret.name).to.equals("java.lang.reflect.Method");
        });
    });

    describe('properties', function() {

        it('configuration pat', function () {
            

           // expect(p.nofrida).to.equals(0);
        });
    });
});