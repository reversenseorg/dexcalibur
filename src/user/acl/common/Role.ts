import {Access} from "../Access.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {UserAccount, UserAccountType} from "../../UserAccount.js";
import {OrganizationUnitUUID} from "../../../organization/OrganizationUnit.js";
import {SecurityZone} from "../../../security/SecurityZone.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";

export type RoleUUID = string;

export interface RoleOpts {
    uuid?:RoleUUID;
    name?:string;
    description?:string;
    permissions?:Access[];
    authorized?:string[];
    orgUnit?:Nullable<OrganizationUnitUUID>;
    tags?:number[]
}

/**
 *
 */
export default class Role implements INode {

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        description: ValidationRule.utf8String(),
        orgUnit: ValidationRule.uuid()
    }


    static TYPE:NodeType = new NodeType(
        'role',
        NodeInternalType.ACL_ROLE,
        [
            (new NodeProperty('uuid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty('name')).type(DbDataType.STRING),
            (new NodeProperty('description')).type(DbDataType.STRING).def(""),
            (new NodeProperty('permissions')).type(DbDataType.STRING).def([]),
            (new NodeProperty('authorized')).type(DbDataType.STRING).def([]),
            (new NodeProperty('orgUnit')).type(DbDataType.STRING).def(null),
        ]
    );

    __:NodeInternalType = NodeInternalType.ACL_ROLE;

    tags:TagUUID[] = [];

    private _uuid:RoleUUID = null;
    private _name:string ;
    private _description:string = "";
    private _permissions:Access[] = [];
    private _authorized:string[] = [];
    private _orgUnit:Nullable<OrganizationUnitUUID> = null;


    constructor( pOptions:Nullable<RoleOpts> = null) {
        if(pOptions!=null){
            this._uuid = pOptions.uuid!;
            this._name = pOptions.name!;
            this._description = pOptions.description!;
            this._permissions = (pOptions.permissions!=null? pOptions.permissions : []);
            this._authorized = (pOptions.authorized!=null? pOptions.authorized : []);
            this._orgUnit = pOptions.orgUnit!;
        }
    }

    getUID(): RoleUUID | null {
        return this._uuid;
    }

    get uid(): string {
        return this._uuid;
    }

    set uid(value: string) {
        this._uuid = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get access(): Access[] {
        return this._permissions;
    }

    set access(value: Access[]) {
        this._permissions = value;
    }


    get orgUnit(): string {
        return this._orgUnit;
    }

    set orgUnit(value: string) {
        this._orgUnit = value;
    }

    addAccess(pAccess:Access):void {
        this._permissions.push(pAccess);
    }

    hasAccess(pAccess:Access):boolean {
        return (this._permissions.find(x => (x.name===pAccess.name))!=null)
    }

    grant(pAccount:UserAccount){
        if(this._authorized.indexOf(pAccount.getUID())==-1){
            this._authorized.push(pAccount.getUID());
        }
    }

    isAuthorized(pAccount:UserAccount):boolean {
        return (this._authorized.indexOf(pAccount.getUID())>-1);
    }

    isGeneric():boolean {
        return (this._orgUnit===null || this._orgUnit===undefined);
    }

    hasOrg(pOrg:OrganizationUnitUUID):boolean {
        return (this._orgUnit===pOrg);
    }

    toJsonObject(pOpts?:SerializeOptions, pZone = SecurityZone.PUBLIC):any {
        return {
            uuid:this._uuid,
            description:this._description,
            name:this._name,
            permissions:this._permissions,
            authorized: (pZone==SecurityZone.PUBLIC ? null : this._authorized),
            orgUnit: (pZone==SecurityZone.PUBLIC ? null : this._orgUnit),
        }

    }
}
Role.TYPE.builder(Role);