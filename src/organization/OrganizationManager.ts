import DexcaliburEngine from "../DexcaliburEngine.js";
import {UserAccount, UserAccountOptions, UserAccountType, UserAccountUUID} from "../user/UserAccount.js";
import AccessControl from "../user/acl/AccessControl.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {IDbCollection, ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {randomUUID} from "crypto";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {SsoOptions} from "../user/auth/AuthenticationService.js";

import * as Log from '../Logger.js';
import {OrganizationUnit, OrganizationUnitOptions, OrganizationUnitUUID} from "./OrganizationUnit.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {AuthModule, AuthModuleOptions} from "../user/auth/AuthModule.js";
import {LocalAuthModule} from "../user/auth/modules/LocalAuthModule.js";
import {AuthenticationSettings} from "../user/auth/AuthenticationSettings.js";
import {AuthModuleFactory} from "../user/auth/AuthModuleFactory.js";
import {ApplicationUnit, ApplicationUnitUUID} from "./ApplicationUnit.js";
import Role, {RoleUUID} from "../user/acl/common/Role.js";
import {UserGroup, UserGroupUUID} from "../user/acl/common/UserGroup.js";
import {EmailSender} from "../core/email/EmailSender.js";
import {Connection, ConnectionUUID} from "./conn/Connection.js";
import {Secret, SecretUUID} from "../core/secrets/Secret.js";
import {Device, DeviceUUID} from "../Device.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import {VdevEvent} from "../device/maker/VdevEvent.js";
import {Observable} from "rxjs";
import {ProjectOrder} from "../project/ProjectOrder.js";
import {ProjectSchedulerException} from "../errors/ProjectSchedulerException.js";
import {BusinessPlan, BusinessPlanType, ResourceThresholds} from "../billing/BusinessPlan.js";
import {ErrorCode} from "../errors/MonitoredError.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import {ProductType} from "../billing/Purchase.js";
import {Person} from "../user/Person.js";
import {CryptoUtils} from "../CryptoUtils.js";
import {TokenPurpose} from "../core/secrets/Token.js";
import Util from "../Utils.js";
import {UserServiceException} from "../errors/UserServiceException.js";
import {GlobalAccessControl} from "../user/acl/rbac/GlobalAccessContol.js";
import {OrganizationEmailBuilder} from "./OrganizationEmailBuilder.js";
import {AccessAttribute} from "../user/acl/AccessAttribute.js";
import {AccessControlException} from "../errors/AccessControlException.js";
import {Auditable} from "../Auditable.js";
import {EngineNode, EngineNodeUUID} from "../core/EngineNode.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface RoleUpdate {
    success:boolean,
    cause?:string,
    role:RoleUUID
}

export class OrganizationManager {

    private _ctx:DexcaliburEngine;

    private _emailBuilder:OrganizationEmailBuilder;

    private _emailSender:EmailSender;

    constructor( pInstance:DexcaliburEngine ) {
        this._ctx = pInstance;
        this._emailSender = new EmailSender(this._ctx);
        this._emailBuilder = new OrganizationEmailBuilder(this);
    }

