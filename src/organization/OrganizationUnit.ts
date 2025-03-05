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
import {Connection, ConnectionUUID} from "./conn/Connection.js";
import {DeviceUUID} from "../Device.js";
import {DeviceTemplate, DeviceTemplateUUID} from "../device/template/DeviceTemplate.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {Secret, SecretProtectionType, SecretType, SecretUUID} from "../core/secrets/Secret.js";
import {AesKeyLength, CryptoUtils} from "../CryptoUtils.js";
import {ValidationRule} from "../Validator.js";
import {BusinessPlan} from "../billing/BusinessPlan.js";
import {AccessControlException} from "../errors/AccessControlException.js";
import Role from "../user/acl/common/Role.js";
import {GlobalAccessControl} from "../user/acl/rbac/GlobalAccessContol.js";
import {OrganizationManager} from "./OrganizationManager.js";

export type OrganizationUnitUUID = string;

export interface OrganizationUnitOptions {
    uuid?:string;
    name?:string;
    companyName?:string;
    description?:string;
    owner?:string;
    businessPlan?:BusinessPlan;
    members?:UserAccountUUID[];
    authModules?:AuthModule[];
    connections?:Connection[];
    devices?:DeviceUUID[];
    deviceTpls?:DeviceTemplateUUID[]
    tags?:TagUUID[];
    secrets?:Secret[];
    groups?:UserGroup[];
    _attr?:AccessAttributeMap;
}

export class OrganizationUnit extends Auditable implements INode {

