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

import * as _fs_ from "fs"
import {IncomingValue, SanitizedValue, UnsafeValue} from "../security/SanitizedValue.js";
import {ValidationRule} from "@reversense/dexcalibur-orm";
import {AbstractSettings} from "./AbstractSettings.js";

export enum SslCertFmt {
    BLOB=0,
    PATH
}

/**
 * Represents SSL configuration options for establishing secure connections.
 * @interface
 */
export interface SslOptions {
    /**
     * Flag to enforce SSL or not.
     * If TRUE, clear-text traffic over "http" is forbidden.
     * @type {boolean}
     */
    forceHttps?: boolean;

    /**
     * The SSL certificate path or content.
     *
     * @type {string|undefined}
     */
    sslCert?: string;

    /**
     * The format of SSL certificate : a BLOB of a PATH
     *
     * @type {SslCertFmt}
     */
    certFmt?:SslCertFmt;

    /**
     * The SSL Key for establishing a secure connection.
     *
     * @type {string}
     */
    sslKey?: string;

    /**
     * The protocols variable represents the available transport layer security (TLS) protocols.
     *
     * @type {string}
     * @typedef {('TLSv1.2'|'TLSv1.3')} Protocols
     * @description The value of the protocols variable can be either 'TLSv1.2' or 'TLSv1.3',
     * representing the version of the TLS protocol that should be used for secure communication.
     * TLSv1.2 and TLSv1.3 are the currently supported versions of TLS.
     */
    protocols?:"TLSv1.2"|"TLSv1.3";

    /**
     * Extra options see `https.ServerOptions<any,any>`from `https`module
     * @type {https.ServerOptions}
     */
    extraOptions?:any;
}

/**
 * Class to store SSL settings
 * @class
 */
export class SslSettings extends AbstractSettings {


    static VALIDATE = {
        forceHttps: ValidationRule.bool(),
        sslCert: ValidationRule.utf8String(),
        certFmt: ValidationRule.newPinklistAssert([SslCertFmt.BLOB,SslCertFmt.PATH]),
        sslKey: ValidationRule.utf8String(),
        protocols: ValidationRule.newPinklistAssert(["TLSv1.2","TLSv1.3"]),
        extraOptions: ValidationRule.nullableObj(),
    }
    /**
     * Flag to enforce SSL or not.
     * If TRUE, clear-text traffic over "http" is forbidden.
     * @type {boolean}
     */
    forceHttps: boolean = true

    /**
     * The path of a file containing the SSL certificate path or content.
     *
     * @type {string|undefined}
     */
    sslCert: string = "";

    /**
     * The format of SSL certificate : a BLOB of a PATH
     *
     * @type {SslCertFmt}
     */
    certFmt: SslCertFmt = SslCertFmt.BLOB;

    /**
     * The path of a file containing the SSL Key for establishing a secure connection.
     *
     * @type {string}
     */
    sslKey: string = "";

    /**
     * The protocols variable represents the available transport layer security (TLS) protocols.
     *
     * @type {string}
     * @typedef {('TLSv1.2'|'TLSv1.3')} Protocols
     * @description The value of the protocols variable can be either 'TLSv1.2' or 'TLSv1.3',
     * representing the version of the TLS protocol that should be used for secure communication.
     * TLSv1.2 and TLSv1.3 are the currently supported versions of TLS.
     */
    protocols = "TLSv1.3";

    /**
     * Extra options see `https.ServerOptions<any,any>`from `https`module
     * @type {https.ServerOptions}
     */
    extraOptions:any = {}

    /**
     *
     * @param pOptions
     */
    constructor(pParent:AbstractSettings, pOptions:SslOptions) {
        super(pParent);

        if(pOptions.forceHttps!=null) this.forceHttps = pOptions.forceHttps;
        if(pOptions.sslCert!=null) this.sslCert = pOptions.sslCert;
        if(pOptions.sslKey!=null) this.sslKey = pOptions.sslKey;
        if(pOptions.protocols!=null) this.protocols = pOptions.protocols;
        if(pOptions.certFmt!=null) this.certFmt = pOptions.certFmt;
        if(pOptions.extraOptions!=null) this.extraOptions = pOptions.extraOptions;
    }

    isEnforcing():boolean {
        return this.forceHttps;
    }

    getProtocols():string {
        return this.protocols;
    }

    /**
     * To get the SSL certficate to
     *
     * @returns {Buffer} A buffer containing the certificate
     * @method
     */
    getSslCert():Buffer {
        switch (this.certFmt){
            case SslCertFmt.PATH:
                if(!_fs_.existsSync(this.sslCert)){
                    throw new Error("File of SSL Certifcate noy found");
                }
                return Buffer.from(_fs_.readFileSync(this.sslCert,{encoding:'hex'}),'hex');
            case SslCertFmt.BLOB:
                return Buffer.from(this.sslCert,'hex');
            default:
                throw new Error("Ssl Certifcate format not supported");
                break;
        }
    }

    sanitize(pName: string, pValue: any): IncomingValue {

        if(SslSettings.VALIDATE[pName]==null){
            return new UnsafeValue(pName,pValue);
        }

        if(SslSettings.VALIDATE[pName].test(pValue)){
            return new SanitizedValue(pName, pValue);
        }else{
            return new UnsafeValue(pName,pValue);
        }
    }


    update(pValue: IncomingValue) {
        if(SslSettings.VALIDATE[pValue.getName()]!=null){
            this[pValue.getName()] = pValue.getValue();
        }
    }

    toObject(): any {
        return this.toJsonObject();
    }

    /**
     * @method
     */
    toJsonObject():any{
        return {
            forceHttps: this.forceHttps,
            sslCert: this.sslCert,
            sslKey: this.sslKey,
            protocols: this.protocols,
            certFmt: this.certFmt,
            extraOptions: this.extraOptions
        };
    }
}

