import DexcaliburEngine from "../../DexcaliburEngine.js";
import {Secret, SecretOptions, SecretProtectionType} from "./Secret.js";
import {Nullable} from "../IStringIndex.js";

export type SecretDescriptor = number;

export class SecretManager {

    private _ctx:DexcaliburEngine;

    constructor( pCtx:DexcaliburEngine) {
        this._ctx = pCtx;
    }

    private _gatherParts(pProtections:SecretProtectionType[]):Nullable<Record<SecretProtectionType, any>> {
        return null;
    }
}