
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

import * as _NodeForge_ from "node-forge";
import {IStringIndex, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../../core/IStringIndex.js";


export interface CertificateValidity {
    notBefore:Date;
    notAfter:Date;
    exp:boolean;
}




// @ts-ignore
const CRYPTO:any = _NodeForge_.default;

// @ts-ignore
export type CertificateField = _NodeForge_.default.pki.CertificateField;
// @ts-ignore
export type PublicKey = _NodeForge_.default.pki.PublicKey;

export enum CertificateFormat {
    PEM="pem",
    DER="der"
}
/**
 * @class
 * @since 1.1.0
 */
export default class Certificate {

    static fromJsonObject( pObj:any) :Certificate {
        let cert:Certificate;
        if(pObj._raw != null){
            cert = Certificate.fromX509(pObj._raw);
        } else{
            cert = null;
        }
        return cert;

    }

    static fromX509( pCertBuffer:Buffer|string, pInputFormat:CertificateFormat = CertificateFormat.DER):any{

        const now:Date = new Date();
        // @ts-ignore
        let obj:_NodeForge_.default.asn1.Asn1;
        let raw:any = null;
        // @ts-ignore
        let cert:_NodeForge_.default.pki.Certificate;

        if(typeof pCertBuffer==="string"){
            raw = pCertBuffer;
        }else{
            raw = pCertBuffer.toString();
        }


        if(pInputFormat==CertificateFormat.DER){
            // @ts-ignore
            cert = _NodeForge_.default.pki.certificateFromAsn1(_NodeForge_.asn1.fromDer( raw))
        }else{
            // @ts-ignore
            cert = _NodeForge_.default.pki.certificateFromPem(raw)
        }

        const c = new Certificate({
            _raw: pCertBuffer,
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



        if(now.getTime() > cert.validity.notAfter.getTime()){
            c.validity.exp = true;
        }else{
            c.validity.exp = false;
        }

        return c;
    }

    private _raw:Buffer|string = null;
    // @ts-ignore
    private _cert:_NodeForge_.default.pki.Certificate = null;

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

    // @ts-ignore
    getX509Certificate():_NodeForge_.default.pki.Certificate {
        return this._cert;
    }

    toJsonObject(pOptions:SerializeOptions = {exclude:{}}){
        const exclude:Nullable<IStringIndex<boolean>> = (pOptions!=null ? pOptions.exclude : {});
        const o:any = {};
        for(const i in this){
            if(exclude!=null && exclude[i]==true) continue;
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
                case '_raw':
                    if(typeof (o._raw)==='string'){
                        o._raw = this._raw;
                    }else if(o._raw != null){
                        o._raw = this._raw.toString;
                    }
                    break;
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