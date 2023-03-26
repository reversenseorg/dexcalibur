import * as _path_ from 'path';
import {NativeAnalyzerProfile} from "../../NativeAnalyzerProfile.js";
import ModelFile from "../../ModelFile.js";
import {ABI, AbiManager, AbiType} from "../../binary/ABI.js";
import {AbiException} from "../../errors/AbiException.js";

import * as Log from '../../Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidNativeAnalyzerProfile implements NativeAnalyzerProfile {

    name:string = "android";
    fmt:string[] = ['ELF'];
    devABI: boolean = false;

    static abiFolders:any = {
        [AbiType.arm64_v8a]  : ['arm64','arm64-v8a'],
        [AbiType.armeabi_v7a]  : ['arm','armeabi-v7a'],
        [AbiType.arm_v5]  : ['armv5','armeabi'],
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



    /**
     * To verify is a file is compatible with a list of ABI
     *
     * It returns the offset of the ABI in the specified list
     *
     *
     * @param {ModelFile} pFile The file to verify
     * @param {ABI[]} pAbiList A list of supported ABI
     * @return {number} Offset of the ABI detected into the specified ABI list (lower offset, is the privilegied version), -1 if not found
     * @method
     */
    isAbiCompliant(pFile:ModelFile, pAbiList:ABI[]):number {

        if(!pFile.isExecutable()){
            throw AbiException.UNDETECTABLE_ABI('File is not flagged executable');
        }
        if(pAbiList.length == 0){
            return -1;
        }

        // Future split using DataScope's path separator instead of serparator from host
        const rpath = pFile.getRelativePath();
        let alt:string[];
        let offset = -1;

        if(rpath == null){
            throw AbiException.UNDETECTABLE_ABI('File path is empty');
        }

        const s = rpath.split(_path_.sep);


        if(s[1]==='lib' && s[2]!=null){
            const top = pAbiList.length-1;
            for(let i=0; i<=top; i++){
                alt = AndroidNativeAnalyzerProfile.abiFolders[pAbiList[i].name];
                for(let j=0; j<alt.length; j++){
                    if(alt[j] === s[2]){
                        offset = top-i;
                        break;
                    }
                }
            }
        }else{
            // todo : check by extracting ABI version from ELF header
            offset = 0;
        }
        return offset;
    }
}