import {expect} from 'chai';
// -- App specific --
import * as _path_ from "path";
import Util from "../src/Utils.js";
import {ProjectFileDatabase} from "../src/database/ProjectFileDatabase.js";
import DexcaliburProject from "../src/DexcaliburProject.js";
import DexcaliburEngine from "../src/DexcaliburEngine.js";
import {TestHelper} from "../src/TestHelper.js";
import * as Log from '../dist/src/Logger.js';
import {TestLogger} from "@dexcalibur/dexcalibur-orm";


let Logger:any;

const TEST_WS:string = _path_.join(Util.__dirname(import.meta.url),'ws');
const TEST_APP = "com.yubico.yubioath"
const TEST_LIB = "libdatastore_shared_counter.so"
const TEST_ARCH = "arm64-v8a"

describe('ProjectFileDatabase', function() {


    let gEngine:DexcaliburEngine = null;

    before(async function(){
        gEngine = await TestHelper.getDexcaliburEngine();
    })

    beforeEach(function() {

        Logger = Log.newLogger({
            testMode: true,
            debugMode: false
        },true) as TestLogger;
    });


    describe('new', async function() {


        const prj = new DexcaliburProject({
            uid:"com.yubico.yubioath"
        });
        prj.setEngine(gEngine);
        prj.open();

        const pfdb = new ProjectFileDatabase(prj);


        /*it('is same file', async function() {
            expect(analyzer.target.getUID()).to.be.an.instanceOf(BIN_FILE.getUID());
        });*/
    });

    describe("createRequestByScope", function(){

    })
});