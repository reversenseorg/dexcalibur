import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper.js";
import InspectorManager from "../dist/src/InspectorManager.js";
import DexcaliburEngine from "../dist/src/DexcaliburEngine.js";

describe('Inspector Manager', function() {

    // augment time limit
    this.timeout(10000);

    let ENGINE = null;
    let PROJECT = null;

    before(async function() {
        ENGINE = await TestHelper.getDexcaliburEngine()
        PROJECT = TestHelper.getDexcaliburProject();
    });

    describe('constructor', function() {
        it('new instance', function () {
            let im:InspectorManager = new InspectorManager(null);
            expect(im.engine).to.be.null;
            im = new InspectorManager(ENGINE);
            expect(im.engine).to.be.an.instanceOf(DexcaliburEngine);
        });
    });

    describe('getInstance', function() {
        it('fresh', function (){
            let im:any = InspectorManager.getInstance(ENGINE);
            im.test = true;
            expect(im).to.be.an.instanceOf(InspectorManager);
        });
        it('old', function (){
            let im:any = InspectorManager.getInstance();
            expect(im).to.be.an.instanceOf(InspectorManager);
            expect(im.test).to.equals(true);
        });
    });

    describe('enumerate', function() {
        it('default', async function () {
            let im:InspectorManager = new InspectorManager(ENGINE);

            await im.enumerate();// todo
        });
    });

});