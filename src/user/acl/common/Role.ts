import {Access, AccessException} from "../Access.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodeType,
    RuntimeSecurityException,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {UserAccount} from "../../UserAccount.js";


export type RoleUUID = string;

export interface RoleOpts {
    uuid?:RoleUUID;
    name?:string;
    description?:string;
    permissions?:Access[];
    authorized?:string[];
    tags?:number[]
}

/**
 *
 */
export default class Role implements INode {


    static TYPE:NodeType = new NodeType(
        'role',
        NodeInternalType.ACL_ROLE,
        [
            (new NodeProperty('uuid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty('name')).type(DbDataType.STRING),
            (new NodeProperty('description')).type(DbDataType.STRING).def(""),
            (new NodeProperty('permissions')).type(DbDataType.STRING).def([]),
            (new NodeProperty('authorized')).type(DbDataType.STRING).def([])
        ]
    );

    __:NodeInternalType = NodeInternalType.ACL_ROLE;

    tags:TagUUID[] = [];

    private _uuid:RoleUUID = null;
    private _name:string ;
    private _description:string = "";
    private _permissions:Access[] = [];
    private _authorized:string[] = [];

    constructor( pOptions:Nullable<RoleOpts> = null) {
        if(pOptions!=null){
            this._uuid = pOptions.uuid!;
            this._name = pOptions.name!;
            this._description = pOptions.description!;
            this._permissions = pOptions.permissions!;
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

    toJsonObject():any {
        return {
            uuid:this._uuid,
            description:this._description,
            name:this._name,
            permissions:this._permissions,
        }

    }
}