    static SEED_SUID = '8162b327-e7a9-4342-a688-f515ae1c8664';
    static MK_SUID = '8162b327-e7a9-4342-a689-f515ae1c8664';

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        companyName: ValidationRule.utf8String(),
        packageID: ValidationRule.utf8String(),
        devices: ValidationRule.uuidList()
    }

    static TYPE:NodeType = (new NodeType( "organization_unit", NodeInternalType.ORG_UNIT, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("companyName")).type(DbDataType.STRING),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("owner")).type(DbDataType.STRING).def(null),
        (new NodeProperty("members")).type(DbDataType.STRING).def([]),
        (new NodeProperty("devices")).type(DbDataType.STRING).def([]),
        (new NodeProperty("businessPlan"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState) => {
                if(x.p==null) return null;

                return x.p.toJsonObject();
            })
            .wakeUp( (x:NodePropertyState) => {
                if(x.p==null) return null;

                /*const bp = BusinessPlan.fromJsonObject(x.p);
                bp.setWallet(x.p.wallet.map(p => {
                    return new Purchase(p);
                }));*/

                return BusinessPlan.fromJsonObject(x.p);
            })
            .def([]),
        (new NodeProperty("secrets"))
            .type(DbDataType.STRING)
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
                    return Secret.from(x);
                });
            })
            .def([]),
        (new NodeProperty("deviceTpls"))
            .type(DbDataType.STRING)
            .sleep( (x:NodePropertyState) => {
                if(x.p==null) return [];
                let o:any[] = [];
                x.p.map((s:any) => {
                    o.push(s.toJsonObject());
                });
                return o;
            })
            .wakeUp( (x:NodePropertyState) => {
                if(x.p==null) return [];
                return x.p.map((x:any) => {
                    return new DeviceTemplate(x);
                });
            })
            .def([]),
        (new NodeProperty("connections"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState) => {
                if(x.p==null) return [];
                let o:any[] = [];
                x.p.map((s:any) => {
                    o.push(s.toJsonObject({}, SecurityZone.PRIVATE));
                });
                return o;
            })
            .wakeUp( (x:NodePropertyState) => {
                if(x.p==null) return [];
                return x.p.map((x:any) => {
                    return new Connection(x);
                });
            })
            .def([]),
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
        (new NodeProperty("roles"))
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
                    return new Role(x);
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
                            type: x.p[k]._t
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
    connections: Connection[] = [];
    /**
     * Custom org-level user groups
     */
    groups:UserGroup[] = [];
    /**
     * Custom org-level roles
     */
    roles:Role[] = [];
    authModules: AuthModule[] = [];
    devices: DeviceUUID[] = [];
    secrets: Secret[] = [];
    businessPlan: Nullable<BusinessPlan> = null;
    deviceTpls: DeviceTemplate[] = [];

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
            this.businessPlan =  (pOptions.businessPlan!=null ? pOptions.businessPlan : null);
            this.connections =  (pOptions.connections!=null ? pOptions.connections : []);
            this.members = (pOptions.members!=null ? pOptions.members : []);
            this.devices = (pOptions.devices!=null ? pOptions.devices : []);
            this.groups = (pOptions.groups!=null ? pOptions.groups : []);
            this.secrets = (pOptions.secrets!=null ? pOptions.secrets : []);
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

    prepareKeyChain():void {

        try{
            this.getSecret(OrganizationUnit.SEED_SUID);
            // org key chain is ready

        }catch (e){

            // secret seed of org key chain is not initialized
            const seed = new Secret({
                uid: OrganizationUnit.SEED_SUID,
                name: 'ork_seed',
                description: "Organization root key seed",
                type: SecretType.IV
            });

            seed.writeSecretString(
                CryptoUtils.randomChunk(16).toString(),
                16
            );

            if(!this.isSecretUuidFree(seed.getUID())){
                throw OrganizationManagerException.SECRET_ALREADY_EXISTS(this.getUID(),seed.getUID());
            }

            this.secrets.push(seed);

            // secret master key of org key chain is not initialized
            const omk = new Secret({
                uid: OrganizationUnit.MK_SUID,
                name: 'omk',
                description: "Organization master key",
                type: SecretType.SECRET_KEY
            });

            const k = JSON.stringify(CryptoUtils.generateAesKey(AesKeyLength.AES256).export({format:'jwk'}));
            omk.writeSecretString(
                k, k.length
            );

            if(!this.isSecretUuidFree(omk.getUID())){
                throw OrganizationManagerException.SECRET_ALREADY_EXISTS(this.getUID(),omk.getUID());
            }

            this.secrets.push(omk);
        }
    }

    /*addRole(pUser:UserAccount):void {
        if(this.roles.indexOf(pUser.getUID())==-1){
            this.members.push(pUser.getUID());
        }
    }*/

    removeMember(pUser:UserAccount):void {
        // remove account from member list
        const uuid = pUser.getUID();
        this.members = this.members.filter(x => x!=uuid);

        // remove membership from account
        pUser.removeMembership(this.getUID());
    }

    getMemberPage(pOffset:number, pSize:number):UserAccountUUID[] {
        return this.members.slice(pOffset, pSize);
    }

    getAuthModules():AuthModule[] {
        return this.authModules;
    }

    getConnections():Connection[] {
        return this.connections;
    }

    addConnection(pConn:Connection, pUpdate = false):void {

        if(!pUpdate && !this.isConnUuidFree(pConn.getUID())){
            throw OrganizationManagerException.CONN_ALREADY_EXISTS(pConn.getUID());
        }

        this.connections.push(pConn);
    }

    removeConnection(pConnUID:ConnectionUUID):void {
        this.connections = this.connections.filter((vCon)=> {
            return vCon.getUID()!==pConnUID;
        });
    }

    removeUserGroup(pUserGrpUID:UserGroupUUID):void {
        this.groups = this.groups.filter((vUserGrp)=> {
            return vUserGrp.getUID()!==pUserGrpUID;
        });
    }

    removeSecret(pSecretUUID:SecretUUID):void {
        this.secrets = this.secrets.filter((vSecret)=> {
            console.log(vSecret.getUID(),pSecretUUID);
            return vSecret.getUID()!==pSecretUUID;
        });
    }

    getDevices():DeviceUUID[] {
        return this.devices;
    }

    getDeviceTemplate():any[] {
        return this.deviceTpls;
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
     * - `OrganizationAccessControl.attr.MEMBER_GRP`
     *
     * @return {void}
     * @method
     */
    initAccessAttributes(){
        // user list
        this.setAccessAttribute(OrganizationAccessControl.attr.MEMBER_GRP); // => list of UUIDs replaced by group MEMBER_GRP
        this.setAccessAttribute(OrganizationAccessControl.attr.OWNER);

        // useless ?
        this.setAccessAttribute(GlobalAccessControl.attr.ORG);

        // user group => replaced by membership ?
        this.setAccessAttribute(OrganizationAccessControl.attr.MEMBER_GRP);
    }

    toJsonObject(pOption?: SerializeOptions, pZone:SecurityZone = SecurityZone.PUBLIC): any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            companyName: this.companyName,
            owner: this.owner,
            tags: this.tags,
            devices: this.devices,
            authModules: [],
            groups: [],
            secrets: [],
            _attr: this._attr,
            businessPlan: (this.businessPlan!=null? this.businessPlan.toJsonObject() : null)
        };

        this.authModules.map(x => {
            o.authModules.push(x.getUID());
        });
        this.groups.map(x => {
            o.groups.push(x.toJsonObject({}, pZone));
        });

        this.secrets.map(x => {
            o.secrets.push(x.toJsonObject(pZone))
        })

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

    getConnection(pConnUUID: ConnectionUUID):Connection {
        const conn = this.connections.find((vConn)=>{ return (vConn.getUID()==pConnUUID)});

        if(conn==null){
            throw OrganizationManagerException.CONNECTION_NOT_FOUND(pConnUUID);
        }

        return conn;
    }

    getSecret(pSUID: SecretUUID):Secret {
        const secret = this.secrets.find((x)=>{ return (x.getUID()===pSUID)});

        if(secret==null){
            throw OrganizationManagerException.SECRET_NOT_FOUND(pSUID);
        }

        return secret;
    }

    readSecret(pUserAccount:UserAccount, pSUID: SecretUUID):Buffer {
        const secret = this.getSecret(pSUID);

        if(pSUID===OrganizationUnit.MK_SUID
            || pSUID===OrganizationUnit.SEED_SUID  ){
            return secret.readSecret(pUserAccount, {});
        }

        return secret.unwrap(pUserAccount, {
            [SecretProtectionType.ORG]: {
                key: this.getSecret(OrganizationUnit.MK_SUID),
                iv: this.getSecret(OrganizationUnit.SEED_SUID),
            }
        });
    }

    getSecrets():Secret[] {
        return this.secrets;
    }


    addSecret(pSecret:Secret, pUpdate = false):void {

        if(!pUpdate && !this.isSecretUuidFree(pSecret.getUID())){
            throw OrganizationManagerException.SECRET_ALREADY_EXISTS(this.getUID(),pSecret.getUID());
        }

        // store wrapped secret
        this.secrets.push(pSecret.addProtection(
            SecretProtectionType.ORG,
            {
                key: this.getSecret(OrganizationUnit.MK_SUID),
                iv: this.getSecret(OrganizationUnit.SEED_SUID),
            }
        ));


    }

    isConnUuidFree(pUUID: ConnectionUUID):boolean {

        for(let k=0; k<this.connections.length; k++){
            if(this.connections[k].getUID()==pUUID){
                return false;
            }
        }
        return true;
    }

    isSecretUuidFree(pSUID: SecretUUID):boolean {

        for(let k=0; k<this.secrets.length; k++){
            if(this.secrets[k].getUID()==pSUID){
                return false;
            }
        }
        return true;
    }

    attachDevice(pDeviceUID: DeviceUUID) {
        if(this.devices.indexOf(pDeviceUID)==-1){
            this.devices.push(pDeviceUID);
        }
    }

    detachDevice(pDeviceUID: DeviceUUID) {
        this.devices = this.devices.filter(x => (x!==pDeviceUID));
    }

    hasDevice(pDeviceUUID: DeviceUUID) {
        return (this.devices.indexOf(pDeviceUUID)>-1);
    }

    getBusinessPlan():BusinessPlan {
        if(this.businessPlan==null){
            throw OrganizationManagerException.MISSING_BUSINESS_PLAN(this.getUID());
        }

        return this.businessPlan;
    }

    setBusinessPlan(pPlan:BusinessPlan):void {
        this.businessPlan = pPlan;
    }

    /**
     * To check if specified user account is a member of this organization
     * and if the user is a part of some specified groups
     *
     * @param pAccount
     * @param {UserGroupUUID[]}  pGroups Required user groups
     * @returns {UserGroupUUID[]} Matching groups
     */
    searchMatchingUserGroups(pAccount:UserAccount, pGroups:UserGroupUUID[]):UserGroupUUID[]{
        // check user membership
        if(!pAccount.isMemberOf(this.getUID())){
            return [];
            // throw OrganizationManagerException.NOT_A_MEMBER(pAccount.username, this.getUID());
        }

        // check groups
        const membership = pAccount.getMembership(this.getUID());
        if(membership.groups==null){ return []; }

        let result:UserGroupUUID[] = [];
        membership.groups.map(vGrp => {
            if(pGroups.indexOf(vGrp)>-1){
                result.push(vGrp);
            }
        });

        return result;
    }

    /**
     * To check if specified user account is a member of this organization
     * and if the user is a part of some specified groups
     *
     * @param pAccount
     * @param {UserGroupUUID[]}  pGroups Required user groups
     * @returns {UserGroupUUID[]} Matching groups
     */
    isAuthorizedByAttrGrp(pAccount:UserAccount, pAttrGrps:AccessAttribute<any>[]):UserGroupUUID[]{
        // check user membership
        if(!pAccount.isMemberOf(this.getUID())){
            return [];
            // throw OrganizationManagerException.NOT_A_MEMBER(pAccount.username, this.getUID());
        }

        // check groups
        const membership = pAccount.getMembership(this.getUID());
        if(membership.groups==null){ return []; }

        const requiredGrps:UserGroupUUID[] = [];

        // retrieve usergroup from attributes of this instance
        pAttrGrps.map(vAttr => {
            const att = this.getAccessAttribute(vAttr);
            if(att.is(NodeInternalType.USER_GROUP)){
                requiredGrps.push(this.getAccessAttribute(vAttr).value[0]);
            }
        });

        // check if the user membership contains accesses to at least one of these groups
        let result:UserGroupUUID[] = [];
        membership.groups.map(vGrp => {
            if(requiredGrps.indexOf(vGrp)>-1){
                result.push(vGrp);
            }
        });

        if(result==null){
            throw AccessControlException.NOT_AUTHORIZED_BY_GRP(pAttrGrps,pAccount);
        }
        return result;
    }

    /**
     * If it returns FALSE the check is aborted, else it continues
     *
     * @param pAccount
     * @param pAttrGrps
     */
    override __beforeAuthorizationCheck(pAccount:UserAccount, pAttrGrps:AccessAttribute<any>[]):boolean{
        // check user membership
        if(!pAccount.isMemberOf(this.getUID())){
            return false;
            // throw OrganizationManagerException.NOT_A_MEMBER(pAccount.username, this.getUID());
        }else{
            return true;
        }
    }

    getRoles():Role[] {
        if(this.roles==null){
            this.roles = [];
        }

        return this.roles;
    }

    getUserGroups():UserGroup[] {
        if(this.groups==null){
            this.groups = [];
        }

        return this.groups;
    }

    getUserGroupByName(pName:string):UserGroup {
        const res = this.groups.filter(g => g.name===pName);

        if(res.length>1){
            throw OrganizationManagerException.DUPLICATED_GRP_NAME(this.getUID(),pName);
        }

        if(res.length==0){
            throw OrganizationManagerException.MISSING_GRP_BYNAME(this.getUID(),pName);
        }

        return res[0];
    }
}
OrganizationUnit.TYPE.builder(OrganizationUnit);