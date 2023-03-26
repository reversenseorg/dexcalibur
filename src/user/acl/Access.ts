import {AuthCode} from "../auth/AuthTypes.js";

export enum AccesErrCode {
    NONE,
    NO_ZONE,
    ACCESS_UNKNOWN,
    NO_DEFAULT_ROLE,
    ROLE_UNDEFINED,
    ATTR_UNKNOWN,
    VIOLATION
};


export enum AccessZone {
    GLOBAL='g',
    PROJECT='p',
    HOST='h'
}

export enum AccessType {
    READ,
    WRITE,
    EXE
}

export interface AccessMap {
    [uid:string] :Access
}

export enum AccessProperty {
    UID= 'uid',
    NAME='name',
    DESCR='description',
    TYPE='type'
}

/**
 * Represents an access point
 */
export class Access {

    private _t:AccessType = AccessType.WRITE;
    private _n:string;
    private _d:string;

    constructor( pType:AccessType, pName:string, pDescr:string = null) {
        this._t = pType;
        this._n = pName;
        this._d = pDescr;
    }

    get description():string {
        return this._d;
    }

    get name():string {
        return this._n;
    }

    get type():AccessType {
        return this._t;
    }
}


export class AccessException extends Error {

    _c:AccesErrCode = AccesErrCode.NONE
    constructor(pMsg, pCode:AccesErrCode = AccesErrCode.NONE) {
        super(pMsg);
        this._c = pCode;
    }

    /**
     * To get auth code
     */
    getCode():AccesErrCode {
        return this._c;
    }
}