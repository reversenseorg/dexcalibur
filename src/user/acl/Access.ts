import {AccessZone} from "./Zones.js";

/**
 * org: {
 *    member: [ { uid } ]
 * }
 */
export interface AclAttributeTree {
    [zoneName:string] : Record<string, any[]>;
}

/**
 * List of error code for ABAC
 */
export enum AccesErrCode {
    NONE,
    NO_ZONE,
    ACCESS_UNKNOWN,
    NO_DEFAULT_ROLE,
    ROLE_UNDEFINED,
    ATTR_UNKNOWN,
    VIOLATION,
    MANDATORY_OBJECT_UNDEFINED
}

export enum AccessType {
    READ,
    WRITE,
    EXE
}

export type AccessUID = string;

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
    private _n:AccessUID;
    private _d:string;
    private _zones:AccessZone[] = [];

    constructor( pType:AccessType, pName:AccessUID, pDescr:string = null) {
        this._t = pType;
        this._n = pName;
        this._d = pDescr;
        //this._zones = pZones;
    }

    getUID():AccessUID{
        return this._n;
    }

    get description():string {
        return this._d;
    }

    get name():AccessUID {
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