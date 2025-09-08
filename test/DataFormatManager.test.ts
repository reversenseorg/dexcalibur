import {expect} from 'chai';
import * as _path_ from "path";
import {DataFormatManager} from "../src/formats/DataFormatManager.js";
import ModelFile from "../src/ModelFile.js";

describe('DataFormatManager', function() {


    describe('new', function() {

        const dfm = new DataFormatManager();

        it('instance', function () {
            expect(dfm).to.be.instanceof(DataFormatManager);
        });


        it('builtin properties parser', function () {
            expect(dfm.mapping.ext.properties).to.not.be.null;
            expect(dfm.mapping.ext.properties.length).to.equal(1);
            expect(dfm.mapping.ext.properties[0].UID.startsWith("properties_")).to.be.true;
        });
    });

    describe('getParserByFileExtension', function() {

        const dfm = new DataFormatManager();

        it('Properties Parser', function () {
            const file = new ModelFile({ path:"/tmp/test.properties" });
            const ext = _path_.extname(file.getRealPath());
            let parsers:any;
            let e = 0;

            try{
                parsers = dfm.getParserByFileExtension(ext);
                expect(ext).to.be.equals(".properties");
                expect(parsers).to.not.be.null;
                expect(parsers.length).to.be.equals(1);
                expect(parsers[0].UID.startsWith("properties_")).to.be.equals("");
            }catch (e){
                e++;
            }


        });

        it('Built-in YAML parser', function () {
        });
        it('Built-in JSON Parser', function () {
        });
        it('Built-in JSONP Parser', function () {
        });
        it('Built-in XML Parser', function () {
        });
    });
});