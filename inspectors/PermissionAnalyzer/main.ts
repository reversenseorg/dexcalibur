
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



// ===== CONFIG HOOKS =====



// ====== CONFIG TASK ======


import InspectorFactory from "../../src/InspectorFactory.js";
import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import BusEvent from "../../src/BusEvent.js";
import AndroidAppAnalyzer from "../../src/android/AndroidAppAnalyzer.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {AndroidManifest, AndroidSharedUser} from "../../src/android/AndroidManifest.js";
import {AndroidPermissionGroup, AndroidProtectionLevel, ModelPermission} from "../../src/android/ModelPermission.js";

const Permissions = {
    ACCEPT_HANDOVER: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 28,
        name: "android.permission.ACCEPT_HANDOVER",
        label: "ACCEPT_HANDOVER",
        query: [
            "call('calleed.__signature__:android\.telecom\.TelecomManager\.acceptHandover" // (<android.net.Uri><int><android.telecom.PhoneAccountHandle>)
        ],
        description: `
        Allows a calling app to continue a call which was started in another app. An example is a video calling app that wants to continue a voice call on the user's mobile network.

        When the handover of a call from one app to another takes place, there are two devices which are involved in the handover; the initiating and receiving devices. The initiating device is where the request to handover the call was started, and the receiving device is where the handover request is confirmed by the other party.

        This permission protects access to the TelecomManager.acceptHandover(Uri, int, PhoneAccountHandle) which the receiving side of the handover uses to accept a handover.
        `
    }),
    ACCESS_BACKGROUND_LOCATION: new ModelPermission({
        protectionLevel: AndroidProtectionLevel.DANGEROUS,
        apiVersion: 29,
        name: "android.permission.ACCESS_BACKGROUND_LOCATION",
        label: "ACCESS_BACKGROUND_LOCATION",
        description: `
        Allows an app to access location in the background. If you're requesting this permission, you must also request either ACCESS_COARSE_LOCATION or ACCESS_FINE_LOCATION. Requesting this permission by itself doesn't give you location access.

        This is a hard restricted permission which cannot be held by an app until the installer on record whitelists the permission. For more details see PackageInstaller.SessionParams.setWhitelistedRestrictedPermissions(Set).
        `
    }),
    ACCESS_CHECKIN_PROPERTIES: new ModelPermission({
        //protectionLevel: AndroidProtectionLevel.UNKNOW,
        apiVersion: 1,
        name: "android.permission.ACCESS_CHECKIN_PROPERTIES",
        label: "ACCESS_CHECKIN_PROPERTIES",
        description: `
        Allows read/write access to the "properties" table in the checkin database, to change values that get uploaded.

        Not for use by third-party applications.
        `
    }),

    ACCESS_COARSE_LOCATION: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 1,
        name:"android.permission.ACCESS_COARSE_LOCATION",
        label:"ACCESS_COARSE_LOCATION",
        description: `
        Allows an app to access approximate location. Alternatively, you might want ACCESS_FINE_LOCATION.
        `
     }),

    ACCESS_FINE_LOCATION: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 1,
        name:"android.permission.ACCESS_FINE_LOCATION",
        label:"ACCESS_FINE_LOCATION",
        description: `
        Allows an application to access extra location provider commands. 
        `
     }),
    ACCESS_LOCATION_EXTRA_COMMANDS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        apiVersion: 1,
        name:"android.permission.ACCESS_LOCATION_EXTRA_COMMANDS",
        label:"ACCESS_LOCATION_EXTRA_COMMANDS",
        description: `
        Allows an application to access extra location provider commands. 
        `
     }),

    ACCESS_MEDIA_LOCATION: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 29,
        name:"android.permission.ACCESS_MEDIA_LOCATION",
        label:"ACCESS_MEDIA_LOCATION",
        description: `
        Allows an application to access any geographic locations persisted in the user's shared collection. 
        `
     }),

    ACCESS_NETWORK_STATE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        apiVersion: 1,
        name:"android.permission.ACCESS_NETWORK_STATE",
        label:"ACCESS_NETWORK_STATE",
        description: `
        
        `
     }),
    ACCESS_NOTIFICATION_POLICY: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        apiVersion: 23,
        name:"android.permission.ACCESS_NOTIFICATION_POLICY",
        label:"ACCESS_NOTIFICATION_POLICY",
        description: `
        
        `
     }),
    ACCESS_WIFI_STATE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        apiVersion: 1,
        name:"android.permission.ACCESS_WIFI_STATE",
        label:"ACCESS_WIFI_STATE",
        description: `
        
        `
     }), 

    ACCOUNT_MANAGER: new ModelPermission({
        apiVersion: 5,
        name:"android.permission.ACCOUNT_MANAGER",
        label:"ACCOUNT_MANAGER",
        description: `
        Allows applications to call into AccountAuthenticators.
        `
     }),

     ACTIVITY_RECOGNITION: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 29,
        name:"android.permission.ACTIVITY_RECOGNITION",
        label:"ACTIVITY_RECOGNITION",
        description: `
        Allows an application to recognize physical activity. 
        `
     }),

    ADD_VOICEMAIL: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 14,
        name:"android.permission.ADD_VOICEMAIL",
        label:"ADD_VOICEMAIL",
        description: `
        Allows an application to add voicemails into the system. 
        `
     }),
 
    ANSWER_PHONE_CALLS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 26,
        name:"android.permission.ANSWER_PHONE_CALLS",
        label:"ANSWER_PHONE_CALLS",
        description: `
        Allows the app to answer an incoming phone call. 
        `
     }),

    BATTERY_STATS: new ModelPermission({
        protectionLevel: [
            AndroidProtectionLevel.SIGNATURE,
            AndroidProtectionLevel.PRIVILEGED,
            AndroidProtectionLevel.DEVELOPMENT
        ],
        apiVersion: 1,
        name:"android.permission.BATTERY_STATS",
        label:"BATTERY_STATS",
        description: `
        Allows an application to collect battery statistics 
        `
     }),

     BIND_ACCESSIBILITY_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        apiVersion: 16,
        name:"android.permission.BIND_ACCESSIBILITY_SERVICE",
        label:"BIND_ACCESSIBILITY_SERVICE",
        query: [
            "class('extend.name:android\.accessibilityservice\.AccessibilityService')"
        ],
        description: `
        Must be required by an AccessibilityService, to ensure that only the system can bind to it. 
        `
     }),

    BIND_APPWIDGET: new ModelPermission({
        apiVersion: 3,
        name:"android.permission.BIND_AUTOFILL_SERVICE",
        label:"BIND_AUTOFILL_SERVICE",
        description: `
        Allows an application to tell the AppWidget service which application can access AppWidget's data. The normal user flow is that a user picks an AppWidget to go into a particular host, thereby giving that host application access to the private data from the AppWidget app. An application that has this permission should honor that contract.
        `
     }),

    BIND_AUTOFILL_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        apiVersion: 26,
        name:"android.permission.BIND_AUTOFILL_SERVICE",
        label:"BIND_AUTOFILL_SERVICE",
        query: [
            "class('extend.name:android\.service\.autofill\.AutofillService ')"
        ],
        description: `
        Must be required by a AutofillService, to ensure that only the system can bind to it. 
        `
     }),


    BIND_CARRIER_SERVICES: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        apiVersion: 1,
        name:"android.permission.BIND_CARRIER_SERVICES",
        label:"BIND_CARRIER_SERVICES",
        description: `
        
        `
     }),
    BIND_CHOOSER_TARGET_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_CHOOSER_TARGET_SERVICE",
        label:"BIND_CHOOSER_TARGET_SERVICE",
        description: `
        
        `
     }),
    BIND_CONDITION_PROVIDER_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_CONDITION_PROVIDER_SERVICE",
        label:"BIND_CONDITION_PROVIDER_SERVICE",
        description: `
        
        `
     }),
    BIND_DEVICE_ADMIN: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_DEVICE_ADMIN",
        label:"BIND_DEVICE_ADMIN",
        description: `
        
        `
     }),
    BIND_DREAM_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_DREAM_SERVICE",
        label:"BIND_DREAM_SERVICE",
        description: `
        
        `
     }),
    BIND_INCALL_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_INCALL_SERVICE",
        label:"BIND_INCALL_SERVICE",
        description: `
        
        `
     }),
    BIND_INPUT_METHOD: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_INPUT_METHOD",
        label:"BIND_INPUT_METHOD",
        description: `
        
        `
     }),
    BIND_MIDI_DEVICE_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_MIDI_DEVICE_SERVICE",
        label:"BIND_MIDI_DEVICE_SERVICE",
        description: `
        
        `
     }),
    BIND_NFC_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_NFC_SERVICE",
        label:"BIND_NFC_SERVICE",
        description: `
        
        `
     }),
    BIND_NOTIFICATION_LISTENER_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
        label:"BIND_NOTIFICATION_LISTENER_SERVICE",
        description: `
        
        `
     }),
    BIND_PRINT_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_PRINT_SERVICE",
        label:"BIND_PRINT_SERVICE",
        description: `
        
        `
     }),
    BIND_SCREENING_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_SCREENING_SERVICE",
        label:"BIND_SCREENING_SERVICE",
        description: `
        
        `
     }),
    BIND_TELECOM_CONNECTION_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_TELECOM_CONNECTION_SERVICE",
        label:"BIND_TELECOM_CONNECTION_SERVICE",
        description: `
        
        `
     }),
    BIND_TEXT_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_TEXT_SERVICE",
        label:"BIND_TEXT_SERVICE",
        description: `
        
        `
     }),
    BIND_TV_INPUT: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_TV_INPUT",
        label:"BIND_TV_INPUT",
        description: `
        
        `
     }),
    BIND_VISUAL_VOICEMAIL_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_VISUAL_VOICEMAIL_SERVICE",
        label:"BIND_VISUAL_VOICEMAIL_SERVICE",
        description: `
        
        `
     }),
    BIND_VOICE_INTERACTION: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_VOICE_INTERACTION",
        label:"BIND_VOICE_INTERACTION",
        description: `
        Must be required by a {@class:android.service.voice.VoiceInteractionService}, to ensure that only the system can bind to it. 
        
        Note:
        This permission is required to define hotword detection.
        `
     }),
    BIND_VPN_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_VPN_SERVICE",
        label:"BIND_VPN_SERVICE",
        description: `
        
        `
     }),
    BIND_VR_LISTENER_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_VR_LISTENER_SERVICE",
        label:"BIND_VR_LISTENER_SERVICE",
        description: `
        
        `
     }),
    BIND_WALLPAPER: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_WALLPAPER",
        label:"BIND_WALLPAPER",
        description: `
        
        `
     }),

    BLUETOOTH: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        apiVersion: 1,
        name:"android.permission.BLUETOOTH",
        label:"BLUETOOTH",
        description: `
        Allows applications to connect to paired bluetooth devices. 
        `
     }),
    BLUETOOTH_ADMIN: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        apiVersion: 1,
        name:"android.permission.BLUETOOTH_ADMIN",
        label:"BLUETOOTH_ADMIN",
        description: `
        Allows applications to discover and pair bluetooth devices. 
        `
     }),
    BLUETOOTH_PRIVILEGED: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        apiVersion: 19,
        name:"android.permission.BLUETOOTH_PRIVILEGED",
        label:"BLUETOOTH_PRIVILEGED",
        description: `
        Allows applications to pair bluetooth devices without user interaction, and to allow or disallow phonebook access or message access. 
        `
     }),
     
    BODY_SENSORS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.BODY_SENSORS",
        label:"BODY_SENSORS",
        description: `
        
        `
     }),

    BROADCAST_STICKY: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        apiVersion: 1,
        name:"android.permission.BROADCAST_STICKY",
        label:"BROADCAST_STICKY",
        description:`
        Allows an application to broadcast sticky intents. These are broadcasts whose data is held by the system after being finished, so that clients can quickly retrieve that data without having to wait for the next broadcast.
        `
     }),

    CALL_COMPANION_APP: new ModelPermission({
        protectionLevel: AndroidProtectionLevel.NORMAL,
        apiVersion: 29, 
        name: "android.permission.CALL_COMPANION_APP",
        label: "CALL_COMPANION_APP",
        controls: [
            "android.telecom.InCallService"
        ],
        description: `
        Allows an app which implements the InCallService API to be eligible to be enabled as a calling companion app. This means that the Telecom framework will bind to the app's InCallService implementation when there are calls active. The app can use the InCallService API to view information about calls on the system and control these calls. 
        `

    }),
    
    CALL_PHONE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 1,
        name:"android.permission.CALL_PHONE",
        label:"CALL_PHONE",
        description: `
        Allows an application to initiate a phone call without going through the Dialer user interface for the user to confirm the call. 
        `
     }),
    CAMERA: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        apiVersion: 1,
        name:"android.permission.CAMERA",
        label:"CAMERA",
        description: `
        Required to be able to access the camera device.

        This will automatically enforce the uses-feature manifest element for all camera features. If you do not require all camera features or can properly operate if a camera is not available, then you must modify your manifest as appropriate in order to install on devices that don't support all camera features.
        `

     }),
    CHANGE_NETWORK_STATE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.CHANGE_NETWORK_STATE",
        label:"CHANGE_NETWORK_STATE",
        description: `
        
        `
     }),
    CHANGE_WIFI_MULTICAST_STATE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.CHANGE_WIFI_MULTICAST_STATE",
        label:"CHANGE_WIFI_MULTICAST_STATE",
        description: `
        
        `
     }),
    CHANGE_WIFI_STATE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.CHANGE_WIFI_STATE",
        label:"CHANGE_WIFI_STATE",
        description: `
        
        `
     }),

    CLEAR_APP_CACHE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.CLEAR_APP_CACHE",
        label:"CLEAR_APP_CACHE",
        description: `
        
        `
    }),

    DISABLE_KEYGUARD: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.DISABLE_KEYGUARD",
        label:"DISABLE_KEYGUARD",
        description: `
        
        `
     }),
    EXPAND_STATUS_BAR: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.EXPAND_STATUS_BAR",
        label:"EXPAND_STATUS_BAR",
        description: `
        
        `
     }),
    FOREGROUND_SERVICE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.FOREGROUND_SERVICE",
        label:"FOREGROUND_SERVICE",
        description: `
        
        `
     }),

    GET_ACCOUNTS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.GET_ACCOUNTS",
        label:"GET_ACCOUNTS",
        description: `
        
        `
     }),

    GET_PACKAGE_SIZE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.GET_PACKAGE_SIZE",
        label:"GET_PACKAGE_SIZE",
        description: `
        
        `
     }),
    INSTALL_SHORTCUT: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.INSTALL_SHORTCUT",
        label:"INSTALL_SHORTCUT",
        description: `
        
        `
     }),
    INTERNET: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.INTERNET",
        label:"INTERNET",
        description: `
        
        `
     }),
    KILL_BACKGROUND_PROCESSES: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.KILL_BACKGROUND_PROCESSES",
        label:"KILL_BACKGROUND_PROCESSES",
        description: `
        
        `
    }),
    MANAGE_DOCUMENTS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.MANAGE_DOCUMENTS",
        label:"MANAGE_DOCUMENTS",
        description: `
        
        `
    }),
    MANAGE_OWN_CALLS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.MANAGE_OWN_CALLS",
        label:"MANAGE_OWN_CALLS",
        description: `
        
        `
     }),
    MODIFY_AUDIO_SETTINGS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.MODIFY_AUDIO_SETTINGS",
        label:"MODIFY_AUDIO_SETTINGS",
        description: `
        
        `
     }),
    NFC: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.NFC",
        label:"NFC",
        description: `
        
        `
     }),

     PROCESS_OUTGOING_CALLS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.PROCESS_OUTGOING_CALLS",
        label:"PROCESS_OUTGOING_CALLS",
        description: `
        
        `
     }),

    READ_CALENDAR: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.READ_CALENDAR",
        label:"READ_CALENDAR",
        description: `
        
        `
    }),

    READ_CALL_LOG: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.READ_CALL_LOG",
        label:"READ_CALL_LOG",
        description: `
        
        `
    }),

    READ_CONTACTS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.READ_CONTACTS",
        label:"READ_CONTACTS",
        description: `
        
        `
     }),

    READ_EXTERNAL_STORAGE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.READ_EXTERNAL_STORAGE",
        label:"READ_EXTERNAL_STORAGE",
        description: `
        
        `
     }),

    READ_PHONE_STATE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.READ_PHONE_STATE",
        label:"READ_PHONE_STATE",
        description: `
        
        `
     }),

    READ_PHONE_NUMBERS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.READ_PHONE_NUMBERS",
        label:"READ_PHONE_NUMBERS",
        description: `
        
        `
     }),

    READ_SMS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.READ_SMS",
        label:"READ_SMS",
        description: `
        
        `
     }),

    READ_SYNC_SETTINGS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.READ_SYNC_SETTINGS",
        label:"READ_SYNC_SETTINGS",
        description: `
        
        `
    }),

    READ_SYNC_STATS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.READ_SYNC_STATS",
        label:"READ_SYNC_STATS",
        description: `
        
        `
    }),
    
    READ_VOICEMAIL: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.READ_VOICEMAIL",
        label:"READ_VOICEMAIL",
        description: `
        
        `
    }),
    
    RECEIVE_BOOT_COMPLETED: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.RECEIVE_BOOT_COMPLETED",
        label:"RECEIVE_BOOT_COMPLETED",
        description: `
        
        `
    }),

    

    RECEIVE_MMS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.RECEIVE_MMS",
        label:"RECEIVE_MMS",
        description: `
        
        `
    }),
    
    RECEIVE_SMS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.RECEIVE_SMS",
        label:"RECEIVE_SMS",
        description: `
        
        `
     }),

    RECEIVE_WAP_PUSH: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.RECEIVE_WAP_PUSH",
        label:"RECEIVE_WAP_PUSH",
        description: `
        
        `
     }),

    RECORD_AUDIO: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.RECORD_AUDIO",
        label:"RECORD_AUDIO",
        description: `
        
        `
     }),
    
    REORDER_TASKS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.REORDER_TASKS",
        label:"REORDER_TASKS",
        description: `
        
        `
    }),
     
    REQUEST_COMPANION_RUN_IN_BACKGROUND: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.REQUEST_COMPANION_RUN_IN_BACKGROUND",
        label:"REQUEST_COMPANION_RUN_IN_BACKGROUND",
        description: `
        
        `
    }),
    
    REQUEST_COMPANION_USE_DATA_IN_BACKGROUND: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.REQUEST_COMPANION_USE_DATA_IN_BACKGROUND",
        label:"REQUEST_COMPANION_USE_DATA_IN_BACKGROUND",
        description: `
        
        `
    }),
    
    REQUEST_DELETE_PACKAGES: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.REQUEST_DELETE_PACKAGES",
        label:"REQUEST_DELETE_PACKAGES",
        description: `
        
        `
    }),
    
    REQUEST_IGNORE_BATTERY_OPTIMIZATIONS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
        label:"REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
        description: `
        
        `
    }),

    REQUEST_INSTALL_PACKAGES: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.REQUEST_INSTALL_PACKAGES",
        label:"REQUEST_INSTALL_PACKAGES",
        description: `
        
        `
    }),

    SEND_SMS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.SEND_SMS",
        label:"SEND_SMS",
        description: `
        
        `
     }),

    SET_ALARM: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.SET_ALARM",
        label:"SET_ALARM",
        description: `
        
        `
     }),
    SET_WALLPAPER: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.SET_WALLPAPER",
        label:"SET_WALLPAPER",
        description: `
        
        `
     }),
    SET_WALLPAPER_HINTS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.SET_WALLPAPER_HINTS",
        label:"SET_WALLPAPER_HINTS",
        description: `
        
        `
    }),

    SYSTEM_ALERT_WINDOW: new ModelPermission({
        protectionLevel: [AndroidProtectionLevel.SIGNATURE, AndroidProtectionLevel.SPECIAL],
        name:"android.permission.SYSTEM_ALERT_WINDOW",
        label:"SYSTEM_ALERT_WINDOW",
        description: `
        
        `
    }),
    /*
    SYSTEM_ALERT_WINDOW: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SPECIAL,
        name:"android.permission.SYSTEM_ALERT_WINDOW",
        label:"SYSTEM_ALERT_WINDOW"
     }),*/

    TRANSMIT_IR: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.TRANSMIT_IR",
        label:"TRANSMIT_IR",
        description: `
        
        `
     }),
    USE_FINGERPRINT: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.USE_FINGERPRINT",
        label:"USE_FINGERPRINT",
        description: `
        
        `
     }),
     
    USE_SIP: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.USE_SIP",
        label:"USE_SIP",
        description: `
        
        `
     }),

    VIBRATE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.VIBRATE",
        label:"VIBRATE",
        description: `
        
        `
    }),
    WAKE_LOCK: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.WAKE_LOCK",
        label:"WAKE_LOCK",
        description: `
        
        `
    }),

    WRITE_CALENDAR: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.WRITE_CALENDAR",
        label:"WRITE_CALENDAR",
        description: `
        
        `
     }),

     WRITE_CALL_LOG: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.WRITE_CALL_LOG",
        label:"WRITE_CALL_LOG",
        description: `
        
        `
     }),

     WRITE_CONTACTS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.WRITE_CONTACTS",
        label:"WRITE_CONTACTS",
        description: `
        
        `
     }),

    WRITE_EXTERNAL_STORAGE: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.DANGEROUS,
        name:"android.permission.WRITE_EXTERNAL_STORAGE",
        label:"WRITE_EXTERNAL_STORAGE",
        description: `
        
        `
     }),

    WRITE_SETTINGS: new ModelPermission({
        protectionLevel: [AndroidProtectionLevel.SIGNATURE,AndroidProtectionLevel.SPECIAL],
        name:"android.permission.WRITE_SETTINGS",
        label:"WRITE_SETTINGS",
        description: `
        
        `
     }),
     /*
    WRITE_SETTINGS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SPECIAL,
        name:"android.permission.WRITE_SETTINGS",
        label:"WRITE_SETTINGS"
     }),*/

    WRITE_SYNC_SETTINGS: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.NORMAL,
        name:"android.permission.WRITE_SYNC_SETTINGS",
        label:"WRITE_SYNC_SETTINGS",
        description: `
        
        `
     }),

    WRITE_VOICEMAIL: new ModelPermission({
        protectionLevel:AndroidProtectionLevel.SIGNATURE,
        name:"android.permission.WRITE_VOICEMAIL",
        label:"WRITE_VOICEMAIL",
        description: `
        
        `
     }),

};


