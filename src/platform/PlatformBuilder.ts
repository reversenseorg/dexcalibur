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

import * as _path_ from 'path';
import * as _fs_ from 'fs';

import Platform from "./Platform.js";
import Util from "../Utils.js";
import * as Log from '../Logger.js';
import DexcaliburWorkspace from "../DexcaliburWorkspace.js";
import {CoreDebug} from "../core/CoreDebug.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const DX_JAR_PATH = "/lib/dx.jar";

//Logger.push("[PlatformBuilder::");
export default class AndroidPlatformBuilder
{
    wd:string = null;
    android_sdk:string = null;
    java:string = null;
    dxPath:string = null;
    tmpDir:string = null;

    constructor(pWS:DexcaliburWorkspace, pAndroidSdkPath:string=null) {
        this.wd = _path_.join(pWS.getPlatformFolderLocation());
        this.android_sdk = pAndroidSdkPath;

        if(process.env.DEXCALIBUR_JAVA != null){
            this.java = process.env.DEXCALIBUR_JAVA;
        }else{
            this.java = 'java';
        }

        this.tmpDir = pWS.getTempFolderLocation();
    }


    exists(platform:Platform):boolean {
        return _fs_.existsSync(_path_.join(this.wd, platform.getInternalName()));
    }

    remove(platform:Platform):boolean {
        return false;
      //  return fs.existsSync(_path_.join(this.wd, platform.getInternalName()));
    }

    findDxPath():string {
        if (this.dxPath != null) return this.dxPath;

        let self:AndroidPlatformBuilder = this;
        Util.forEachFileOf(_path_.join(this.android_sdk, "build-tools"), function (file:string) {
            self.dxPath = file;
        }, false);

        return this.dxPath;
    }

    buildDex(classes_path:string) {
        let dxBin:string = this.findDxPath();
        let output:string = _path_.join(this.tmpDir, "dexc_" + Util.time() + ".dex");

        Util.execSync(this.java + " --jar " + dxBin + " --dex --core-library --output=" + output + " " + classes_path + "/");

        return output;
    }


    getAndroidClasses(api_version:string):boolean {
        let apiPath:string = _path_.join(this.android_sdk, "platforms");
        let availableApi:string[] = [], apiName:string = "", dstPath:string = "", ret = null;

        if (api_version != null) {
            apiName = "android-" + api_version;
            apiPath = _path_.join(apiPath, apiName);
        } else {
            Logger.info("Searching platform ...");
            Util.forEachFileOf(apiPath, (x) => {
                availableApi.push(x)
            }, false);
            if (availableApi.length == 0) {
                Logger.error("[PlatformeBuilder::getAndroidClasses]", "No available Android API");
                return false;
            }
            apiName = availableApi[0];
            apiPath = _path_.join(apiPath, apiName);
        }
        apiPath = _path_.join(apiPath, "/android.jar");
        //apiPath += "/android.jar";
        dstPath = _path_.join(this.tmpDir, apiName + "_" + Util.time());

        Logger.info("Copying platform file ...")
        ret = Util.execSync("cp " + apiPath + " " + dstPath + ".jar");

        _fs_.mkdirSync(dstPath.substr(0, dstPath.length - 4) + "/", {recursive: true})

        Logger.info("Extracting platform class files ...")
        ret = Util.execSync("unzip " + apiPath + ".jar " + dstPath);

        Logger.info("Building dex file ...")
        let dex = this.buildDex(dstPath);

        Logger.info("Smaling file ...");
    }

    isBuildable(platform:Platform):boolean {
        if (platform.isAndroid()) {
            Logger.error("[PlatformeBuilder::isBuildable]", "Operation not supported");
            //this.buildDex()
            return true;
        } else {
            Logger.error("[PlatformeBuilder::isBuildable]", "Only official Android API can be build.");
            return false;
        }
    }

    build(platform:Platform, forced:boolean = false) {
        if (this.exists(platform)) {
            if (forced) {
                this.remove(platform);
            } else {
                Logger.error("[PlatformeBuilder::build]", "The platform already exists.");
            }
        }


    }


    toJsonObject() :any{
        let o:any = new Object();

        for (let i in this) o[i] = this[i];
        CoreDebug.checkJsonSerialize(o, "PlatformBuilder");
        return o;
    }
}

