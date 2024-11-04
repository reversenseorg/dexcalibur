/**
 * This class enclose any actions related to access control
 */
import {AccessZone} from "./Zones.js";
import {Access, AccesErrCode, AccessException, AccessType, AccessUID, AccessProperty, AccessMap} from "./Access.js";
import {DelegateAccessControl} from "./DelegateAccessControl.js";
import {AccessAttribute} from "./AccessAttribute.js";
import {UserAccount} from "../UserAccount.js";
import {AccessControlManager} from "./AccessControlManager.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {AccessControlException} from "../../errors/AccessControlException.js";


let gInstance:AccessControl = null;

/**
 * Singleton
 *
 * This class help ONLY to manage Access point, zone and perform controls
 *
 * Roles are composed of Access points and are managed to another level, inside AccessControlManager (parent)
 *
 * @class
 */
export default class AccessControl {

    static INTERNAL_USER_ACCOUNT_UUID = "00000000-4242-1337-0000-000000000000";
    static INTERNAL_ROOT_ROLE_UUID = "00000000-0000-4242-1337-000000000000";


    static access:Record<string,Access> = {
        // organization
        ORG_OU_READ: new Access(AccessType.READ, 'ORG_OU_READ', 'Read organization units'),
        ORG_OU_MODIFY: new Access(AccessType.WRITE, 'ORG_OU_MODIFY', 'Modify organization units'),
        ORG_AU_READ: new Access(AccessType.READ, 'ORG_AU_READ', 'Read application units'),
        ORG_AU_MODIFY: new Access(AccessType.WRITE, 'ORG_AU_MODIFY', 'Modify application units'),
        ORG_AUTH_MGT: new Access(AccessType.WRITE, 'ORG_AUTH_MGT', 'Manage authentication settings'),
        ORG_ACL_MGT: new Access(AccessType.WRITE, 'ORG_ACL_MGT', 'Manage access controls'),

        // project
        PROJ_SETTINGS_EDIT: new Access( AccessType.WRITE, 'PROJ_SETTINGS_EDIT', 'Edit project settings'),
        PROJ_SETTINGS_READ: new Access( AccessType.READ, 'PROJ_SETTINGS_READ', 'Read project settings'),
        PROJ_CHOWN: new Access( AccessType.WRITE, 'PROJ_CHOWN', 'Change project owner'),
        PROJ_OPEN_OWN: new Access( AccessType.READ, 'PROJ_OPEN_OWN', 'Open own project'),
        PROJ_OPEN_ANY: new Access( AccessType.READ, 'PROJ_OPEN_ANY', 'Open any project'),
        PROJ_CREATE_OWN: new Access( AccessType.WRITE, 'PROJ_CREATE_OWN', 'Create own project'),
        PROJ_DELETE_OWN: new Access( AccessType.WRITE, 'PROJ_DELETE_OWN', 'Delete own projects'),
        PROJ_DELETE_ANY: new Access( AccessType.WRITE, 'PROJ_DELETE_ANY', 'Delete any projects'),
        PROJ_META_READ: new Access( AccessType.WRITE, 'PROJ_META_READ', 'Read project meta data (list)'),
        PROJ_PKG_READ: new Access( AccessType.READ, 'PROJ_PKG_READ', 'Read package content'),
        PROJ_NEW_OWN_WF: new Access( AccessType.WRITE, 'PROJ_NEW_OWN_WF', 'Create new project workflow'),
        PROJ_APPDATA_READ: new Access( AccessType.READ, 'PROJ_APPDATA_READ', 'Read app data content on the device'),
        CLOSE_OWN_PROJECT: new Access( AccessType.EXE, 'CLOSE_OWN_PROJECT', 'Close the project according to owner and group attributes'),

        // global
        GLOBAL_SETTINGS_EDIT: new Access( AccessType.WRITE, 'Edit global settings'),
        GLOBAL_SETTINGS_READ: new Access( AccessType.READ, 'Read global settings'),
        SERVER_RESTART: new Access( AccessType.EXE, 'Restart server'),
        SERVER_STOP: new Access( AccessType.EXE, 'Stop server'),

        // assurance models
        GLOBAL_MODEL_EDIT: new Access( AccessType.WRITE, 'Edit AssuranceModels shared by all projects'),
        GLOBAL_MODEL_READ: new Access( AccessType.READ, 'Read AssuranceModels shared by all projects'),
        GLOBAL_MODEL_DELETE: new Access( AccessType.WRITE, 'Delete AssuranceModels shared by all projects'),
        GLOBAL_MODEL_CREATE: new Access( AccessType.WRITE, 'Create AssuranceModels shared by all projects'),

        PROJECT_MODEL_READ: new Access( AccessType.READ, 'Create AssuranceModels for a specific project'),
        PROJECT_MODEL_EDIT: new Access( AccessType.WRITE, 'Delete AssuranceModels for a specific project'),
        PROJECT_MODEL_DELETE: new Access( AccessType.WRITE, 'Delete AssuranceModels for a specific project'),
        PROJECT_MODEL_CREATE: new Access( AccessType.WRITE, 'Create AssuranceModels for a specific project'),

        // WF
        GLOB_SHOW_ALL_WORKFLOWS: new Access( AccessType.READ, 'GLOB_SHOW_ALL_WORKFLOWS', 'Show all workflows for the engine instance'),
        GLOB_SHOW_OWN_WORKFLOWS: new Access( AccessType.READ, 'GLOB_SHOW_OWN_WORKFLOWS', 'Show only workflows owned by the user')

    };

