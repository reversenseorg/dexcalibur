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

import {Device} from "../Device.js";
import {ApplicationBinary} from "../Application.js";
import DexcaliburProject from "../DexcaliburProject.js";

export default class IosApplication extends ApplicationBinary
{
    constructor(pContext:DexcaliburProject) {
        super(pContext);
    }

    start(pDevice:Device):number{
        throw new Error('[IOS APPLICATION] "start" operation is not implemented.');
        return -1;
    }

    kill(pDevice:Device, pPID:number=-1):boolean{
        throw new Error('[IOS APPLICATION] "kill" operation is not implemented.');
        return false;
    }

    isRunning(pDevice:Device):boolean{
        throw new Error('[IOS APPLICATION] "isRunning" operation is not implemented.');
        return false;
    }

    getPID(pDevice:Device):number{
        throw new Error('[IOS APPLICATION] "getPID" operation is not implemented.');

        return -1;
    }
}