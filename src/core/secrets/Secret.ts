import * as _crypto_ from 'crypto';

import {UserAccount} from "../../user/UserAccount.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {CipherBlock, CryptoUtils} from "../../CryptoUtils.js";
import {Nullable} from "../IStringIndex.js";

export type SecretUUID = string;


export interface SecretOptions {
    uid?:SecretUUID;
    type?:SecretType;
    name?:string;
    length?:number;
    description?:string;
    protections?:SecretProtectionType[];
    obb?:Buffer;
    key?:number;
    extra?:any;
}

export enum SecretProtectionType {
    ORG="ou",
    USER="usr",
    APP="au",
    USER_SESSION="usrsess",
    LOCAL_ACCOUNT="acc_loc",
    SSO_ACCOUNT="acc_fed",
    MFA_AUTH="mfa",
    HSM="hsm"
}


export enum SecretType {
    RAW,
    SECRET_KEY,
    RSA_PRIVATE_KEY,
    RSA_PUBLIC_KEY,
    IV,
    SEED
}

export class Secret {

    private uid:SecretUUID;
    private type: SecretType = SecretType.RAW;
    private name: string;
    private description: string;
    private obb: Buffer;
    private length: number = -1;
    private protections:SecretProtectionType[] = [];
    private _prot_hash:string = "";
    private key:number;
    private extra:any ={}


    constructor(pOptions:SecretOptions) {
        this.uid = (pOptions.uid!=null ? pOptions.uid : null);
        this.name = (pOptions.name!=null ? pOptions.name : null);
        this.description = (pOptions.description!=null ? pOptions.description : null);
        this.obb = (pOptions.obb!=null ? pOptions.obb : null);
        this.type = (pOptions.type!=null ? pOptions.type : SecretType.RAW);
        this.key = (pOptions.key!=null ? pOptions.key : -1);
        this.length = (pOptions.length!=null ? pOptions.length : -1);
        this.protections = (pOptions.protections!=null ? pOptions.protections : []);
        this.extra = (pOptions.extra!=null ? pOptions.extra : {});
    }

    setProtectionLevel(pProtection:SecretProtectionType[]){
        let prot = "";
        pProtection.map(x => prot+=x+":");
        this.protections = pProtection;
        this._prot_hash = CryptoUtils.sha256(prot.slice(0,-1),'hex',true);
    }

    setUID(pUID:SecretUUID):void {
        this.uid = pUID;
    }

    getType():SecretType {
        return this.type;
    }

    getUID():SecretUUID {
        return this.uid;
    }

    getName():string {
        return this.name;
    }

    getDescription():string {
        return this.name;
    }

    // SecretProtectionType
    readSecret(pUserAccount:UserAccount, pKeyParts:Record<string, any>): Buffer {

        // unwrap
        // unwrap with composite
        // read

        return this.obb.subarray(this.key,this.length);
    }

    /**
     * Create an Opaque Binary Blob filled with "crypto-grade" random
     *
     * @param pSize
     * @private
     */
    private _createOBB( pSize:number):Buffer {
        const MAX = 65535;
        let oob:Buffer;

        if(pSize>MAX){
            oob = Buffer.alloc(pSize, 0);
            for(let top = pSize; top>0; top -= MAX){
                if(pSize-top>=0){
                    oob.fill(CryptoUtils.randomChunk(MAX), pSize-top, pSize-top+MAX, 'binary');
                }else{
                    break;
                }
            }

            if(pSize%MAX>0){
                oob.fill(CryptoUtils.randomChunk(pSize%MAX), pSize-pSize%MAX, pSize, 'binary');
            }
        }else{
            oob = Buffer.from(CryptoUtils.randomChunk(pSize));
        }

        return oob;
    }

    /**
     *
     * TODO :
     *
     * 1/ generate large OBB
     * 2/ gather key parts (org, app, user, URK (User Root Key), sess, ...)
     * 2'/ derive a secret key SK from key parts with PBKDF2
     * 3/ cipher secret S with AES like S' = AESsk(S)
     * 4/ drop ciphered secret S' in OOB at offset K
     * 5/ transform K with SK to K'
     * 6/ store K' in "key" property
     *
     *
     * @param pSecret
     */
    writeSecretString(pSecret:string, pSecretSize:number):Secret {
        // create 4kB OOB
        let obb_size = 1024*4;
        if(obb_size<pSecretSize){
            obb_size = pSecretSize*4;
        }

        this.obb = this._createOBB(obb_size);

        // generate offset
        this.key = CryptoUtils.random(obb_size-pSecretSize);
        this.length = pSecretSize;

        // obb
        this.obb.write(pSecret.normalize(),this.key, pSecretSize, 'utf-8');

        return this;
    }

    /**
     * To unwrap own  buffer
     *
     * @param pInObb
     * @param pOptions
     */
    private _unwrapOBB(pOptions:any):any {
        if(this.protections.length>0){

        }else{
            return this.obb.subarray(this.key,this.key+this.length);
        }
    }


