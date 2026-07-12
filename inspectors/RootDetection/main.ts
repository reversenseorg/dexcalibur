
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

// ===== INIT =====
import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import * as Log from "../../src/Logger.js";
import ModelMethod from "../../src/ModelMethod.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


const knownRootAppsPackages = [
    "com.noshufou.android.su",
    "com.noshufou.android.su.elite",
    "eu.chainfire.supersu",
    "com.koushikdutta.superuser",
    "com.thirdparty.superuser",
    "com.yellowes.su",
    "com.topjohnwu.magisk",
    "com.kingroot.kinguser",
    "com.kingo.root",
    "com.smedialink.oneclickroot",
    "com.zhiqupk.root.global",
    "com.alephzain.framaroot"
];

const knownDangerousAppsPackages = [
    "com.koushikdutta.rommanager",
    "com.koushikdutta.rommanager.license",
    "com.dimonvideo.luckypatcher",
    "com.chelpus.lackypatch",
    "com.ramdroid.appquarantine",
    "com.ramdroid.appquarantinepro",
    "com.android.vending.billing.InAppBillingService.COIN",
    "com.android.vending.billing.InAppBillingService.LUCK",
    "com.chelpus.luckypatcher",
    "com.blackmartalpha",
    "org.blackmart.market",
    "com.allinone.free",
    "com.repodroid.app",
    "org.creeplays.hack",
    "com.baseappfull.fwd",
    "com.zmapp",
    "com.dv.marketmod.installer",
    "org.mobilism.android",
    "com.android.wp.net.log",
    "com.android.camera.update",
    "cc.madkite.freedom",
    "com.solohsu.android.edxp.manager",
    "org.meowcat.edxposed.manager",
    "com.xmodgame",
    "com.cih.game_cih",
    "com.charles.lpoqasert",
    "catch_.me_.if_.you_.can_"
];

const knownRootCloakingPackages = [
    "com.devadvance.rootcloak",
    "com.devadvance.rootcloakplus",
    "de.robv.android.xposed.installer",
    "com.saurik.substrate",
    "com.zachspong.temprootremovejb",
    "com.amphoras.hidemyroot",
    "com.amphoras.hidemyrootadfree",
    "com.formyhm.hiderootPremium",
    "com.formyhm.hideroot"
];

// These must end with a /
const suPaths = [
    "/data/local/",
    "/data/local/bin/",
    "/data/local/xbin/",
    "/sbin/",
    "/su/bin/",
    "/system/bin/",
    "/system/bin/.ext/",
    "/system/bin/failsafe/",
    "/system/sd/xbin/",
    "/system/usr/we-need-root/",
    "/system/xbin/",
    "/cache/",
    "/data/",
    "/dev/"
];


const pathsThatShouldNotBeWritable = [
    "/system",
    "/system/bin",
    "/system/sbin",
    "/system/xbin",
    "/vendor/bin",
    "/sbin",
    "/etc",
    //"/sys",
    //"/proc",
    //"/dev"
];

var RootDetectionInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.1.4",

    db: {
        dbms: 'inmemory',
        type: 'collection',
        name: 'rasp_root'
    },

    tags: [
        {
            name:"security.detection.root",
            _tagsOptions:[
                {
                    name:"admin-app",
                    label:"RootDetection:AdminApp",
                    descr:"The application checks if some well known application to manage root account are installed"
                },{
                    name:"danger-app",
                    label:"RootDetection:DangerApp",
                    descr:"The application checks if some well known application to install root apps"
                },{
                    name:"admin-bin",
                    label:"RootDetection:AdminBin",
                    descr:"The application checks if some well known binary files exists and/or can be executed"
                },{
                    name:"alt-store",
                    label:"RootDetection:AltStore",
                    descr:"The application checks if some alternative store are installed"
                },{
                    name:"fs-perm-abuse",
                    label:"RootDetection:MAC",
                    descr:"The application checks if the application has excessive access to filesystem"
                }
            ]
        }
    ],

    hookSet: {
        id: "RootDetection",
        name: "Root Detection",
        description: "Find and bypass root detection",

        // must be updated at runtime
        hookShare: {

        },


        require: [],

        strategies: [
            {
                name: "read_root_apk",
                descr: "Method doing something related to root detection",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    req: `strings("value:/(uperuser|bin/su)/").select("src").exclude("name:<clinit>")
.union(project.find.strings("value:/(uperuser|bin/su)/").select("src").filter("name:<clinit>")
        .select("enclosingClass").select("methods")).exclude("name:<clinit>")`
                },
                autoEmit: true,
                emitEvent: "rootdetection.apk.search",
                before: `  
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {
                                name: "Match root detection"
                            }
                        );
                `
            }
        ]
    },

    eventListenerSources: {
        "model.string.new": {
            source: `
            // <t1?a:i;
            if(pEvent.data==null) return;
            
            var tag=null;
            var pCtx = pEvent.getContext();
            var isKnownRootAppsPackagesFrag = /(noshufou|smedialink|oneclick|zhiqupk|alephzain|chainfire|supersu|superuser|koushikdutta|thirdparty|yellowes|topjohnwu|magisk|kingroot|kingo)/i;
            var confirmKnowRoot = /(\\\.root|\\\.su|superu|supersu)/i;
           
            if(pEvent.data.value!=null && pEvent.data.value.match(isKnownRootAppsPackagesFrag)!=null && pEvent.data.value.match(confirmKnowRoot)!=null){
                tag = pCtx.getTagManager().getTag('security.detection.root.admin-app');
                pEvent.data.addTag(tag);
            }
            
            var isKnownDangerousAppsPackages = /(koushikdutta|com\\\.zmapp|dv\\\.marketmod|baseappfull|creeplays|zmapp|repodroid|allinone|blackmart|appquarantine|InAppBillingService|ramdroid|rommanager|dimonvideo|luckypatcher|chelpus)/i;
            var confirmKnownDangerousAppsPackages = /(patch|hack|\\\.fwd|installer|free|manager|rom|alpha|org\\\.|ram|\\\.COIN|\\\.LUCK|com\\\.zmapp)/i;
            
            if(pEvent.data.value!=null && pEvent.data.value.match(isKnownDangerousAppsPackages)!=null && pEvent.data.value.match(confirmKnownDangerousAppsPackages)!=null){
                tag = pCtx.getTagManager().getTag('security.detection.root.danger-app');
                pEvent.data.addTag(tag);
            }
            
            /*
            var isKnownDangerousAppsPackages = [
                "org.mobilism.android",
                "com.android.wp.net.log",
                "com.android.camera.update",
                "cc.madkite.freedom",
                "com.solohsu.android.edxp.manager",
                "org.meowcat.edxposed.manager",
                "com.xmodgame",
                "com.cih.game_cih",
                "com.charles.lpoqasert",
                "catch_.me_.if_.you_.can_"
            ];
            
            
            var isKknownRootCloakingPackages = [
                "com.devadvance.rootcloak",
                "com.devadvance.rootcloakplus",
                "de.robv.android.xposed.installer",
                "com.saurik.substrate",
                "com.zachspong.temprootremovejb",
                "com.amphoras.hidemyroot",
                "com.amphoras.hidemyrootadfree",
                "com.formyhm.hiderootPremium",
                "com.formyhm.hideroot"
            ];*/
            
            var isSuPath = [
                "/data/local/",
                "/data/local/bin/",
                "/data/local/xbin/",
                "/sbin/",
                "/su/bin/",
                "/system/bin/",
                "/system/bin/.ext/",
                "/system/bin/failsafe/",
                "/system/sd/xbin/",
                "/system/usr/we-need-root/",
                "/system/xbin/",
                "/cache/",
                "/data/",
                "/dev/",
            ].indexOf(pEvent.data.value);
            
            if(pEvent.data.value!=null && (isSuPath>-1 || /(bin\\\/su)/.test(pEvent.data.value) || /\\\/su^/.test(pEvent.data.value) )){
                tag = pCtx.getTagManager().getTag('security.detection.root.admin-bin');
                pEvent.data.addTag(tag);
            }
            
            
            var isSuPath = [
                "/data/local/",
                "/data/local/bin/",
                "/data/local/xbin/",
                "/sbin/",
                "/su/bin/",
                "/system/bin/",
                "/system/bin/.ext/",
                "/system/bin/failsafe/",
                "/system/sd/xbin/",
                "/system/usr/we-need-root/",
                "/system/xbin/",
                "/cache/",
                "/data/",
                "/dev/",
            ].indexOf(pEvent.data.value);
            
            if(pEvent.data.value!=null && (isSuPath>-1 || /(bin\\\/su)/.test(pEvent.data.value) || /\\\/su^/.test(pEvent.data.value) )){
                tag = pCtx.getTagManager().getTag('security.detection.root.admin-bin');
                pEvent.data.addTag(tag);
            }
            
            var isAdminBin = [
                /^[sS][uU]$/
            ];
            
            for(let i=0; i<isAdminBin.length; i++){
                if(pEvent.data.value!=null && isAdminBin[i].test(pEvent.data.value)){
                    tag = pCtx.getTagManager().getTag('security.detection.root.admin-bin');
                    pEvent.data.addTag(tag);
                    break;
                }
            }
            
            
            
            
            `,
            lang: "js"
        },
        "method.new": {
            lang:"js",
            source: `
            
            `
        },
        "hook.file.new":{
            lang:"js",
            source: `
                // /system/app/Superuser.apk
                
            `
        }
    }
});


export default RootDetectionInspector;