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

import AnalyzerDatabase from "../AnalyzerDatabase.js";
import ModelPackage from "../ModelPackage.js";
import ModelClass from "../ModelClass.js";
import ModelMethod from "../ModelMethod.js";
import ModelField from "../ModelField.js";
import ModelSyscall from "../ModelSyscall.js";
import AndroidActivity from "../android/AndroidActivity.js";
import AndroidProvider from "../android/AndroidProvider.js";
import AndroidReceiver from "../android/AndroidReceiver.js";
import AndroidService from "../android/AndroidService.js";
import {ModelPermission} from "../android/ModelPermission.js";
import {ModelFunction} from "../ModelFunction.js";
import ModelFile from "../ModelFile.js";
import {Nullable} from "@dexcalibur/dxc-core-api";


export interface ISearchAPISelector<T>
{
    _db:Nullable<T>;

    package(id:string):ModelPackage;

    class(id:string):ModelClass;

    method(id:string):ModelMethod;

    field(id:string):ModelField;

    syscalls(id:string):ModelSyscall;

    activity(id:string):AndroidActivity;

    provider(id:string):AndroidProvider;

    receiver(id:string):AndroidReceiver;

    service(id:string):AndroidService;

    permission(id:string):ModelPermission;

    func(id:string):ModelFunction;

    files(id:string):ModelFile;

    session(id:string):ModelFile;

    event(id:string):ModelFile;
}
