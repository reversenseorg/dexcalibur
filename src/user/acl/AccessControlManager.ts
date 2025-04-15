import DexcaliburEngine from "../../DexcaliburEngine.js";
import AccessControl from "./AccessControl.js";
import {AccessZone} from "./Zones.js";
import {ProjectAccessControl} from "./rbac/ProjectAccessContol.js";
import {SettingsAccessControl} from "./rbac/SettingsAccessContol.js";
import {GlobalAccessControl} from "./rbac/GlobalAccessContol.js";
import {OrganizationAccessControl} from "./rbac/OrganizationAccessContol.js";
import Role, {RoleUUID} from "./common/Role.js";
import {UserAccount, UserAccountUUID} from "../UserAccount.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {AccesErrCode, Access, AccessException, AccessProperty, AccessUID} from "./Access.js";
import {AccessFactory} from "./AccessFactory.js";
import {AccessControlException} from "../../errors/AccessControlException.js";
import * as Log from "../../Logger.js";
import {AccessAttribute} from "./AccessAttribute.js";
import {UserGroup, UserGroupUUID} from "./common/UserGroup.js";
import {OrganizationUnit, OrganizationUnitUUID} from "../../organization/OrganizationUnit.js";
import {Auditable} from "../../Auditable.js";
import {OrganizationManagerException} from "../../errors/OrganizationManagerException.js";

export type AclMatrix = Record<AccessUID, Role[]>;


let Logger:Log.Logger = Log.newLogger() as Log.Logger;
/**
 * Internal API
 *
 * In order to perform access control check engine must access to this
 * manager, however only authorized user should have access to this contains.
 * Role description should not be exported if the UserAccount has not ORG_ACL_MGT permission
 *
 * @class
 */
export class AccessControlManager {

    static BUILT_IN_DEFAULT_ROLE = 'local_admin';

    private _ready = false;

    private _internalRoles:Record<string, Role> = {};

    private _roles:Record<string, Role> = {};

    private _roleCache:Record<OrganizationUnitUUID,Record<RoleUUID,Role[]>> = {};
    private _groupsCache:Record<OrganizationUnitUUID,Record<UserGroupUUID,UserGroup>> = {};

    private _groups:Record<string, UserGroup> = {};

    /**
     * ACL Matrix
     *
     * Help to answer to the question :
     * - Is the account or user group X has a role which allow the operation A ?
     *
     * @private
     */
    private _matrix: AclMatrix = {};

    private _ctx:DexcaliburEngine;

    constructor(pCtx:DexcaliburEngine) {
        this._ctx = pCtx;
    }

    /**
     * To init acces control manager
     *
     * It instanciantes delegated access controls, and more
     *
     * @param {Nullable<UserAccount>} pInternalAccount
     */
    init(pInternalAccount:Nullable<UserAccount>):void {
        if(!this._ready){
            // init access controls
            const ac = AccessControl.init(this);

            this._initAclMatrix(AccessControl.access);

            this.registerZone( AccessZone.PROJECT, new ProjectAccessControl());
            this.registerZone( AccessZone.ORGANIZATION, new OrganizationAccessControl());
            this.registerZone( AccessZone.GLOBAL, new SettingsAccessControl());
            this.registerZone( AccessZone.GENERIC, new GlobalAccessControl());

            // load built-in role
            this._loadBuiltinRoles();

            // if the account is internal, assign permissions
            if(pInternalAccount!=null
                && pInternalAccount.getUID()===AccessControl.INTERNAL_USER_ACCOUNT_UUID){

                this._setupInternalRoles(pInternalAccount);
            }
        }
    }


    registerZone(pZone:AccessZone, pAclCtrl:any):void {

        AccessControl.getInstance().registerZone(pZone, pAclCtrl);

        //this._updateAclMatrix((pAclCtrl as any).access);
    }



    private _loadRoles():void {
        //this.listRoles(this._ctx.get)
    }

    private _setupInternalRoles(pUserAccount:UserAccount):boolean {

        if(this._internalRoles.engine_svc==null){
            this._internalRoles.engine_svc = new Role({
                uuid: AccessControl.INTERNAL_ROOT_ROLE_UUID,
                name: "internal_root_svc",
                permissions: [
                    AccessControl.access.ORG_ACL_MGT
                ]
            });
        }

        // add user to internal role. Persistence is not required here
        // because this role is in-memory only.
        this._internalRoles.engine_svc.grant(pUserAccount);

        return true;
    }

