import DexcaliburEngine from "../DexcaliburEngine.js";
import {UserAccount, UserAccountType, UserAccountUUID} from "../user/UserAccount.js";
import AccessControl from "../user/acl/AccessControl.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {randomUUID} from "crypto";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {SsoOptions} from "../user/auth/AuthenticationService.js";

import * as Log from '../Logger.js';
import {OrganizationUnit, OrganizationUnitOptions} from "./OrganizationUnit.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {AuthModule, AuthModuleOptions} from "../user/auth/AuthModule.js";
import {LocalAuthModule} from "../user/auth/modules/LocalAuthModule.js";
import {AuthenticationSettings} from "../user/auth/AuthenticationSettings.js";
import {AuthModuleFactory} from "../user/auth/AuthModuleFactory.js";
import {ApplicationUnit, ApplicationUnitOptions} from "./ApplicationUnit.js";
import Role, {RoleUUID} from "../user/acl/common/Role.js";
import {UserGroup, UserGroupUUID} from "../user/acl/common/UserGroup.js";
import {EmailSender} from "../core/email/EmailSender.js";
import {ValidationRule} from "../Validator.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class OrganizationManager {

    private _ctx:DexcaliburEngine;

    private _emailSender:EmailSender;

    constructor( pInstance:DexcaliburEngine ) {
        this._ctx = pInstance;
        this._emailSender = new EmailSender(this._ctx);
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
                        OrganizationAccessControl.attr.ORG_MEMBER,
                        OrganizationAccessControl.attr.OWNER
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


    async inviteUsers(pUserAccount:UserAccount, pOrg:OrganizationUnit, pEmails:string[], pGrpUID:Nullable<UserGroupUUID>):Promise<boolean> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_USR_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.ORG_MEMBER,
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
                usrAcc.addOrganization(pOrg);

                // create account and perform various init ops
                usrAcc = await this._ctx.getUserService().createUser(usrAcc, pOrg);

                // send acount activation link
                await this.sendInvitationMail(usrAcc);

                success++;
            }catch (err){
                Logger.error(err.stack);
            }
        }

        return (success==pEmails.length);
    }

    async countMembers(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<number> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_ACL_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.ORG_MEMBER,
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
                OrganizationAccessControl.attr.ORG_MEMBER,
                OrganizationAccessControl.attr.OWNER
            ]
        );


        const all = await (this._ctx.getEngineDB()
            .getCollectionOf(UserAccount.TYPE.getType()) as MongodbDbCollection)
            .search({ filter: {_orgs: { $all: [ pOrg.getUID() ] }}},{ merlinRequest:false, raw:true }) as UserAccount[];

        console.log(all);

        return all;
    }


    async getAuthModules(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<AuthModule[]> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AUTH_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.ORG_MEMBER,
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
    async getOrganization(pUserAccount:UserAccount, pUID:string):Promise<OrganizationUnit> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_READ,
            pUserAccount
        );

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
                OrganizationAccessControl.attr.ORG_MEMBER,
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
    async getApplication(pUserAccount:UserAccount, pOrg:OrganizationUnit, pUID:string):Promise<ApplicationUnit> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount
        );

        const app = await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType())as MongodbDbCollection)
            .asyncGetEntry({ uuid: pUID, orgUUID:pOrg.getUID() });


        if(app==null){
            throw OrganizationManagerException.UNKNOWN_ORG(pUID);
        }

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_READ,
            pUserAccount,
            app,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
            ]
        );

        //AccessControl.checkAttr( AccessZone.ORGANIZATION, OrganizationAccessControl.attr.member, org,  pUserAccount);


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

        // append user to member list
        pOrg.appendToAccessAttribute(
            OrganizationAccessControl.attr.ORG_MEMBER,
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

        const org = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncAddEntry({ uuid: uuid}, pOrg);


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
            .asyncUpdateEntry(pOrg, {replace:false});
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
                OrganizationAccessControl.attr.ORG_MEMBER
            ]);

        // generate UUID
        let uuid:string;
        do {
            uuid = randomUUID();
        }while(await this.isUuidFree(ApplicationUnit.TYPE.getType(), uuid)==false)
        pOrg.uuid = uuid;

        if(!this._isUnitFree(ApplicationUnit.TYPE.getType(), "name", pOrg.name)){
            throw OrganizationManagerException.DUPLICATED_APP_NAME();
        }

        // append user to owner list
        pOrg.appendToAccessAttribute(
            OrganizationAccessControl.attr.OWNER,
            pUserAccount.getUID()
        );

        // append user to member list
        pOrg.appendToAccessAttribute(
            OrganizationAccessControl.attr.APP_MEMBER,
            pUserAccount.getUID()
        );

        // create app
        const org = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncAddEntry({ uuid: uuid}, pOrg);


        return org;
    }

    async updateApplication(pUserAccount:UserAccount, pOrg:OrganizationUnit, pAppUnit:ApplicationUnit, pChanges:any):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_MODIFY,
            pUserAccount,
            pAppUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.ORG_MEMBER,
            ]
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType())
            .asyncUpdateEntry(pAppUnit, {replace:false});
    }


    async dropApplication(pUserAccount:UserAccount, pOrg:OrganizationUnit, pApp:ApplicationUnit):Promise<boolean> {

        // check if the user is a member of the org
        AccessControl.isAuthorizedByAttr(
            OrganizationAccessControl.attr.ORG_MEMBER,
            pOrg,
            pUserAccount
        );

        // check if the user is authorized to drop the app (must be the owner of app or of the org)
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_MODIFY,
            pUserAccount,
            pApp,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
            ]
        );

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
                OrganizationAccessControl.attr.ORG_MEMBER,
            ]
        );


        // search existing module
        const mods = pOrg.getAuthModuleByType(pAuthMod.type);
        let modsUUID:string;
        if(mods != null){
            mods[0].update(pAuthMod);
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
                OrganizationAccessControl.attr.ORG_MEMBER,
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
                OrganizationAccessControl.attr.ORG_MEMBER,
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
                OrganizationAccessControl.attr.ORG_MEMBER,
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
                OrganizationAccessControl.attr.ORG_MEMBER,
            ]
        );

        const all = await (this._ctx.getEngineDB()
            .getCollectionOf(ApplicationUnit.TYPE.getType()) as MongodbDbCollection)
            .search({ filter: {_orgs: { $all: [ pOrg.getUID() ] }}},{ merlinRequest:false, raw:true }) as ApplicationUnit[];


        const authorized:ApplicationUnit[] = [];

        // filter app list by attribute
        all.map(( vApp:ApplicationUnit)=>{
            try {
                // check if user can list applications
                AccessControl.isAuthorized(
                    AccessControl.access.ORG_AU_READ,
                    pUserAccount,
                    vApp,
                    [
                        OrganizationAccessControl.attr.OWNER,
                        OrganizationAccessControl.attr.APP_MEMBER,
                    ]
                );

                authorized.push(vApp);

            }catch (err){
                // skip
            }
        });

        return authorized;
    }

    async listGroupMembers(pUserAccount: UserAccount, pOrg: OrganizationUnit, pGrpUUID: string):Promise<UserAccount[]> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.ORG_MEMBER,
            ]
        );

        // check if the group is a part of the organization
        const grp = pOrg.getUserGroup(pGrpUUID);
        if(grp==null){
            throw OrganizationManagerException.USER_GROUP_NOT_FOUND(pGrpUUID);
        }

        return await this.getUsers(pUserAccount,pOrg, grp.members);
    }

    async listGroupRoles(pUserAccount: UserAccount, pOrg: OrganizationUnit, pGrpUUID: string) {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.ORG_MEMBER,
            ]
        );

        // check if the group is a part of the organization
        const grp = pOrg.getUserGroup(pGrpUUID);
        if(grp==null){
            throw OrganizationManagerException.USER_GROUP_NOT_FOUND(pGrpUUID);
        }


        return  grp.roles.map(x => this._ctx.getAclManager().getRole(x) );
    }

    async createUserGroup(pUserAccount: UserAccount, pOrg: OrganizationUnit, pUserGroup: UserGroup):Promise<OrganizationUnit> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.ORG_MEMBER,
            ]
        );

        let uid:UserGroupUUID;
        do{
            uid = randomUUID()
        }while (pOrg.getUserGroup(uid)!=null);

        pUserGroup.setUID(uid);
        pOrg.addUserGroup(pUserGroup);

        if(await (this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType()) as MongodbDbCollection)
            .asyncUpdateEntry(pOrg, { replace:false, $set:['groups'] })){

            return pOrg;
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
                OrganizationAccessControl.attr.ORG_MEMBER,
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

    async addMembersToGroup(pUserAccount: UserAccount, pOrg: OrganizationUnit,
                          pUserGroupUID: UserGroupUUID, pAccount:UserAccountUUID[]):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_GRP_MGT,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.ORG_MEMBER,
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
            ]
        );

        pApp.addMembers(members);

        return this.updateApplication(pUserAccount, pOrg, pApp, {
            _attr: (pApp as any)._attr
        })
    }
}