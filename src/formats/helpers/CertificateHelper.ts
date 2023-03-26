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