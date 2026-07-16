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

import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@reversense/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@reversense/dxc-core-api";


export enum CredentialFormat {
    PUBLIC_KEY="public",
    PRIVATE_KEY="private",
    SECRET_KEY="secret",
    PASSWORD="password"
}


export interface CredentialOptions {
    uuid?:string;
    name?:string;
    description?:string;
    format?:CredentialFormat;
    extra?:any;
    owner?:string;
}

export class Credential implements INode {

    static TYPE:NodeType = (new NodeType( "credential", NodeInternalType.CREDENTIAL, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("format")).type(DbDataType.STRING).def(CredentialFormat.SECRET_KEY),
        (new NodeProperty("extra")).type(DbDataType.STRING).def({}),
        (new NodeProperty("owner")).type(DbDataType.STRING).def(null)
    ]));

    __:NodeInternalType = NodeInternalType.CREDENTIAL;

    uuid:string;
    name:string = "";
    description:string = "";
    format?:CredentialFormat;
    extra:any = {}
    owner:Nullable<string> = null;

    tags:TagUUID[] = [];

    constructor(pOptions:CredentialOptions) {

        this.uuid = pOptions.uuid!;
        this.name = pOptions.name!;
        this.description = pOptions.description!;
        this.format = pOptions.format!;
        this.extra = pOptions.extra!;
        this.owner = pOptions.owner!;
    }

    getUID():string {
        return this.uuid;
    }

    toJsonObject(pOption?: SerializeOptions): any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            format: this.format,
            extra: this.extra,
            owner: this.owner
        };

        return o;
    }
}