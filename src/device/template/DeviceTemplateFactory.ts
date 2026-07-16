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

import {DeviceTemplate, DeviceTemplateUUID} from "./DeviceTemplate.js";
import {OperatingSystem} from "@reversense/dxc-core-api";
import {Architecture} from "../../Architecture.js";
import {TagUUID} from "@reversense/dexcalibur-orm";
import Util from "../../Utils.js";
import {SemVerHelper} from "../../util/semver/SemverHelper.js";

export enum AndroidImgType {
    DEFAULT='default',
    AOSP='default',
    AOSP_ATD='aosp_atd',
    GOOGLE_APIS='google_apis',
    GOOGLE_APIS_PLAYSTORE='google_apis_playstore',
    GOOGLE_APIS_PS16K='google_apis_ps16k',
    GOOGLE_ATD='google_atd',
    ANDROID_TV='android-tv',
    ANDROID_WEAR='android-wear',
    ANDROID_DESKTOP='android-desktop',
    ANDROID_WEAR_CN='android-wear-cn',
    ANDROID_AUTO='android-automotive',
    ANDROID_AUTO_DD='android-automotive-distant-display-playstore'
}

export enum DevicePurpose {
    TV='tv',
    AUTOMOTIVE='auto',
    PHONE='phone',
    ANY='any',
    DESKTOP='desktop',
    SERVER='server',
        IOT='iot'
}

export class DeviceTemplateFactory {

    static newAndroidArm64(pApiVersion:string, pVirtual:boolean, pImgType:AndroidImgType, pPurpose:DevicePurpose):DeviceTemplate {
        return new DeviceTemplate({
            os: OperatingSystem.ANDROID,
            name: `${pPurpose} aarch64 api ${pApiVersion} ${pImgType}`,
            arch: Architecture.AARCH64,
            description: `Android device running API version ${pApiVersion} over arm64 CPU`,
            creation_date: Util.time(),
            virtual:pVirtual,
            extra:{
                apiVersion: pApiVersion,
                type: pImgType,
                purpose: pPurpose,
                version: "1.0.0",
                avdOpts: {
                    "-selinux":"permissive",
                    "-screen":"touch",
                    "-memory":"2048",
                    "-no-boot-anim":null,
                    "-no-audio":null,
                    "-no-window":null,
                    //"-port":"5554"
                }
            }
        });
    }

    static newIosArm64(pApiVersion:string, pVirtual:boolean):DeviceTemplate {
        return new DeviceTemplate({
            os: OperatingSystem.IOS,
            name: "ios_aarch64_api_"+pApiVersion,
            arch: Architecture.AARCH64,
            description: `iOS device running API version ${pApiVersion} over arm64 CPU`,
            creation_date: Util.time(),
            virtual:pVirtual,
            extra:{}
        });
    }



    static newUnicorn(pApiVersion:string, pVirtual:boolean, pArch:Architecture, pPurpose:DevicePurpose):DeviceTemplate {
        return new DeviceTemplate({
            os: OperatingSystem.NONE,
            name: `uc_${pArch}_`+pApiVersion,
            arch: pArch,
            description: `Emulator (${pPurpose})  built on top of Unicorn engine and ${pArch} ${pApiVersion} CPU`,
            creation_date: Util.time(),
            virtual:pVirtual,
            extra:{}
        });
    }


    static newTizen(pApiVersion:string, pVirtual:boolean, pPurpose:DevicePurpose):DeviceTemplate {

        const v = SemVerHelper.parse(pApiVersion);

        return new DeviceTemplate({
            os: OperatingSystem.TIZEN,
            name: `tiz_aarch64_api_${v.major}_${v.minor}`,
            arch: Architecture.AARCH64,
            description: `Tizen device (${pPurpose})  running API version ${pApiVersion} over arm64 CPU`,
            creation_date: Util.time(),
            virtual:pVirtual,
            extra:{
                info: `https://docs.tizen.org/platform/release-notes/tizen-${v.major}-0`
            }
        });
    }


    static newLinux(pApiVersion:string, pVirtual:boolean, pPurpose:DevicePurpose):DeviceTemplate {
        return new DeviceTemplate({
            os: OperatingSystem.LINUX,
            name: "linux_x64_"+pApiVersion,
            arch: Architecture.X86_64,
            description: `VM (${pPurpose}) running Linux version ${pApiVersion} over x64 CPU`,
            creation_date: Util.time(),
            virtual:pVirtual,
            extra:{}
        });
    }
}