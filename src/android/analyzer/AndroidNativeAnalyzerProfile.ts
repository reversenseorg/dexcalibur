import {NativeAnalyzerProfile} from "../../NativeAnalyzerProfile";
import ModelFile from "../../ModelFile";
import {ABI, AbiManager, AbiType} from "../../binary/ABI";


export default class AndroidNativeAnalyzerProfile implements NativeAnalyzerProfile {

    name:string = "android";
    fmt:string[] = ['ELF'];
    devABI: boolean = false;

    static abiFolders:any = {
        [AbiType.arm64_v8a]  : ['arm64','arm64-v8a','armeabi'],
        [AbiType.armeabi_v7a]  : ['arm','armeabi-v7a','armeabi'],
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
     * @param pFile
     * @param pAbiList
     */
    isAbiCompliant(pFile:ModelFile, pAbiList:ABI[]):boolean {

        if(!pFile.isExecutable()) return false;

        const rpath = pFile.getRelativePath();
        let alt:string[];
        let compliant = false;
        if(rpath.startsWith('/lib/')){
            for(let i=0; i<pAbiList.length; i++){

                alt = AndroidNativeAnalyzerProfile.abiFolders[pAbiList[i].name];

                for(let j=0; j<alt.length; j++){
                    if(rpath.startsWith('/lib/'+alt[j]+'/')){
                        compliant = true;
                        break;
                    }
                }
            }
        }else{
            // todo : check by extracting ABI version from ELF header
            compliant = true;
        }
        return compliant;
    }
}