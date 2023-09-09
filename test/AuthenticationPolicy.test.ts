import * as _path_ from 'path';
import {expect} from 'chai';
import {AuthType} from "../dist/src/user/auth/AuthTypes.js";
import {AuthenticationSettings} from "../dist/src/user/auth/AuthenticationSettings.js";
import {AuthenticationPolicy} from "../dist/src/user/auth/AuthenticationPolicy.js";
import Util from "../src/Utils.js";

const USER_DB:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.json');
const USER_DB_TMP:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.json.temp');

describe('AuthenticationPolicy', function() {


    let pol_fixed:AuthenticationPolicy;
    let pol_default:AuthenticationPolicy;

    before(function(){
        pol_fixed  = new AuthenticationPolicy(new AuthenticationSettings(null, {
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
        }));

        pol_default = new AuthenticationPolicy(new AuthenticationSettings(null, {
            db: {
                dbms: 'inmemory',
                uri: USER_DB
            }
        }));
    })

    describe('constructor', function() {

        it('Authentication enforced', function () {
            expect(pol_fixed.enforced).to.equals(false);
        });
        it('Authentication is enforced by default', function () {
            expect(pol_default.enforced).to.equals(true);
        });


    });


    describe('isEnforced()', function() {

        it('Fixed value', function () {
            expect(pol_fixed.isEnforced()).to.equals(false);
        });
        it('Default value', function () {
            expect(pol_default.isEnforced()).to.equals(true);
        });
    });


    describe('isSupported()', function() {

        it('With supported', function () {

            expect(pol_fixed.isSupported(AuthType.PASSWORD)).to.equals(true);
            expect(pol_fixed.isSupported(AuthType.TOKEN)).to.equals(true);
            expect(pol_fixed.isSupported(AuthType.NONE)).to.equals(false);
        });

        it('With invalid type adn default', function () {

            expect(pol_default.isSupported(AuthType.TOKEN)).to.equals(false);
            expect(pol_default.isSupported(AuthType.PASSWORD)).to.equals(true);
        });
    });

    describe('hasDelayOnFail()', function() {
        it('when enabled', function () {
            expect(pol_fixed.hasDelayOnFail()).to.equals(true);
        });
    });

    describe('hasMaxAttempt()', function() {
        it('with 10 attempts', function () {
            expect(pol_fixed.hasMaxAttempts()).to.equals(true);
        });
    });

});