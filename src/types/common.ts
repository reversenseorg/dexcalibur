import {DataType, DataTypeKind} from "./DataType.js";
import {DataTypeVisitor} from "./exports.js";
import {INodeRef} from "../INode.js";



export enum NativeBackend {
    R2="radare2",
    GHIDRA='ghidra',
    IDA='ida',
    BINARY_NINJA='bin_binja',
    LLVM="llvm",
    DEX="dex",
    BUILTIN="builtin"
}

// ─────────────────────────────────────────────
// NullType
// ─────────────────────────────────────────────

export class NullType extends DataType {
    constructor(pOrigin:NativeBackend) {
        super({
            id         : `${pOrigin}:null`,
            kind       : DataTypeKind.NULL,
            origin     : pOrigin,
            bitSize    : 32,
            descriptor : 'N',   // not true Dalvik descriptor
        });
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitNull(this); }
}

export class UnknownType extends DataType {

    public readonly hint: string;

    /**
     * @param hint  Contexte d'origine — ex: "v3", "param_0", "return"
     *              Aide au debug et à la propagation de types
     */
    constructor(pOrigin:NativeBackend, pHint: string = '') {
        super({
            id: pHint ? `${pOrigin}:unknown:${pHint}` : `${pOrigin}:unknown`,
            kind       : DataTypeKind.UNKNOWN,
            origin     : pOrigin,
            bitSize    : null,
            descriptor : null,
        });
        this.hint = pHint;
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitUnknown(this); }
}


export class VoidType extends DataType {
    constructor(pOrigin:NativeBackend = NativeBackend.BUILTIN) {
        super({
            id: `${pOrigin}:void`,
            kind: DataTypeKind.VOID,
            origin: pOrigin,
            bitSize: 0
        });
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitVoid(this); }
}

export class BoolType extends DataType {
    constructor(pOrigin:NativeBackend = NativeBackend.BUILTIN, bitSize = 8) {
        super({ id: `${pOrigin}:bool`, kind: DataTypeKind.BOOL, origin:pOrigin, bitSize });
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitBool(this); }
}

export class IntType extends DataType {
    constructor(
        pOrigin   : NativeBackend,
        pBitSize   : number,   // 8, 16, 32, 64, 128...
        pIsSigned : boolean,
        pName : string
    ) {
        const origin   = pOrigin ?? NativeBackend.BUILTIN;
        const signed   = pIsSigned ?? true;
        const prefix   = signed ? 'i' : 'u';
        super({
            id         : `${origin}:${ pName ?? prefix+pBitSize}`,
            kind       : DataTypeKind.INT,
            origin,
            bitSize    : pBitSize,
            qualifiers : { isSigned: signed },
        });
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitInt(this); }
}

export class FloatType extends DataType {
    constructor(
        pOrigin  : NativeBackend,
        pBitSize  : number,   // 16, 32, 64, 80, 128,
        pName:string
    ) {
        const origin = pOrigin ?? NativeBackend.BUILTIN;
        super({
            id      : `${origin}:f${pBitSize}`,
            kind    : DataTypeKind.FLOAT,
            origin: origin,
            bitSize : pBitSize
        });
        this.name = pName;
    }

    accept<T>(v: DataTypeVisitor<T>): T { return v.visitFloat(this); }
}


// ─────────────────────────────────────────────
// Types composés
// ─────────────────────────────────────────────

export class PointerType extends DataType {

    public readonly pointee  : DataType;
    public readonly ptrBits  : number;   // 32 ou 64

    constructor(
        pPointee  : DataType,
        pPtrBits  : number = 64,   // 32 ou 64
        pOrigin:NativeBackend = NativeBackend.BUILTIN,
    ) {
        super({
            id      : `${pOrigin}:ptr<${pPointee.id}>`,
            kind    : DataTypeKind.POINTER,
            origin: pOrigin,
            bitSize : pPtrBits,
        });
        this.ptrBits = pPtrBits;
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitPointer(this); }
}

export class ArrayType extends DataType {

    public readonly element  : DataType;
    public readonly length   : number;

    constructor(
        pElement  : DataType,
        pLength   : number = -1,
        pOrigin:NativeBackend = NativeBackend.BUILTIN,
    ) {
        const lenStr = pLength >= -1 ? `${pLength}` : '?';
        const bitSize = pLength !== -1 && pElement.bitSize !== null
            ? pElement.bitSize * pLength
            : null;
        super({
            id      : `${pOrigin}:array<${pElement.id},${lenStr}>`,
            kind    : DataTypeKind.ARRAY,
            origin  : pOrigin,
            bitSize,
        });
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitArray(this); }
}

export interface StructField {
    name       : string;
    type       : DataType;
    bitOffset  : number | null;   // null si layout inconnu
    bitSize    : number | null;   // null si bitfield inconnu
}

export class StructType extends DataType {

    public readonly fields  : StructField[];

