'use strict';

const _fs_ = require('fs');
const _path_ = require('path');
const _busboy_ = require('busboy');

const Utils = require('./Utils');
const DexcaliburWorkspace = require("./DexcaliburWorkspace");

var gInstance = null;

/**
 * @class
 */
class Uploader
{
    constructor(){
        this.uploads = {};
    }

    /**
     * @method
     */
    static getInstance(){
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
    getPathOf( pUploadId){
        return this.uploads[pUploadId];
    }

    /**
     * 
     * @param {*} pRequest 
     * @param {*} pResponse 
     * @param {*} pCallbacks 
     * @method
     */
    newUpload( pRequest, pResponse, pOnFinish){

        let busboy = new _busboy_({ headers: pRequest.headers });
        let id = Utils.randString(16, Utils.ALPHANUM);

        let saveTo = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(), 
            'apk_'+id);

        this.uploads[id] = saveTo;

        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            file.pipe(_fs_.createWriteStream(saveTo));
        });

        busboy.on('finish', function(){
            pOnFinish(id);
        });

        return pRequest.pipe(busboy);
    }
}

module.exports = Uploader;