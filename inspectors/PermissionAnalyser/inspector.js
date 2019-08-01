const HOOK = require("../../src/HookManager.js");
const Inspector = require("../../src/Inspector.js");
const Logger = require("../../src/Logger.js");
const Android = require("../../src/AndroidAppComponents.js");

// ===== INIT =====

var PermissionAnalyzer = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "PermissionAnalyzer",
        name: "Permission analyzer",
        description: "[Internal] Built-in android permission analyzer"
    })
});


PermissionAnalyzer.registerTagCategory(
    "protectionLevel",
    ["normal","signature","dangerous","special"]
);


// ===== CONFIG HOOKS =====



// ====== CONFIG TASK ====== 


const Permissions = {
    // normal
    ACCESS_LOCATION_EXTRA_COMMANDS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.ACCESS_LOCATION_EXTRA_COMMANDS",
        label:"ACCESS_LOCATION_EXTRA_COMMANDS"
     }),
    ACCESS_NETWORK_STATE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.ACCESS_NETWORK_STATE",
        label:"ACCESS_NETWORK_STATE"
     }),
    ACCESS_NOTIFICATION_POLICY: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.ACCESS_NOTIFICATION_POLICY",
        label:"ACCESS_NOTIFICATION_POLICY"
     }),
    ACCESS_WIFI_STATE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.ACCESS_WIFI_STATE",
        label:"ACCESS_WIFI_STATE"
     }),
    BLUETOOTH: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.BLUETOOTH",
        label:"BLUETOOTH"
     }),
    BLUETOOTH_ADMIN: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.BLUETOOTH_ADMIN",
        label:"BLUETOOTH_ADMIN"
     }),
    BROADCAST_STICKY: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.BROADCAST_STICKY",
        label:"BROADCAST_STICKY"
     }),
    CHANGE_NETWORK_STATE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.CHANGE_NETWORK_STATE",
        label:"CHANGE_NETWORK_STATE"
     }),
    CHANGE_WIFI_MULTICAST_STATE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.CHANGE_WIFI_MULTICAST_STATE",
        label:"CHANGE_WIFI_MULTICAST_STATE"
     }),
    CHANGE_WIFI_STATE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.CHANGE_WIFI_STATE",
        label:"CHANGE_WIFI_STATE"
     }),
    DISABLE_KEYGUARD: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.DISABLE_KEYGUARD",
        label:"DISABLE_KEYGUARD"
     }),
    EXPAND_STATUS_BAR: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.EXPAND_STATUS_BAR",
        label:"EXPAND_STATUS_BAR"
     }),
    FOREGROUND_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.FOREGROUND_SERVICE",
        label:"FOREGROUND_SERVICE"
     }),
    GET_PACKAGE_SIZE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.GET_PACKAGE_SIZE",
        label:"GET_PACKAGE_SIZE"
     }),
    INSTALL_SHORTCUT: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.INSTALL_SHORTCUT",
        label:"INSTALL_SHORTCUT"
     }),
    INTERNET: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.INTERNET",
        label:"INTERNET"
     }),
    KILL_BACKGROUND_PROCESSES: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.KILL_BACKGROUND_PROCESSES",
        label:"KILL_BACKGROUND_PROCESSES"
     }),
    MANAGE_OWN_CALLS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.MANAGE_OWN_CALLS",
        label:"MANAGE_OWN_CALLS"
     }),
    MODIFY_AUDIO_SETTINGS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.MODIFY_AUDIO_SETTINGS",
        label:"MODIFY_AUDIO_SETTINGS"
     }),
    NFC: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.NFC",
        label:"NFC"
     }),
    READ_SYNC_SETTINGS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.READ_SYNC_SETTINGS",
        label:"READ_SYNC_SETTINGS"
     }),
    READ_SYNC_STATS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.READ_SYNC_STATS",
        label:"READ_SYNC_STATS"
     }),
    RECEIVE_BOOT_COMPLETED: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.RECEIVE_BOOT_COMPLETED",
        label:"RECEIVE_BOOT_COMPLETED"
     }),
    REORDER_TASKS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.REORDER_TASKS",
        label:"REORDER_TASKS"
     }),
    REQUEST_COMPANION_RUN_IN_BACKGROUND: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.REQUEST_COMPANION_RUN_IN_BACKGROUND",
        label:"REQUEST_COMPANION_RUN_IN_BACKGROUND"
     }),
    REQUEST_COMPANION_USE_DATA_IN_BACKGROUND: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.REQUEST_COMPANION_USE_DATA_IN_BACKGROUND",
        label:"REQUEST_COMPANION_USE_DATA_IN_BACKGROUND"
     }),
    REQUEST_DELETE_PACKAGES: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.REQUEST_DELETE_PACKAGES",
        label:"REQUEST_DELETE_PACKAGES"
     }),
    REQUEST_IGNORE_BATTERY_OPTIMIZATIONS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
        label:"REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"
     }),
    SET_ALARM: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.SET_ALARM",
        label:"SET_ALARM"
     }),
    SET_WALLPAPER: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.SET_WALLPAPER",
        label:"SET_WALLPAPER"
     }),
    SET_WALLPAPER_HINTS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.SET_WALLPAPER_HINTS",
        label:"SET_WALLPAPER_HINTS"
     }),
    TRANSMIT_IR: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.TRANSMIT_IR",
        label:"TRANSMIT_IR"
     }),
    USE_FINGERPRINT: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.USE_FINGERPRINT",
        label:"USE_FINGERPRINT"
     }),
    VIBRATE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.VIBRATE",
        label:"VIBRATE"
     }),
    WAKE_LOCK: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.WAKE_LOCK",
        label:"WAKE_LOCK"
     }),
    WRITE_SYNC_SETTINGS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.NORMAL,
        name:"android.permission.WRITE_SYNC_SETTINGS",
        label:"WRITE_SYNC_SETTINGS"
     }),

    // signature
    BIND_ACCESSIBILITY_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_ACCESSIBILITY_SERVICE",
        label:"BIND_ACCESSIBILITY_SERVICE"
     }),
    BIND_AUTOFILL_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_AUTOFILL_SERVICE",
        label:"BIND_AUTOFILL_SERVICE"
     }),
    BIND_CARRIER_SERVICES: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_CARRIER_SERVICES",
        label:"BIND_CARRIER_SERVICES"
     }),
    BIND_CHOOSER_TARGET_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_CHOOSER_TARGET_SERVICE",
        label:"BIND_CHOOSER_TARGET_SERVICE"
     }),
    BIND_CONDITION_PROVIDER_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_CONDITION_PROVIDER_SERVICE",
        label:"BIND_CONDITION_PROVIDER_SERVICE"
     }),
    BIND_DEVICE_ADMIN: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_DEVICE_ADMIN",
        label:"BIND_DEVICE_ADMIN"
     }),
    BIND_DREAM_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_DREAM_SERVICE",
        label:"BIND_DREAM_SERVICE"
     }),
    BIND_INCALL_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_INCALL_SERVICE",
        label:"BIND_INCALL_SERVICE"
     }),
    BIND_INPUT_METHOD: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_INPUT_METHOD",
        label:"BIND_INPUT_METHOD"
     }),
    BIND_MIDI_DEVICE_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_MIDI_DEVICE_SERVICE",
        label:"BIND_MIDI_DEVICE_SERVICE"
     }),
    BIND_NFC_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_NFC_SERVICE",
        label:"BIND_NFC_SERVICE"
     }),
    BIND_NOTIFICATION_LISTENER_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
        label:"BIND_NOTIFICATION_LISTENER_SERVICE"
     }),
    BIND_PRINT_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_PRINT_SERVICE",
        label:"BIND_PRINT_SERVICE"
     }),
    BIND_SCREENING_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_SCREENING_SERVICE",
        label:"BIND_SCREENING_SERVICE"
     }),
    BIND_TELECOM_CONNECTION_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_TELECOM_CONNECTION_SERVICE",
        label:"BIND_TELECOM_CONNECTION_SERVICE"
     }),
    BIND_TEXT_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_TEXT_SERVICE",
        label:"BIND_TEXT_SERVICE"
     }),
    BIND_TV_INPUT: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_TV_INPUT",
        label:"BIND_TV_INPUT"
     }),
    BIND_VISUAL_VOICEMAIL_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_VISUAL_VOICEMAIL_SERVICE",
        label:"BIND_VISUAL_VOICEMAIL_SERVICE"
     }),
    BIND_VOICE_INTERACTION: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_VOICE_INTERACTION",
        label:"BIND_VOICE_INTERACTION"
     }),
    BIND_VPN_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_VPN_SERVICE",
        label:"BIND_VPN_SERVICE"
     }),
    BIND_VR_LISTENER_SERVICE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_VR_LISTENER_SERVICE",
        label:"BIND_VR_LISTENER_SERVICE"
     }),
    BIND_WALLPAPER: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.BIND_WALLPAPER",
        label:"BIND_WALLPAPER"
     }),
    CLEAR_APP_CACHE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.CLEAR_APP_CACHE",
        label:"CLEAR_APP_CACHE"
     }),
    MANAGE_DOCUMENTS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.MANAGE_DOCUMENTS",
        label:"MANAGE_DOCUMENTS"
     }),
    READ_VOICEMAIL: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.READ_VOICEMAIL",
        label:"READ_VOICEMAIL"
     }),
    REQUEST_INSTALL_PACKAGES: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.REQUEST_INSTALL_PACKAGES",
        label:"REQUEST_INSTALL_PACKAGES"
     }),
    SYSTEM_ALERT_WINDOW: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.SYSTEM_ALERT_WINDOW",
        label:"SYSTEM_ALERT_WINDOW"
     }),
    WRITE_SETTINGS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.WRITE_SETTINGS",
        label:"WRITE_SETTINGS"
     }),
    WRITE_VOICEMAIL: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SIGNATURE,
        name:"android.permission.WRITE_VOICEMAIL",
        label:"WRITE_VOICEMAIL"
     }),

    // special
    SYSTEM_ALERT_WINDOW: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SPECIAL,
        name:"android.permission.SYSTEM_ALERT_WINDOW",
        label:"SYSTEM_ALERT_WINDOW"
     }),
    WRITE_SETTINGS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.SPECIAL,
        name:"android.permission.WRITE_SETTINGS",
        label:"WRITE_SETTINGS"
     }),

    // dangerous
    READ_CALENDAR: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.READ_CALENDAR",
        label:"READ_CALENDAR"
     }),
    WRITE_CALENDAR: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.WRITE_CALENDAR",
        label:"WRITE_CALENDAR"
     }),
    READ_CALL_LOG: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.READ_CALL_LOG",
        label:"READ_CALL_LOG"
     }),
    WRITE_CALL_LOG: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.WRITE_CALL_LOG",
        label:"WRITE_CALL_LOG"
     }),
    PROCESS_OUTGOING_CALLS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.PROCESS_OUTGOING_CALLS",
        label:"PROCESS_OUTGOING_CALLS"
     }),
    CAMERA: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.CAMERA",
        label:"CAMERA"
     }),
    READ_CONTACTS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.READ_CONTACTS",
        label:"READ_CONTACTS"
     }),
    WRITE_CONTACTS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.WRITE_CONTACTS",
        label:"WRITE_CONTACTS"
     }),
    GET_ACCOUNTS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.GET_ACCOUNTS",
        label:"GET_ACCOUNTS"
     }),
    ACCESS_FINE_LOCATION: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.ACCESS_FINE_LOCATION",
        label:"ACCESS_FINE_LOCATION"
     }),
    ACCESS_COARSE_LOCATION: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.ACCESS_COARSE_LOCATION",
        label:"ACCESS_COARSE_LOCATION"
     }),
    RECORD_AUDIO: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.RECORD_AUDIO",
        label:"RECORD_AUDIO"
     }),
    READ_PHONE_STATE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.READ_PHONE_STATE",
        label:"READ_PHONE_STATE"
     }),
    READ_PHONE_NUMBERS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.READ_PHONE_NUMBERS",
        label:"READ_PHONE_NUMBERS"
     }),
    CALL_PHONE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.CALL_PHONE",
        label:"CALL_PHONE"
     }),
    ANSWER_PHONE_CALLS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.ANSWER_PHONE_CALLS",
        label:"ANSWER_PHONE_CALLS"
     }),
    ADD_VOICEMAIL: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.ADD_VOICEMAIL",
        label:"ADD_VOICEMAIL"
     }),
    USE_SIP: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.USE_SIP",
        label:"USE_SIP"
     }),
    BODY_SENSORS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.BODY_SENSORS",
        label:"BODY_SENSORS"
     }),
    SEND_SMS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.SEND_SMS",
        label:"SEND_SMS"
     }),
    RECEIVE_SMS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.RECEIVE_SMS",
        label:"RECEIVE_SMS"
     }),
    READ_SMS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.READ_SMS",
        label:"READ_SMS"
     }),
    RECEIVE_WAP_PUSH: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.RECEIVE_WAP_PUSH",
        label:"RECEIVE_WAP_PUSH"
     }),
    RECEIVE_MMS: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.RECEIVE_MMS",
        label:"RECEIVE_MMS"
     }),
    READ_EXTERNAL_STORAGE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.READ_EXTERNAL_STORAGE",
        label:"READ_EXTERNAL_STORAGE"
     }),
    WRITE_EXTERNAL_STORAGE: new Android.Permission({
        protectionLevel:Android.ProtectionLevel.DANGEROUS,
        name:"android.permission.WRITE_EXTERNAL_STORAGE",
        label:"WRITE_EXTERNAL_STORAGE"
     })
};