const PermissionGroups = {
    CALENDAR: new AndroidPermissionGroup({
        name:"CALENDAR", 
        children: [
            Permissions.READ_CALENDAR,
            Permissions.WRITE_CALENDAR
        ]
    }),
    CALL_LOG: new AndroidPermissionGroup({
        name:"CALL_LOG", 
        children: [
            Permissions.READ_CALL_LOG,
            Permissions.WRITE_CALL_LOG,
            Permissions.PROCESS_OUTGOING_CALLS
        ]
    }),
    CAMERA: new AndroidPermissionGroup({
        name:"CAMERA", 
        children: [
            Permissions.CAMERA
        ]
    }),
    CONTACTS: new AndroidPermissionGroup({
        name:"CONTACTS", 
        children: [
            Permissions.READ_CONTACTS,
            Permissions.WRITE_CONTACTS,
            Permissions.GET_ACCOUNTS
        ]
    }),
    LOCATION: new AndroidPermissionGroup({
        name:"LOCATION", 
        children: [
            Permissions.ACCESS_FINE_LOCATION,
            Permissions.ACCESS_COARSE_LOCATION
        ]
    }),
    MICROPHONE: new AndroidPermissionGroup({
        name:"MICROPHONE", 
        children: [
            Permissions.RECORD_AUDIO
        ]
    }),
    PHONE: new AndroidPermissionGroup({
        name:"PHONE", 
        children: [
            Permissions.READ_PHONE_STATE,
            Permissions.READ_PHONE_NUMBERS,
            Permissions.CALL_PHONE,
            Permissions.ANSWER_PHONE_CALLS,
            Permissions.ADD_VOICEMAIL,
            Permissions.USE_SIP
        ]
    }),
    SENSORS: new AndroidPermissionGroup({
        name:"SENSORS", 
        children: [
            Permissions.BODY_SENSORS
        ]
    }),
    SMS: new AndroidPermissionGroup({
        name:"SMS", 
        children: [
            Permissions.SEND_SMS,
            Permissions.READ_SMS,
            Permissions.RECEIVE_SMS,
            Permissions.RECEIVE_MMS,
            Permissions.RECEIVE_WAP_PUSH
        ]
    }),
    STORAGE: new AndroidPermissionGroup({
        name:"STORAGE", 
        children: [
            Permissions.READ_EXTERNAL_STORAGE,
            Permissions.WRITE_EXTERNAL_STORAGE
        ]
    }),
};


