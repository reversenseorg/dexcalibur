import IosApplication from "./IosApplication";
import DexcaliburProject from "../DexcaliburProject";
import {AnalyzerState} from "../AnalyzerState";
import {IAppAnalyzer} from "../analyzer/IAppAnalyzer";


export default class IosAppAnalyzer implements IAppAnalyzer
{
    ctx:DexcaliburProject;
    state:AnalyzerState = null;
    package:string;

    constructor(pContext:DexcaliburProject) {
        this.ctx = pContext;
    }

    async prepareFullScan():Promise<boolean>{
        return true;
    }

    /**
     * To restore the analyzer state
     *
     * @param {AnalyzerState} pState
     */
    restoreState(pState:AnalyzerState):boolean {
        if(pState != null){
            this.state = pState;
            return true;
        }

        return false;
    }

    async scan(path:string):Promise<IosApplication>{
        return new IosApplication(this.ctx);
    }

    getDefaultTargetPath(): string {
        return "";
    }

    getAppUid(): string {
        return this.package;
    }

    getPackageName():string {
        return this.package;
    }
}