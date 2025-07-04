import * as _crypto_ from "node:crypto";
import * as _fs_ from "fs";
import {createHash} from "node:crypto";
import {BinaryToTextEncoding} from "crypto";


export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Int32Array |
    Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;

export type HashAlgo = "md5"|"sha256"|"sha512";
export enum AesKeyLength {
    AES128=128,
    AES192=192,
    AES256=256
}

export interface CipherBlock {
    blob: Buffer,
    authTag: Buffer,
    iv: Buffer
}

export class CryptoUtils {

    static ALG_MD5:HashAlgo = "md5";
    static ALG_SHA256:HashAlgo = "sha256";
    static ALG_SHA512:HashAlgo = "sha512";



    static alg_Md5:_crypto_.Hash = _crypto_.createHash(CryptoUtils.ALG_MD5);
    static alg_Sha256:_crypto_.Hash = _crypto_.createHash(CryptoUtils.ALG_SHA256);

    static md5(pIn:_crypto_.BinaryLike, pOutputEncoding:BinaryToTextEncoding='hex', pReset = false):string {
        if(pReset){
            CryptoUtils.alg_Md5 = _crypto_.createHash(CryptoUtils.ALG_MD5);
        }

        CryptoUtils.alg_Md5.update(pIn);
        return CryptoUtils.alg_Md5.copy().digest(pOutputEncoding);
    }

    static sha256(pIn:_crypto_.BinaryLike, pOutputEncoding:BinaryToTextEncoding='hex', pReset = false):string {
        if(pReset){
            CryptoUtils.alg_Sha256 = _crypto_.createHash(CryptoUtils.ALG_SHA256);
        }

        CryptoUtils.alg_Sha256.update(pIn);
        return CryptoUtils.alg_Sha256.copy().digest(pOutputEncoding);
    }

    static stringEqual( pStringA:string, pStringB:string, pAlgo:HashAlgo = CryptoUtils.ALG_SHA256):boolean {
        switch (pAlgo){
            case CryptoUtils.ALG_SHA256:
                return (CryptoUtils.sha256(pStringA, 'hex', true)===CryptoUtils.sha256(pStringB, 'hex', true));
            case CryptoUtils.ALG_MD5:
                // TODO : add security exception to prevent collision
                return (CryptoUtils.md5(pStringA)===CryptoUtils.md5(pStringB));
            default:
                return false;
        }
    }

    static hmac_sha256(pIn:_crypto_.BinaryLike, pSecretKey:string, pOutputEncoding:BinaryToTextEncoding='hex', pReset = false):string {
        const hmac = _crypto_.createHmac(CryptoUtils.ALG_SHA256, pSecretKey);
        hmac.update(pIn)
        return hmac.digest(pOutputEncoding);
    }

    static pbkdf2(pParts:string[], pSalt:string, pKeylen = 64, pAlg = CryptoUtils.ALG_SHA512, pIter = 100):Buffer {
        return _crypto_.pbkdf2Sync(pParts.join(':'), pSalt, pIter, pKeylen, pAlg);
    }

    static randomChunk(pSize:number):Uint8Array {
        const chunk = new Uint8Array(pSize);
        _crypto_.getRandomValues(chunk);
        return chunk;
    }

    static random(pMax:number, pMin = 0):number {
        return _crypto_.randomInt(pMin, pMax);
    }


    static generateAesKey(pKeyLen:AesKeyLength):_crypto_.KeyObject {
        return _crypto_.generateKeySync('aes', { length: pKeyLen });
    }

    static cipherAES( pBuffer:string, pKey:any, pIv:any):CipherBlock {
        const res:CipherBlock = {
            blob: null,
            authTag: null,
            iv: null
        };
        const cipher = _crypto_.createCipheriv('aes-256-gcm', pKey, pIv);
        const blob = cipher.update(pBuffer, 'hex', 'hex');

        res.blob = new Buffer(blob,'hex');
        cipher.final('hex')
        res.authTag = cipher.getAuthTag();
        res.iv = pIv;

        return res;
    }

    static decipherAES( pBuffer:Buffer, pKey:any, pIv:any, pAuthTag:any):string {
        const decipher = _crypto_.createDecipheriv('aes-256-gcm', pKey, pIv, { authTagLength: 16});
        decipher.setAuthTag(pAuthTag)
        const out = decipher.update(pBuffer.toString('hex'), 'hex', 'hex');
        decipher.final();
        return out;
    }

    static randomUUID(pLength: number):string {
        return "";
    }

    /**
     * To compute the sha256 checksum of a file
     *
     * @param {string} pPath File path
     * @return {string} Checksum
     * @method
     * @static
     */
    static sha256_file(pPath:string):string {
        return CryptoUtils.sha256(
            _fs_.readFileSync(pPath, {encoding:'utf8'}),
            'binary', true);
    }
}