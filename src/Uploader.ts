

import * as _path_ from "path";
import * as _fs_ from 'fs';
import * as _busboy_ from 'busboy';
import Util from './Utils.js';
import * as Express from 'express';
import DexcaliburWorkspace from "./DexcaliburWorkspace.js";

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
    uploads:IUploadSession = null;

    constructor(){
        this.uploads = {};
    }

    /**
     * @method
     */
    static getInstance():Uploader{
        if(gInstance == null){
            gInstance = new Uploader();
        }

        return gInstance;
    }

    /**
     * 
     * @param {*} pUploadId 
     * @method
     */
    getPathOf( pUploadId:string):string{
        return this.uploads[pUploadId];
    }

    /**
     * 
     * @param {*} pRequest 
     * @param {*} pResponse 
     * @param {*} pCallbacks 
     * @method
     */
    newUpload( pRequest:Express.Request, pResponse:Express.Response, pOnFinish:any){

        let busboy:any = new BUSBOY({ headers: pRequest.headers });
        let id:string = Util.randString(16, Util.ALPHANUM);

        let saveTo:string = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(), 
            'apk_'+id);

        this.uploads[id] = saveTo;

        (pRequest as any).dxc.sess.addData('proj_upload_id', id);

        busboy.on('file', function(fieldname:string, file:any, filename:string, encoding:string, mimetype:string) {
            file.pipe(_fs_.createWriteStream(saveTo));
        });

        busboy.on('finish', function(){
            pOnFinish(id);
        });

        return pRequest.pipe(busboy);
    }
}
