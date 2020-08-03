import {expect} from 'chai';
import {Stub, STUB_TYPE} from "../dist/src/ModelSavable";
import {ModelObjectType} from "../dist/src/ModelType";

describe('ObjectType node', function() {


    beforeEach(function() {

    });

    describe('new', function() {

        it('single object', function () {
            let ot = new ModelObjectType("java.lang.String");

            expect(ot).to.be.an.instanceOf(ModelObjectType);
            expect(ot.name).to.equals("java.lang.String");
            expect(ot.arr).to.equals(false);
            expect(ot._name).to.equals("java.lang.String");
            expect(ot._hashcode).to.equals("java.lang.String");
            expect(ot.tags).to.be.an('array');
            expect(ot.tags.length).to.equals(0);
        });

        it('array', function () {
            let ot = new ModelObjectType("java.lang.String", true);

            expect(ot).to.be.an.instanceOf(ModelObjectType);
            expect(ot.name).to.equals("java.lang.String");
            expect(ot.arr).to.equals(true);
            expect(ot._name).to.equals("java.lang.String");
            expect(ot._hashcode).to.equals("java.lang.String");
            expect(ot.tags).to.be.an('array');
            expect(ot.tags.length).to.equals(0);
        });
    });

    describe('isString()', function() {

        it('builtin String', function () {
            let ot = new ModelObjectType("java.lang.String");
            expect(ot.isString()).to.equals(true);

        });

        it('not a builtin String', function () {
            let ot = new ModelObjectType("java.lang.Object");
            expect(ot.isString()).to.equals(false);
        });
    });

    describe('signature()', function() {

        it('single instance', function () {
            let ot = new ModelObjectType("java.lang.String");
            expect(ot.signature()).to.equals("<java.lang.String>");
        });

        it('array of instances', function () {
            let ot = new ModelObjectType("java.lang.Object",true);
            expect(ot.signature()).to.equals("<java.lang.Object>[]");
        });
    });


    describe('tag management', function() {

        it('addTag()', function () {
            let ot = new ModelObjectType("java.lang.String");
            ot.addTag('key');
            ot.addTag('rsa');

            expect(ot.tags.length).to.equals(2);
            expect(ot.tags.indexOf('key')).to.equals(0);
            expect(ot.tags.indexOf('rsa')).to.equals(1);
            expect(ot.tags.indexOf('xxxxx')).to.equals(-1);
        });

        it('getTags()', function () {
            let ot = new ModelObjectType("java.lang.String");
            ot.addTag('key');
            ot.addTag('rsa');

            let tags = ot.getTags();
            expect(tags.length).to.equals(2);
            expect(tags.indexOf('key')).to.equals(0);
            expect(tags.indexOf('rsa')).to.equals(1);
            expect(tags.indexOf('notExists')).to.equals(-1);

            ot = new ModelObjectType("java.lang.Object");
            tags = ot.getTags();

            expect(tags.length).to.equals(0);
            expect(tags.indexOf('key')).to.equals(-1);
            expect(tags.indexOf('rsa')).to.equals(-1);
        });

        it('hasTag()', function () {
            let ot = new ModelObjectType("java.lang.String");
            ot.addTag('key');
            ot.addTag('rsa');


            expect(ot.hasTag('key')).to.equals(true);
            expect(ot.hasTag('rsa')).to.equals(true);
            expect(ot.hasTag('xxxx')).to.equals(false);
        });
    });


    describe('toJsonObject()', function() {

        it('serialize single instance', function () {
            let ot = new ModelObjectType("java.lang.String");
            let jsonObj = ot.toJsonObject();

            expect(jsonObj.name).to.equals("java.lang.String");
            expect(jsonObj.arr).to.equals(false);
            expect(jsonObj.primitive).to.equals(false);
        });

        it('serialize array of instances ', function () {
            let ot = new ModelObjectType("java.lang.String",true);
            let jsonObj = ot.toJsonObject();


            expect(ot.signature()).to.equals("<java.lang.String>[]");
            expect(jsonObj.name).to.equals("java.lang.String");
            expect(jsonObj.arr).to.equals(true);
            expect(jsonObj.primitive).to.equals(false);
        });
    });



    describe('hashcode()', function() {

        it('signle instance', function () {
            let ot = new ModelObjectType("java.lang.String");
            expect(ot.hashcode()).to.equals("java.lang.String");
        });

        it('array of instance', function () {
            let ot = new ModelObjectType("java.lang.String",true);
            expect(ot.hashcode()).to.equals("java.lang.String");
        });
    });



    describe('sprint()', function() {

        it('signle instance', function () {
            let ot = new ModelObjectType("java.lang.String");
            expect(ot.sprint()).to.equals("<java.lang.String>");
        });

        it('array of instance', function () {
            let ot = new ModelObjectType("java.lang.String",true);
            expect(ot.sprint()).to.equals("<java.lang.String>[]");
        });
    });

    describe('Savable.export()', function() {

        it('signle instance, no exclude list', function () {
            let ot:ModelObjectType = new ModelObjectType("java.lang.String");
            let stub:any = ot.export()

            expect(ot.$).to.equals(STUB_TYPE.OBJ_TYPE);

            expect(stub).to.be.an.instanceOf(Stub);
            expect(stub.name).to.equals("java.lang.String");
            expect(stub._hashcode).to.equals("java.lang.String");
            //expect(stub._arr).to.equals(false);
        });

    });

    /*
    describe('Savable.import()', function() {

        it('signle instance', function () {
            let ot = new ModelObjectType("java.lang.String");
            expect(ot.hashCode()).to.equals("<java.lang.String>");
        });

        it('array of instance', function () {
            let ot = new ModelObjectType("java.lang.String",true);
            expect(ot.hashCode()).to.equals("<java.lang.String>[]");
        });
    });*/
});