import {Nullable} from "@dexcalibur/dxc-core-api";
import {DataTypeVisitor} from "./exports.js";
import {NativeBackend} from "./common.js";

export const DataTypeKind = Object.freeze({
    // primitive
    VOID      : 'void',
    BOOL      : 'bool',
    INT       : 'int',
    FLOAT     : 'float',
    // composite
    POINTER   : 'pointer',
    ARRAY     : 'array',
    STRUCT    : 'struct',
    UNION     : 'union',
    FUNCTION  : 'function',
    // objects
    CLASS_REF : 'class_ref',
    INTERFACE : 'interface',
    // generics
    GENERIC   : 'generic',
    // opaque — known by backend but not yet resolved
    OPAQUE    : 'opaque',
    NULL      : 'null',     // type null Dalvik, can be assign to any ref
    UNKNOWN   : 'unknown', // not yet infered
} as const);

export type DataTypeKind = typeof DataTypeKind[keyof typeof DataTypeKind];


export interface DataTypeQualifiers {
    isConst    : boolean;
    isVolatile : boolean;
    isSigned   : boolean;   // pertinent pour INT uniquement
    isNullable : boolean;   // pertinent pour CLASS_REF, POINTER
}

const DEFAULT_QUALIFIERS: DataTypeQualifiers = {
    isConst    : false,
    isVolatile : false,
    isSigned   : true,
    isNullable : true,
};

export interface DataTypeParams {
    id          : string;
    kind        : DataTypeKind;
    origin      : NativeBackend;
    bitSize     : number | null;
    qualifiers? : Partial<DataTypeQualifiers>;
    meta?       : Record<string, unknown>;
    descriptor? : string | null;  // descriptor Dalvik — ex: "[I", "Ljava/lang/String;"
}

export abstract class DataType
{

    /**
     * Identifiant unique dans le registre de types.
     * Format : "<origin>:<name>" ex: "dex:Ljava/lang/String;"
     *                                "r2:uint32_t"
     *                                "ghidra:StructA"
     *                                "app:com.example.MyClass"
     */
    public readonly id         : string;
    public readonly kind       : DataTypeKind;
    public readonly origin     : NativeBackend;
    public readonly bitSize    : number | null;
    public readonly qualifiers : DataTypeQualifiers;
    public readonly meta       : Record<string, unknown>;
    public readonly descriptor : string | null;  // null si non Dalvik

    /**
     * Type name
     */
    name:string;

    /**
     *
     */
    signed:boolean;

    descr:string = "";

    /**
     * Bit len
     */
    len:number;

    fmt:string;

    str = false;
    arr = false;

    // child type
    c:Nullable<DataType> = null;

    /*
     * To represent a primitive type
     * @param {string} raw_type - The raw name of the type as it can be found in Smali code
     * @param {boolean} isArray - Array flag should be TRUE if the type is an array, else FALSE
     * @constructor
     */
    /*constructor(name:string, bitLen:number, signed=false, isArray=false){
        this.name = name;
        this.len = bitLen;
        this.arr = isArray;
        this.detectFlags();
    }*/

    constructor(pParams: DataTypeParams) {
        this.id         = pParams.id;
        this.kind       = pParams.kind;
        this.origin     = pParams.origin;
        this.bitSize    = pParams.bitSize;
        this.qualifiers = { ...DEFAULT_QUALIFIERS, ...pParams.qualifiers };
        this.meta       = pParams.meta        ?? {};
        this.descriptor = pParams.descriptor  ?? null;
    }

    get byteSize(): number | null {
        return this.bitSize !== null ? Math.ceil(this.bitSize / 8) : null;
    }

    get isReference(): boolean {
        return this.kind === DataTypeKind.POINTER   ||
            this.kind === DataTypeKind.CLASS_REF ||
            this.kind === DataTypeKind.NULL;
    }

    get isPrimitive(): boolean {
        return this.kind === DataTypeKind.VOID  ||
            this.kind === DataTypeKind.BOOL  ||
            this.kind === DataTypeKind.INT   ||
            this.kind === DataTypeKind.FLOAT;
    }

    /** Vrai si le type est résolu — false pour UNKNOWN */
    get isResolved(): boolean {
        return this.kind !== DataTypeKind.UNKNOWN;
    }

    /** Vrai si le type est une référence Dalvik nullable */
    get isDalvikReference(): boolean {
        return (this.kind === DataTypeKind.CLASS_REF ||
                this.kind === DataTypeKind.INTERFACE ||
                this.kind === DataTypeKind.ARRAY     ||
                this.kind === DataTypeKind.NULL)     &&
            this.origin === 'dex';
    }

    isCompatibleWith(other: DataType): boolean {
        if (other.kind === DataTypeKind.UNKNOWN) return true;
        if (this.kind  === DataTypeKind.UNKNOWN) return true;
        if (this.kind  !== other.kind)           return false;
        if (this.bitSize !== other.bitSize)      return false;
        return true;
    }

    equals(other: DataType): boolean {
        return this.id === other.id;
    }

    toString(): string { return this.id; }


    detectFlags(){
        if(/^u[a-z0-9]+_t$/g.test(this.name) || this.name.startsWith('unsigned')){
            this.signed = true;
        }
        else if(this.name==="char *"){
            this.str = true;
        }
    }

    setChildType(pType:DataType):DataType {
        this.c = pType;
        return this;
    }

    setDescription(pDescr:string):DataType {
        this.descr = pDescr;
        return this;
    }

    /**
     *
     */
    isString():boolean {
        return this.str;
    }

    getName():string {
        return this.name;
    }

    abstract accept<T>(visitor: DataTypeVisitor<T>): T;
}