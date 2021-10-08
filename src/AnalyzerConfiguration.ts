export enum FileAnalysisType {
    MAGIC='magic',
    DEEP='deep',
    SMART='smart'
}

/**
 *
 */
export class AnalyzerConfiguration {

    /**
     * Device ABI flags
     * @type {boolean}
     * @field
     */
    ppts:any = {
        devAbi: true,
        arch: 'arm',
        faMode: FileAnalysisType.DEEP
    };

    constructor(pConfig:any = null) {
        if(pConfig!==null){
            for(const k in pConfig){
                this[k] = pConfig[k];
            }
        }
    }

    /**
     * To check if ABI to analyze must be the same than target device
     * @method
     */
    useDeviceABI():boolean {
        return this.ppts.devAbi;
    }

    set fileAnalysisMode(mode:FileAnalysisType) {
        this.ppts.faMode = mode;
    }

    get fileAnalysisMode():FileAnalysisType {
        return this.ppts.faMode;
    }

    static from(pObj:any):AnalyzerConfiguration {
        return new AnalyzerConfiguration({ ppts:pObj });
    }

    toJsonObject():any{
        let o={};
        for(let i in this.ppts) o[i] = this.ppts[i];
        return o;
    }
}