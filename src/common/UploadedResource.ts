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

import * as _path_ from "path";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty, NodePropertyState,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../Auditable.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {GlobalAccessControl} from "../user/acl/rbac/GlobalAccessContol.js";
import {AccessAttribute, AccessAttributeMap} from "../user/acl/AccessAttribute.js";
import {CryptoUtils, HashAlgo} from "../CryptoUtils.js";

export type  UploadedResourceUUID = string;

export interface UploadedResourceOpts {
    _id?:string;
    uuid?:UploadedResourceUUID;
    path?:string;
    date?:number;
    sum?:string;
    algo?:HashAlgo;
    tags?:TagUUID[];
    extra?:any;
    terminated?:boolean;
    name?:Nullable<string>;
}

/**
 *
 */
export class UploadedResource extends Auditable implements INode {

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid()
    }

    /**
     *
     */
    static TYPE:NodeType = new NodeType(
        "upload",
        NodeInternalType.UPLOAD,
        [
            (new NodeProperty("_id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("path")).type(DbDataType.STRING),
            (new NodeProperty("name")).type(DbDataType.STRING).def(null),
            (new NodeProperty("sum")).type(DbDataType.STRING).def(""),
            (new NodeProperty("extra")).type(DbDataType.BLOB).def({}),
            (new NodeProperty("algo")).type(DbDataType.STRING).def(CryptoUtils.ALG_SHA256),
            (new NodeProperty("date")).type(DbDataType.NUMERIC).def(0),
            (new NodeProperty("terminated")).type(DbDataType.BOOLEAN),
            (new NodeProperty("tags")).type(DbDataType.BLOB).def([]),
            (new NodeProperty("_attr"))
                .type(DbDataType.STRING)
                .wakeUp( (x:NodePropertyState) => {
                    if(x.p!=null){
                        const m:AccessAttributeMap = {};
                        for(let k in x.p){
                            m[k] = AccessAttribute.from({
                                name: x.p[k]._n,
                                value: x.p[k]._v,
                                type: x.p[k]._t
                            });
                        }
                        return m;
                    }else{
                        return {};
                    }
                })
                .def({})
        ]);
    __ = NodeInternalType.UPLOAD;

    _id:string;

    uuid:UploadedResourceUUID;

    path:string;

    name:Nullable<string> = null;

    terminated = false;

    date:number = -1

    tags:TagUUID[] = [];

    sum:string = "";

    algo = CryptoUtils.ALG_SHA256;

    extra:any = {};

    constructor(pOptions:UploadedResourceOpts = {}) {
        super({});

        if(pOptions._id!=null) this._id = pOptions._id;
        if(pOptions.uuid!=null) this.uuid = pOptions.uuid;
        if(pOptions.path!=null) this.path = pOptions.path;
        if(pOptions.name!=null) this.name = pOptions.name;
        if(pOptions.date!=null) this.date = pOptions.date;
        if(pOptions.sum!=null) this.sum = pOptions.sum;
        if(pOptions.algo!=null) this.algo = pOptions.algo;
        if(pOptions.tags!=null) this.tags = pOptions.tags;
        if(pOptions.extra!=null) this.extra = pOptions.extra;
        if(pOptions.terminated!=null) this.terminated = pOptions.terminated;
    }

    initAccessAttributes() {
        this.setAccessAttribute(GlobalAccessControl.attr.OWNER);
    }

    getUID():UploadedResourceUUID {
        return this.uuid;
    }

    setOwner(pNode:INode):void {
        this.appendToAccessAttribute(
            GlobalAccessControl.attr.OWNER,
            pNode.getUID()
        );
    }

    toJsonObject(pOption?: SerializeOptions, pZone = SecurityZone.PUBLIC): any {
        return {
            _id: this._id,
            path: (pZone===SecurityZone.PRIVATE? this.path : null),
            name: (pZone===SecurityZone.PUBLIC && _path_.isAbsolute(this.name) ? null : this.name),
            uuid: this.uuid,
            date: this.date,
            sum: this.sum,
            algo: this.algo,
            tags: this.tags,
            extra: this.extra,
            terminated: this.terminated,
        }
    }

    terminate() {
        this.terminated = true;
    }

    appendExtra(pInfo: any) {
        this.extra = pInfo;
    }

    getExtra(pKey: string):any {
        if (this.extra == null ) return null;

        return this.extra[pKey];
    }
}
UploadedResource.TYPE.builder(UploadedResource);