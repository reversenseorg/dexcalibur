import * as _path_ from 'path';

import DexcaliburProject from "../dist/src/DexcaliburProject.js";
import {expect} from 'chai';


// -- App specific --

import {TestHelper} from '../dist/src/TestHelper.js';
import Analyzer from '../dist/src/Analyzer.js';
import AnalyzerDatabase from "../dist/src/AnalyzerDatabase.js";
import ModelClass from "../dist/src/ModelClass.js";
import {Modifier} from "../dist/src/AccessFlags.js";
import Util from "../src/Utils.js";


describe('Analyzer', function() {

    let PROJECT:DexcaliburProject = null;

    before(async function(){
        PROJECT = await TestHelper.getInitializedDexcaliburProject();
    })

    describe('constructor', function() {

        it('new instance with specified connector type', function () {

            let db:Analyzer = new Analyzer( 'ascii', PROJECT);
            expect(db).to.be.an.instanceOf(Analyzer);
            expect(db.encoding).to.be.equals('ascii');
            expect(db.context).to.be.an.instanceOf(DexcaliburProject);
            expect(db.context).to.be.an.instanceOf(DexcaliburProject);
        });
    });


    describe('getData', function() {

        it('new instance with specified connector type', function () {

            let analyzer = new Analyzer( 'ascii', PROJECT);

            expect(analyzer.getData()).to.be.an.instanceOf(AnalyzerDatabase);
        });
    });


    describe('file', function() {

        it('simple class', function () {

            let analyzer:Analyzer = new Analyzer("ascii", PROJECT);

            analyzer.file(
                _path_.join(Util.__dirname(import.meta.url),'ws','owasp.mstg.uncrackable1','apk','smali','sg','vantagepoint','a','b.smali'),
                'b.smali',
                true
            );

            expect(analyzer.getTempData()).to.be.an.instanceOf(AnalyzerDatabase);

            let db:AnalyzerDatabase = analyzer.getTempData();

            // DB should contains 4 classes : 1 defined, 3 tagged as 'missing'
            console.log(db.classes.size(),db.classes);
            expect(db.classes.size()).to.be.equal(1);

            let clz:ModelClass = db.classes.getEntry('sg.vantagepoint.a.b');
            expect(clz).to.be.an.instanceOf(ModelClass);
            expect(clz.getName()).to.be.equal('sg.vantagepoint.a.b');
            expect(clz.simpleName ).to.be.equal('b');
            expect(Object.keys(clz.methods).length).to.be.equal(1);

            let meth:any = clz.methods[Object.keys(clz.methods)[0]];
            expect(meth.isStatic()).to.be.equal(true)
            expect(meth.modifiers).to.be.equal(Modifier.PUBLIC | Modifier.STATIC);

            // DB should contains 3 methods : 1 defined, 2 tagged as 'missing'
            expect(meth.getBasicBlocks().length).to.be.equal(3);

            // DB should contains 1 field : 0 defined, 1 tagged as 'missing'
            // android/content/pm/ApplicationInfo;->flags:I
        });

    });
});