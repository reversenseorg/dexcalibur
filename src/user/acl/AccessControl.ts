/**
 * This class enclose any actions related to access control
 */
import {AccessZone} from "./Zones";
import {Access, AccesErrCode, AccessException} from "./Access";
import {DelegateAccessControl} from "./DelegateAccessControl";
import {UserRole, UserRoleMap} from "./rbac/UserRole";
import {BUILT_IN_DEFAULT_ROLE, BUILT_IN_ROLES} from "./Roles";
import {AccessAttribute} from "./AccessAttribute";
import {UserAccount} from "../UserAccount";


export interface DelegateAccessControlMap {
    [zoneID:string] :DelegateAccessControl
}


let gInstance:AccessControl = null;
export default class AccessControl {


    static zones:DelegateAccessControlMap = {};

    static defaultRole:string = BUILT_IN_DEFAULT_ROLE;
    static roles:UserRoleMap = {};

    constructor() {

    }

    /**
     * To update role at runtime
     *
     * @param pController
     */
    static updateRole( pController:DelegateAccessControl):void {

    }

    /**
     * To add role to access control
     *
     * @param pRoles
     */
    static addRoles( pRoles:UserRole[]):void {
        pRoles.map(function(vRole){
            if(AccessControl.roles[vRole.uid]==null)
                AccessControl.roles[vRole.uid] = vRole;
        })
    }

    /**
     * To add a delegate access controller to the main access controller
     * @param {AccessZone} pZone
     * @param {DelegateAccessControl} pController
     */
    static registerZone( pZone:AccessZone, pController:DelegateAccessControl):void {
        if(AccessControl.zones[pZone] == null){
            AccessControl.zones[pZone] = pController;
        }
    }

    /**
     *
     */
    static init():void {
        if(gInstance==null){
            gInstance = new AccessControl();

            AccessControl.addRoles(BUILT_IN_ROLES);
        }
    }



    static hasZone(pZone:AccessZone):void {
        if(AccessControl.zones[pZone] == null)
            throw new AccessException("There is not access zone assigned to  '"+pZone+"'",AccesErrCode.NO_ZONE);
    }

    /**
     * To check if the given session can access to the given entry
     */
    static checkAttr(pZone:AccessZone, pAttr:AccessAttribute, pAccessObject:any, pIssuer:any):void {
        AccessControl.hasZone(pZone);
        AccessControl.zones[pZone].checkAttr(pAttr, pIssuer, pAccessObject);
    }


    /**
     * To check if the given session can access to the given entry
     */
    static check(pZone:AccessZone, pControl:Access, pAccessObject:any, pAccount:UserAccount):void {
        AccessControl.hasZone(pZone);
        AccessControl.zones[pZone].check(pControl, pAccount, pAccessObject);
    }

    static getDefaultRole(): UserRole {
        if(AccessControl.roles[AccessControl.defaultRole] == null)
            throw new AccessException("There is no default role configured",AccesErrCode.NO_DEFAULT_ROLE);

        return AccessControl.roles[AccessControl.defaultRole];
    }

    static getRole(pname:string): UserRole {

        if(AccessControl.roles[pname] == null)
            throw new AccessException("There is no role '"+pname+"' configured",AccesErrCode.ROLE_UNDEFINED);

        return AccessControl.roles[pname];
    }
}