import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {Access, AccesErrCode, AccessException, AccessMap, AccessType} from "../Access.js";
import {UserSession} from "../../session/UserSession.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import DexcaliburProject from "../../../DexcaliburProject.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {Nullable} from "../../../core/IStringIndex.js";
import {AccessZone} from "../Zones.js";


export class ProjectAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'PROJ';

    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner'),
        TESTER: new AccessAttribute<UserAccountUUID>( 'tester')
    };

    constructor() {
        super();
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

