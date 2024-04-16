import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";

export interface IFileAnalyzer {

    /**
     * File analyzer name (binwalk, file, r2bin, ...)
     */
    name:string;

    analyze(pPath:string, pOptions:any):ModelFile;
    analyzeFolder(pPath:string, pContext:DexcaliburProject, pSkipIf:any): ModelFile[];
}