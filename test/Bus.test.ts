import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper.js";
import InspectorFactory from "../dist/src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../dist/src/Inspector.js";
import Bus from "../dist/src/Bus.js";
import DexcaliburProject from "../dist/src/DexcaliburProject.js";
import BusEvent from "../dist/src/BusEvent.js";

describe('Bus', function() {

    let TestInspector_1 = null;
    let TestInspector_2 = null;
    let TestInspector_3 = null;

    let TestInspectorFlag_1 = false;
    let TestInspectorFlag_2 = false;
    let TestInspectorFlag_3 = false;

    let PROJECT = null;

    before(async function(){
        TestHelper.resetDexcaliburWorkspace();
        PROJECT = await TestHelper.getInitializedDexcaliburProject();

        TestInspector_1 = new InspectorFactory({
            id: 'UnitTestInspector',
            name: 'UnitTestInspector',
            description: 'Simple inspector for unit test',
            startStep: INSPECTOR_TYPE.POST_APP_SCAN,
            useGUI: true,
            tags : {
                "testunit": ["browsable", "exported"]
            },
            eventListeners: {
                "testunit.POST_APP_SCAN": function () {
                    TestInspectorFlag_1 = true;
                }
            }
        });

        TestInspector_2 = new InspectorFactory({
            id: 'UnitTestInspector2',
            name: 'UnitTestInspector2',
            description: 'Simple inspector for unit test2',
            startStep: INSPECTOR_TYPE.POST_APP_SCAN,
            eventListeners: {
                "testunit.POST_APP_SCAN": function () {
                    TestInspectorFlag_2 = true;
                }
            }
        });

        TestInspector_3 = new InspectorFactory({
            id: 'UnitTestInspector3',
            name: 'UnitTestInspector3',
            description: 'Simple inspector for unit test3',
            startStep: INSPECTOR_TYPE.BOOT,
            eventListeners: {
                "testunit.BOOT": function () {
                    TestInspectorFlag_3 = true;
                }
            }
        });
    })

    describe('constructor', function() {

        it('new Bus instance', function () {

            let bus:any = new Bus( TestHelper.getDexcaliburProject());

            expect(bus).to.be.an.instanceOf(Bus);
            expect(bus.context).to.be.an.instanceOf(DexcaliburProject);
        });

    });

    describe('setContext()', function() {

        it('with a valid engine', function () {
            let bus:any = new Bus( null);

            expect(bus.context).to.be.null;

            bus.setContext( TestHelper.getDexcaliburProject());
            expect(bus.context).to.be.an.instanceOf(DexcaliburProject);
        });
    });

    describe('prevent()', function() {

        it('single inspector', function () {
            let bus = new Bus( TestHelper.getDexcaliburProject());

            TestInspectorFlag_1 = false;
            TestInspectorFlag_3 = false;

            bus.register(TestInspector_1.createInstance(PROJECT));
            bus.register(TestInspector_3.createInstance(PROJECT));

            bus.prevent("testunit.POST_APP_SCAN");

            bus.send(new BusEvent({ type:"testunit.POST_APP_SCAN" }));
            bus.send(new BusEvent({ type:"testunit.BOOT" }));

            expect(TestInspectorFlag_1).to.equals(false);
            expect(TestInspectorFlag_3).to.equals(true);
        });

        it('various inspectors', function () {
            let bus = new Bus( TestHelper.getDexcaliburProject());

            TestInspectorFlag_1 = false;
            TestInspectorFlag_2 = false;
            TestInspectorFlag_3 = false;

            bus.register(TestInspector_1.createInstance(PROJECT));
            bus.register(TestInspector_2.createInstance(PROJECT));
            bus.register(TestInspector_3.createInstance(PROJECT));

            bus.prevent("testunit.POST_APP_SCAN");

            bus.send(new BusEvent({ type:"testunit.POST_APP_SCAN" }));
            bus.send(new BusEvent({ type:"testunit.BOOT" }));

            expect(TestInspectorFlag_1).to.equals(false);
            expect(TestInspectorFlag_2).to.equals(false);
            expect(TestInspectorFlag_3).to.equals(true);
        });


    });

    describe('unprevent()', function() {

        it('multiple', function () {
            let bus = new Bus( TestHelper.getDexcaliburProject());

            TestInspectorFlag_1 = false;
            TestInspectorFlag_2 = false;
            TestInspectorFlag_3 = false;

            bus.register(TestInspector_1.createInstance(PROJECT));
            bus.register(TestInspector_2.createInstance(PROJECT));
            bus.register(TestInspector_3.createInstance(PROJECT));

            bus.prevent("testunit.POST_APP_SCAN");

            bus.send(new BusEvent({ type:"testunit.POST_APP_SCAN" }));
            bus.send(new BusEvent({ type:"testunit.BOOT" }));

            expect(TestInspectorFlag_1).to.equals(false);
            expect(TestInspectorFlag_2).to.equals(false);
            expect(TestInspectorFlag_3).to.equals(true);

            bus.unprevent("testunit.POST_APP_SCAN");

            bus.send(new BusEvent({ type:"testunit.POST_APP_SCAN" }));
            bus.send(new BusEvent({ type:"testunit.BOOT" }));

            expect(TestInspectorFlag_1).to.equals(true);
            expect(TestInspectorFlag_2).to.equals(true);
            expect(TestInspectorFlag_3).to.equals(true);
        });
    });

    describe('subscribe()', function() {

        it('subscribe valid listener : inspector', function () {
            let bus = new Bus( TestHelper.getDexcaliburProject());
            expect(bus).to.be.an.instanceOf(Bus);
        });

        it('subscribe invalid listener : function', function () {
            let bus = new Bus( TestHelper.getDexcaliburProject());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });

    describe('unscribe()', function() {

        it('new device manager instance without config', function () {
            let bus = new Bus( TestHelper.getDexcaliburProject());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });

    describe('send()', function() {

        it('new device manager instance without config', function () {
            let bus = new Bus( TestHelper.getDexcaliburProject());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });

    describe('getListener()', function() {

        it('new device manager instance without config', function () {
            let bus = new Bus( TestHelper.getDexcaliburProject());
            expect(bus).to.be.an.instanceOf(Bus);
        });
    });
});