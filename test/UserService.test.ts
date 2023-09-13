import {expect} from "chai";



import * as _path_ from 'path';
import * as _fs_ from 'fs';

import {AuthType} from "../src/user/auth/AuthTypes.js";
import {AuthenticationSettings} from "../src/user/auth/AuthenticationSettings.js";
import {AuthenticationService} from "../src/user/auth/AuthenticationService.js";
import {UserAccount} from "../src/user/UserAccount.js";
import {UserSession} from "../src/user/session/UserSession.js";
import {UserService} from "../src/user/UserService.js";
import {Settings} from "../src/Settings.js";
import ServerSettings = Settings.ServerSettings;
import {SessionCode, SessionException} from "../src/user/session/SessionException.js";
import {SessionService} from "../src/user/session/SessionService.js";
import Util from "../src/Utils.js";

const USER_DB:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.json');
const USER_DB_BKP:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.json.bkp');

// username = dxc_user_1, password = dexcalibur
const USER_DB_TMP:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.json.temp');


if(_fs_.existsSync(USER_DB)) _fs_.unlinkSync(USER_DB);
if(_fs_.existsSync(USER_DB_BKP)) _fs_.unlinkSync(USER_DB_BKP);

let usr_svc:UserService = null;
let usr_err:any = null;
let usr_account:UserAccount = null;

var auth_settings:AuthenticationSettings = null;
var auth_svc:AuthenticationService = null;
var auth_err:any = null;

let FLAG:number = 0;

let settings_parent_stub:ServerSettings = new class extends ServerSettings {

    constructor() {
        super(null, {});
    }

    save(){
        FLAG = 1;
        return true
    }
};

let account:UserAccount = null;

