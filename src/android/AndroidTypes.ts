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

import {DataType} from "../types/DataType.js";
import {
    ArrayType,
    BoolType,
    ClassRefType,
    FloatType,
    IntType, NativeBackend,
    PointerType,
    UnknownType,
    VoidType
} from "../types/common.js";


export const AndroidTypes:Record<string, DataType> = {
    F: new FloatType(NativeBackend.DEX, 32, "float"),
    D: new FloatType(NativeBackend.DEX, 64, "double"),
    C: new IntType(NativeBackend.DEX, 8, true, "char"),
    V: new VoidType(NativeBackend.DEX),
    B: new IntType(NativeBackend.DEX, 8, false, "byte"),
    J: new IntType(NativeBackend.DEX, 64, false, "long"),
    I: new IntType(NativeBackend.DEX, 32, false, "integer"),
    S: new IntType(NativeBackend.DEX, 16, false, "short"),
    Z: new BoolType(NativeBackend.DEX, 8),
    L: new ClassRefType(null, NativeBackend.DEX, 32, null), // new DataType("dalvik.object",32,false),
    OBJECT: new PointerType(new ClassRefType(null, NativeBackend.DEX, 32, null), 64, NativeBackend.DEX),
    STRING: new PointerType(new ClassRefType(null, NativeBackend.DEX, 32, null), 64, NativeBackend.DEX),
    //ARRAY:  new ArrayType(null, -1, NativeBackend.DEX), //new DataType("dalvik.array",32,false, true),
    UNKNOW: new UnknownType(NativeBackend.DEX) //new DataType("dalvik.unknow",1,false),
}

