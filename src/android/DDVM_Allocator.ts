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
 * Class performing allocation of component such as
 * byte array
 *
 * @class
 * @classdesc Class performing allocation of some components
 */
import DDVM_VirtualArray from "./DDVM_VirtualArray.js";

export default class DDVM_Allocator
{
    maxMemorySize:number = -1;
    top:number = 0;
    vm:any = null;
    heap:DDVM_VirtualArray[] = null;

    constructor( pVM:any, pMemorySize:number=-1){
        this.maxMemorySize = pMemorySize;
        this.heap = [];
        this.top = 0;
        this.vm = pVM;
    }

    newArray( pType:any, pSize:number=null):DDVM_VirtualArray{
        this.top = this.heap.length;
        this.heap.push( new DDVM_VirtualArray( pType.name, pSize));

        return this.heap[this.top];
    }
}
