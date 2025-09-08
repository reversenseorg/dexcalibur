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