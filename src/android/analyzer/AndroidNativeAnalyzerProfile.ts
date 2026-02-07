import {NativeAnalyzerProfile} from "../../NativeAnalyzerProfile.js";
import { AbiType} from "../../binary/ABI.js";


export default class AndroidNativeAnalyzerProfile implements NativeAnalyzerProfile {

    name:string = "android";
    fmt:string[] = ['ELF'];
    devABI: boolean = false;

    static abiFolders:any = {
        [AbiType.arm64_v8a]  : ['arm64','arm64-v8a'],
        [AbiType.armeabi_v7a]  : ['arm','armeabi-v7a'],
        [AbiType.arm_v5]  : ['armv5','armeabi'],
        [AbiType.armeabi]  : ['armeabi'],
        [AbiType.x86]  : ['x86','i386','ia-32'],
        [AbiType.x86_64]  : ['x86_64','x64'],
        [AbiType.mips]  : ['mips'],
        [AbiType.mips64]  : ['mips64'],
    };

    constructor(pConfig:any) {
        for(let i in pConfig){
            this[i] = pConfig[i];
        }
    }
}