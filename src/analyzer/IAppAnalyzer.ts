
import {AnalyzerState} from "../AnalyzerState.js";



export interface IAppAnalyzer {
    prepareFullScan():Promise<boolean>;

    /**
     * To get the path of the file or folder to scan by default
     *
     * @return {string}
     * @method
     */
    getDefaultTargetPath():string;

    getAppUid():string;

    getPackageName():string;

    restoreState(pState:AnalyzerState):boolean;

    postScan():void;
}