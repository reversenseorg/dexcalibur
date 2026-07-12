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

import Certificate, {CertificateFormat} from "../common/Certificate.js";
import * as _fs_ from "fs";
import * as CRYPTO from "node-forge"

export default class CertificateHelper {


    static parseX509( pCertPath:string, pFormat:CertificateFormat = CertificateFormat.DER, pCertLocation:string = null):Certificate {

        const buf = _fs_.readFileSync(pCertPath, {encoding:'binary', flag:'r' });

        const cert = Certificate.fromX509(buf,pFormat);

        if(pCertLocation!=null){
            cert.setRemotePath(pCertLocation);
        }

        return cert;
    }

    static isCertificate( pBuffer:Buffer):boolean {
        // todo
        return false;
    }



    static generateX509Certificate( pInfo:any):CRYPTO.pki.Certificate {
        // todo
        return null;
    }
}