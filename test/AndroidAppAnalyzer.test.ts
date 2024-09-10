import * as _path_ from 'path';
import AndroidAppAnalyzer from "../src/android/AndroidAppAnalyzer.js";
import {AndroidResourceType} from "../src/android/AndroidResource.js";
import {expect} from "chai";


describe('AndroidAppAnalyzer', function() {

    before(function(){

    })

    describe('static parseResourceFile() : ANDROID : strings.xml', async function() {

        const path = _path_.join(process.cwd(),"test","ws","owasp.mstg.uncrackable1","apk","res","values","strings.xml");
        let resType = new AndroidResourceType({});

        let resTypeAfter = await AndroidAppAnalyzer.parseResourceFile(path,resType, null, "resources");

        it('parsing of strings.xml file from a valid Android APK file ', function () {

            expect(resTypeAfter._entries.length).to.be.equals(5);
            expect(resTypeAfter._entries[4]._type).to.be.equals("string");
            expect(resTypeAfter._children.thanks).to.be.equals(5);
        });
    });

    describe('static parseResourceFile() : ANDROID : layout/*.xml', async function() {

        const path = _path_.join(process.cwd(),"test","ws","owasp.mstg.uncrackable1","apk","res","layout","activity_main.xml");
        let resType = new AndroidResourceType({});

        let resTypeAfter = await AndroidAppAnalyzer.parseResourceFile(path,resType, null, null);

        console.log(resTypeAfter._entries[0]._attr);
        console.log(resTypeAfter._entries[0]._entries);

        it('parsing of layout/activity_main.xml file from a valid Android APK file ', function () {

//            expect(resTypeAfter._entries.length).to.be.equals(5);
//            expect(resTypeAfter._entries[4]._type).to.be.equals("string");
//            expect(resTypeAfter._children.thanks).to.be.equals(5);
        });
    });
});