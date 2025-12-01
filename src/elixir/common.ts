import {DataType} from "../types/DataType.js";
import {ModelRegister} from "./ModelRegister.js";

export enum RegisterType {
    VIRTUAL = 'virtual',
    PARAMETER = 'parameter',
    RESULT = 'result',
    TEMPORARY = 'temporary',
    CPU='cpu',
    GPU='gpu',
}

/**
 * Représentation d'un registre
 */
export interface Register {
    type: RegisterType;
    id: number;
    dataType: DataType;
    name?: string;
}



/**
 * Types d'opérandes
 */
export enum OperandType {
    REGISTER = 'register',
    CONSTANT = 'constant',
    LABEL = 'label',
    FIELD = 'field',
    METHOD = 'method',
    TYPE = 'type'
}

/**
 * Opérande générique
 */
export interface Operand {
    type: OperandType;
}

/**
 * Opérande registre
 */
export interface RegisterOperand extends Operand {
    type: OperandType.REGISTER;
    register: ModelRegister;
}

/**
 * Opérande constante
 */
export interface ConstantOperand extends Operand {
    type: OperandType.CONSTANT;
    value: number | string | boolean | null;
    dataType: DataType;
}

/**
 * Opérande label (pour les branches)
 */
export interface LabelOperand extends Operand {
    type: OperandType.LABEL;
    label: string;
}

/**
 * Opérande champ
 */
export interface FieldOperand extends Operand {
    type: OperandType.FIELD;
    className: string;
    fieldName: string;
    fieldType: DataType;
}

/**
 * Opérande méthode
 */
export interface MethodOperand extends Operand {
    type: OperandType.METHOD;
    className: string;
    methodName: string;
    signature: string;
    returnType: DataType;
}

/**
 * Opérande type
 */
export interface TypeOperand extends Operand {
    type: OperandType.TYPE;
    typeName: string;
}



/**
 * Catégories d'opérations RTL
 * Basées sur Ghidra P-Code, GCC RTL, LLVM IR et autres IR modernes
 */
export enum ElixirOperationCategory {


    // Catégories existantes
    ASSIGNMENT = 'assignment',

    ARITHMETIC = 'arithmetic',
    LOGICAL = 'logical',
    COMPARISON = 'comparison',
    BRANCH = 'branch',
    MEMORY = 'memory',
    METHOD = 'method',
    CONVERSION = 'conversion',
    OBJECT = 'object',
    ARRAY = 'array',
    EXCEPTION = 'exception',
    MONITOR = 'monitor',

    // Catégories additionnelles pour décompilateur multi-langage

    /**
     * Opérations de contrôle de flux avancé
     * - switch/case multi-branch
     * - computed goto
     * - indirect calls
     */
    CONTROL_FLOW = 'control_flow',

    /**
     * Opérations sur les pointeurs
     * - pointer arithmetic
     * - address calculation
     * - reference/dereference
     * - pointer comparison
     */
    POINTER = 'pointer',

    /**
     * Opérations bit-level
     * - bit extraction
     * - bit insertion
     * - bit counting (popcount, clz, ctz)
     * - byte swap
     */
    BITWISE = 'bitwise',

    /**
     * Opérations de chargement/stockage atomique
     * - atomic read/write
     * - compare-and-swap
     * - memory barriers
     * - fence operations
     */
    ATOMIC = 'atomic',

    /**
     * Opérations SIMD/Vectorielles
     * - vector operations
     * - packed operations
     * - shuffle/permute
     */
    VECTOR = 'vector',

    /**
     * Opérations sur la pile (stack)
     * - push/pop
     * - stack allocation (alloca)
     * - stack frame manipulation
     */
    STACK = 'stack',

    /**
     * Opérations sur les structures/records
     * - field access
     * - structure copy
     * - aggregate operations
     */
    AGGREGATE = 'aggregate',

    /**
     * Opérations d'introspection/métadonnées
     * - type information
     * - reflection
     * - runtime type checking
     */
    INTROSPECTION = 'introspection',

