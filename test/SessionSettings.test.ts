import * as _path_ from 'path';
import {expect} from 'chai';
import {AuthType} from "../src/user/auth/AuthTypes.js";
import {AuthenticationSettings} from "../src/user/auth/AuthenticationSettings.js";
import {SessionSettings} from "../src/user/session/SessionSettings.js";
import Util from "../src/Utils.js";
import {SecurityZone} from "../src/security/SecurityZone.js";


describe('SessionSettings', function() {

    let USER_DB:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.ok.json');

    describe('constructor', function() {

        it('new instance with default settings', function () {

            let auth_set:any = new AuthenticationSettings(null, {
                db: {
                    dbms: 'inmemory',
                    user: 'dxc_user_1',
                    pwd: 'dexcalibur',
                    port: 27000,
                    uri: USER_DB
                },
                policy: {
                    enforced: true
                },
                sess: {},
                supported: [AuthType.PASSWORD],
            });


            let settings:SessionSettings = new SessionSettings(auth_set);


            expect(settings.getStorage() ).to.equal("dxc_sess");
            expect(settings.isFsBased() ).to.be.false;
            expect(settings.getMaxDuration() ).to.equal(3600);
            expect(settings.mustFlushSessDate() ).to.be.false;
        });

        it('new instance with inherit settings', function () {

            let auth_set:any = new AuthenticationSettings(null, {
                db: {
                    dbms: 'inmemory',
                    user: 'dxc_user_1',
                    pwd: 'dexcalibur',
                    port: 27000,
                    uri: USER_DB
                },
                policy: {
                    enforced: true
                },
                sess: {
                    store: "sess2.json",
                    fsBased: false,
                    expire: 7200,
                    expireFlush: true
                },
                supported: [AuthType.PASSWORD],
            });


            let settings:SessionSettings = new SessionSettings(auth_set);


            expect(settings.getStorage() ).to.equal("sess2.json");
            expect(settings.isFsBased() ).to.be.false;
            expect(settings.getMaxDuration() ).to.equal(7200);
            expect(settings.mustFlushSessDate() ).to.be.true;
        });

        it('new instance with config', function () {

            let auth_set:any = new AuthenticationSettings(null, {
                db: {
                    dbms: 'inmemory',
                    user: 'dxc_user_1',
                    pwd: 'dexcalibur',
                    port: 27000,
                    uri: USER_DB
                },
                policy: {
                    enforced: true
                },
                supported: [AuthType.PASSWORD],
            });


            let settings:SessionSettings = new SessionSettings(auth_set, {
                    store: "sess.json",
                    fsBased: false,
                    expire: 7200,
                    expireFlush: true
            });


            expect(settings.getStorage()).to.equal("sess.json");
            expect(settings.isFsBased() ).to.be.false;
            expect(settings.getMaxDuration() ).to.equal(7200);
            expect(settings.mustFlushSessDate() ).to.be.true;
        });

    });


    describe('isFsBased', function() {

        const auth_set: any = new AuthenticationSettings(null, {
            db: {
                dbms: 'inmemory',
                user: 'dxc_user_1',
                pwd: 'dexcalibur',
                port: 27000,
                uri: USER_DB
            },
            policy: {
                enforced: true
            },
            sess: {
                fsBased: true
            },
            supported: [AuthType.PASSWORD],
        });

        const auth_set2: any = new AuthenticationSettings(null, {
            db: {
                dbms: 'inmemory',
                user: 'dxc_user_1',
                pwd: 'dexcalibur',
                port: 27000,
                uri: USER_DB
            },
            policy: {
                enforced: true
            },
            sess: {
                fsBased: false
            },
            supported: [AuthType.PASSWORD],
        });



        it('fs based', function () {
            let settings: SessionSettings = new SessionSettings(auth_set, auth_set.sess);
            console.log(settings);
            expect(settings.isFsBased()).to.be.true;
        });

        it('not fs based', function () {
            let settings: SessionSettings = new SessionSettings(auth_set2, auth_set2.sess);
            expect(settings.isFsBased()).to.be.false;
        });
    });

    describe('toObject', function() {

        const auth_set: any = new AuthenticationSettings(null, {
            db: {
                dbms: 'inmemory',
                user: 'dxc_user_1',
                pwd: 'dexcalibur',
                port: 27000,
                uri: USER_DB
            },
            policy: {
                enforced: true
            },
            sess: {
                fsBased: false
            },
            supported: [AuthType.PASSWORD],
        });


        it('Public Zone', function () {
            let settings: SessionSettings = new SessionSettings(auth_set);
            let out = settings.toObject(SecurityZone.PUBLIC);

            expect(out.store).to.equal("dxc_sess");
            expect(out.fsBased).to.be.false;
            expect(out.expire).to.equal(3600);
            expect(out.expireFlush).to.be.false;
        });
    });

    describe('getStorage()', function() {

        const auth_set: any = new AuthenticationSettings(null, {
            db: {
                dbms: 'inmemory',
                user: 'dxc_user_1',
                pwd: 'dexcalibur',
                port: 27000,
                uri: USER_DB
            },
            policy: {
                enforced: true
            },
            sess: {
                fsBased: false
            },
            supported: [AuthType.PASSWORD],
        });

        const auth_set2: any = new AuthenticationSettings(null, {
            db: {
                dbms: 'inmemory',
                user: 'dxc_user_1',
                pwd: 'dexcalibur',
                port: 27000,
                uri: USER_DB
            },
            policy: {
                enforced: true
            },
            sess: {
                store: "sess.custom",
                fsBased: false
            },
            supported: [AuthType.PASSWORD],
        });



        it('default storage', function () {
            let settings: SessionSettings = new SessionSettings(auth_set);
            expect(settings.getStorage()).to.equal("dxc_sess");
        });

        it('custom storage', function () {
            let settings: SessionSettings = new SessionSettings(auth_set2);
            expect(settings.getStorage()).to.equal("sess.custom");
        });
    });
});