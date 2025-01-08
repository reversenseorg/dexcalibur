import {DeviceTemplate, DeviceTemplateUUID} from "./DeviceTemplate.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Architecture} from "../../Architecture.js";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";
import Util from "../../Utils.js";

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
    PHONE='phone'
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
}