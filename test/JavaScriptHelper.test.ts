const chai = require('chai');
   // sinon = require('sinon'),
   // sinonChai = require('sinon-chai'),
   // process = require("process");
const expect = chai.expect,
    should = chai.should();

//chai.use(sinonChai);*/

// -- App specific --

const JHelper = require('../src/JavaScriptHelper.js');

describe('JavaScriptHelper', function() {
    
    describe('exports.JObject', function() {
        
        expect(new JHelper.JObject()).to.be.an('object');
    });

    describe('exports.JWriter', function() {
        
        expect(new JHelper.JWriter()).to.be.an('object');
    });

    describe('#JObject [get|set]Name', function() {
        
        let obj = new JHelper.JObject();

        try{
            obj.setName("!invalid+name");
        }catch(e){
            expect(obj.getName()).to.be.null;
        }

        obj.setName("valid_name");
        expect(obj.getName()).to.equal("valid_name");

    });

    describe('#JObject addScalarEntry', function() {
        
        let obj = new JHelper.JObject();

        expect(obj.entries).to.be.an('array');
        expect(obj.entries.length).to.equal(0);
        
        obj.addScalarEntry("h2g2", 42);

        expect(obj.entries.length).to.equal(1);
        expect(obj.entries[0].name).to.equal("h2g2");
        expect(obj.entries[0].value).to.equal(42);

        // invalid entry name
        //expect(obj.addScalarEntry("0", 42)).to.throw();
        // the invalid entry should not be add
        try{
            obj.addScalarEntry("0", 42);
        }catch(e){
            expect(obj.entries.length).to.equal(1);
        }
        


        obj.addScalarEntry("validNull", null);

        expect(obj.entries.length).to.equal(2);
        expect(obj.entries[1].name).to.equal("validNull");
        expect(obj.entries[1].value).to.be.null;
    });


    describe('#JObject addStringEntry', function() {
        
        let obj = new JHelper.JObject();

        expect(obj.entries).to.be.an('array');
        expect(obj.entries.length).to.equal(0);
        
        obj.addStringEntry("h2g2", "Le guide du voyageur intergalactique");

        expect(obj.entries.length).to.equal(1);
        expect(obj.entries[0].name).to.equal("h2g2");
        expect(obj.entries[0].value).to.equal("Le guide du voyageur intergalactique");

        // invalid entry name
        // expect(obj.addStringEntry("0", "toto")).to.throw();
        // the invalid entry should not be add
        
        try{
            obj.addStringEntry("0", "toto")
        }catch(e){
            expect(obj.entries.length).to.equal(1);
        }


        obj.addStringEntry("validNull", null);

        expect(obj.entries.length).to.equal(2);
        expect(obj.entries[1].name).to.equal("validNull");
        expect(obj.entries[1].value).to.be.null;
    });

    describe('#JObject addRawEntry', function() {
        
        let obj = new JHelper.JObject();

        expect(obj.entries).to.be.an('array');
        expect(obj.entries.length).to.equal(0);
        
        obj.addRawEntry("h2g2", "require('frida-fs')");

        expect(obj.entries.length).to.equal(1);
        expect(obj.entries[0].name).to.equal("h2g2");
        expect(obj.entries[0].value).to.equal("require('frida-fs')");

        // invalid entry name
        // expect(obj.addRawEntry("0", "toto")).to.throw();
        // the invalid entry should not be add
        try{
            obj.addRawEntry("0", "toto")
        }catch(e){
            expect(obj.entries.length).to.equal(1);
        }

        obj.addRawEntry("validNull", null);

        expect(obj.entries.length).to.equal(2);
        expect(obj.entries[1].name).to.equal("validNull");
        expect(obj.entries[1].value).to.be.null;
    });

    describe('#JObject addObjectEntry', function() {
        
        let obj = new JHelper.JObject();
        let extra = new JHelper.JObject();
        extra.setName("extraObject");
        extra.addScalarEntry("data",43);

        expect(obj.entries).to.be.an('array');
        expect(obj.entries.length).to.equal(0);
        
        obj.addObjectEntry("h2g2", extra);

        expect(obj.entries.length).to.equal(1);
        expect(obj.entries[0].name).to.equal("h2g2");
        expect(obj.entries[0].value).to.be.an('object');
        expect(obj.entries[0].value).to.be.an.instanceof(JHelper.JObject);
        expect(obj.entries[0].value.getName()).to.equal("extraObject");
        expect(obj.entries[0].value.entries.length).to.equal(1);
        expect(obj.entries[0].value.entries[0].name).to.equal("data");
        expect(obj.entries[0].value.entries[0].value).to.equal(43);

        // invalid entry name
        // expect(obj.addObjectEntry("0", "toto")).to.throw();
        // the invalid entry should not be add
        try{
            obj.addObjectEntry("0", extra);
        }catch(e){
            expect(obj.entries.length).to.equal(1);
        }

        obj.addObjectEntry("validNull", null);

        expect(obj.entries.length).to.equal(2);
        expect(obj.entries[1].name).to.equal("validNull");
        expect(obj.entries[1].value).to.be.null;
    });

    describe('#JObject toScript', function() {
        
        let obj = new JHelper.JObject();
        let extra = new JHelper.JObject();
        extra.setName("extraObject");
        extra.addScalarEntry("data",43);


        obj.addScalarEntry("justANumber", 42);
        obj.addStringEntry("book", "h2g2");
        obj.addStringEntry("empty", null);
        obj.addRawEntry("a_call", "require('frida-fs')");
        obj.addObjectEntry("anObject", extra);

        expect(obj.toScript()).to.equal(`{
    justANumber: 42,
    book: "h2g2",
    empty: null,
    a_call: require('frida-fs'),
    anObject: {
        data: 43
    }
}`)
    });
});