
import {AnalyzerState} from "../AnalyzerState.js";



export interface IGuiAnalyzer {
    detectGuis():Promise<boolean>;
}