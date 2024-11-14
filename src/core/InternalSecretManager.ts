import * as _fs_ from "fs";
import * as _path_ from "path";
import {UserAccount} from "../user/UserAccount.js";
import {InternalSecretException} from "./secrets/error/InternalSecretException.js";

export class InternalSecretManager {

    private _folder:string;

    constructor(pSecretsFolder:string) {
        this._folder = pSecretsFolder;
    }

    /**
     * To read a secret from the filesystem
     *
     * @param {string} pName
     * @method
     */
    readRawSecret(pName:string):Buffer {
        const path = _path_.join( this._folder, 'secrets', pName );
        if(!_fs_.existsSync(path)){
            throw InternalSecretException.SECRET_NOT_FOUND(pName);
        }

        const p = _fs_.readFileSync(path);
        console.log(p.toString());
        return p;
    }

    storeSecret(pName:string, pSecret:any, pUser?:UserAccount):void{

    }
}

