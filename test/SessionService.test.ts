import * as _path_ from 'path';
import * as _fs_ from 'fs';

import {expect} from 'chai';
import {AuthType} from "../src/user/auth/AuthTypes.js";
import {AuthenticationService} from "../src/user/auth/AuthenticationService.js";
import {UserAccount} from "../src/user/UserAccount.js";
import {SessionSettings} from "../src/user/session/SessionSettings.js";
import {SessionService} from "../src/user/session/SessionService.js";
import {AuthenticationSettings} from "../src/user/auth/AuthenticationSettings.js";
import {Settings} from "../src/Settings.js";
import ServerSettings = Settings.ServerSettings;
import {UserSession} from "../src/user/session/UserSession.js";
import {SessionCode} from "../src/user/session/SessionException.js";
import Util from "../src/Utils.js";

const USER_DB:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.ok.json');


var auth_settings:AuthenticationSettings = null;
var auth_svc:AuthenticationService = null;
var auth_err:any = null;

let sess_settings:SessionSettings = null;
let sess_svc:SessionService = null;
var sess_err:any = null;

let FLAG:number = -1;

let settings_parent_stub:ServerSettings = new class extends ServerSettings {

    constructor() {
        super(null, {});
    }

    save(){
        console.log("save() called from stub");
        FLAG = 1;
        return true
    }
};

let account:UserAccount = null;

describe('SessionService', function() {



    before(function(){

        FLAG = 0;

        auth_settings = new AuthenticationSettings(settings_parent_stub, {
            db: {
                dbms: 'inmemory',
                user: null,
                pwd: null,
                port: 0,
                uri: USER_DB
            },
            policy: {
                delayOnFail: true,
                delay: 30,
                resetAfter: 1800,
                enforced: false,
                maxAttempts: 10
            },
            supported: [AuthType.PASSWORD,AuthType.TOKEN]
        });

        try {
            auth_svc = new AuthenticationService(auth_settings);
        }catch(err){
            auth_err = err;
        }

        account = auth_svc.findUser('dxc_user_1');
    });



    beforeEach(function(){

        FLAG = 0;

        sess_settings = new SessionSettings(auth_settings, {
            store: "sess.json",
            fsBased: false,
            expireFlush: true
        });

        try {
            sess_svc = new SessionService(sess_settings);
        }catch(err){
            sess_err = err;
        }
    });

    describe('New instance', function() {

        it('Settings file is automatically updated', function () {
            // the test is done into beforeEAch()
            expect(FLAG).to.equal(1);
        });

    });

    describe('Get settings', function() {

        it('Explicit settings', function () {
            expect(sess_svc.getSettings().isFsBased()).to.be.equal(false);
        });

        it('Default settings', function () {
            expect(sess_svc.getSettings().getMaxDuration()).to.be.equal(3600);
        });
    });

    describe('New session', function() {

        it('With valid user account', function () {
            let sess:UserSession = sess_svc.newSession( account );

            expect(sess.getUserAccount().username).to.be.equal('dxc_user_1');
        });

        it('With locked user account', function () {
            let sess:UserSession, err:number;

            try {
                account.lock();
                sess = sess_svc.newSession( account );
                err = -1;
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(err).to.equal(SessionCode.ACCOUNT_LOCKED);
                expect(sess).to.be.undefined;
                account.unlock();
            }

        });
    });



    describe('Destroy a session', function() {

        it('A valid session', function () {
            let sess1:UserSession = sess_svc.newSession( account );
            let e:any = null;
            let s:UserSession = null;
            const sid = sess1.getSessUID();
            sess1.addData('utest','xAxAxA');

            expect(sess1.getData('utest')).to.be.equal('xAxAxA');

            try{
                sess_svc.destroySession(sess1);
                s = sess_svc.getSessionByUID(sid); // (sess1);
            }catch(err){
                e = err;
            }

            expect(e.getCode()).to.be.equal(SessionCode.INVALID_SESSID);
            expect(s).to.be.null;

            let d:string = null;
            e = null;
            try{
                d = sess1.getData('utest');
            }catch(err){
                e = err;
            }

            expect(e.getCode()).to.be.equal(SessionCode.DESTROYED);
            expect(d).to.be.null;
        });

    });


    describe('Get session by SessID', function() {

        it('With valid sessID', function () {
            let sess1:UserSession = sess_svc.newSession( account );
            let sess2:UserSession = sess_svc.newSession( account );

            sess1.addData('utest','xAxAxA');
            sess2.addData('utest','xBxBxB');

            expect(sess_svc.getSessionByUID( sess1.getSessUID() ).getData('utest')).to.be.equal('xAxAxA');
        });

        it('With a destroyed session', function () {
            let sess:UserSession, err:number;

            try {
                account.lock();
                sess = sess_svc.newSession( account );
                err = -1;
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(err).to.equal(SessionCode.ACCOUNT_LOCKED);
                expect(sess).to.be.undefined;
                account.unlock();
            }

        });
    });
});