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
import {OrganizationUnit} from "./OrganizationUnit.js";
import {Avatar} from "@dexcalibur/dxc-orgs";
import {AccessAttribute, AccessAttributeMap} from "../user/acl/AccessAttribute.js";


export interface ApplicationUnitOptions {
    uuid?: string;
    name?: string;
    description?:string;
    packageID?: string;
    icon?: Nullable<Avatar>;
    sources?: string;
    _attr?:AccessAttributeMap;
}

export class ApplicationUnit extends Auditable implements INode {

    static TYPE:NodeType = (new NodeType( "application_unit", NodeInternalType.APP_UNIT, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("organization")).single(OrganizationUnit.TYPE),
        (new NodeProperty("packageID")).type(DbDataType.STRING).def(""),
        (new NodeProperty("sources")).type(DbDataType.STRING).def([]),
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

    __:NodeInternalType = NodeInternalType.APP_UNIT;

    uuid:string;
    name: string;
    description:string;
    packageID: string;
    icon: Nullable<Avatar>;
    sources: string;

    //os:OperatingSystem = null;


    tags:TagUUID[] = [];

    constructor(pOptions:Nullable<ApplicationUnitOptions>) {
        super({});

        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.name = pOptions.name!;
            this.description = pOptions.description!;
            this.packageID = pOptions.packageID!;
            this.icon = pOptions.icon!;
            this.sources = pOptions.sources!;
            this._attr = pOptions._attr!;
        }

    }

    getUID():string {
        return this.uuid;
    }


    /**
     * To init ACL attributes of ApplicationUnit instances
     *
     * Supported attributes:
     * - `OrganizationAccessControl.attr.APP_MEMBER`
     *
     * @return {void}
     * @method
     */
    initAccessAttributes(){
        this.setAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER);
    }


    toJsonObject(pOption?: SerializeOptions): any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            icon: this.icon,
            sources: this.sources,
            packageID: this.packageID,
        };

        return o;
    }
}
ApplicationUnit.TYPE.builder(ApplicationUnit);