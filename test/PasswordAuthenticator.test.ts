import * as _path_ from 'path';
import * as _fs_ from 'fs';

import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper";
import {AuthType} from "../dist/src/user/auth/AuthTypes";
import {AuthenticationSettings} from "../dist/src/user/auth/AuthenticationSettings";
import {AuthenticationPolicy} from "../dist/src/user/auth/AuthenticationPolicy";
import {AuthenticationService} from "../dist/src/user/auth/AuthenticationService";
import {UserAccount} from "../dist/src/user/UserAccount";
import {PasswordAuthenticator, AuthenticationResult} from "../dist/src/user/auth/Authenticator";
import {Authenticator} from "../dist/src/user/auth/AuthTypes";
import {AuthCode} from "../src/user/auth/AuthTypes";

const USER_DB:string = _path_.join(__dirname,'config','userdb.json');
const USER_DB_BKP:string = _path_.join(__dirname,'config','userdb.json.bkp');

// username = dxc_user_1, password = dexcalibur
const USER_DB_TMP:string = _path_.join(__dirname,'config','userdb.json.temp');


if(_fs_.existsSync(USER_DB)) _fs_.unlinkSync(USER_DB);
if(_fs_.existsSync(USER_DB_BKP)) _fs_.unlinkSync(USER_DB_BKP);

var auth_settings:AuthenticationSettings = null;
var auth_settings_token:AuthenticationSettings = null;
var auth_svc:AuthenticationService = null;
var auth_svc_tok:AuthenticationService = null;
var auth_err:any = null;

describe('PasswordAuthenticator', function() {



    beforeEach(function(){
        auth_settings = new AuthenticationSettings({
            db: {
                dbms: 'inmemory',
                user: null,
                password: null,
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


        auth_settings_token = new AuthenticationSettings({
            db: {
                dbms: 'inmemory',
                user: null,
                password: null,
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
            supported: [AuthType.TOKEN]
        });

        try {
            auth_svc = new AuthenticationService(auth_settings);
            auth_svc_tok = new AuthenticationService(auth_settings_token);
        }catch(err){
            auth_err = err;
        }

    })

    describe('New instance', function() {

        it('When policy allow password authenticator', function () {
            let pa:Authenticator = auth_svc.newPasswordAuthenticator();
            expect(pa).to.be.instanceOf(PasswordAuthenticator);
        });

        it('When policy disallow password authenticator', function () {
            let pa:Authenticator;
            let err:boolean;
            try{
                pa = auth_svc_tok.newPasswordAuthenticator();
                err = false;
            }catch(e){
                err = true;
            }finally {
                expect(pa).to.be.null;
                expect(err).to.equal(true);
            }
        });

        it('Auth settings init', function () {

            expect(auth_svc.settings).to.be.instanceOf(AuthenticationSettings);
            expect(auth_svc.settings.db.dbms).to.equal('inmemory');
        });

        it('DB init', function () {

            console.log(auth_svc);

            expect(auth_svc._users.size()).to.equal(1);
            expect(auth_svc._users.getEntry(0).username).to.equal('dxc_user_1');
        });
    });

    describe('Doing authentication', function() {

        it('With valid credentials', function () {
            let pa:Authenticator;
            let ra:AuthenticationResult;
            let err:boolean;
            try{
                pa = auth_svc.newPasswordAuthenticator();
                ra = pa.doAuthentication( 'dxc_user_1', 'dexcalibur');
                err = false;
            }catch(e){
                err = true;
            }finally {
                expect(err).to.be.false;
                expect(pa).to.be.instanceOf(PasswordAuthenticator);
                expect(ra).to.be.instanceOf(AuthenticationResult);
                expect(AuthenticationResult.isSuccess(ra)).to.be.true;
            }
        });

        it('With invalid username', function () {
            let pa:Authenticator;
            let ra:AuthenticationResult;
            let err:boolean;
            try{
                pa = auth_svc.newPasswordAuthenticator();
                ra = pa.doAuthentication( 'NOT_EXISTS', 'dexcalibur');
                err = false;
            }catch(e){
                err = true;
            }finally {
                // no exception should be trigged by authentication
                // If a failure happens, the authenticator MUST issues an invalid result
                expect(err).to.be.false;
                expect(pa).to.be.instanceOf(PasswordAuthenticator);
                expect(ra).to.be.instanceOf(AuthenticationResult);
                expect(ra.getCode()).to.equal(AuthCode.INVALID_USERNAME);
                expect(AuthenticationResult.isSuccess(ra)).to.be.false;
            }
        });

        it('With empty username', function () {
            let pa:Authenticator;
            let ra:AuthenticationResult;
            let err:boolean;
            try{
                pa = auth_svc.newPasswordAuthenticator();
                ra = pa.doAuthentication( '', 'dexcalibur');
                err = false;
            }catch(e){
                err = true;
            }finally {
                // no exception should be trigged by authentication
                // If a failure happens, the authenticator MUST issues an invalid result
                expect(err).to.be.false;
                expect(pa).to.be.instanceOf(PasswordAuthenticator);
                expect(ra).to.be.instanceOf(AuthenticationResult);
                expect(ra.getCode()).to.equal(AuthCode.EMPTY_USERNAME);
                expect(AuthenticationResult.isSuccess(ra)).to.be.false;
            }
        });


        it('With invalid password', function () {
            let pa:Authenticator;
            let ra:AuthenticationResult;
            let err:boolean;
            try{
                pa = auth_svc.newPasswordAuthenticator();
                ra = pa.doAuthentication( 'dxc_user_1', 'XXXXXXX');
                err = false;
            }catch(e){
                err = true;
            }finally {
                // no exception should be trigged by authentication
                // If a failure happens, the authenticator MUST issues an invalid result
                expect(err).to.be.false;
                expect(pa).to.be.instanceOf(PasswordAuthenticator);
                expect(ra).to.be.instanceOf(AuthenticationResult);
                expect(ra.getCode()).to.equal(AuthCode.INVALID_PASSWORD);
                expect(AuthenticationResult.isSuccess(ra)).to.be.false;
            }
        });
    });

});