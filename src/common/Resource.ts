import * as _fs_ from "fs";
import {INode} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CryptoUtils} from "../CryptoUtils.js";
import Util from "../Utils.js";
import {MarketplaceException} from "../marketplace/MarketplaceException.js";

export interface ResourceCheckums {
    md5:string;
    sha256:string;
}


export interface ResourceDates {
    create:number;
    modified:number;
    dropped:number;
}


export interface ResourceOptions {
    type?:NodeInternalType,
    path?:string,
    filename?:string,
    checksum?:ResourceCheckums,
    dates?:ResourceDates
    signature?:string
}

/**
 * Represent a Resource in a COTS from marketplace
 *
 * @class
 */
export class Resource {

    private _type:NodeInternalType;

    /**
     * Path relative to root folder of FsStorage
     * @private
     */
    private _path:string;

    /**
     * Path relative to root folder of FsStorage
     * @private
     */
    private _filename:string;

    private _size:number;

    private _checksum:ResourceCheckums = {
        md5:null,
        sha256:null,
    };

    private _dates:ResourceDates = {
        create: -1,
        modified: -1,
        dropped: -1
    };

    private _signature:string;

    constructor(pOptions:ResourceOptions) {
        this._path = pOptions.path!=null ? pOptions.path : null;
        this._filename = pOptions.filename!=null ? pOptions.filename : null;

        if(pOptions.dates!=null){
            this._dates = pOptions.dates;
        }
        if(pOptions.checksum!=null){
            this._checksum = pOptions.checksum;
        }

        this._type = pOptions.type!=null ? pOptions.type : null;
        this._signature = pOptions.signature!=null ? pOptions.signature : null;
    }

    /**
     * To read the content of the resource
     */
    readContent():Buffer {
        return _fs_.readFileSync(this._path);
    }

    getType():NodeInternalType {
        return this._type;
    }

    getMd5Checksum():string {
        return this._checksum.md5;
    }

    getSha2565Checksum():string {
        return this._checksum.sha256;
    }

    /**
     *
     * @param pData
     */
    writeContent(pData:Buffer):void {
        try{

            // write data and update update size
            _fs_.writeFileSync(this._path, pData);
            this._size = pData.length;

            // update checksum
            this._checksum.md5 = CryptoUtils.md5(pData, 'hex');
            this._checksum.sha256 = CryptoUtils.sha256(pData, 'hex');

            // update dates
            if(this._dates.create==-1){
                this._dates.create = Util.time();
            }
            this._dates.modified = Util.time();

        }catch (err){
            throw MarketplaceException.RESOURCE_WRITE_FAILURE(this);
        }
    }

    /**
     * To delete files of the resource
     *
     * @returns {boolean} TRUE is success, else FALSE
     * @method
     */
    delete():boolean {
        let res:boolean;
        try{
            if(_fs_.existsSync(this._path)){
                _fs_.unlinkSync(this._path);
            }
            res = true;
        }catch (err){
            res = false;
        }
        return res;
    }

    getPath():string {
        return this._path;
    }
    /**
     *
     */
    toJsonObject(pPrivate = false):any {
        const o:any = {
            path:(pPrivate? this._path : null),
            filename:this._filename,
            checksum:this._checksum,
            dates:this._dates,
            signature:this._signature,
            type: this._type
        };

        return o;
    }
}