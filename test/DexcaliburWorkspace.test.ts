import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper.js";
import DexcaliburWorkspace from "../dist/src/DexcaliburWorkspace.js";

// const EOL = require('os').EOL;

// -- App specific --
var CONFIG = null;


var gEngine = null;

describe('DexcaliburWorkspace', function() {

    beforeEach(function() {
        //gEngine = TestHelper.getDexcaliburEngine();
        TestHelper.clearInterceptors();
    });

    
    describe('constructor', function() {

        it('with path', function () {
            
            let ws = new DexcaliburWorkspace('/tmp');

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.path).to.equals('/tmp');
        });

    });


    describe('getInstance()', function() {

        it('new instance', function () {
            
            DexcaliburWorkspace.clearInstance();

            let ws = DexcaliburWorkspace.getInstance('/tmp');

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.path).to.equals('/tmp');
        });

        it('override', function () {
            
            DexcaliburWorkspace.clearInstance();

            let ws = DexcaliburWorkspace.getInstance('/tmp');

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.path).to.equals('/tmp');

            ws = DexcaliburWorkspace.getInstance('/tmp/f1', true);

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.path).to.equals('/tmp/f1');
        });

        it('singleton', function () {
            
            let ws1 = DexcaliburWorkspace.getInstance('/tmp/f2',true);

            expect(ws1).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws1.path).to.equals('/tmp/f2');

            let ws2 = DexcaliburWorkspace.getInstance();

            expect(ws2).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws2.path).to.equals('/tmp/f2');
        });
    });

     
    describe('getLocation()', function() {

        it('with path', function () {

            let ws1 = DexcaliburWorkspace.getInstance('/tmp/f2',true);

            expect(ws1).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws1.getLocation()).to.equals('/tmp/f2');
        });

    });

    describe('getLocation()', function() {

        it('with path', function () {

            let ws1 = DexcaliburWorkspace.getInstance('/tmp/f2',true);

            expect(ws1).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws1.getLocation()).to.equals('/tmp/f2');
        });

    });

});