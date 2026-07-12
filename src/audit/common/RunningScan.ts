
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

import {MessagePort, MessageChannel} from "worker_threads";

import {Scan} from "./Scan.js";
import {AssuranceScanner} from "./AssuranceScanner.js";
import {Nullable} from "../../core/IStringIndex.js";


export class RunningScan {

    scan: Scan;

    scanner: AssuranceScanner;
    private _port1:Nullable<MessagePort> = null;
    private _port2:Nullable<MessagePort> = null;



    constructor( pScan:Scan) {

    }

    suspend():void {

    }

    resume():void {

    }

    start():void {
        //const { port1, port2 } = new MessageChannel();
        //this._port1 = port1;
        //this._port2 = port1;
    }
}