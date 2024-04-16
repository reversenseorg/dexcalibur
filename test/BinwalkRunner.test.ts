
import * as _os_ from "os";
import {expect} from "chai";
import {BinwalkRunner} from "../src/formats/identifier/BinwalkRunner.js";
import * as _path_ from "path";
import Util from "../src/Utils.js";

const EOL = _os_.EOL;


describe('BinwalkRunner:core', function() {

    describe('New runner instance', async function() {


        it('with valid path', async function() {

            if(process.env.DXC_BINWALK_PATH!=null){
                // get hook instance by hook ID
                const runner = new BinwalkRunner(process.env.DXC_BINWALK_PATH);

                expect(runner).to.be.an.instanceOf(BinwalkRunner);

                const res = runner.analyze(
                    _path_.join(Util.__dirname(import.meta.url),'ws','owasp.mstg.uncrackable1','apk','res','values','public.xml'),
                );

                expect(res.type).to.be.equal("XML");
                expect(res.__p.m).to.have.length(1);
                expect(res.__p.m[0].o).to.be.equal(0);
            }else{
                this.skip()
            }

        });

    });
});