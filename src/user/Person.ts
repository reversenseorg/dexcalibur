import {UserAccount, UserAccountType} from "./UserAccount.js";
import {ValidationRule} from "../Validator.js";

export interface PersonOptions {
    _firstname?: string;
    _lastname?: string;
    _mail?: string;
    _bio?: string;
}


/**
 * Represent a physicial person
 *
 * @class
 */
export class Person {

    static VALIDATE:Record<string, ValidationRule> = {
        _firstname: ValidationRule.utf8String(),
        _lastname: ValidationRule.utf8String(),
        _mail: ValidationRule.email(),
        _bio: ValidationRule.utf8String(),
    }


    private _firstname:string;
    private _lastname:string;
    private _mail:string;
    private _bio:string;

    private _account: UserAccount = null;

    constructor(pOptions:PersonOptions = null) {
        if(pOptions!=null){
            for(let k in pOptions){
                this[k] = pOptions[k];
            }
        }
    }

    get firstname(): string {
        return this._firstname;
    }

    set firstname(value: string) {
        this._firstname = value;
    }

    get lastname(): string {
        return this._lastname;
    }

    set lastname(value: string) {
        this._lastname = value;
    }

    get mail(): string {
        return this._mail;
    }

    set mail(value: string) {
        this._mail = value;
    }

    get bio(): string {
        return this._bio;
    }

    set bio(value: string) {
        this._bio = value;
    }

    get account(): UserAccount {
        return this._account;
    }

    set account(value: UserAccount) {
        this._account = value;
    }
}