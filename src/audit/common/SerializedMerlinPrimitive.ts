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

import {Nullable} from "../../core/IStringIndex.js";
import {
    AggregationOperationArgs,
    InnerjoinOperationArgs, NestedRequestOperationArgs,
    Operation,
    OperationType,
    SearchOperationArgs, TaintOperationArgs, TimeOperationArgs, ValidateOperationArgs, WindowingOperationArgs
} from "../../search/MerlinSearchRequest.js";
import {SearchRequestCondition} from "../../search/SearchRequestCondition.js";
import {SearchOptions} from "../../search/MerlinSearchAPI.js";


export enum MerlinType {
    REQUEST,
    RULE
}

export declare const SupportedEngine: Readonly<{
    readonly MERLIN: "MERLIN";
    readonly BUS: "BUS";
}>;

export interface SerializedSearchOperationArgs {
    pattern: string,
    options?:SearchOptions
}

export interface SerializedInnerjoinOperationArgs {
    on: string,
    cond?: string
}


export interface SerializedNestedRequestOperationArgs{
    request: SerializedSearchRequest,
    cond?: string
}

export interface SerializedTaintOperationArgs{
    request: SerializedSearchRequest[]
}

export interface SerializedMerlinOperation {
    type: OperationType,
    args:
        SerializedSearchOperationArgs |
        SerializedInnerjoinOperationArgs |
        TimeOperationArgs |
        ValidateOperationArgs |
        WindowingOperationArgs |
        SerializedNestedRequestOperationArgs |
        AggregationOperationArgs |
        SerializedTaintOperationArgs ;
}

export interface SerializedSearchRequest {
    node: string;
    pattern: string|any;
    oper?: SerializedMerlinOperation[],
    opts?: Nullable<string[]>,
}

export interface SerializedMerlinPrimitive {
    _type?: MerlinType,
    engine: string,
    request?: SerializedSearchRequest,
    i18n_request?:any;
    os: string,
    on?: Nullable<string|string[]>
    args?: Nullable<any[]>
    sources?:Nullable<SerializedMerlinPrimitive[]>,
    sinks?:Nullable<SerializedMerlinPrimitive[]>,
    steps?:Nullable<SerializedMerlinPrimitive[]>
}