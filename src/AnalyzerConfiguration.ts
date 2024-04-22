import {CoreDebug} from "./core/CoreDebug.js";
import {AndroidPackageAnalyzerConfig} from "./android/analyzer/AndroidPackageAnalyzerConfig.js";

export enum FileAnalysisType {
    MAGIC='magic',
    DEEP='deep',
    SMART='smart'
}

export enum NativeAnalysisMode {
    AUTO='auto',
    MANUAL='manual'
}

export type PackageAnalyzerOptions = AndroidPackageAnalyzerConfig | any;
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
        abi: null,
        arch: 'arm',
        faMode: FileAnalysisType.DEEP,
        naMode: NativeAnalysisMode.AUTO,
        pkg: {}
    };

    constructor(pConfig:any = {}) {
        if(pConfig!=null){
            for(const k in pConfig){
                this[k] = pConfig[k];
            }
        }
    }

    /**
     * to get package analyzer configuration
     *
     * @returns {PackageAnalyzerOptions}
     * @method
     */
    getPkgAnalyzerConfig():PackageAnalyzerOptions {
        return this.ppts.pkg;
    }

    /**
     * To check if ABI to analyze must be the same than target device
     * TODO : rename
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


    setFileAnalysisMode(pMode:string){
        switch (pMode){
            case "deep":
                this.ppts.faMode = FileAnalysisType.DEEP;
                break;
            case "magic":
                this.ppts.faMode = FileAnalysisType.MAGIC;
                break;
            case "smart":
                this.ppts.faMode = FileAnalysisType.SMART;
                break;
        }
    }


    setNativeAnalysisMode(pMode:string){
        switch (pMode){
            case "auto":
                this.ppts.naMode = NativeAnalysisMode.AUTO;
                break;
            case "manual":
                this.ppts.naMode = NativeAnalysisMode.MANUAL;
                break;
        }
    }


    isAutoNativeAnalysis(){
        return (this.ppts.naMode == NativeAnalysisMode.AUTO);
    }

    useAutoNativeAnalysis() {
        this.ppts.naMode = NativeAnalysisMode.AUTO;
    }

    useManualNativeAnalysis() {
        this.ppts.naMode = NativeAnalysisMode.MANUAL;
    }


    get nativeAnalysisMode():FileAnalysisType {
        return this.ppts.naMode;
    }

    static from(pObj:any):AnalyzerConfiguration {
        return new AnalyzerConfiguration(pObj);
    }

    toJsonObject():any{
        //let o={};
        //o.ppts = this.ppts;
        //for(let i in this.ppts) o[i] = this.ppts[i];
        CoreDebug.checkJsonSerialize(this,"AnalyzerConfiguration");
        return this;
    }

    /**
     * To set package analyszer options
     *
     * @param {PackageAnalyzerOptions} pOptions
     */
    addPkgAnalyzerOptions(pOptions: PackageAnalyzerOptions) {
        this.ppts.pkg = pOptions;
    }

}