    constructor(
        pName    : string,
        pFields  : StructField[],
        pOrigin:NativeBackend = NativeBackend.BUILTIN,
        bitSize: number | null = null,
    ) {
        super({
            id   : `${pOrigin}:struct:${pName}`,
            kind : DataTypeKind.STRUCT,
            origin: pOrigin,
            bitSize,
        });
        this.fields = pFields;
        this.name = pName;
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitStruct(this); }
}

export class UnionType extends DataType {


    public readonly members : StructField[];

    constructor(
        pName    : string,
        pMembers : StructField[],
        pOrigin:NativeBackend = NativeBackend.BUILTIN,
        bitSize: number | null = null,
    ) {
        super({
            id   : `${pOrigin}:union:${pName}`,
            kind : DataTypeKind.UNION,
            origin: pOrigin,
            bitSize,
        });
        this.members = pMembers
        this.name = pName;
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitUnion(this); }
}

export interface FunctionParam {
    name  : string | null;
    type  : DataType;
}

export class FunctionType extends DataType {

    public readonly returnType  : DataType;
    public readonly params      : FunctionParam[];
    public readonly isVariadic  : boolean;

    constructor(
        pReturnType: DataType,
        pParams    : FunctionParam[],
        pIsVariadic: boolean = false,
        pOrigin:NativeBackend = NativeBackend.BUILTIN
    ) {
        const paramStr = pParams.map(p => p.type.id).join(',');
        super({
            id      : `${pOrigin}:fn<(${paramStr})->${pReturnType.id}>`,
            kind    : DataTypeKind.FUNCTION,
            origin: pOrigin,
            bitSize : null,
        });
        this.returnType = pReturnType;
        this.params = pParams;
        this.isVariadic = pIsVariadic;
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitFunction(this); }
}


export class ClassRefType extends DataType {

    /**
     * Référence vers le ModelClass correspondant.
     * null  → classe non encore rencontrée
     * INodeRef avec tag "discover.missing" → classe référencée mais non analysée
     */
    public readonly nodeRef : INodeRef | null;

    constructor(
        pDescriptor : string,
        pOrigin    : NativeBackend,
        pPtrBits?   : number,
        pRef?   : INodeRef | null
    ) {
        const bits   = pPtrBits ?? 32;
        super({
            id         : `${pOrigin}:ref<${pDescriptor}>`,
            kind       : DataTypeKind.CLASS_REF,
            origin     : pOrigin,
            bitSize    : bits,
            descriptor : pDescriptor,
        });
        this.nodeRef = pRef ?? null;
    }

    get isResolved(): boolean {
        return this.nodeRef !== null;
    }

    /** Nom qualifié Java — ex: "java.lang.String" */
    get qualifiedName(): string {
        return this.descriptor!
            .replace(/^L/, '')
            .replace(/;$/, '')
            .replace(/\//g, '.');
    }

    /** Nom simple — ex: "String" */
    get simpleName(): string {
        const q = this.qualifiedName;
        return q.substring(q.lastIndexOf('.') + 1);
    }

    /**
     * Retourne un nouveau ClassRefType avec le nodeRef résolu.
     * DataType étant immutable, on ne mute pas — on retourne une nouvelle instance.
     */
    withNodeRef(nodeRef: INodeRef): ClassRefType {
        return new ClassRefType(
            this.descriptor!,
            this.origin,
            this.bitSize ?? 32,
            nodeRef
        );
    }

    accept<T>(v: DataTypeVisitor<T>): T { return v.visitClassRef(this); }
}

export class InterfaceType extends DataType {


    public readonly resolved   : unknown | null = null;

    constructor(
        pDescriptor : string,
        pResolved   : unknown | null = null,
        pOrigin:NativeBackend = NativeBackend.BUILTIN,
        ptrBits = 64,
    ) {
        super({
            id      : `${pOrigin}:iface<${pDescriptor}>`,
            kind    : DataTypeKind.INTERFACE,
            origin  : pOrigin,
            bitSize : ptrBits,
            descriptor: pDescriptor
        });
        this.resolved = pResolved;
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitInterface(this); }
}



export class GenericType extends DataType {


    public readonly base       : DataType;
    public readonly typeParams : DataType[];

    constructor(
        pBase       : DataType,
        pTypeParams : DataType[],
        pOrigin:NativeBackend = NativeBackend.BUILTIN
    ) {
        const paramStr = pTypeParams.map(t => t.id).join(',');
        super({
            id      : `${pOrigin}:generic<${pBase.id}<${paramStr}>>`,
            kind    : DataTypeKind.GENERIC,
            origin: pOrigin,
            bitSize : null,
        });
        this.base = pBase;
        this.typeParams = pTypeParams;
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitGeneric(this); }
}


export class OpaqueType extends DataType {

    public readonly nativeName : string;

    constructor(
        pNativeName : string,
        pOrigin: NativeBackend,
        bitSize: number | null = null,
        meta: Record<string, unknown> = {},
    ) {
        super({
            id   : `${pOrigin}:opaque:${pNativeName}`,
            kind : DataTypeKind.OPAQUE,
            origin: pOrigin,
            bitSize,
            meta,
        });

        this.nativeName = pNativeName;
    }
    accept<T>(v: DataTypeVisitor<T>): T { return v.visitOpaque(this); }
}
