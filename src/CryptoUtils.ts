import * as _crypto_ from "node:crypto";
import {createHash} from "node:crypto";
import {BinaryToTextEncoding} from "crypto";


export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Int32Array |
    Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;

export class CryptoUtils {

    static alg_Md5:_crypto_.Hash = _crypto_.createHash('md5');

    static md5(pIn:_crypto_.BinaryLike, pOutputEncoding:BinaryToTextEncoding='hex', pReset = false):string {
        if(pReset){
            CryptoUtils.alg_Md5 = _crypto_.createHash('md5');
        }

        CryptoUtils.alg_Md5.update(pIn);
        return CryptoUtils.alg_Md5.copy().digest(pOutputEncoding);
    }
}