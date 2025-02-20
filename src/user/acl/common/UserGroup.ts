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
import {SecurityZone} from "../../../security/SecurityZone.js";
import {ValidationRule} from "../../../Validator.js";

export type UserGroupUUID = string;
export interface UserGroupOptions {
    uuid?: UserGroupUUID;
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

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        description: ValidationRule.utf8String(),
        members: ValidationRule.uuidList(),
        roles: ValidationRule.uuidList()
    }

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
        ]
    );

    __:NodeInternalType = NodeInternalType.USER_GROUP;

    public uuid: UserGroupUUID;
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
            this.members = (pOptions.members!=null? pOptions.members : []);
            this.roles = (pOptions.roles!=null? pOptions.roles : []);
            this._attr = pOptions._attr!;

        }
    }

    getUID():UserGroupUUID {
        return this.uuid;
    }

    setUID(pUUID:UserGroupUUID):void {
        this.uuid = pUUID;
    }

    addRole(pRoleUID:RoleUUID):void {
        if(this.roles.indexOf(pRoleUID) == -1){
            this.roles.push(pRoleUID);
        }
    }

    addMember(pAccUID:UserAccountUUID):void {
        if(this.members.indexOf(pAccUID) == -1){
            this.members.push(pAccUID);
        }
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
     * @param pData
     * @returns {string[]} List of updated properties
     */
    update(pData:UserGroupOptions):string[]{
        const modified:string[] = [];
        if(pData.name){this.name = pData.name; modified.push('name'); }
        if(pData.description){ this.description = pData.description; modified.push('description'); }
        if(pData.roles){ this.roles = pData.roles; modified.push('roles'); }
        if(pData.members){ this.members = pData.members; modified.push('members'); }
        return modified;
    }
    /**
     *
     * @param pOption
     */
    toJsonObject(pOption?: SerializeOptions, pZone = SecurityZone.PUBLIC): any {
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