    private _aclMgr:AccessControlManager;

    private _zoneMapping:Record<AccessUID, AccessZone[]> = {};

    private _zones:Record<string, DelegateAccessControl> = {};

    constructor() {

    }

    static getInstance():AccessControl{
        return gInstance;
    }
    /**
     * To update role at runtime
     *
     * @param pController
     */
    static updateRole( pController:DelegateAccessControl):void {

    }


    /**
     * To add a delegate access controller to the main access controller
     *
     * To enhance control checks with custom behaviours,
     * assign a zone to a delegate access control,
     * and assign accesses to a zone,
     * finally, at the location of the check put your `AccessControl.check(<ACCESS>, <USER>, [<RESOURCE>])`
     *
     * If the Access is not assigned to a zone, its only checked using :
     * - role : has the user a role which allow to gain this Access ?
     * - attribute : if an attribute is specified, check if the UserAccount UUID is a part or users
     * authorized to access to this resource
     *
     * @param {AccessZone} pZone
     * @param {DelegateAccessControl} pController
     */
    registerZone( pZone:AccessZone, pController:DelegateAccessControl):void {
        if(this._zones[pZone] == null){
            this._zones[pZone] = pController;
        }

        pController.boot();
    }

    /**
     * Assign an access to a zone
     *
     * @param pZone
     * @param pAccess
     */
    assignAccess( pZone:AccessZone, pAccess:Access[]):void {
        if(this._zones[pZone] == null){
            throw AccessControlException.INVALID_ZONE(pZone);
        }

        pAccess.map((vAccess:Access)=>{
            if(this._zoneMapping[vAccess.getUID()]==null){
                this._zoneMapping[vAccess.getUID()] = [pZone];
            }else{
                this._zoneMapping[vAccess.getUID()].push(pZone);
            }
        });
    }


    /**
     *
     */
    static init( pAclManager:AccessControlManager):AccessControl {
        if(gInstance==null){
            gInstance = new AccessControl();
        }

        if(gInstance._aclMgr!==null){
            gInstance._aclMgr = pAclManager;
        }

        return gInstance;
    }



    assertZoneExists(pZone:AccessZone):boolean {
        if(this._zones[pZone] == null)
            throw AccessControlException.INVALID_ZONE(pZone);

        return true;
    }

    getDelegatedAccessControl(pZone:AccessZone):DelegateAccessControl {
        this.assertZoneExists(pZone);

        return this._zones[pZone];
    }

