import {IDbCollection} from "../persist/orm/DbAbstraction";


export interface IAnalyzerUnit {
    getIndex(pAny:any) :IDbCollection;
}