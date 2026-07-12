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

import {RegisterSpace} from "../core/RegisterSpace.js";
import {MemoryBlock} from "../../memory/MemoryBlock.js";
import {Endianness} from "../../core/Endianness.js";

export class DalvikProcessor {

    endianness = Endianness.LITTLE_ENDIAN;

    regs:Record<string, RegisterSpace> = {};
    spaces:Record<string, MemoryBlock> = {};

    constructor() {
        // create ref / constant pool
        // create memory space

        // create register spaces
        this.regs["ret"] = RegisterSpace.fromSpec("p", 1, 0x0, 4);
        this.regs["ret_wide"] = RegisterSpace.fromSpec("p", 1, 0x8, 8);
        this.regs["param"] = RegisterSpace.fromSpec("p", 16, 0x100, 4);
        this.regs["param_wide_odd"] = RegisterSpace.fromSpec("p", 16, 0x104, 8, 1);
        this.regs["param_wide_even"] = RegisterSpace.fromSpec("p", 16, 0x100, 8);
        this.regs["local"] = RegisterSpace.fromSpec("v", 255, 0x1000, 4);
        this.regs["local_wide_odd"] = RegisterSpace.fromSpec("v", 255, 0x1004, 4, 1);
        this.regs["local_wide_even"] = RegisterSpace.fromSpec("v", 255, 0x1000, 4);
    }
}