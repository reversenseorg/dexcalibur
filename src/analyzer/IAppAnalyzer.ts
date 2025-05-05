
import {AnalyzerState} from "../AnalyzerState.js";
import {AppIcon} from "../AppIcon.js";



export interface IAppAnalyzer {
    prepareFullScan(pNewProject:boolean):Promise<boolean>;

    /**
     * To get the path of the file or folder to scan by default
     *
     * @return {string}
     * @method
     */
    getDefaultTargetPath():string;

    getAppUid():string;

    getPackageName():string;

    importMeta():Promise<boolean>;

    hasMissingMeta():boolean;

    restoreState(pState:AnalyzerState):boolean;

    postScan():void;

    extractAppIcons():Promise<AppIcon[]>;

    performXrefAnalysis():Promise<any>;

    isReady():boolean;

    importToSlave():Promise<any>;
}