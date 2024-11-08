import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {UserAccountUUID} from "../../UserAccount.js";
import {RoleUUID} from "./Role.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty, NodePropertyState,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {Auditable} from "../../../Auditable.js";
import {GlobalAccessControl} from "../rbac/GlobalAccessContol.js";
import {AccessAttribute, AccessAttributeMap} from "../AccessAttribute.js";

export interface UserGroupOptions {
    uuid?: string;
    name?: string;
    description?: string;
    members?: UserAccountUUID[];
    roles?: RoleUUID[];
    _attr?:AccessAttributeMap;
}


/**
 *
 */
export class UserGroup extends Auditable implements INode {


    static TYPE:NodeType = new NodeType(
        'user_group',
        NodeInternalType.USER_GROUP,
        [
            (new NodeProperty('uuid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty('name')).type(DbDataType.STRING),
            (new NodeProperty('description')).type(DbDataType.STRING).def(""),
            (new NodeProperty('members')).type(DbDataType.STRING).def([]),
            (new NodeProperty('roles')).type(DbDataType.STRING).def([]),
            (new NodeProperty('tags')).type(DbDataType.STRING).def([]),
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
        ]
    );

    __:NodeInternalType = NodeInternalType.USER_GROUP;

    public uuid: string;
    public name: string;
    public description: string;
    public members: UserAccountUUID[];
    public roles: RoleUUID[];

    public tags:TagUUID[];

    constructor( pOptions: Nullable<UserGroupOptions> = null) {
        super({});

        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.name = pOptions.name!;
            this.description = pOptions.description!;
            this.members = pOptions.members!;
            this.roles = pOptions.roles!;
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
        this.setAccessAttribute(GlobalAccessControl.attr.ORG);
        this.setAccessAttribute(GlobalAccessControl.attr.APP);
    }

    /**
     *
     * @param pOption
     */
    toJsonObject(pOption?: SerializeOptions): any {
        return {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            members: this.members,
            roles: this.roles,
            tags: this.tags
        };
    }
}