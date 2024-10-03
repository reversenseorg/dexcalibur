import InputEventCodeProperties from "./InputEventCodeProperties.js";
import EncodedToken from "./EncodedToken.js";
import {Endianness} from "../core/Endianness.js";

// Source: https://cs.android.com/android/platform/superproject/main/+/main:bionic/libc/kernel/uapi/linux/input-event-codes.h
// Source: https://lxr.linux.no/#linux+v3.9.5/include/uapi/linux/input.h
// Source: https://codebrowser.dev/qt6/include/linux/input.h.html

export default class InputEventCode extends EncodedToken {
    description?:string;
    properties: InputEventCodeProperties;
    tags: number[];
    metadata?:any;

    constructor( pParent: any, pConfig:any ) {
        super(pParent);
        if (pConfig != null) {
            for (const i in pConfig) this[i] = pConfig[i];
        }
    }

    static parse(rawCodeValue: number){
        return new InputEventCode(
            {key: "DUMMY_CODE", value: rawCodeValue, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
            {description: "DUMMY INPUT EVENT CODE"});
    }
    
    static readonly INPUT_PROP_POINTER = new InputEventCode({key: "INPUT_PROP_POINTER", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly INPUT_PROP_DIRECT = new InputEventCode({key: "INPUT_PROP_DIRECT", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly INPUT_PROP_BUTTONPAD = new InputEventCode({key: "INPUT_PROP_BUTTONPAD", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly INPUT_PROP_SEMI_MT = new InputEventCode({key: "INPUT_PROP_SEMI_MT", value: 0x03, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly INPUT_PROP_TOPBUTTONPAD = new InputEventCode({key: "INPUT_PROP_TOPBUTTONPAD", value: 0x04, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly INPUT_PROP_POINTING_STICK = new InputEventCode({key: "INPUT_PROP_POINTING_STICK", value: 0x05, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly INPUT_PROP_ACCELEROMETER = new InputEventCode({key: "INPUT_PROP_ACCELEROMETER", value: 0x06, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly INPUT_PROP_MAX = new InputEventCode({key: "INPUT_PROP_MAX", value: 0x1f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly INPUT_PROP_CNT = new InputEventCode({key: "INPUT_PROP_CNT", value: 0x20, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Synchronisation Event Codes
    static readonly SYN_REPORT = new InputEventCode({key: "SYN_REPORT", value: 0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SYN_CONFIG = new InputEventCode({key: "SYN_CONFIG", value: 1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SYN_MT_REPORT = new InputEventCode({key: "SYN_MT_REPORT", value: 2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SYN_DROPPED = new InputEventCode({key: "SYN_DROPPED", value: 3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SYN_MAX = new InputEventCode({key: "SYN_MAX", value: 0xf, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SYN_CNT = new InputEventCode({key: "SYN_CNT", value: 0x10, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Key Event Codes
    static readonly KEY_RESERVED = new InputEventCode({key: "KEY_RESERVED", value: 0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ESC = new InputEventCode({key: "KEY_ESC", value: 1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_1 = new InputEventCode({key: "KEY_1", value: 2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_2 = new InputEventCode({key: "KEY_2", value: 3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_3 = new InputEventCode({key: "KEY_3", value: 4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_4 = new InputEventCode({key: "KEY_4", value: 5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_5 = new InputEventCode({key: "KEY_5", value: 6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_6 = new InputEventCode({key: "KEY_6", value: 7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_7 = new InputEventCode({key: "KEY_7", value: 8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_8 = new InputEventCode({key: "KEY_8", value: 9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_9 = new InputEventCode({key: "KEY_9", value: 10, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_0 = new InputEventCode({key: "KEY_0", value: 11, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MINUS = new InputEventCode({key: "KEY_MINUS", value: 12, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_EQUAL = new InputEventCode({key: "KEY_EQUAL", value: 13, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BACKSPACE = new InputEventCode({key: "KEY_BACKSPACE", value: 14, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TAB = new InputEventCode({key: "KEY_TAB", value: 15, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_Q = new InputEventCode({key: "KEY_Q", value: 16, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_W = new InputEventCode({key: "KEY_W", value: 17, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_E = new InputEventCode({key: "KEY_E", value: 18, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_R = new InputEventCode({key: "KEY_R", value: 19, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_T = new InputEventCode({key: "KEY_T", value: 20, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_Y = new InputEventCode({key: "KEY_Y", value: 21, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_U = new InputEventCode({key: "KEY_U", value: 22, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_I = new InputEventCode({key: "KEY_I", value: 23, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_O = new InputEventCode({key: "KEY_O", value: 24, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_P = new InputEventCode({key: "KEY_P", value: 25, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LEFTBRACE = new InputEventCode({key: "KEY_LEFTBRACE", value: 26, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RIGHTBRACE = new InputEventCode({key: "KEY_RIGHTBRACE", value: 27, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ENTER = new InputEventCode({key: "KEY_ENTER", value: 28, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LEFTCTRL = new InputEventCode({key: "KEY_LEFTCTRL", value: 29, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_A = new InputEventCode({key: "KEY_A", value: 30, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_S = new InputEventCode({key: "KEY_S", value: 31, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_D = new InputEventCode({key: "KEY_D", value: 32, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F = new InputEventCode({key: "KEY_F", value: 33, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_G = new InputEventCode({key: "KEY_G", value: 34, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_H = new InputEventCode({key: "KEY_H", value: 35, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_J = new InputEventCode({key: "KEY_J", value: 36, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_K = new InputEventCode({key: "KEY_K", value: 37, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_L = new InputEventCode({key: "KEY_L", value: 38, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SEMICOLON = new InputEventCode({key: "KEY_SEMICOLON", value: 39, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_APOSTROPHE = new InputEventCode({key: "KEY_APOSTROPHE", value: 40, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_GRAVE = new InputEventCode({key: "KEY_GRAVE", value: 41, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LEFTSHIFT = new InputEventCode({key: "KEY_LEFTSHIFT", value: 42, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BACKSLASH = new InputEventCode({key: "KEY_BACKSLASH", value: 43, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_Z = new InputEventCode({key: "KEY_Z", value: 44, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_X = new InputEventCode({key: "KEY_X", value: 45, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_C = new InputEventCode({key: "KEY_C", value: 46, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_V = new InputEventCode({key: "KEY_V", value: 47, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_B = new InputEventCode({key: "KEY_B", value: 48, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_N = new InputEventCode({key: "KEY_N", value: 49, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_M = new InputEventCode({key: "KEY_M", value: 50, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_COMMA = new InputEventCode({key: "KEY_COMMA", value: 51, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DOT = new InputEventCode({key: "KEY_DOT", value: 52, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SLASH = new InputEventCode({key: "KEY_SLASH", value: 53, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RIGHTSHIFT = new InputEventCode({key: "KEY_RIGHTSHIFT", value: 54, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPASTERISK = new InputEventCode({key: "KEY_KPASTERISK", value: 55, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LEFTALT = new InputEventCode({key: "KEY_LEFTALT", value: 56, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SPACE = new InputEventCode({key: "KEY_SPACE", value: 57, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAPSLOCK = new InputEventCode({key: "KEY_CAPSLOCK", value: 58, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F1 = new InputEventCode({key: "KEY_F1", value: 59, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F2 = new InputEventCode({key: "KEY_F2", value: 60, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F3 = new InputEventCode({key: "KEY_F3", value: 61, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F4 = new InputEventCode({key: "KEY_F4", value: 62, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F5 = new InputEventCode({key: "KEY_F5", value: 63, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F6 = new InputEventCode({key: "KEY_F6", value: 64, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F7 = new InputEventCode({key: "KEY_F7", value: 65, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F8 = new InputEventCode({key: "KEY_F8", value: 66, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F9 = new InputEventCode({key: "KEY_F9", value: 67, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F10 = new InputEventCode({key: "KEY_F10", value: 68, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NUMLOCK = new InputEventCode({key: "KEY_NUMLOCK", value: 69, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SCROLLLOCK = new InputEventCode({key: "KEY_SCROLLLOCK", value: 70, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP7 = new InputEventCode({key: "KEY_KP7", value: 71, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP8 = new InputEventCode({key: "KEY_KP8", value: 72, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP9 = new InputEventCode({key: "KEY_KP9", value: 73, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPMINUS = new InputEventCode({key: "KEY_KPMINUS", value: 74, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP4 = new InputEventCode({key: "KEY_KP4", value: 75, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP5 = new InputEventCode({key: "KEY_KP5", value: 76, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP6 = new InputEventCode({key: "KEY_KP6", value: 77, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPPLUS = new InputEventCode({key: "KEY_KPPLUS", value: 78, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP1 = new InputEventCode({key: "KEY_KP1", value: 79, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP2 = new InputEventCode({key: "KEY_KP2", value: 80, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP3 = new InputEventCode({key: "KEY_KP3", value: 81, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KP0 = new InputEventCode({key: "KEY_KP0", value: 82, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPDOT = new InputEventCode({key: "KEY_KPDOT", value: 83, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ZENKAKUHANKAKU = new InputEventCode({key: "KEY_ZENKAKUHANKAKU", value: 85, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_102ND = new InputEventCode({key: "KEY_102ND", value: 86, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F11 = new InputEventCode({key: "KEY_F11", value: 87, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F12 = new InputEventCode({key: "KEY_F12", value: 88, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RO = new InputEventCode({key: "KEY_RO", value: 89, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KATAKANA = new InputEventCode({key: "KEY_KATAKANA", value: 90, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_HIRAGANA = new InputEventCode({key: "KEY_HIRAGANA", value: 91, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_HENKAN = new InputEventCode({key: "KEY_HENKAN", value: 92, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KATAKANAHIRAGANA = new InputEventCode({key: "KEY_KATAKANAHIRAGANA", value: 93, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MUHENKAN = new InputEventCode({key: "KEY_MUHENKAN", value: 94, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPJPCOMMA = new InputEventCode({key: "KEY_KPJPCOMMA", value: 95, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPENTER = new InputEventCode({key: "KEY_KPENTER", value: 96, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RIGHTCTRL = new InputEventCode({key: "KEY_RIGHTCTRL", value: 97, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPSLASH = new InputEventCode({key: "KEY_KPSLASH", value: 98, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SYSRQ = new InputEventCode({key: "KEY_SYSRQ", value: 99, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RIGHTALT = new InputEventCode({key: "KEY_RIGHTALT", value: 100, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LINEFEED = new InputEventCode({key: "KEY_LINEFEED", value: 101, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_HOME = new InputEventCode({key: "KEY_HOME", value: 102, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_UP = new InputEventCode({key: "KEY_UP", value: 103, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PAGEUP = new InputEventCode({key: "KEY_PAGEUP", value: 104, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LEFT = new InputEventCode({key: "KEY_LEFT", value: 105, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RIGHT = new InputEventCode({key: "KEY_RIGHT", value: 106, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_END = new InputEventCode({key: "KEY_END", value: 107, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DOWN = new InputEventCode({key: "KEY_DOWN", value: 108, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PAGEDOWN = new InputEventCode({key: "KEY_PAGEDOWN", value: 109, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_INSERT = new InputEventCode({key: "KEY_INSERT", value: 110, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DELETE = new InputEventCode({key: "KEY_DELETE", value: 111, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO = new InputEventCode({key: "KEY_MACRO", value: 112, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MUTE = new InputEventCode({key: "KEY_MUTE", value: 113, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_VOLUMEDOWN = new InputEventCode({key: "KEY_VOLUMEDOWN", value: 114, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_VOLUMEUP = new InputEventCode({key: "KEY_VOLUMEUP", value: 115, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_POWER = new InputEventCode({key: "KEY_POWER", value: 116, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "System Control System Power Down"});
    static readonly KEY_KPEQUAL = new InputEventCode({key: "KEY_KPEQUAL", value: 117, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPPLUSMINUS = new InputEventCode({key: "KEY_KPPLUSMINUS", value: 118, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PAUSE = new InputEventCode({key: "KEY_PAUSE", value: 119, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SCALE = new InputEventCode({key: "KEY_SCALE", value: 120, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Compiz Scale (Expose)"});
    static readonly KEY_KPCOMMA = new InputEventCode({key: "KEY_KPCOMMA", value: 121, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_HANGEUL = new InputEventCode({key: "KEY_HANGEUL", value: 122, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_HANGUEL = new InputEventCode({key: "KEY_HANGUEL", value: 122, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_HANJA = new InputEventCode({key: "KEY_HANJA", value: 123, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_YEN = new InputEventCode({key: "KEY_YEN", value: 124, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LEFTMETA = new InputEventCode({key: "KEY_LEFTMETA", value: 125, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RIGHTMETA = new InputEventCode({key: "KEY_RIGHTMETA", value: 126, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_COMPOSE = new InputEventCode({key: "KEY_COMPOSE", value: 127, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_STOP = new InputEventCode({key: "KEY_STOP", value: 128, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Stop"});
    static readonly KEY_AGAIN = new InputEventCode({key: "KEY_AGAIN", value: 129, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PROPS = new InputEventCode({key: "KEY_PROPS", value: 130, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Properties"});
    static readonly KEY_UNDO = new InputEventCode({key: "KEY_UNDO", value: 131, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Undo"});
    static readonly KEY_FRONT = new InputEventCode({key: "KEY_FRONT", value: 132, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_COPY = new InputEventCode({key: "KEY_COPY", value: 133, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Copy"});
    static readonly KEY_OPEN = new InputEventCode({key: "KEY_OPEN", value: 134, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Open"});
    static readonly KEY_PASTE = new InputEventCode({key: "KEY_PASTE", value: 135, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Paste"});
    static readonly KEY_FIND = new InputEventCode({key: "KEY_FIND", value: 136, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Search"});
    static readonly KEY_CUT = new InputEventCode({key: "KEY_CUT", value: 137, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Cut"});
    static readonly KEY_HELP = new InputEventCode({key: "KEY_HELP", value: 138, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Integrated Help Center"});
    static readonly KEY_MENU = new InputEventCode({key: "KEY_MENU", value: 139, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Menu (show menu)"});
    static readonly KEY_CALC = new InputEventCode({key: "KEY_CALC", value: 140, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Calculator"});
    static readonly KEY_SETUP = new InputEventCode({key: "KEY_SETUP", value: 141, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SLEEP = new InputEventCode({key: "KEY_SLEEP", value: 142, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "System Control System Sleep"});
    static readonly KEY_WAKEUP = new InputEventCode({key: "KEY_WAKEUP", value: 143, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "System Wake Up"});
    static readonly KEY_FILE = new InputEventCode({key: "KEY_FILE", value: 144, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SENDFILE = new InputEventCode({key: "KEY_SENDFILE", value: 145, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DELETEFILE = new InputEventCode({key: "KEY_DELETEFILE", value: 146, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_XFER = new InputEventCode({key: "KEY_XFER", value: 147, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PROG1 = new InputEventCode({key: "KEY_PROG1", value: 148, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PROG2 = new InputEventCode({key: "KEY_PROG2", value: 149, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_WWW = new InputEventCode({key: "KEY_WWW", value: 150, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Internet Browser"});
    static readonly KEY_MSDOS = new InputEventCode({key: "KEY_MSDOS", value: 151, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_COFFEE = new InputEventCode({key: "KEY_COFFEE", value: 152, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Terminal Lock/Screensaver"});
    static readonly KEY_SCREENLOCK = new InputEventCode({key: "KEY_SCREENLOCK", value: 152, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ROTATE_DISPLAY = new InputEventCode({key: "KEY_ROTATE_DISPLAY", value: 153, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DIRECTION = new InputEventCode({key: "KEY_DIRECTION", value: 153, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CYCLEWINDOWS = new InputEventCode({key: "KEY_CYCLEWINDOWS", value: 154, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MAIL = new InputEventCode({key: "KEY_MAIL", value: 155, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BOOKMARKS = new InputEventCode({key: "KEY_BOOKMARKS", value: 156, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Bookmarks"});
    static readonly KEY_COMPUTER = new InputEventCode({key: "KEY_COMPUTER", value: 157, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BACK = new InputEventCode({key: "KEY_BACK", value: 158, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Back"});
    static readonly KEY_FORWARD = new InputEventCode({key: "KEY_FORWARD", value: 159, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Forward"});
    static readonly KEY_CLOSECD = new InputEventCode({key: "KEY_CLOSECD", value: 160, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_EJECTCD = new InputEventCode({key: "KEY_EJECTCD", value: 161, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_EJECTCLOSECD = new InputEventCode({key: "KEY_EJECTCLOSECD", value: 162, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NEXTSONG = new InputEventCode({key: "KEY_NEXTSONG", value: 163, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PLAYPAUSE = new InputEventCode({key: "KEY_PLAYPAUSE", value: 164, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PREVIOUSSONG = new InputEventCode({key: "KEY_PREVIOUSSONG", value: 165, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_STOPCD = new InputEventCode({key: "KEY_STOPCD", value: 166, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RECORD = new InputEventCode({key: "KEY_RECORD", value: 167, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_REWIND = new InputEventCode({key: "KEY_REWIND", value: 168, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PHONE = new InputEventCode({key: "KEY_PHONE", value: 169, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Telephone"});
    static readonly KEY_ISO = new InputEventCode({key: "KEY_ISO", value: 170, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CONFIG = new InputEventCode({key: "KEY_CONFIG", value: 171, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Consumer Control Configuration"});
    static readonly KEY_HOMEPAGE = new InputEventCode({key: "KEY_HOMEPAGE", value: 172, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Home"});
    static readonly KEY_REFRESH = new InputEventCode({key: "KEY_REFRESH", value: 173, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Refresh"});
    static readonly KEY_EXIT = new InputEventCode({key: "KEY_EXIT", value: 174, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Exit"});
    static readonly KEY_MOVE = new InputEventCode({key: "KEY_MOVE", value: 175, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_EDIT = new InputEventCode({key: "KEY_EDIT", value: 176, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SCROLLUP = new InputEventCode({key: "KEY_SCROLLUP", value: 177, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SCROLLDOWN = new InputEventCode({key: "KEY_SCROLLDOWN", value: 178, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPLEFTPAREN = new InputEventCode({key: "KEY_KPLEFTPAREN", value: 179, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KPRIGHTPAREN = new InputEventCode({key: "KEY_KPRIGHTPAREN", value: 180, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NEW = new InputEventCode({key: "KEY_NEW", value: 181, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC New"});
    static readonly KEY_REDO = new InputEventCode({key: "KEY_REDO", value: 182, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Redo/Repeat"});
    static readonly KEY_F13 = new InputEventCode({key: "KEY_F13", value: 183, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F14 = new InputEventCode({key: "KEY_F14", value: 184, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F15 = new InputEventCode({key: "KEY_F15", value: 185, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F16 = new InputEventCode({key: "KEY_F16", value: 186, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F17 = new InputEventCode({key: "KEY_F17", value: 187, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F18 = new InputEventCode({key: "KEY_F18", value: 188, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F19 = new InputEventCode({key: "KEY_F19", value: 189, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F20 = new InputEventCode({key: "KEY_F20", value: 190, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F21 = new InputEventCode({key: "KEY_F21", value: 191, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F22 = new InputEventCode({key: "KEY_F22", value: 192, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F23 = new InputEventCode({key: "KEY_F23", value: 193, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_F24 = new InputEventCode({key: "KEY_F24", value: 194, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PLAYCD = new InputEventCode({key: "KEY_PLAYCD", value: 200, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PAUSECD = new InputEventCode({key: "KEY_PAUSECD", value: 201, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PROG3 = new InputEventCode({key: "KEY_PROG3", value: 202, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PROG4 = new InputEventCode({key: "KEY_PROG4", value: 203, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ALL_APPLICATIONS = new InputEventCode({key: "KEY_ALL_APPLICATIONS", value: 204, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DASHBOARD = new InputEventCode({key: "KEY_DASHBOARD", value: 204, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Dashboard"});
    static readonly KEY_SUSPEND = new InputEventCode({key: "KEY_SUSPEND", value: 205, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CLOSE = new InputEventCode({key: "KEY_CLOSE", value: 206, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Close"});
    static readonly KEY_PLAY = new InputEventCode({key: "KEY_PLAY", value: 207, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FASTFORWARD = new InputEventCode({key: "KEY_FASTFORWARD", value: 208, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BASSBOOST = new InputEventCode({key: "KEY_BASSBOOST", value: 209, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PRINT = new InputEventCode({key: "KEY_PRINT", value: 210, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Print"});
    static readonly KEY_HP = new InputEventCode({key: "KEY_HP", value: 211, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA = new InputEventCode({key: "KEY_CAMERA", value: 212, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SOUND = new InputEventCode({key: "KEY_SOUND", value: 213, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_QUESTION = new InputEventCode({key: "KEY_QUESTION", value: 214, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_EMAIL = new InputEventCode({key: "KEY_EMAIL", value: 215, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CHAT = new InputEventCode({key: "KEY_CHAT", value: 216, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SEARCH = new InputEventCode({key: "KEY_SEARCH", value: 217, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CONNECT = new InputEventCode({key: "KEY_CONNECT", value: 218, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FINANCE = new InputEventCode({key: "KEY_FINANCE", value: 219, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Checkbook/Finance"});
    static readonly KEY_SPORT = new InputEventCode({key: "KEY_SPORT", value: 220, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SHOP = new InputEventCode({key: "KEY_SHOP", value: 221, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ALTERASE = new InputEventCode({key: "KEY_ALTERASE", value: 222, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CANCEL = new InputEventCode({key: "KEY_CANCEL", value: 223, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Cancel"});
    static readonly KEY_BRIGHTNESSDOWN = new InputEventCode({key: "KEY_BRIGHTNESSDOWN", value: 224, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRIGHTNESSUP = new InputEventCode({key: "KEY_BRIGHTNESSUP", value: 225, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MEDIA = new InputEventCode({key: "KEY_MEDIA", value: 226, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SWITCHVIDEOMODE = new InputEventCode({key: "KEY_SWITCHVIDEOMODE", value: 227, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Cycle between available video outputs (Monitor/LCD/TV-out/etc)"});
    static readonly KEY_KBDILLUMTOGGLE = new InputEventCode({key: "KEY_KBDILLUMTOGGLE", value: 228, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBDILLUMDOWN = new InputEventCode({key: "KEY_KBDILLUMDOWN", value: 229, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBDILLUMUP = new InputEventCode({key: "KEY_KBDILLUMUP", value: 230, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SEND = new InputEventCode({key: "KEY_SEND", value: 231, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Send"});
    static readonly KEY_REPLY = new InputEventCode({key: "KEY_REPLY", value: 232, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Reply"});
    static readonly KEY_FORWARDMAIL = new InputEventCode({key: "KEY_FORWARDMAIL", value: 233, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Forward Msg"});
    static readonly KEY_SAVE = new InputEventCode({key: "KEY_SAVE", value: 234, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Save"});
    static readonly KEY_DOCUMENTS = new InputEventCode({key: "KEY_DOCUMENTS", value: 235, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BATTERY = new InputEventCode({key: "KEY_BATTERY", value: 236, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BLUETOOTH = new InputEventCode({key: "KEY_BLUETOOTH", value: 237, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_WLAN = new InputEventCode({key: "KEY_WLAN", value: 238, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_UWB = new InputEventCode({key: "KEY_UWB", value: 239, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_UNKNOWN = new InputEventCode({key: "KEY_UNKNOWN", value: 240, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_VIDEO_NEXT = new InputEventCode({key: "KEY_VIDEO_NEXT", value: 241, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Drive next video source"});
    static readonly KEY_VIDEO_PREV = new InputEventCode({key: "KEY_VIDEO_PREV", value: 242, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Drive previous video source"});
    static readonly KEY_BRIGHTNESS_CYCLE = new InputEventCode({key: "KEY_BRIGHTNESS_CYCLE", value: 243, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Brightness up, after max is min"});
    static readonly KEY_BRIGHTNESS_AUTO = new InputEventCode({key: "KEY_BRIGHTNESS_AUTO", value: 244, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRIGHTNESS_ZERO = new InputEventCode({key: "KEY_BRIGHTNESS_ZERO", value: 244, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Brightness off, use ambient"});
    static readonly KEY_DISPLAY_OFF = new InputEventCode({key: "KEY_DISPLAY_OFF", value: 245, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Display device to off state"});
    static readonly KEY_WWAN = new InputEventCode({key: "KEY_WWAN", value: 246, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_WIMAX = new InputEventCode({key: "KEY_WIMAX", value: 246, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RFKILL = new InputEventCode({key: "KEY_RFKILL", value: 247, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Key that controls all radios"});
    static readonly KEY_MICMUTE = new InputEventCode({key: "KEY_MICMUTE", value: 248, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Mute / unmute the microphone"});
    static readonly BTN_MISC = new InputEventCode({key: "BTN_MISC", value: 0x100, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_0 = new InputEventCode({key: "BTN_0", value: 0x100, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_1 = new InputEventCode({key: "BTN_1", value: 0x101, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_2 = new InputEventCode({key: "BTN_2", value: 0x102, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_3 = new InputEventCode({key: "BTN_3", value: 0x103, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_4 = new InputEventCode({key: "BTN_4", value: 0x104, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_5 = new InputEventCode({key: "BTN_5", value: 0x105, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_6 = new InputEventCode({key: "BTN_6", value: 0x106, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_7 = new InputEventCode({key: "BTN_7", value: 0x107, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_8 = new InputEventCode({key: "BTN_8", value: 0x108, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_9 = new InputEventCode({key: "BTN_9", value: 0x109, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_MOUSE = new InputEventCode({key: "BTN_MOUSE", value: 0x110, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_LEFT = new InputEventCode({key: "BTN_LEFT", value: 0x110, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_RIGHT = new InputEventCode({key: "BTN_RIGHT", value: 0x111, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_MIDDLE = new InputEventCode({key: "BTN_MIDDLE", value: 0x112, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_SIDE = new InputEventCode({key: "BTN_SIDE", value: 0x113, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_EXTRA = new InputEventCode({key: "BTN_EXTRA", value: 0x114, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_FORWARD = new InputEventCode({key: "BTN_FORWARD", value: 0x115, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_BACK = new InputEventCode({key: "BTN_BACK", value: 0x116, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TASK = new InputEventCode({key: "BTN_TASK", value: 0x117, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_JOYSTICK = new InputEventCode({key: "BTN_JOYSTICK", value: 0x120, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER = new InputEventCode({key: "BTN_TRIGGER", value: 0x120, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_THUMB = new InputEventCode({key: "BTN_THUMB", value: 0x121, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_THUMB2 = new InputEventCode({key: "BTN_THUMB2", value: 0x122, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOP = new InputEventCode({key: "BTN_TOP", value: 0x123, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOP2 = new InputEventCode({key: "BTN_TOP2", value: 0x124, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_PINKIE = new InputEventCode({key: "BTN_PINKIE", value: 0x125, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_BASE = new InputEventCode({key: "BTN_BASE", value: 0x126, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_BASE2 = new InputEventCode({key: "BTN_BASE2", value: 0x127, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_BASE3 = new InputEventCode({key: "BTN_BASE3", value: 0x128, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_BASE4 = new InputEventCode({key: "BTN_BASE4", value: 0x129, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_BASE5 = new InputEventCode({key: "BTN_BASE5", value: 0x12a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_BASE6 = new InputEventCode({key: "BTN_BASE6", value: 0x12b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_DEAD = new InputEventCode({key: "BTN_DEAD", value: 0x12f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_GAMEPAD = new InputEventCode({key: "BTN_GAMEPAD", value: 0x130, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_SOUTH = new InputEventCode({key: "BTN_SOUTH", value: 0x130, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_A = new InputEventCode({key: "BTN_A", value: 0x130, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_EAST = new InputEventCode({key: "BTN_EAST", value: 0x131, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_B = new InputEventCode({key: "BTN_B", value: 0x131, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_C = new InputEventCode({key: "BTN_C", value: 0x132, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_NORTH = new InputEventCode({key: "BTN_NORTH", value: 0x133, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_X = new InputEventCode({key: "BTN_X", value: 0x133, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_WEST = new InputEventCode({key: "BTN_WEST", value: 0x134, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_Y = new InputEventCode({key: "BTN_Y", value: 0x134, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_Z = new InputEventCode({key: "BTN_Z", value: 0x135, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TL = new InputEventCode({key: "BTN_TL", value: 0x136, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TR = new InputEventCode({key: "BTN_TR", value: 0x137, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TL2 = new InputEventCode({key: "BTN_TL2", value: 0x138, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TR2 = new InputEventCode({key: "BTN_TR2", value: 0x139, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_SELECT = new InputEventCode({key: "BTN_SELECT", value: 0x13a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_START = new InputEventCode({key: "BTN_START", value: 0x13b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_MODE = new InputEventCode({key: "BTN_MODE", value: 0x13c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_THUMBL = new InputEventCode({key: "BTN_THUMBL", value: 0x13d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_THUMBR = new InputEventCode({key: "BTN_THUMBR", value: 0x13e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_DIGI = new InputEventCode({key: "BTN_DIGI", value: 0x140, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_PEN = new InputEventCode({key: "BTN_TOOL_PEN", value: 0x140, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_RUBBER = new InputEventCode({key: "BTN_TOOL_RUBBER", value: 0x141, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_BRUSH = new InputEventCode({key: "BTN_TOOL_BRUSH", value: 0x142, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_PENCIL = new InputEventCode({key: "BTN_TOOL_PENCIL", value: 0x143, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_AIRBRUSH = new InputEventCode({key: "BTN_TOOL_AIRBRUSH", value: 0x144, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_FINGER = new InputEventCode({key: "BTN_TOOL_FINGER", value: 0x145, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_MOUSE = new InputEventCode({key: "BTN_TOOL_MOUSE", value: 0x146, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_LENS = new InputEventCode({key: "BTN_TOOL_LENS", value: 0x147, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_QUINTTAP = new InputEventCode({key: "BTN_TOOL_QUINTTAP", value: 0x148, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Five fingers on trackpad"});
    static readonly BTN_STYLUS3 = new InputEventCode({key: "BTN_STYLUS3", value: 0x149, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOUCH = new InputEventCode({key: "BTN_TOUCH", value: 0x14a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_STYLUS = new InputEventCode({key: "BTN_STYLUS", value: 0x14b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_STYLUS2 = new InputEventCode({key: "BTN_STYLUS2", value: 0x14c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_DOUBLETAP = new InputEventCode({key: "BTN_TOOL_DOUBLETAP", value: 0x14d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_TRIPLETAP = new InputEventCode({key: "BTN_TOOL_TRIPLETAP", value: 0x14e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TOOL_QUADTAP = new InputEventCode({key: "BTN_TOOL_QUADTAP", value: 0x14f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Four fingers on trackpad"});
    static readonly BTN_WHEEL = new InputEventCode({key: "BTN_WHEEL", value: 0x150, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_GEAR_DOWN = new InputEventCode({key: "BTN_GEAR_DOWN", value: 0x150, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_GEAR_UP = new InputEventCode({key: "BTN_GEAR_UP", value: 0x151, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_OK = new InputEventCode({key: "KEY_OK", value: 0x160, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SELECT = new InputEventCode({key: "KEY_SELECT", value: 0x161, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_GOTO = new InputEventCode({key: "KEY_GOTO", value: 0x162, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CLEAR = new InputEventCode({key: "KEY_CLEAR", value: 0x163, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_POWER2 = new InputEventCode({key: "KEY_POWER2", value: 0x164, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_OPTION = new InputEventCode({key: "KEY_OPTION", value: 0x165, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_INFO = new InputEventCode({key: "KEY_INFO", value: 0x166, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL OEM Features/Tips/Tutorial"});
    static readonly KEY_TIME = new InputEventCode({key: "KEY_TIME", value: 0x167, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_VENDOR = new InputEventCode({key: "KEY_VENDOR", value: 0x168, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ARCHIVE = new InputEventCode({key: "KEY_ARCHIVE", value: 0x169, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PROGRAM = new InputEventCode({key: "KEY_PROGRAM", value: 0x16a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Program Guide"});
    static readonly KEY_CHANNEL = new InputEventCode({key: "KEY_CHANNEL", value: 0x16b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FAVORITES = new InputEventCode({key: "KEY_FAVORITES", value: 0x16c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_EPG = new InputEventCode({key: "KEY_EPG", value: 0x16d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PVR = new InputEventCode({key: "KEY_PVR", value: 0x16e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Home"});
    static readonly KEY_MHP = new InputEventCode({key: "KEY_MHP", value: 0x16f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LANGUAGE = new InputEventCode({key: "KEY_LANGUAGE", value: 0x170, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TITLE = new InputEventCode({key: "KEY_TITLE", value: 0x171, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SUBTITLE = new InputEventCode({key: "KEY_SUBTITLE", value: 0x172, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ANGLE = new InputEventCode({key: "KEY_ANGLE", value: 0x173, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FULL_SCREEN = new InputEventCode({key: "KEY_FULL_SCREEN", value: 0x174, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ZOOM = new InputEventCode({key: "KEY_ZOOM", value: 0x174, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MODE = new InputEventCode({key: "KEY_MODE", value: 0x175, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KEYBOARD = new InputEventCode({key: "KEY_KEYBOARD", value: 0x176, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ASPECT_RATIO = new InputEventCode({key: "KEY_ASPECT_RATIO", value: 0x177, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SCREEN = new InputEventCode({key: "KEY_SCREEN", value: 0x177, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PC = new InputEventCode({key: "KEY_PC", value: 0x178, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Computer"});
    static readonly KEY_TV = new InputEventCode({key: "KEY_TV", value: 0x179, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select TV"});
    static readonly KEY_TV2 = new InputEventCode({key: "KEY_TV2", value: 0x17a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Cable"});
    static readonly KEY_VCR = new InputEventCode({key: "KEY_VCR", value: 0x17b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select  VCR"});
    static readonly KEY_VCR2 = new InputEventCode({key: "KEY_VCR2", value: 0x17c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select VCR Plus"});
    static readonly KEY_SAT = new InputEventCode({key: "KEY_SAT", value: 0x17d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Satellite"});
    static readonly KEY_SAT2 = new InputEventCode({key: "KEY_SAT2", value: 0x17e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Satellite 2"});
    static readonly KEY_CD = new InputEventCode({key: "KEY_CD", value: 0x17f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select CD"});
    static readonly KEY_TAPE = new InputEventCode({key: "KEY_TAPE", value: 0x180, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Tape"});
    static readonly KEY_RADIO = new InputEventCode({key: "KEY_RADIO", value: 0x181, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TUNER = new InputEventCode({key: "KEY_TUNER", value: 0x182, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Tuner"});
    static readonly KEY_PLAYER = new InputEventCode({key: "KEY_PLAYER", value: 0x183, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TEXT = new InputEventCode({key: "KEY_TEXT", value: 0x184, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DVD = new InputEventCode({key: "KEY_DVD", value: 0x185, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select DVD"});
    static readonly KEY_AUX = new InputEventCode({key: "KEY_AUX", value: 0x186, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MP3 = new InputEventCode({key: "KEY_MP3", value: 0x187, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_AUDIO = new InputEventCode({key: "KEY_AUDIO", value: 0x188, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Audio Browser"});
    static readonly KEY_VIDEO = new InputEventCode({key: "KEY_VIDEO", value: 0x189, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Movie Browser"});
    static readonly KEY_DIRECTORY = new InputEventCode({key: "KEY_DIRECTORY", value: 0x18a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LIST = new InputEventCode({key: "KEY_LIST", value: 0x18b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MEMO = new InputEventCode({key: "KEY_MEMO", value: 0x18c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Messages"});
    static readonly KEY_CALENDAR = new InputEventCode({key: "KEY_CALENDAR", value: 0x18d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RED = new InputEventCode({key: "KEY_RED", value: 0x18e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_GREEN = new InputEventCode({key: "KEY_GREEN", value: 0x18f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_YELLOW = new InputEventCode({key: "KEY_YELLOW", value: 0x190, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BLUE = new InputEventCode({key: "KEY_BLUE", value: 0x191, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CHANNELUP = new InputEventCode({key: "KEY_CHANNELUP", value: 0x192, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Channel Increment"});
    static readonly KEY_CHANNELDOWN = new InputEventCode({key: "KEY_CHANNELDOWN", value: 0x193, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Channel Decrement"});
    static readonly KEY_FIRST = new InputEventCode({key: "KEY_FIRST", value: 0x194, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LAST = new InputEventCode({key: "KEY_LAST", value: 0x195, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_AB = new InputEventCode({key: "KEY_AB", value: 0x196, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NEXT = new InputEventCode({key: "KEY_NEXT", value: 0x197, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RESTART = new InputEventCode({key: "KEY_RESTART", value: 0x198, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SLOW = new InputEventCode({key: "KEY_SLOW", value: 0x199, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SHUFFLE = new InputEventCode({key: "KEY_SHUFFLE", value: 0x19a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BREAK = new InputEventCode({key: "KEY_BREAK", value: 0x19b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PREVIOUS = new InputEventCode({key: "KEY_PREVIOUS", value: 0x19c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DIGITS = new InputEventCode({key: "KEY_DIGITS", value: 0x19d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TEEN = new InputEventCode({key: "KEY_TEEN", value: 0x19e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TWEN = new InputEventCode({key: "KEY_TWEN", value: 0x19f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_VIDEOPHONE = new InputEventCode({key: "KEY_VIDEOPHONE", value: 0x1a0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Video Phone"});
    static readonly KEY_GAMES = new InputEventCode({key: "KEY_GAMES", value: 0x1a1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Media Select Games"});
    static readonly KEY_ZOOMIN = new InputEventCode({key: "KEY_ZOOMIN", value: 0x1a2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Zoom In"});
    static readonly KEY_ZOOMOUT = new InputEventCode({key: "KEY_ZOOMOUT", value: 0x1a3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Zoom Out"});
    static readonly KEY_ZOOMRESET = new InputEventCode({key: "KEY_ZOOMRESET", value: 0x1a4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AC Zoom"});
    static readonly KEY_WORDPROCESSOR = new InputEventCode({key: "KEY_WORDPROCESSOR", value: 0x1a5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Word Processor"});
    static readonly KEY_EDITOR = new InputEventCode({key: "KEY_EDITOR", value: 0x1a6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Text Editor"});
    static readonly KEY_SPREADSHEET = new InputEventCode({key: "KEY_SPREADSHEET", value: 0x1a7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Spreadsheet"});
    static readonly KEY_GRAPHICSEDITOR = new InputEventCode({key: "KEY_GRAPHICSEDITOR", value: 0x1a8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Graphics Editor"});
    static readonly KEY_PRESENTATION = new InputEventCode({key: "KEY_PRESENTATION", value: 0x1a9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Presentation App"});
    static readonly KEY_DATABASE = new InputEventCode({key: "KEY_DATABASE", value: 0x1aa, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Database App"});
    static readonly KEY_NEWS = new InputEventCode({key: "KEY_NEWS", value: 0x1ab, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Newsreader"});
    static readonly KEY_VOICEMAIL = new InputEventCode({key: "KEY_VOICEMAIL", value: 0x1ac, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Voicemail"});
    static readonly KEY_ADDRESSBOOK = new InputEventCode({key: "KEY_ADDRESSBOOK", value: 0x1ad, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Contacts/Address Book"});
    static readonly KEY_MESSENGER = new InputEventCode({key: "KEY_MESSENGER", value: 0x1ae, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Instant Messaging"});
    static readonly KEY_DISPLAYTOGGLE = new InputEventCode({key: "KEY_DISPLAYTOGGLE", value: 0x1af, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Turn display (LCD) on and off"});
    static readonly KEY_BRIGHTNESS_TOGGLE = new InputEventCode({key: "KEY_BRIGHTNESS_TOGGLE", value: 0x1af, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SPELLCHECK = new InputEventCode({key: "KEY_SPELLCHECK", value: 0x1b0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Spell Check"});
    static readonly KEY_LOGOFF = new InputEventCode({key: "KEY_LOGOFF", value: 0x1b1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Logoff"});
    static readonly KEY_DOLLAR = new InputEventCode({key: "KEY_DOLLAR", value: 0x1b2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_EURO = new InputEventCode({key: "KEY_EURO", value: 0x1b3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FRAMEBACK = new InputEventCode({key: "KEY_FRAMEBACK", value: 0x1b4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Consumer - transport controls"});
    static readonly KEY_FRAMEFORWARD = new InputEventCode({key: "KEY_FRAMEFORWARD", value: 0x1b5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CONTEXT_MENU = new InputEventCode({key: "KEY_CONTEXT_MENU", value: 0x1b6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "GenDesc - system context menu"});
    static readonly KEY_MEDIA_REPEAT = new InputEventCode({key: "KEY_MEDIA_REPEAT", value: 0x1b7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Consumer - transport control"});
    static readonly KEY_10CHANNELSUP = new InputEventCode({key: "KEY_10CHANNELSUP", value: 0x1b8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "10 channels up (10+)"});
    static readonly KEY_10CHANNELSDOWN = new InputEventCode({key: "KEY_10CHANNELSDOWN", value: 0x1b9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "10 channels down (10-)"});
    static readonly KEY_IMAGES = new InputEventCode({key: "KEY_IMAGES", value: 0x1ba, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "AL Image Browser "});
    static readonly KEY_NOTIFICATION_CENTER = new InputEventCode({key: "KEY_NOTIFICATION_CENTER", value: 0x1bc, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PICKUP_PHONE = new InputEventCode({key: "KEY_PICKUP_PHONE", value: 0x1bd, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_HANGUP_PHONE = new InputEventCode({key: "KEY_HANGUP_PHONE", value: 0x1be, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DEL_EOL = new InputEventCode({key: "KEY_DEL_EOL", value: 0x1c0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DEL_EOS = new InputEventCode({key: "KEY_DEL_EOS", value: 0x1c1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_INS_LINE = new InputEventCode({key: "KEY_INS_LINE", value: 0x1c2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DEL_LINE = new InputEventCode({key: "KEY_DEL_LINE", value: 0x1c3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN = new InputEventCode({key: "KEY_FN", value: 0x1d0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_ESC = new InputEventCode({key: "KEY_FN_ESC", value: 0x1d1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F1 = new InputEventCode({key: "KEY_FN_F1", value: 0x1d2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F2 = new InputEventCode({key: "KEY_FN_F2", value: 0x1d3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F3 = new InputEventCode({key: "KEY_FN_F3", value: 0x1d4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F4 = new InputEventCode({key: "KEY_FN_F4", value: 0x1d5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F5 = new InputEventCode({key: "KEY_FN_F5", value: 0x1d6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F6 = new InputEventCode({key: "KEY_FN_F6", value: 0x1d7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F7 = new InputEventCode({key: "KEY_FN_F7", value: 0x1d8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F8 = new InputEventCode({key: "KEY_FN_F8", value: 0x1d9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F9 = new InputEventCode({key: "KEY_FN_F9", value: 0x1da, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F10 = new InputEventCode({key: "KEY_FN_F10", value: 0x1db, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F11 = new InputEventCode({key: "KEY_FN_F11", value: 0x1dc, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F12 = new InputEventCode({key: "KEY_FN_F12", value: 0x1dd, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_1 = new InputEventCode({key: "KEY_FN_1", value: 0x1de, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_2 = new InputEventCode({key: "KEY_FN_2", value: 0x1df, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_D = new InputEventCode({key: "KEY_FN_D", value: 0x1e0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_E = new InputEventCode({key: "KEY_FN_E", value: 0x1e1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_F = new InputEventCode({key: "KEY_FN_F", value: 0x1e2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_S = new InputEventCode({key: "KEY_FN_S", value: 0x1e3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_B = new InputEventCode({key: "KEY_FN_B", value: 0x1e4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FN_RIGHT_SHIFT = new InputEventCode({key: "KEY_FN_RIGHT_SHIFT", value: 0x1e5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT1 = new InputEventCode({key: "KEY_BRL_DOT1", value: 0x1f1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT2 = new InputEventCode({key: "KEY_BRL_DOT2", value: 0x1f2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT3 = new InputEventCode({key: "KEY_BRL_DOT3", value: 0x1f3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT4 = new InputEventCode({key: "KEY_BRL_DOT4", value: 0x1f4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT5 = new InputEventCode({key: "KEY_BRL_DOT5", value: 0x1f5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT6 = new InputEventCode({key: "KEY_BRL_DOT6", value: 0x1f6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT7 = new InputEventCode({key: "KEY_BRL_DOT7", value: 0x1f7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT8 = new InputEventCode({key: "KEY_BRL_DOT8", value: 0x1f8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT9 = new InputEventCode({key: "KEY_BRL_DOT9", value: 0x1f9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRL_DOT10 = new InputEventCode({key: "KEY_BRL_DOT10", value: 0x1fa, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NUMERIC_0 = new InputEventCode({key: "KEY_NUMERIC_0", value: 0x200, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_1 = new InputEventCode({key: "KEY_NUMERIC_1", value: 0x201, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_2 = new InputEventCode({key: "KEY_NUMERIC_2", value: 0x202, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_3 = new InputEventCode({key: "KEY_NUMERIC_3", value: 0x203, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_4 = new InputEventCode({key: "KEY_NUMERIC_4", value: 0x204, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_5 = new InputEventCode({key: "KEY_NUMERIC_5", value: 0x205, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_6 = new InputEventCode({key: "KEY_NUMERIC_6", value: 0x206, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_7 = new InputEventCode({key: "KEY_NUMERIC_7", value: 0x207, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_8 = new InputEventCode({key: "KEY_NUMERIC_8", value: 0x208, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_9 = new InputEventCode({key: "KEY_NUMERIC_9", value: 0x209, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_STAR = new InputEventCode({key: "KEY_NUMERIC_STAR", value: 0x20a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Used by phones, remote controls, and other keypads"});
    static readonly KEY_NUMERIC_POUND = new InputEventCode({key: "KEY_NUMERIC_POUND", value: 0x20b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NUMERIC_A = new InputEventCode({key: "KEY_NUMERIC_A", value: 0x20c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NUMERIC_B = new InputEventCode({key: "KEY_NUMERIC_B", value: 0x20d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NUMERIC_C = new InputEventCode({key: "KEY_NUMERIC_C", value: 0x20e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NUMERIC_D = new InputEventCode({key: "KEY_NUMERIC_D", value: 0x20f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_FOCUS = new InputEventCode({key: "KEY_CAMERA_FOCUS", value: 0x210, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_WPS_BUTTON = new InputEventCode({key: "KEY_WPS_BUTTON", value: 0x211, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "WiFi Protected Setup key"});
    static readonly KEY_TOUCHPAD_TOGGLE = new InputEventCode({key: "KEY_TOUCHPAD_TOGGLE", value: 0x212, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Request switch touchpad on or off"});
    static readonly KEY_TOUCHPAD_ON = new InputEventCode({key: "KEY_TOUCHPAD_ON", value: 0x213, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TOUCHPAD_OFF = new InputEventCode({key: "KEY_TOUCHPAD_OFF", value: 0x214, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_ZOOMIN = new InputEventCode({key: "KEY_CAMERA_ZOOMIN", value: 0x215, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_ZOOMOUT = new InputEventCode({key: "KEY_CAMERA_ZOOMOUT", value: 0x216, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_UP = new InputEventCode({key: "KEY_CAMERA_UP", value: 0x217, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_DOWN = new InputEventCode({key: "KEY_CAMERA_DOWN", value: 0x218, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_LEFT = new InputEventCode({key: "KEY_CAMERA_LEFT", value: 0x219, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_RIGHT = new InputEventCode({key: "KEY_CAMERA_RIGHT", value: 0x21a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ATTENDANT_ON = new InputEventCode({key: "KEY_ATTENDANT_ON", value: 0x21b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ATTENDANT_OFF = new InputEventCode({key: "KEY_ATTENDANT_OFF", value: 0x21c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ATTENDANT_TOGGLE = new InputEventCode({key: "KEY_ATTENDANT_TOGGLE", value: 0x21d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LIGHTS_TOGGLE = new InputEventCode({key: "KEY_LIGHTS_TOGGLE", value: 0x21e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_DPAD_UP = new InputEventCode({key: "BTN_DPAD_UP", value: 0x220, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_DPAD_DOWN = new InputEventCode({key: "BTN_DPAD_DOWN", value: 0x221, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_DPAD_LEFT = new InputEventCode({key: "BTN_DPAD_LEFT", value: 0x222, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_DPAD_RIGHT = new InputEventCode({key: "BTN_DPAD_RIGHT", value: 0x223, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ALS_TOGGLE = new InputEventCode({key: "KEY_ALS_TOGGLE", value: 0x230, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ROTATE_LOCK_TOGGLE = new InputEventCode({key: "KEY_ROTATE_LOCK_TOGGLE", value: 0x231, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_REFRESH_RATE_TOGGLE = new InputEventCode({key: "KEY_REFRESH_RATE_TOGGLE", value: 0x232, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BUTTONCONFIG = new InputEventCode({key: "KEY_BUTTONCONFIG", value: 0x240, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TASKMANAGER = new InputEventCode({key: "KEY_TASKMANAGER", value: 0x241, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_JOURNAL = new InputEventCode({key: "KEY_JOURNAL", value: 0x242, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CONTROLPANEL = new InputEventCode({key: "KEY_CONTROLPANEL", value: 0x243, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_APPSELECT = new InputEventCode({key: "KEY_APPSELECT", value: 0x244, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SCREENSAVER = new InputEventCode({key: "KEY_SCREENSAVER", value: 0x245, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_VOICECOMMAND = new InputEventCode({key: "KEY_VOICECOMMAND", value: 0x246, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ASSISTANT = new InputEventCode({key: "KEY_ASSISTANT", value: 0x247, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBD_LAYOUT_NEXT = new InputEventCode({key: "KEY_KBD_LAYOUT_NEXT", value: 0x248, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_EMOJI_PICKER = new InputEventCode({key: "KEY_EMOJI_PICKER", value: 0x249, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DICTATE = new InputEventCode({key: "KEY_DICTATE", value: 0x24a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_ACCESS_ENABLE = new InputEventCode({key: "KEY_CAMERA_ACCESS_ENABLE", value: 0x24b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_ACCESS_DISABLE = new InputEventCode({key: "KEY_CAMERA_ACCESS_DISABLE", value: 0x24c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CAMERA_ACCESS_TOGGLE = new InputEventCode({key: "KEY_CAMERA_ACCESS_TOGGLE", value: 0x24d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ACCESSIBILITY = new InputEventCode({key: "KEY_ACCESSIBILITY", value: 0x24e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DO_NOT_DISTURB = new InputEventCode({key: "KEY_DO_NOT_DISTURB", value: 0x24f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRIGHTNESS_MIN = new InputEventCode({key: "KEY_BRIGHTNESS_MIN", value: 0x250, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRIGHTNESS_MAX = new InputEventCode({key: "KEY_BRIGHTNESS_MAX", value: 0x251, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBDINPUTASSIST_PREV = new InputEventCode({key: "KEY_KBDINPUTASSIST_PREV", value: 0x260, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBDINPUTASSIST_NEXT = new InputEventCode({key: "KEY_KBDINPUTASSIST_NEXT", value: 0x261, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBDINPUTASSIST_PREVGROUP = new InputEventCode({key: "KEY_KBDINPUTASSIST_PREVGROUP", value: 0x262, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBDINPUTASSIST_NEXTGROUP = new InputEventCode({key: "KEY_KBDINPUTASSIST_NEXTGROUP", value: 0x263, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBDINPUTASSIST_ACCEPT = new InputEventCode({key: "KEY_KBDINPUTASSIST_ACCEPT", value: 0x264, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBDINPUTASSIST_CANCEL = new InputEventCode({key: "KEY_KBDINPUTASSIST_CANCEL", value: 0x265, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RIGHT_UP = new InputEventCode({key: "KEY_RIGHT_UP", value: 0x266, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RIGHT_DOWN = new InputEventCode({key: "KEY_RIGHT_DOWN", value: 0x267, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LEFT_UP = new InputEventCode({key: "KEY_LEFT_UP", value: 0x268, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_LEFT_DOWN = new InputEventCode({key: "KEY_LEFT_DOWN", value: 0x269, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ROOT_MENU = new InputEventCode({key: "KEY_ROOT_MENU", value: 0x26a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MEDIA_TOP_MENU = new InputEventCode({key: "KEY_MEDIA_TOP_MENU", value: 0x26b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NUMERIC_11 = new InputEventCode({key: "KEY_NUMERIC_11", value: 0x26c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NUMERIC_12 = new InputEventCode({key: "KEY_NUMERIC_12", value: 0x26d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_AUDIO_DESC = new InputEventCode({key: "KEY_AUDIO_DESC", value: 0x26e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_3D_MODE = new InputEventCode({key: "KEY_3D_MODE", value: 0x26f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NEXT_FAVORITE = new InputEventCode({key: "KEY_NEXT_FAVORITE", value: 0x270, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_STOP_RECORD = new InputEventCode({key: "KEY_STOP_RECORD", value: 0x271, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PAUSE_RECORD = new InputEventCode({key: "KEY_PAUSE_RECORD", value: 0x272, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_VOD = new InputEventCode({key: "KEY_VOD", value: 0x273, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_UNMUTE = new InputEventCode({key: "KEY_UNMUTE", value: 0x274, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FASTREVERSE = new InputEventCode({key: "KEY_FASTREVERSE", value: 0x275, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SLOWREVERSE = new InputEventCode({key: "KEY_SLOWREVERSE", value: 0x276, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DATA = new InputEventCode({key: "KEY_DATA", value: 0x277, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_ONSCREEN_KEYBOARD = new InputEventCode({key: "KEY_ONSCREEN_KEYBOARD", value: 0x278, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PRIVACY_SCREEN_TOGGLE = new InputEventCode({key: "KEY_PRIVACY_SCREEN_TOGGLE", value: 0x279, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SELECTIVE_SCREENSHOT = new InputEventCode({key: "KEY_SELECTIVE_SCREENSHOT", value: 0x27a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NEXT_ELEMENT = new InputEventCode({key: "KEY_NEXT_ELEMENT", value: 0x27b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_PREVIOUS_ELEMENT = new InputEventCode({key: "KEY_PREVIOUS_ELEMENT", value: 0x27c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_AUTOPILOT_ENGAGE_TOGGLE = new InputEventCode({key: "KEY_AUTOPILOT_ENGAGE_TOGGLE", value: 0x27d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MARK_WAYPOINT = new InputEventCode({key: "KEY_MARK_WAYPOINT", value: 0x27e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SOS = new InputEventCode({key: "KEY_SOS", value: 0x27f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NAV_CHART = new InputEventCode({key: "KEY_NAV_CHART", value: 0x280, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_FISHING_CHART = new InputEventCode({key: "KEY_FISHING_CHART", value: 0x281, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SINGLE_RANGE_RADAR = new InputEventCode({key: "KEY_SINGLE_RANGE_RADAR", value: 0x282, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_DUAL_RANGE_RADAR = new InputEventCode({key: "KEY_DUAL_RANGE_RADAR", value: 0x283, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_RADAR_OVERLAY = new InputEventCode({key: "KEY_RADAR_OVERLAY", value: 0x284, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_TRADITIONAL_SONAR = new InputEventCode({key: "KEY_TRADITIONAL_SONAR", value: 0x285, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CLEARVU_SONAR = new InputEventCode({key: "KEY_CLEARVU_SONAR", value: 0x286, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_SIDEVU_SONAR = new InputEventCode({key: "KEY_SIDEVU_SONAR", value: 0x287, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_NAV_INFO = new InputEventCode({key: "KEY_NAV_INFO", value: 0x288, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_BRIGHTNESS_MENU = new InputEventCode({key: "KEY_BRIGHTNESS_MENU", value: 0x289, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO1 = new InputEventCode({key: "KEY_MACRO1", value: 0x290, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO2 = new InputEventCode({key: "KEY_MACRO2", value: 0x291, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO3 = new InputEventCode({key: "KEY_MACRO3", value: 0x292, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO4 = new InputEventCode({key: "KEY_MACRO4", value: 0x293, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO5 = new InputEventCode({key: "KEY_MACRO5", value: 0x294, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO6 = new InputEventCode({key: "KEY_MACRO6", value: 0x295, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO7 = new InputEventCode({key: "KEY_MACRO7", value: 0x296, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO8 = new InputEventCode({key: "KEY_MACRO8", value: 0x297, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO9 = new InputEventCode({key: "KEY_MACRO9", value: 0x298, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO10 = new InputEventCode({key: "KEY_MACRO10", value: 0x299, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO11 = new InputEventCode({key: "KEY_MACRO11", value: 0x29a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO12 = new InputEventCode({key: "KEY_MACRO12", value: 0x29b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO13 = new InputEventCode({key: "KEY_MACRO13", value: 0x29c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO14 = new InputEventCode({key: "KEY_MACRO14", value: 0x29d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO15 = new InputEventCode({key: "KEY_MACRO15", value: 0x29e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO16 = new InputEventCode({key: "KEY_MACRO16", value: 0x29f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO17 = new InputEventCode({key: "KEY_MACRO17", value: 0x2a0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO18 = new InputEventCode({key: "KEY_MACRO18", value: 0x2a1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO19 = new InputEventCode({key: "KEY_MACRO19", value: 0x2a2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO20 = new InputEventCode({key: "KEY_MACRO20", value: 0x2a3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO21 = new InputEventCode({key: "KEY_MACRO21", value: 0x2a4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO22 = new InputEventCode({key: "KEY_MACRO22", value: 0x2a5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO23 = new InputEventCode({key: "KEY_MACRO23", value: 0x2a6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO24 = new InputEventCode({key: "KEY_MACRO24", value: 0x2a7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO25 = new InputEventCode({key: "KEY_MACRO25", value: 0x2a8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO26 = new InputEventCode({key: "KEY_MACRO26", value: 0x2a9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO27 = new InputEventCode({key: "KEY_MACRO27", value: 0x2aa, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO28 = new InputEventCode({key: "KEY_MACRO28", value: 0x2ab, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO29 = new InputEventCode({key: "KEY_MACRO29", value: 0x2ac, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO30 = new InputEventCode({key: "KEY_MACRO30", value: 0x2ad, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO_RECORD_START = new InputEventCode({key: "KEY_MACRO_RECORD_START", value: 0x2b0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO_RECORD_STOP = new InputEventCode({key: "KEY_MACRO_RECORD_STOP", value: 0x2b1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO_PRESET_CYCLE = new InputEventCode({key: "KEY_MACRO_PRESET_CYCLE", value: 0x2b2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO_PRESET1 = new InputEventCode({key: "KEY_MACRO_PRESET1", value: 0x2b3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO_PRESET2 = new InputEventCode({key: "KEY_MACRO_PRESET2", value: 0x2b4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MACRO_PRESET3 = new InputEventCode({key: "KEY_MACRO_PRESET3", value: 0x2b5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBD_LCD_MENU1 = new InputEventCode({key: "KEY_KBD_LCD_MENU1", value: 0x2b8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBD_LCD_MENU2 = new InputEventCode({key: "KEY_KBD_LCD_MENU2", value: 0x2b9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBD_LCD_MENU3 = new InputEventCode({key: "KEY_KBD_LCD_MENU3", value: 0x2ba, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBD_LCD_MENU4 = new InputEventCode({key: "KEY_KBD_LCD_MENU4", value: 0x2bb, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_KBD_LCD_MENU5 = new InputEventCode({key: "KEY_KBD_LCD_MENU5", value: 0x2bc, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY = new InputEventCode({key: "BTN_TRIGGER_HAPPY", value: 0x2c0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY1 = new InputEventCode({key: "BTN_TRIGGER_HAPPY1", value: 0x2c0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY2 = new InputEventCode({key: "BTN_TRIGGER_HAPPY2", value: 0x2c1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY3 = new InputEventCode({key: "BTN_TRIGGER_HAPPY3", value: 0x2c2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY4 = new InputEventCode({key: "BTN_TRIGGER_HAPPY4", value: 0x2c3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY5 = new InputEventCode({key: "BTN_TRIGGER_HAPPY5", value: 0x2c4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY6 = new InputEventCode({key: "BTN_TRIGGER_HAPPY6", value: 0x2c5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY7 = new InputEventCode({key: "BTN_TRIGGER_HAPPY7", value: 0x2c6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY8 = new InputEventCode({key: "BTN_TRIGGER_HAPPY8", value: 0x2c7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY9 = new InputEventCode({key: "BTN_TRIGGER_HAPPY9", value: 0x2c8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY10 = new InputEventCode({key: "BTN_TRIGGER_HAPPY10", value: 0x2c9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY11 = new InputEventCode({key: "BTN_TRIGGER_HAPPY11", value: 0x2ca, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY12 = new InputEventCode({key: "BTN_TRIGGER_HAPPY12", value: 0x2cb, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY13 = new InputEventCode({key: "BTN_TRIGGER_HAPPY13", value: 0x2cc, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY14 = new InputEventCode({key: "BTN_TRIGGER_HAPPY14", value: 0x2cd, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY15 = new InputEventCode({key: "BTN_TRIGGER_HAPPY15", value: 0x2ce, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY16 = new InputEventCode({key: "BTN_TRIGGER_HAPPY16", value: 0x2cf, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY17 = new InputEventCode({key: "BTN_TRIGGER_HAPPY17", value: 0x2d0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY18 = new InputEventCode({key: "BTN_TRIGGER_HAPPY18", value: 0x2d1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY19 = new InputEventCode({key: "BTN_TRIGGER_HAPPY19", value: 0x2d2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY20 = new InputEventCode({key: "BTN_TRIGGER_HAPPY20", value: 0x2d3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY21 = new InputEventCode({key: "BTN_TRIGGER_HAPPY21", value: 0x2d4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY22 = new InputEventCode({key: "BTN_TRIGGER_HAPPY22", value: 0x2d5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY23 = new InputEventCode({key: "BTN_TRIGGER_HAPPY23", value: 0x2d6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY24 = new InputEventCode({key: "BTN_TRIGGER_HAPPY24", value: 0x2d7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY25 = new InputEventCode({key: "BTN_TRIGGER_HAPPY25", value: 0x2d8, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY26 = new InputEventCode({key: "BTN_TRIGGER_HAPPY26", value: 0x2d9, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY27 = new InputEventCode({key: "BTN_TRIGGER_HAPPY27", value: 0x2da, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY28 = new InputEventCode({key: "BTN_TRIGGER_HAPPY28", value: 0x2db, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY29 = new InputEventCode({key: "BTN_TRIGGER_HAPPY29", value: 0x2dc, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY30 = new InputEventCode({key: "BTN_TRIGGER_HAPPY30", value: 0x2dd, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY31 = new InputEventCode({key: "BTN_TRIGGER_HAPPY31", value: 0x2de, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY32 = new InputEventCode({key: "BTN_TRIGGER_HAPPY32", value: 0x2df, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY33 = new InputEventCode({key: "BTN_TRIGGER_HAPPY33", value: 0x2e0, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY34 = new InputEventCode({key: "BTN_TRIGGER_HAPPY34", value: 0x2e1, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY35 = new InputEventCode({key: "BTN_TRIGGER_HAPPY35", value: 0x2e2, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY36 = new InputEventCode({key: "BTN_TRIGGER_HAPPY36", value: 0x2e3, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY37 = new InputEventCode({key: "BTN_TRIGGER_HAPPY37", value: 0x2e4, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY38 = new InputEventCode({key: "BTN_TRIGGER_HAPPY38", value: 0x2e5, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY39 = new InputEventCode({key: "BTN_TRIGGER_HAPPY39", value: 0x2e6, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly BTN_TRIGGER_HAPPY40 = new InputEventCode({key: "BTN_TRIGGER_HAPPY40", value: 0x2e7, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MIN_INTERESTING = new InputEventCode({key: "KEY_MIN_INTERESTING", value: 113, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_MAX = new InputEventCode({key: "KEY_MAX", value: 0x2ff, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly KEY_CNT = new InputEventCode({key: "KEY_CNT", value: 0x300, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Relative movement Event Codes
    static readonly REL_X = new InputEventCode({key: "REL_X", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_Y = new InputEventCode({key: "REL_Y", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_Z = new InputEventCode({key: "REL_Z", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_RX = new InputEventCode({key: "REL_RX", value: 0x03, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_RY = new InputEventCode({key: "REL_RY", value: 0x04, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_RZ = new InputEventCode({key: "REL_RZ", value: 0x05, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_HWHEEL = new InputEventCode({key: "REL_HWHEEL", value: 0x06, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_DIAL = new InputEventCode({key: "REL_DIAL", value: 0x07, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_WHEEL = new InputEventCode({key: "REL_WHEEL", value: 0x08, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_MISC = new InputEventCode({key: "REL_MISC", value: 0x09, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_RESERVED = new InputEventCode({key: "REL_RESERVED", value: 0x0a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_WHEEL_HI_RES = new InputEventCode({key: "REL_WHEEL_HI_RES", value: 0x0b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_HWHEEL_HI_RES = new InputEventCode({key: "REL_HWHEEL_HI_RES", value: 0x0c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_MAX = new InputEventCode({key: "REL_MAX", value: 0x0f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REL_CNT = new InputEventCode({key: "REL_CNT", value: 0x10, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Absolute movement Event Codes
    static readonly ABS_X = new InputEventCode({key: "ABS_X", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_Y = new InputEventCode({key: "ABS_Y", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_Z = new InputEventCode({key: "ABS_Z", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_RX = new InputEventCode({key: "ABS_RX", value: 0x03, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_RY = new InputEventCode({key: "ABS_RY", value: 0x04, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_RZ = new InputEventCode({key: "ABS_RZ", value: 0x05, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_THROTTLE = new InputEventCode({key: "ABS_THROTTLE", value: 0x06, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_RUDDER = new InputEventCode({key: "ABS_RUDDER", value: 0x07, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_WHEEL = new InputEventCode({key: "ABS_WHEEL", value: 0x08, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_GAS = new InputEventCode({key: "ABS_GAS", value: 0x09, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_BRAKE = new InputEventCode({key: "ABS_BRAKE", value: 0x0a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_HAT0X = new InputEventCode({key: "ABS_HAT0X", value: 0x10, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_HAT0Y = new InputEventCode({key: "ABS_HAT0Y", value: 0x11, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_HAT1X = new InputEventCode({key: "ABS_HAT1X", value: 0x12, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_HAT1Y = new InputEventCode({key: "ABS_HAT1Y", value: 0x13, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_HAT2X = new InputEventCode({key: "ABS_HAT2X", value: 0x14, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_HAT2Y = new InputEventCode({key: "ABS_HAT2Y", value: 0x15, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_HAT3X = new InputEventCode({key: "ABS_HAT3X", value: 0x16, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_HAT3Y = new InputEventCode({key: "ABS_HAT3Y", value: 0x17, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_PRESSURE = new InputEventCode({key: "ABS_PRESSURE", value: 0x18, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_DISTANCE = new InputEventCode({key: "ABS_DISTANCE", value: 0x19, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_TILT_X = new InputEventCode({key: "ABS_TILT_X", value: 0x1a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_TILT_Y = new InputEventCode({key: "ABS_TILT_Y", value: 0x1b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_TOOL_WIDTH = new InputEventCode({key: "ABS_TOOL_WIDTH", value: 0x1c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_VOLUME = new InputEventCode({key: "ABS_VOLUME", value: 0x20, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_PROFILE = new InputEventCode({key: "ABS_PROFILE", value: 0x21, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_MISC = new InputEventCode({key: "ABS_MISC", value: 0x28, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_RESERVED = new InputEventCode({key: "ABS_RESERVED", value: 0x2e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_MT_SLOT = new InputEventCode({key: "ABS_MT_SLOT", value: 0x2f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "MT slot being modified"});
    static readonly ABS_MT_TOUCH_MAJOR = new InputEventCode({key: "ABS_MT_TOUCH_MAJOR", value: 0x30, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Major axis of touching ellipse"});
    static readonly ABS_MT_TOUCH_MINOR = new InputEventCode({key: "ABS_MT_TOUCH_MINOR", value: 0x31, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Minor axis (omit if circular)"});
    static readonly ABS_MT_WIDTH_MAJOR = new InputEventCode({key: "ABS_MT_WIDTH_MAJOR", value: 0x32, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Major axis of approaching ellipse"});
    static readonly ABS_MT_WIDTH_MINOR = new InputEventCode({key: "ABS_MT_WIDTH_MINOR", value: 0x33, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Minor axis (omit if circular)"});
    static readonly ABS_MT_ORIENTATION = new InputEventCode({key: "ABS_MT_ORIENTATION", value: 0x34, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Ellipse orientation"});
    static readonly ABS_MT_POSITION_X = new InputEventCode({key: "ABS_MT_POSITION_X", value: 0x35, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Center X touch position"});
    static readonly ABS_MT_POSITION_Y = new InputEventCode({key: "ABS_MT_POSITION_Y", value: 0x36, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Center Y touch position"});
    static readonly ABS_MT_TOOL_TYPE = new InputEventCode({key: "ABS_MT_TOOL_TYPE", value: 0x37, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Type of touching device"});
    static readonly ABS_MT_BLOB_ID = new InputEventCode({key: "ABS_MT_BLOB_ID", value: 0x38, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Group a set of packets as a blob"});
    static readonly ABS_MT_TRACKING_ID = new InputEventCode({key: "ABS_MT_TRACKING_ID", value: 0x39, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Unique ID of initiated contact"});
    static readonly ABS_MT_PRESSURE = new InputEventCode({key: "ABS_MT_PRESSURE", value: 0x3a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Pressure on contact area"});
    static readonly ABS_MT_DISTANCE = new InputEventCode({key: "ABS_MT_DISTANCE", value: 0x3b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Contact hover distance"});
    static readonly ABS_MT_TOOL_X = new InputEventCode({key: "ABS_MT_TOOL_X", value: 0x3c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Center X tool position"});
    static readonly ABS_MT_TOOL_Y = new InputEventCode({key: "ABS_MT_TOOL_Y", value: 0x3d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Center Y tool position"});
    static readonly ABS_MAX = new InputEventCode({key: "ABS_MAX", value: 0x3f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly ABS_CNT = new InputEventCode({key: "ABS_CNT", value: 0x40, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Switch Event Codes
    static readonly SW_LID = new InputEventCode({key: "SW_LID", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = lid shut"});
    static readonly SW_TABLET_MODE = new InputEventCode({key: "SW_TABLET_MODE", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = lid shut"});
    static readonly SW_HEADPHONE_INSERT = new InputEventCode({key: "SW_HEADPHONE_INSERT", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = inserted"});
    static readonly SW_RFKILL_ALL = new InputEventCode({key: "SW_RFKILL_ALL", value: 0x03, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "rfkill master switch, type \"any\" set = radio enabled "});
    static readonly SW_RADIO = new InputEventCode({key: "SW_RADIO", value: 0x03, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "deprecated"});
    static readonly SW_MICROPHONE_INSERT = new InputEventCode({key: "SW_MICROPHONE_INSERT", value: 0x04, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = inserted"});
    static readonly SW_DOCK = new InputEventCode({key: "SW_DOCK", value: 0x05, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = plugged into dock"});
    static readonly SW_LINEOUT_INSERT = new InputEventCode({key: "SW_LINEOUT_INSERT", value: 0x06, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = inserted"});
    static readonly SW_JACK_PHYSICAL_INSERT = new InputEventCode({key: "SW_JACK_PHYSICAL_INSERT", value: 0x07, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = mechanical switch set"});
    static readonly SW_VIDEOOUT_INSERT = new InputEventCode({key: "SW_VIDEOOUT_INSERT", value: 0x08, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = inserted"});
    static readonly SW_CAMERA_LENS_COVER = new InputEventCode({key: "SW_CAMERA_LENS_COVER", value: 0x09, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = lens covered"});
    static readonly SW_KEYPAD_SLIDE = new InputEventCode({key: "SW_KEYPAD_SLIDE", value: 0x0a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = keypad slide out"});
    static readonly SW_FRONT_PROXIMITY = new InputEventCode({key: "SW_FRONT_PROXIMITY", value: 0x0b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = front proximity sensor active"});
    static readonly SW_ROTATE_LOCK = new InputEventCode({key: "SW_ROTATE_LOCK", value: 0x0c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = rotate locked/disabled"});
    static readonly SW_LINEIN_INSERT = new InputEventCode({key: "SW_LINEIN_INSERT", value: 0x0d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "set = inserted"});
    static readonly SW_MUTE_DEVICE = new InputEventCode({key: "SW_MUTE_DEVICE", value: 0x0e, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SW_PEN_INSERTED = new InputEventCode({key: "SW_PEN_INSERTED", value: 0x0f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SW_MACHINE_COVER = new InputEventCode({key: "SW_MACHINE_COVER", value: 0x10, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SW_MAX = new InputEventCode({key: "SW_MAX", value: 0x10, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SW_CNT = new InputEventCode({key: "SW_CNT", value: 0x11, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Miscellaneous Event Codes
    static readonly MSC_SERIAL = new InputEventCode({key: "MSC_SERIAL", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MSC_PULSELED = new InputEventCode({key: "MSC_PULSELED", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MSC_GESTURE = new InputEventCode({key: "MSC_GESTURE", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MSC_RAW = new InputEventCode({key: "MSC_RAW", value: 0x03, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MSC_SCAN = new InputEventCode({key: "MSC_SCAN", value: 0x04, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MSC_TIMESTAMP = new InputEventCode({key: "MSC_TIMESTAMP", value: 0x05, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MSC_MAX = new InputEventCode({key: "MSC_MAX", value: 0x07, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MSC_CNT = new InputEventCode({key: "MSC_CNT", value: 0x08, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android LED Event Codes
    static readonly LED_NUML = new InputEventCode({key: "LED_NUML", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_CAPSL = new InputEventCode({key: "LED_CAPSL", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_SCROLLL = new InputEventCode({key: "LED_SCROLLL", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_COMPOSE = new InputEventCode({key: "LED_COMPOSE", value: 0x03, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_KANA = new InputEventCode({key: "LED_KANA", value: 0x04, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_SLEEP = new InputEventCode({key: "LED_SLEEP", value: 0x05, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_SUSPEND = new InputEventCode({key: "LED_SUSPEND", value: 0x06, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_MUTE = new InputEventCode({key: "LED_MUTE", value: 0x07, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_MISC = new InputEventCode({key: "LED_MISC", value: 0x08, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_MAIL = new InputEventCode({key: "LED_MAIL", value: 0x09, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_CHARGING = new InputEventCode({key: "LED_CHARGING", value: 0x0a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_MAX = new InputEventCode({key: "LED_MAX", value: 0x0f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly LED_CNT = new InputEventCode({key: "LED_CNT", value: 0x10, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Auto repeat Event Codes
    static readonly REP_DELAY = new InputEventCode({key: "REP_DELAY", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REP_PERIOD = new InputEventCode({key: "REP_PERIOD", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REP_MAX = new InputEventCode({key: "REP_MAX", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly REP_CNT = new InputEventCode({key: "REP_CNT", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Sound Event Codes
    static readonly SND_CLICK = new InputEventCode({key: "SND_CLICK", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SND_BELL = new InputEventCode({key: "SND_BELL", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SND_TONE = new InputEventCode({key: "SND_TONE", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SND_MAX = new InputEventCode({key: "SND_MAX", value: 0x07, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly SND_CNT = new InputEventCode({key: "SND_CNT", value: 0x08, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android MT Tool Event Codes
    static readonly MT_TOOL_FINGER = new InputEventCode({key: "MT_TOOL_FINGER", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MT_TOOL_PEN = new InputEventCode({key: "MT_TOOL_PEN", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MT_TOOL_PALM = new InputEventCode({key: "MT_TOOL_PALM", value: 0x02, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly MT_TOOL_DIAL = new InputEventCode({key: "MT_TOOL_DIAL", value: 0x0a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    // Android Ff Status Event Codes
    static readonly FF_STATUS_STOPPED = new InputEventCode({key: "FF_STATUS_STOPPED", value: 0x00, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_STATUS_PLAYING = new InputEventCode({key: "FF_STATUS_PLAYING", value: 0x01, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_RUMBLE = new InputEventCode({key: "FF_RUMBLE", value: 0x50, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback effect type"});
    static readonly FF_PERIODIC = new InputEventCode({key: "FF_PERIODIC", value: 0x51, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback effect type"});
    static readonly FF_CONSTANT = new InputEventCode({key: "FF_CONSTANT", value: 0x52, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback effect type"});
    static readonly FF_SPRING = new InputEventCode({key: "FF_SPRING", value: 0x53, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback effect type"});
    static readonly FF_FRICTION = new InputEventCode({key: "FF_FRICTION", value: 0x54, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback effect type"});
    static readonly FF_DAMPER = new InputEventCode({key: "FF_DAMPER", value: 0x55, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback effect type"});
    static readonly FF_INERTIA = new InputEventCode({key: "FF_INERTIA", value: 0x56, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback effect type"});
    static readonly FF_RAMP = new InputEventCode({key: "FF_RAMP", value: 0x57, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback effect type"});
    static readonly FF_EFFECT_MIN = new InputEventCode({key: "FF_EFFECT_MIN", value: 0x50, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_EFFECT_MAX = new InputEventCode({key: "FF_EFFECT_MAX", value: 0x57, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_SQUARE = new InputEventCode({key: "FF_SQUARE", value: 0x58, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback periodic effect types"});
    static readonly FF_TRIANGLE = new InputEventCode({key: "FF_TRIANGLE", value: 0x59, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback periodic effect types"});
    static readonly FF_SINE = new InputEventCode({key: "FF_SINE", value: 0x5a, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback periodic effect types"});
    static readonly FF_SAW_UP = new InputEventCode({key: "FF_SAW_UP", value: 0x5b, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback periodic effect types"});
    static readonly FF_SAW_DOWN = new InputEventCode({key: "FF_SAW_DOWN", value: 0x5c, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback periodic effect types"});
    static readonly FF_CUSTOM = new InputEventCode({key: "FF_CUSTOM", value: 0x5d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: "Force feedback periodic effect types"});
    static readonly FF_WAVEFORM_MIN = new InputEventCode({key: "FF_WAVEFORM_MIN", value: 0x58, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_WAVEFORM_MAX = new InputEventCode({key: "FF_WAVEFORM_MAX", value: 0x5d, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_GAIN = new InputEventCode({key: "FF_GAIN", value: 0x60, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_AUTOCENTER = new InputEventCode({key: "FF_AUTOCENTER", value: 0x61, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_MAX_EFFECTS = new InputEventCode({key: "FF_MAX_EFFECTS", value: 0x60, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_MAX = new InputEventCode({key: "FF_MAX", value: 0x7f, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
    static readonly FF_CNT = new InputEventCode({key: "FF_CNT", value: 0x80, byteSize: 2, endianness: Endianness.LITTLE_ENDIAN},
        {description: ""});
}