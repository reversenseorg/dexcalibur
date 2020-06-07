const chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    process = require("process");
const expect = chai.expect,
    should = chai.should();

chai.use(sinonChai);

// -- App specific --

const TestHelper = require('../src/TestHelper.js');
const DexcaliburEngine = require('../src/DexcaliburEngine');
const Bus = require('../src/Bus');
const InspectorFactory = require('../src/InspectorFactory');
const Inspector = require('../src/Inspector');

describe('Bus', function() {

    let TestInspector = null;
    let TestInspectorFlag = false;

    before(function(){
        TestHelper.resetDexcaliburWorkspace();
        TestInspector = new InspectorFactory({
            id: 'UnitTestInspector',
            name: 'UnitTestInspector',
            description: 'Simple inspector for unit test',

            startStep: Inspector.STEP.POST_APP_SCAN,

            useGUI: true,

            tags : {
                "testunit": ["browsable", "exported"]
            },

            eventListeners: {
                "testunit.event": function (ctx, event) {
                    TestInspectorFlag = true;
                }
            }
        })
    })

    describe('constructor', function() {

        it('new Bus instance', function () {

            let bus = new Bus( TestHelper.getDexcaliburEngine());

            expect(bus).to.be.an.instanceOf(Bus);
            expect(bus.context).to.be.an.instanceOf(DexcaliburEngine);
        });

    });

    describe('setContext()', function() {

        it('with a valid engine', function () {
            let bus = new Bus();

            expect(bus.context).to.be.null;

            bus.setContext( TestHelper.getDexcaliburEngine());
            expect(bus.context).to.be.an.instanceOf(DexcaliburEngine);
        });
    });

    describe('prevent()', function() {

        it('new device manager instance without config', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });

    describe('unprevent()', function() {

        it('new device manager instance without config', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });

    describe('subscribe()', function() {

        it('subscribe valid listener : inspector', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());
            expect(bus).to.be.an.instanceOf(Bus);
        });

        it('subscribe invalid listener : function', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });

    describe('unscribe()', function() {

        it('new device manager instance without config', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });

    describe('send()', function() {

        it('new device manager instance without config', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });

    describe('getListener()', function() {

        it('new device manager instance without config', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });
});