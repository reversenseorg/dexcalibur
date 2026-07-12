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
    SerializeOptions, Tag,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import HookSession, {HookSessionUUID} from "../HookSession.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {Device, DeviceUUID} from "../Device.js";
import {INodeRef} from "../INode.js";


export type RuntimeSessionUUID = string;

export interface RuntimeSessionOpts {
    uuid?:RuntimeSessionUUID;
    owner?:UserAccountUUID;
    project?:DexcaliburProjectUUID;
    device?:DeviceUUID;
    date?:number;
    tags?:number;
    tools?:number;
    hksess?:number;
}

export class RuntimeSession implements INode {

    static TYPE:NodeType = new NodeType("rtsess", NodeInternalType.RUNTIME_SESS,[
        (new NodeProperty("uuid"))
            .type(DbDataType.STRING)
            .key(DbKeyType.PRIMARY)
            .schema({ type:"string", format:"uuid", description:"Unique identifier of the runtime session" }),
        (new NodeProperty("hksess"))
            .type(DbDataType.STRING)
            .def([]),
        (new NodeProperty("owner"))
            .type(DbDataType.STRING)
            .def(null),
        (new NodeProperty("project"))
            .type(DbDataType.STRING)
            .schema(Tag.TYPE.getPrimaryKey().toJSONSchemaPart(true))
            .def(null),
        (new NodeProperty("device"))
            .type(DbDataType.STRING)
            .def(null),
        (new NodeProperty("date"))
            .type(DbDataType.STRING)
            .def(0),
        (new NodeProperty("tools"))
            .type(DbDataType.STRING)
            .def([])
            .schema({ type:"array", items:{type:"object"}}),
        (new NodeProperty("tags"))
            .def([])
            .schema(Tag.TYPE.getProperty('_').toJSONSchemaPart(true)),
    ]).dataSource("PROJECT_DB");

    __ = NodeInternalType.RUNTIME_SESS;

    uuid:RuntimeSessionUUID = null;
    hksess:HookSessionUUID[] = [];
    owner:UserAccountUUID = null;
    project:DexcaliburProjectUUID = null;
    device:DeviceUUID = null;
    tools:any[] = [];
    tags:TagUUID[] = [];
    date:number = 0;

    _ctx:Nullable<DexcaliburProject> = null;



    constructor(pOpts:RuntimeSessionOpts){
        if(pOpts!=null){
            for (let i in pOpts){
                this[i] = pOpts[i];
            }
        }
    }

    getUID(): string | null {
        return this.uuid;
    }

    setContext(pCtx:DexcaliburProject){
        this._ctx = pCtx;
    }

    setDevice(pDev:DeviceUUID){
        this.device = pDev;
    }

    addHookSession(pSess:HookSessionUUID){
        this.hksess.push(pSess);
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return {
            uuid: this.uuid,
            hksess: this.hksess,
            owner: this.owner,
            project: this.project,
            device: this.device,
            tools: this.tools,
            tags: this.tags,
            date: this.date
        }
    }
}
RuntimeSession.TYPE.builder(RuntimeSession);