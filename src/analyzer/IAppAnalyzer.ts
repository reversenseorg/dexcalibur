
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

import {AnalyzerState} from "../AnalyzerState.js";
import {AppIcon} from "../AppIcon.js";
import DataScope from "../DataScope.js";
import {Nullable} from "@reversense/dxc-core-api";
import ModelFile from "../ModelFile.js";
import ModelCall from "../ModelCall.js";
import ModelStringValue from "../ModelStringValue.js";
import {NativeBackend} from "../types/common.js";

export interface NativeDiscoverOpts {
    backend: NativeBackend,
    extra: any,
}

export interface IAppAnalyzer {
    prepareFullScan(pNewProject:boolean, pDataScope:Nullable<DataScope>):Promise<boolean>;

    /**
     * To get the path of the file or folder to scan by default
     *
     * @return {string}
     * @method
     */
    getDefaultTargetPath():string;

    getAppUid():string;

    getPackageName():string;

    importMeta():Promise<boolean>;

    hasMissingMeta():boolean;

    restoreState(pState:AnalyzerState):boolean;

    postScan():void;

    extractAppIcons():Promise<AppIcon[]>;

    performXrefAnalysis():Promise<any>;

    isReady():boolean;

    importToSlave():Promise<any>;

    /**
     * This method MUST update the context but never return null or undefined
     *
     * @param vPath
     * @param vFile
     * @param vIsDir
     * @param vCtx
     *
     * @method
     */
    getPathContext(vPath:string, vFile:string, vIsDir:boolean, vCtx:any):any;

    performNativeDiscover(pFile:ModelFile, pExtra:{ sysc:ModelCall[], strings:ModelStringValue[]}, pOptions:NativeDiscoverOpts):Promise<any>;
}