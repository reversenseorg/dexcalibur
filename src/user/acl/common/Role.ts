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

import {Access} from "../Access.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {UserAccount, UserAccountType} from "../../UserAccount.js";
import {OrganizationUnitUUID} from "../../../organization/OrganizationUnit.js";
import {SecurityZone} from "../../../security/SecurityZone.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";

export type RoleUUID = string;

export interface RoleOpts {
    uuid?:RoleUUID;
    name?:string;
    description?:string;
    permissions?:Access[];
    authorized?:string[];
    orgUnit?:Nullable<OrganizationUnitUUID>;
    tags?:number[]
}

/**
 *
 */
export default class Role implements INode {

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        description: ValidationRule.utf8String(),
        orgUnit: ValidationRule.uuid()
    }


    static TYPE:NodeType = new NodeType(
        'role',
        NodeInternalType.ACL_ROLE,
        [
            (new NodeProperty('uuid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty('name')).type(DbDataType.STRING),
            (new NodeProperty('description')).type(DbDataType.STRING).def(""),
            (new NodeProperty('permissions')).type(DbDataType.STRING).def([]),
            (new NodeProperty('authorized')).type(DbDataType.STRING).def([]),
            (new NodeProperty('orgUnit')).type(DbDataType.STRING).def(null),
        ]
    );

    __:NodeInternalType = NodeInternalType.ACL_ROLE;

    tags:TagUUID[] = [];

    private _uuid:RoleUUID = null;
    private _name:string ;
    private _description:string = "";
    private _permissions:Access[] = [];
    private _authorized:string[] = [];
    private _orgUnit:Nullable<OrganizationUnitUUID> = null;


    constructor( pOptions:Nullable<RoleOpts> = null) {
        if(pOptions!=null){
            this._uuid = pOptions.uuid!;
            this._name = pOptions.name!;
            this._description = pOptions.description!;
            this._permissions = (pOptions.permissions!=null? pOptions.permissions : []);
            this._authorized = (pOptions.authorized!=null? pOptions.authorized : []);
            this._orgUnit = pOptions.orgUnit!;
        }
    }

    getUID(): RoleUUID | null {
        return this._uuid;
    }

    get uid(): string {
        return this._uuid;
    }

    set uid(value: string) {
        this._uuid = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get access(): Access[] {
        return this._permissions;
    }

    set access(value: Access[]) {
        this._permissions = value;
    }


    get orgUnit(): string {
        return this._orgUnit;
    }

    set orgUnit(value: string) {
        this._orgUnit = value;
    }

    addAccess(pAccess:Access):void {
        this._permissions.push(pAccess);
    }

    hasAccess(pAccess:Access):boolean {
        return (this._permissions.find(x => (x.name===pAccess.name))!=null)
    }

    grant(pAccount:UserAccount){
        if(this._authorized.indexOf(pAccount.getUID())==-1){
            this._authorized.push(pAccount.getUID());
        }
    }

    isAuthorized(pAccount:UserAccount):boolean {
        return (this._authorized.indexOf(pAccount.getUID())>-1);
    }

    isGeneric():boolean {
        return (this._orgUnit===null || this._orgUnit===undefined);
    }

    hasOrg(pOrg:OrganizationUnitUUID):boolean {
        return (this._orgUnit===pOrg);
    }

    toJsonObject(pOpts?:SerializeOptions, pZone = SecurityZone.PUBLIC):any {
        return {
            uuid:this._uuid,
            description:this._description,
            name:this._name,
            permissions:this._permissions,
            authorized: (pZone==SecurityZone.PUBLIC ? null : this._authorized),
            orgUnit: (pZone==SecurityZone.PUBLIC ? null : this._orgUnit),
        }

    }
}
Role.TYPE.builder(Role);