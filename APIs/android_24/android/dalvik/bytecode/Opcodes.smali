.class public interface abstract Ldalvik/bytecode/Opcodes;
.super Ljava/lang/Object;
.source "Opcodes.java"


# static fields
.field public static final OP_ADD_DOUBLE:I = 0xab

.field public static final OP_ADD_DOUBLE_2ADDR:I = 0xcb

.field public static final OP_ADD_FLOAT:I = 0xa6

.field public static final OP_ADD_FLOAT_2ADDR:I = 0xc6

.field public static final OP_ADD_INT:I = 0x90

.field public static final OP_ADD_INT_2ADDR:I = 0xb0

.field public static final OP_ADD_INT_LIT16:I = 0xd0

.field public static final OP_ADD_INT_LIT8:I = 0xd8

.field public static final OP_ADD_LONG:I = 0x9b

.field public static final OP_ADD_LONG_2ADDR:I = 0xbb

.field public static final OP_AGET:I = 0x44

.field public static final OP_AGET_BOOLEAN:I = 0x47

.field public static final OP_AGET_BYTE:I = 0x48

.field public static final OP_AGET_CHAR:I = 0x49

.field public static final OP_AGET_OBJECT:I = 0x46

.field public static final OP_AGET_SHORT:I = 0x4a

.field public static final OP_AGET_WIDE:I = 0x45

.field public static final OP_AND_INT:I = 0x95

.field public static final OP_AND_INT_2ADDR:I = 0xb5

.field public static final OP_AND_INT_LIT16:I = 0xd5

.field public static final OP_AND_INT_LIT8:I = 0xdd

.field public static final OP_AND_LONG:I = 0xa0

.field public static final OP_AND_LONG_2ADDR:I = 0xc0

.field public static final OP_APUT:I = 0x4b

.field public static final OP_APUT_BOOLEAN:I = 0x4e

.field public static final OP_APUT_BYTE:I = 0x4f

.field public static final OP_APUT_CHAR:I = 0x50

.field public static final OP_APUT_OBJECT:I = 0x4d

.field public static final OP_APUT_SHORT:I = 0x51

.field public static final OP_APUT_WIDE:I = 0x4c

.field public static final OP_ARRAY_LENGTH:I = 0x21

.field public static final OP_BREAKPOINT:I = 0xec
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_CHECK_CAST:I = 0x1f

.field public static final OP_CHECK_CAST_JUMBO:I = 0x1ff

.field public static final OP_CMPG_DOUBLE:I = 0x30

.field public static final OP_CMPG_FLOAT:I = 0x2e

.field public static final OP_CMPL_DOUBLE:I = 0x2f

.field public static final OP_CMPL_FLOAT:I = 0x2d

.field public static final OP_CMP_LONG:I = 0x31

.field public static final OP_CONST:I = 0x14

.field public static final OP_CONST_16:I = 0x13

.field public static final OP_CONST_4:I = 0x12

.field public static final OP_CONST_CLASS:I = 0x1c

.field public static final OP_CONST_CLASS_JUMBO:I = 0xff

.field public static final OP_CONST_HIGH16:I = 0x15

.field public static final OP_CONST_STRING:I = 0x1a

.field public static final OP_CONST_STRING_JUMBO:I = 0x1b

.field public static final OP_CONST_WIDE:I = 0x18

.field public static final OP_CONST_WIDE_16:I = 0x16

.field public static final OP_CONST_WIDE_32:I = 0x17

.field public static final OP_CONST_WIDE_HIGH16:I = 0x19

.field public static final OP_DIV_DOUBLE:I = 0xae

.field public static final OP_DIV_DOUBLE_2ADDR:I = 0xce

.field public static final OP_DIV_FLOAT:I = 0xa9

.field public static final OP_DIV_FLOAT_2ADDR:I = 0xc9

.field public static final OP_DIV_INT:I = 0x93

.field public static final OP_DIV_INT_2ADDR:I = 0xb3

.field public static final OP_DIV_INT_LIT16:I = 0xd3

.field public static final OP_DIV_INT_LIT8:I = 0xdb

.field public static final OP_DIV_LONG:I = 0x9e

.field public static final OP_DIV_LONG_2ADDR:I = 0xbe

.field public static final OP_DOUBLE_TO_FLOAT:I = 0x8c

.field public static final OP_DOUBLE_TO_INT:I = 0x8a

.field public static final OP_DOUBLE_TO_LONG:I = 0x8b

.field public static final OP_EXECUTE_INLINE:I = 0xee
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_EXECUTE_INLINE_RANGE:I = 0xef
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_FILLED_NEW_ARRAY:I = 0x24

.field public static final OP_FILLED_NEW_ARRAY_JUMBO:I = 0x5ff

