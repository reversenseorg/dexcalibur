import {NativeAnalyzerProfile} from "../../NativeAnalyzerProfile.js";
import ModelFile from "../../ModelFile.js";
import {ABI} from "../../binary/ABI.js";


export default class IosNativeAnalyzerProfile implements NativeAnalyzerProfile {

    name:string = "ios";
    devABI: boolean = false;

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
    isAbiCompliant(pFile:ModelFile, pAbiList:ABI[]):number {
        return 0;
    }
}