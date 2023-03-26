import ModelFile from "../ModelFile.js";
import DexcaliburProject from "../DexcaliburProject.js";

export interface IFileAnalyzer {
    analyze(pPath:string, pOptions:any):ModelFile;
    analyzeFolder(pPath:string, pContext:DexcaliburProject, pSkipIf:any): ModelFile[];
}