.field public static final OP_FILLED_NEW_ARRAY_RANGE:I = 0x25

.field public static final OP_FILL_ARRAY_DATA:I = 0x26

.field public static final OP_FLOAT_TO_DOUBLE:I = 0x89

.field public static final OP_FLOAT_TO_INT:I = 0x87

.field public static final OP_FLOAT_TO_LONG:I = 0x88

.field public static final OP_GOTO:I = 0x28

.field public static final OP_GOTO_16:I = 0x29

.field public static final OP_GOTO_32:I = 0x2a

.field public static final OP_IF_EQ:I = 0x32

.field public static final OP_IF_EQZ:I = 0x38

.field public static final OP_IF_GE:I = 0x35

.field public static final OP_IF_GEZ:I = 0x3b

.field public static final OP_IF_GT:I = 0x36

.field public static final OP_IF_GTZ:I = 0x3c

.field public static final OP_IF_LE:I = 0x37

.field public static final OP_IF_LEZ:I = 0x3d

.field public static final OP_IF_LT:I = 0x34

.field public static final OP_IF_LTZ:I = 0x3a

.field public static final OP_IF_NE:I = 0x33

.field public static final OP_IF_NEZ:I = 0x39

.field public static final OP_IGET:I = 0x52

.field public static final OP_IGET_BOOLEAN:I = 0x55

.field public static final OP_IGET_BOOLEAN_JUMBO:I = 0x9ff

.field public static final OP_IGET_BYTE:I = 0x56

.field public static final OP_IGET_BYTE_JUMBO:I = 0xaff

.field public static final OP_IGET_CHAR:I = 0x57

.field public static final OP_IGET_CHAR_JUMBO:I = 0xbff

.field public static final OP_IGET_JUMBO:I = 0x6ff

.field public static final OP_IGET_OBJECT:I = 0x54

.field public static final OP_IGET_OBJECT_JUMBO:I = 0x8ff

.field public static final OP_IGET_OBJECT_QUICK:I = 0xf4
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_IGET_QUICK:I = 0xf2
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_IGET_SHORT:I = 0x58

.field public static final OP_IGET_SHORT_JUMBO:I = 0xcff

.field public static final OP_IGET_WIDE:I = 0x53

.field public static final OP_IGET_WIDE_JUMBO:I = 0x7ff

.field public static final OP_IGET_WIDE_QUICK:I = 0xf3
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_IGET_WIDE_VOLATILE:I = 0xe8
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_INSTANCE_OF:I = 0x20

.field public static final OP_INSTANCE_OF_JUMBO:I = 0x2ff

.field public static final OP_INT_TO_BYTE:I = 0x8d

.field public static final OP_INT_TO_CHAR:I = 0x8e

.field public static final OP_INT_TO_DOUBLE:I = 0x83

.field public static final OP_INT_TO_FLOAT:I = 0x82

.field public static final OP_INT_TO_LONG:I = 0x81

.field public static final OP_INT_TO_SHORT:I = 0x8f

.field public static final OP_INVOKE_DIRECT:I = 0x70

.field public static final OP_INVOKE_DIRECT_EMPTY:I = 0xf0
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_INVOKE_DIRECT_JUMBO:I = 0x24ff

.field public static final OP_INVOKE_DIRECT_RANGE:I = 0x76

.field public static final OP_INVOKE_INTERFACE:I = 0x72

.field public static final OP_INVOKE_INTERFACE_JUMBO:I = 0x26ff

.field public static final OP_INVOKE_INTERFACE_RANGE:I = 0x78

.field public static final OP_INVOKE_STATIC:I = 0x71

.field public static final OP_INVOKE_STATIC_JUMBO:I = 0x25ff

.field public static final OP_INVOKE_STATIC_RANGE:I = 0x77

.field public static final OP_INVOKE_SUPER:I = 0x6f

.field public static final OP_INVOKE_SUPER_JUMBO:I = 0x23ff

.field public static final OP_INVOKE_SUPER_QUICK:I = 0xfa
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_INVOKE_SUPER_QUICK_RANGE:I = 0xfb
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_INVOKE_SUPER_RANGE:I = 0x75

.field public static final OP_INVOKE_VIRTUAL:I = 0x6e

.field public static final OP_INVOKE_VIRTUAL_JUMBO:I = 0x22ff

.field public static final OP_INVOKE_VIRTUAL_QUICK:I = 0xf8
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_INVOKE_VIRTUAL_QUICK_RANGE:I = 0xf9
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_INVOKE_VIRTUAL_RANGE:I = 0x74

.field public static final OP_IPUT:I = 0x59

.field public static final OP_IPUT_BOOLEAN:I = 0x5c

.field public static final OP_IPUT_BOOLEAN_JUMBO:I = 0x10ff

.field public static final OP_IPUT_BYTE:I = 0x5d

