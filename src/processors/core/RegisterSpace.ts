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

import {Register} from "./Register.js";


export class RegisterSpace {

    offset:number = 0;
    regSize:number = 4;
    description:string = "";
    registers:Register[] = [];

    constructor() {

    }

    static fromSpec(pRegPrefix:string, pRegNumber:number, pOffset:number = -1, pRegSize:number = -1, pFirstAt = 0): RegisterSpace {
        const space = new RegisterSpace();
        space.offset = pOffset;
        space.regSize = pRegSize;

        if(pRegNumber>0){
            let i=pFirstAt;
            do{
                space.registers.push(new Register(pRegPrefix+(i*(pRegSize/4))));
                i++;
            }while (i<pRegNumber);
        }

        return space;
    }
}