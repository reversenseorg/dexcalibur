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
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {AccessAttribute, AccessAttributeMap} from "../user/acl/AccessAttribute.js";
import {Person} from "../user/Person.js";


export interface OrganizationUnitOptions {
    uuid?:string;
    name?:string;
    companyName?:string;
    description?:string;
    owner?:string;
    tags?:TagUUID[];
    _attr?:AccessAttributeMap;
}

export class OrganizationUnit extends Auditable implements INode {

    static TYPE:NodeType = (new NodeType( "organization_unit", NodeInternalType.ORG_UNIT, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("companyName")).type(DbDataType.STRING),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("owner")).type(DbDataType.STRING).def(null),
        (new NodeProperty("_attr"))
            .type(DbDataType.STRING)
            .wakeUp( (x:NodePropertyState) => {
                if(x.p!=null){
                    console.log(x.p);
                    const m:AccessAttributeMap = {};
                    for(let k in x.p){
                        m[k] = AccessAttribute.from({
                            name: x.p[k]._n,
                            value: x.p[k]._v,
                        });
                    }

                    console.log(m);
                    return m;
                }else{
                    return {};
                }
            })
            .def({})
    ]));

    __:NodeInternalType = NodeInternalType.ORG_UNIT;

    uuid:string;
    name: string;
    companyName: string;
    description:string;
    owner:string;


    tags:TagUUID[] = [];

    constructor(pOptions:Nullable<OrganizationUnitOptions>) {
        super({});


        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.name = pOptions.name!;
            this.description = pOptions.description!;
            this.owner = pOptions.owner!;
            this.tags = pOptions.tags!;
            this._attr = pOptions._attr!;
        }

    }

    getUID():string {
        return this.uuid;
    }

    /**
     * To init ACL attributes of OrganizationUnit instances
     *
     * Supported attributes:
     * - `OrganizationAccessControl.attr.ORG_MEMBER`
     *
     * @return {void}
     * @method
     */
    initAccessAttributes(){
        this.setAccessAttribute(OrganizationAccessControl.attr.ORG_MEMBER);
        this.setAccessAttribute(OrganizationAccessControl.attr.OWNER);
    }

    toJsonObject(pOption?: SerializeOptions): any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            companyName: this.companyName,
            owner: this.owner,
            tags: this.tags,
            _attr: this._attr
        };

        return o;
    }
}
OrganizationUnit.TYPE.builder(OrganizationUnit);