    /**
     * Opérations de gestion mémoire
     * - allocation (malloc, new)
     * - deallocation (free, delete)
     * - garbage collection hints
     */
    MEMORY_MANAGEMENT = 'memory_management',

    /**
     * Opérations de synchronisation
     * - semaphores
     * - mutexes
     * - condition variables
     * - barriers
     */
    SYNCHRONIZATION = 'synchronization',

    /**
     * Opérations de manipulation de strings
     * - string concatenation
     * - string comparison
     * - string length
     */
    STRING = 'string',

    /**
     * Opérations inline assembly
     * - asm blocks
     * - volatile operations
     * - architecture-specific ops
     */
    INLINE_ASM = 'inline_asm',

    /**
     * Opérations de prédicat (pour architectures avec prédication)
     * - conditional execution
     * - predicate registers
     */
    PREDICATE = 'predicate',

    /**
     * Opérations phi et sigma (SSA form)
     * - phi nodes (merges)
     * - sigma nodes (splits)
     * - pi nodes (type refinement)
     */
    SSA = 'ssa',

    /**
     * Opérations de prologue/épilogue
     * - function entry setup
     * - function exit cleanup
     * - calling convention setup
     */
    PROLOGUE_EPILOGUE = 'prologue_epilogue',

    /**
     * Opérations de debugging/instrumentation
     * - breakpoints
     * - trace points
     * - debug info
     */
    DEBUG = 'debug',

    /**
     * Opérations de profilage
     * - counters
     * - timers
     * - coverage
     */
    PROFILING = 'profiling',

    /**
     * Opérations de validation/vérification
     * - assertions
     * - bounds checking
     * - null checks
     * - overflow detection
     */
    VALIDATION = 'validation',

    /**
     * Opérations mathématiques étendues
     * - trigonometric functions
     * - transcendental functions
     * - min/max/abs
     */
    MATH_EXTENDED = 'math_extended',

    /**
     * Opérations de manipulation de régions mémoire
     * - memcpy, memset, memmove
     * - bulk operations
     */
    BULK_MEMORY = 'bulk_memory',

    /**
     * Opérations de gestion de contexte
     * - coroutines
     * - continuations
     * - setjmp/longjmp
     */
    CONTEXT = 'context',

    /**
     * Opérations spécifiques à la plateforme
     * - system calls
     * - privileged instructions
     * - I/O operations
     */
    PLATFORM = 'platform',

    /**
     * Opérations de optimisation hints
     * - likely/unlikely branches
     * - prefetch
     * - alignment hints
     */
    HINT = 'hint',

    /**
     * Opérations non déterminées/abstraites
     * - operations not yet analyzed
     * - placeholder operations
     */
    UNKNOWN = 'unknown',

    /**
     * Opérations sans effet (pour analyses)
     * - nop
     * - metadata only
     */
    METADATA = 'metadata'
}


export enum ElixirOpcode {
    // =============================================
    // TRANSFERT DE DONNÉES
    // =============================================

    /**
     * COPY: dest = src
     * Copie de valeur entre registres
     * La taille est déterminée par le type des registres
     */
    COPY = 'copy',

    /**
     * LOAD_CONST: dest = immediate
     * Chargement d'une constante
     */
    LOAD_CONST = 'load_const',


    /**
     * LOAD_FIELD: obj.field = immediate
     * Chargement d'une constante
     */
    LOAD_FIELD = 'load_field',

    /**
     * LOAD: dest = [address]
     * Lecture mémoire abstraite
     */
    LOAD = 'load',

    /**
     * STORE: [address] = src
     * Écriture mémoire abstraite
     */
    STORE = 'store',

    /**
     * ADDRESS: dest = &symbol
     * Calcul d'adresse
     */
    ADDRESS = 'address',

    // =============================================
    // ARITHMÉTIQUE ABSTRAITE
    // =============================================

    /**
     * ADD: dest = left + right
     * Addition abstraite (entiers ou flottants selon les types)
     */
    ADD = 'add',

    SUB = 'sub',
    MUL = 'mul',
    DIV = 'div',        // Division (signée ou non selon le type)
    REM = 'rem',        // Reste/Modulo
    NEG = 'neg',        // Négation

