
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