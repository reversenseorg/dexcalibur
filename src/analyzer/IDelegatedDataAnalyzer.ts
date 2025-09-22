import DataScope from "../DataScope.js";
import {mergeMap, Observable} from "rxjs";
import ModelFile from "../ModelFile.js";
import {DataAnalyzer} from "../DataAnalyzer.js";
import {IDbCollection} from "@dexcalibur/dexcalibur-orm";


export interface IDelegatedDataAnalyzer {

    scan(path:string, pScope:DataScope, pRelPath?:string):Promise<Observable<ModelFile[]>>;

    indexFilesIn(pScope:DataScope):Promise<Observable<ModelFile[]>>;

    detectFmtFiles(pFiles:ModelFile[], pScope:DataScope):Promise<Observable<ModelFile[]>>;

}