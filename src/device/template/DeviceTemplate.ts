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
    virtual?:number;
    tags?:TagUUID[];
    _attr?:any;
}

/**
 *
 */
export class DeviceTemplate extends Auditable implements INode {

    static TYPE:NodeType = new NodeType( "device_template", NodeInternalType.DEVICE_TPL,
        [
            (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("name")).multiple(RuntimeEvent.TYPE).def("[]"),
            (new NodeProperty("description")).type(DbDataType.STRING).def(null), // owner UUID
            (new NodeProperty("os")).type(DbDataType.STRING).def(OperatingSystem.NONE),
            (new NodeProperty("arch")).type(DbDataType.STRING).def(Architecture.AARCH64),
            (new NodeProperty("create_date")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("lastrun_date")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("destroy_date")).type(DbDataType.STRING).def(-1),
            (new NodeProperty("virtual")).type(DbDataType.BOOLEAN).def(true),
            (new NodeProperty("_attr"))
                .type(DbDataType.STRING)
                .wakeUp( (x:NodePropertyState) => {
                    if(x.p!=null){
                        const m:AccessAttributeMap = {};
                        for(let k in x.p){
                            m[k] = AccessAttribute.from({
                                name: x.p[k]._n,
                                value: x.p[k]._v,
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
    name:string;
    description:string;
    creation_date:number;
    lastrun_date:number;
    destroy_date:number;
    tags:TagUUID[];

    constructor(pOptions:Nullable<DeviceTemplateOptions> = null) {
        super({});

        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.os = (pOptions.os!=null ? pOptions.os : OperatingSystem.NONE);
            this.arch = (pOptions.arch!=null ? pOptions.arch : Architecture.AARCH64);
            this.name = (pOptions.name!=null ? pOptions.name : "");
            this.description = (pOptions.description!=null ? pOptions.description : "");
            this.destroy_date = (pOptions.destroy_date!=null ? pOptions.destroy_date : -1);
            this.creation_date = (pOptions.creation_date!=null ? pOptions.creation_date : -1);
            this.lastrun_date = (pOptions.lastrun_date!=null ? pOptions.lastrun_date : -1);
            this.tags = (pOptions.tags!=null ? pOptions.tags : []);
            this._attr = (pOptions._attr!=null ? pOptions._attr : {});
        }
    }

    /**
     *
     */
    initAccessAttributes(){
        //this.setAccessAttribute(ProjectAccessControl.attr.OWNER);
        //this.setAccessAttribute(ProjectAccessControl.attr.TESTER);
    }

    getUID(): DeviceTemplateUUID {
        return this.uuid;
    }

    isVirtual():boolean {
        // todo : change later
        return true;
    }

    toJsonObject():any {
        return {
            uuid: this.uuid,
            os: this.os
        }
    }
}