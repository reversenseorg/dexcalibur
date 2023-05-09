import {expect} from 'chai';
import {CryptoUtils} from "../src/CryptoUtils.js";

describe('CryptoUtils', function() {

    beforeEach(function() {
        //console.log(process.cwd());
        //sinon.spy(console, 'log');
    });

    afterEach(function() {
       // console.log.restore();
    });


    describe('hash:md5 ', function() {

        it('string => hex (default)', function () {
            let hash = CryptoUtils.md5("toto");
            expect(hash).to.be.equals("f71dbe52628a3f83a77ab494817525c6")
        });
        it('string => hex (specified)', function () {
            let hash = CryptoUtils.md5("toto",'hex');
            expect(hash).to.be.equals("f71dbe52628a3f83a77ab494817525c6")
        });
        it('string => base64 (specified)', function () {
            let hash = CryptoUtils.md5("toto",'base64');
            expect(hash).to.be.equals("ZjcxZGJlNTI2MjhhM2Y4M2E3N2FiNDk0ODE3NTI1YzYK")
        });
    });


});