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


        return new Promise((vResolve, vReject)=>{

            _fs_.open(pPath, pMode, (err,fd)=>{

                if(err!=null){
                    console.log(err);
                    vReject( err);
                    return;
                }

                _fs_.lstat(pPath,(err2,stat)=>{

                    if(err2!=null || fd==null){
                        console.log(err2);
                        vReject( err2);
                        return;
                    }

                    if(stat.size===null || stat.size<0 || stat.size>FSUtil.MAX_FILE_SIZE_B ){

                        console.log(`FSUtil : file size exceed read limit (${FSUtil.MAX_FILE_SIZE_B/1024} Kb)`);
                        vReject( `FSUtil : file size exceed read limit (${FSUtil.MAX_FILE_SIZE_B/1024} Kb)`);
                        return;
                    }

                    //const buff = new ArrayBuffer(stat.size);
                    _fs_.readFile(fd,(err3,data)=>{
                        if(err3!=null){

                            console.log(err3);
                            vReject( err3);
                            return;
                        }

                        _fs_.close(fd, ()=>{
                            vResolve(data);
                        });
                    });
                });
            });
        });
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