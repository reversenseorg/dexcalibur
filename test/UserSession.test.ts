import * as _path_ from 'path';
import * as _fs_ from 'fs';

import {expect} from 'chai';
import {UserAccount} from "../dist/src/user/UserAccount";
import {AuthCode} from "../dist/src/user/auth/AuthTypes";
import {UserSession} from "../dist/src/user/session/UserSession";
import {SessionCode} from "../src/user/session/SessionException";

let ACCOUNT:UserAccount = null;
let ACCOUNT_2:UserAccount = null;
let SESSID:string = null;

describe('UserSession', function() {


    beforeEach(function(){
        SESSID = 'a0a1a2a3a4a5'
        ACCOUNT = new UserAccount({
            _username:"dxc_user_1",
            _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
            _salt:"bnq53usb88s8vxw3v",
            _padding:"gqssqwd",
            _time:"1625054399029"
        });
        ACCOUNT_2 = new UserAccount({
            _username:"dxc_user_2",
            _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
            _salt:"bnq53usb88s8vxw3v",
            _padding:"gqssqwd",
            _time:"1625054399029"
        });
    })

    describe('New instance', function() {

        it('with settings', function () {

            let sess:UserSession = UserSession.create(SESSID,ACCOUNT);

            expect(sess.getSessUID()).to.equal("a0a1a2a3a4a5");
            expect(sess.getUserAccount().hasUsername("dxc_user_1")).to.be.true;
        });

    });

    describe('Verify session owner', function() {

        it('with valid owner', function () {
            let sess:UserSession =  UserSession.create(SESSID,ACCOUNT);
            let err:number;
            try{
                expect(sess.isOwnedBy(ACCOUNT)).to.be.true;
                err = -1;
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(err).to.be.equal(-1);
            }
        });

        it('with invalid owner', function () {
            let sess:UserSession =  UserSession.create(SESSID,ACCOUNT);
            let err:number;
            try{
                expect(sess.isOwnedBy(ACCOUNT)).to.be.true;
                expect(sess.isOwnedBy(ACCOUNT_2)).to.be.false;
                err = -1;
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(err).to.be.equal(-1);
            }
        });
    });



    describe('After to be destroyed, a session ...', function() {

        it('... must be flagged', function () {
            let sess:UserSession = UserSession.create(SESSID,ACCOUNT);
            let err:number;
            try{
                expect(sess.isActive()).to.be.true;
                sess.destroy()
                err = -1;
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(sess.isActive()).to.be.false;
                expect(err).to.be.equal(-1);
            }
        });

        it('... must be block access to data', function () {
            let sess:UserSession = UserSession.create(SESSID,ACCOUNT);
            let err:number;
            try{

                sess.addData('e1','yByByB');
                expect(sess.getData('e1')).to.be.equal('yByByB');
                sess.destroy();
                sess.addData('e1','yByByB')
                err = -1;
            }catch (e) {
                err = e.getCode();
            }finally {
                expect(err).to.be.equal(SessionCode.DESTROYED);
            }
        });
    });



});