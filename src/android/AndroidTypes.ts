import {DataType} from "../types/DataType.js";
import {
    ArrayType,
    BoolType,
    ClassRefType,
    FloatType,
    IntType, NativeBackend,
    PointerType,
    UnknownType,
    VoidType
} from "../types/common.js";


export const AndroidTypes:Record<string, DataType> = {
    F: new FloatType(NativeBackend.DEX, 32, "float"),
    D: new FloatType(NativeBackend.DEX, 64, "double"),
    C: new IntType(NativeBackend.DEX, 8, true, "char"),
    V: new VoidType(NativeBackend.DEX),
    B: new IntType(NativeBackend.DEX, 8, false, "byte"),
    J: new IntType(NativeBackend.DEX, 64, false, "long"),
    I: new IntType(NativeBackend.DEX, 32, false, "integer"),
    S: new IntType(NativeBackend.DEX, 16, false, "short"),
    Z: new BoolType(NativeBackend.DEX, 8),
    L: new ClassRefType(null, NativeBackend.DEX, 32, null), // new DataType("dalvik.object",32,false),
    OBJECT: new PointerType(new ClassRefType(null, NativeBackend.DEX, 32, null), 64, NativeBackend.DEX),
    STRING: new PointerType(new ClassRefType(null, NativeBackend.DEX, 32, null), 64, NativeBackend.DEX),
    //ARRAY:  new ArrayType(null, -1, NativeBackend.DEX), //new DataType("dalvik.array",32,false, true),
    UNKNOW: new UnknownType(NativeBackend.DEX) //new DataType("dalvik.unknow",1,false),
}

