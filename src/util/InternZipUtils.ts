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

import { deflate, unzip  } from 'node:zlib';
import { promisify } from 'node:util';
import * as _ps_ from 'node:child_process';
import * as _fs_ from 'fs';
import Util from "../Utils.js";
import {R2Pipe} from "../external/R2Pipe.js";


const _unzip = promisify(unzip);
const _deflate = promisify(deflate);

/**
 * This class is intent to be used ONLY with binary or package to analyze
 * and will be replaced later by smarter one
 * @class
 */
export class InternZipUtils {

    static BIN = "unzip";
    /**
     * To extract a Zip archive using host binary `unzip`
     *
     * TODO : replace by smarter, native, extracting able to detect corrupted one and fix it
     *
     * @param pSrc
     * @param pOut
     * @param pOptions
     */
    static async unzipArchive(pSrc:string, pOut:string):Promise<boolean> {

        return new Promise((resolve, reject) => {
            if(/[a-zA-Z0-9.\/_]/.test(pSrc)==false){
                throw new Error('InternZipUtils.unzipArchive: input path is malformed.');
            }

            // todo : check pOut attribute
            if(_fs_.existsSync(pOut)){
                try{
                    _fs_.accessSync(pOut, _fs_.constants.R_OK | _fs_.constants.W_OK);
                }catch (e){
                    console.error("cannot access temp folder, try 666", e);
                    try{
                        _fs_.chmodSync( pOut, 0o666);
                        _fs_.accessSync(pOut, _fs_.constants.R_OK | _fs_.constants.W_OK);
                    }catch (e){
                        console.error("chmod 0o666 didnt work, try 777", e);
                        _fs_.chmodSync( pOut, 0o777);
                    }
                }

                _fs_.accessSync(pOut, _fs_.constants.R_OK | _fs_.constants.W_OK);
            }


            try{

                let data:string = "", errData="";

                const ps = _ps_.spawn(InternZipUtils.BIN,[pSrc,'-d',pOut]);

                ps.on("message", console.log);

                ps.stdout.on("data", chunk => {
                    data += chunk.toString();
                });

                ps.stderr.on("data", chunk => {
                    errData += chunk.toString();
                });

                ps.on("close", function(code) {

                    console.log("InternZipUtils.unzipArchive: done. ");


                    //console.log(data);
                    //console.log(errData);

                    if (code > 0) {
                        return reject(new Error(`InternZipUtils.unzipArchive: failed to decompress the archive, error code : ${code}`));
                    }

                    resolve(true);
                });

                ps.on("error", function(err) {;
                    console.log("InternZipUtils.unzipArchive: error : ",err);
                    console.log(errData);
                    reject(err);
                });
            }catch (e){
                console.log(e);
                reject(new Error('InternZipUtils.unzipArchive: failed to decompress the archive, fatal error.'));
            }


            if(!_fs_.existsSync(pSrc)){
                reject(new Error('InternZipUtils.unzipArchive: failed to decompress the archive, output is missing.'));
            }
        });
    }

    /*
     *
     * @param pSrc
     * @param pOutDir
     * @param pOptions
     */
    /*static async unzipFilePath(pSrc:string, pOut:string, pOptions:any):Promise<void> {
        const src = createReadStream(pSrc);
        const dest = createWriteStream(pOut);
        return await InternZipUtils.unzipFileStream(src, dest, pOptions);
    }

    static async unzipFileStream(pSrc:ReadableStream, pOut:WritableStream, pOptions:any):Promise<void> {
        await pipeline(pSrc, _unzip, pOut);
    }*/
}
InternZipUtils.BIN = Util.whereIs("unzip");