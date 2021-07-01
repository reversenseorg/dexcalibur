import * as _path_ from 'path';
import {expect} from 'chai';
import {TestHelper} from "../dist/src/TestHelper";
import {AuthType} from "../dist/src/user/auth/AuthTypes";
import {AuthenticationSettings} from "../dist/src/user/auth/AuthenticationSettings";


describe('AuthenticationSettings', function() {

    let USER_DB:string = _path_.join(__dirname,'config','userdb.json');
    let USER_DB_TMP:string = _path_.join(__dirname,'config','userdb.json.temp');

    before(function(){
     //   PROJECT = TestHelper.getDexcaliburProject();
    })

    describe('constructor', function() {

        it('new instance with default settings', function () {

            let settings:any = new AuthenticationSettings({
                db: {
                    dbms: 'inmemory',
                    uri: USER_DB
                },
                policy: {
                    enforced: true
                }
            });

            expect(settings.db.dbms).to.equals('inmemory');
            expect(settings.db.uri).to.equals(USER_DB);
            expect(settings.policy.enforced).to.equals(true);

            expect(settings.supported).to.contains(AuthType.PASSWORD);
        });

        it('new instance with config', function () {

            let settings:any = new AuthenticationSettings({
                db: {
                    dbms: 'inmemory',
                    user: 'db_user_1',
                    password: 'db_password',
                    port: 27000,
                    uri: USER_DB
                },
                policy: {
                    enforced: true
                },
                supported: [AuthType.PASSWORD],

            });

            expect(settings.db.dbms).to.equals('inmemory');
            expect(settings.db.user).to.equals('db_user_1');
            expect(settings.db.password).to.equals('db_password');
            expect(settings.db.port).to.equals(27000);
            expect(settings.db.uri).to.equals(USER_DB);

            expect(settings.policy.enforced).to.equals(true);

            expect(settings.supported).to.contains(AuthType.PASSWORD);
        });

    });

    describe('toJson', function() {

        let settings:any = new AuthenticationSettings({
            db: {
                dbms: 'inmemory',
                user: 'db_user_1',
                password: 'db_password',
                port: 27000,
                uri: USER_DB
            },
            policy: {
                enforced: true
            },
            supported: [AuthType.PASSWORD],

        });

        const pojo = settings.toObject();

        it('Has "db" field', function () {
            expect(pojo.db.dbms).to.equals('inmemory');
            expect(pojo.db.user).to.equals('db_user_1');
            expect(pojo.db.password).to.equals('db_password');
            expect(pojo.db.port).to.equals(27000);
            expect(pojo.db.uri).to.equals(USER_DB);
        });
        it('Has "db" field', function () {
            expect(pojo.policy.enforced).to.equals(true);
        });
        it('Has "supported" field', function () {
            expect(Array.isArray(pojo.supported)).to.equal(true);
            expect(pojo.supported[0]).to.equal(AuthType.PASSWORD);
        });

    });

});