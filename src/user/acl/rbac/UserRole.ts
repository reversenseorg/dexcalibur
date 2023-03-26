import {Access, AccessMap} from "../Access.js";

export interface  UserRoleMap {
    [uid:string] :UserRole;
}

/**
 *
 */
export class UserRole {

    private _uid:string = null;
    private _name:string ;
    private _access:AccessMap = {};

    constructor( pUID:string, pName:string, pAccessMap:AccessMap = {}) {
        this._uid = pUID;
        this._name = pName;
        this._access = pAccessMap;
    }


    get uid(): string {
        return this._uid;
    }

    set uid(value: string) {
        this._uid = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get access(): AccessMap {
        return this._access;
    }

    set access(value: AccessMap) {
        this._access = value;
    }

    addAccess(pAccess:Access):void {
        this._access[pAccess.name] = pAccess;
    }

    hasAccess(pAccess:Access):boolean {
        return (this._access[pAccess.name] != null)
    }
}