    // =============================================
    // LOGIQUE ABSTRAITE
    // =============================================

    AND = 'and',
    OR = 'or',
    XOR = 'xor',
    NOT = 'not',

    /**
     * SHIFT: dest = src shift amount
     * Direction et type (logique/arithmétique) dans les métadonnées
     */
    SHIFT = 'shift',

    // =============================================
    // COMPARAISON ABSTRAITE
    // =============================================

    /**
     * COMPARE: dest = compare(left, right)
     * Résultat: valeur sémantique (pas de flags processeur)
     * Le type de comparaison est dans les métadonnées
     */
    COMPARE = 'compare',

    // =============================================
    // CONTRÔLE DE FLUX
    // =============================================

    /**
     * BRANCH: if (condition) goto target
     * Branchement conditionnel abstrait
     */
    BRANCH = 'branch',

    /**
     * JUMP: goto target
     * Branchement inconditionnel
     */
    JUMP = 'jump',

    /**
     * CALL: [dest =] call(function, args...)
     * Appel de fonction abstrait
     */
    CALL = 'call',

    /**
     * RETURN: return [value]
     * Retour de fonction
     */
    RETURN = 'return',

    /**
     * SELECT: dest = condition ? true_val : false_val
     * Sélection conditionnelle (ternaire)
     */
    SELECT = 'select',

    // =============================================
    // CONVERSION DE TYPES
    // =============================================

    /**
     * CONVERT: dest = convert(src, target_type)
     * Conversion de type abstraite
     * Type source et destination dans les métadonnées
     */
    CONVERT = 'convert',

    /**
     * BITCAST: dest = bitcast(src)
     * Réinterprétation de bits sans conversion
     */
    BITCAST = 'bitcast',

    // =============================================
    // EXCEPTIONS
    // =============================================

    THROW = 'throw',
    CATCH = 'catch',

    // =============================================
    // AGRÉGATS
    // =============================================

    /**
     * EXTRACT: dest = aggregate[index]
     * Extraction d'un élément
     */
    EXTRACT = 'extract',

    /**
     * INSERT: aggregate[index] = value
     * Insertion d'un élément
     */
    INSERT = 'insert',

    // =============================================
    // PHI (SSA)
    // =============================================

    PHI = 'phi',

    // =============================================
    // INTRINSICS
    // =============================================

    /**
     * INTRINSIC: appel d'une fonction intrinsèque
     * Le nom de l'intrinsèque est dans les métadonnées
     */
    INTRINSIC = 'intrinsic',

    // =============================================
    // MÉTA
    // =============================================

    NOP = 'nop',
    UNREACHABLE = 'unreachable',
    DEBUG = 'debug'
}

/**
 * Types d'opérations RTL
 */
export enum OLD_ElixirOpcode {
    // Assignment
    MOVE = 'move',
    MOVE_WIDE = 'move_wide',
    MOVE_OBJECT = 'move_object',

    // Arithmetic
    ADD = 'add',
    SUB = 'sub',
    MUL = 'mul',
    DIV = 'div',
    REM = 'rem',
    NEG = 'neg',

    // Logical
    AND = 'and',
    OR = 'or',
    XOR = 'xor',
    NOT = 'not',
    SHL = 'shl',  // Shift left
    SHR = 'shr',  // Shift right
    USHR = 'ushr', // Unsigned shift right

    // Comparison
    CMP = 'cmp',
    CMPL = 'cmpl',
    CMPG = 'cmpg',

    // Branch
    GOTO = 'goto',
    IF_EQ = 'if_eq',
    IF_NE = 'if_ne',
    IF_LT = 'if_lt',
    IF_GE = 'if_ge',
    IF_GT = 'if_gt',
    IF_LE = 'if_le',
    IF_EQZ = 'if_eqz',
    IF_NEZ = 'if_nez',
    IF_LTZ = 'if_ltz',
    IF_GEZ = 'if_gez',
    IF_GTZ = 'if_gtz',
    IF_LEZ = 'if_lez',

