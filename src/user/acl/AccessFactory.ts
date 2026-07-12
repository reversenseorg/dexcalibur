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
 * Helper class to make list of access control
 *
 * @class
 */
import {Access, AccessMap} from "./Access.js";

export class AccessFactory {

    /**
     * @deprecated
     * @param accesses
     */
    static union( ...accesses:AccessMap[]):AccessMap {
        let o:AccessMap = {};
        for(let k in accesses){
            for(let i in accesses[k])
                o[i] = accesses[k][i];
        }
        return o;
    }


    /**
     *
     * @param pAccesses
     */
    static merge( ...pAccesses:Access[][]):Access[] {
        let o:Access[] = [];
        for(let k in pAccesses ){
            for(let i in pAccesses[k])
                o.push(pAccesses[k][i]);
        }
        return o;
    }
}