import ModelFile from "../ModelFile";
import DexcaliburProject from "../DexcaliburProject";

export interface IFileAnalyzer {
    analyze(pPath:string, pOptions:any):ModelFile;
    analyzeFolder(pPath:string, pContext:DexcaliburProject, pSkipIf:any): ModelFile[];
}