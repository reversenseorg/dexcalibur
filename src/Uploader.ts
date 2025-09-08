

import * as _path_ from "path";
import * as _fs_ from 'fs';
import * as _busboy_ from 'busboy';
import Util from './Utils.js';
import * as Express from 'express';
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import DexcaliburEngine from "./DexcaliburEngine.js";
import {UploadedResource, UploadedResourceUUID} from "./common/UploadedResource.js";
import {UserAccount} from "./user/UserAccount.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {GridFSBucketReadStream} from "mongodb";
import {CryptoUtils} from "./CryptoUtils.js";

const BUSBOY = _busboy_.default;

interface IUploadSession {
    [id :string] :string
}

var gInstance:Uploader = null;

/**
 * @class
 */
export default class Uploader {
    private _ctx: DexcaliburEngine;

    uploads: IUploadSession = null;

    constructor(pEngine: DexcaliburEngine) {
        this._ctx = pEngine;
    }

    /**
     * @method
     */
    static getInstance(pEngine: Nullable<DexcaliburEngine> = null): Uploader {
        if (gInstance == null) {
            if (pEngine == null) {
                throw new Error('Cannot create Uploader : context is mandatory');
            }
            gInstance = new Uploader(pEngine);
        }

        return gInstance;
    }

    /**
     *
     * @param {*} pUploadId
     * @method
     */
    async getPathOf(pUploadId: UploadedResourceUUID): Promise<string> {
        const res = await this.getResource(pUploadId);

        if (res == null) {
            throw new Error("Uploaded resource not found : " + pUploadId);
        }

        return res.path;
    }

    /**
     *
     * @param {*} pUploadId
     * @method
     */
    async getResource(pUploadId: UploadedResourceUUID, pUser:Nullable<UserAccount> = null): Promise<UploadedResource> {
        // todo : verify resource owner if pUser!=null
        return await (this._ctx.getEngineDB()
            .getCollectionOf(UploadedResource.TYPE.getType()) as MongodbDbCollection)
            .asyncGetEntry({uuid: pUploadId});
    }

    async save(pRes: UploadedResource, pFields: string[] = []): Promise<any> {
        if (pRes.getUID()!=null && pFields.length > 0) {
            return await (this._ctx.getEngineDB()
                .getCollectionOf(UploadedResource.TYPE.getType()) as MongodbDbCollection)
                .asyncUpdateEntry(pRes, {replace: false, $set: pFields});
        } else {
            return await this._ctx.getEngineDB().save(pRes);
        }

    }

    /**
     *
     * @param {*} pRequest
     * @param {*} pResponse
     * @param {*} pCallbacks
     * @method
     */
    async newUpload(pUserAccount: UserAccount, pRequest: Express.Request, pResponse: Express.Response, pOnFinish: any): Promise<UploadedResource> {

        let busboy: any = new BUSBOY({headers: pRequest.headers});

        const upl = new UploadedResource({
            uuid: await this._ctx.getEngineDB().generateFreeUuid(NodeInternalType.UPLOAD)
        })

        //let id: string = Util.randString(16, Util.ALPHANUM);

        let saveTo: string = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(),
            'apk_' + upl.getUID());


        upl.path = saveTo;
        upl.date = (new Date()).getTime();
        upl.setOwner(pUserAccount);

        let self = this;
        await this._ctx.getEngineDB().save(upl);

        (pRequest as any).dxc.sess.addData('proj_upload_id', upl.getUID());

        let fname:string = "";
        busboy.on('file', (fieldname: string, vStream: any, filename: string, encoding: string, mimetype: string) => {
            fname = filename;
            vStream.pipe(_fs_.createWriteStream(saveTo));
        });

        busboy.on('finish', () => {
            (async () => {

                const stat = _fs_.statSync(saveTo);

                await this._ctx.getEngineDB().getFileManager().writeFileStream(
                    'uploads',
                    _fs_.createReadStream(saveTo),
                    upl.getUID(),
                    {
                        uuid: upl.getUID(),
                        size: stat.size,
                        name: fname
                    }
                );
                /*
                this._ctx.getEngineDB().writeUploadStream(
                    _fs_.createReadStream(saveTo),
                    //stat.size,
                    upl.getUID(),
                    {
                        uuid: upl.getUID(),
                        size: stat.size
                    });
*/
                upl.terminate();
                await self.save(upl, ['terminated']);

                pOnFinish(upl);
            })();
        });

        pRequest.pipe(busboy);

        return upl;
    }

    /**
     * To upload a local file to upload DB
     *
     * @param pUser
     * @param pPath
     * @param pFileName
     */
    async uploadFile( pUser:UserAccount, pPath:string, pFileName:string = null, pExclude:string[] = []):Promise<UploadedResource> {

        const upl = new UploadedResource({
            uuid: await this._ctx.getEngineDB().generateFreeUuid(NodeInternalType.UPLOAD)
        });

        upl.path = pPath;
        upl.date = (new Date()).getTime();
        upl.setOwner(pUser);
        upl.algo = CryptoUtils.ALG_SHA256;
        upl.sum = CryptoUtils.sha256_file(pPath);

        // checksum
        if(pExclude.indexOf(upl.sum)>-1){
            // this file already exists, abort
            return null;
        }

        const stat = _fs_.statSync(pPath);

        await this._ctx.getEngineDB().getFileManager().writeFileStream(
            'uploads',
            _fs_.createReadStream(pPath),
            upl.getUID(),
            {
                uuid: upl.getUID(),
                size: stat.size,
                name: pFileName
            }
        );

        upl.terminate();
        await this.save(upl, ['terminated']);

        return upl;
    }

    async downloadStream(pResUID: UploadedResourceUUID): Promise<GridFSBucketReadStream> {
        return this._ctx.getEngineDB().getFileManager().readFileStream('uploads', pResUID);
    }

    async downloadFile(pResUID: UploadedResourceUUID, pOutputPath:string, pOptions?:any): Promise<any> {
        return this._ctx.getEngineDB().getFileManager().readFileTo('uploads', pResUID, pOutputPath);
    }
}