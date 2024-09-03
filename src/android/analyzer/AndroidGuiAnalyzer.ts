// noinspection BadExpressionStatementJS

import * as _fs_ from "fs";
import * as _fsPromise_ from "node:fs/promises"
import * as _path_ from "path";

import {Device} from "../../Device.js";
import {AndroidPackageAnalyzerConfig} from "./AndroidPackageAnalyzerConfig.js";
import {AnalyzerException} from "../../errors/AnalyzerException.js";
import {InputSetPurpose, IPackageAnalyzer} from "../../analyzer/IPackageAnalyzer.js";
import {AnalyzerState} from "../../AnalyzerState.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {Nullable} from "../../core/IStringIndex.js";
import TargetApp from "../../common/TargetApp.js";
import ApkHelper from "../../ApkHelper.js";
import StatusMessage from "../../StatusMessage.js";
import * as Log from "../../Logger.js";
import {
    ProjectInput,
    ProjectInputLocation,
    ProjectInputPurpose,
    ProjectInputType,
    ProjectInputViewer
} from "../../analyzer/ProjectInput.js";
import {DexcaliburProjectException} from "../../errors/DexcaliburProjectException.js";
import Util from "../../Utils.js";
import {PackageAnalyzerException} from "../../errors/PackageAnalyzerException.js";
import {IGuiAnalyzer} from "../../analyzer/IGuiAnalyzer.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * Android APK analyzer
 *
 * The purpose of this class is to perform high-level analysis of package content
 *
 * @class
 */
export class AndroidGuiAnalyzer implements IGuiAnalyzer {


    private _cfg:any;

    state:AnalyzerState = new AnalyzerState({ _uid:'android-gui'});


    constructor(pConfig:any) {
        this._cfg = pConfig;

        for(let i in pConfig){
            this.state.setProperty(i, pConfig[i]);
        }
/*
        if(this.state.getProperty("base_apks")==null){
            this.state.setProperty("base_apks", ['base.apk']);
        }

        if(this.state.getProperty("ignore_split_files")==null){
            this.state.setProperty(
                "ignore_split_files",
                [
                    'AndroidManifest.xml',
                    'META-INF',
                    'apktool.yml',
                    'unknown',
                    'stamp-cert-sha256',
                    'original',
                ]
            );
        }*/
    }


    async detectGuis(): Promise<boolean> {
        return true;
    }


}