    async listOrganizations(pUserAccount:UserAccount):Promise<OrganizationUnit[]> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_READ,
            pUserAccount
        );

        const all = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .getAsList() as OrganizationUnit[];

        const userOrg:OrganizationUnit[] = all.filter((vOrgUnit:OrganizationUnit):boolean => {
            try{
                AccessControl.isAuthorized(
                    AccessControl.access.ORG_OU_READ,
                    pUserAccount,
                    vOrgUnit,
                    [
                        OrganizationAccessControl.attr.MEMBER_GRP,
                        OrganizationAccessControl.attr.OWNER,
                        GlobalAccessControl.attr.ORG
                    ]
                );

                return true;
            }catch (err){
                return false
            }
        });

        return userOrg;
    }


    async sendInvitationMail(pUserAccount:UserAccount):Promise<void> {
        await this._emailSender.sendMail(
            pUserAccount.getEmail(),
            'Confirm your email address',
            'Join your organization on reverse platform : http://127.0.0.1',
            '<html><body><p>Join your organization on reverse platform : <a href="http://127.0.0.1:8080/">http://127.0.0.1:8080/</a></p></body></html>',
        );
    }



    async sendActivationMail(pUserAccount:UserAccount, pTokenLifetime:number, pOrg:Nullable<OrganizationUnit>) {
        // generate activation token
        const token = Buffer.from(CryptoUtils.randomChunk(256)).toString('base64');

        // add token and save
        await this._ctx.getUserService().addVerifyToken(pUserAccount,{
            token: token,
            purpose: TokenPurpose.ACCOUNT_VERIFY,
            ttl: pTokenLifetime,
            extra: pOrg.getUID()
        });

        //const link = `${process.env.DXC_SCHEMA!=null?process.env.DXC_SCHEMA:'http'}://${process.env.DXC_HOSTNAME!=null?process.env.DXC_HOSTNAME:'127.0.0.1:8080'}/activate/account/?token=${encodeURIComponent(token)}`;
        let emailAddr:string = null;
        // let expire:string = (pTokenLifetime>=3600)? (pTokenLifetime/3600)+" hours" : (pTokenLifetime/60)+" minutes" ;

        // validate email address
        if(ValidationRule.email().test(pUserAccount.getEmail())){
            emailAddr = pUserAccount.getEmail()
        }

        if(emailAddr==null && ValidationRule.email().test(pUserAccount.username)){
            emailAddr = pUserAccount.username;
        }

        if(emailAddr==null){
            throw OrganizationManagerException.INVALID_USER_EMAIL(
                pUserAccount.getUID(),
                "Activation email cannot be sent.");
        }

        // build email and send it
        await this._emailSender.sendPreparedMail( emailAddr, this._emailBuilder.buildActivationEmail(pUserAccount, token, pTokenLifetime, pOrg));

        /*
        await this._emailSender.sendMail(
            email,
            'Activate your Reversense account',
            `

Hi there,

Thank you for signing up for Reversense. Click on the link below to verify your email:

${link}

This link will expire in ${expire}.

Best,

The Reversense Team
            `,
            this._getActivateEmailTemplate(link,expire)
        );*/
    }

    /**
     *
     * @param pUserAccount
     * @param pOrg
     * @param pEmails
     * @param {Nullable<UserGroupUUID>} pGrpUID Optional
     */
    async inviteUsers(pUserAccount:UserAccount, pOrg:OrganizationUnit, pEmails:string[], pGrpUID:Nullable<UserGroupUUID>=null):Promise<boolean> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        // get group
        let grp:Nullable<UserGroup> = null;
        if(pGrpUID!=null){
            grp = pOrg.getUserGroup(pGrpUID);
        }



        let usrAcc:UserAccount;
        let success = 0;
        for(let k=0; k<pEmails.length; k++){
            try{
                // fill a
                usrAcc = new UserAccount({
                    _username:pEmails[k],
                    _email:pEmails[k],
                });

                // create account and perform various init ops
                usrAcc = await this._ctx.getUserService().createUser(usrAcc, pOrg);

                // todo if group if sepcified, assign the user to the group
                if(grp!=null){
                    grp.addMember(usrAcc.getUID());
                }

                // send acount activation link
                await this.sendActivationMail(usrAcc, 3600*2, pOrg);

                success++;
            }catch (err){
                Logger.error(err.stack);
            }
        }

        // save group
        if(grp != null){

            await (this._ctx.getEngineDB().getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
                .asyncUpdateEntry(pOrg, { replace:false, $set:['groups']});
        }

        return (success==pEmails.length);
    }

    //async updateUserGroup( pUserAccount:UserAccount, pOrg:OrganizationUnit)

    async countMembers(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<number> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_ACL_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        return pOrg.countMembers();
    }

    async listMembers(pUserAccount:UserAccount, pOrg:OrganizationUnit, pOffset:number, pSize:number):Promise<UserAccount[]> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_ACL_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );


        /*
        const all = await (this._ctx.getEngineDB()
            .getCollectionOf(UserAccount.TYPE.getType()) as MongodbDbCollection)
            .search(
                { filter:{ _uid: { $in: pOrg.members }}},
                { merlinRequest:false, raw:true }) as UserAccount[];*/


        return  await (this._ctx.getEngineDB()
            .getCollectionOf(UserAccount.TYPE.getType()) as MongodbDbCollection)
            .search(
                {
                    filter: {
                        ["_membership."+pOrg.getUID()]: {
                            $exists: true, $ne:null
                        }
                    }
                },
                { merlinRequest:false, raw:true }) as UserAccount[];
    }


    async getAuthModules(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<AuthModule[]> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AUTH_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        return pOrg.getAuthModules();
    }

    /**
     * Get anb organization by its uid
     *
     * @param pUserAccount
     * @param pUID
     */
    async getOrganization(pUserAccount:UserAccount, pUID:OrganizationUnitUUID):Promise<OrganizationUnit> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_READ,
            pUserAccount
        );

        if(!OrganizationUnit.VALIDATE.uuid.test(pUID)){
            throw OrganizationManagerException.INVALID_ORG_UUID_FMT(pUID)
        }

        const org = await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())as MongodbDbCollection)
            .asyncGetEntry({ uuid: pUID });


        if(org==null){
            throw OrganizationManagerException.UNKNOWN_ORG(pUID);
        }

        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_READ,
            pUserAccount,
            org,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
                GlobalAccessControl.attr.ORG
            ]
        );

        //AccessControl.checkAttr( AccessZone.ORGANIZATION, OrganizationAccessControl.attr.member, org,  pUserAccount);


        return org;
    }

    /**
     * Get anb organization by its uid
     *
     * @param pUserAccount
     * @param pUID
     */
    async getApplicationUnit(pUserAccount:UserAccount, pUID:string):Promise<ApplicationUnit> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount
        );

        const app = await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType())as MongodbDbCollection)
            .asyncGetEntry({ uuid: pUID });


        if(app==null){
            throw OrganizationManagerException.UNKNOWN_APP(pUID);
        }

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount,
            app,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.APP_MEMBER,
            ]
        );

        //AccessControl.checkAttr( AccessZone.ORGANIZATION, OrganizationAccessControl.attr.member, org,  pUserAccount);


        return app;
    }

    /**
     * Get anb organization by its uid
     *
     * @param pUserAccount
     * @param pUID
     */
    async getApplication(pUserAccount:UserAccount, pOrg:OrganizationUnit, pUID:string):Promise<ApplicationUnit> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount
        );

        const app = await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType())as MongodbDbCollection)
            .asyncGetEntry({ uuid: pUID, orgUnit:pOrg.getUID() });


        if(app==null){
            throw OrganizationManagerException.UNKNOWN_APP(pUID);
        }

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount,
            app,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        //AccessControl.checkAttr( AccessZone.ORGANIZATION, OrganizationAccessControl.attr.member, org,  pUserAccount);


        return app;
    }

    /**
     * Get anb organization by its uid
     *
     * @param pUserAccount
     * @param pUID
     */
    async getDirectApplication(pUserAccount:UserAccount, pAppUnitUUID:string):Promise<ApplicationUnit> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount
        );

        const app = await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType())as MongodbDbCollection)
            .asyncGetEntry({ uuid: pAppUnitUUID });


        if(app==null){
            throw OrganizationManagerException.UNKNOWN_APP(pAppUnitUUID);
        }

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount,
            app,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        return app;
    }

    async isUuidFree(pType:NodeInternalType, pUUID:string):Promise<boolean> {

        let coll:Nullable<IDbCollection> = null;
        switch (pType){
            case NodeInternalType.ORG_UNIT:
            case NodeInternalType.APP_UNIT:
                coll = await (this._ctx.getEngineDB().getCollectionOf(pType) as MongodbDbCollection);
                break;
        }

        if(coll==null){
            throw OrganizationManagerException.CANNOT_CHECK_UUID();
        }


        const res = await (coll as MongodbDbCollection).asyncGetEntry({ uuid:pUUID });
        console.log("isUuidFree ",res);
        return (res == null);
    }

    private async _isUnitFree(pType:NodeInternalType, pField:string, pValue:any):Promise<boolean> {

        let coll:Nullable<IDbCollection> = null;
        switch (pType){
            case NodeInternalType.ORG_UNIT:
            case NodeInternalType.APP_UNIT:
                coll = await (this._ctx.getEngineDB().getCollectionOf(pType) as MongodbDbCollection);
                break;
        }

        if(coll==null){
            throw OrganizationManagerException.CANNOT_CHECK_UUID();
        }


        switch (pField){
            case "uuid":
            case "name":
            case "companyName":
                const filter = {};
                Object.defineProperty(filter, pField, { value:pValue, writable:false });
                const res = await (coll as MongodbDbCollection).asyncGetEntry(filter);
                return (res != null)
            default:
                throw OrganizationManagerException.CANNOT_CHECK_PPT_UNIQ(pType,pField);
        }
    }


    /**
     * To create an organization unit from a org unit prototype
     *
     * @param {UserAccount} pUserAccount
     * @param {OrganizationUnit} pOrg
     */
    async createOrganizations(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<OrganizationUnit> {

        AccessControl.isAuthorized( AccessControl.access.ORG_OU_MODIFY, pUserAccount);

        // generate UUID
        let uuid:string;
        do {
            uuid = randomUUID();
        }while(await this.isUuidFree(OrganizationUnit.TYPE.getType(), uuid)==false)
        pOrg.uuid = uuid;

        if(!this._isUnitFree(OrganizationUnit.TYPE.getType(), "name", pOrg.name)){
            throw OrganizationManagerException.DUPLICATED_ORG_NAME();
        }

        // append user to owner list
        pOrg.appendToAccessAttribute(
            OrganizationAccessControl.attr.OWNER,
            pUserAccount.getUID()
        );

        // add parent organization as attribute (required to perform ABAC
        // with custom org-level user groups)
        pOrg.appendToAccessAttribute(
            GlobalAccessControl.attr.ORG,
            pOrg.uuid
        );


        // append user to member list
        pOrg.appendToAccessAttribute(
            OrganizationAccessControl.attr.MEMBER_GRP,
            pUserAccount.getUID()
        );

        // add local auth by default
        pOrg.addAuthModule(new LocalAuthModule({
            name: 'local_basic_auth',
            active: true,
            selfReg: {
                orgMember: false,
                external: false,
                guests: false
            },
            authorizedIPs: [
                AuthenticationSettings.LOCAL_ADDR_IPV4,
                AuthenticationSettings.LOCAL_ADDR_IPV6
            ]
        }));

        pOrg.prepareKeyChain();

        const org = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncAddEntry({ uuid: uuid}, pOrg) as OrganizationUnit;


        // added in 1.6.1
        // create a user group to hold members
        const usrGrp = await this.createUserGroup(pUserAccount, org, new UserGroup({
            name: org.companyName+"_members",
            description: org.companyName+" members"
        }));

        org.setAccessAttribute(
            OrganizationAccessControl.attr.MEMBER_GRP,
            usrGrp.getUID()
        );

        // update org
        const done = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncUpdateEntry( pOrg, { replace:false, $set:['_attr']}) as OrganizationUnit;


        return org;
    }

    async updateOrganization(pUserAccount:UserAccount, pOrg:OrganizationUnit, pChanges:OrganizationUnitOptions):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER
            ]
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncUpdateEntry(pOrg, {replace:false, $set:Object.keys(pChanges)});
    }

    async dropOrganization(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER
            ]
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncRemoveEntry(pOrg);
    }

    async createApplication(pUserAccount:UserAccount, pOrg:OrganizationUnit, pApp:ApplicationUnit):Promise<ApplicationUnit> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_MODIFY,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP
            ]);

        // generate UUID
        let uuid:string;
        do {
            uuid = randomUUID();
        }while(await this.isUuidFree(ApplicationUnit.TYPE.getType(), uuid)==false)
        pApp.uuid = uuid;

        if(!this._isUnitFree(ApplicationUnit.TYPE.getType(), "name", pApp.name)){
            throw OrganizationManagerException.DUPLICATED_APP_NAME();
        }

        // append user to owner list
        pApp.appendToAccessAttribute(
            OrganizationAccessControl.attr.OWNER,
            pUserAccount.getUID()
        );

        // add parent organization as attribute (required to perform ABAC
        // with custom org-level user groups)
        pApp.appendToAccessAttribute(
            GlobalAccessControl.attr.ORG,
            pApp.getParentOrganization()
        );



        // add app member group to org
        const appGrp = await this.createUserGroup(this._ctx.getInternalAcc(), pOrg, new UserGroup({
            name: pApp.packageID+"_members"
        }))

        // attach group UID
        /*pOrg.appendToAccessAttribute(
            OrganizationAccessControl.attr.APP_MEMBER_GRP,
            appGrp.getUID()
        );*/

        // attach group UID
        pApp.appendToAccessAttribute(
            OrganizationAccessControl.attr.APP_MEMBER_GRP,
            appGrp.getUID()
        );

        // append user to member list
        pApp.appendToAccessAttribute(
            OrganizationAccessControl.attr.APP_MEMBER,
            pUserAccount.getUID()
        );

        // create app
        const app = await this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType())
            .asyncAddEntry({ uuid: uuid}, pApp);

        // create app subscription
        // this.activateApplicationSubscription()

        return app;
    }

    async updateApplication(pUserAccount:UserAccount, pOrg:OrganizationUnit, pAppUnit:ApplicationUnit, pChanges:any):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_MODIFY,
            pUserAccount,
            pAppUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType())
            .asyncUpdateEntry(pAppUnit, {replace:false, $set:[Object.keys(pChanges)]}) as boolean;
    }

    /**
     * To drop application and all related project  and report
     * @param pUserAccount
     * @param pOrg
     * @param pApp
     */
    async dropApplication(pUserAccount:UserAccount, pOrg:OrganizationUnit, pApp:ApplicationUnit):Promise<boolean> {

        // check if the user is authorized to drop the app (must be the owner of app or of the org)
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_MODIFY,
            pUserAccount,
            pApp,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        // drop child projects. TODO : replace by deleteMany
        const rel = pApp.getReleases();
        for(let i=0;i<rel.length;i++){
            await this._ctx.deleteProject(pUserAccount, rel[i], false);
        }

        // delete reports
        await this._ctx.getAuditManager().dropReportsByApp(pApp.getUID());

        // delete app unit
        return await this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType())
            .asyncRemoveEntry(pApp);
    }

    async testSsoConnection(pAccount:UserAccount, pConnSettings:SsoOptions):Promise<boolean> {
        AccessControl.isAuthorized(AccessControl.access.ORG_AUTH_MGT, pAccount)

        return await this._ctx.getUserService().getAuthenticationService().testSsoConnection(pConnSettings)
    }


    async saveSsoConnection(pAccount:UserAccount, pOrg:OrganizationUnit, pAuthMod:AuthModuleOptions):Promise<boolean> {


        return false;
    }


    async editAuthModule(pAccount:UserAccount, pOrg:OrganizationUnit, pAuthMod:AuthModuleOptions):Promise<boolean> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AUTH_MGT,
            pAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );


        // search existing module
        const mods = pOrg.getAuthModuleByType(pAuthMod.type);
        let modsUUID:string;
        if(mods != null){
            mods.update(pAuthMod);
            modsUUID = pAuthMod.uid;
        }else{
            modsUUID = pOrg.addAuthModule(AuthModuleFactory.from(pAuthMod));
        }


        return await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncUpdateEntry(pOrg, {replace:false, $set:['authModules'] });

        return true;
    }

    async testAuthModuleConnection(pAccount:UserAccount, pOrg:OrganizationUnit, pAuthMod:AuthModuleOptions):Promise<boolean> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AUTH_MGT,
            pAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        try{
            const mod = AuthModuleFactory.from(pAuthMod);
            return mod.testConnection(this._ctx.getUserService().getAuthenticationService().settings);
        }catch(e){
            return false;
        }
    }


    /**
     * Get anb organization by its uid
     *
     * @param pUserAccount
     * @param pUID
     */
    async listRoles(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<Role[]> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_ACL_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        let roles:Role[] = [];
        // gather generic roles
        roles = await this._ctx.getAclManager().listGenericRoles(pUserAccount);

        // gather org roles
        roles = roles.concat(await this._ctx.getAclManager().listOrganizationRoles(pUserAccount, pOrg));

        return roles;
    }




    async getUsers(pUserAccount: UserAccount, pOrg: OrganizationUnit, pUUIDs:UserAccountUUID[]):Promise<UserAccount[]>{
        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_READ,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        return await this._ctx.getEngineDB().searchUsers(pUUIDs);
    }

    /**
     * To retrieve the list of authorized application unit
     *
     * @param pUserAccount
     * @param pOrg
     */
    async listApplications(pUserAccount: UserAccount, pOrg: OrganizationUnit):Promise<ApplicationUnit[]> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        const all = await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType()) as MongodbDbCollection)
            .search({ filter: {orgUnit: { $in: [ pOrg.getUID() ] }}},{ merlinRequest:false, raw:true }) as ApplicationUnit[];

        const authorized:ApplicationUnit[] = [];

        // filter app list by attribute
        all.map(( vApp:ApplicationUnit)=>{
            try {

                // Fix missing GlobalAccessControl.attr.ORG attributes for existing apps
                if(vApp.getAccessAttribute(GlobalAccessControl.attr.ORG)==null){

                    // append user to member list
                    vApp.appendToAccessAttribute(
                        GlobalAccessControl.attr.ORG,
                        pOrg.getUID()
                    );

                    (async ()=>{
                        await this.updateApplication(
                            this._ctx.getInternalAcc(),
                            pOrg,
                            vApp,
                            { '_attr':true }
                        );
                        Logger.success(`[ORG MGR] Application [pkg=${vApp.packageID}] ; missing Org_unit attr fixed.`);
                    })();
                }

                // check if user can list applications
                AccessControl.isAuthorized(
                    AccessControl.access.ORG_AU_READ,
                    pUserAccount,
                    vApp,
                    [
                        OrganizationAccessControl.attr.OWNER,
                        //OrganizationAccessControl.attr.APP_MEMBER,
                        OrganizationAccessControl.attr.APP_MEMBER_GRP,
                        //OrganizationAccessControl.attr.MEMBER_GRP,
                    ]
                );

                authorized.push(vApp);

            }catch (err){
            }
        });

        return authorized;
    }

    /**
     * To retrieve the list of authorized application unit
     *
     * @param pUserAccount
     * @param pOrg
     */
    async listApplicationsByUser(pUserAccount: UserAccount):Promise<ApplicationUnit[]> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount
        );

        const authorized = await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType()) as MongodbDbCollection)
            .search({
                    filter: OrganizationAccessControl.getAppMembersFilter(pUserAccount.getUID())
                },
                { merlinRequest:false, raw:true }) as ApplicationUnit[];

        //const authorized:ApplicationUnit[] = [];

        return authorized;
    }

    async dropUserGroup(pUserAccount:UserAccount, pOrg:OrganizationUnit, pGrpUUID:UserGroupUUID):Promise<boolean> {

        // check if the user is authorized to drop the app (must be the owner of app or of the org)
        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        pOrg.removeUserGroup(pGrpUUID);

        return await (this._ctx.getEngineDB().getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['groups']});
    }

    async updateUserGroup(pUserAccount:UserAccount, pOrg:OrganizationUnit, pGrpUUID:UserGroupUUID, pData:any):Promise<boolean> {

        // check if the user is authorized to drop the app (must be the owner of app or of the org)
        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        const grp = pOrg.getUserGroup(pGrpUUID);
        if(grp==null){
            throw OrganizationManagerException.USER_GROUP_NOT_FOUND(pGrpUUID);
        }

        grp.update(pData);

        return await (this._ctx.getEngineDB().getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['groups']});
    }


    async listGroupMembers(pUserAccount: UserAccount, pOrg: OrganizationUnit, pGrpUUID: string):Promise<UserAccount[]> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        return  await (this._ctx.getEngineDB()
            .getCollectionOf(UserAccount.TYPE.getType()) as MongodbDbCollection)
            .search(
                {
                    filter: {
                        ["_membership."+pOrg.getUID()+".groups"]: {
                            $in: [pGrpUUID]
                        }
                    }
                },
                { merlinRequest:false, raw:true }) as UserAccount[];
    }

    async listGroupRoles(pUserAccount: UserAccount, pOrg: OrganizationUnit, pGrpUUID: string) {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        // check if the group is a part of the organization
        const grp = pOrg.getUserGroup(pGrpUUID);
        if(grp==null){
            throw OrganizationManagerException.USER_GROUP_NOT_FOUND(pGrpUUID);
        }


        return  grp.roles.map(x => this._ctx.getAclManager().getRole(x) );
    }

    async createUserGroup(pUserAccount: UserAccount, pOrg: OrganizationUnit, pUserGroup: UserGroup):Promise<UserGroup> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        // detect duplicated group by name
        if(pOrg.getUserGroupByName(pUserGroup.name)!=null){
            throw OrganizationManagerException.USER_GROUP_ALREADY_EXISTS(pOrg.getUID(),pUserGroup.name);
        }

        // uid must be unique organization-wide
        let uid:UserGroupUUID;
        do{
            uid = randomUUID()
        }while (pOrg.getUserGroup(uid)!=null);

        pUserGroup.setUID(uid);
        pOrg.addUserGroup(pUserGroup);

        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['groups'] })){

            return pUserGroup;
        }else{
            throw OrganizationManagerException.CANNOT_CREATE_USERGRP(pOrg.getUID(),pUserGroup.getUID());
        }
    }


    async addRolesToGroup(pUserAccount: UserAccount, pOrg: OrganizationUnit,
                    pUserGroupUID: UserGroupUUID, pRoles:RoleUUID[]):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );


        const grp = pOrg.getUserGroup(pUserGroupUID);
        if(grp==null){
            throw OrganizationManagerException.USER_GROUP_NOT_FOUND(pUserGroupUID);
        }

        pRoles.map( vRoleUID => {
            const role = this._ctx.getAclManager().getRole(vRoleUID);
            if(role.isGeneric()){
                grp.addRole(vRoleUID);
            }else if(role.hasOrg(pOrg.getUID())){
                grp.addRole(vRoleUID);
            }else{
                throw  OrganizationManagerException.CANNOT_ADD_ROLE_TO_GROUP(vRoleUID,pOrg.getUID(), grp.getUID());
            }
        });

        return await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['groups'] })

    }

    /**
     * @deprecated
     * @param pUserAccount
     * @param pOrg
     * @param pUserGroupUID
     * @param pAccount
     */
    async addMembersToGroup(pUserAccount: UserAccount, pOrg: OrganizationUnit,
                          pUserGroupUID: UserGroupUUID, pAccount:UserAccountUUID[]):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );


        const grp = pOrg.getUserGroup(pUserGroupUID);
        if(grp==null){
            throw OrganizationManagerException.USER_GROUP_NOT_FOUND(pUserGroupUID);
        }

        pAccount.map( vUID => {
            if(pOrg.hasMember(vUID)){
                grp.addMember(vUID);
            }else{
                throw  OrganizationManagerException.CANNOT_ADD_MEMBER_TO_GROUP(vUID,pOrg.getUID(), grp.getUID());
            }
        });

        return await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['groups'] })

    }

    async addMembersToAU(pUserAccount:UserAccount, pOrg: OrganizationUnit,
                     pApp: ApplicationUnit, pMembers:UserAccountUUID[]):Promise<boolean> {

        const errors:any[] = [];
        const members:UserAccountUUID[] = [];

        if(!ApplicationUnit.VALIDATE.members.test(pMembers)){
            throw OrganizationManagerException.INVALID_USER_ACCOUNTS_LIST();
        }

        pMembers.map((vUnsafeAccount:UserAccountUUID)=>{
            try{
                if(pOrg.hasMember(vUnsafeAccount)){
                    members.push(vUnsafeAccount);
                }else{
                    errors.push({ member: vUnsafeAccount, err:"This account is not a member of the organization."  });
                }
            }catch (e){}
        });

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_MODIFY,
            pUserAccount,
            pApp,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
                OrganizationAccessControl.attr.APP_MEMBER_GRP,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        let memberGrp_attr = pApp.getAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER_GRP);
        let memberGrp:UserGroupUUID;

        // if group is missing, create it
        if(memberGrp_attr==null){

            // add app member group to org
            let appGrp = await this.createUserGroup(this._ctx.getInternalAcc(), pOrg, new UserGroup({
                name: pApp.packageID+"_au_members"
            }))

            // update AU
            pApp.appendToAccessAttribute(
                OrganizationAccessControl.attr.APP_MEMBER_GRP,
                appGrp.getUID()
            );

            await this.updateApplication(this._ctx.getInternalAcc(), pOrg, pApp, {
                _attr: (pApp as any)._attr
            });

            memberGrp = appGrp.getUID();
        }else{
            memberGrp = memberGrp_attr.value[0];
        }

        // OrganizationAccessControl.attr.APP_MEMBER approach is useless.
        // TODO : remove
        pApp.addMembers(members);

        for(let i=0; i<members.length; i++){
            await this._ctx.getAclManager().addUserToGroup(
                members[i],
                memberGrp,
                pOrg
            );
        }

        return this.updateApplication(pUserAccount, pOrg, pApp, {
            _attr: (pApp as any)._attr
        })
    }



    // ============== CONNECTIONS MGT ================

    async listConnections(pUserAccount:UserAccount, pOrg: OrganizationUnit):Promise<Connection[]> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_SECRETS_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        return pOrg.getConnections();
    }



    async addConnectionToOrg(pUserAccount:UserAccount, pOrg: OrganizationUnit, pConn:Connection):Promise<boolean> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_SECRETS_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        let cuuid:ConnectionUUID;
        do{
            cuuid = randomUUID();
        }while(!pOrg.isConnUuidFree(cuuid))

        pConn.uuid = cuuid;
        // add ACL attributes decicated to conenctions attached to an org
        pConn.setAccessAttribute(OrganizationAccessControl.attr.MEMBER_GRP);
        pConn.setAccessAttribute(OrganizationAccessControl.attr.OWNER);


        pOrg.addConnection(pConn);

        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['connections'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_UPDATE_CONNECTION(pOrg.getUID(),pConn.getUID());
        }
    }

    async updateBusinessPlan(pUserAccount:UserAccount, pOrg: OrganizationUnit):Promise<void> {

        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['businessPlan'] })){

        }else{
            throw OrganizationManagerException.CANNOT_UPDATE_BUSINESSPLAN(pOrg.getUID());
        }
    }

    async updateConnections(pUserAccount:UserAccount, pOrg: OrganizationUnit, pConn:Connection):Promise<boolean> {

        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_SECRETS_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        pOrg.addConnection(pConn, true);

        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['connections'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_UPDATE_CONNECTION(pOrg.getUID(),pConn.getUID());
        }
    }



    async removeConnectionFromOrg(pUserAccount:UserAccount, pOrg: OrganizationUnit, pConnUUID:ConnectionUUID):Promise<boolean> {

        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_SECRETS_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        pOrg.removeConnection(pConnUUID);

        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['connections'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_REMOVE_CONNECTION(pOrg.getUID(),pConnUUID);
        }
    }


    // ============== SECRET MGT ================


    async listOrgSecrets(pUserAccount:UserAccount, pOrg: OrganizationUnit):Promise<Secret[]> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_SECRETS_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        return pOrg.getSecrets();
    }


    async addSecretToOrg(pUserAccount:UserAccount, pOrg: OrganizationUnit, pSecret:Secret):Promise<boolean> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_SECRETS_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        let uuid:SecretUUID;
        do{
            uuid = randomUUID();
        }while(!pOrg.isSecretUuidFree(uuid))

        pSecret.setUID(uuid);
        pOrg.addSecret(pSecret);

        // test read of secret
        pOrg.readSecret(pUserAccount, uuid);

        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['secrets'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_UPDATE_SECRET(pOrg.getUID(),pSecret.getUID());
        }
    }


    async removeSecretFromOrg(pUserAccount:UserAccount, pOrg: OrganizationUnit, pSecretUUID:SecretUUID):Promise<boolean> {

        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_SECRETS_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        pOrg.removeSecret(pSecretUUID);

        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['secrets'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_REMOVE_SECRET(pOrg.getUID(),pSecretUUID);
        }
    }


    async rerollOrganizationKeyChain(pUserAccount:UserAccount, pOrgUnit:OrganizationUnit):Promise<void> {

        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_SECRETS_MGT,
            pUserAccount,
            pOrgUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        let newOKC = false;
        try{
            // check if key chain is ready
            pOrgUnit.getSecret(OrganizationUnit.SEED_SUID);
        }catch(e){
            // init keychain
            pOrgUnit.prepareKeyChain();
            // update
            if(await (this._ctx.getEngineDB()
                .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
                .asyncUpdateEntry(pOrgUnit, { replace:false, $set:['secrets'] })){

                newOKC = true;
            }else{
                throw OrganizationManagerException.CANNOT_UPDATE_SECRET(pOrgUnit.getUID(),OrganizationUnit.SEED_SUID);
            }
        }

        return;
    }

    /**
     * To retrieve device from an organization by its uid
     *
     * @param pUserAccount
     * @param pOrgUnit
     * @param pDevUID
     */
    async getDevice(pUserAccount:UserAccount, pOrgUnit:OrganizationUnit, pDevUID:DeviceUUID):Promise<Device>{

        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.DEV_INS_PROFILE,
            pUserAccount,
            pOrgUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP
            ]
        );

        // read device
        const dev = this._ctx.getDeviceManager().getDevice(pDevUID);

        // check if device is a part of the organization


        return dev;
    }


    async attachDevice(pUserAccount:UserAccount, pOrgUnit:OrganizationUnit, pDevice:DeviceUUID):Promise<boolean> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUserAccount,
            pOrgUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP
            ]
        );

        pOrgUnit.attachDevice(pDevice);

        // check if device is a part of the organization
        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrgUnit, { replace:false, $set:['devices'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_ATTACH_DEV(pOrgUnit.getUID(),pDevice);
        }
    }


    async detachDevice(pUserAccount:UserAccount, pOrgUnit:OrganizationUnit, pDevice:DeviceUUID):Promise<boolean> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUserAccount,
            pOrgUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP
            ]
        );

        pOrgUnit.detachDevice(pDevice);

        // check if device is a part of the organization
        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrgUnit, { replace:false, $set:['devices'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_DETACH_DEV(pOrgUnit.getUID(),pDevice);
        }
    }

    /**
     * To assign a device to an application unit
     *
     * The user must be authorized of the organization containing the application unit
     *
     * @param pUserAccount
     * @param pAppUnit
     * @param pDevice
     * @param {boolean} pRollback Default FALSE. If TRUE it deassign the device from app
     */
    async assignDevice(pUserAccount:UserAccount, pAppUnit:ApplicationUnit, pDevice:DeviceUUID, pRollback = false):Promise<boolean> {
        // check if user can modify app
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_MODIFY,
            pUserAccount,
            pAppUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        //  check if the user is a part of organization containing the app
        const org = await this.getOrganization(pUserAccount, pAppUnit.getParentOrganization());

        // check if the device is a part of the organization
        if(!org.hasDevice(pDevice)){
            throw OrganizationManagerException.DEVICE_NOT_FOUND_IN_ORG(org.getUID(), pDevice);
        }

        pAppUnit.assignDevice(pDevice, pRollback);

        // check if device is a part of the organization
        if(await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pAppUnit, { replace:false, $set:['devices'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_ASSIGN_DEV(pAppUnit.getUID(),pDevice);
        }
    }

    /**
     *
     * @param pUserAccount
     * @param pAppUnit
     * @param pProject
     */
    async attachProject(pUserAccount:UserAccount, pAppUnit:ApplicationUnit, pProject:DexcaliburProject):Promise<boolean> {
        // check if user can list applications
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_NEW_PROJ,
            pUserAccount,
            pAppUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
                OrganizationAccessControl.attr.MEMBER_GRP
            ]
        );

        AccessControl.isAuthorizedByAttr(
            ProjectAccessControl.attr.OWNER,
            pProject,
            pUserAccount
        );

        pAppUnit.attachProject(pProject);

        // check if device is a part of the organization
        if(await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pAppUnit, { replace:false, $set:['projects'] })){

            return true;
        }else{
            throw OrganizationManagerException.CANNOT_ATTACH_PROJ(pAppUnit.getUID(),pProject.getUID());
        }
    }

    async startDevice(pUserAccount:UserAccount, pOrg: OrganizationUnit, pDeviceUID: DeviceUUID):Promise<Observable<VdevEvent>> {

        // check if user can start a device
        AccessControl.isAuthorized(
            AccessControl.access.DEV_INS_START,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        // check if the device is a attached to this organization
        if(!pOrg.hasDevice(pDeviceUID)){
            throw OrganizationManagerException.DEVICE_NOT_FOUND_IN_ORG(pOrg.getUID(), pDeviceUID);
        }

        const dev = await this._ctx
            .getDeviceManager()
            .getDevice(pDeviceUID);

        // check if the device has been created from a template
        if(dev.getTemplate()!=null){
            return (await this._ctx.getDeviceManager().startDevice(pUserAccount, dev))
        }else{
            // TO DO
            throw new Error("Cannot start device : no template");
        }

    }


    async stopDevice(pUserAccount:UserAccount, pOrg: OrganizationUnit, pDeviceUID: DeviceUUID):Promise<any> {

        // check if user can start a device
        AccessControl.isAuthorized(
            AccessControl.access.DEV_INS_KILL,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        // check if the device is a attached to this organization
        if(!pOrg.hasDevice(pDeviceUID)){
            throw OrganizationManagerException.DEVICE_NOT_FOUND_IN_ORG(pOrg.getUID(), pDeviceUID);
        }

        const dev = await this._ctx
            .getDeviceManager()
            .getDevice(pDeviceUID);

        // check if the device has been created from a template
        if(dev.getTemplate()!=null){
            return (await this._ctx.getDeviceManager().stopDevice(pUserAccount, dev))
        }else{
            // TO DO
            throw new Error("Cannot stop device : no template");
        }

    }



    /**
     * If the device has been provisioned by organization ,then drop it, else aonly detach it from the device
     *
     * When a Device is dropped, it triggers a cleanup routine to remove device files
     *
     * @param pUserAccount
     * @param pOrgUnit
     * @param pDevUID
     */
    async dropDevice(pUserAccount:UserAccount, pOrgUnit:OrganizationUnit, pDevUID:DeviceUUID):Promise<Device>{

        // check if user can list applications
        try{
            AccessControl.isAuthorized(
                AccessControl.access.DEV_DESTROY_VIRT,
                pUserAccount,
                pOrgUnit,
                [
                    OrganizationAccessControl.attr.OWNER,
                    OrganizationAccessControl.attr.MEMBER_GRP
                ]
            );
        }catch (e){
            AccessControl.isAuthorized(
                AccessControl.access.DEV_DESTROY_PHY,
                pUserAccount,
                pOrgUnit,
                [
                    OrganizationAccessControl.attr.OWNER,
                    OrganizationAccessControl.attr.MEMBER_GRP
                ]
            );
        }


        // read device
        const dev = this._ctx.getDeviceManager().getDevice(pDevUID);

        // check if device is a part of the organization
        if(pOrgUnit.getDevices().indexOf(pDevUID)==-1){
            throw  OrganizationManagerException.CANNOT_DETROY_DEV(pDevUID,"Not a part of target organization")
        }

        // check if the device is attached to more organization
        const linkedOrgs = await this._searchOrganizationByDevice(pDevUID);

        if(linkedOrgs.length>1 && linkedOrgs.indexOf(pOrgUnit.getUID())>-1){
            // more than one organization use this device
            // The device must be flushed from org data/app
            // await this._ctx.getDeviceManager().flushDevice(pUserAccount, pDevUID);
            throw new Error("Operation not supported");
        }else{
            // The device is used only by the organization, then the device can be detroyed
            // 1) Ask to DM to destroy device,  mark it as "removed"
            await this._ctx.getDeviceManager().dropDeviceSoft(pUserAccount, pDevUID);
            // 2) Remove from Org
        }

        return dev;
    }

    /**
     * to verify balance before to execute a ProjectOrder
     *
     * @param {ProjectOrder} pOrder
     */
    async verifyBalance(pOrder:ProjectOrder):Promise<void> {

        const ouid = pOrder.getOrganizationUnit();

        if(!OrganizationUnit.VALIDATE.uuid.test(ouid)){
            throw ProjectSchedulerException.CANNOT_VERIFY_ORG_BALANCE(ouid);
        }

        const org = await this.getOrganization(this._ctx.getInternalAcc(), ouid);
        const bp = org.getBusinessPlan();

        switch (bp.plan){
            case BusinessPlanType.SUBSCRIPTION:
                bp.hasFreeAppSlot(pOrder.getApplicationUnit());
                break;
            case BusinessPlanType.SCAN:
                bp.hasFreeScanSlot();
                break;
            default:
                throw OrganizationManagerException.INVALID_BUSINESS_PLAN(ouid);
                break;
        }
    }

    /**
     * to verify balance before to execute a ProjectOrder
     *
     * @param {ProjectOrder} pOrder
     */
    async verifyScanBalance(pOrder:ScanOrder):Promise<void> {

        const ouid = pOrder.getOrganizationUnit();

        if(!OrganizationUnit.VALIDATE.uuid.test(ouid)){
            throw ProjectSchedulerException.CANNOT_VERIFY_ORG_BALANCE(ouid);
        }

        const org = await this.getOrganization(this._ctx.getInternalAcc(), ouid);
        let bp:BusinessPlan;

        try {
            bp = org.getBusinessPlan();
        }catch (e){
            if(e.code==ErrorCode.ORGANIZATION + 31){
                org.setBusinessPlan(BusinessPlan.newSubscription(
                    org,
                    {
                        concurrentNodes: 3
                    }
                ));
                await this._ctx.getEngineDB().save(org);
                bp = org.getBusinessPlan();
            }
        }

        const model = await this._ctx.getAuditManager()
            .getModelByUID(
                this._ctx.getInternalAcc(),
                pOrder.getModelUID());

        if(model==null){
            throw OrganizationManagerException
                .CANNOT_VERIFY_SCAN_BALANCE(`Assurance model [uuid=${pOrder.getModelUID()}] not found.`);
        }

        if(!bp.canPerformScan(model.getScannerID())){
            throw OrganizationManagerException
                .SCAN_LICENSE_VIOLATION(org.getUID(),model.getUID());
        }
    }



    async getOrganizationThresholds( pAccount:UserAccount, pOrgUUID:OrganizationUnitUUID):Promise<ResourceThresholds> {

        AccessControl.isAuthorized(
            AccessControl.access.SRV_INSTANCE_MGT,
            pAccount
        );

        const org = await this.getOrganization(pAccount, pOrgUUID);

        try{
            return org.getBusinessPlan().thresholds;
        }catch(err){
            // bp is missing
            if((err as OrganizationManagerException).getCode()==(ErrorCode.ORGANIZATION + 31)){
                org.setBusinessPlan(BusinessPlan.newSubscription(org,{
                    concurrentNodes: 3
                }));

                await this._ctx.getEngineDB()
                    .getCollectionOf(OrganizationUnit.TYPE.getType())
                    .asyncUpdateEntry(org, { replace:false, $set:['businessPlan']});

                return org.getBusinessPlan().thresholds
            }else{
                 throw err;
            }
        }
    }

    /**
     * To check if there is an activated license for a subscription of the target app
     *
     * @param pOrg
     * @param pTarget
     */
    async isLicenseActivated( pOrg: OrganizationUnit,
                              pTarget:DexcaliburProjectUUID|ApplicationUnitUUID):Promise<boolean>{

        let bp = pOrg.getBusinessPlan();
        if(bp==null){
            Logger.info(`Business plan is missing for org ${pOrg.getUID()}`);
            return false;
        }

        return bp.hasSubscriptionFor(pTarget);
    }

    /**
     *
     * @param pUser
     * @param pOrg
     * @param pType
     * @param pTarget
     */
    async activateLicense( pUser:UserAccount,
                           pOrg:OrganizationUnit,
                           pType:ProductType,
                           pTarget:DexcaliburProjectUUID|ApplicationUnitUUID):Promise<boolean> {


        if(pType==ProductType.APP){
            await this._ctx.getAuditManager().activateApplicationSubscription(
                pUser, pOrg, pTarget
            );

            return await this.isLicenseActivated(pOrg, pTarget);
        }else if(pType==ProductType.SCAN){
            await this._ctx.getAuditManager().activateApplicationScan(
                pUser, pOrg, pTarget
            );

            return true;
        }else{
            throw OrganizationManagerException.PRODUCT_NOT_SUPPORTED(pType);
        }
    }

    async createUser(pUserAccount: UserAccount,
                     pOrg: OrganizationUnit,
                     pUnsafeData:UserAccountOptions):Promise<Nullable<UserAccountUUID>> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        let uuid = await this._ctx.getEngineDB().generateFreeUuid(
            UserAccount.TYPE.getType(),
            UserAccount.TYPE.getPrimaryKey().getName()
        );
        let account:UserAccount;
        let unsafeAcc = new UserAccount();
        unsafeAcc.lock();
        if(UserAccount.VALIDATE._email.test(pUnsafeData._username)){
            unsafeAcc.username = pUnsafeData._username;
        }
        if(UserAccount.VALIDATE._type.test(pUnsafeData._type)){
            unsafeAcc.setType(pUnsafeData._type);
        }
        if(pUnsafeData._person!=null && Object.values(pUnsafeData._person).length>0){
            const prs = new Person();

            const unsafeF = (pUnsafeData._person as any)._firstname;
            const unsafeL = (pUnsafeData._person as any)._lastname;
            if(unsafeF!=null && Person.VALIDATE._firstname.test(unsafeF)){
                prs.firstname = unsafeF;
            }
            if(unsafeL!=null && Person.VALIDATE._lastname.test(unsafeL)){
                prs.lastname = unsafeL;
            }
            unsafeAcc.person = prs;
        }

        // verify uniqueness of username
        await this._ctx.getUserService().checkUsernameIsFree(unsafeAcc.username);


        if(unsafeAcc.getType()===UserAccountType.LOCAL){
            account = await this._ctx.getUserService().createLocalUser(
                uuid,[], unsafeAcc.username, unsafeAcc.person, false
            );
        }else{
            throw OrganizationManagerException.CANNOT_CREATE_FEDERATED_USR(unsafeAcc.username, pOrg.getUID());
        }

        pOrg.addMember(account);
        await this._ctx.getUserService().addMembership(account, pOrg, false);


        const updateRes = await (this._ctx.getEngineDB().getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['members']});

        if(updateRes){

            // send activation email
            await this.sendActivationMail(account, 3600*2, pOrg);

            return account.getUID();
        }else{
            return null;
        }
    }


    async updateUser(pUserAccount: UserAccount,
                     pOrg: OrganizationUnit,
                     pUserUID: UserAccountUUID,
                     pUnsafeUpdates:UserAccountOptions):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        // check if the user is a member of the organization
        if(!pOrg.hasMember(pUserUID)){
            throw OrganizationManagerException.NOT_A_MEMBER(pUserUID,pOrg.getUID());
        }

        const account = await this._ctx.getUserService().getAccount(pUserAccount, pUserUID);

        if(account.getType()===UserAccountType.FEDERATED){
            throw OrganizationManagerException.CANNOT_UPDATE_FEDERATED_USR(pUserUID, pOrg.getUID());
        }

        const updatedAcc = await this._ctx.getUserService().updateAccountWithUnsafe(
            pUserAccount, pUserUID, pUnsafeUpdates
        );

        return true;
    }


    async activateMember(pUserAccount: UserAccount,
                         pOrg: OrganizationUnit,
                         pUserUID: UserAccountUUID):Promise<boolean> {

        // if account is not activated, activate it
        const useracc = await this._ctx.getUserService().getAccount(
            this._ctx.getInternalAcc(),
            pUserUID
        )

        if(useracc==null){
            throw UserServiceException.USER_NOT_FOUND();
        }

        // unlock account
        if(useracc.isLocked()){
            useracc.unlock();
        }

        const mb = useracc.getMembership(pOrg.getUID());

        if(mb!=null && mb.activated==false){
            mb.locked = false;
            mb._lockDate = -1;
            mb.activated = true;
            mb._activateDate = Util.time();
        }

        await this._ctx.getEngineDB().save(useracc);

        return true;
    }

    /**
     * To drop a user account
     *
     * This method calls user service to perform various in order to globally remove
     * user account or to only detach it from this organization if the user is a cross-org account
     *
     * Corss-organization account are user with "srv_instance_mgt" role or account linked to several organizations
     *
     * @param {UserAccount} pUserAccount The user issueing "drop" operation
     * @param {OrganizationUnit} pOrg Target organization unit
     * @param {UserAccountUUID} pUserUID The UUID of the user to drop
     */
    async dropMember(pUserAccount: UserAccount,
                     pOrg: OrganizationUnit,
                     pUserUID: UserAccountUUID,
                    pDeactivateOnly = true):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        // check if the user is a member of the organization
        if(!pOrg.hasMember(pUserUID)){
            throw OrganizationManagerException.NOT_A_MEMBER(pUserUID,pOrg.getUID());
        }

        const account = await this._ctx.getUserService().getAccount(pUserAccount, pUserUID);

        const ms = account.getMembership(pOrg.getUID());

        if(pDeactivateOnly==true && ms!=null){
            await this._ctx.getUserService().deactivate(account, pOrg);
            return;
            //  account.archive();
        }else{
            await this._ctx.getUserService().dropMembership(account, pOrg);
        }


        // remove membership (remove also membership from user account)
        pOrg.removeMember(account);

        await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncUpdateEntry(pOrg, {replace:false, $set:['_members'] });


        // if the account is not an administrator account, the account is removed
        /*try{
            AccessControl.isAuthorized(
                AccessControl.access.SRV_INSTANCE_MGT,
                account);
            // IMPORTANT : DO NOT REMOVE USER WITH CROSS-ORGANIZATION PERMISSIONS
        }catch (e1){
            try{
                AccessControl.isAuthorized(
                    AccessControl.access.ORG_OU_MODIFY,
                    account);
                // IMPORTANT : DO NOT REMOVE USER WITH ORGANIZATION ADMIN PERMISSIONS
            }catch (e2){
                await this._ctx.getUserService().dropUser(account);
            }
        }*/

        return true;
    }

    async sendUnlockMail(pUserAccount: UserAccount,
                     pOrg: OrganizationUnit,
                     pUserUID: UserAccountUUID):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        // check if the user is a member of the organization
        if(!pOrg.hasMember(pUserUID)){
            throw OrganizationManagerException.NOT_A_MEMBER(pUserUID,pOrg.getUID());
        }

        const account = await this._ctx.getUserService().getAccount(pUserAccount, pUserUID);

        if(account.getType()===UserAccountType.FEDERATED){
            throw OrganizationManagerException.CANNOT_UPDATE_FEDERATED_USR(pUserUID, pOrg.getUID());
        }

        this.sendActivationMail(account, 3600*2, pOrg);

        return true;
    }

    async lockMember(pUserAccount: UserAccount,
                         pOrg: OrganizationUnit,
                         pUserUID: UserAccountUUID):Promise<boolean> {

        return await this._lockMember(pUserAccount,pOrg,pUserUID,true);
    }

    async unlockMember(pUserAccount: UserAccount,
                     pOrg: OrganizationUnit,
                     pUserUID: UserAccountUUID):Promise<boolean> {

        return await this._lockMember(pUserAccount,pOrg,pUserUID, false);
    }

    private async _lockMember(pUserAccount: UserAccount,
                     pOrg: OrganizationUnit,
                     pUserUID: UserAccountUUID,
                              pLocked:boolean):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        // check if the user is a member of the organization
        if(!pOrg.hasMember(pUserUID)){
            throw OrganizationManagerException.NOT_A_MEMBER(pUserUID,pOrg.getUID());
        }

        const account = await this._ctx.getUserService().getAccount(pUserAccount, pUserUID);

        let ms = account.getMembership(pOrg.getUID());
        if(ms == null){
            account.addMembership(pOrg.getUID(), {
                activated: false,
                _activateDate: -1,
                locked: pLocked,
                _lockDate: (pLocked==true ? Util.time() : -1),
                preferences: {},
                roles: []
            });
        }else{
            ms.locked = pLocked;
            ms._lockDate = (pLocked==true ? Util.time() : -1);
        }

        await this._ctx.getEngineDB().save(account);

        //this.sendLockMail(account);

        return true;
    }

    /**
     * To assign/de-assign role(s) to/from user account
     *
     * The issuer MUST have :
     * - higher roles or permissions than requested
     * - be a part of the same organization or be a server admin
     *
     * @param {UserAccount} pIssuer User account issuing the grant request
     * @param {Organization} pOrg Organization
     * @param {UserAccountUUID} pTargetAcc  UUID of user to grant
     * @param {RoleUUID[]} pRoles Updated list of roles
     */
    async updateMemberRoles(pIssuer: UserAccount, pOrg: OrganizationUnit,
                            pTargetAcc: UserAccountUUID, pRoles:RoleUUID[]):Promise<boolean> {

        let target:UserAccount;
        let crossOrg = false;
        // check if issuer is authorized
        /*try{
            // check if the user is a server admin
            AccessControl.isAuthorized(
                AccessControl.access.SRV_INSTANCE_MGT,
                pIssuer
            );
            crossOrg = true;
        }catch(e){
            // check if the user has access control list (ACL) management permission
            // for target organization
            AccessControl.isAuthorized(
                AccessControl.access.OU_ACL_MGT,
                pIssuer,
                pOrg,
                [
                    OrganizationAccessControl.attr.OWNER,
                    OrganizationAccessControl.attr.MEMBER_GRP
                ]
            );
        }*/

        // check if the user has access control list (ACL) management permission
        // for target organization
        AccessControl.isAuthorized(
            AccessControl.access.ORG_ACL_MGT,
            pIssuer,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP
            ]
        );

        // check if the target user is a part of the target organization
        target = await this._ctx.getUserService().getAccount(pIssuer, pTargetAcc);

        if(!target.isMemberOf(pOrg.getUID())){
            throw OrganizationManagerException.NOT_A_MEMBER(pTargetAcc, pOrg.getUID());
        }

        return await this._ctx.getUserService().updateOrgRoles(pIssuer,pOrg.getUID(),target.getUID(),pRoles);
    }

    /**
     * Search organization sharing the same device
     *
     * @param {DeviceUUID} pDevUID
     * @returns {OrganizationUnitUUID[]} Organization attached to this device
     * @private
     */
    private async _searchOrganizationByDevice(pDevUID: DeviceUUID):Promise<OrganizationUnitUUID[]> {

        const orgs = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .search({ filter:{ devices: { $in: [pDevUID] }}}, {raw:true, marlin:false});

        if(orgs==null || !Array.isArray(orgs) || orgs.length==0){
            return [];
        }

        return orgs.map( o => o.getUID());
    }

    /**
     * To update organization settings
     *
     * @param pUser
     * @param pOrg
     * @param pUnsafeSettings
     * @since 1.8.14
     */
    async updateOrgSettings(pUser: UserAccount, pOrg: OrganizationUnit, pUnsafeSettings:any) {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUser,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP
            ]
        );

        if(!OrganizationUnit.VALIDATE.settings.test(pUnsafeSettings)){
            throw OrganizationManagerException.INVALID_SETTINGS_FMT(pOrg.getUID());
        }

        pOrg.settings = pUnsafeSettings;
        return await this.updateOrganization(pUser, pOrg, {settings:pUnsafeSettings});
    }

    async updateAttr(pUser: UserAccount,
                     pNodeType:NodeInternalType,
                     pObj:(ApplicationUnit|OrganizationUnit),
                     pAttr:AccessAttribute<any>,
                     pValues:any[]):Promise<boolean> {

        if([NodeInternalType.APP_UNIT, NodeInternalType.ORG_UNIT].indexOf(pNodeType)==-1){
            // not supported
            throw AccessControlException.CHATTR_NOT_SUPPORTED_FOR_TYPE(pNodeType);
        }

        let org:OrganizationUnit;


        switch (pNodeType){
            case NodeInternalType.APP_UNIT:

                org = await this.getOrganization(pUser, (pObj as ApplicationUnit).orgUnit);

                AccessControl.isAuthorized(
                    AccessControl.access.ORG_ACL_MGT,
                    pUser,
                    org,
                    [
                        OrganizationAccessControl.attr.OWNER,
                        OrganizationAccessControl.attr.MEMBER_GRP
                    ]
                );

                AccessControl.isAuthorized(
                    AccessControl.access.ORG_AU_MODIFY,
                    pUser,
                    pObj,
                    [
                        OrganizationAccessControl.attr.OWNER,
                        OrganizationAccessControl.attr.APP_MEMBER,
                        OrganizationAccessControl.attr.APP_MEMBER_GRP,
                        OrganizationAccessControl.attr.MEMBER_GRP
                    ]
                );

                break;
            case NodeInternalType.ORG_UNIT:

                AccessControl.isAuthorized(
                    AccessControl.access.ORG_ACL_MGT,
                    pUser,
                    pObj,
                    [
                        OrganizationAccessControl.attr.OWNER,
                        OrganizationAccessControl.attr.MEMBER_GRP
                    ]
                );

                AccessControl.isAuthorized(
                    AccessControl.access.ORG_AU_MODIFY,
                    pUser,
                    pObj,
                    [
                        OrganizationAccessControl.attr.OWNER,
                        OrganizationAccessControl.attr.MEMBER_GRP
                    ]
                );

                org = pObj as OrganizationUnit;

                break;
        }

        (pObj as Auditable).setAccessAttribute(
            pAttr,
            pValues
        );

        switch (pNodeType){
            case NodeInternalType.APP_UNIT:
                return await this.updateApplication(pUser, org, pObj as ApplicationUnit, { _attr: true });
                break;
            case NodeInternalType.ORG_UNIT:
                return await this.updateOrganization(pUser, org, { _attr: {} });
                break;
        }



    }

    async updateOrgGrpMembers(pUser: UserAccount,
                              pOrg: OrganizationUnit,
                              pGroup: UserGroup,
                              pUsers: UserAccountUUID[]):Promise<{ added:UserAccountUUID[], removed:UserAccountUUID[] }> {


        AccessControl.isAuthorized(
            AccessControl.access.ORG_ACL_MGT,
            pUser,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        const currentUsr = (await this.listGroupMembers(pUser, pOrg, pGroup.getUID()));
        const curr:Record<UserAccountUUID, UserAccount> = {};

        currentUsr.map(x => {
            curr[x.getUID()] = x;
        });

        const ch = {
            added:[],
            removed:[]
        };

        // removed from group
        Object.keys(curr).map(x => {
            if(pUsers.indexOf(x)==-1){
                let grp = curr[x].getMembership(pOrg.getUID()).groups;
                if(grp!=null)  grp = grp.filter(g => (g!=pGroup.getUID()));
                curr[x].updateMembershipGroups(pOrg.getUID(), grp);
                ch.removed.push(x);
                (async ()=>{
                    await this._ctx.getUserService().updateMembership(pUser, pOrg, curr[x]);
                })();
            }
        });

        // added to group
        pUsers.map(x => {
            if(curr[x]==null){
                ch.added.push(x);

                (async ()=>{
                    let acc = await this._ctx.getUserService().getAccount(this._ctx.getInternalAcc(), x);
                    let ms = acc.getMembership(pOrg.getUID());
                    if(ms==null) return null;
                    ms.groups.push(pGroup.getUID());
                    acc.updateMembershipGroups(pOrg.getUID(), ms.groups);
                    await this._ctx.getUserService().updateMembership(pUser, pOrg, acc);
                })();

            }
        });

        return ch;

    }

    /**
     * To get running nodes assicated to org
     * @param pUser
     * @param pOrg
     */
    async getRunners(pUser: UserAccount, pOrg: OrganizationUnit):Promise<EngineNode[]> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_READ,
            pUser,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );

        //return await this._ctx.getNodeManager().getNodeByOrganizationUUID(pOrg.getUID());

        let apps = await this.listApplications(this._ctx.getInternalAcc(),pOrg);
        let puids:DexcaliburProjectUUID[] = [];
        apps.map(au => {
            puids = puids.concat(au.projects);
        });

        return await this._ctx.getNodeManager().getNodesByProjects(puids);
    }

    async stopRunner(pUser: UserAccount, pOrg: OrganizationUnit, pNode:EngineNodeUUID):Promise<boolean> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUser,
            pOrg,
            [
                OrganizationAccessControl.attr.MEMBER_GRP,
                OrganizationAccessControl.attr.OWNER
            ]
        );


        (await this._ctx.getNodeManager().getEngineNodeByUUID(pNode)).kill();

        return true;
    }
}