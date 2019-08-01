const Android = require("../../../src/AndroidAppComponents.js");



const Permissions = {
    normal:{
        ACCESS_LOCATION_EXTRA_COMMANDS: new Android.Permission({ name:"ACCESS_LOCATION_EXTRA_COMMANDS" }),
        ACCESS_NETWORK_STATE: new Android.Permission({ name:"ACCESS_NETWORK_STATE" }),
        ACCESS_NOTIFICATION_POLICY: new Android.Permission({ name:"ACCESS_NOTIFICATION_POLICY" }),
        ACCESS_WIFI_STATE: new Android.Permission({ name:"ACCESS_WIFI_STATE" }),
        BLUETOOTH: new Android.Permission({ name:"BLUETOOTH" }),
        BLUETOOTH_ADMIN: new Android.Permission({ name:"BLUETOOTH_ADMIN" }),
        BROADCAST_STICKY: new Android.Permission({ name:"BROADCAST_STICKY" }),
        CHANGE_NETWORK_STATE: new Android.Permission({ name:"CHANGE_NETWORK_STATE" }),
        CHANGE_WIFI_MULTICAST_STATE: new Android.Permission({ name:"CHANGE_WIFI_MULTICAST_STATE" }),
        CHANGE_WIFI_STATE: new Android.Permission({ name:"CHANGE_WIFI_STATE" }),
        DISABLE_KEYGUARD: new Android.Permission({ name:"DISABLE_KEYGUARD" }),
        EXPAND_STATUS_BAR: new Android.Permission({ name:"EXPAND_STATUS_BAR" }),
        FOREGROUND_SERVICE: new Android.Permission({ name:"FOREGROUND_SERVICE" }),
        GET_PACKAGE_SIZE: new Android.Permission({ name:"GET_PACKAGE_SIZE" }),
        INSTALL_SHORTCUT: new Android.Permission({ name:"INSTALL_SHORTCUT" }),
        INTERNET: new Android.Permission({ name:"INTERNET" }),
        KILL_BACKGROUND_PROCESSES: new Android.Permission({ name:"KILL_BACKGROUND_PROCESSES" }),
        MANAGE_OWN_CALLS: new Android.Permission({ name:"MANAGE_OWN_CALLS" }),
        MODIFY_AUDIO_SETTINGS: new Android.Permission({ name:"MODIFY_AUDIO_SETTINGS" }),
        NFC: new Android.Permission({ name:"NFC" }),
        READ_SYNC_SETTINGS: new Android.Permission({ name:"READ_SYNC_SETTINGS" }),
        READ_SYNC_STATS: new Android.Permission({ name:"READ_SYNC_STATS" }),
        RECEIVE_BOOT_COMPLETED: new Android.Permission({ name:"RECEIVE_BOOT_COMPLETED" }),
        REORDER_TASKS: new Android.Permission({ name:"REORDER_TASKS" }),
        REQUEST_COMPANION_RUN_IN_BACKGROUND: new Android.Permission({ name:"REQUEST_COMPANION_RUN_IN_BACKGROUND" }),
        REQUEST_COMPANION_USE_DATA_IN_BACKGROUND: new Android.Permission({ name:"REQUEST_COMPANION_USE_DATA_IN_BACKGROUND" }),
        REQUEST_DELETE_PACKAGES: new Android.Permission({ name:"REQUEST_DELETE_PACKAGES" }),
        REQUEST_IGNORE_BATTERY_OPTIMIZATIONS: new Android.Permission({ name:"REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" }),
        SET_ALARM: new Android.Permission({ name:"SET_ALARM" }),
        SET_WALLPAPER: new Android.Permission({ name:"SET_WALLPAPER" }),
        SET_WALLPAPER_HINTS: new Android.Permission({ name:"SET_WALLPAPER_HINTS" }),
        TRANSMIT_IR: new Android.Permission({ name:"TRANSMIT_IR" }),
        USE_FINGERPRINT: new Android.Permission({ name:"USE_FINGERPRINT" }),
        VIBRATE: new Android.Permission({ name:"VIBRATE" }),
        WAKE_LOCK: new Android.Permission({ name:"WAKE_LOCK" }),
        WRITE_SYNC_SETTINGS: new Android.Permission({ name:"WRITE_SYNC_SETTINGS" }),
    },
    signature:{
        BIND_ACCESSIBILITY_SERVICE: new Android.Permission({ name:"BIND_ACCESSIBILITY_SERVICE" }),
        BIND_AUTOFILL_SERVICE: new Android.Permission({ name:"BIND_AUTOFILL_SERVICE" }),
        BIND_CARRIER_SERVICES: new Android.Permission({ name:"BIND_CARRIER_SERVICES" }),
        BIND_CHOOSER_TARGET_SERVICE: new Android.Permission({ name:"BIND_CHOOSER_TARGET_SERVICE" }),
        BIND_CONDITION_PROVIDER_SERVICE: new Android.Permission({ name:"BIND_CONDITION_PROVIDER_SERVICE" }),
        BIND_DEVICE_ADMIN: new Android.Permission({ name:"BIND_DEVICE_ADMIN" }),
        BIND_DREAM_SERVICE: new Android.Permission({ name:"BIND_DREAM_SERVICE" }),
        BIND_INCALL_SERVICE: new Android.Permission({ name:"BIND_INCALL_SERVICE" }),
        BIND_INPUT_METHOD: new Android.Permission({ name:"BIND_INPUT_METHOD" }),
        BIND_MIDI_DEVICE_SERVICE: new Android.Permission({ name:"BIND_MIDI_DEVICE_SERVICE" }),
        BIND_NFC_SERVICE: new Android.Permission({ name:"BIND_NFC_SERVICE" }),
        BIND_NOTIFICATION_LISTENER_SERVICE: new Android.Permission({ name:"BIND_NOTIFICATION_LISTENER_SERVICE" }),
        BIND_PRINT_SERVICE: new Android.Permission({ name:"BIND_PRINT_SERVICE" }),
        BIND_SCREENING_SERVICE: new Android.Permission({ name:"BIND_SCREENING_SERVICE" }),
        BIND_TELECOM_CONNECTION_SERVICE: new Android.Permission({ name:"BIND_TELECOM_CONNECTION_SERVICE" }),
        BIND_TEXT_SERVICE: new Android.Permission({ name:"BIND_TEXT_SERVICE" }),
        BIND_TV_INPUT: new Android.Permission({ name:"BIND_TV_INPUT" }),
        BIND_VISUAL_VOICEMAIL_SERVICE: new Android.Permission({ name:"BIND_VISUAL_VOICEMAIL_SERVICE" }),
        BIND_VOICE_INTERACTION: new Android.Permission({ name:"BIND_VOICE_INTERACTION" }),
        BIND_VPN_SERVICE: new Android.Permission({ name:"BIND_VPN_SERVICE" }),
        BIND_VR_LISTENER_SERVICE: new Android.Permission({ name:"BIND_VR_LISTENER_SERVICE" }),
        BIND_WALLPAPER: new Android.Permission({ name:"BIND_WALLPAPER" }),
        CLEAR_APP_CACHE: new Android.Permission({ name:"CLEAR_APP_CACHE" }),
        MANAGE_DOCUMENTS: new Android.Permission({ name:"MANAGE_DOCUMENTS" }),
        READ_VOICEMAIL: new Android.Permission({ name:"READ_VOICEMAIL" }),
        REQUEST_INSTALL_PACKAGES: new Android.Permission({ name:"REQUEST_INSTALL_PACKAGES" }),
        SYSTEM_ALERT_WINDOW: new Android.Permission({ name:"SYSTEM_ALERT_WINDOW" }),
        WRITE_SETTINGS: new Android.Permission({ name:"WRITE_SETTINGS" }),
        WRITE_VOICEMAIL: new Android.Permission({ name:"WRITE_VOICEMAIL" }),
    },
    special: {
        SYSTEM_ALERT_WINDOW: new Android.Permission({ name:"SYSTEM_ALERT_WINDOW" }),
        WRITE_SETTINGS: new Android.Permission({ name:"WRITE_SETTINGS" }),
    },
    dangerous: {
        READ_CALENDAR: new Android.Permission({ name:"READ_CALENDAR" }),
        WRITE_CALENDAR: new Android.Permission({ name:"WRITE_CALENDAR" }),
        READ_CALL_LOG: new Android.Permission({ name:"READ_CALL_LOG" }),
        WRITE_CALL_LOG: new Android.Permission({ name:"WRITE_CALL_LOG" }),
        PROCESS_OUTGOING_CALLS: new Android.Permission({ name:"PROCESS_OUTGOING_CALLS" }),
        CAMERA: new Android.Permission({ name:"CAMERA" }),
        READ_CONTACTS: new Android.Permission({ name:"READ_CONTACTS" }),
        WRITE_CONTACTS: new Android.Permission({ name:"WRITE_CONTACTS" }),
        GET_ACCOUNTS: new Android.Permission({ name:"GET_ACCOUNTS" }),
        ACCESS_FINE_LOCATION: new Android.Permission({ name:"ACCESS_FINE_LOCATION" }),
        ACCESS_COARSE_LOCATION: new Android.Permission({ name:"ACCESS_COARSE_LOCATION" }),
        RECORD_AUDIO: new Android.Permission({ name:"RECORD_AUDIO" }),
        READ_PHONE_STATE: new Android.Permission({ name:"READ_PHONE_STATE" }),
        READ_PHONE_NUMBERS: new Android.Permission({ name:"READ_PHONE_NUMBERS" }),
        CALL_PHONE: new Android.Permission({ name:"CALL_PHONE" }),
        ANSWER_PHONE_CALLS: new Android.Permission({ name:"ANSWER_PHONE_CALLS" }),
        ADD_VOICEMAIL: new Android.Permission({ name:"ADD_VOICEMAIL" }),
        USE_SIP: new Android.Permission({ name:"USE_SIP" }),
        BODY_SENSORS: new Android.Permission({ name:"BODY_SENSORS" }),
        SEND_SMS: new Android.Permission({ name:"SEND_SMS" }),
        RECEIVE_SMS: new Android.Permission({ name:"RECEIVE_SMS" }),
        READ_SMS: new Android.Permission({ name:"READ_SMS" }),
        RECEIVE_WAP_PUSH: new Android.Permission({ name:"RECEIVE_WAP_PUSH" }),
        RECEIVE_MMS: new Android.Permission({ name:"RECEIVE_MMS" }),
        READ_EXTERNAL_STORAGE: new Android.Permission({ name:"READ_EXTERNAL_STORAGE" }),
        WRITE_EXTERNAL_STORAGE: new Android.Permission({ name:"WRITE_EXTERNAL_STORAGE" })
    }
};