describe('UserService', function() {

    // init settings one time for all test
    before(function(){
        auth_settings = new AuthenticationSettings(
                settings_parent_stub, {
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
                    supported: [AuthType.PASSWORD,AuthType.TOKEN],
                    sess: {

                    }
                }
            );
    });

    beforeEach(function(){
        usr_err = null;
        try {
            usr_svc = new UserService(auth_settings);
            usr_account = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });
            usr_account.unlock();
        }catch(err){
            usr_err = err;
        }

    })

    describe('Initializing', function() {

        it('Authentication service is ready', function () {
            expect(usr_svc.getAuthenticationService()).to.be.instanceOf(AuthenticationService);
            expect(usr_err).to.be.null;
        });

        it('Session service is ready', function () {
            expect(usr_svc.getSessionService()).to.be.instanceOf(SessionService);
            expect(usr_err).to.be.null;
        });

    });

    describe('Creating a session', function() {

        it('With a valid account', function () {

            let sess:UserSession = null;
            let err:number = -1;

            try{
                sess = usr_svc.createSession(usr_account);
                sess.addData('e1','yByByB')
            }catch(e){
                err = e.getCode();
            }
            expect(err).to.be.equal(-1);
            expect(sess).to.be.instanceOf(UserSession);
            expect(sess.getData('e1')).to.equal('yByByB');
        });

        it('With locked account', function () {
            let sess:UserSession = null;
            let err:number = -1;

            try{
                usr_account.lock();
                sess = usr_svc.createSession(usr_account);
                sess.addData('e1','yByByB')
            }catch(e){
                err = e.getCode();
            }
            expect(err).to.be.equal(SessionCode.ACCOUNT_LOCKED);
            expect(sess).to.be.null;
        });
    });


    describe('Open session', function() {

        it('With valid session UID', function () {
            let sess:UserSession = null;
            let sess1:UserSession = null;
            let err:number = -1;

            try{
                // create session with some data
                sess = usr_svc.createSession(usr_account);
                sess.addData('e1','yByByB');

                // retrieve session by sessid
                sess1 = usr_svc.openSession(sess.getSessUID());
            }catch(e){
                err = e.getCode();
            }
            expect(err).to.be.equal(-1);
            expect(sess1.getData('e1')).to.equal('yByByB');
        });


        it('With invalid session UID', function () {
            let sess:UserSession = null;
            let sess1:UserSession = null;
            let err:number = -1;

            try{
                // create session with some data
                sess = usr_svc.createSession(usr_account);
                sess.addData('e1','yByByB');

                // retrieve session by sessid
                sess1 = usr_svc.openSession('this_sessions_uid_exceed_the_length_of_sessionUID');
            }catch(e){
                err = e.getCode();
            }
            expect(err).to.be.equal(SessionCode.INVALID_SESSID);
            expect(sess1).to.null;
        });

        it('With locked user account', function () {

            let sess1:UserSession = null;
            let sess:UserSession = null;
            let err:number = -1;
            account = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });

            try {
                usr_svc.getSessionService().flush();

                // create session with some data
                sess = usr_svc.createSession(account);
                sess.addData('e1','yByByB');

                expect(sess.getData('e1')).to.equal('yByByB');
                expect(usr_svc.openSession(sess.getSessUID()).getData('e1')).to.equal('yByByB');

                account.lock();

                // retrieve session by sessid
                sess1 = usr_svc.openSession(sess.getSessUID());
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(err).to.equal(SessionCode.ACCOUNT_LOCKED);
                expect(sess1).to.be.null;
            }

            account.unlock();
            err = -1;
            try {
                sess = usr_svc.openSession( sess.getSessUID() );
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(err).to.equal(-1);
                expect(sess.getData('e1')).to.equal('yByByB');
            }

        });

    });


    describe('Close a session', function() {

        it('With a valid session', function () {

            let sess:UserSession = null;
            let err:number = -1;
            let s:string = null;

            try{
                sess = usr_svc.createSession(usr_account);
                sess.addData('e1','yByByB')

                expect(sess.getData('e1')).to.equal('yByByB');
                usr_svc.closeSession( sess);
                s = sess.getData('e1');
            }catch(e){
                err = e.getCode();
            }
            expect(err).to.be.equal(SessionCode.DESTROYED);
            expect(sess).to.be.instanceOf(UserSession);
            expect(s).to.be.null;
        });

    });


    describe('Get active sessions', function() {

        it('With a valid account', function () {

            let sesss:UserSession[] = [];
            let slist:UserSession[] = null;
            let err:number = -1;
            let s:string = null;

            let account2:UserAccount = new UserAccount({
                _username:"dxc_john",
                _password:"4146062b792f673e2da3b1707df2224080b8c4970c333df9f9ce926820e22882",
                _salt:"8s8vxw3vbnq53usb8",
                _padding:"sqwdgqs",
                _time:"1625054399029"
            });
            try{
                usr_svc.getSessionService().flush();

                sesss[0] = usr_svc.createSession(usr_account);
                sesss[1] = usr_svc.createSession(account2);
                sesss[2] = usr_svc.createSession(account2);
                sesss[3] = usr_svc.createSession(account2);

                sesss[0].addData('e1','yByByB');
                sesss[1].addData('e2','y2y2y2');
                sesss[2].addData('e4','x1x1x1');
                sesss[3].addData('e5','blablabla');

                usr_svc.closeSession(sesss[3]);

                slist = usr_svc.getActiveSessions( account2);

            }catch(e){
                console.log(e.message);
                err = e.getCode();
            }finally {
                expect(slist).has.lengthOf(2);
                expect(slist[0].getData('e2')).to.equal('y2y2y2');
                expect(slist[1].getData('e4')).to.equal('x1x1x1');
                expect(err).to.be.equal(-1);
            }
        });

    });

    describe('Get latest active session', function() {

        it('With a valid account', function () {

            let sesss:UserSession[] = [];
            let slist:UserSession[] = null;
            let err:number = -1;
            let last:UserSession = null;
            let s:string = null;

            let account2:UserAccount = new UserAccount({
                _username:"dxc_john",
                _password:"4146062b792f673e2da3b1707df2224080b8c4970c333df9f9ce926820e22882",
                _salt:"8s8vxw3vbnq53usb8",
                _padding:"sqwdgqs",
                _time:"1625054399029"
            });
            try{
                // remove all existings session
                usr_svc.getSessionService().flush();

                sesss[0] = usr_svc.createSession(usr_account);
                sesss[1] = usr_svc.createSession(account2);
                sesss[2] = usr_svc.createSession(account2);
                sesss[3] = usr_svc.createSession(account2);

                sesss[0].addData('e1','yByByB');
                sesss[1].addData('e2','y2y2y2');
                sesss[2].addData('e4','x1x1x1');
                sesss[3].addData('e5','blablabla');

                usr_svc.closeSession(sesss[3]);

                console.log(usr_svc.getActiveSessions( account2).sort(function(a,b){
                    return (a._created>b._created ? -1 : 1);
                }));
                last = usr_svc.getLatestActiveSession( account2);

                if(sesss[1].getTime('created') === sesss[2].getTime('created')){
                    last = sesss[2];
                }

            }catch(e){
                console.log(e);
                err = e.getCode();
            }finally {
                expect(last).to.be.not.null;
                expect(last.getData('e4')).to.equal('x1x1x1');
                expect(err).to.be.equal(-1);
            }
        });


    });


    describe('Do 1 step password authentication', function() {

        it('With a valid password', function () {

            let sess:UserSession = null;
            let err:number = -1;
            try{
                // remove all existings session
                usr_svc.getSessionService().flush();
                // authent + new session
                sess = usr_svc.do1StepPasswordAuthentication( 'dxc_user_1', 'dexcalibur');
                sess.addData('i1','ieieie');

            }catch(e){
                err = e.getCode();
            }finally {
                expect(err).to.be.equal(-1);
                expect(sess.getData('i1')).to.equal('ieieie');
            }
        });

    });

});

