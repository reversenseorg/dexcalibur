const chai = require('chai'),
    sinonChai = require('sinon-chai');
const expect = chai.expect;

chai.use(sinonChai);

// -- App specific --

const TestHelper = require('../src/TestHelper.js');
const InspectorFrontController = require('../src/InspectorFrontController');
const DexcaliburProject = require('../src/DexcaliburProject');

describe('InspectorFrontController', function() {


    before(function(){
        TestHelper.resetDexcaliburWorkspace();
    })

    describe('handler type', function() {

        it('export is okey', function () {
            expect(InspectorFrontController.HANDLER.GET).to.be.not.null;
            expect(InspectorFrontController.HANDLER.POST).to.be.not.null;
        });
    });

    describe('constructor', function() {

        it('new instance', function () {

            let inspf = new InspectorFrontController.FrontController();

            expect(inspf).to.be.an.instanceOf(InspectorFrontController.FrontController);
            expect(inspf.ctx).to.be.null;
            expect(inspf.hasHandler( InspectorFrontController.HANDLER.GET )).to.equals(false);
            expect(inspf.hasHandler( InspectorFrontController.HANDLER.POST )).to.equals(false);
        });

    });

    describe('injectContext()', function() {

        it('with a valid project', function () {

            let inspf = new InspectorFrontController.FrontController();

            expect(inspf.ctx).to.be.null;
            inspf.injectContext( TestHelper.getDexcaliburProject());

            expect(inspf.ctx).to.be.an.instanceOf(DexcaliburProject);
            expect(inspf.ctx.uid).to.equals('owasp.mstg.uncrackable1');
        });
    });

    describe('hasHandler()', function() {

        it('with a valid project', function () {
            let inspf = new InspectorFrontController.FrontController();

            expect(inspf.hasHandler(InspectorFrontController.HANDLER.GET)).to.equals(false);
            expect(inspf.hasHandler(InspectorFrontController.HANDLER.POST)).to.equals(false);

            inspf.registerHandler(
                InspectorFrontController.HANDLER.GET,
                function(){
                    console.log('nothing to do');
                }
            );

            expect(inspf.hasHandler(InspectorFrontController.HANDLER.GET)).to.equals(true);
            expect(inspf.hasHandler(InspectorFrontController.HANDLER.POST)).to.equals(false);
        });
    });

    describe('registerHandler()', function() {

        it('one time, GET', function () {
            let inspf = new InspectorFrontController.FrontController();
            let flag = false;

            inspf.registerHandler(
                InspectorFrontController.HANDLER.GET,
                function(){
                    flag = true;
                }
            );

            inspf.performGet(null, null);

            expect(flag).to.equals(true);
        });

        it('one time, POST', function () {
            let inspf = new InspectorFrontController.FrontController();
            let flag = false;

            inspf.registerHandler(
                InspectorFrontController.HANDLER.POST,
                function(){
                    flag = true;
                }
            );

            inspf.performPost(null, null);

            expect(flag).to.equals(true);
        });

        it('several time, one type', function () {
            let inspf = new InspectorFrontController.FrontController();
            let flag1 = false;
            let flag2 = false;

            inspf.registerHandler(
                InspectorFrontController.HANDLER.GET,
                function(){
                    flag1 = true;
                }
            );

            inspf.registerHandler(
                InspectorFrontController.HANDLER.GET,
                function(){
                    flag2 = true;
                }
            );

            inspf.performGet(null, null);

            expect(flag1).to.equals(false);
            expect(flag2).to.equals(true);
        });

        it('one time, multiple type', function () {
            let inspf = new InspectorFrontController.FrontController();
            let flag1 = false;
            let flag2 = false;
            let flag3 = false;


            inspf.registerHandler(
                InspectorFrontController.HANDLER.POST,
                function(){
                    flag1 = true;
                }
            );

            inspf.registerHandler(
                InspectorFrontController.HANDLER.GET,
                function(){
                    flag2 = true;
                }
            );

            inspf.registerHandler(
                'unknow',
                function(){
                    flag3 = true;
                }
            );

            inspf.performGet(null, null);
            inspf.performPost(null, null);

            expect(flag1).to.equals(true);
            expect(flag2).to.equals(true);
            expect(flag3).to.equals(false);

        });
    });

    describe('performGet()', function() {

        it('default', function () {
            let inspf = new InspectorFrontController.FrontController();
            let req = { babar: 'c0ff33' };
            let res = { };

            inspf.registerHandler(
                InspectorFrontController.HANDLER.GET,
                function( pCtx, pReq, pRes){
                    pRes.tmp = pReq.babar;
                }
            );

            inspf.performGet(req, res);

            expect(res.tmp).to.equals('c0ff33');
        });
    });

    describe('performPost()', function() {

        it('default', function () {
            let inspf = new InspectorFrontController.FrontController();
            let req = { babar: 'c0ff33' };
            let res = { };

            inspf.registerHandler(
                InspectorFrontController.HANDLER.POST,
                function( pCtx, pReq, pRes){
                    pRes.tmp = pReq.babar;
                }
            );

            inspf.performPost(req, res);

            expect(res.tmp).to.equals('c0ff33');
        });
    });


});