    // Memory access
    LOAD = 'load',
    STORE = 'store',
    LOAD_FIELD = 'load_field',
    STORE_FIELD = 'store_field',
    LOAD_STATIC = 'load_static',
    STORE_STATIC = 'store_static',

    // Array
    ARRAY_LENGTH = 'array_length',
    ARRAY_GET = 'array_get',
    ARRAY_PUT = 'array_put',
    NEW_ARRAY = 'new_array',
    FILLED_NEW_ARRAY = 'filled_new_array',

    // Method calls
    INVOKE_VIRTUAL = 'invoke_virtual',
    INVOKE_SUPER = 'invoke_super',
    INVOKE_DIRECT = 'invoke_direct',
    INVOKE_STATIC = 'invoke_static',
    INVOKE_INTERFACE = 'invoke_interface',

    // Return
    RETURN = 'return',
    RETURN_VOID = 'return_void',

    // Object
    NEW_INSTANCE = 'new_instance',
    CHECK_CAST = 'check_cast',
    INSTANCE_OF = 'instance_of',

    // Conversion
    CONVERT = 'convert',

    // Exception
    THROW = 'throw',

    // Monitor (synchronization)
    MONITOR_ENTER = 'monitor_enter',
    MONITOR_EXIT = 'monitor_exit',

    // Special
    NOP = 'nop',
    CONST = 'const',


    /*
    CAN_CONTINUE: 1, // 0
    CAN_THROW: 1 << 1, // 1
    CAN_INITIALIZE_REFERENCE: 1 << 2, // 2
    SETS_REGISTER: 1 << 3, // 3
    SETS_WIDE_REGISTER: 1 << 4, // 4
    STATIC_CALL: 1 << 5,
    SETS_RESULT: 1 << 6,
    STATIC_FIELD_ACCESSOR: 1 << 7,
    */

    // CONTROL_FLOW
    SWITCH = 'switch',              // Multi-way branch
    INDIRECT_JUMP = 'indirect_jump', // Jump via register/memory
    INDIRECT_CALL = 'indirect_call', // Call via function pointer
    COMPUTED_GOTO = 'computed_goto', // Computed jump target
    TAIL_CALL = 'tail_call',        // Tail call optimization

    // POINTER
    PTR_ADD = 'ptr_add',            // Pointer arithmetic
    PTR_SUB = 'ptr_sub',
    PTR_DIFF = 'ptr_diff',          // Difference between pointers
    ADDRESS_OF = 'address_of',      // & operator
    DEREFERENCE = 'dereference',    // * operator
    PTR_TO_INT = 'ptr_to_int',      // Cast pointer to int
    INT_TO_PTR = 'int_to_ptr',      // Cast int to pointer

    // BITWISE
    BIT_EXTRACT = 'bit_extract',    // Extract bits
    BIT_INSERT = 'bit_insert',      // Insert bits
    BIT_FIELD = 'bit_field',        // Bit field access
    POPCOUNT = 'popcount',          // Count set bits
    CLZ = 'clz',                    // Count leading zeros
    CTZ = 'ctz',                    // Count trailing zeros
    BSWAP = 'bswap',                // Byte swap
    REVERSE_BITS = 'reverse_bits',  // Reverse bit order
    ROTATE_LEFT = 'rotate_left',    // Rotate left
    ROTATE_RIGHT = 'rotate_right',  // Rotate right

    // ATOMIC
    ATOMIC_LOAD = 'atomic_load',
    ATOMIC_STORE = 'atomic_store',
    ATOMIC_CAS = 'atomic_cas',      // Compare-and-swap
    ATOMIC_ADD = 'atomic_add',
    ATOMIC_SUB = 'atomic_sub',
    ATOMIC_AND = 'atomic_and',
    ATOMIC_OR = 'atomic_or',
    ATOMIC_XOR = 'atomic_xor',
    ATOMIC_EXCHANGE = 'atomic_exchange',
    FENCE = 'fence',                // Memory fence
    BARRIER = 'barrier',            // Memory barrier

