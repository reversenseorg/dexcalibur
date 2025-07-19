

// -- App specific --

import {Merlin} from "../src/search/Merlin.js";
import {MongoDbMerlinBackend} from "../src/database/MongoDbMerlinBackend.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import ModelStringValue from "../src/ModelStringValue.js";
import InMemoryDbIndex from "../connectors/inmemory/InMemoryDbIndex.js";
import {TagManager} from "../src/tags/TagManager.js";
import * as _path_ from "path";
import Util from "../src/Utils.js";
import {before} from "mocha";
import {TestHelper} from "../src/TestHelper";



const TEST_WS:string = _path_.join(Util.__dirname(import.meta.url),'ws');
const TEST_APP = "com.yubico.yubioath"
const TEST_DB = "dxc_"
const TEST_LIB = "libdatastore_shared_counter.so"
const TEST_ARCH = "arm64-v8a"


describe('MongoDbMerlinBackend', function() {

    before(()=>{

        //ENGINE = await TestHelper.getDexcaliburEngine()
        //PROJECT = TestHelper.getDexcaliburProject();
    })
    describe('search:filter - string condition', async function() {

        const ENGINE = await TestHelper.getDexcaliburEngine();

        //PROJECT = TestHelper.getDexcaliburProject();Test

        const r2 = Merlin.android().strings(`value:/https?:\/\/.*TOTO/`);
        const r1= Merlin.android().strings(`value:/http/`).filter(`value:/api/`);
        const r5= Merlin.android().method(`enclosingClass.name:/http/`).filter(`ret.name:/json/`);
        //const r4= Merlin.android().strings(`value:/http/`).filter(`@network.host.uri`);
        const r3 = Merlin.android().strings( `value:/https?:\/\/.*TOTO/`).on("network.uri.new");


        new MongodbDbCollection(null as any, 'strings', ModelStringValue.TYPE)
        const mdmbe:MongoDbMerlinBackend = new MongoDbMerlinBackend( new TagManager());


        let results = new InMemoryDbIndex('');

        try{  await mdmbe.search(r2, results) }catch (e){ console.log(e) }
        try{  await mdmbe.search(r1, results) }catch (e){ console.log(e) }
        try{  await mdmbe.search(r5, results) }catch (e){ console.log(e) }
        try{  await mdmbe.search(r3, results) }catch (e){ console.log(e) }

        it('new instance with specified connector type', function () {

            /*let db:Analyzer = new Analyzer( 'ascii', PROJECT);
            expect(db).to.be.an.instanceOf(Analyzer);
            expect(db.encoding).to.be.equals('ascii');
            expect(db.context).to.be.an.instanceOf(DexcaliburProject);
            expect(db.context).to.be.an.instanceOf(DexcaliburProject);*/
        });
    });

    describe('search:filter - object condition', async ()=>{
        const ENGINE = await TestHelper.getDexcaliburEngine();

        //PROJECT = TestHelper.getDexcaliburProject();Test

        const r2 = Merlin.android().strings({ value:"/https?:\/\/.*TOTO/" });
        const r1= Merlin.android().strings({ value:"/http/" }).filter(`value:/api/`);
        const r5= Merlin.android().method({ enclosingClass: { name:"/http/" }}).filter(`ret.name:/json/`);
        //const r4= Merlin.android().strings(`value:/http/`).filter(`@network.host.uri`);
        const r3 = Merlin.android().strings( { value:"/https?:\/\/.*TOTO/"})
            .on("network.uri.new");

        const mdmbe:MongoDbMerlinBackend = new MongoDbMerlinBackend(
            new TagManager()
        );


        let results = new InMemoryDbIndex('');

        try{  await mdmbe.search(r2, results) }catch (e){ console.log(e) }
        try{  await mdmbe.search(r1, results) }catch (e){ console.log(e) }
        try{  await mdmbe.search(r5, results) }catch (e){ console.log(e) }
        try{  await mdmbe.search(r3, results) }catch (e){ console.log(e) }

        it('new instance with specified connector type', function () {

            /*let db:Analyzer = new Analyzer( 'ascii', PROJECT);
            expect(db).to.be.an.instanceOf(Analyzer);
            expect(db.encoding).to.be.equals('ascii');
            expect(db.context).to.be.an.instanceOf(DexcaliburProject);
            expect(db.context).to.be.an.instanceOf(DexcaliburProject);*/
        });
    });

    describe('search:intersect', function() {

        const req = Merlin.android()
            .call("_signature_:^android\.content\.Context;->MODE_WORLD_READABLE$")
            .intersect(
                Merlin.android()
                    .call("_signature_:^android\.content\.Context;->MODE_WORLD_WRITABLE$")
            );

        it('new instance with specified connector type', function () {

        });
    });

});