var PermissionAnalyzer:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.0",
    tags: [
        {
            name:"protectionLevel",
            _tagsOptions:[
                { name:"normal"},
                { name:"signature"},
                { name:"dangerous"},
                { name:"special"}
            ]
        }
    ],
    
    hookSet: {
        id: "PermissionAnalyzer",
        name: "Permission analyzer",
        description: "[Internal] Built-in android permission analyzer",
        strategies:[]
    },

    eventListeners: {
        "dxc.fullscan.post_deploy":  function ( pEvent:BusEvent<any>):any {
            // detect Android sharedUserId
            switch(pEvent.getContext().getPlatform().os){
                case OperatingSystem.ANDROID:
                    const appInfo:AndroidManifest = (pEvent.getContext().getAppAnalyzer() as AndroidAppAnalyzer)?.getManifest();
                    let attr:AndroidSharedUser;
                    if(appInfo==null) /* skip */ return;

                    attr = appInfo.getSharedUser(); // .getAttribute("sharedUserId");
                    if(attr != null){
                        /*
                        if(AndroidResource.isReference(attr as string)){
                            attrVal = pEvent.getContext().getProjectDB().getAppResource(attr as string);
                            if(attrVal != null){
                                if((attrVal as ModelResource<any>).hasStringValue()){
                                    attr = (attrVal as ModelResource<any>).value.value;
                                }
                            }else{
                                attr = null;
                            }
                        }*/


                        pEvent.getContext().trigger({
                            type: "app.android.sharedUser",
                            data: {
                                type: "sharedUserId",
                                value: attr,
                                app: appInfo
                            }
                        });
                    }

                    break;
            }

        },
        "app.permission.new": function(pEvent:BusEvent<any>):any{

                if(pEvent.data.obj==null) return;

                let i = (pEvent.data.obj as ModelPermission).name.lastIndexOf('.');
                let p=false;

                // scan android built-in permissions
                for(let i in Permissions){
        
                    if(Permissions[i].name===pEvent.data.obj.name){
                        (pEvent.data.obj as ModelPermission).update(Permissions[i]);
                        return;
                    }
                }

                //(pEvent.data.obj as ModelPermission).setCustom(true);
            }
    }
});

export default PermissionAnalyzer;