import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;


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