const PermissionGroups = {
    CALENDAR: new Android.PermissionGroup({ 
        name:"CALENDAR", 
        children: [
            Permissions.READ_CALENDAR,
            Permissions.WRITE_CALENDAR
        ]
    }),
    CALL_LOG: new Android.PermissionGroup({ 
        name:"CALL_LOG", 
        children: [
            Permissions.READ_CALL_LOG,
            Permissions.WRITE_CALL_LOG,
            Permissions.PROCESS_OUTGOING_CALLS
        ]
    }),
    CAMERA: new Android.PermissionGroup({ 
        name:"CAMERA", 
        children: [
            Permissions.CAMERA
        ]
    }),
    CONTACTS: new Android.PermissionGroup({ 
        name:"CONTACTS", 
        children: [
            Permissions.READ_CONTACTS,
            Permissions.WRITE_CONTACTS,
            Permissions.GET_ACCOUNTS
        ]
    }),
    LOCATION: new Android.PermissionGroup({ 
        name:"LOCATION", 
        children: [
            Permissions.ACCESS_FINE_LOCATION,
            Permissions.ACCESS_COARSE_LOCATION
        ]
    }),
    MICROPHONE: new Android.PermissionGroup({ 
        name:"MICROPHONE", 
        children: [
            Permissions.RECORD_AUDIO
        ]
    }),
    PHONE: new Android.PermissionGroup({ 
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
    SENSORS: new Android.PermissionGroup({ 
        name:"SENSORS", 
        children: [
            Permissions.BODY_SENSORS
        ]
    }),
    SMS: new Android.PermissionGroup({ 
        name:"SMS", 
        children: [
            Permissions.SEND_SMS,
            Permissions.READ_SMS,
            Permissions.RECEIVE_SMS,
            Permissions.RECEIVE_MMS,
            Permissions.RECEIVE_WAP_PUSH
        ]
    }),
    STORAGE: new Android.PermissionGroup({ 
        name:"STORAGE", 
        children: [
            Permissions.READ_EXTERNAL_STORAGE,
            Permissions.WRITE_EXTERNAL_STORAGE
        ]
    }),
};




PermissionAnalyzer.on("app.permission.new", {
    task: function(ctx, event){
        let i = event.data.name.lastIndexOf('.');
        let p=false;

        // scan android built-in permissions
		for(let i in Permissions){

			if(Permissions[i].name===event.data.name){
                event.data.update(Permissions[i]);
                return;
			}
		}

        if(p===false){
            event.data.setCustom(true);
        }
    }
});


module.exports = PermissionAnalyzer;