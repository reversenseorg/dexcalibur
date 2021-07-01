import * as _path_ from 'path';
import * as _fs_ from 'fs';

import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper";
import {AuthType} from "../dist/src/user/auth/AuthTypes";
import {AuthenticationSettings} from "../dist/src/user/auth/AuthenticationSettings";
import {AuthenticationPolicy} from "../dist/src/user/auth/AuthenticationPolicy";
import {AuthenticationService} from "../dist/src/user/auth/AuthenticationService";
import {UserAccount} from "../dist/src/user/UserAccount";
import {PasswordAuthenticator} from "../dist/src/user/auth/Authenticator";
import {Authenticator} from "../dist/src/user/auth/AuthTypes";

const USER_DB:string = _path_.join(__dirname,'config','userdb.json');
const USER_DB_BKP:string = _path_.join(__dirname,'config','userdb.json.bkp');

// username = dxc_user_1, password = dexcalibur
const USER_DB_TMP:string = _path_.join(__dirname,'config','userdb.json.temp');


if(_fs_.existsSync(USER_DB)) _fs_.unlinkSync(USER_DB);
if(_fs_.existsSync(USER_DB_BKP)) _fs_.unlinkSync(USER_DB_BKP);

var auth_settings:AuthenticationSettings = null;
var auth_svc:AuthenticationService = null;
var auth_err:any = null;

describe('AuthenticationService', function() {



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

        try {
            auth_svc = new AuthenticationService(auth_settings);
        }catch(err){
            auth_err = err;
        }

    })

    describe('New instance', function() {

        it('Auth policy building from settings', function () {
            expect(auth_svc.policy).to.be.instanceOf(AuthenticationPolicy);
            expect(auth_svc.policy.isEnforced()).to.equal(false);
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

    describe('Identifying user by login', function() {

        it('Valid username', function () {
            console.log(auth_svc.findUser('dxc_user_1'))
            expect(auth_svc.findUser('dxc_user_1')).to.be.instanceOf(UserAccount);
            expect(auth_svc.findUser('dxc_user_1').username).to.equal('dxc_user_1');
        });

        it('Invalid username should throw exception', function () {
            let err:boolean;
            try{
                let u:any = auth_svc.findUser('');
                console.log(u);
                err = false;
            }catch(e){
                console.log(e.message);
                err = true;
            }

            expect(err).to.equal(true);
        });

        it('User not found should throw exception', function () {
            let err:boolean;
            try{
                let u:any = auth_svc.findUser('dxc_user_XXX');
                err = false;
            }catch(e){
                err = true;
            }finally {
                expect(err).to.equal(true);
            }
        });
    });


    describe('Creating password-based authenticator', function() {

        it('Basic', function () {
            let pwd_auth:Authenticator;
            let err:boolean;
            try{
                pwd_auth = auth_svc.newPasswordAuthenticator();
                err = false
            }catch(e){
                err = true;
            }

            expect(pwd_auth).to.be.instanceOf(PasswordAuthenticator);
            expect(err).to.equal(false);
        });

        it('Trying to create authenticator when the auth policy not supports it', function () {
            let err:boolean;
            let auth_svc_2:AuthenticationService;
            let pwd_auth:Authenticator = null;
            try{

                auth_svc_2 = new AuthenticationService(new AuthenticationSettings({
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
                }));

                pwd_auth = auth_svc_2.newPasswordAuthenticator();
                err = false;
            }catch(e){
                err = true;
            }finally {
                expect(err).to.equal(true);
                expect(pwd_auth).to.equal(null);
            }
        });
    });


    describe('Saving User DB', function() {

        it('Without backup copy', function () {

            // create user and save
            auth_svc.getUserIndex().addEntry( new UserAccount({
                username: 'user2',
                password: 'xxx'
            }));

            auth_svc.save(false);

            // reload DB into another service
            let auth_svc_2  =  new AuthenticationService(new AuthenticationSettings({
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
                supported: [AuthType.PASSWORD]
            }));

            expect(auth_svc_2.findUser('dxc_user_1').username).to.equal('dxc_user_1');
            expect(auth_svc_2.findUser('user2')).to.be.instanceOf(UserAccount);
            expect(auth_svc_2.findUser('user2').password).to.equal('xxx');
        });

        it('With backup copy', function () {

            // create user and save
            auth_svc.getUserIndex().addEntry( new UserAccount({
                username: 'user3',
                password: 'yyyy'
            }));

            auth_svc.save();

            // reload DB into another service
            let auth_svc_2  =  new AuthenticationService(new AuthenticationSettings({
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
                supported: [AuthType.PASSWORD]
            }));

            // reload DB into another service
            let auth_svc_3  =  new AuthenticationService(new AuthenticationSettings({
                db: {
                    dbms: 'inmemory',
                    user: null,
                    password: null,
                    port: 0,
                    uri: USER_DB_BKP
                },
                policy: {
                    delayOnFail: true,
                    delay: 30,
                    resetAfter: 1800,
                    enforced: false,
                    maxAttempts: 10
                },
                supported: [AuthType.PASSWORD]
            }));

            // verify user3 exists into the new db
            expect(auth_svc_2.findUser('dxc_user_1').username).to.equal('dxc_user_1');
            expect(auth_svc_2.findUser('user3')).to.be.instanceOf(UserAccount);
            expect(auth_svc_2.findUser('user3').password).to.equal('yyyy');

            // verify user3 not exists into the backup
            let err:boolean;
            try{
                auth_svc_3.findUser('user3');
                err = false;
            }catch(e){
                err = true;
            }
            expect(err).to.equal(true);
        });

    });



});