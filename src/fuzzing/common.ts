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

import FuzzTestCase from "./FuzzTestCase.js";

export enum FuzzingEvent {
    STEP_START= "fuzz.step.start",
    STEP_END= "fuzz.step.end",
    STEP_CRASH= "fuzz.step.crash",
    START= "fuzz.action.start",
    STOP= "fuzz.action.stop",
    PAUSE= "fuzz.action.pause",
    RESUME= "fuzz.action.resume"
}

export enum FuzzingResolverResult {
    SUCCESS,
    FAIL,
    INFO,
    DISCARD
}

export type FuzzSessionUID = string;

export type FuzzTestCaseID = string;

export type FuzzInputValue = any;
// FuzzInputValueDict associate a label with a FuzzInputValue
export type FuzzInputValueDict = Record<string, FuzzInputValue>;

export interface IFuzzingEvent{
    fsid?:FuzzSessionUID,
    tcid?:FuzzTestCaseID
}

export interface IFuzzGenerator{
    init():void;
    next(pOts?:any):FuzzInputValue;
}

export interface IFuzzResolver{
    init(pOptions:any):void;
    process(pTestCase:FuzzTestCase, pValue:any):any;
}