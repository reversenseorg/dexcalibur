/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {CoreDebug} from "./core/CoreDebug.js";

export enum FileAnalysisType {
    MAGIC='magic',
    DEEP='deep',
    SMART='smart'
}

export enum NativeAnalysisMode {
    AUTO='auto',
    MANUAL='manual'
}

export type PackageAnalyzerOptions =  any;
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