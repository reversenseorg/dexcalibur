/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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