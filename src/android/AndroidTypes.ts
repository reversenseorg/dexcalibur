import {DataType} from "../types/DataType.js";


export const AndroidTypes:Record<string, DataType> = {
    F: new DataType("dalvik.float",32,true),
    D: new DataType("dalvik.double",64,false),
    C: new DataType("dalvik.char",8,true),
    V: new DataType("dalvik.void",0,true),
    B: new DataType("dalvik.byte",8,false),
    J: new DataType("dalvik.long",64,true),
    I: new DataType("dalvik.integer",32,true),
    S: new DataType("dalvik.short",16,true),
    Z: new DataType("dalvik.boolean",8,false),
    L: new DataType("dalvik.object",32,false),
    STRING: new DataType("dalvik.string",-1,false),
    ARRAY: new DataType("dalvik.array",32,false),
    UNKNOW: new DataType("dalvik.unknow",1,false),
}

