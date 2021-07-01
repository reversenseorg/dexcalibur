import {Person} from "./Person";
import {createHash} from "crypto";
import {AuthCode, AuthenticationException} from "./auth/AuthTypes";

export class UserAccount {

    private _person: Person;
    private _username:string;
    private _password:string;
    private _salt:string;
    private _padding:string;
    private _time:string;
    private _locked:boolean = false;


    constructor(pConfig:any = null) {
        if(pConfig != null){
            for(let i in pConfig) this[i] = pConfig[i];
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

    isLocked():boolean {
        return this._locked;
    }

    hasUsername(pUsername:string):boolean {
        return (this._username === pUsername);
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
}