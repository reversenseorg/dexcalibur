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

import Util from "../Utils.js";
import {AuthType} from "../user/auth/AuthTypes.js";


export class ConnectionCredentials {
     type:AuthType = AuthType.PASSWORD;
     username:string;
     cred:any;
     mask_A:string;
     mask_B:string;

     constructor() {
         this.mask_A = Util.randString(16, Util.ALPHANUM);
         this.mask_B = Util.randString(16, Util.ALPHANUM);
     }

    static _mask( pVal:string, pMask:string) :string {
         let o:string = "";
         for(let i=0; i<pVal.length; i++){
             o += pVal.charCodeAt(i) ^ pMask.charCodeAt(i%16);
         }
         return o;
     }

    setType(pType:AuthType):void {
         this.type = pType;
    }

    setCredential(pCred:string):ConnectionCredentials {
        this.mask_B = Util.randString(16, Util.ALPHANUM);
        this.cred = "";
        for(let i=0; i<pCred.length; i++){
            this.cred += pCred.charCodeAt(i) ^ this.mask_B.charCodeAt(i%16);
        }
        return this;
    }

    setUsername(pName:string):ConnectionCredentials {
        this.mask_A = Util.randString(16, Util.ALPHANUM);
        this.username = "";
        for(let i=0; i<pName.length; i++){
            this.username += pName.charCodeAt(i) ^ this.mask_A.charCodeAt(i%16);
        }
        return this;
    }
}