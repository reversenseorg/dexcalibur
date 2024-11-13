import * as _fs_ from "fs";
import * as _path_ from "path";
import {RuntimeSecurityException} from "../errors/RuntimeSecurityException.js";
import {UserAccount} from "../user/UserAccount.js";

export class InternalSecretManager {

    private _folder:string;

    constructor(pSecretsFolder:string) {
        this._folder = pSecretsFolder;
    }

    readRawSecret(pName:string):Buffer {
        const path = _path_.join( this._folder, 'secrets', pName );
        if(!_fs_.existsSync(path)){
            throw new Error("Secret not found ");
        }

        const p = _fs_.readFileSync(path);
        console.log(p.toString());
        return p;
    }

    storeSecret(pName:string, pSecret:any, pUser?:UserAccount):void{

    }
}

