
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
 * Class logging message from the VM.
 *
 * It handles internal VM logs and Android logs (thanks to android.Log hooks).
 *
 * @class
 * @classdesc Class logging message from the VM
 */
export default class DDVM_Log
{
    logs:string[] = null;

    constructor(){
        this.logs = [];
    }

    reset(){
        this.logs = [];
    }

    write( pMsg:string){
        this.logs.push(pMsg);
    }

    read():string[]{
        return this.logs;
    }
}