    /**
     * To check if the given session can access to the given entry
     */
    static checkAttr(pZone:AccessZone, pAttr:AccessAttribute, pResource:any, pIssuer:any):void {
        AccessControl.getInstance()
            .getDelegatedAccessControl(pZone)
            .checkAttr(pAttr, pIssuer, pResource);


    }




    /**
     * To check if the given session can access to the given entry
     */
    static check(pZone:AccessZone, pControl:Access, pAccessObject:any, pAccount:UserAccount):void {

        // check if user
        // check if `pControl:Access`is mapped to a delegated access control or not

        AccessControl.getInstance()
            .getDelegatedAccessControl(pZone)
            .check(pControl, pAccount, pAccessObject);
    }


    static isAuthorizedByAttr(pAttr:AccessAttribute, pResource:any, pAccount:UserAccount){
        if(pResource==null){
            throw new AccessException("Access attribute of an undefined object cannot be verified : rejected ", AccesErrCode.MANDATORY_OBJECT_UNDEFINED)
        }

        // get a list authorized UUIDs for a given attribute from pSubject
        let authorizedUIDs = pResource.getAccessAttribute(pAttr) as string;

        // verify the UUID of given accoiunt is a part of the list of authorized users
        return (authorizedUIDs.indexOf(pAccount.getUID())>-1);
    }


    /**
     * To check if the given session can access to the given entry
     *
     * @method
     */
    static isAuthorized(pControl:Access, pAccount:UserAccount, pResource?:Nullable<any>, pAttributes?:AccessAttribute[] ):void {
        if(gInstance==null){
            throw AccessControlException.MISSING_ACL_CTRL();
        }

        gInstance.getManager().isAuthorized(pControl, pAccount, pResource);

        // next search if the accesss is mapped to one or more zones
        const zones = gInstance._zoneMapping[pControl.getUID()];

        // for each zone found, execute delegated access checks
        let dac:DelegateAccessControl;
        for(let i=0; i<zones.length; ++i){
            dac = gInstance.getDelegatedAccessControl(zones[i]);
            if(dac!=null){
                dac.check(pControl,pAccount,pResource);

                if(pResource!=undefined && pAttributes!=undefined){
                    for(let k=0; k<pAttributes.length; k++){
                        dac.checkAttr(pAttributes[k], pAccount, pResource);
                    }

                }
            }
        }
    }

    getManager():AccessControlManager {
        if(this._aclMgr==null){
            throw AccessControlException.MISSING_ACL_MGR();
        }

        return this._aclMgr;
    }

    /**
     * To get a list of access point by matching rule of a property :
     * - id
     * - name
     * - description
     *
     * Helpful to fill access lists of user role
     *
     * @param {AccessProperty} pProperty A type of property of an access
     * @param {string} pPattern A regexp
     */
    static getMatchingAccesses( pProperty:AccessProperty, pPattern:string|AccessType):AccessMap {
        let o:AccessMap = {};
        let r:any = null;
        switch (pProperty) {
            case AccessProperty.UID:

                r = new RegExp(pPattern as string);
                for(let k in AccessControl.access){
                    if(r.test(k))
                        o[k] = AccessControl.access[k];
                }
                break;
            case AccessProperty.TYPE:
                for(let k in AccessControl.access){
                    if(this.access[k].type == AccessType[pPattern])
                        o[k] = AccessControl.access[k];
                }
                break
            case AccessProperty.NAME:
            case AccessProperty.DESCR:

                r = new RegExp(pPattern as string);
                for(let k in AccessControl.access){
                    if(r.test(AccessControl.access[k][pProperty]))
                        o[k] = AccessControl.access[k];
                }
                break;
        }

        return o;
    }

    static getMatchingAccessesList( pProperty:AccessProperty, pPattern:string|AccessType):Access[] {
        return Object.values(AccessControl.getMatchingAccesses(pProperty, pPattern));
    }
}