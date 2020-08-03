var chai = require('chai');
var expect = chai.expect;

const Platform = require("../src/Platform.js");


describe('Platform class', function() {
    
    describe('new instance', function() {
        
        it('pathNotSpecified', function () {
            let conf = new Platform({
                source: "sdk",
                name: "androidapi",
                version: 29,
                vendor: "google",
                format: "jar"
            });

            expect(conf.source).to.equals("sdk");            
            expect(conf.name).to.equals("androidapi");
            expect(conf.version).to.equals(29);
            expect(conf.vendor).to.equals("google");
            expect(conf.format).to.equals("jar");
        });
    });

});