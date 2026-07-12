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

import {NativeAnalyzerProfile} from "../../NativeAnalyzerProfile.js";
import { AbiType} from "../../binary/ABI.js";


export default class AndroidNativeAnalyzerProfile implements NativeAnalyzerProfile {

    name:string = "android";
    fmt:string[] = ['ELF'];
    devABI: boolean = false;

    static abiFolders:any = {
        [AbiType.arm64_v8a]  : ['arm64','arm64-v8a'],
        [AbiType.armeabi_v7a]  : ['arm','armeabi-v7a'],
        [AbiType.arm_v5]  : ['armv5','armeabi'],
        [AbiType.armeabi]  : ['armeabi'],
        [AbiType.x86]  : ['x86','i386','ia-32'],
        [AbiType.x86_64]  : ['x86_64','x64'],
        [AbiType.mips]  : ['mips'],
        [AbiType.mips64]  : ['mips64'],
    };

    constructor(pConfig:any) {
        for(let i in pConfig){
            this[i] = pConfig[i];
        }
    }
}