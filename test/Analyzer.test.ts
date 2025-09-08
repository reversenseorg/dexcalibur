import * as _path_ from 'path';

import DexcaliburProject from "../src/DexcaliburProject.js";
import {expect} from 'chai';


// -- App specific --

import {TestHelper} from '../src/TestHelper.js';
import Analyzer from '../src/Analyzer.js';
import AnalyzerDatabase from "../src/AnalyzerDatabase.js";
import ModelClass from "../src/ModelClass.js";
import {Modifier} from "../src/AccessFlags.js";
import Util from "../src/Utils.js";
import {randomUUID} from "crypto";
import {INodeRef} from "../src/INode.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";


describe('Analyzer', function() {

    let PROJECT:DexcaliburProject = null;

    before(async function(){
        //PROJECT = await TestHelper.getInitializedDexcaliburProject() ;
        //PROJECT = new DexcaliburProject();
    })

    describe('constructor', function() {

        it('new instance with specified connector type', function () {

          /*  let db:Analyzer = new Analyzer( 'ascii', PROJECT);
            expect(db).to.be.an.instanceOf(Analyzer);
            expect(db.encoding).to.be.equals('ascii');
            expect(db.context).to.be.an.instanceOf(DexcaliburProject);
            expect(db.context).to.be.an.instanceOf(DexcaliburProject);*/
        });
    });


    describe('getData', function() {

        it('new instance with specified connector type', function () {

            //let analyzer = new Analyzer( 'ascii', PROJECT);

            //expect(analyzer.getData()).to.be.an.instanceOf(AnalyzerDatabase);
        });
    });


    describe('file', function() {

        it('simple class', function () {

            /*
            console.log(PROJECT)
            let analyzer:Analyzer = new Analyzer("ascii", PROJECT);

            analyzer.file(
                // @ts-ignore
                _path_.join(Util.__dirname(import.meta.url),'ws','owasp.mstg.uncrackable1','apk','smali','sg','vantagepoint','a','b.smali'),
                'b.smali'
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
            // android/content/pm/ApplicationInfo;->flags:I*/
        });

    });

    describe('isNodeRef', function() {

        it('valid with only node type', function () {
            const n:INodeRef = { __:NodeInternalType.CLASS };
            expect(Analyzer.isNodeRef(n)).to.be.equal(true);
        });

        it('valid with basic info', function () {
            const n:INodeRef = { __:NodeInternalType.CLASS, _uid:randomUUID() };
            expect(Analyzer.isNodeRef(n)).to.be.equal(true);
        });

        it('valid with full info', function () {
            const n:INodeRef = { __:NodeInternalType.CLASS, _uid:randomUUID(), tags:[1,2,3] };
            expect(Analyzer.isNodeRef(n)).to.be.equal(true);
        });

        it('invalid node type', function () {
            expect(Analyzer.isNodeRef({ __:9999 })).to.be.equal(false);
        });

        it('invalid negative node type', function () {
            expect(Analyzer.isNodeRef({ __:-10 })).to.be.equal(false);
        });

        it('invalid _uid only', function () {
            expect(Analyzer.isNodeRef({ _uid:randomUUID() })).to.be.equal(false);
        });

        it('missing _uid on multi field', function () {
            expect(Analyzer.isNodeRef({ __:NodeInternalType.CLASS, tags:[1,2] })).to.be.equal(false);
        });

        /*it('invalid _uid format (utf-8)', function () {
            expect(Analyzer.isNodeRef({ __:NodeInternalType.CLASS, _uid:"\uFFFF" })).to.be.equal(false);
        });*/

        it('invalid _uid type', function () {
            expect(Analyzer.isNodeRef({ __:NodeInternalType.CLASS, _uid:10 })).to.be.equal(false);
            expect(Analyzer.isNodeRef({ __:NodeInternalType.CLASS, _uid: { a:'1' } })).to.be.equal(false);
            expect(Analyzer.isNodeRef({ __:NodeInternalType.CLASS, _uid: [] })).to.be.equal(false);
            expect(Analyzer.isNodeRef({ __:NodeInternalType.CLASS, _uid: null })).to.be.equal(false);
            expect(Analyzer.isNodeRef({ __:NodeInternalType.CLASS, _uid: undefined })).to.be.equal(false);
        });
    });
});