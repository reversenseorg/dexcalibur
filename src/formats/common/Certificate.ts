
import * as CRYPTO from "node-forge"

export interface CertificateValidity {
    notBefore:Date;
    notAfter:Date;
}

export type CertificateField = CRYPTO.pki.CertificateField;
export type PublicKey = CRYPTO.pki.PublicKey;

/**
 * @class
 * @since 1.1.0
 */
export default class Certificate {

    static fromX509( pCertBuffer:Buffer|string):any{

        let obj:CRYPTO.asn1.Asn1;
        if(typeof pCertBuffer==="string"){
            obj = CRYPTO.asn1.fromDer( pCertBuffer);
        }else{
            obj = CRYPTO.asn1.fromDer( pCertBuffer.toString());
        }

        const cert:CRYPTO.pki.Certificate = CRYPTO.pki.certificateFromAsn1(obj);

        const c = new Certificate({
            _cert: cert,
            //fingerprint:  pCertificate.fingerprint256,
            //infoAccess:  pCertificate.infoAccess,
            issuer: cert.issuer,
            //issuerCertificate: (pCertificate.issuerCertificate!=null ? Certificate.fromX509(pCertificate.issuerCertificate):null),
            //keyUsage: pCertificate.keyUsage,
            publicKey: cert.publicKey,
            serialNumber: cert.serialNumber,
            subject: cert.subject,
            extensions: cert.extensions,
            validity: cert.validity
        });


        return c;
    }

    private _cert:CRYPTO.pki.Certificate = null;

    //fingerprint:string;
    //infoAccess:string;
    issuer: any;
    //issuerCertificate:Certificate = null;
    //keyUsage: string[];
    publicKey: PublicKey;
    serialNumber: string;
    subject: any;
    //subjectAltName: string;
    validity:CertificateValidity;
    extensions:any[];

    remote:string = null;

    /**
     *
     * @param pConfig
     */
    constructor(pConfig:any=null) {
        if(pConfig!=null) for(const i  in pConfig) this[i]=pConfig[i];
    }

    setRemotePath(pCertLocation: string) {
        this.remote = pCertLocation;
    }

    getX509Certificate():CRYPTO.pki.Certificate {
        return this._cert;
    }

    toJsonObject(){
        const o:any = {};
        for(const i in this){
            switch (i){
                /*case 'publicKey':
                    o.publicKey = this.publicKey.export({
                        type: 'pkcs1',
                        format: 'pem'
                    });
                    break;
                case 'issuerCertificate':
                    if(this.issuerCertificate!=null){
                        o.issuerCertificate = this.issuerCertificate.toJsonObject();
                    }else{
                        o.issuerCertificate = null;
                    }
                    break;
                case '_remote':
                    o._remote = this._remote;
                    break;*/
                default:
                    // skip private
                    if(i[0]!="_"){
                        o[i] = this[i];
                    }
                    break;
            }
        }

        return o;
    }
}