import ModelFile from "./ModelFile.js";
import {ABI} from "./binary/ABI.js";

export interface NativeAnalyzerProfile {

    name:string;

    isAbiCompliant( pFile:ModelFile, pABIs:ABI[]):number;
}