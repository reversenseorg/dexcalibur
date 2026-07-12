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

import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {DexcaliburConnectionParams} from "./DexcaliburConnectionParams.js";
import {ConnectionCredentials} from "./ConnectionCredentials.js";
import {ConnectionHandler} from "./ConnectionHandler.js";
import {AuthType} from "../user/auth/AuthTypes.js";
import {ConnectionManagerException} from "../errors/ConnectionManagerException.js";


export class ConnectionManager {

    ctx:IDexcaliburEngine;

    constructor(pInstance:IDexcaliburEngine) {
        this.ctx = pInstance;
    }

    async open( pParam:DexcaliburConnectionParams, pCred:ConnectionCredentials):Promise<ConnectionHandler> {
        if(pParam==null) throw ConnectionManagerException.EMPTY_CONN_PARAMS();
        if(pCred==null) throw ConnectionManagerException.EMPTY_CREDS();
        if(pCred.type !== pParam.authType) throw ConnectionManagerException.AUTH_TYPE_UNSUPPORTED();

        let handler;
        try{
            handler = new ConnectionHandler(pParam);
            handler.doAuthentication(pCred);
        }catch(err){

        }

        return handler;

    }
}