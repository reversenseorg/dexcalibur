import {BufferEncoding} from "typescript";
import DexcaliburProject from "../DexcaliburProject.js";
import ModelStringValue from "../ModelStringValue.js";
import ModelClass from "../ModelClass.js";
import {Tag} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "@dexcalibur/dxc-core-api";

export interface IResults<T> {
    ok: T;
    invalid: any[];
    strings?:ModelStringValue[];
    cls?:Record<string, ModelClass>;
}

export interface IParserOptions {
    encoding:BufferEncoding;
    raw:boolean;
    tags?:Nullable<Tag[]>
}

export enum IParserFeature {
    NONE,
    MAGIC_CHECK,
    STRUCT,
    CONVERT
}


export interface IParser<T> {

    FEATURES:IParserFeature[];

    UID:string;

    FORMAT_NAMES:string[];

    FILE_EXTENSIONS:string[];

    fromBuffer(pBuffer:Buffer, pOffset:number, pOptions:any):Promise<IResults<T>>;

    setContext(pProject:DexcaliburProject):void;
}

export interface IMagicParser<T> extends IParser<T> {
    hasSignature(pBuffer:Buffer, pOffset:number, pOptions:any):Promise<boolean>;
}