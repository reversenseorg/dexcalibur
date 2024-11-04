import * as _path_ from 'path';
import * as _fs_ from 'fs';

import {expect} from 'chai';
import {UserAccount} from "../dist/src/user/UserAccount.js";
import {AuthCode} from "../dist/src/user/auth/AuthTypes.js";
import AccessControl from "../src/user/acl/AccessControl.js";
import {AccessControlManager} from "../src/user/acl/AccessControlManager";

let usr:UserAccount = null;

describe('UserAccount', function() {


    before(function(){
        const acm = new AccessControlManager(null);
        AccessControl.init(acm);
    });

    beforeEach(function(){
        usr = new UserAccount({
            _username:"dxc_user_1",
            _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
            _salt:"bnq53usb88s8vxw3v",
            _padding:"gqssqwd",
            _time:"1625054399029"
        });
    })

    describe('New instance', function() {

        it('with settings', function () {

            let user:UserAccount = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029",
                role: AccessControlManager.BUILT_IN_DEFAULT_ROLE
            });

            expect(user.username).to.equal("dxc_user_1");
            expect(user.salt).to.equal("bnq53usb88s8vxw3v");
            expect(user.padding).to.equal("gqssqwd");
            expect(user.password).to.equal("b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080");
            expect(user.isLocked()).to.false;
            expect(user.getUserRole().uid).to.be.equal( AccessControlManager.BUILT_IN_DEFAULT_ROLE);
        });

    });

    describe('Get UID', function() {

        it('-', function () {

            let user:UserAccount = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });

            expect(user.getUID()).to.equal("dxc_user_1");
        });

    });

    describe('Lock status', function() {

        it('Lock', function () {

            let user:UserAccount = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });

            user.unlock();
            user.lock();
            expect(user.isLocked()).to.be.equal(true);
        });

        it('Unlock', function () {

            let user:UserAccount = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });

            user.lock();
            user.unlock();
            expect(user.isLocked()).to.be.equal(false);
        });
    });

    describe('Comparison with ...', function() {

        it('... username', function () {
            let user:UserAccount = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });
            expect(user.hasUsername('dxc_user_1')).to.be.equal(true);
            expect(user.hasUsername('dxc_xxxx_1')).to.be.equal(false);
        });

        it('... account', function () {

            const usr_other = new UserAccount({
                _username:"dxc_user_3",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });

            const usr_same = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });

            expect(usr.is(usr_other)).to.be.equal(false);
            expect(usr.is(usr_same)).to.be.equal(true);
        });
    });


    describe('Password comparison', function() {

        it('with valid password', function () {
            let err:boolean;
            try{
                usr.passwordEquals('dexcalibur');
                err = false;
            }catch (e) {
                err = true;
            }finally {
                expect(err).to.be.equal(false);
            }
        });

        it('with invalid password', function () {
            let err:number;
            try{
                usr.passwordEquals('XXXXXlibur');
                err = -1;
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(err).to.be.equal(AuthCode.INVALID_PASSWORD);
            }
        });
    });

});