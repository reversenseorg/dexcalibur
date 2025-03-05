import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty, NodePropertyState,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../Auditable.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {ValidationRule} from "../Validator.js";
import {GlobalAccessControl} from "../user/acl/rbac/GlobalAccessContol.js";
import {AccessAttribute, AccessAttributeMap} from "../user/acl/AccessAttribute.js";

export type  UploadedResourceUUID = string;

export interface UploadedResourceOpts {
    _id?:string;
    uuid?:UploadedResourceUUID;
    path?:string;
    date?:number
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

    terminated = false;

    date:number = -1

    tags:TagUUID[] = [];

    constructor(pOptions:UploadedResourceOpts = {}) {
        super({});

        if(pOptions._id!=null) this._id = pOptions._id;
        if(pOptions.uuid!=null) this.uuid = pOptions.uuid;
        if(pOptions.path!=null) this.path = pOptions.path;
        if(pOptions.date!=null) this.date = pOptions.date;
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
            uuid: this.uuid,
            date: this.date,
            terminated: this.terminated,
        }
    }

    terminate() {
        this.terminated = true;
    }
}
UploadedResource.TYPE.builder(UploadedResource);