    // VECTOR
    VECTOR_LOAD = 'vector_load',
    VECTOR_STORE = 'vector_store',
    VECTOR_ADD = 'vector_add',
    VECTOR_SUB = 'vector_sub',
    VECTOR_MUL = 'vector_mul',
    VECTOR_DIV = 'vector_div',
    SHUFFLE = 'shuffle',            // Vector shuffle
    PERMUTE = 'permute',            // Vector permute
    BROADCAST = 'broadcast',        // Broadcast scalar to vector
    EXTRACT_ELEMENT = 'extract_element', // Extract vector element
    INSERT_ELEMENT = 'insert_element',   // Insert vector element

    // STACK
    PUSH = 'push',
    POP = 'pop',
    ALLOCA = 'alloca',              // Stack allocation
    ADJUST_STACK = 'adjust_stack',  // Stack pointer adjustment
    FRAME_ADDR = 'frame_addr',      // Frame pointer address

    // AGGREGATE
    EXTRACT_VALUE = 'extract_value', // Extract from aggregate
    INSERT_VALUE = 'insert_value',   // Insert into aggregate
    STRUCT_COPY = 'struct_copy',     // Structure copy
    UNION_CAST = 'union_cast',       // Union type cast
    AGGREGATE_INIT = 'aggregate_init', // Initialize aggregate

    // INTROSPECTION
    TYPEOF = 'typeof',               // Get type
    INSTANCEOF = 'instanceof',       // Type check (already exists)
    VTABLE_LOOKUP = 'vtable_lookup', // Virtual table lookup
    INTERFACE_LOOKUP = 'interface_lookup',
    REFLECTION_CALL = 'reflection_call',

    // MEMORY_MANAGEMENT
    MALLOC = 'malloc',
    CALLOC = 'calloc',
    REALLOC = 'realloc',
    FREE = 'free',
    NEW = 'new',
    DELETE = 'delete',
    GC_ALLOC = 'gc_alloc',
    GC_BARRIER = 'gc_barrier',

    // SYNCHRONIZATION
    MUTEX_LOCK = 'mutex_lock',
    MUTEX_UNLOCK = 'mutex_unlock',
    SEMAPHORE_WAIT = 'semaphore_wait',
    SEMAPHORE_POST = 'semaphore_post',
    COND_WAIT = 'cond_wait',
    COND_SIGNAL = 'cond_signal',
    SPIN_LOCK = 'spin_lock',
    SPIN_UNLOCK = 'spin_unlock',

    // STRING
    STRING_CONCAT = 'string_concat',
    STRING_LENGTH = 'string_length',
    STRING_COMPARE = 'string_compare',
    STRING_SLICE = 'string_slice',
    STRING_CHAR_AT = 'string_char_at',

    // INLINE_ASM
    INLINE_ASM = 'inline_asm',
    VOLATILE_LOAD = 'volatile_load',
    VOLATILE_STORE = 'volatile_store',

    // PREDICATE
    PRED_SET = 'pred_set',          // Set predicate
    PRED_AND = 'pred_and',          // Combine predicates
    PRED_OR = 'pred_or',
    PRED_NOT = 'pred_not',

    // SSA
    PHI = 'phi',                    // Already exists
    SIGMA = 'sigma',                // Path-sensitive split
    PI = 'pi',                      // Type refinement

    // PROLOGUE_EPILOGUE
    PROLOGUE = 'prologue',
    EPILOGUE = 'epilogue',
    SAVE_REGS = 'save_regs',
    RESTORE_REGS = 'restore_regs',

    // DEBUG
    BREAKPOINT = 'breakpoint',
    DEBUG_TRAP = 'debug_trap',
    DEBUG_DECLARE = 'debug_declare', // Debug variable declaration
    DEBUG_VALUE = 'debug_value',     // Debug value annotation

    // PROFILING
    PROFILE_COUNT = 'profile_count',
    PROFILE_TIMESTAMP = 'profile_timestamp',

    // VALIDATION
    ASSERT = 'assert',
    BOUNDS_CHECK = 'bounds_check',
    NULL_CHECK = 'null_check',
    OVERFLOW_CHECK = 'overflow_check',
    DIV_ZERO_CHECK = 'div_zero_check',

