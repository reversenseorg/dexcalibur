import {expect} from 'chai';
import * as _path_ from 'path';
import * as _fs_ from 'fs';
import AndroidAppAnalyzer from "../src/android/AndroidAppAnalyzer.js";
import {AndroidResource, AndroidResourceType} from "../src/android/AndroidResource.js";




// -- App specific --


describe('AndroidResource', function() {

    let PROJECT = null;

    before(function(){

    })

    describe('static fromXml()', async function() {

        const path = _path_.join(process.cwd(),"test","ws","owasp.mstg.uncrackable1","apk","res","values","styles.xml");
        const xml = await AndroidAppAnalyzer._parseXmlFile(path);
        let parentRes = new AndroidResourceType({});
        let res:AndroidResource[];

        res = AndroidResource.fromXml(xml.resources, parentRes);

        it('new instance with specified connector type', function () {
            expect(res[0]._attr.parent.name).to.be.equal("Theme.Holo.Light.DarkActionBar");
            expect(res[0]._attr.name).to.be.equal("AppTheme");
        });
    });


    describe('toModelResource()', async function() {

        const path = _path_.join(process.cwd(),"test","ws","owasp.mstg.uncrackable1","apk","res","values","strings.xml");
        const xml = await AndroidAppAnalyzer._parseXmlFile(path, {preserveChildrenOrder:true, explicitChildren:true});
        const pRootNode = "resources";
        let parentRes = new AndroidResourceType({});
        let res:AndroidResource[];

        res = AndroidResource.fromXml(xml[pRootNode]['$$'], parentRes);
        //console.log(res[0]);
        const res2 = res[0].toModelResource(res[0]._attr.name);
        //console.log(res2);


        it('new instance with specified connector type', function () {

            //console.log(parentRes);
            /*
            let db = new AnalyzerDatabase( PROJECT, 'inmemory');

            expect(db).to.be.an.instanceOf(AnalyzerDatabase);
            expect(db.getConnector()).to.be.an.instanceOf(InMemoryConnector);
            */
        });


    });



});