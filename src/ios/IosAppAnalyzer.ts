import IosApplication from "./IosApplication.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AnalyzerState} from "../AnalyzerState.js";
import {IAppAnalyzer} from "../analyzer/IAppAnalyzer.js";
import {AppIcon} from "../AppIcon.js";


export default class IosAppAnalyzer implements IAppAnalyzer
{
    ctx:DexcaliburProject;
    state:AnalyzerState = null;
    package:string;

    constructor(pContext:DexcaliburProject, pOptions:any = {}) {
        this.ctx = pContext;
    }

    async prepareFullScan(pNewProject:boolean):Promise<boolean>{
        return true;
    }

    async importMeta():Promise<boolean>{
        return true;
    }

    hasMissingMeta():boolean {
        return false;
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

    postScan() {

    }

    async extractAppIcons(): Promise<AppIcon[]> {
        const icons:AppIcon[] = [];

        return icons;
    }

    async performXrefAnalysis():Promise<any>{
        // todo
    }



    isReady():boolean {
        return true;
    }

    async importToSlave():Promise<any> {
        // todo
        return true;
    }
}