import { Device } from "../../Device.js";
import {AndroidPackageAnalyzerConfig} from "./AndroidPackageAnalyzerConfig.js";
import {AnalyzerException} from "../../errors/AnalyzerException.js";
import {IPackageAnalyzer} from "../../analyzer/IPackageAnalyzer.js";


export class AndroidPackageAnalyzer implements IPackageAnalyzer {

    private _cfg:AndroidPackageAnalyzerConfig;

    private _dev:Device|null = null;

    constructor(pConfig:AndroidPackageAnalyzerConfig) {
        this._cfg = pConfig;
    }

    setDevice(pDevice:Device){
        this._dev = pDevice;
    }

    prepareTargetAPK(pPackage:string):void {
        if(this._cfg.mustSearchSplittedAPK()){
            if(this._dev == null){
                throw AnalyzerException.ANDROID_SEARCH_SPLITTED_DEV_FAIL();
            }

            //this.searchSplittedApk(pPackage)
        }
    }


}