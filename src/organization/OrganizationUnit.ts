import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../Auditable.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {AccessAttribute, AccessAttributeMap} from "../user/acl/AccessAttribute.js";
import {AuthModule, AuthModuleType} from "../user/auth/AuthModule.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {AuthModuleFactory} from "../user/auth/AuthModuleFactory.js";
import {randomUUID} from "crypto";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {UserGroup, UserGroupUUID} from "../user/acl/common/UserGroup.js";

export type OrganizationUnitUUID = string;

export interface OrganizationUnitOptions {
    uuid?:string;
    name?:string;
    companyName?:string;
    description?:string;
    owner?:string;
    members?:UserAccountUUID[];
    authModules?:AuthModule[];
    tags?:TagUUID[];
    groups?:UserGroup[];
    _attr?:AccessAttributeMap;
}

export class OrganizationUnit extends Auditable implements INode {

    static TYPE:NodeType = (new NodeType( "organization_unit", NodeInternalType.ORG_UNIT, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("companyName")).type(DbDataType.STRING),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("owner")).type(DbDataType.STRING).def(null),
        (new NodeProperty("members")).type(DbDataType.STRING).def([]),
        (new NodeProperty("groups"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState) => {
                if(x.p==null) return [];
                let o:any[] = [];
                x.p.map((s:any) => {
                    o.push(s.toJsonObject(SecurityZone.PRIVATE));
                });
                return o;
            })
            .wakeUp( (x:NodePropertyState) => {
                if(x.p==null) return [];

                return x.p.map((x:any) => {
                    return new UserGroup(x);
                });
            })
            .def([]),
        (new NodeProperty("authModules"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState) => {
                if(x.p==null) return [];
                let o:any[] = [];
                x.p.map((s:any) => {
                    o.push(s.toJsonObject(SecurityZone.PRIVATE));
                });
                return o;
            })
            .wakeUp( (x:NodePropertyState) => {
                console.log(x.p);

                if(x.p==null) return [];

                return x.p.map((x:any) => {
                    return AuthModuleFactory.from(x);
                });
            })
            .def(null),
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
    ]));

    __:NodeInternalType = NodeInternalType.ORG_UNIT;

    uuid:OrganizationUnitUUID;
    name: string;
    companyName: string;
    description:string;
    owner:string;
    members:UserAccountUUID[] = [];
    groups:UserGroup[] = [];
    authModules: AuthModule[] = [];

    tags:TagUUID[] = [];

    constructor(pOptions:Nullable<OrganizationUnitOptions>) {
        super({});


        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.name = pOptions.name!;
            this.companyName = pOptions.companyName!;
            this.description = pOptions.description!;
            this.owner = pOptions.owner!;
            this.tags = pOptions.tags!;
            this.authModules =  (pOptions.authModules!=null ? pOptions.authModules : []);
            this.members = (pOptions.members!=null ? pOptions.members : []);
            this.groups = (pOptions.groups!=null ? pOptions.groups : []);
            this._attr = (pOptions._attr!=null ? pOptions._attr : {});
        }

    }

    getUID():string {
        return this.uuid;
    }

    addAuthModule(pModule:AuthModule):string {
        if(pModule.getUID()==null){
            const used = this.authModules.map(x => x.getUID());
            let freshUUID:string;
            do{
                freshUUID = randomUUID();
            }while(used.indexOf(freshUUID) > -1)
            pModule.setUID(freshUUID);
        }
        this.authModules.push(pModule);
        return pModule.getUID();
    }

    addMember(pUser:UserAccount):void {
        if(this.members.indexOf(pUser.getUID())==-1){
            this.members.push(pUser.getUID());
        }
    }

    addUserGroup(pGrp:UserGroup):void {
        if(this.getUserGroup(pGrp.getUID())==null){
            this.groups.push(pGrp);
        }
    }

    hasMember(pUserUID:UserAccountUUID):boolean {
        return (this.members.indexOf(pUserUID)>-1);
    }

    /*addRole(pUser:UserAccount):void {
        if(this.roles.indexOf(pUser.getUID())==-1){
            this.members.push(pUser.getUID());
        }
    }*/

    removeMember(pUser:UserAccount):void {
        const uuid = pUser.getUID();
        this.members = this.members.filter(x => x!=uuid);
    }

    getMemberPage(pOffset:number, pSize:number):UserAccountUUID[] {
        return this.members.slice(pOffset, pSize);
    }

    getAuthModules():AuthModule[] {
        return this.authModules;
    }

    getAuthModuleByType(pType:AuthModuleType):AuthModule {
        return this.authModules.find(x => x.type===pType);
    }

    getAuthModuleByUUID(pUUID:string):Nullable<AuthModule> {
        return this.authModules.find(x => x.getUID()===pUUID);
    }

    countMembers():number {
        return this.members.length;
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

    toJsonObject(pOption?: SerializeOptions, pZone:SecurityZone = SecurityZone.PUBLIC): any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            companyName: this.companyName,
            owner: this.owner,
            tags: this.tags,
            authModules: [],
            groups: [],
            _attr: this._attr
        };

        this.authModules.map(x => {
            o.authModules.push(x.getUID());
        });
        this.groups.map(x => {
            o.groups.push(x.toJsonObject({}, pZone));
        });

        return o;
    }

    hasUserGroup(pGrpUUID: UserGroupUUID) {
        for(let i=0; this.groups.length; i++ ){
            if(this.groups[i].getUID()===pGrpUUID.trim()){
                return true;
            }
        }
        return false;
    }

    getUserGroup(pUUID:UserGroupUUID):Nullable<UserGroup> {
        return this.groups.find(x => x.getUID()===pUUID);
    }

    hasLocalAuth() {
        return (this.authModules.filter(x => (x.type===AuthModuleType.LOCAL_PASSWD)).length>0);
    }

    getLocalAuth():AuthModule[] {
        return (this.authModules.filter(x => (x.type===AuthModuleType.LOCAL_PASSWD)));
    }
}
OrganizationUnit.TYPE.builder(OrganizationUnit);