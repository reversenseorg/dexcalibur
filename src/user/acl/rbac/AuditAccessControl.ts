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
import {AccesErrCode, Access, AccessException, AccessMap, AccessType} from "../Access.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import AccessControl from "../AccessControl.js";
import {AccessZone} from "../Zones.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";

/**
 * Represent access control configuration for audits
 * @class
 */
export class AuditAccessControl extends DelegateAccessControl {

    static ready = false;

    static uid:string = 'AUDIT';

    static attr:AccessAttributeMap = {
        OWNER: new AccessAttribute<UserAccountUUID>( 'owner', [], NodeInternalType.USER_ACCOUNT)
    };

    constructor() {
        super();



    }

    boot():void{
        if(!AuditAccessControl.ready){
            AccessControl.getInstance().assignAccess(
                AccessZone.AUDIT,
                [
                    AccessControl.access.PROJECT_MODEL_EDIT,
                    AccessControl.access.PROJECT_MODEL_READ,
                    AccessControl.access.PROJECT_MODEL_DELETE,
                    AccessControl.access.PROJECT_MODEL_CREATE
                ]
            );
            AuditAccessControl.ready = true;
        }
    }

}