.field public static final OP_IPUT_BYTE_JUMBO:I = 0x11ff

.field public static final OP_IPUT_CHAR:I = 0x5e

.field public static final OP_IPUT_CHAR_JUMBO:I = 0x12ff

.field public static final OP_IPUT_JUMBO:I = 0xdff

.field public static final OP_IPUT_OBJECT:I = 0x5b

.field public static final OP_IPUT_OBJECT_JUMBO:I = 0xfff

.field public static final OP_IPUT_OBJECT_QUICK:I = 0xf7
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_IPUT_QUICK:I = 0xf5
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_IPUT_SHORT:I = 0x5f

.field public static final OP_IPUT_SHORT_JUMBO:I = 0x13ff

.field public static final OP_IPUT_WIDE:I = 0x5a

.field public static final OP_IPUT_WIDE_JUMBO:I = 0xeff

.field public static final OP_IPUT_WIDE_QUICK:I = 0xf6
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_IPUT_WIDE_VOLATILE:I = 0xe9
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_LONG_TO_DOUBLE:I = 0x86

.field public static final OP_LONG_TO_FLOAT:I = 0x85

.field public static final OP_LONG_TO_INT:I = 0x84

.field public static final OP_MONITOR_ENTER:I = 0x1d

.field public static final OP_MONITOR_EXIT:I = 0x1e

.field public static final OP_MOVE:I = 0x1

.field public static final OP_MOVE_16:I = 0x3

.field public static final OP_MOVE_EXCEPTION:I = 0xd

.field public static final OP_MOVE_FROM16:I = 0x2

.field public static final OP_MOVE_OBJECT:I = 0x7

.field public static final OP_MOVE_OBJECT_16:I = 0x9

.field public static final OP_MOVE_OBJECT_FROM16:I = 0x8

.field public static final OP_MOVE_RESULT:I = 0xa

.field public static final OP_MOVE_RESULT_OBJECT:I = 0xc

.field public static final OP_MOVE_RESULT_WIDE:I = 0xb

.field public static final OP_MOVE_WIDE:I = 0x4

.field public static final OP_MOVE_WIDE_16:I = 0x6

.field public static final OP_MOVE_WIDE_FROM16:I = 0x5

.field public static final OP_MUL_DOUBLE:I = 0xad

.field public static final OP_MUL_DOUBLE_2ADDR:I = 0xcd

.field public static final OP_MUL_FLOAT:I = 0xa8

.field public static final OP_MUL_FLOAT_2ADDR:I = 0xc8

.field public static final OP_MUL_INT:I = 0x92

.field public static final OP_MUL_INT_2ADDR:I = 0xb2

.field public static final OP_MUL_INT_LIT16:I = 0xd2

.field public static final OP_MUL_INT_LIT8:I = 0xda

.field public static final OP_MUL_LONG:I = 0x9d

.field public static final OP_MUL_LONG_2ADDR:I = 0xbd

.field public static final OP_NEG_DOUBLE:I = 0x80

.field public static final OP_NEG_FLOAT:I = 0x7f

.field public static final OP_NEG_INT:I = 0x7b

.field public static final OP_NEG_LONG:I = 0x7d

.field public static final OP_NEW_ARRAY:I = 0x23

.field public static final OP_NEW_ARRAY_JUMBO:I = 0x4ff

.field public static final OP_NEW_INSTANCE:I = 0x22

.field public static final OP_NEW_INSTANCE_JUMBO:I = 0x3ff

.field public static final OP_NOP:I = 0x0

.field public static final OP_NOT_INT:I = 0x7c

.field public static final OP_NOT_LONG:I = 0x7e

.field public static final OP_OR_INT:I = 0x96

.field public static final OP_OR_INT_2ADDR:I = 0xb6

.field public static final OP_OR_INT_LIT16:I = 0xd6

.field public static final OP_OR_INT_LIT8:I = 0xde

.field public static final OP_OR_LONG:I = 0xa1

.field public static final OP_OR_LONG_2ADDR:I = 0xc1

.field public static final OP_PACKED_SWITCH:I = 0x2b

.field public static final OP_REM_DOUBLE:I = 0xaf

.field public static final OP_REM_DOUBLE_2ADDR:I = 0xcf

.field public static final OP_REM_FLOAT:I = 0xaa

.field public static final OP_REM_FLOAT_2ADDR:I = 0xca

.field public static final OP_REM_INT:I = 0x94

.field public static final OP_REM_INT_2ADDR:I = 0xb4

.field public static final OP_REM_INT_LIT16:I = 0xd4

.field public static final OP_REM_INT_LIT8:I = 0xdc

.field public static final OP_REM_LONG:I = 0x9f

.field public static final OP_REM_LONG_2ADDR:I = 0xbf