const PermissionGroups = {
    CALENDAR: new Android.PermissionGroup({ 
        name:"CALENDAR", 
        children: [
            Permissions.dangerous.READ_CALENDAR,
            Permissions.dangerous.WRITE_CALENDAR
        ]
    }),
    CALL_LOG: new Android.PermissionGroup({ 
        name:"CALL_LOG", 
        children: [
            Permissions.dangerous.READ_CALL_LOG,
            Permissions.dangerous.WRITE_CALL_LOG,
            Permissions.dangerous.PROCESS_OUTGOING_CALLS
        ]
    }),
    CAMERA: new Android.PermissionGroup({ 
        name:"CAMERA", 
        children: [
            Permissions.dangerous.CAMERA
        ]
    }),
    CONTACTS: new Android.PermissionGroup({ 
        name:"CONTACTS", 
        children: [
            Permissions.dangerous.READ_CONTACTS,
            Permissions.dangerous.WRITE_CONTACTS,
            Permissions.dangerous.GET_ACCOUNTS
        ]
    }),
    LOCATION: new Android.PermissionGroup({ 
        name:"LOCATION", 
        children: [
            Permissions.dangerous.ACCESS_FINE_LOCATION,
            Permissions.dangerous.ACCESS_COARSE_LOCATION
        ]
    }),
    MICROPHONE: new Android.PermissionGroup({ 
        name:"MICROPHONE", 
        children: [
            Permissions.dangerous.RECORD_AUDIO
        ]
    }),
    PHONE: new Android.PermissionGroup({ 
        name:"PHONE", 
        children: [
            Permissions.dangerous.READ_PHONE_STATE,
            Permissions.dangerous.READ_PHONE_NUMBERS,
            Permissions.dangerous.CALL_PHONE,
            Permissions.dangerous.ANSWER_PHONE_CALLS,
            Permissions.dangerous.ADD_VOICEMAIL,
            Permissions.dangerous.USE_SIP
        ]
    }),
    SENSORS: new Android.PermissionGroup({ 
        name:"SENSORS", 
        children: [
            Permissions.dangerous.BODY_SENSORS
        ]
    }),
    SMS: new Android.PermissionGroup({ 
        name:"SMS", 
        children: [
            Permissions.dangerous.SEND_SMS,
            Permissions.dangerous.READ_SMS,
            Permissions.dangerous.RECEIVE_SMS,
            Permissions.dangerous.RECEIVE_MMS,
            Permissions.dangerous.RECEIVE_WAP_PUSH
        ]
     }),
    STORAGE: new Android.PermissionGroup({ 
        name:"STORAGE", 
        children: [
            Permissions.dangerous.READ_EXTERNAL_STORAGE,
            Permissions.dangerous.WRITE_EXTERNAL_STORAGE
        ]
     }),
};

module.exports = {
    groups: PermissionGroups,
    permissions: Permissions
}
