import {UserAccount} from "./UserAccount";

export class Person {

    private _firstname:string;
    private _lastname:string;
    private _mail:string;
    private _bio:string;

    private _account: UserAccount = null;

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