import * as _path_ from 'path';
import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper.js";
import {AuthType} from "../dist/src/user/auth/AuthTypes.js";
import {AuthenticationSettings} from "../dist/src/user/auth/AuthenticationSettings.js";
import {SessionSettings} from "../dist/src/user/session/SessionSettings.js";
import Util from "../src/Utils.js";


describe('SessionSettings', function() {

    let USER_DB:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.ok.json');

    describe('constructor', function() {

        it('new instance with default settings', function () {

            let auth_set:any = new AuthenticationSettings(null, {
                db: {
                    dbms: 'inmemory',
                    user: 'dxc_user_1',
                    password: 'dexcalibur',
                    port: 27000,
                    uri: USER_DB
                },
                policy: {
                    enforced: true
                },
                sess: {},
                supported: [AuthType.PASSWORD],
            });


            let settings:SessionSettings = new SessionSettings(auth_set, null);


            expect(settings._tmpStorage ).to.equal("dxc_sess");
            expect(settings._fsBased ).to.be.false;
            expect(settings._duration ).to.equal(3600);
            expect(settings._flush ).to.be.false;
        });

        it('new instance with config', function () {

            let auth_set:any = new AuthenticationSettings(null, {
                db: {
                    dbms: 'inmemory',
                    user: 'dxc_user_1',
                    password: 'dexcalibur',
                    port: 27000,
                    uri: USER_DB
                },
                policy: {
                    enforced: true
                },
                sess: {
                    store: "sess.json",
                    fsBased: false,
                    expire: 7200,
                    expireFlush: true
                },
                supported: [AuthType.PASSWORD],
            });


            let settings:SessionSettings = new SessionSettings(auth_set,{
                store: "sess.json",
                fsBased: false,
                expire: 7200,
                expireFlush: true
            });


            expect(settings._tmpStorage ).to.equal("sess.json");
            expect(settings._fsBased ).to.be.false;
            expect(settings._duration ).to.equal(7200);
            expect(settings._flush ).to.be.true;
        });

    });


});