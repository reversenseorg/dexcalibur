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

import {FinderResult} from "./FinderResult.js";
import {BusSubscriber} from "../Bus.js";
import {MerlinError} from "./MerlinSearchRequest.js";

export interface RuleOption {
    score?:number
}

export enum MerlinScopes {
    FROM_OUTSIDE,
    TO_OUTSIDE
}

export enum MerlinType {
    REQUEST,
    RULE
}

/**
 * @interface
 */
export interface MerlinPrimitive {
    TYPE: MerlinType

    execute(pContext:any,pPdbIfEmpty:boolean):Promise<FinderResult>;

    executeSync?(pContext:any):FinderResult;

    toJsonObject():any;

    toSearchString():string;

    hasBusSubscriber():boolean;

    getSubscribeList():string[];

    toBusSubscriber(pContext:any):BusSubscriber;

    hasErrors():boolean;

    addError(pErr:MerlinError):void ;

    getErrors():MerlinError[];

    setErrors(pErrs:MerlinError[]):void;
}
