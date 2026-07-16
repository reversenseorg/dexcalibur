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

import {SearchRequestCondition, ValidateOptions} from "./SearchRequestCondition.js";
import {IJSONSchema, NodeProperty} from "@reversense/dexcalibur-orm";
import {MerlinSearchRequest} from "./MerlinSearchRequest.js";


export enum OperationType {
    SEARCH,
    AGGR,
    FILTER,
    SIZE,
    VALIDATE,
    TIME,
    UNION,
    INTERSECT,
    JOIN,
    INNERJOIN,
    TAINT_SRC,
    TAINT_SINK,
    TAINT_STEP,
    SELECT
}


export enum Comparison {
    LTE,
    GTE,
    LT,
    GT,
    EQ
}


export interface SearchOperationArgs {
    pattern: SearchRequestCondition[]
}

export interface ValidateOperationArgs {
    pattern: string,
    opts?: ValidateOptions
}

export interface WindowingOperationArgs {
    offset?: number,
    limit?: number
}

export interface NestedRequestOperationArgs {
    request: MerlinSearchRequest,
    cond?: any
}

export interface InnerjoinOperationArgs {
    on: NodeProperty|string,
    cond?: SearchRequestCondition
}

// AggregationOption
export interface AggregationOperationArgs {
    on: string,
    opts?: AggregationOption,
    size?:number
}

export interface TaintOperationArgs {
    request: MerlinSearchRequest[]
}

export interface TimeOperationArgs {
    comparison: Comparison,
    field: string,
    date: number
}

export interface Operation {
    type: OperationType,
    args: SearchOperationArgs | InnerjoinOperationArgs | TimeOperationArgs | ValidateOperationArgs | WindowingOperationArgs | NestedRequestOperationArgs | AggregationOperationArgs | TaintOperationArgs ;
}

interface SearchRequestOptions {
    aggregation: boolean,
    cache: boolean,
    limit: number;
    offset: number;
    nestedOp:boolean;
}

export interface AggregationOption {
    alias: string,
    size?: number
}

export interface MerlinError {
    msg?:string;
    stack?:string;
    subject?:any;
    what:string;
    location:string;
}


export interface ValidationResult {
    success: boolean,
    force: number
}

export class MerlinSearchDoc {

    static json:any =  {
        OperationType: {
            enum: Object.values(OperationType),
            description: "Type of operation"
        },
        ValidationResult:  {
            type: "object",
            properties: {
                success: {
                    type:"boolean",
                    description: "Validation success"
                },
                force: {
                    type:"integer",
                    description: "Number of forced validation"
                }
            }
        },
        SearchRequestCondition: SearchRequestCondition.getJsonSchema()
    };


}