/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {DelegateAccessControl} from "../DelegateAccessControl.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";
import {UserServiceException} from "../../../errors/UserServiceException.js";
import {NodeInternalType} from "@reversense/dxc-core-api";


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

