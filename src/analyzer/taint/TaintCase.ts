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

import DexcaliburProject from "../../DexcaliburProject.js";
import {ModelFunction} from "../../ModelFunction.js";
import ModelInstruction from "../../ModelInstruction.js";
import ModelMethod from "../../ModelMethod.js";
import ModelField from "../../ModelField.js";
import ModelStringValue from "../../ModelStringValue.js";
import ModelClass from "../../ModelClass.js";
import {Nullable} from "@reversense/dxc-core-api";
import {UserAccountUUID} from "../../user/UserAccount.js";

export interface TaintStep {
    location: ModelInstruction;
    source: ModelFunction|ModelMethod|ModelField|ModelClass;
}


export interface TaintSink extends TaintStep {
}

export interface TaintSource extends TaintStep {
}

export interface  TaintCaseOpts {
    ctx: DexcaliburProject,
    source: TaintSource,
    name: string,
    description?: Nullable<string>,
    sinks?: Nullable<TaintSink[]>,
    propagators?: Nullable<TaintSink[]>,
    conds?: Nullable<TaintSink[]>,
    author?:Nullable<UserAccountUUID>,
}

export class TaintCase {

    ctx:DexcaliburProject;

    name: string;
    description: string;
    author: UserAccountUUID;

    source: TaintSource;
    sinks: TaintSink[] = [];
    propagators: TaintStep[] = [];
    conds: TaintStep[] = [];

    constructor(pOptions:TaintCaseOpts) {
        this.ctx = pOptions.ctx;
        this.source = pOptions.source;
        this.sinks = pOptions.sinks;
        if(pOptions.propagators!=null)  this.propagators = pOptions.propagators;
        if(pOptions.conds!=null)  this.conds = pOptions.conds;
    }

}