    getRole(pRoleUID:string):Role {
        return this._roles[pRoleUID];
    }


    /**
     * Retrieve the list of generic roles (universal)
     *
     * @param pUserAccount
     */
    async listGenericRoles(pUserAccount:UserAccount ):Promise<Role[]> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_ROL_MGT,
            pUserAccount
        );

        let roles:Role[] = [];
        roles = await this._ctx.getEngineDB()
            .getCollectionOf(Role.TYPE.getType())
            .getAsList();

        // gather generic roles from db
        roles = roles.filter(r => r.isGeneric());
        // merge with builtin roles
        roles = roles.concat(Object.values(this._roles));

        // append internal roles if the account is the "local service account" or "a local admin"
        if(pUserAccount!=null
            && pUserAccount.getUID()===AccessControl.INTERNAL_USER_ACCOUNT_UUID){
            roles = roles.concat(Object.values(this._internalRoles));
        }

        return roles;
    }


    /**
     * Retrieve the list of generic roles (universal)
     *
     * @param pUserAccount
     */
    async listOrganizationRoles(pUserAccount:UserAccount, pOrg:OrganizationUnit ):Promise<Role[]> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_ROL_READ,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.MEMBER_GRP,
            ]
        );

        return pOrg.getRoles();
    }


    /**
     * To create universal cross-org role
     * @param pUserAccount
     * @param pRole
     */
    async createRole(pUserAccount:UserAccount, pRole:Role):Promise<Role> {
        AccessControl.isAuthorized(
            AccessControl.access.SRV_INSTANCE_MGT,
            pUserAccount
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(Role.TYPE.getType())
            .asyncAddEntry(pRole.getUID(), pRole);
    }

    /**
     *
     * To update universal cross-org role
     * @param pUserAccount
     * @param pRole
     */
    async updateRole(pUserAccount:UserAccount, pRole:Role):Promise<boolean> {
        AccessControl.isAuthorized(
            AccessControl.access.SRV_INSTANCE_MGT,
            pUserAccount
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(Role.TYPE.getType())
            .asyncUpdateEntry(pRole);
    }


    /**
     *
     * To remove universal cross-org role
     * @param pUserAccount
     * @param pRole
     */
    async removeRole(pUserAccount:UserAccount, pRole:Role):Promise<boolean> {
        AccessControl.isAuthorized(
            AccessControl.access.SRV_INSTANCE_MGT,
            pUserAccount
        );

        let success =  await this._ctx.getEngineDB()
            .getCollectionOf(Role.TYPE.getType())
            .asyncRemoveEntry(pRole);

        // update
        if(success){
            return true;
        }else{
            return false;
        }
    }

    /**
     * AccessFactory.merge(
     *                     AccessControl.getMatchingAccessesList( AccessProperty.UID, '.'),
     *                     SettingsAccessControl.getMatchingAccessesList( AccessProperty.UID, '.'),
     *                     GlobalAccessControl.getMatchingAccessesList( AccessProperty.UID, '.'),
     *                     [
     *                         AccessControl.access.ORG_ACL_MGT,
     *                         AccessControl.access.ORG_AUTH_MGT,
     *                     ]
     *                 )
     * @private
     */
    private _loadBuiltinRoles() {

        [
            new Role({
                uuid: AccessControlManager.BUILT_IN_DEFAULT_ROLE, // 'local_admin',
                name: 'Local admin',
                permissions: AccessControl.getMatchingAccessesList( AccessProperty.UID, '.')
            }),
            new Role({
                uuid: 'R_OUADM',
                name: 'Organization Administrator',
                permissions: [
                    AccessControl.access.ORG_OU_READ,
                    AccessControl.access.ORG_OU_MODIFY,

                    AccessControl.access.ORG_AU_READ,
                    AccessControl.access.ORG_AU_MODIFY,

                    AccessControl.access.ORG_ACL_MGT,
                    AccessControl.access.ORG_AUTH_MGT,
                    AccessControl.access.ORG_WEBAPI_ACCESS,

                    AccessControl.access.ORG_ROL_MGT,
                    AccessControl.access.ORG_ROL_READ,

                    AccessControl.access.ORG_GRP_MGT,
                    AccessControl.access.ORG_GRP_READ,

                    AccessControl.access.ORG_USR_MGT,
                    AccessControl.access.ORG_USR_READ,

                    AccessControl.access.ORG_OU_SECRETS_MGT
                ]
            }),
            new Role({
                uuid: 'R_AUADM',
                name: 'Application Administrator',
                permissions: AccessFactory.merge(
                    [
                        AccessControl.access.ORG_OU_READ,
                        AccessControl.access.ORG_AU_READ,
                        AccessControl.access.ORG_ROL_READ,
                        AccessControl.access.ORG_USR_READ,
                        AccessControl.access.ORG_GRP_READ,

                        AccessControl.access.ORG_AU_NEW_PROJ,


                        AccessControl.access.PROJ_SETTINGS_EDIT,
                        AccessControl.access.PROJ_SETTINGS_READ,
                        AccessControl.access.PROJ_CHOWN,
                        AccessControl.access.PROJ_OPEN_OWN,
                        AccessControl.access.PROJ_OPEN_ANY,
                        AccessControl.access.PROJ_CREATE_OWN,
                        AccessControl.access.PROJ_DELETE_OWN,
                        AccessControl.access.PROJ_META_READ,
                        AccessControl.access.PROJ_PKG_READ,
                        AccessControl.access.PROJ_NEW_OWN_WF,

                        AccessControl.access.PROJ_ORDER_MGT,

                        AccessControl.access.DEV_ALLOC_VIRT,
                        AccessControl.access.DEV_ALLOC_PHY,
                        AccessControl.access.DEV_DESTROY_VIRT,
                        AccessControl.access.DEV_DESTROY_PHY,
                        AccessControl.access.DEV_INS_KILL,
                        AccessControl.access.DEV_INS_START,

                        AccessControl.access.SCAN_ORDER_NEW,
                        AccessControl.access.SCAN_ORDER_READ,
                        AccessControl.access.SCAN_ORDER_DEL,
                        AccessControl.access.SCAN_ORDER_PAUSE,

                        AccessControl.access.SCAN_SCHED_TRIG,
                        AccessControl.access.SCAN_SCHED_PER,

                        AccessControl.access.GLOBAL_MODEL_READ
                    ],
                    AccessControl.getMatchingAccessesList( AccessProperty.UID, '^ORG_AU_.+$')
                )
            }),
            new Role({
                uuid: 'R_QAAUDITOR',
                name: 'Quality Auditor',
                permissions: [
                    AccessControl.access.ORG_AU_READ,
                    AccessControl.access.GLOBAL_MODEL_READ,
                    AccessControl.access.PROJ_OPEN_OWN,

                    AccessControl.access.PROJECT_MODEL_READ,
                    AccessControl.access.PROJECT_MODEL_EDIT,
                    AccessControl.access.PROJECT_MODEL_DELETE,
                    AccessControl.access.PROJECT_MODEL_CREATE,

                    AccessControl.access.AUDIT_REPORT_READ,
                    AccessControl.access.AUDIT_DX_ACCESS
                ]
            }),
            new Role({
                uuid: 'R_DEV',
                name: 'Developper',
                permissions: [
                    AccessControl.access.PROJ_SETTINGS_READ,
                    AccessControl.access.PROJ_SETTINGS_EDIT,
                    AccessControl.access.PROJ_OPEN_OWN,
                    AccessControl.access.PROJ_CLOSE_OWN,
                    AccessControl.access.PROJ_META_READ,
                    AccessControl.access.PROJ_PKG_READ,
                    AccessControl.access.PROJ_APPDATA_READ,
                    AccessControl.access.PROJ_NEW_OWN_WF,
                    AccessControl.access.AUDIT_DX_ACCESS
                ]
            }),
            new Role({
                uuid: 'R_DEVOPS',
                name: 'DevOps / Analyst',
                permissions: [

                    AccessControl.access.ORG_AU_READ,
                    AccessControl.access.PROJ_SETTINGS_READ,
                    AccessControl.access.PROJ_NEW_OWN_WF,

                    AccessControl.access.SCAN_ORDER_NEW,
                    AccessControl.access.SCAN_ORDER_READ,
                    AccessControl.access.SCAN_ORDER_DEL,
                    AccessControl.access.SCAN_ORDER_PAUSE,

                    AccessControl.access.SCAN_SCHED_TRIG,
                    AccessControl.access.SCAN_SCHED_PER
                ]
            }),
            new Role({
                uuid: 'user',
                name: 'Basic user',
                permissions: AccessFactory.merge(
                    AccessControl.getMatchingAccessesList( AccessProperty.UID, '^PROJ_.+'),
                    AccessControl.getMatchingAccessesList( AccessProperty.UID, '^ORG_.+_READ$')
                )
            }),
        ].map((vRole:Role) => {
            this._setupRole(vRole);
        });
    }

    /**
     * Check if every permissions exists, else it throws error
     * @param pRole
     * @private
     */
    private _checkAccessesIntegrity(pRole:Role):void {
        for(let i=0; i<pRole.access.length; i++){
            if(pRole.access[i]==null){
                throw AccessControlException.UNKNOWN_ACCESS(pRole.getUID(),pRole.name);
            }
        }
    }

    /**
     * Add a role to the in-memory list of role
     * and add the role to ACL matrix
     *
     * @param {Role} vRole
     * @private
     */
    private _setupRole(vRole:Role):void {
        try{
            // check every access control in roles exists
            this._checkAccessesIntegrity(vRole);

            // push role to list of active roles
            this._roles[vRole.getUID()] = vRole;

            // update ACL matrix
            vRole.access.map((vAccess:Access)=>{
                if(this._matrix[vAccess.getUID()]==null){
                    this._matrix[vAccess.getUID()] = [];
                }

                this._matrix[vAccess.name].push(vRole);
                Logger.debug(`[ACCESS MANAGER] Assigned permission [uuid=${vAccess.getUID()}] to role [uuid=${vRole.getUID()}] `);
            });
        }catch (err){
            Logger.error(`[ACCESS MANAGER] Role [uuid=${vRole.getUID()}] cannot be set up. Cause : ${err.stack}`);
            throw AccessControlException.CANNOT_SETUP_ROLE(vRole);
        }
    }

    /**
     * To refresh user group cache
     */
    async refreshUserGroups():Promise<void> {

        // get all orgs
        const orgs = await this._ctx.getOrgManager().listOrganizations(this._ctx.getInternalAcc());
        const cache:Record<OrganizationUnitUUID, Record<UserGroupUUID, UserGroup>> = {};
        //
        orgs.map(x => {
            const grps:Record<UserGroupUUID, UserGroup> = {};
            x.getUserGroups().map(g => grps[g.getUID()] = g);
            cache[x.getUID()] = grps;
        });
        // finally update cache
        this._groupsCache = cache;
    }

    /**
     * To get a user group from cache
     *
     * @param pUID
     * @param pOrg
     */
    getUserGroup(pUID:UserGroupUUID, pOrg:Nullable<OrganizationUnitUUID> = null):UserGroup {
        const orgMap = this._groupsCache[pOrg!=null? pOrg : 'all'];
        if(orgMap==null || orgMap[pUID]==null){
            throw AccessControlException.MISSING_USER_GROUP(pOrg, pUID);
        }

        return orgMap[pUID];
    }

    /**
     * To check if one of role authorized on pAccess is a part of the list of roles assigned
     * to specified pUser
     *
     * @param pAccess
     * @param pUser
     * @param pSubject
     */
    isAuthorized_OLD(pAccess:Access, pIssuer:UserAccount|UserGroup, pResource?:Nullable<Auditable>, pAttributes?:AccessAttribute<any>[] ):void {

        if(pAccess==null || this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        if(this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        let authorized = false;

        // if the issuer is a user account, then recursively check each user group of which he is a part
        if(pIssuer.__===NodeInternalType.USER_ACCOUNT){

            // check roles inherited by groups (universal and org-level groups)
            authorized = this.isAuthorizedByGroups(pAccess,pIssuer as UserAccount,pResource,pAttributes);

            if(authorized){
                return;
            }
        }

        // if the issuer is a user group
        // else if the issuer is user account but groups not allowed the operation
        let roleFound = false;

        // check is user group or account has a role with required permissions
        let usrRoles:string[];

        usrRoles = pIssuer.getRoles();

        if(pIssuer.__===NodeInternalType.USER_ACCOUNT && pResource!=null){
            // gather also org-level roles inherited from membership
            const oid_attr = pResource.getAccessAttribute<OrganizationUnitUUID>(GlobalAccessControl.attr.ORG);
            if(oid_attr!=null){
                const ms = (pIssuer as UserAccount).getMembership(oid_attr.value[0]);
                if(ms!=null && ms.roles!=null){
                    ms.roles.map(r => {
                        usrRoles.push(r);
                    })
                }
            }
        }

        for(let i=0; i<this._matrix[pAccess.getUID()].length; i++){

            // authorized by role
            if(usrRoles.indexOf(this._matrix[pAccess.getUID()][i].getUID())>-1){

                roleFound = true;

                // check attr if resource and attr are specified
                if(pResource!=undefined && pAttributes!=undefined){

                    for(let k=0; k<pAttributes.length; k++){

                        // access to res authorized by attr
                        if(this.isAuthorizedByAttr(pAttributes[k], pResource, pIssuer)){
                            Logger.success(`[ACCESS MANAGER] User [uuid=${pIssuer.getUID()}] has been authorized to access  resource [res=${(pResource as any).getUID()}] over [access=${pAccess.getUID()}] with [attr=${pAttributes[k].name}]`);
                            return ;
                        }
                    }
                }else if(pAttributes!=undefined){
                    continue;
                }else{
                    Logger.success(`[ACCESS MANAGER] User [uuid=${pIssuer.getUID()}] has been authorized to access [uid=${pAccess.getUID()}]`);
                    return;
                }
            }
        }

        // todo : log access

        Logger.error(`[ACCESS MANAGER] User [uuid=${pIssuer.getUID()}] has tried to access [uid=${pAccess.getUID()}]. Access denied by ${(roleFound && pAttributes.length>0)? 'attributes':'roles'}`);
        throw AccessControlException.NOT_AUTHORIZED(pAccess,pIssuer);
    }

    /**
     * To check if one of role authorized on pAccess is a part of the list of roles assigned
     * to specified pUser
     *
     * @param pAccess
     * @param pUser
     * @param pSubject
     */
    isAuthorized(pAccess:Access, pIssuer:UserAccount|UserGroup, pResource?:Nullable<Auditable>, pAttributes?:AccessAttribute<any>[], pQuiet = false ):void {

        if(pAccess==null || this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        if(this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        let success:boolean = false;

        // start by checking if pIssuer has a role required by pAccess
        success = this._isRbacOk(pAccess,pIssuer,pResource,pAttributes,pQuiet);

        if(success){
            // if global and org-roles don't match
            return ;
        }

        if(!success){
            if(!pQuiet) Logger.error(`[ACCESS MANAGER] ${pIssuer.__==NodeInternalType.USER_GROUP?'User group "'+(pIssuer as any).name+'" ':'User'} [uuid=${pIssuer.getUID()}] has tried to access [uid=${pAccess.getUID()}]. Access denied by roles`);
            throw AccessControlException.NOT_AUTHORIZED(pAccess,pIssuer);
        }

        // next, check attributes
        /*if(success && pResource!=null && pAttributes!=null && pAttributes.length>0){
            success = this._isAbacOk(pAccess,pIssuer,pResource,pAttributes,pQuiet);

            if(!success){
                Logger.error(`[ACCESS MANAGER] ${pIssuer.__==NodeInternalType.USER_GROUP?'User group "'+(pIssuer as any).name+'" ':'User'} [uuid=${pIssuer.getUID()}] has tried to access [uid=${pAccess.getUID()}]. Access denied by attributes`);
                throw AccessControlException.NOT_AUTHORIZED(pAccess,pIssuer);
            }
        }*/
    }


    /**
     * To check if the issuer has sufficient role to access pAccess (ONLY)
     *
     * Attributes are not checked
     *
     * @param pAccess
     * @param pUser
     * @param pSubject
     */
    private _isRbacOk(pAccess:Access, pIssuer:UserAccount|UserGroup,
                                pResource?:Nullable<Auditable>, pAttributes?:AccessAttribute<any>[], pQuiet = false ):boolean {

        if(pAccess==null || this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        if(this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        let authorized = false;

        // if the issuer is a user account, then recursively check each user group of which he is a part
        if(pIssuer.__===NodeInternalType.USER_ACCOUNT){

            // check roles inherited by groups (universal and org-level groups)
            authorized = this.isAuthorizedByGroups(pAccess,pIssuer as UserAccount,pResource,pAttributes,pQuiet);

            if(authorized){
                return true;
            }
        }

        // if the issuer is a user group
        // else if the issuer is user account but groups not allowed the operation
        let roleFound = false;

        // check is user group or account has a role with required permissions
        let usrRoles:RoleUUID[] = [];


        // get GLOBAL ROLES
        pIssuer.getRoles().map(x => usrRoles.push(x));


        // check ORG-level roles if a resource is specified
        if(pIssuer.__===NodeInternalType.USER_ACCOUNT && pResource!=null){
            usrRoles = [];
            // gather also org-level roles inherited from membership
            const oid_attr = pResource.getAccessAttribute<OrganizationUnitUUID>(GlobalAccessControl.attr.ORG);
            if(oid_attr!=null){
                const ms = (pIssuer as UserAccount).getMembership(oid_attr.value[0]);
                if(ms!=null && ms.roles!=null && !ms.locked){
                    ms.roles.map(r => {
                        if(usrRoles.indexOf(r)==-1){
                            usrRoles.push(r);
                        }
                    });
                }
            }
        }


        for(let i=0; i<this._matrix[pAccess.getUID()].length; i++){
            // authorized by role
            if(usrRoles.indexOf(this._matrix[pAccess.getUID()][i].getUID())>-1){
                return true;
            }
        }

        return false;
    }

    /**
     * To check if the issuer has sufficient role to access pAccess (ONLY)
     *
     * Attributes are not checked
     *
     * @param pAccess
     * @param pUser
     * @param pSubject
     */
    private _isAbacOk(pAccess:Access, pIssuer:UserAccount|UserGroup,
                                pResource:Nullable<Auditable>,
                      pAttributes:AccessAttribute<any>[],
                      pQuiet = false):boolean {

        if(pResource==undefined || pAttributes==undefined){
            return false;
        }

        if(pAccess==null || this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        if(this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        // check each attribute
        for(let k=0; k<pAttributes.length; k++){

            // access to res authorized by attr
            if(this.isAuthorizedByAttr_2(pAttributes[k], pResource, pIssuer)){
                Logger.success(`[ACCESS MANAGER] User [uuid=${pIssuer.getUID()}] has been authorized to access  resource [res=${(pResource as any).getUID()}] over [access=${pAccess.getUID()}] with [attr=${pAttributes[k].name}]`);
                return true;
            }
        }

        return false;
    }


    /**
     * To check if a user group or a user account is authorized against an attribute
     *
     * @param pAttr
     * @param pResource
     * @param pAccount
     */
    isAuthorizedByAttr_2(pAttr:AccessAttribute<any>, pResource:Auditable, pAccount:UserAccount|UserGroup):boolean{
        if(pResource==null){
            throw new AccessException("Access attribute of an undefined object cannot be verified : rejected ", AccesErrCode.MANDATORY_OBJECT_UNDEFINED)
        }

        if(pAccount.uuidEquals(AccessControl.INTERNAL_USER_ACCOUNT_UUID)){
            // bypass for internal user (dxengine)
            return;
        }


        // get a list authorized UUIDs for a given attribute from pSubject
        // UserAccountUUID[] | UserGroupUUID[]
        const authorizedUIDs:string[] = pResource.getAccessAttribute<UserAccountUUID|UserGroupUUID>(pAttr).value;

        if(authorizedUIDs==null || !Array.isArray(authorizedUIDs)){
            throw AccessControlException.UNKNOWN_ACL_ATTRIBUTE(pAttr);
        }

        if(pAttr.is(NodeInternalType.USER_GROUP)){

            let grps:UserGroupUUID[];
            if(pAccount.__===NodeInternalType.USER_ACCOUNT){
                const oid_attr = pResource.getAccessAttribute(GlobalAccessControl.attr.ORG);
                if(oid_attr!=null){
                    const ms = (pAccount as UserAccount).getMembership(oid_attr.value[0]);
                    if(ms!=null){
                        grps = ms.groups;
                    }
                }
            }else{
                grps = [(pAccount as UserGroup).getUID()];
            }


            for(let k=0; k<grps.length; k++){
                if(authorizedUIDs.indexOf(grps[k])>-1){
                    return true;
                }
            }

            return false;
        }else if(pAttr.is(NodeInternalType.USER_ACCOUNT)){
            return (authorizedUIDs.indexOf(pAccount.getUID())>-1);
        }else{
            return false;
            //throw new Error("not checkeable attr");
        }
    }


    /**
     * To check is a user is authorized thanks to direct user group or org-level user groups of
     * which he is a part
     *
     * @param pAccess
     * @param pIssuer
     * @param pResource
     * @param pAttributes
     */
    isAuthorizedByGroups(pAccess:Access,
                         pIssuer:UserAccount,
                         pResource?:Nullable<any>,
                         pAttributes?:AccessAttribute<any>[],
                         pQuiet = false):boolean {

        let authorized = false;

        // gather groups supported by attributes
        let attrGrps:UserAccountUUID[] = [];
        if(pAttributes!=null){
            pAttributes.map(x => {
                if(x.is(NodeInternalType.USER_GROUP)){
                    attrGrps = attrGrps.concat(x.value);
                }
            });
        }

        // check universal groups
        pIssuer.getUserGroups().map((vGrpUID)=>{

            if(attrGrps.length>0 && attrGrps.indexOf(vGrpUID)==-1){
                // skip groups not authorized by attributes
                return;
            }

            try{
                this.isAuthorized(
                    pAccess,
                    this.getUserGroup(vGrpUID),
                    pResource,
                    pAttributes, pQuiet);
                authorized = true;
            }catch (e){}
        });

        if(pResource==null){
            return authorized;
        }

        // check org-level groups is th resource is bound to an org
        // get the organization bound to the resource

        const orgUUIDAttr = pResource.getAccessAttribute(GlobalAccessControl.attr.ORG);

        // if the resource is not bound to an organization through an attribute,
        // then org-level ACL cannot be checked for this resource
        if(orgUUIDAttr!=null){

            const oid = orgUUIDAttr.value[0] as OrganizationUnitUUID;
            const ms = pIssuer.getMembership(oid);


            if(ms!=null){
                // check org-level groups
                ms.groups.map((vGrpUID)=>{

                    // skip group not supported by attributes
                    if(attrGrps.length>0 && attrGrps.indexOf(vGrpUID)==-1) return;

                    try{
                        this.isAuthorized(
                            pAccess,
                            this.getUserGroup(vGrpUID,oid),
                            pResource,
                            pAttributes,
                            pQuiet);
                        authorized = true;
                    }catch (e){}
                });
            }
        }

        return authorized;
    }

    /**
     * To check if a user group or a user account is authorized against an attribute
     *
     * @param pAttr
     * @param pResource
     * @param pAccount
     */
    isAuthorizedByAttr(pAttr:AccessAttribute<any>, pResource:any, pAccount:UserAccount|UserGroup){
        if(pResource==null){
            throw new AccessException("Access attribute of an undefined object cannot be verified : rejected ", AccesErrCode.MANDATORY_OBJECT_UNDEFINED)
        }

        if(pAccount.uuidEquals(AccessControl.INTERNAL_USER_ACCOUNT_UUID)){
            // bypass for internal user (dxengine)
            return;
        }

        // get a list authorized UUIDs for a given attribute from pSubject
        // UserAccountUUID[] | UserGroupUUID[]
        let authorizedUIDs:string = pResource.getAccessAttribute(pAttr).value;

        if(authorizedUIDs!=null && Array.isArray(authorizedUIDs)){
            // verify the UUID of given account or usergroup is a part of the list of authorized account/usergroup
            return (authorizedUIDs.indexOf(pAccount.getUID())>-1);
        }else{
            return false;
        }
    }


    // init AC list
    private _initAclMatrix(pAccesses: Record<string, Access>) {
        for(let key in pAccesses){
            if(this._matrix[key]==null){
                this._matrix[key] = [];
            }
        }
    }

    /**
     *
     * @param pGroupUID
     * @param pOrg
     */
    async addUserToGroup(pTarget:UserAccountUUID, pGroupUID: UserGroupUUID, pOrg: OrganizationUnit):Promise<void> {

        // get user
        const user = await this._ctx.getUserService().getAccount(this._ctx.getInternalAcc(),pTarget);

        // get membership
        const ms = user.getMembership(pOrg.getUID());

        if(ms==null){
            throw OrganizationManagerException.NOT_A_MEMBER(user.username, pOrg.getUID());
        }

        if(ms.groups==null || !Array.isArray(ms.groups)){
            ms.groups = [];
        }

        // avoid duplicated GUID
        if(ms.groups.indexOf(pGroupUID)==-1){
            ms.groups.push(pGroupUID);
        }

        // update user
        await this._ctx.getUserService().updateMembership(
            this._ctx.getInternalAcc(),
            pOrg,
            user
        );
    }
}