    // MATH_EXTENDED
    ABS = 'abs',
    MIN = 'min',
    MAX = 'max',
    SQRT = 'sqrt',
    SIN = 'sin',
    COS = 'cos',
    TAN = 'tan',
    EXP = 'exp',
    LOG = 'log',
    POW = 'pow',
    CEIL = 'ceil',
    FLOOR = 'floor',
    ROUND = 'round',
    FMA = 'fma',                    // Fused multiply-add

    // BULK_MEMORY
    MEMCPY = 'memcpy',
    MEMSET = 'memset',
    MEMMOVE = 'memmove',
    MEMCMP = 'memcmp',
    BULK_COPY = 'bulk_copy',

    // CONTEXT
    SETJMP = 'setjmp',
    LONGJMP = 'longjmp',
    YIELD = 'yield',                // Coroutine yield
    RESUME = 'resume',              // Coroutine resume
    SUSPEND = 'suspend',            // Suspend execution

    // PLATFORM
    SYSCALL = 'syscall',
    CPUID = 'cpuid',
    RDTSC = 'rdtsc',                // Read time stamp counter
    IO_READ = 'io_read',
    IO_WRITE = 'io_write',

    // HINT
    LIKELY = 'likely',              // Branch likely taken
    UNLIKELY = 'unlikely',          // Branch unlikely taken
    PREFETCH = 'prefetch',          // Prefetch data
    ASSUME = 'assume',              // Optimization assumption
    BUILTIN_EXPECT = 'builtin_expect',

    // METADATA
    LABEL = 'label',                // Code label
    ANNOTATION = 'annotation',      // Code annotation
    LOCATION = 'location',          // Source location
    INLINE_MARKER = 'inline_marker', // Inlining boundary

    // UNKNOWN/OTHER
    PLACEHOLDER = 'placeholder',    // Temporary placeholder
    EXTERNAL = 'external',          // External reference
    UNREACHABLE = 'unreachable'     // Unreachable code
}

/**
 * Classification des catégories pour différents types d'analyses
 */
export const AnalysisCategories = {
    /**
     * Catégories qui modifient le flux de contrôle
     */
    CONTROL_ALTERING: [
        ElixirOperationCategory.BRANCH,
        ElixirOperationCategory.CONTROL_FLOW,
        ElixirOperationCategory.EXCEPTION,
        ElixirOperationCategory.CONTEXT
    ],

    /**
     * Catégories qui accèdent à la mémoire
     */
    MEMORY_ACCESS: [
        ElixirOperationCategory.MEMORY,
        ElixirOperationCategory.STACK,
        ElixirOperationCategory.ATOMIC,
        ElixirOperationCategory.BULK_MEMORY,
        ElixirOperationCategory.POINTER
    ],

    /**
     * Catégories pures (sans effets de bord)
     */
    PURE: [
        ElixirOperationCategory.ARITHMETIC,
        ElixirOperationCategory.LOGICAL,
        ElixirOperationCategory.COMPARISON,
        ElixirOperationCategory.CONVERSION,
        ElixirOperationCategory.BITWISE,
        ElixirOperationCategory.MATH_EXTENDED
    ],

    /**
     * Catégories avec effets de bord
     */
    SIDE_EFFECTS: [
        ElixirOperationCategory.METHOD,
        ElixirOperationCategory.MEMORY_MANAGEMENT,
        ElixirOperationCategory.SYNCHRONIZATION,
        ElixirOperationCategory.PLATFORM,
        ElixirOperationCategory.DEBUG
    ],

    /**
     * Catégories pour optimisation
     */
    OPTIMIZABLE: [
        ElixirOperationCategory.ARITHMETIC,
        ElixirOperationCategory.LOGICAL,
        ElixirOperationCategory.BITWISE,
        ElixirOperationCategory.CONVERSION
    ],

    /**
     * Catégories critiques pour la sécurité
     */
    SECURITY_SENSITIVE: [
        ElixirOperationCategory.MEMORY_MANAGEMENT,
        ElixirOperationCategory.POINTER,
        ElixirOperationCategory.VALIDATION,
        ElixirOperationCategory.PLATFORM
    ]
};