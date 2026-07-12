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

/**
 * Represents a test case from a fuzzing session.
 *
 *
 */
import {RuntimeEvent} from "../hook/RuntimeEvent.js";
import {HookSessionUUID} from "../HookSession.js";
import {FuzzInputValueDict, FuzzTestCaseID} from "./common.js";
import BusEvent from "../BusEvent.js";


/**
 * Options to create a new instance
 */
export interface FuzzTestCaseOpts {
    id?:FuzzTestCaseID;
    hookSession?:HookSessionUUID;
    inputValueDict:FuzzInputValueDict;
    messages?:RuntimeEvent<any>[];
    time?:number;
}

/**
 * @class
 */
export default class FuzzTestCase {

    uid:FuzzTestCaseID;
    hookSession:HookSessionUUID;
    inputValueDict:FuzzInputValueDict;
    messages:BusEvent<any>[] = [];

    /**
     * The timestamp of the fuzzing try initialization
     * @field
     */
    time: number = -1;

    /**
     *
     * @param {Nullable<FuzzSessionOpts>} pOptions Default NULL
     * @constructor
     */
    constructor(pOptions: FuzzTestCaseOpts) {
        if (pOptions != null) {
            for (let i in pOptions) {
                this[i] = pOptions[i];
            }
        }
    }

    pushEvent(pEvt:BusEvent<any>):void {
        this.messages.push(pEvt);
    }

    getUID(): FuzzTestCaseID {
        return this.uid;
    }
}