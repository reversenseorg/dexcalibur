import {IDbCollection} from "@dexcalibur/dexcalibur-orm";


export interface IAnalyzerUnit {
    getIndex(pAny:any) :IDbCollection;
}