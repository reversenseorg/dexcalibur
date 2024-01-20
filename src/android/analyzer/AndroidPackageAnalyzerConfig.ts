
export interface AndroidPackageAnalyzerOptions {
    ssa_auto?:boolean;
    msa_auto?:boolean;
}

/**
 * Represent configuration Android package analyzer
 *
 * @class
 */
export class AndroidPackageAnalyzerConfig {

    /**
     * Search Splitted APK
     */
    ssa_auto = false;

    /**
     * Merge Splitted APK
     */
    msa_auto = false;

    constructor(pSettings:AndroidPackageAnalyzerOptions) {
        for(const i in pSettings) this[i] = pSettings[i];
    }

    mustSearchSplittedAPK():boolean {
        return this.ssa_auto;
    }

    mustMergeSplittedAPK():boolean {
        return this.msa_auto;
    }
}