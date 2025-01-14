

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

const BUSBOY = _busboy_.default;

interface IUploadSession {
    [id :string] :string
}

var gInstance:Uploader = null;

/**
 * @class
 */
export default class Uploader
{
    private _ctx:DexcaliburEngine;

    uploads:IUploadSession = null;

    constructor(pEngine:DexcaliburEngine){
        this.uploads = {};
        this._ctx = pEngine;
    }

    /**
     * @method
     */
    static getInstance(pEngine:Nullable<DexcaliburEngine> = null):Uploader{
        if(gInstance == null){
            if(pEngine==null){
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
    async getPathOf( pUploadId:UploadedResourceUUID):Promise<string>{
       const res = await this.getResource(pUploadId);

       if(res==null){
           throw new Error("Uploaded resource not found : "+pUploadId);
       }

       return res.path;
    }

    /**
     *
     * @param {*} pUploadId
     * @method
     */
    async getResource( pUploadId:UploadedResourceUUID):Promise<UploadedResource>{
        return await (this._ctx.getEngineDB()
            .getCollectionOf(UploadedResource.TYPE.getType()) as MongodbDbCollection)
            .asyncGetEntry({ uuid: pUploadId });
    }

    /*
    get PathOf( pUploadId:string):string{

        return this.uploads[pUploadId];
    }
     */

    async save(pRes:UploadedResource, pFields:string[] = []):Promise<any> {
        if(pFields.length>0){
            return await (this._ctx.getEngineDB()
                .getCollectionOf(UploadedResource.TYPE.getType()) as MongodbDbCollection)
                .asyncUpdateEntry( pRes, {replace:false, $set:pFields });
        }else{
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
    async newUpload( pUserAccount:UserAccount, pRequest:Express.Request, pResponse:Express.Response, pOnFinish:any){

        let busboy:any = new BUSBOY({ headers: pRequest.headers });

        const upl = new UploadedResource({
            uuid: await this._ctx.getEngineDB().generateFreeUuid(NodeInternalType.UPLOAD)
        })

        let id:string = Util.randString(16, Util.ALPHANUM);

        let saveTo:string = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(), 
            'apk_'+id);

        // deprecated because stateful
        this.uploads[id] = saveTo;

        upl.path = saveTo;
        upl.date = (new Date()).getTime();
        upl.setOwner(pUserAccount);

        let self = this;
        await this._ctx.getEngineDB().save(upl);

        (pRequest as any).dxc.sess.addData('proj_upload_id', id);

        busboy.on('file', function(fieldname:string, file:any, filename:string, encoding:string, mimetype:string) {
            file.pipe(_fs_.createWriteStream(saveTo));
        });

        busboy.on('finish', function(){
            (async ()=>{
                upl.terminate();

                await self.save(upl, ['terminated']);

                pOnFinish(upl);
            })();
        });

        return pRequest.pipe(busboy);
    }
}
