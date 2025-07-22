enum JAVA {
    PUBLIC= 0x1,
    PROTECTED= 0x2,
    PRIVATE= 0x3,
    STATIC= 0x4,
    ENUM= 0x5,
    INTERFACE= 0x6,
    T_CHAR= 0x10,
    T_LONG= 0x11,
    T_INT= 0x12,
    T_SHORT= 0x13,
    T_BOOL= 0x14,
    T_VOID= 0x15,
    T_OBJ= 0x16,
    T_FLOAT= 0x17,
    T_DOUBLE= 0x18,
    T_BYTE= 0x19
};

export const CONST = {
    VERSION: "0.6.2",
    EXACT_MATCH: 1,
    LEX: {
        TOKEN: {
            SPACE: " ",
            DELIMITER: '"',
            METH_ARG_B: "(",
            METH_ARG_E: ")",
            INNER_FQCN: "$",
            ARRAY: "[",
            OBJREF: "L",
            PARAM: "p",
            LOCALVAR: "v",
            ADD: "+",
            SUB: "-",
            DIV: "/",
            MUL: "*",
            REM: "%",
            NOT: "!",
            OR: "|",
            AND: "&",
            XOR: "^",
            SHR: ">>",
            SHL: "<<",
            USHR: ">>>",
            NEG: '-'
        },
        STRUCT: {
            CLASS: ".class",
            SUPER: ".super",
            IMPLEMENTS: ".implements",
            SRC: ".source",
            LINE: ".line",
            LOCALS: ".locals",
            LOCAL: ".local",
            REG: ".registers",
            PARAMS: ".params",
            METHOD_BEG: ".method",
            ANNOT_BEG: ".annotation",
            END: ".end",
            FIELD: ".field",
            ARRAY: ".array-data",
            ARRAY_NAME: "array-data",
            PSWITCH: ".packed-switch",
            SSWITCH: ".sparse-switch",
            CATCH: ".catch",
            CATCH_ALL: ".catchall",
            DBG_RESTART: ".restart",
            METHOD_NAME: "method",
            ANNOTATION_NAME: "annotation",
            PSWITCH_NAME: "packed-switch",
            SSWITCH_NAME: "sparse-switch",

        },
        LABEL: {
            GOTO: ":goto_",
            COND: ":cond_",
            CATCH: ":catch_",
            PSWITCH: ":pswitch_",
            SSWITCH: ":sswitch_",
            PSWITCH_DATA: ":pswitch_data_",
            SSWITCH_DATA: ":sswitch_data_",
            ARRAY: ":array_"
        },
        MODIFIER: {
            PUBLIC: "public",
            PRIVATE: "private",
            PROTECTED: "protected",
            STATIC: "static",
            ABSTRACT: "abstract",
            CONSTR: "constructor",
            VOLATILE: "volatile",
            FINAL: "final",
            ENUM: "enum",
            TRANSIENT: "transient",
            SYNTHETIC: "synthetic",
            DECLSYNC: "declared-synchronized",
            BRIDGE: "bridge",
            VARARG: "varargs",
            NATIVE: "native",
            INTERFACE: "interface",
            ANNOTATION: "annotation",
            STRICTFP: "strictfp",
            SYNCHRONIZED: "synchronized",

        }
    },
    JAVA: {
        PUBLIC: 0x1,
        PROTECTED: 0x2,
        PRIVATE: 0x3,
        STATIC: 0x4,
        ENUM: 0x5,
        INTERFACE: 0x6,
        // ----
        T_CHAR: 0x10,
        T_LONG: 0x11,
        T_INT: 0x12,
        T_SHORT: 0x13,
        T_BOOL: 0x14,
        T_VOID: 0x15,
        T_OBJ: 0x16,
        T_FLOAT: 0x17,
        T_DOUBLE: 0x18,
        T_BYTE: 0x19
    },
    /**
     * Corresponding between Smali primitive type name and common type name
     */
    WORDS: {
        /*    PUBLIC: "public",
            PROTECTED: "protected",
            PRIVATE: "private",
            STATIC: "static",
            ENUM: "enum", */
        C: "char",
        J: "long",
        D: "double",
        B: "byte",
        I: "int",
        S: "short",
        Z: "boolean",
        V: "void",
        L: "Object",
        F: "float"
    },
    OPCODE_REFTYPE: {
        NONE: 0x0,
        TYPE: 0x1,
        STRING: 0x2,
        FIELD: 0x3,
        METHOD: 0x4
    },
    OPCODE_FORMAT: {
        Format10x: 0x0,
        Format10t: 0x1,
        Format11n: 0x2,
        Format11x: 0x3,
        Format12x: 0x4,
        Format20t: 0x5,
        Format21c: 0x6,
        Format21ih: 0x7,
        Format21lh: 0x8,
        Format21s: 0x9,
        Format21t: 0xa,
        Format22b: 0xb,
        Format22c: 0xc,
        Format22s: 0xd,
        Format22t: 0xe,
        Format22x: 0xf,
        Format23x: 0x10,
        Format30t: 0x11,
        Format31c: 0x12,
        Format35c: 0x13,
        Format3rc: 0x14,
        Format51l: 0x15,
        Format32x: 0x16,
        Format31i: 0x17,
        Format31t: 0x18
    },
    OPCODE_TYPE: {
        CAN_CONTINUE: 1, // 0
        CAN_THROW: 1 << 1, // 1
        CAN_INITIALIZE_REFERENCE: 1 << 2, // 2
        SETS_REGISTER: 1 << 3, // 3
        SETS_WIDE_REGISTER: 1 << 4, // 4
        STATIC_CALL: 1 << 5,
        SETS_RESULT: 1 << 6,
        STATIC_FIELD_ACCESSOR: 1 << 7,
    },
    CASE_TYPE: {
        PACKED: 0x1,
        SPARSE: 0x2
    },
    OS: {
        ANDROID: 'android',
        LINUX: 'linux',
        TIZEN: 'tizen'
    },
    TYPES: {
        F: JAVA.T_FLOAT,
        D: JAVA.T_DOUBLE,
        C: JAVA.T_CHAR,
        V: JAVA.T_VOID,
        B: JAVA.T_BYTE,
        J: JAVA.T_LONG,
        I: JAVA.T_INT,
        S: JAVA.T_SHORT,
        Z: JAVA.T_BOOL,
        L: JAVA.T_OBJ
    },
    INSTR_TYPE: {
        GETTER: 0,
        SETTER: 1,
        INVOKE: 2,
        NOP: 3,
        VAR_SETTER: 4,
        VAR_GETTER: 5,
        MOVE: 6,
        MATH: 7,
        ARRAY_SETTER: 8,
        ARRAY_GETTER: 9,
        MOVE_RESULT: 10,
        MOVE_EXCPT: 11,
        RET: 12,
        MONITOR: 13,
        CMP: 14,
        IF: 15,
        SWITCH: 16,
        GOTO: 17,
        NEW: 18,
        CLASS_CHECK: 19,
        MATH_CAST: 20,
        ARRAY_LENGTH: 21
    },
    INSTR_TYPE_LABEL: [
        "GETTER",
        "SETTER",
        "INVOKE",
        "NOP",
        "VAR_SETTER",
        "VAR_GETTER",
        "MOVE",
        "MATH",
        "ARRAY_SETTER",
        "ARRAY_GETTER",
        "MOVE_RESULT",
        "MOVE_EXCPT",
        "RETURN",
        "MONITOR",
        "CMP",
        "IF",
        "SWITCH",
        "GOTO",
        "NEW",
        "CLASS_CHECK",
        "MATH_CAST"
    ],
    BRANCH: {
        IF_TRUE: 0x1,
        IF_FALSE: 0x0,
        INCONDITIONNAL: 0x2
    },
    RE: {
        ARRAY_VALUE: /(-)?0x([0-9a-fA-F]+)([s]*)/
    },
    MAX: {
        DATABLOCK_SIZE: 48
    },
    TAG: {
        STRING: "string",
        STRING_DECL: "strdecl",
        ARRAY: "array",
        LITTERAL: "litteral",
        MISSING: "missing"
    },
    VM: {
        IF_DEFAULT_PATH: true
    },

};

export enum DXC_LIFECYCLE_EVENT {
    NEW_ENGINE,
    OPEN_PROJECT,
    NEW_PROJECT,
    CLOSE_PROJECT,
    ENG_BEFORE_WS_INIT,
    PLATFORM_MGR_AFTER_INIT,
    INSPECT_MGR_AFTER_INIT,
    DEV_MGR_AFTER_INIT,
    ENF_AFTER_INIT,
    ENG_AFTER_BOOT
}