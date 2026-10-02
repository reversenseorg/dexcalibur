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

import * as _fs_ from "fs";

/**
 * To implement thread-safe FS operations using promise-like fashion
 *
 * @class
 */
export class FSUtil {

    static readonly MAX_FILE_SIZE_B = 2048*1024*1024;

    /**
     *
     * @param pPath
     * @param pMode
     */
    static async readFile(pPath:string, pMode='r'):Promise<Buffer> {
        const file = await _fs_.promises.open(pPath, pMode);
        try {
            const stat = await file.stat();
            if(stat.size===null || stat.size<0 || stat.size>FSUtil.MAX_FILE_SIZE_B){
                throw `FSUtil : file size exceed read limit (${FSUtil.MAX_FILE_SIZE_B/1024} Kb)`;
            }
            return await file.readFile();
        } finally {
            await file.close();
        }
    }


    static async exists(pPath:string):Promise<boolean> {
        return new Promise((vResolve, vReject)=>{
            _fs_.stat(pPath,(err,stat)=>{
                if(err){
                    vResolve(false);
                }else{
                    vResolve( true);
                }
            })
        })
    }
}
