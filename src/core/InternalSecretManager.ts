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

