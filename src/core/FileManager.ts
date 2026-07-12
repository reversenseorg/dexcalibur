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

import DexcaliburEngine from "../DexcaliburEngine.js";
import {GridFSBucket, GridFSBucketReadStream} from "mongodb";
import {IFileDatabase} from "./commons.js";
import {Readable} from "stream";
import * as _fs_ from "fs";
import {EngineDatabaseException} from "../errors/EngineDatabaseException.js";

/**
 * File manager help to implement a database-backed filesystem
 * instead of relying on host filesystem
 *
 * It ensures slaves node are more stateless about FS
 *
 *  @class
 * @since 1.8.14
 */
export class FileManager {

    private _ctx:DexcaliburEngine;
    private _db:IFileDatabase;


    private _buckets:Record<string, GridFSBucket> = {}

    constructor(pContext:DexcaliburEngine, pDb:IFileDatabase) {
        this._ctx = pContext;
        this._db = pDb;
    }

    async open(pBuketName:string):Promise<GridFSBucket> {
        if(this._buckets[pBuketName]==null){
            this._buckets[pBuketName] = new GridFSBucket(
                this._db.getDb().db,
                {bucketName: pBuketName });

        }

        return this._buckets[pBuketName];
    }

    /**
     *
     * @param pBuffer
     * @param pPath
     * @param pMetadata
     */
    async writeFile(pBucket:string, pPath:string, pFileID:string, pMetadata:any):Promise<any> {

        return await this.writeFileStream(pBucket, _fs_.createReadStream(pPath), pFileID, pMetadata);
    }

    /**
     *
     * @param pBuffer
     * @param pPath
     * @param pMetadata
     */
    async writeFileStream(pBucket:string, pStream:Readable, pFileID:string, pMetadata:any):Promise<any> {

        if(this._buckets[pBucket]==null){
            throw EngineDatabaseException.BUCKET_NOT_READY(pBucket);
        }

        const bucketStream = this._buckets[pBucket].openUploadStream(
            pFileID, { metadata: pMetadata }
        );



        return new Promise<any>((resolve, reject) => {

            pStream
                .pipe(bucketStream)
                .on('finish', () => {
                    resolve(bucketStream.id);
                })
                .on('error', reject);
        });

        //return bucketStream.id;
    }

    /**
     *
     * @param pFile
     */
    async readFile(pBucket:string, pFileID:string, pOptions?:any):Promise<Buffer> {
        if(this._buckets[pBucket]==null){
            throw EngineDatabaseException.BUCKET_NOT_READY(pBucket);
        }

        const files = await this._buckets[pBucket].find({ filename:pFileID }).toArray();

        if(files.length==0 ){
            throw EngineDatabaseException.FILE_NOT_FOUND_IN_BUCKET(pBucket, pFileID);
        }
        if(files.length>0){
            throw EngineDatabaseException.FILE_NOT_UNIQUE_IN_BUCKET(pBucket, pFileID);
        }


        let stream  = this._buckets[pBucket].openDownloadStreamByName(pFileID);

        return new Promise < Buffer > ((resolve, reject) => {
            const buff = [];
            stream.on("data", chunk => buff.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(buff)));
            stream.on("error", err => reject(`error converting stream - ${err}`));

        });
    }

    /**
     *
     * @param pFile
     */
    async readFileTo(pBucket:string, pFile:string, pOutputPath:string):Promise<boolean> {
        if(this._buckets[pBucket]==null){
            throw EngineDatabaseException.BUCKET_NOT_READY(pBucket);
        }

        const bucketStream = this._buckets[pBucket].openDownloadStreamByName(pFile);
        //bucketStream.pipe(_fs_.createWriteStream(pOutputPath));

        return new Promise((resolve, reject) => {
            bucketStream
                .on('end', () => {
                })
                .on('error', (err) => {
                    reject(err);
                })
                .pipe(_fs_.createWriteStream(pOutputPath))
                .on('finish', async () => {
                    try {
                        console.log(pOutputPath,_fs_.existsSync(pOutputPath));
                        resolve(true);
                    } catch (err) {
                        reject(err);
                    }
                });
        });
    }

    /**
     *
     * @param pFile
     */
    async readFileStream(pBucket:string, pUploadID:string):Promise<GridFSBucketReadStream> {
        if(this._buckets[pBucket]==null){
            throw EngineDatabaseException.BUCKET_NOT_READY(pBucket);
        }

        return this._buckets[pBucket].openDownloadStreamByName(pUploadID);
    }

    /*
    ------- COMMON FS API -----------
     */

    /*
    async scanDir(pFilepath:string):Promise<boolean>  {

    }*/

    /**
     *
     * @param pBucket
     * @param pFilepath
     * @method
     * @since 1.8.24
     */
    /*
    async isFile(pBucket:string, pFilepath:string):Promise<boolean> {

    }*/

    /**
     * To export en entire bucket to temporary folder in FS in order
     *
     * Useful when an external process must walk over all paths from a folder
     * like binwalk
     *
     * @method
     * @since 1.8.24
     */
    /*
    async exportBucketToTempFolder(pParentPath:string):Promise<string> {
        // todo
        return "";
    }*/
}