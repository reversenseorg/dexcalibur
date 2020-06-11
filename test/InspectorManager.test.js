const chai = require('chai');
const process = require("process");
const expect = chai.expect,  should = chai.should();

//chai.use(sinonChai);*/

// -- App specific --

const TEST_CONFIG = process.cwd()+'/test/res/config_test.js';

let TestHelper = require('../src/TestHelper');
const Inspector = require('../src/Inspector');
const DexcaliburEngine = require('../src/DexcaliburEngine');
const InspectorManager = require('../src/InspectorManager');
const Utils = require("../src/Utils.js");

describe('Inspector Manager', function() {

    // augment time limit
    this.timeout(10000);

    let ENGINE = null;
    let PROJECT = null;

    before(function() {
        ENGINE = TestHelper.getDexcaliburEngine()
        PROJECT = TestHelper.getDexcaliburProject();
    });

    describe('constructor', function() {
        it('new instance', function () {
            let im = new InspectorManager();
            expect(im.engine).to.be.undefined;
            im = new InspectorManager(ENGINE);
            expect(im.engine).to.be.an.instanceOf(DexcaliburEngine);
        });
    });

    describe('getInstance', function() {
        it('fresh', function (){
            let im = InspectorManager.getInstance(ENGINE);
            im.test = true;
            expect(im).to.be.an.instanceOf(InspectorManager);
        });
        it('old', function (){
            let im = InspectorManager.getInstance();
            expect(im).to.be.an.instanceOf(InspectorManager);
            expect(im.test).to.equals(true);
        });
    });

    describe('enumerate', function() {
        it('default', function () {
            let im = new InspectorManager(ENGINE);

            im.enumerate();
        });
    });

});