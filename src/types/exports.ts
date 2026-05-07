import {
    ArrayType,
    BoolType, ClassRefType,
    FloatType,
    FunctionType, GenericType, InterfaceType,
    IntType, OpaqueType,
    PointerType,
    StructType,
    UnionType, UnknownType, NullType,
    VoidType
} from "./common.js";

export interface DataTypeVisitor<T> {
    visitVoid      (type: VoidType)      : T;
    visitBool      (type: BoolType)      : T;
    visitInt       (type: IntType)       : T;
    visitFloat     (type: FloatType)     : T;
    visitPointer   (type: PointerType)   : T;
    visitArray     (type: ArrayType)     : T;
    visitStruct    (type: StructType)    : T;
    visitUnion     (type: UnionType)     : T;
    visitFunction  (type: FunctionType)  : T;
    visitClassRef  (type: ClassRefType)  : T;
    visitInterface (type: InterfaceType) : T;
    visitGeneric   (type: GenericType)   : T;
    visitOpaque    (type: OpaqueType)    : T;
    visitNull      (type: NullType)      : T;
    visitUnknown   (type: UnknownType)   : T;
}


export class CTypeEmitter implements DataTypeVisitor<string> {
    visitVoid      (_: VoidType)      : string { return 'void'; }
    visitBool      (_: BoolType)      : string { return '_Bool'; }
    visitInt       (t: IntType)       : string {
        const sign = t.qualifiers.isSigned;
        switch (t.bitSize) {
            case 8  : return sign ? 'int8_t'   : 'uint8_t';
            case 16 : return sign ? 'int16_t'  : 'uint16_t';
            case 32 : return sign ? 'int32_t'  : 'uint32_t';
            case 64 : return sign ? 'int64_t'  : 'uint64_t';
            case 128: return sign ? '__int128' : 'unsigned __int128';
            default : return sign ? `int${t.bitSize}_t` : `uint${t.bitSize}_t`;
        }
    }
    visitFloat     (t: FloatType)     : string {
        switch (t.bitSize) {
            case 16 : return '__fp16';
            case 32 : return 'float';
            case 64 : return 'double';
            case 80 : return 'long double';
            case 128: return '__float128';
            default : return `float${t.bitSize}`;
        }
    }
    visitPointer   (t: PointerType)   : string { return `${t.pointee.accept(this)}*`; }
    visitArray     (t: ArrayType)     : string {
        const len = t.length !== null ? `${t.length}` : '';
        return `${t.element.accept(this)}[${len}]`;
    }
    visitStruct    (t: StructType)    : string { return `struct ${t.name}`; }
    visitUnion     (t: UnionType)     : string { return `union ${t.name}`; }
    visitFunction  (t: FunctionType)  : string {
        const params  = t.params.map(p => p.type.accept(this)).join(', ');
        const variadic = t.isVariadic ? (t.params.length ? ', ...' : '...') : '';
        return `${t.returnType.accept(this)} (*)(${params}${variadic})`;
    }
    visitClassRef  (t: ClassRefType)  : string { return `${t.descriptor}*`; }
    visitInterface (t: InterfaceType) : string { return `${t.descriptor}*`; }
    visitGeneric   (t: GenericType)   : string { return t.base.accept(this); }
    visitOpaque    (t: OpaqueType)    : string { return t.nativeName; }
    visitNull    (_: NullType)    : string { return 'void*'; }
    visitUnknown (_: UnknownType) : string { return 'void*'; }
}

export class MLIRTypeEmitter implements DataTypeVisitor<string> {
    visitVoid      (_: VoidType)      : string { return 'none'; }
    visitBool      (_: BoolType)      : string { return 'i1'; }
    visitInt       (t: IntType)       : string { return `i${t.bitSize}`; }
    visitFloat     (t: FloatType)     : string {
        switch (t.bitSize) {
            case 16  : return 'f16';
            case 32  : return 'f32';
            case 64  : return 'f64';
            case 80  : return 'f80';
            case 128 : return 'f128';
            default  : return `f${t.bitSize}`;
        }
    }
    visitPointer   (t: PointerType)   : string {
        return `!llvm.ptr<${t.pointee.accept(this)}>`;
    }
    visitArray     (t: ArrayType)     : string {
        const len = t.length ?? 0;
        return `memref<${len}x${t.element.accept(this)}>`;
    }
    visitStruct    (t: StructType)    : string {
        const fields = t.fields.map(f => f.type.accept(this)).join(', ');
        return `!llvm.struct<(${fields})>`;
    }
    visitUnion     (t: UnionType)     : string {
        // MLIR n'a pas de union natif — on prend le membre le plus large
        const largest = t.members.reduce((a, b) =>
            (a.bitSize ?? 0) >= (b.bitSize ?? 0) ? a : b
        );
        return largest.type.accept(this);
    }
    visitFunction  (t: FunctionType)  : string {
        const params = t.params.map(p => p.type.accept(this)).join(', ');
        const ret    = t.returnType.accept(this);
        return `(${params}) -> ${ret}`;
    }
    visitClassRef  (t: ClassRefType)  : string { return `!llvm.ptr<i8>`; }
    visitInterface (t: InterfaceType) : string { return `!llvm.ptr<i8>`; }
    visitGeneric   (t: GenericType)   : string { return t.base.accept(this); }
    visitOpaque    (t: OpaqueType)    : string {
        return t.bitSize ? `i${t.bitSize}` : 'i8';
    }
    visitNull    (_: NullType)    : string { return '!llvm.ptr<i8>'; }
    visitUnknown (_: UnknownType) : string { return '!llvm.ptr<i8>'; }
}

/** Visitor qui reconstruit le descriptor Dalvik */
export class DalvikDescriptorEmitter implements DataTypeVisitor<string> {
    visitVoid      (_: VoidType)      : string { return 'V'; }
    visitBool      (_: BoolType)      : string { return 'Z'; }
    visitInt       (t: IntType)       : string { return t.descriptor ?? 'I'; }
    visitFloat     (t: FloatType)     : string {
        return t.bitSize === 64 ? 'D' : 'F';
    }
    visitPointer   (_: PointerType)   : string { return 'I'; }  // ptr = int32 en Dalvik
    visitArray     (t: ArrayType)     : string {
        return `[${t.element.accept(this)}`;
    }
    visitStruct    (t: StructType)    : string { return `L${t.name};`; }
    visitUnion     (t: UnionType)     : string { return `L${t.name};`; }
    visitFunction  (_: FunctionType)  : string { return 'Ljava/lang/reflect/Method;'; }
    visitClassRef  (t: ClassRefType)  : string { return t.descriptor ?? `L${t.descriptor};`; }
    visitInterface (t: InterfaceType) : string { return t.descriptor ?? `L${t.descriptor};`; }
    visitGeneric   (t: GenericType)   : string { return t.base.accept(this); }
    visitOpaque    (t: OpaqueType)    : string { return t.descriptor ?? 'Ljava/lang/Object;'; }
    visitNull      (_: NullType)      : string { return 'Ljava/lang/Object;'; }
    visitUnknown   (_: UnknownType)   : string { return 'Ljava/lang/Object;'; }
}