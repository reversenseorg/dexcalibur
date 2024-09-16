import DataScope from "../DataScope.js";
import {Observable} from "rxjs";
import ModelFile from "../ModelFile.js";
import {DataAnalyzer} from "../DataAnalyzer.js";


export interface IDelegatedDataAnalyzer {

    scan(path:string, pScope:DataScope, pRelPath?:string):Promise<Observable<ModelFile[]>>;

    indexFilesIn(pScope:DataScope):Promise<Observable<ModelFile[]>>

}