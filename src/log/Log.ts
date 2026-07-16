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
} from "@reversense/dexcalibur-orm";
import {Nullable} from "../core/IStringIndex.js";
import {NodeInternalType}
from "@reversense/dxc-core-api";;
import {UserAccount} from "../user/UserAccount.js";
import {randomUUID} from "crypto";

export interface LogMessageOptions {
    node:string;
    time:number;
    msg:string;
    emitter?:string;
    user?:Nullable<string>;
    project?:Nullable<string>
    error?:number;
}

export class LogMessage implements INode{

    static TYPE = new NodeType('logs', NodeInternalType.LOG, [
        (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("time")).type(DbDataType.STRING).notnull(),
        (new NodeProperty("node")).type(DbDataType.STRING).notnull(),
        (new NodeProperty("msg")).type(DbDataType.STRING).notnull(),
        (new NodeProperty("emitter")).type(DbDataType.STRING).def(null),
        (new NodeProperty("user")).single(UserAccount.TYPE).def(null),
        (new NodeProperty("project")).type(DbDataType.STRING).def(null),
        (new NodeProperty("error")).type(DbDataType.NUMERIC).def(-1),
        (new NodeProperty("tags")).type(DbDataType.NUMERIC).def([]),
    ]).dataSource("ENGINE_DB");

    __:NodeInternalType = NodeInternalType.LOG;

    _id:string;
    _uid:string;
    node:number;
    time:number;
    msg:string;
    emitter:string;
    user:Nullable<string>;
    project:Nullable<string>;
    error:number = -1;

    tags:TagUUID[] = [];

    constructor(pConfig:LogMessageOptions) {
        for(let i in pConfig)
            this[i] = pConfig[i];

        this._uid = this._generateUID();
    }

    private _generateUID(){
        return this.node+"::"+this.time+'::'+randomUUID();
    }

    getUID(){
        return this._uid;
    }

    toJsonObject(pOption?: SerializeOptions): any {
        return this;
    }
}
LogMessage.TYPE.builder(LogMessage);