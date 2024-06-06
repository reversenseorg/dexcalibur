import {expect} from 'chai';
import {DataFormatManager} from "../src/formats/DataFormatManager.js";
import ModelBom from "../src/ModelBom.js";
import {CryptoUtils} from "../src/CryptoUtils.js";

describe('ModelBom', function() {


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

    describe('fromCdxComponent', function() {

        const bom = ModelBom.fromCdxComponent({
                name: "firebase-iid",
                version: "21.1.0",
                hashes: [],
                licenses: [],
                external_references: [],
                components: [],
                properties: [],
                evidence: []
        });

        it('BOM UID', function () {

            expect(bom.getUID()).to.be.equals(CryptoUtils.md5('firebase-iid:21.1.0','hex',true));
            expect(bom.components[0].name).to.be.equals("firebase-iid");
            expect(bom.components[0].version).to.be.equals("21.1.0");
        });
    });
});