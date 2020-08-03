import {expect} from 'chai';
import {TestHelper} from "../src/TestHelper";
import InspectorFrontController, {IFC_TYPE} from "../src/InspectorFrontController";
import DexcaliburProject from "../src/DexcaliburProject";

describe('InspectorFrontController', function() {


    before(function(){
        TestHelper.resetDexcaliburWorkspace();
    })

    describe('handler type', function() {

        it('export is okey', function () {
            expect(IFC_TYPE.GET).to.be.not.null;
            expect(IFC_TYPE.POST).to.be.not.null;
        });
    });

    describe('constructor', function() {

        it('new instance', function () {

            let inspf:InspectorFrontController = new InspectorFrontController();

            expect(inspf).to.be.an.instanceOf(InspectorFrontController);
            expect(inspf.ctx).to.be.null;
            expect(inspf.hasHandler( IFC_TYPE.GET )).to.equals(false);
            expect(inspf.hasHandler( IFC_TYPE.POST )).to.equals(false);
        });

    });

    describe('injectContext()', function() {

        it('with a valid project', function () {

            let inspf:InspectorFrontController = new InspectorFrontController();

            expect(inspf.ctx).to.be.null;
            inspf.injectContext( TestHelper.getDexcaliburProject());

            expect(inspf.ctx).to.be.an.instanceOf(DexcaliburProject);
            expect(inspf.ctx.uid).to.equals('owasp.mstg.uncrackable1');
        });
    });

    describe('hasHandler()', function() {

        it('with a valid project', function () {
            let inspf:InspectorFrontController = new InspectorFrontController();

            expect(inspf.hasHandler(IFC_TYPE.GET)).to.equals(false);
            expect(inspf.hasHandler(IFC_TYPE.POST)).to.equals(false);

            inspf.registerHandler(
                IFC_TYPE.GET,
                function(){
                    console.log('nothing to do');
                }
            );

            expect(inspf.hasHandler(IFC_TYPE.GET)).to.equals(true);
            expect(inspf.hasHandler(IFC_TYPE.POST)).to.equals(false);
        });
    });

    describe('registerHandler()', function() {

        it('one time, GET', function () {
            let inspf:InspectorFrontController = new InspectorFrontController();
            let flag = false;

            inspf.registerHandler(
                IFC_TYPE.GET,
                function(){
                    flag = true;
                }
            );

            inspf.performGet(null, null);

            expect(flag).to.equals(true);
        });

        it('one time, POST', function () {
            let inspf:InspectorFrontController = new InspectorFrontController();
            let flag = false;

            inspf.registerHandler(
                IFC_TYPE.POST,
                function(){
                    flag = true;
                }
            );

            inspf.performPost(null, null);

            expect(flag).to.equals(true);
        });

        it('several time, one type', function () {
            let inspf:InspectorFrontController = new InspectorFrontController();
            let flag1 = false;
            let flag2 = false;

            inspf.registerHandler(
                IFC_TYPE.GET,
                function(){
                    flag1 = true;
                }
            );

            inspf.registerHandler(
                IFC_TYPE.GET,
                function(){
                    flag2 = true;
                }
            );

            inspf.performGet(null, null);

            expect(flag1).to.equals(false);
            expect(flag2).to.equals(true);
        });

        it('one time, multiple type', function () {
            let inspf:InspectorFrontController = new InspectorFrontController();
            let flag1:boolean = false;
            let flag2:boolean = false;
            let flag3:boolean = false;


            inspf.registerHandler(
                IFC_TYPE.POST,
                function(){
                    flag1 = true;
                }
            );

            inspf.registerHandler(
                IFC_TYPE.GET,
                function(){
                    flag2 = true;
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
            let inspf:InspectorFrontController = new InspectorFrontController();
            let req:any = { babar: 'c0ff33' };
            let res:any = { };

            inspf.registerHandler(
                IFC_TYPE.GET,
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
            let inspf:InspectorFrontController = new InspectorFrontController();
            let req:any = { babar: 'c0ff33' };
            let res:any = { };

            inspf.registerHandler(
                IFC_TYPE.POST,
                function( pCtx, pReq, pRes){
                    pRes.tmp = pReq.babar;
                }
            );

            inspf.performPost(req, res);

            expect(res.tmp).to.equals('c0ff33');
        });
    });


});