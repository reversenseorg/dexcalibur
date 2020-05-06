const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
const expect = chai.expect,
    should = chai.should();

chai.use(sinonChai);

const EOL = require('os').EOL;

// -- App specific --
var CONFIG = null;

const TestHelper = require('../src/TestHelper.js');
const DexcaliburWorkspace = require('../src/DexcaliburWorkspace.js');

describe('DexcaliburWorkspace', function() {

    beforeEach(function() {
        CONFIG = TestHelper.newConfiguration();
        TestHelper.clearInterceptors();
    });

    afterEach(function() {
       // console.log.restore();
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
            
            let ws = DexcaliburWorkspace.getInstance('/tmp');

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.path).to.equals('/tmp');
        });

        it('override', function () {
            
            let ws = DexcaliburWorkspace.getInstance('/tmp');

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.path).to.equals('/tmp');

            ws = DexcaliburWorkspace.getInstance('/tmp/f1', true);

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.path).to.equals('/tmp/f1');
        });

        it('singleton', function () {
            
            let ws1 = DexcaliburWorkspace.getInstance('/tmp/f2',true);

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.path).to.equals('/tmp/f2');

            let ws2 = DexcaliburWorkspace.getInstance();

            expect(ws2).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws2.path).to.equals('/tmp/f2');
        });
    });

     
    describe('getLocation()', function() {

        it('with path', function () {

            let ws1 = DexcaliburWorkspace.getInstance('/tmp/f2',true);

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.getLocation()).to.equals('/tmp/f2');
        });

    });

    describe('getLocation()', function() {

        it('with path', function () {

            let ws1 = DexcaliburWorkspace.getInstance('/tmp/f2',true);

            expect(ws).to.be.an.instanceOf(DexcaliburWorkspace);
            expect(ws.getLocation()).to.equals('/tmp/f2');
        });

    });

    describe('init()', function() {

      

    });
});