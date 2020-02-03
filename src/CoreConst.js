var CONST = {
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
            USHR: ">>>"
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
            ANNOTATION: "annotation"    
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
        Format51l: 0x15
    },
    OPCODE_TYPE: {
        CAN_CONTINUE: 1, // 0
        CAN_THROW: 2, // 1
        CAN_INITIALIZE_REFERENCE: 4, // 2
        SETS_REGISTER: 8, // 3
        SETS_WIDE_REGISTER: 16, // 4
        STATIC_CALL: 32 
    },
    CASE_TYPE: {
        PACKED: 0x1,
        SPARSE: 0x2
    }
};

CONST.TYPES = {
    F: CONST.JAVA.T_FLOAT,
    D: CONST.JAVA.T_DOUBLE,
    C: CONST.JAVA.T_CHAR,
    V: CONST.JAVA.T_VOID,
    B: CONST.JAVA.T_BYTE,
    J: CONST.JAVA.T_LONG,
    I: CONST.JAVA.T_INT,
    S: CONST.JAVA.T_SHORT,
    Z: CONST.JAVA.T_BOOL,
    L: CONST.JAVA.T_OBJ
};

CONST.INSTR_TYPE = {
    GETTER: 0,
    SETTER: 1,
    INVOKE: 2,
    NOP:    3,
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
    MATH_CAST: 20
}; 


CONST.INSTR_TYPE_LABEL = [
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
]; 

CONST.BRANCH = {
    IF_TRUE: 0x1,
    IF_FALSE: 0x0,
    INCONDITIONNAL: 0x2
};

CONST.RE = {
    ARRAY_VALUE: /(-)?0x([0-9a-fA-F]+)/
};

CONST.MAX = {
    DATABLOCK_SIZE: 48
};

CONST.TAG = {
    STRING: "string",
    STRING_DECL: "strdecl",
    ARRAY: "array",
    LITTERAL: "litteral",
    MISSING: "missing"
};



module.exports = CONST;
