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

import {NodeInternalType}
from "@reversense/dxc-core-api";;


export enum CredentialsFormat {
    PASSWORD,
    CERT,
    EMAIL,
    CUSTOM,
    CREDIT_CARD,
    PHONE,
    ADDRESS
}

export class TestCredentials {

    __: NodeInternalType = NodeInternalType.TEST_CREDS;

    uid:string;

    role:string = null;

    url:string = null;

    type: CredentialsFormat;
}

export class UsernamePasswordTestCredentials extends TestCredentials {

    type = CredentialsFormat.PASSWORD;

    username:string;

    password:string = null;
}


export class CertificateCredentials extends TestCredentials {

    type = CredentialsFormat.CERT;

    username:string;

    password:string = null;
}


export class EmailCredentials extends TestCredentials {

    type = CredentialsFormat.EMAIL;

    email:string;
}



export class AddressCredentials extends TestCredentials {

    type = CredentialsFormat.ADDRESS;

    address:string;

    city:string;

    zip:string;

    country:string;
}



export class CreditCardCredentials extends TestCredentials {

    type = CredentialsFormat.CREDIT_CARD;

    lastname:string = "";

    pan:string;

    exp:string;

    cvv:string;
}



export class CustomCredentials extends TestCredentials {

    type = CredentialsFormat.CERT;

    ppt:{ [name:string]:string} = {};

    constructor() {
        super();
    }

    add(pKey:string, pValue:string){
        this.ppt[pKey] = pValue;
    }
}
