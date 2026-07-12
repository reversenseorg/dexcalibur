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

// Source: https://lxr.linux.no/#linux+v3.9.5/include/uapi/linux/input.h#L49

export default class InputEventCodeProperties {
    desc?:any;
    value?:number;
    min?: number; // Specifies minimum value for the axis.
    max?: number; // Specifies maximum value for the axis.
    fuzz?: number; // Specifies fuzz value that is used to filter noise from the event stream
    flat?: number; // Values that are within this value will be discarded by joydev interface and reported as 0 instead.
    resolution?: number; // Specifies resolution for the values reported for the axis.

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}