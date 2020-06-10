const chai = require('chai'),
    sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

// -- App specific --

const TestHelper = require('../src/TestHelper.js');
const InspectorFactory = require('../src/InspectorFactory');
const Inspector = require('../src/Inspector');

describe('InspectorFactory', function() {

    let TestInspectorFlag = false;

    before(function(){
        TestHelper.resetDexcaliburWorkspace();
    })

    describe('constructor', function() {

        it('new instance', function () {

            let inspf = new InspectorFactory({
                id: 'UnitTestInspector',
                name: 'UnitTestInspector',
                description: 'Simple inspector for unit test',

                startStep: Inspector.STEP.POST_APP_SCAN,

                useGUI: true,

                tags : {
                    "testunit": ["browsable", "exported"]
                },

                eventListeners: {
                    "testunit.event": function () {
                        TestInspectorFlag = true;
                    }
                }
            });

            expect(inspf).to.be.an.instanceOf(InspectorFactory);
            expect(inspf._config.tags.testunit[0]).to.equal("browsable");
            expect(inspf.step).to.equal(Inspector.STEP.POST_APP_SCAN);
        });

    });

    describe('createInstance()', function() {

        it('with a valid engine', function () {
            let inspf = new InspectorFactory({
                id: 'UnitTestInspector',
                name: 'UnitTestInspector',
                description: 'Simple inspector for unit test',

                startStep: Inspector.STEP.POST_APP_SCAN,

                useGUI: true,

                tags : {
                    "testunit": ["browsable", "exported"]
                },

                eventListeners: {
                    "testunit.event": function () {
                        TestInspectorFlag = true;
                    }
                }
            });

            TestHelper.getDexcaliburProject().init();
            let inspector = inspf.createInstance( TestHelper.getDexcaliburProject());

            expect(inspector).to.be.an.instanceOf(Inspector.Inspector);
            expect(inspector.id).to.equals('UnitTestInspector')
        });
    });

    describe('isStartAt()', function() {

        it('new device manager instance without config', function () {
            let inspf = new InspectorFactory({
                id: 'UnitTestInspector',
                name: 'UnitTestInspector',
                description: 'Simple inspector for unit test',

                startStep: Inspector.STEP.POST_APP_SCAN,

                useGUI: true,

                tags : {
                    "testunit": ["browsable", "exported"]
                },

                eventListeners: {
                    "testunit.event": function () {
                        TestInspectorFlag = true;
                    }
                }
            });

            expect(inspf.isStartAt(Inspector.STEP.POST_APP_SCAN)).to.equals(true);
            expect(inspf.isStartAt(Inspector.STEP.BOOT)).to.equals(false);

        });
    });

});