import DexcaliburEngine from "../../DexcaliburEngine.js";
import AccessControl from "./AccessControl.js";
import {AccessZone} from "./Zones.js";
import {ProjectAccessControl} from "./rbac/ProjectAccessContol.js";
import {SettingsAccessControl} from "./rbac/SettingsAccessContol.js";
import {GlobalAccessControl} from "./rbac/GlobalAccessContol.js";
import {OrganizationAccessControl} from "./rbac/OrganizationAccessContol.js";
import Role from "./common/Role.js";
import {UserAccount} from "../UserAccount.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {Access, AccessProperty, AccessType, AccessUID} from "./Access.js";
import {AccessFactory} from "./AccessFactory.js";
import {AccessControlException} from "../../errors/AccessControlException.js";
import * as Log from "../../Logger.js";
import {AccessAttribute} from "./AccessAttribute.js";
import {UserGroup} from "./common/UserGroup.js";
import {OrganizationUnit} from "../../organization/OrganizationUnit.js";

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

    private _groups:Record<string, UserGroup> = {};

    /**
     * ACL Matrix
     *
     * Help to answer to the question :
     * - Is the account X has a role which allow the operation A ?
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
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.ORG_MEMBER,
            ]
        );

        // todo : search directly in DB by Org UUID
        let roles:Role[] = [];
        roles = await this._ctx.getEngineDB()
            .getCollectionOf(Role.TYPE.getType())
            .getAsList();

        // gather generic roles from db
        const orgUUID = pOrg.getUID();
        roles = roles.filter(r => r.hasOrg(orgUUID));

        return roles;
    }

    async createRole(pUserAccount:UserAccount, pRole:Role):Promise<Role> {
        AccessControl.check(
            AccessZone.ORGANIZATION,
            AccessControl.access.ORG_ACL_MGT,
            null,
            pUserAccount
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(Role.TYPE.getType())
            .asyncAddEntry(pRole.getUID(), pRole);
    }

    async updateRole(pUserAccount:UserAccount, pRole:Role):Promise<boolean> {
        AccessControl.check(
            AccessZone.ORGANIZATION,
            AccessControl.access.ORG_ACL_MGT,
            null,
            pUserAccount
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(Role.TYPE.getType())
            .asyncUpdateEntry(pRole);
    }

    async removeRole(pUserAccount:UserAccount, pRole:Role):Promise<boolean> {
        AccessControl.check(
            AccessZone.ORGANIZATION,
            AccessControl.access.ORG_ACL_MGT,
            null,
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
                uuid: 'local_admin',
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
                    AccessControl.access.ORG_GRP_MGT,
                    AccessControl.access.ORG_ACL_MGT,
                    AccessControl.access.ORG_OU_SECRETS_MGT
                ]
            }),
            new Role({
                uuid: 'R_AUADM',
                name: 'Application Administrator',
                permissions: [
                    AccessControl.access.ORG_AU_READ,

                    AccessControl.access.PROJ_SETTINGS_EDIT,
                    AccessControl.access.PROJ_SETTINGS_READ,
                    AccessControl.access.PROJ_CHOWN,
                    AccessControl.access.PROJ_OPEN_OWN,
                    AccessControl.access.PROJ_CREATE_OWN,
                    AccessControl.access.PROJ_DELETE_OWN,
                    AccessControl.access.PROJ_META_READ,
                    AccessControl.access.PROJ_PKG_READ,
                    AccessControl.access.PROJ_NEW_OWN_WF,

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
                    AccessControl.access.SCAN_SCHED_PER
                ]
            }),
            new Role({
                uuid: 'R_QAAUDITOR',
                name: 'Quality Auditor',
                permissions: [
                    AccessControl.access.ORG_AU_READ,
                    AccessControl.access.GLOBAL_MODEL_READ,
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
                name: 'DevOps',
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
     * Add a rol to the in-memory list of role
     * and add the role to ACL matrix
     *
     * @param {Role} vRole
     * @private
     */
    private _setupRole(vRole:Role):void {
        try{
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
     * To check if one of role authorized on pAccess is a part of the list of roles assigned
     * to specified pUser
     *
     * @param pAccess
     * @param pUser
     * @param pSubject
     */
    isAuthorized(pAccess:Access, pUser:UserAccount, pResource?:Nullable<any>, pAttributes?:AccessAttribute<any>[] ):void {

        if(pAccess==null || this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        if(this._matrix[pAccess.getUID()]==null){
            throw AccessControlException.MISSING_ACCESS(pAccess);
        }

        let roleFound = false;
        const usrRoles:string[] = pUser.getRoles();
        for(let i=0; i<this._matrix[pAccess.getUID()].length; i++){

            // authorized by role
            if(usrRoles.indexOf(this._matrix[pAccess.getUID()][i].getUID())>-1){

                roleFound = true;

                // check attr if resource and attr are specified
                if(pResource!=undefined && pAttributes!=undefined){

                    for(let k=0; k<pAttributes.length; k++){

                        // access to res authorized by attr
                        if(AccessControl
                            .isAuthorizedByAttr(pAttributes[k], pResource, pUser)){
                            Logger.success(`[ACCESS MANAGER] User [uuid=${pUser.getUID()}] has been authorized to access  resource [res=${pResource.getUID()}] over [access=${pAccess.getUID()}] with [attr=${pAttributes[k].name}]`);
                            return ;
                        }
                    }
                }else if(pAttributes!=undefined){
                    continue;
                }else{
                    Logger.success(`[ACCESS MANAGER] User [uuid=${pUser.getUID()}] has been authorized to access [uid=${pAccess.getUID()}]`);
                    return;
                }
            }
        }

        // todo : log access

        Logger.error(`[ACCESS MANAGER] User [uuid=${pUser.getUID()}] has tried to access [uid=${pAccess.getUID()}]. Access denied by ${(roleFound && pAttributes.length>0)? 'attributes':'roles'}`);
        throw AccessControlException.NOT_AUTHORIZED(pAccess,pUser);
    }

    // init AC list
    private _initAclMatrix(pAccesses: Record<string, Access>) {
        for(let key in pAccesses){
            if(this._matrix[key]==null){
                this._matrix[key] = [];
            }
        }
    }
}