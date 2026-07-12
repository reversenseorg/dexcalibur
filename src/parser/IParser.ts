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

import {BufferEncoding} from "typescript";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelStringValue from "../ModelStringValue.js";
import ModelClass from "../ModelClass.js";
import {Tag} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "@dexcalibur/dxc-core-api";

export interface IResults<T> {
    ok: T;
    invalid: any[];
    strings?:ModelStringValue[];
    cls?:Record<string, ModelClass>;
}

export interface IParserOptions {
    encoding:BufferEncoding;
    raw:boolean;
    tags?:Nullable<Tag[]>
}

export enum IParserFeature {
    NONE,
    MAGIC_CHECK,
    STRUCT,
    CONVERT
}


export interface IParser<T> {

    FEATURES:IParserFeature[];

    UID:string;

    FORMAT_NAMES:string[];

    FILE_EXTENSIONS:string[];

    description:string;

    fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:any):Promise<IResults<T>>;

    setContext(pProject:DexcaliburProject):void;
}

export interface IMagicParser<T> extends IParser<T> {
    hasSignature(pBuffer:Buffer, pOffset:number, pOptions:any):Promise<boolean>;
    getMagic():any;
}