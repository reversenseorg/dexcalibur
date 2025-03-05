import {Person} from "./Person.js";
import {createHash, randomUUID} from "crypto";
import {AuthCode, AuthenticationException} from "./auth/AuthTypes.js";
import {ProjectURI} from "../project/ProjectGlobalUID.js";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {IPersistent} from "../persist/orm/IPersistent.js";
import {INode, NodeProperty, NodeType, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import Util from "../Utils.js";
import {IStringIndex} from "../core/IStringIndex.js";
import {AclAttributeTree} from "./acl/Access.js";
import Role, {RoleUUID} from "./acl/common/Role.js";
import {SecurityZone} from "../security/SecurityZone.js";
import {OrganizationUnit, OrganizationUnitUUID} from "../organization/OrganizationUnit.js";
import {CryptoUtils} from "../CryptoUtils.js";
import {ValidationRule} from "../Validator.js";
import {UserAccountAction, UserAccountEvent, UserAccountHelper} from "./UserAccountEvent.js";
import {RuntimeSecurityException} from "../errors/RuntimeSecurityException.js";
import {User} from "../User.js";
import {Token, TokenOptions, TokenPurpose} from "../core/secrets/Token.js";
import {UserServiceException} from "../errors/UserServiceException.js";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {UserGroup, UserGroupUUID} from "./acl/common/UserGroup.js";

export interface Membership {
    locked: boolean,
    _lockDate: number,
    activated: boolean
    _activateDate: number,
    preferences: any,
    roles?:RoleUUID[];
    groups?:UserGroupUUID[];
    //bookmarks: any,
    //requests: any
    [ppt:string]:any
}

export enum UserAccountType {
    LOCAL='local',
    FEDERATED='federated',
    UNKNOWN="unknown"
}
export type UserAccountUUID = string;

export interface UserAccountOptions extends IStringIndex<any> {
     _uid?:UserAccountUUID,
     _person?: Person,
     _roles?:RoleUUID[],
     _username?:string,
     _password?:string,
     _salt?:string,
     _padding?:string,
     _time?:string,
     _locked?:boolean,
    _activated?:number,
    _email?:string,
    _type?:UserAccountType;
    _membership?:Record<OrganizationUnitUUID, Membership>;
    _authorized_ips?:string[],
    _tokens?:Token<any>[],
    _projects?:ProjectURI[],
    _history?:UserAccountEvent[],
    _orgs?:OrganizationUnitUUID[],
    _groups?:UserGroupUUID[],
    _extra?:Record<string, any>
}

export const UA_UUID_SEP = ':';


export class UserAccount implements IPersistent, INode {

    static VALIDATE:Record<string, ValidationRule> = {
        _type: ValidationRule.newPinklistAssert([ UserAccountType.LOCAL, UserAccountType.FEDERATED ]),
        _uid: ValidationRule.prefixedUuid("([0-9]"+UA_UUID_SEP+")?"),
        _roles: ValidationRule.asArrayOf([ValidationRule.uuid()]),
        _username: ValidationRule.utf8String(),
        _orgs: ValidationRule.uuid(),
        _email:ValidationRule.email(),
        _extra:ValidationRule.structure({
            avatar: {
                color1: ValidationRule.hexColor(),
                color2: ValidationRule.hexColor()
            }
        })
    }

    static TYPE:NodeType = new NodeType(
        'accounts',
        NodeInternalType.USER_ACCOUNT,
        []
    );
    __:NodeInternalType = NodeInternalType.USER_ACCOUNT;

    private _uid:UserAccountUUID;
    private _person: Person;

    private _roles:RoleUUID[] = [];
    private _username:string;
    private _email:string;
    private _password:string;
    private _salt:string;
    private _padding:string;
    private _time:string;
    private _authorized_ips:string[] = [];
    private _type:UserAccountType = UserAccountType.LOCAL;
    private _locked:boolean = false;
    private _membership:Record<OrganizationUnitUUID,Membership> = {};
    private _orgs:OrganizationUnitUUID[] = [];
    private _activated:number = -1;
    private _history:UserAccountEvent[] =[];
    private _tokens:Token<any>[] =[];
    private _extra:Record<string, any> = {};
    /**
     * Server-level user groups
     * @private
     */
    private _groups:UserGroupUUID[] = [];
    private _attrs:any = {};

    tags:number[] = [];

    /**
     * Projects
     */
    private _projects:ProjectURI[] = [];

    static generateUsername():string {
        return randomUUID()
    }

    constructor(pConfig:UserAccountOptions = {}) {
        if(pConfig != null){
            for(let i in pConfig) this[i] = pConfig[i];
        }
        // TODO : replace by uuid
        if(this._uid==null && this._username!=null){
            this._uid = this._username;
        }
    }

    /**
     * To init a user account when it is created
     * @param pUUID
     */
    init(pUUID:UserAccountUUID):void {
        this._uid = pUUID;
        if(this._history==null) this._history = [];

        this._history.push(UserAccountHelper.event(UserAccountAction.CREATE));
        this._type = UserAccountType.UNKNOWN;
    }

    setUID(pUUID:UserAccountUUID):void {
        this._uid = pUUID;
    }

    getActivatedDate():number {
        return this._activated;
    }

    getHistory():any[] {
        return this._history;
    }


    get person(): Person {
        return this._person;
    }

    set person(value: Person) {
        this._person = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get salt(): string {
        return this._salt;
    }

    set salt(value: string) {
        this._salt = value;
    }

    get padding(): string {
        return this._padding;
    }

    set padding(value: string) {
        this._padding = value;
    }

    get time(): string {
        return this._time;
    }

    set time(value: string) {
        this._time = value;
    }

    set locked(value: boolean) {
        this._locked = value;
    }

    getEmail(){
        return this._email;
    }


    getType():UserAccountType {
        return this._type;
    }

    setType( pType:UserAccountType):void {
        this._type = pType;
    }

    getRoles():RoleUUID[] {
        return this._roles;
    }

    isLocked():boolean {
        return this._locked;
    }

    lock():void {
        this._locked = true;
    }

    activate():void {
        this._activated = (new Date()).getTime();
    }

    unlock():void {
        this._locked = false;
    }

    hasUsername(pUsername:string):boolean {
        return (this._username === pUsername);
    }


    getUID():UserAccountUUID {
        return this._uid; //username;
    }

    /**
     * To compare two user account
     *
     * @param pAccount
     */
    is( pAccount:UserAccount):boolean {
        // TODO : replace by uid
        return (this._username===pAccount.username) && (this._password===pAccount.password);
    }

    uuidEquals( pUnsafe:UserAccountUUID):boolean {
        return CryptoUtils.stringEqual(this.getUID(), pUnsafe);
    }

    passwordEquals( pUnsafe:string):void {
        // add padding
        let pwd:string = pUnsafe;
        if(pwd.length < 16){
            pwd = pwd+this.padding;
        }

        // scramble with random salt
        let j =0 ;
        for(let i=0; i<4; i++){
            pwd = pwd.split('').map( c =>  String.fromCharCode(c.charCodeAt(0) ^ this.salt[(j++<<i)%this.salt.length].charCodeAt(0)) ).join('');
            j++;
        }

        // hash
        let hash = createHash('sha256');
        hash.update(pwd);

        if(hash.digest('hex')!==this.password){
            throw new AuthenticationException("Password are differents", AuthCode.INVALID_PASSWORD);
        }
    }

    newPassword( pPwd:string):void {

        //
        this.padding = Util.randString(16,Util.ALPHANUM);
        this.salt = Util.randString(8,Util.ALPHANUM)+Util.randString(8,Util.ALPHANUM);

        // add padding
        let pwd:string = pPwd;
        if(pwd.length < 16){
            pwd = pwd+this.padding;
        }

        // scramble with random salt
        let j =0 ;
        for(let i=0; i<4; i++){
            pwd = pwd.split('').map( c =>  String.fromCharCode(c.charCodeAt(0) ^ this.salt[(j++<<i)%this.salt.length].charCodeAt(0)) ).join('');
            j++;
        }

        // hash
        let hash = createHash('sha256');
        hash.update(pwd);

        this.password = hash.digest('hex')
    }

    addOwnedProject( pProjectURI:ProjectURI ):void {
        let e:boolean = false;
        this._projects.map( (vProj:ProjectURI) => {
            if(vProj.equals(pProjectURI)) e = true;
        })
        if(!e){
            this._projects.push(pProjectURI);
        }
    }

    getActiveProjects():ProjectURI[] {
        return this._projects;
    }

    getAclAttributes(): AclAttributeTree {
        return {};
    }

    isActive():boolean {
        return (this._activated > 0);
    }

    /**
     * To list project viewable / auditable / owned
     *
     * @param pEngine
     */
    async listProjects( pEngine:IDexcaliburEngine):Promise<string[]> {
        const l = await pEngine.listProjectsOf(this);
        let out:string[] = [];
        for(const i in l){
            out.push(i);
        }
        return out;
    }

    addRole(pRole:Role):void {
        if(this._roles.indexOf(pRole.getUID())==-1){
            this._roles.push(pRole.getUID());
        }
    }

    getAuthorizedIPs():string[] {
        return this._authorized_ips;
    }

    addAuthorizedIP( pIpAddress:string):void {
        if(this._authorized_ips.indexOf(pIpAddress)==-1){
            this._authorized_ips.push(pIpAddress);
        }
    }

    isIpAuthorized( pIpAddress:string):boolean {
        // TODO : format ip address ?
        return (this._authorized_ips.indexOf(pIpAddress)>-1);
    }

    getOrgUnits():OrganizationUnitUUID[] {
        return this._orgs;
    }

    addOrganization(pOrg:OrganizationUnit):void {
        if(this._orgs==null){
            this._orgs = [];
        }

        this._orgs.push(pOrg.getUID());
    }

    /**
     * To update an account with unsafe data
     * It enforces validation of updatable property and values
     *
     * @param {Record<string, any>} pUnsafeData
     */
    updateUnsafe(pUnsafeData:Record<string, any>):string[] {
        const authorized:Record<string, ValidationRule|boolean> = {};
        const changes:string[] = [];

        // prepare validation
        [
            UserAccount.TYPE.getProperty('_extra')
        ].map(x => {
            if(x._val.length>0){
                authorized[ x.getName() ] = (x._val[0] as any);
            }else{
                authorized[ x.getName() ] = true;
            }
        });


        for(let k in pUnsafeData){
            if(authorized[k] === undefined){
                throw RuntimeSecurityException.SAFETY_CHECK_FAILED("[field="+k+"] unauthorized field");
            }

            if(authorized[k]===true){
                // TODO :no validation check  DANGER !!!
                this[k] = pUnsafeData[k];
                changes.push(k);
            }else{

                if((authorized[k] as ValidationRule).test(pUnsafeData[k])){
                    this[k] = pUnsafeData[k];
                    changes.push(k)
                }else{
                    throw RuntimeSecurityException.SAFETY_CHECK_FAILED("[field="+k+"] invalid value");
                }
            }
        }

        return changes;
    }

    toJsonObject(pOption?: SerializeOptions, pZone?:SecurityZone): any {
        let o:any = {};

        o._uid = this.getUID();
        o._person = (this._person!=null ? this.person : null);
        o._roles = this._roles;
        o._username = this._username;
        o._time = this._time;
        o._locked = this._locked;
        o._type = this._type;
        o._orgs = this._orgs;
        o._history = this._history;
        o._activated = this._activated;
        o._membership = this._membership;
        o._extra = this._extra;

        //if(pZone==SecurityZone.PRIVATE){
            o._authorized_ips = this._authorized_ips;
        //}


        return o;
    }

    /**
     * To add a token to this account.
     *
     * Token are useful to add a manual step (such as email verifying, of MFA)
     * in a validation workflow
     *
     * @param {TokenOptions} pTokenOpts
     * @returns {void}
     * @method
     * @since 1.5.0
     */
    addVerifyToken(pTokenOpts: TokenOptions<any>, pExtra:any = null) {
        this._tokens.push({
            token: pTokenOpts.token,
            purpose: pTokenOpts.purpose,
            ttl: pTokenOpts.ttl,
            date: Util.time(),
            extra: pExtra
        });
    }

    /**
     * To verify is a token match a valid token associated to this account.
     *
     * This method verify the value AND is the token is not expired
     *
     * @param {string} pToken
     * @param {TokenPurpose} pPurpose
     * @returns {Nullable<Token>} The matching token object or NULL
     * @method
     * @since 1.5.0
     */
    verifyToken<T>(pToken:string, pPurpose:TokenPurpose):Nullable<Token<T>>{
        const match = this._tokens.find((vToken)=>{
            return CryptoUtils.stringEqual(vToken.token,pToken) && (vToken.purpose===pPurpose);
        });

        if(match==null || ((Util.time()-match.date) > (match.ttl*1000)) ){
            // flush expired token
            this._tokens = this._tokens.filter((vTok)=>{
                return ((Util.time()-vTok.date) < (vTok.ttl*1000));
            });
            return null;
        }else{
            // flush all token with same purpose and expired tokens
            this._tokens = this._tokens.filter((vTok)=>{
                return (vTok.purpose!=pPurpose) && ((Util.time()-vTok.date) < (vTok.ttl*1000));
            });
            return match;
        }
    }

    getMembership(pOUID:OrganizationUnitUUID):Nullable<Membership> {
        return this._membership[pOUID];
    }

    isLockedByOrg(pOUID:OrganizationUnitUUID):boolean {
        if(this._membership[pOUID]!=null){
            return this._membership[pOUID].locked;
        }else{
            throw UserServiceException.MISSING_MEMBERSHIP(this.getUID(),pOUID,'is-locked-by-org');
        }
    }

    isActiveByOrg(pOUID:OrganizationUnitUUID):boolean {
        if(this._membership[pOUID]!=null){
            return this._membership[pOUID].activated;
        }else{
            throw UserServiceException.MISSING_MEMBERSHIP(this.getUID(),pOUID,'is-activated-by-org');
        }
    }

    addMembership( pOUID:OrganizationUnitUUID, pMembership:Membership):void{
        this._membership[pOUID] = pMembership;
    }

    removeMembership(pOUID:OrganizationUnitUUID){
        delete this._membership[pOUID];
    }

    isMemberOf(pOUID:OrganizationUnitUUID):boolean {
        return (this._membership[pOUID]!=null);
    }

    updateRoles(pRoles: RoleUUID[]) {
        this._roles = pRoles;
    }

    updateMembershipRoles(pOUID:OrganizationUnitUUID, pRoles: RoleUUID[]) {
        if(this._membership[pOUID]==null){
            throw OrganizationManagerException.NOT_A_MEMBER(this.getUID(), pOUID);
        }
        this._membership[pOUID].roles = pRoles;
    }

    getMembershipRoles(pOUID:OrganizationUnitUUID ):RoleUUID[] {
        if(this._membership[pOUID]==null){
            throw OrganizationManagerException.NOT_A_MEMBER(this.getUID(), pOUID);
        }

        if( this._membership[pOUID].roles!=null
            && Array.isArray(this._membership[pOUID].roles)){

            return  this._membership[pOUID].roles;
        }else{
            return [];
        }
    }

    getUserGroups():UserGroupUUID[] {
        return this._groups;
    }

    addGroup( pGUID:UserGroupUUID):void{
        // avoid duplicated entries
        if(this._groups.indexOf(pGUID)==-1){
            this._groups.push(pGUID);
        }
    }

    removeGroup(pGUID:UserGroupUUID){
        this._groups = this._groups.filter(x => x!==pGUID);
    }

    getMemberships():Record<OrganizationUnitUUID,Membership> {
        return this._membership;
    }
}

UserAccount.TYPE.builder(UserAccount);