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

import {UserAccount, UserAccountUUID} from "./UserAccount.js";
import {Device, DeviceUUID} from "../Device.js";
import {
    DbDataType,
    DbKeyType,
    DbSerialize, INode, JSONSchemaValidator,
    NodeProperty,
    NodePropertyState,
    NodeType, TagUUID
} from "@reversense/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@reversense/dxc-core-api";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {NodeUtils} from "../core/NodeUtils.js";
import {UserServiceException} from "../errors/UserServiceException.js";

export interface UserPreferencesOptions {
    uuid?:UserPreferencesUUID,
    user?:UserAccountUUID,
    prefs?:Record<DexcaliburProjectUUID, any>
}

export type UserPreferencesUUID = string;

export class UserPreferences implements INode {

    static DEFAULT_UID:string = "00000000-0000-0000-0000-000000000000";

    static TYPE:NodeType = new NodeType( "user_prefs", NodeInternalType.USR_PREF,
        [
            (new NodeProperty("uuid"))
                .type(DbDataType.STRING)
                .schema({ type:"string", format:"uuid", description:"User preferences UUID" })
                .key(DbKeyType.PRIMARY),
            (new NodeProperty("user"))
                .schema(UserAccount.TYPE.getPrimaryKey().toJSONSchemaPart())
                .descr("User account associated to these preferences")
                .def(null),
            (new NodeProperty("prefs"))
                .schema({
                    type:"object"
                })
                .descr("")
                .def({}),
            (new NodeProperty("tags"))
                .schema({ type:"array", items:{ type:"number" }})
                .descr("User account associated to these preferences")
                .def([]),
        ]).dataSource("ENGINE_DB");
    __:NodeInternalType = NodeInternalType.USR_PREF;

    uuid:string;
    user:UserAccountUUID;
    prefs:Record<DexcaliburProjectUUID, any> = {};
    tags:TagUUID[] = [];

    constructor(pConfig:UserPreferencesOptions = {}) {
        if(pConfig != null){
            for(let i in pConfig) this[i] = pConfig[i];
        }
    }

    getUID():string {
        return this.uuid;
    }

    addPreferredDevice(pProj:DexcaliburProjectUUID, pDevice:DeviceUUID):void {
        if(this.prefs==null) this.prefs = {};
        if(this.prefs[pProj]==null) this.prefs[pProj] = { };

        if(Device.TYPE.getPrimaryKey().checkSchema(pDevice)){
            this.prefs[pProj].dev = pDevice;
        }else{
            throw UserServiceException.PREF_VALUE_INVALID();
        }
    }

    getPreferredDevice(pProj:DexcaliburProjectUUID):Nullable<DeviceUUID> {
        return (this.prefs[pProj]!=null ? this.prefs[pProj].dev : null)
    }

    toJsonObject():any {
        return {
            uuid: this.uuid,
            user: this.user,
            prefs: this.prefs,
            tags: this.tags
        };
    }
}
UserPreferences.TYPE.builder(UserPreferences);