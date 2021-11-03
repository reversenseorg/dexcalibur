import ModelFile from "./ModelFile";
import {ABI} from "./binary/ABI";

export interface NativeAnalyzerProfile {

    name:string;

    isAbiCompliant( pFile:ModelFile, pABIs:ABI[]):number;
}