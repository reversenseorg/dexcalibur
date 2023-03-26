import {Person} from "./Person.js";
import {SharingConfiguration} from "./SharingConfiguration.js";

/**
 * Represent a Team
 *
 * A Team is a group of person sharing ressource (alias, comment, hook, file, terminal, device, ...)
 */
export class Team {


    private _name:string;
    private _owner:Person;
    private _members:Person[];
    private _sharedRes:any[] = [];
    private _sharingConfig:SharingConfiguration;

    get sharingConfig(): SharingConfiguration {
        return this._sharingConfig;
    }

    set sharingConfig(value: SharingConfiguration) {
        this._sharingConfig = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get owner(): Person {
        return this._owner;
    }

    set owner(value: Person) {
        this._owner = value;
    }

    get members(): Person[] {
        return this._members;
    }

    set members(value: Person[]) {
        this._members = value;
    }

    get sharedRes(): any[] {
        return this._sharedRes;
    }

    set sharedRes(value: any[]) {
        this._sharedRes = value;
    }
}