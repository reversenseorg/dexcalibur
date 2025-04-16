import DexcaliburEngine from "../DexcaliburEngine.js";
import {GridFSBucket, GridFSBucketReadStream} from "mongodb";
import {EngineDatabase} from "../database/EngineDatabase.js";
import {ProjectDatabase} from "../database/ProjectDatabase.js";
import {IFileDatabase} from "./commons.js";
import {Readable} from "stream";
import * as _fs_ from "fs";
import {EngineDatabaseException} from "../errors/EngineDatabaseException.js";

/**
 *
 *
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

        return this.writeFileStream(pBucket, _fs_.createReadStream(pPath), pFileID, pMetadata);
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

        pStream.pipe(bucketStream);

        return bucketStream.id;
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

    /*async scanDir(pFilepath:string):Promise<boolean>  {

    }

    async isFile(pBucket:string, pFilepath:string):Promise<boolean> {

    }*/
}