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
const Event = require('../src/Event');

describe('Bus', function() {

    let TestInspector_1 = null;
    let TestInspector_2 = null;
    let TestInspector_3 = null;

    let TestInspectorFlag_1 = false;
    let TestInspectorFlag_2 = false;
    let TestInspectorFlag_3 = false;

    let PROJECT = null;

    before(function(){
        TestHelper.resetDexcaliburWorkspace();
        PROJECT = TestHelper.getDexcaliburProject();

        TestInspector_1 = new InspectorFactory({
            id: 'UnitTestInspector',
            name: 'UnitTestInspector',
            description: 'Simple inspector for unit test',
            startStep: Inspector.STEP.POST_APP_SCAN,
            useGUI: true,
            tags : {
                "testunit": ["browsable", "exported"]
            },
            eventListeners: {
                "testunit.POST_APP_SCAN": function (ctx, event) {
                    TestInspectorFlag_1 = true;
                }
            }
        });

        TestInspector_2 = new InspectorFactory({
            id: 'UnitTestInspector2',
            name: 'UnitTestInspector2',
            description: 'Simple inspector for unit test2',
            startStep: Inspector.STEP.POST_APP_SCAN,
            eventListeners: {
                "testunit.POST_APP_SCAN": function (ctx, event) {
                    TestInspectorFlag_2 = true;
                }
            }
        });

        TestInspector_3 = new InspectorFactory({
            id: 'UnitTestInspector3',
            name: 'UnitTestInspector3',
            description: 'Simple inspector for unit test3',
            startStep: Inspector.STEP.BOOT,
            eventListeners: {
                "testunit.BOOT": function (ctx, event) {
                    TestInspectorFlag_3 = true;
                }
            }
        });
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

            expect(bus.context).to.be.undefined;

            bus.setContext( TestHelper.getDexcaliburEngine());
            expect(bus.context).to.be.an.instanceOf(DexcaliburEngine);
        });
    });

    describe('prevent()', function() {

        it('single inspector', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());

            TestInspectorFlag_1 = false;
            TestInspectorFlag_3 = false;

            bus.subscribe(TestInspector_1.createInstance(PROJECT));
            bus.subscribe(TestInspector_3.createInstance(PROJECT));

            bus.prevent("testunit.POST_APP_SCAN");

            bud.send(new Event({ type:"testunit.POST_APP_SCAN" }));
            bud.send(new Event({ type:"testunit.BOOT" }));

            expect(TestInspectorFlag_1).to.equals(false);
            expect(TestInspectorFlag_3).to.equals(true);
        });

        it('various inspectors', function () {
            let bus = new Bus( TestHelper.getDexcaliburEngine());

            TestInspectorFlag_1 = false;
            TestInspectorFlag_2 = false;
            TestInspectorFlag_3 = false;

            bus.subscribe(TestInspector_1.createInstance(PROJECT));
            bus.subscribe(TestInspector_2.createInstance(PROJECT));
            bus.subscribe(TestInspector_3.createInstance(PROJECT));

            bus.prevent("testunit.POST_APP_SCAN");

            bud.send(new Event({ type:"testunit.POST_APP_SCAN" }));
            bud.send(new Event({ type:"testunit.BOOT" }));

            expect(TestInspectorFlag_1).to.equals(false);
            expect(TestInspectorFlag_2).to.equals(false);
            expect(TestInspectorFlag_3).to.equals(true);
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