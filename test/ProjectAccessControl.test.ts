
import {expect} from 'chai';
import {UserAccount} from "../src/user/UserAccount.js";
import AccessControl from "../src/user/acl/AccessControl.js";
import {ProjectAccessControl} from "../src/user/acl/rbac/ProjectAccessContol.js";
import {DelegateAccessControl} from "../src/user/acl/DelegateAccessControl.js";
import {Access, AccessProperty, AccessType} from "../src/user/acl/Access.js";
import {UserRole} from "../src/user/acl/rbac/UserRole.js";
import {UserSession} from "../src/user/session/UserSession.js";
import {UserService} from "../src/user/UserService.js";
import {AuthenticationSettings} from "../src/user/auth/AuthenticationSettings.js";
import {Settings} from "../src/Settings.js";
import ServerSettings = Settings.ServerSettings;
import * as _path_ from "path";
import {AuthType} from "../src/user/auth/AuthTypes.js";
import Util from "../src/Utils.js";

let usr:UserAccount = null;

let usr_svc:UserService = null;
let usr_err:any = null;
let usr_account:UserAccount = null;
var FLAG:number = 0;
var auth_settings:AuthenticationSettings = null;
let settings_parent_stub:ServerSettings = new class extends ServerSettings {

    constructor() {
        super(null, {});
    }

    save(){
        FLAG = 1;
        return true
    }
};

const USER_DB:string = _path_.join(Util.__dirname(import.meta.url),'config','userdb.json');

let account:UserAccount = null;
describe('ProjectAccessControl', function() {


    // init settings one time for all test
    before(function(){

        AccessControl.init()
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
            usr = new UserAccount({
                _username:"dxc_user_1",
                _password:"b8c4970c333df9f9ce926820e228824146062b792f673e2da3b1707df2224080",
                _salt:"bnq53usb88s8vxw3v",
                _padding:"gqssqwd",
                _time:"1625054399029"
            });
            usr.unlock();
        }catch(err){
            usr_err = err;
        }

    })

    describe('New instance', function () {

        it('Init', function () {
            let pac:DelegateAccessControl;
            let err:number;
            try{
                pac = new ProjectAccessControl();
                expect(pac).to.be.instanceOf(ProjectAccessControl);
                expect(ProjectAccessControl.uid).to.be.equal('PROJ');
                err = -1;
            }catch(e){
                err = 1;
            }finally {
                expect(err).to.equal(-1);
            }
        });
    });

    describe('Access', function () {

        it('Get valid access', function () {
            let ac:Access;
            let err:number;
            try{
                ac = ProjectAccessControl.getAccess('PROJ_SETTINGS_EDIT');

                expect(ac).to.be.instanceOf(Access);
                expect(ac.name).to.be.equal('PROJ_SETTINGS_EDIT');
                expect(ac.type).to.be.equal(AccessType.WRITE);

                err = -1;
            }catch(e){
                console.log(e.message);
                err = 1;
            }finally {
                expect(err).to.equal(-1);
            }
        });

        it('Get invalid access', function () {
            let ac:Access;
            let err:number;
            try{
                ac = ProjectAccessControl.getAccess('PROJ_SETTINGS_XXXX');

                expect(ac).to.be.undefined;
                err = -1;
            }catch(e){
                err = 1;
            }finally {
                expect(err).to.equal(-1);
            }
        });


        it('Register access', function () {
            let acc:Access;
            let t:number = Date.now();
            let err:number;
            try{

                expect(ProjectAccessControl.getAccess('PROJ_A_'+t)).to.be.undefined;

                ProjectAccessControl.registerAccess(
                    'PROJ_A_'+t,
                    new Access( AccessType.EXE, 'Execute test')
                );

                acc = ProjectAccessControl.getAccess('PROJ_A_'+t);

                expect(acc).to.be.instanceOf(Access);
                expect(acc.name).to.be.equal('PROJ_A_'+t);
                expect(acc.type).to.be.equal(AccessType.EXE);
                expect(acc.description).to.be.equal('Execute test');

                err = -1;
            }catch(e){
                err = 1;
            }finally {
                expect(err).to.equal(-1);
            }
        });
    })

    describe('Validate project access control', function () {

        it('List access control points', function () {
            let err:number;
            try{

                expect(
                    ProjectAccessControl.getAccess('PROJ_SETTINGS_EDIT').name
                ).to.be.equal('PROJ_SETTINGS_EDIT');


                expect(
                    ProjectAccessControl.getAccess('PROJ_SETTINGS_READ').name
                ).to.be.equal('PROJ_SETTINGS_READ');


                expect(
                    ProjectAccessControl.getAccess('PROJ_OPEN_OWN').name
                ).to.be.equal('PROJ_OPEN_OWN');


                expect(
                    ProjectAccessControl.getAccess('PROJ_OPEN_ANY').name
                ).to.be.equal('PROJ_OPEN_ANY');


                expect(
                    ProjectAccessControl.getAccess('PROJ_CREATE_OWN').name
                ).to.be.equal('PROJ_CREATE_OWN');


                expect(
                    ProjectAccessControl.getAccess('PROJ_DELETE_OWN').name
                ).to.be.equal('PROJ_DELETE_OWN');


                expect(
                    ProjectAccessControl.getAccess('PROJ_DELETE_ANY').name
                ).to.be.equal('PROJ_DELETE_ANY');

            }catch(e){
                err = 1;
            }finally {
                expect(err).to.equal(-1);
            }
        });

        it('Validate access control points', function () {
            let err:number, r:UserRole, sess:UserSession, pac:ProjectAccessControl, s:number = 0;
            try{

                r = new UserRole(  'unit', 'User_test',
                    ProjectAccessControl.getMatchingAccesses( AccessProperty.TYPE, AccessType.READ)
                );

                usr.setUserRole(r);

                sess = usr_svc.createSession(usr);
                sess.addData('e1','yByByB')

                pac = new ProjectAccessControl();


                expect(
                    ProjectAccessControl.getAccess('PROJ_SETTINGS_EDIT').type
                ).to.be.equal(AccessType.WRITE);
                expect(
                    ProjectAccessControl.getAccess('PROJ_SETTINGS_READ').type
                ).to.be.equal(AccessType.READ);

                s = 1;
                pac.check(
                    ProjectAccessControl.access.PROJ_SETTINGS_READ,
                    usr_account
                )
                s = 2;

                expect(s).to.be.equal(2);

                s = 3;

                pac.check(
                    ProjectAccessControl.access.PROJ_SETTINGS_EDIT,
                    usr_account
                );

                s = 4;
            }catch(e){

            }finally {
                expect(s).to.equal(3);
            }
        });
    });
});