
import {AnalyzerState} from "../../AnalyzerState.js";
import * as Log from "../../Logger.js";

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