import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";
import {UserServiceException} from "../../../errors/UserServiceException.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";


export class ProjectAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'PROJ';

    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner', [], NodeInternalType.USER_ACCOUNT),
        TESTER: new AccessAttribute<UserAccountUUID>( 'tester', [], NodeInternalType.USER_ACCOUNT)
    };

    constructor() {
        super();
    }

    static getOwnerFilter(pUserAccountUID:UserAccountUUID):any {

        if(!UserAccount.VALIDATE._uid.test(pUserAccountUID)){
            throw UserServiceException.INVALID_USER_UUID_FMT(pUserAccountUID);
        }

        const filter:any = {
            '$or':[]
        };

        filter['$or']['_attr.'+ProjectAccessControl.attr.OWNER.name+'._v'] = { $all: [ pUserAccountUID ] };

        return filter;
    }

    static getAppMembersFilter(pUserAccountUID:UserAccountUUID):any {

        const filter:any = ProjectAccessControl.getOwnerFilter(pUserAccountUID);

        filter['$or']['_attr.'+ProjectAccessControl.attr.TESTER.name+'._v'] = { $all: [ pUserAccountUID ] };

        return filter;
    }

    boot():void{
        if(!ProjectAccessControl.ready){
            AccessControl.getInstance().assignAccess(
                AccessZone.PROJECT,
                [
                    AccessControl.access.PROJ_OPEN_OWN,
                    AccessControl.access.PROJ_OPEN_ANY
                ]
            );
            ProjectAccessControl.ready = true;
        }
    }


}

