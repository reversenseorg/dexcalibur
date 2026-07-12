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
import * as  _util_ from 'util';
import * as  _ps_ from 'child_process';

import {DeviceTemplate} from "../template/DeviceTemplate.js";
import Util from "../../Utils.js";
import {DeviceUUID} from "../../Device.js";
import {VirtualDeviceFactoryException} from "../error/VirtualDeviceFactoryException.js";
import {UserAccountUUID} from "../../user/UserAccount.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {AndroidImgType} from "../template/DeviceTemplateFactory.js";
import {Architecture} from "../../Architecture.js";
import {External} from "../../external/External.js";
import * as Log from "../../Logger.js";


const _exec_ = _util_.promisify(_ps_.exec);
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface AndroidDeviceDefinition {
    id: number,
    name: string,
    oem: string,
    tag?: string
}


/**
 * Android Virtual Device (AVD) Helper
 *
 * @class
 */
export default class AvdHelper extends External.ExternalHelper {

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        apiVersion: ValidationRule.uintString(),
        imgType: ValidationRule.newPinklistAssert([
            AndroidImgType.AOSP,
            AndroidImgType.AOSP_ATD,
            AndroidImgType.ANDROID_AUTO,
            AndroidImgType.ANDROID_TV,
            AndroidImgType.ANDROID_DESKTOP,
            AndroidImgType.ANDROID_WEAR,
            AndroidImgType.ANDROID_WEAR_CN,
            AndroidImgType.ANDROID_AUTO_DD,
            AndroidImgType.GOOGLE_APIS,
            AndroidImgType.GOOGLE_ATD,
            AndroidImgType.GOOGLE_APIS_PLAYSTORE,
            AndroidImgType.GOOGLE_APIS_PS16K,
        ]),
    }

    /**
     * To get the path of AVD manager runtime
     *
     * @returns {string} Path of AVD runtime
     * @method
     */
    static getRuntime():string {

        let rt:string;
        if(process.env.ANDROID_HOME != null){
            let base = process.env.ANDROID_HOME;

            if(_path_.basename(process.env.ANDROID_HOME)!=='sdk'){
                base = _path_.join(base,'sdk')
            }
            rt = _path_.join(base,'cmdline-tools','bin','avdmanager');
        }else{
            rt = AvdHelper.getExtPath();
        }

        if(!_fs_.existsSync(rt)){
            throw VirtualDeviceFactoryException.AVD_RUNTIME_NOT_FOUND(rt);
        }

        return rt;
    }

    /**
     * To create a virtual device in AVD from a device template
     * and return the "package ID" of the system image to use
     *
     * The format of package ID comes from Android's sdkmanager and is formated like :
     * `system-images;android-{API_VERSION};{VARIANT};{ARCH}`
     *
     * @return {Promise<string>}  System image ID
     * @async
     * @static
     * @method
     */
    static async createDevice(pUserAccount:UserAccountUUID, pDUID:DeviceUUID, pTemplate:DeviceTemplate):Promise<string> {

        if(!AvdHelper.VALIDATE.apiVersion.test(pTemplate.extra.apiVersion)){
            throw VirtualDeviceFactoryException.ANDROID_API_VERSION_MISSING(pUserAccount,pDUID);
        }

        if(!AvdHelper.VALIDATE.imgType.test(pTemplate.extra.type)){
            throw VirtualDeviceFactoryException.ANDROID_IMG_TYPE_MISSING(pUserAccount,pDUID);
        }

        let arch:string = "";
        switch (pTemplate.getArch()){
            case Architecture.AARCH64:
                arch = "arm64-v8a"
                break;
            case Architecture.ARMEABI:
            case Architecture.AARCH32:
                arch = "armeabi-v7a"
                break;
            default:
                throw VirtualDeviceFactoryException.ANDROID_ARCH_NOT_SUPPORTED(pUserAccount,pDUID,pTemplate.getArch());
                break;
        }



        const image_id = `system-images;android-${pTemplate.extra.apiVersion};${pTemplate.extra.type};${arch}`;

        // save built image ID in template
        pTemplate.addExtraOption('androidSysImgId', image_id);

        const cmd = `${AvdHelper.getRuntime()} -s create avd -n ${pDUID} -k "${image_id}"`;
        Logger.info("[AVD HELPER][createDevice] Exec : "+cmd);
        const out = await _exec_(cmd);

        if(out.stderr != null && out.stderr.length > 0){
            Logger.error(out.stderr);
        }

        Logger.success(out.stdout);

        // once the device is created, the template become immutable
        pTemplate.seal();

        return image_id;
    }


    /**
     * To delete a virtual device from local AVD setup
     *
     * @return {Promise<boolean>}  TRUE if ready, else FALSE
     * @async
     * @static
     * @method
     */
    static async deleteDevice(pUserAccount:UserAccountUUID, pDUID:DeviceUUID, pTemplate:DeviceTemplate):Promise<boolean> {

        if(!AvdHelper.VALIDATE.uuid.test(pDUID)){
            throw VirtualDeviceFactoryException.INVALID_DEVICE_UUID_FMT(pDUID);
        }

        const out = await Util.execAsync(`${AvdHelper.getRuntime()} delete -n ${pDUID}`);

        if(out.stderr != null && out.stderr.length > 0){
            Logger.error(out.stderr);
        }

        Logger.success(out.stdout);

        return true;
    }

    /**
     * To list device definitions
     *
     * @return {Promise<boolean>}  TRUE if ready, else FALSE
     * @async
     * @static
     * @method
     */
    static async listDeviceDef():Promise<boolean> {

        const out = await _exec_(`${AvdHelper.getRuntime()} list devices`);

        console.log(out);
        if(out.stderr != null && out.stderr.length > 0){
            Logger.error(out.stderr);
        }

        Logger.success(out.stdout);

        return true;
    }

    /**
     * To create a virtual device in AVD from a device template
     *
     * @return {Promise<boolean>}  TRUE if ready, else FALSE
     * @async
     * @static
     * @method
     */
    static async listAVD(pUserAccount:UserAccountUUID, pDUID:DeviceUUID, pTemplate:DeviceTemplate):Promise<boolean> {

        if(!AvdHelper.VALIDATE.uuid.test(pDUID)){
            throw VirtualDeviceFactoryException.INVALID_DEVICE_UUID_FMT(pDUID);
        }

        const out = await Util.execAsync(`${AvdHelper.getRuntime()} delete -n ${pDUID}`);

        if(out.stderr != null && out.stderr.length > 0){
            Logger.error(out.stderr);
        }

        Logger.success(out.stdout);

        return true;
    }
}
