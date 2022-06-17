import IosApplication from "./IosApplication";
import DexcaliburProject from "../DexcaliburProject";
import {AnalyzerState} from "../AnalyzerState";


export default class IosAppAnalyzer
{
    ctx:DexcaliburProject;
    state:AnalyzerState = null;

    constructor(pContext:DexcaliburProject) {
        this.ctx = pContext;
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
}