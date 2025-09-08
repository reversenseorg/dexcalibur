import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../../src/Utils.js";
import {MachO} from "../../src/parser/MachOParser.js";
import {expect} from "chai";
import ModelFile from "../../src/ModelFile.js";
import {MetadataTopic} from "../../src/audit/common/ControlAssessment.js";

describe('MachOParser', function() {



    describe('MachOParser::fromBuffer', function() {

        let binBuf:Buffer;

        // @ts-ignore
        let path = _path_.join(Util.__dirname(import.meta.url),"../files/macho.bin");
        binBuf = _fs_.readFileSync(path);


        it('Buffer is parsed', async function () {

            const parser = new MachO.Parser();
            const res = await parser.fromBuffer(binBuf,0);

            //console.log(res.ok[0].meta[0].value);
            //console.log(res.ok[0].chunks);

            expect(res.ok[0]).to.be.instanceof(ModelFile);
            expect(res.ok[0].meta[0].key).to.be.equal(MetadataTopic.FILE_HEADER);
            expect(res.ok[0].meta[0].value.data.magic.toString('hex')).to.be.equal("cffaedfe");
            expect(res.ok[0].meta[0].value.tpl[0][0]).to.be.equal("<I");
            expect(res.ok[0].chunks[0].t).to.be.equal('header');
        });
    });
});