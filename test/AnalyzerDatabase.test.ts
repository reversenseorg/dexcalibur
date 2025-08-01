import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper.js";
import AnalyzerDatabase from "../dist/src/AnalyzerDatabase.js";
import InMemoryConnector from "../dist/connectors/inmemory/adapter.js";
import InMemoryDbCollection from "../dist/connectors/inmemory/InMemoryDbCollection.js";
import InMemoryDbIndex from "../dist/connectors/inmemory/InMemoryDbIndex.js";



// -- App specific --


describe('AnalyzerDatabase', function() {

    let PROJECT = null;

    before(function(){
        PROJECT = TestHelper.getDexcaliburProject();
    })

    describe('constructor', function() {

        it('new instance with specified connector type', function () {

            let db = new AnalyzerDatabase( PROJECT, 'inmemory');

            expect(db).to.be.an.instanceOf(AnalyzerDatabase);
            expect(db.getConnector()).to.be.an.instanceOf(InMemoryConnector);

            expect(db.classes).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.fields).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.methods).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.call).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.unmapped).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.notbinded).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.notloaded).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.missing).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.parseErrors).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.strings).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.packages).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.files).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.buffers).to.be.an.instanceOf(InMemoryDbIndex);
            expect(db.datablock).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.tagcategories).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.syscalls).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.activities).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.receivers).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.services).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.providers).to.be.an.instanceOf(InMemoryDbCollection);
            expect(db.permissions).to.be.an.instanceOf(InMemoryDbCollection);
        });
    });

});