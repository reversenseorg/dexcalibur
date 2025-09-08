import {AnalyzerState} from "../AnalyzerState.js";
import DexcaliburProject from "../DexcaliburProject.js";
import TargetApp from "../common/TargetApp.js";
import {ProjectInput} from "./ProjectInput.js";
import {Nullable} from "@dexcalibur/dxc-core-api";

export interface PrepareOptions {
    path?:string;
    extractOpts?:any;
}

export enum InputSetPurpose {
    NONE,
    INSTALL
}

export interface IPackageAnalyzer {

    /**
     * To prepare (such as consolidate) a package to be analyzed
     *
     * @param {DexcaliburProject} pProject
     * @param {any} pOptions
     */
    prepareTargetPackage(pOptions?:PrepareOptions):Promise<TargetApp>;

    restoreState(pState:AnalyzerState):boolean;

    setProject(pProject:DexcaliburProject):void;

    free():Promise<void>;

    attachInput(pInput:ProjectInput):any;

    getInputsFor(pPurpose:InputSetPurpose): ProjectInput[];

    getMinPlatform():any;

    getTargetPlatform():any;

    getAppIcon():Promise<Nullable<string>>;

    getVersion():Promise<Nullable<string>>;

    getPkgID():Promise<Nullable<string>>;

    getAppName():Promise<Nullable<string>>;
}