.field public static final OP_RETURN:I = 0xf

.field public static final OP_RETURN_OBJECT:I = 0x11

.field public static final OP_RETURN_VOID:I = 0xe

.field public static final OP_RETURN_WIDE:I = 0x10

.field public static final OP_RSUB_INT:I = 0xd1

.field public static final OP_RSUB_INT_LIT8:I = 0xd9

.field public static final OP_SGET:I = 0x60

.field public static final OP_SGET_BOOLEAN:I = 0x63

.field public static final OP_SGET_BOOLEAN_JUMBO:I = 0x17ff

.field public static final OP_SGET_BYTE:I = 0x64

.field public static final OP_SGET_BYTE_JUMBO:I = 0x18ff

.field public static final OP_SGET_CHAR:I = 0x65

.field public static final OP_SGET_CHAR_JUMBO:I = 0x19ff

.field public static final OP_SGET_JUMBO:I = 0x14ff

.field public static final OP_SGET_OBJECT:I = 0x62

.field public static final OP_SGET_OBJECT_JUMBO:I = 0x16ff

.field public static final OP_SGET_SHORT:I = 0x66

.field public static final OP_SGET_SHORT_JUMBO:I = 0x1aff

.field public static final OP_SGET_WIDE:I = 0x61

.field public static final OP_SGET_WIDE_JUMBO:I = 0x15ff

.field public static final OP_SGET_WIDE_VOLATILE:I = 0xea
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_SHL_INT:I = 0x98

.field public static final OP_SHL_INT_2ADDR:I = 0xb8

.field public static final OP_SHL_INT_LIT8:I = 0xe0

.field public static final OP_SHL_LONG:I = 0xa3

.field public static final OP_SHL_LONG_2ADDR:I = 0xc3

.field public static final OP_SHR_INT:I = 0x99

.field public static final OP_SHR_INT_2ADDR:I = 0xb9

.field public static final OP_SHR_INT_LIT8:I = 0xe1

.field public static final OP_SHR_LONG:I = 0xa4

.field public static final OP_SHR_LONG_2ADDR:I = 0xc4

.field public static final OP_SPARSE_SWITCH:I = 0x2c

.field public static final OP_SPUT:I = 0x67

.field public static final OP_SPUT_BOOLEAN:I = 0x6a

.field public static final OP_SPUT_BOOLEAN_JUMBO:I = 0x1eff

.field public static final OP_SPUT_BYTE:I = 0x6b

.field public static final OP_SPUT_BYTE_JUMBO:I = 0x1fff

.field public static final OP_SPUT_CHAR:I = 0x6c

.field public static final OP_SPUT_CHAR_JUMBO:I = 0x20ff

.field public static final OP_SPUT_JUMBO:I = 0x1bff

.field public static final OP_SPUT_OBJECT:I = 0x69

.field public static final OP_SPUT_OBJECT_JUMBO:I = 0x1dff

.field public static final OP_SPUT_SHORT:I = 0x6d

.field public static final OP_SPUT_SHORT_JUMBO:I = 0x21ff

.field public static final OP_SPUT_WIDE:I = 0x68

.field public static final OP_SPUT_WIDE_JUMBO:I = 0x1cff

.field public static final OP_SPUT_WIDE_VOLATILE:I = 0xeb
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_SUB_DOUBLE:I = 0xac

.field public static final OP_SUB_DOUBLE_2ADDR:I = 0xcc

.field public static final OP_SUB_FLOAT:I = 0xa7

.field public static final OP_SUB_FLOAT_2ADDR:I = 0xc7

.field public static final OP_SUB_INT:I = 0x91

.field public static final OP_SUB_INT_2ADDR:I = 0xb1

.field public static final OP_SUB_LONG:I = 0x9c

.field public static final OP_SUB_LONG_2ADDR:I = 0xbc

.field public static final OP_THROW:I = 0x27

.field public static final OP_THROW_VERIFICATION_ERROR:I = 0xed
    .annotation runtime Ljava/lang/Deprecated;
    .end annotation
.end field

.field public static final OP_USHR_INT:I = 0x9a

.field public static final OP_USHR_INT_2ADDR:I = 0xba

.field public static final OP_USHR_INT_LIT8:I = 0xe2

.field public static final OP_USHR_LONG:I = 0xa5

.field public static final OP_USHR_LONG_2ADDR:I = 0xc5

.field public static final OP_XOR_INT:I = 0x97

.field public static final OP_XOR_INT_2ADDR:I = 0xb7

.field public static final OP_XOR_INT_LIT16:I = 0xd7

.field public static final OP_XOR_INT_LIT8:I = 0xdf

.field public static final OP_XOR_LONG:I = 0xa2

.field public static final OP_XOR_LONG_2ADDR:I = 0xc2
