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

import {NodeInternalType, Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Architecture} from "../../Architecture.js";
import {
    DbDataType,
    DbKeyType,
    DbSerialize,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType, TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {RuntimeEvent} from "../../hook/RuntimeEvent.js";
import {AccessAttribute, AccessAttributeMap} from "../../user/acl/AccessAttribute.js";
import {Auditable} from "../../Auditable.js";
import {DeviceAccessControl} from "../../user/acl/rbac/DeviceAccessControl.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {CryptoUtils} from "../../CryptoUtils.js";


export type DeviceTemplateUUID = string;

export interface DeviceTemplateOptions {
    uuid?:DeviceTemplateUUID;
    os?:OperatingSystem;
    name?:string;
    arch?:Architecture;
    description?:string;
    creation_date?:number;
    lastrun_date?:number;
    destroy_date?:number;
    virtual?:boolean;
    extra?:Record<string, any>;
    tags?:TagUUID[];
    _attr?:any;
    stamp?:string;
}

/**
 *
 */
export class DeviceTemplate extends Auditable implements INode {

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        description: ValidationRule.utf8String(),
        os: ValidationRule.os(),
        //arch: ValidationRule.uuid(),
    }

    static TYPE:NodeType = new NodeType( "device_template", NodeInternalType.DEVICE_TPL,
        [
            (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("name")).type(DbDataType.STRING),
            (new NodeProperty("description")).type(DbDataType.STRING).def(null), // owner UUID
            (new NodeProperty("os")).type(DbDataType.STRING).def(OperatingSystem.NONE),
            (new NodeProperty("arch")).type(DbDataType.STRING).def(Architecture.AARCH64),
            (new NodeProperty("create_date")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("lastrun_date")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("destroy_date")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("virtual")).type(DbDataType.BOOLEAN).def(true),
            (new NodeProperty("stamp")).type(DbDataType.STRING).def(null),
            (new NodeProperty("extra")).type(DbDataType.BLOB).def({}),
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
        ]).dataSource("ENGINE_DB");

    __:NodeInternalType = NodeInternalType.DEVICE_MODEL;

    uuid:DeviceTemplateUUID;
    os:OperatingSystem = OperatingSystem.NONE;
    arch:Architecture = Architecture.AARCH64;
    virtual:boolean = true;
    name:string = "";
    description:string = "";
    creation_date:number = -1;
    lastrun_date:number = -1;
    destroy_date:number = -1;
    extra:Record<string, any> = {};
    tags:TagUUID[] = [];
    stamp:Nullable<string> = null;

    constructor(pOptions:Nullable<DeviceTemplateOptions> = null) {
        super({});

        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.os = (pOptions.os!=null ? pOptions.os : OperatingSystem.NONE);
            this.arch = (pOptions.arch!=null ? pOptions.arch : Architecture.AARCH64);
            this.name = (pOptions.name!=null ? pOptions.name : "");
            this.virtual = (pOptions.virtual!=null ? pOptions.virtual : true);
            this.stamp = (pOptions.stamp!=null ? pOptions.stamp : null);
            this.description = (pOptions.description!=null ? pOptions.description : "");
            this.destroy_date = (pOptions.destroy_date!=null ? pOptions.destroy_date : -1);
            this.creation_date = (pOptions.creation_date!=null ? pOptions.creation_date : -1);
            this.lastrun_date = (pOptions.lastrun_date!=null ? pOptions.lastrun_date : -1);
            this.tags = (pOptions.tags!=null ? pOptions.tags : []);
            this.extra = (pOptions.extra!=null ? pOptions.extra : {});
            this._attr = (pOptions._attr!=null ? pOptions._attr : {});
        }
    }

    /**
     *
     */
    initAccessAttributes(){
        this.setAccessAttribute(DeviceAccessControl.attr.TPL_OWNER);
    }

    getUID(): DeviceTemplateUUID {
        return this.uuid;
    }

    getOS():OperatingSystem {
        return this.os;
    }

    getArch():Architecture {
        return this.arch;
    }

    isVirtual():boolean {
        // todo : change later
        return true;
    }

    fill(pOptions:DeviceTemplateOptions):DeviceTemplate {

        // clone template
        const tpl = new DeviceTemplate(this as any);

        if(pOptions.name!=null) tpl.name = pOptions.name;
        if(pOptions.description!=null) tpl.description = pOptions.description;
        if(pOptions.extra!=null) tpl.extra = pOptions.extra;

        return tpl;
    }

    /**
     * To seal (and sign ?) the device template
     *
     * Once the device is created, the template become immutable because device parameters from
     * template cannot be modified later
     *
     * @method
     */
    seal():void {
        this.creation_date = (new Date()).getTime();
        this.stamp = CryptoUtils.sha256(JSON.stringify({
            uuid: this.uuid,
            os: this.os,
            arch: this.arch,
            extra: this.extra,
            creation_date: this.creation_date
        }));
    }

    /**
     * To check if the current template is sealed
     *
     * This method verifies if the stamp exists and is valid.
     *
     * @returns {boolean} TRUE is sealed else FALSE
     * @method
     */
    isSealed():boolean {
        return (this.stamp!=null) && (CryptoUtils.sha256(JSON.stringify({
            uuid: this.uuid,
            os: this.os,
            arch: this.arch,
            extra: this.extra,
            creation_date: this.creation_date
        }))===this.stamp);
    }

    addExtraOption(pKey:string, pValue:any):void {
        this.extra[pKey] = pValue;
    }

    getExtraOption(pKey:string):any {
        return this.extra[pKey];
    }

    toJsonObject():any {
        return {
            uuid: this.uuid,
            os: this.os,
            arch: this.arch,
            name: this.name,
            description: this.description,
            virtual: this.virtual,
            creation_date: this.creation_date,
            lastrun_date: this.lastrun_date,
            destroy_date: this.destroy_date,
            extra: this.extra,
            tags: this.tags
        };
    }
}
DeviceTemplate.TYPE.builder(DeviceTemplate);