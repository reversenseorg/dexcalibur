import {IDbCollection} from "../persist/orm/DbAbstraction.js";


export interface IAnalyzerUnit {
    getIndex(pAny:any) :IDbCollection;
}