import {Person} from "./Person";
import {createHash} from "crypto";
import {AuthCode, AuthenticationException} from "./auth/AuthTypes";
import {UserRole} from "./acl/rbac/UserRole";
import AccessControl from "./acl/AccessControl";
import {ProjectURI} from "../project/ProjectGlobalUID";
import DexcaliburProject from "../DexcaliburProject";
import DexcaliburEngine from "../DexcaliburEngine";
import {AccessZone} from "./acl/Zones";
import {ProjectAccessControl} from "./acl/rbac/ProjectAccessContol";

export class UserAccount {

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


    constructor(pConfig:any = null) {
        if(pConfig != null){
            for(let i in pConfig) this[i] = pConfig[i];
        }
        // TODO : replace by incremental uid
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
        return this._role.name;
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
        return this.username;
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

    addOwnedProject( pProjectURI:ProjectURI ):void {
        let e:boolean = false;
        this._projects.map( (vProj:ProjectURI) => {
            if(vProj.equals(pProjectURI)) e = true;
        })
        if(!e){
            this._projects.push(pProjectURI);
        }
    }

    getProjects():ProjectURI[] {
        return this._projects;
    }
}