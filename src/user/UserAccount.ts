import {Person} from "./Person.js";
import {createHash} from "crypto";
import {AuthCode, AuthenticationException} from "./auth/AuthTypes.js";
import {UserRole} from "./acl/rbac/UserRole.js";
import AccessControl from "./acl/AccessControl.js";
import {ProjectURI} from "../project/ProjectGlobalUID.js";
import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {IPersistent} from "../persist/orm/IPersistent.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {NodeInternalType} from "../NodeInternalType.js";
import Util from "../Utils.js";
import {IStringIndex} from "../core/IStringIndex.js";


export interface UserAccountOptions extends IStringIndex<any> {
     _uid?:string,
     _person?: Person,
     _role?:UserRole,
     _username?:string,
     _password?:string,
     _salt?:string,
     _padding?:string,
     _time?:string,
     _locked?:boolean,
    _projects?:ProjectURI[]
}

export class UserAccount implements IPersistent{

    static TYPE:NodeType = new NodeType(
        'user',
        NodeInternalType.USER_ACCOUNT,
        [
            /*(new NodeProperty('_uid')).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty('_time')).type(DbDataType.STRING),
            (new NodeProperty('_username')).type(DbDataType.STRING).notnull().unique(),
            (new NodeProperty('_password')).type(DbDataType.STRING).notnull(),
            (new NodeProperty('_salt')).type(DbDataType.STRING).notnull(),
            (new NodeProperty('_locked')).type(DbDataType.BOOLEAN).def(false),
            (new NodeProperty('_padding')).type(DbDataType.STRING).notnull(),
            (new NodeProperty('_person')).volatile().type(DbDataType.STRING),
            (new NodeProperty('_role')).type(DbDataType.STRING)
                .sleep( (x:NodePropertyState) => { return (x.p !=null ? x.p.uid : null) ; } )
                .wakeUp( (x:NodePropertyState) => { return (x.p!=null ? AccessControl.getRole(x.p) : null) }),*/
        ]
    );
    __:NodeInternalType = NodeInternalType.USER_ACCOUNT;

    private _uid:string;
    private _person: Person;
    private _role:UserRole;
    private _username:string;
    private _password:string;
    private _salt:string;
    private _padding:string;
    private _time:string;
    private _locked:boolean = false;

    /**
     * Projects
     */
    private _projects:ProjectURI[] = [];


    constructor(pConfig:UserAccountOptions = {}) {
        if(pConfig != null){
            for(let i in pConfig) this[i] = pConfig[i];
        }
        // TODO : replace by uuid
        if(this._uid==null && this._username!=null){
            this._uid = this._username;
        }
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

    get role(): string {
        if(this._role != null)
            return this._role.name;
        else
            return null;
    }

    set role(value: string) {
        this._role = AccessControl.getRole(value);
    }

    setUserRole( pRole:UserRole): UserAccount {
        this._role = pRole;
        return this;
    }

    getUserRole( ):UserRole {
        return this._role;
    }

    isLocked():boolean {
        return this._locked;
    }

    lock():void {
        this._locked = true;
    }


    unlock():void {
        this._locked = false;
    }

    hasUsername(pUsername:string):boolean {
        return (this._username === pUsername);
    }


    getUID():string {
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

    /**
     * To list project viewable / auditable / owned
     *
     * @param pEngine
     */
    listProjects( pEngine:IDexcaliburEngine):string[] {
        const l = pEngine.listProjectsOf(this);
        let out:string[] = [];
        for(const i in l){
            out.push(i);
        }
        return out;
    }
}

UserAccount.TYPE.builder(UserAccount);