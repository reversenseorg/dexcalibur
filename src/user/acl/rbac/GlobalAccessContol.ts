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
import {UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {OrganizationUnitUUID} from "../../../organization/OrganizationUnit.js";
import {ApplicationUnitUUID} from "../../../organization/ApplicationUnit.js";


export class GlobalAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'GLOB';

    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner', [], NodeInternalType.USER_ACCOUNT),
        ORG: new AccessAttribute<OrganizationUnitUUID>( 'org_unit', [], NodeInternalType.ORG_UNIT),
        APP: new AccessAttribute<ApplicationUnitUUID>( 'app_unit', [], NodeInternalType.APP_UNIT),
    };

    constructor() {
        super();


    }



    boot():void{
        if(!GlobalAccessControl.ready){
            AccessControl.getInstance().assignAccess(
                AccessZone.GLOBAL,
                [
                    AccessControl.access.GLOB_SHOW_OWN_WORKFLOWS
                ]
            );
            GlobalAccessControl.ready = true;
        }
    }

}