    /**
     * To wrap a buffer (typically from another secret) with this secret
     *
     * @param pInObb
     * @param pOptions
     */
    unwrapOBB(pInObb:Buffer, pOptions:Record<string, any> = {}):Nullable<Buffer> {

        let pOutObb:Nullable<Buffer> = null;

        switch (this.type){
            case SecretType.SECRET_KEY:
                if(pOptions.iv==null){
                    throw new Error("Cannot unwrap secret : IV is missing");
                }

                /*
                console.log(this.name+" unwrapOBB >")
                console.log("KEY : ",Buffer.from(JSON.parse(this._unwrapOBB(pOptions.extra).toString()).k,'base64'));
                console.log("IV : ",pOptions.iv._unwrapOBB(pOptions.extra));
                console.log("AUTH TAG : ",pOptions.authTag);
                console.log("CIPHERED BLOB : ",pInObb);*/

                const out = CryptoUtils.decipherAES(
                    pInObb,
                    _crypto_.createSecretKey(Buffer.from(JSON.parse(this._unwrapOBB(pOptions.extra).toString()).k,'base64')),
                    pOptions.iv._unwrapOBB(pOptions.extra),
                    pOptions.authTag
                );
                pOutObb = Buffer.from(out,'hex');
                //console.log("DECIPHERED BLOB : ",pOutObb);
                break;
        }


        return pOutObb;
    }


    /**
     * To wrap a buffer (typically from another secret) with this secret
     *
     * @param pInObb
     * @param pOptions
     */
    wrapOBB(pInObb:Buffer, pOptions:Record<string, any> = {}):CipherBlock {

        let out:CipherBlock = {
            blob: null,
            authTag: null,
            iv: null
        };

        switch (this.type){
            case SecretType.SECRET_KEY:
                if(pOptions.iv==null){
                    throw new Error("Cannot unwrap secret : IV is missing");
                }


                const k = _crypto_.createSecretKey(Buffer.from(JSON.parse(this._unwrapOBB(pOptions.extra).toString()).k,'base64'));


                /*
                console.log(`${this.name} wrapOBB > `);
                console.log("KEY : ",Buffer.from(k.export({format:'jwk'}).k,'base64'));
                console.log("IV : ",pOptions.iv._unwrapOBB(pOptions.extra));
                console.log("CLEAR BLOB : ",pInObb);*/

                out = CryptoUtils.cipherAES(
                    pInObb.toString('hex'),
                    k,
                    pOptions.iv._unwrapOBB(pOptions.extra)
                );

                //console.log("AUTH TAG : ",out.authTag);
                //console.log("CIPHERED BLOB : ",out.blob);

                //console.log(`${this.name} wrapOBB [iv=${out.iv.toString('hex')}, authTag=${out.authTag.toString('hex')}, key=${Buffer.from(k.export({format:'jwk'}).k,'base64').toString('hex')}] `);
                break;
        }

        return out;
    }

    isProtectedByOrg():boolean {
        return (this.protections.find(x => x==SecretProtectionType.ORG)!=null);
    }

    unwrap( pUser:UserAccount, pWrappers:any):Nullable<Buffer> {

        let layerObb:Nullable<Buffer> = this.obb;

        // unwrap org layer
        if(this.isProtectedByOrg()){
            let orgOpts = pWrappers[SecretProtectionType.ORG];

            if(orgOpts==null || orgOpts.key==null || orgOpts.iv==null){
                throw new Error("Secret protected by SecretProtectionType.ORG cannot be unwrap : missing keys or ivs");
            }

            let authTag = (this.extra[SecretProtectionType.ORG]!=null ? this.extra[SecretProtectionType.ORG].authTag : null);


            layerObb = (orgOpts.key as Secret).unwrapOBB( layerObb, {
                iv:orgOpts.iv,
                authTag: authTag.buffer,
                extra:pWrappers
            });

            //console.log(layerObb);
        }

        return layerObb.subarray(this.key,this.key+this.length);
    }

    addProtection(pProtection:SecretProtectionType, pWrapKeys:Record<string,Secret>):Secret {
        // clone
        const s = new Secret({
            name: this.name,
            uid: this.uid,
            description: this.description,
            protections: this.protections.concat([pProtection]),
            key: this.key,
            length: this.length,
            type:this.type,
            extra: this.extra
        });

        // add protection to list
        let prot = "";
        let cb:CipherBlock;

        this.protections.map(x => prot+=x+":");
        prot+=pProtection;
        this._prot_hash = CryptoUtils.sha256(prot.slice(0,-1),'hex',true);

        let blob = new Uint8Array(this.obb.length);
        this.obb.copy(blob,0,0, this.obb.length);
        s.obb = Buffer.from(blob);
        // write over secret
        blob.fill(0,0,blob.length);

        if(pProtection==SecretProtectionType.ORG){
            cb = pWrapKeys.key.wrapOBB(this.obb, { iv: pWrapKeys.iv });
            s.obb = cb.blob;

            s.extra[SecretProtectionType.ORG] = {
                authTag: cb.authTag
            };

            // update size
            if(s.obb==null){
                throw new Error("OBB is null, something gone wrong");
            }
        }

        return s;
    }

    destroy(){
        const size = this.obb.length;
        for(let i=0;i<size;i++) this.obb.writeInt8(42,i);
        for(let i=0;i<size;i++) this.obb.writeInt8(0,i);
        delete this.obb;
    }

    toJsonObject(pZone:SecurityZone = SecurityZone.PUBLIC):any {
        const o:any = {
            uid: this.uid,
            name: this.name,
            description: this.description,
            obb: null,
            protections: this.protections,
            type:this.type
        };

        if(pZone===SecurityZone.PRIVATE){
            o.obb = this.obb;
            o.length = this.length;
            o.key = this.key;
            o.extra = this.extra;
        }

        return o;
    }

    static from(pOptions:SecretOptions):Secret {
        const s = new Secret(pOptions);
        s.obb =  (pOptions.obb as any).buffer;
        return s;
    }
}