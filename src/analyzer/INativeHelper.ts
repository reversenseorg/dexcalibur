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

import {ModelFunction} from "../ModelFunction.js";
import ModelExecutableSection from "../ModelExecutableSection.js";
import ModelStringValue from "../ModelStringValue.js";
import ModelCall from "../ModelCall.js";
import {NativeBackend} from "../types/common.js";

export enum NativeHelperCmd {
    LIST_SECTIONS='sections',
    LIST_SEGMENTS='segments',
    LIST_SYSCALLS='sysc',
    LIST_XREFS='xrefs',
    LIST_STRINGS='str',
    LIST_FUNCS='f_list',
    SEARCH_INT='s_svc'
}

export type NativeHelperUID = string;

export interface INativeHelper {

    BACKEND_TYPE: NativeBackend;

    start(pCommands:string[]):Promise<any>;

    listFunctions():Promise<ModelFunction[]>;

    listSections():Promise<ModelExecutableSection[]>;

    listStrings(pOptions:any):Promise<ModelStringValue[]>;

    listSyscalls(pOptions:any):Promise<ModelCall[]>;

    listXrefs(pOptions:any):Promise<ModelCall[]>;
}