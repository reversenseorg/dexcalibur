
import {CONST} from "./CoreConst.js";
import DalvikInstructionFormat from "./DalvikInstructionFormat.js";
import * as Core from './CoreParser.js';
import {Endianness} from "./core/Endianness.js";


const LEX = Core.LEX;
const ReferenceType = CONST.OPCODE_REFTYPE;
const Format = CONST.OPCODE_FORMAT;
const OpcodeType = CONST.OPCODE_TYPE;

export type OpcodeValue = number;

enum RegType {
	PARAM= 0,
	REGISTER= 1,
	LOCAL= 2
}

LEX.REG = {
	v: RegType.LOCAL,
	p: RegType.PARAM
};

export interface ElixirOpcodeDefinition {
	/**
	 * Opcode
	 */
	byte: OpcodeValue;
	/**
	 * Endianness used to encode opcode/instructuction
	 * @type {Endianness}
	 */
	endianess?: Endianness;
	/**
	 * The type of reference, if the instruction has one
	 * @type {ReferenceType}
	 */
	reftype?:number;
	format:number;
	flag?: number;
	parse: any, //((src: string[], raw_src: string) => ModelInstruction),
	type?: number,
	valuetype?:any,
	instr:string;
	/**
	 * Type of operation to perform at runtime
	 * TODO : replace
	 */
	ope?:string;
}
 


export const OPCODE:Record<string,ElixirOpcodeDefinition> = {
	NOP:{ 
		byte:0x00, 
		instr:"nop", 
		reftype:ReferenceType.NONE, 
		format:Format.Format10x, 
		flag:OpcodeType.CAN_CONTINUE,
		
		parse: DalvikInstructionFormat.noArgs,
		type: CONST.INSTR_TYPE.NOP,
		valuetype: null 	
	},
	MOVE:{ 
		byte:0x01, 
		instr:"move", 
		reftype:ReferenceType.NONE, 
		format:Format.Format12x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 		 
	},
	MOVE_FROM16:{ 
		byte:0x02, 
		instr:"move/from16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format22x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_16:{ 
		byte:0x03, 
		instr:"move/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format32x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_WIDE:{ 
		byte:0x04, 
		instr:"move-wide", 
		reftype:ReferenceType.NONE, 
		format:Format.Format12x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_WIDE_FROM16:{ 
		byte:0x05, 
		instr:"move-wide/from16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format22x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_WIDE_16:{ 
		byte:0x06, 
		instr:"move-wide/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format32x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_OBJECT:{ 
		byte:0x07, 
		instr:"move-object", 
		reftype:ReferenceType.NONE, 
		format:Format.Format12x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER ,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null
	},
	MOVE_OBJECT_FROM16:{ 
		byte:0x08, 
		instr:"move-object/from16", 
		reftype: ReferenceType.NONE, 
		format: Format.Format22x, 
		flag: OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null
	},
	MOVE_OBJECT_16:{ 
		byte:0x09, 
		instr:"move-object/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format32x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_RESULT:{ 
		byte:0x0a, 
		instr:"move-result", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.MOVE_RESULT,
		valuetype: null  
	},
	MOVE_RESULT_WIDE:{ 
		byte:0x0b, 
		instr:"move-result-wide", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER,

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.MOVE_RESULT,
		valuetype: null  
	},
	MOVE_RESULT_OBJECT:{ 
		byte:0x0c,
		instr:"move-result-object", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.MOVE_RESULT,
		valuetype: null  
	},
	MOVE_EXCEPTION:{
		byte:0x0d, 
		instr:"move-exception", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.MOVE_EXCPT,
		valuetype: null  
	},

	// --------------------------------------------------------------------------
	RETURN_VOID:{ 
		byte:0x0e, 
		instr:"return-void", 
		reftype: ReferenceType.NONE, 
		format: Format.Format10x, 

		parse: DalvikInstructionFormat.noArgs,
		type: CONST.INSTR_TYPE.RET,
		valuetype: null   
	},
	RETURN:{ 
		byte:0x0f, 
		instr:"return", 
		reftype: ReferenceType.NONE, 
		format: Format.Format11x, 

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.RET,
		valuetype: null    
	},
	RETURN_WIDE:{ 
		byte:0x10, 
		instr:"return-wide", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.RET,
		valuetype: null    
	},
	RETURN_OBJECT:{ 
		byte:0x11, 
		instr:"return-object", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.RET,
		valuetype: null    
	},
	
	// --------------------------------------------------------------------------
	CONST_4:{ 
		byte:0x12, 
		instr:"const/4", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11n, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	},
	CONST_16:{ 
		byte:0x13, 
		instr:"const/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format21s, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null      },
	CONST:{ 
		byte:0x14, 
		instr:"const", 
		reftype:ReferenceType.NONE, 
		format:Format.Format31i, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_HIGH16:{ 
		byte:0x15, 
		instr:"const/high16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format21ih, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,

		parse: DalvikInstructionFormat.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_WIDE_16:{ 
		byte:0x16, 
		instr:"const-wide/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format21s, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER,

		parse: DalvikInstructionFormat.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_WIDE_32:{ 
		byte:0x17, 
		instr:"const-wide/32", 
		reftype:ReferenceType.NONE, 
		format:Format.Format31i, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER,

		parse: DalvikInstructionFormat.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_WIDE:{ 
		byte:0x18, 
		instr:"const-wide", 
		reftype:ReferenceType.NONE, 
		format:Format.Format51l, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER,

		parse: DalvikInstructionFormat.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_WIDE_HIGH16:{ 
		byte:0x19, 
		instr:"const-wide/high16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format21lh, 
		flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER,

		parse: DalvikInstructionFormat.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_STRING:{ 
		byte:	0x1a, 
		instr:	"const-string", 
		reftype:	ReferenceType.STRING, 
		format:	Format.Format21c, 
		flag:	OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,
	
		parse: DalvikInstructionFormat.setstring,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null, 		
	},
	CONST_STRING_JUMBO:{ 
		byte:	0x1b, 
		instr:	"const-string/jumbo", 
		reftype:	ReferenceType.STRING, 
		format:	Format.Format31c, 
		flag:	OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,
		
		
		parse: DalvikInstructionFormat.setstring,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null,
	},
	CONST_CLASS:{ 
		byte:0x1c, 
		instr:"const-class", 
		reftype: ReferenceType.TYPE, 
		format:Format.Format21c, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER,
		
		parse: DalvikInstructionFormat.setclass,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null
	},

	// ------------------ MONITOR ------------------------------
	MONITOR_ENTER:{ 
		byte:0x1d, 
		instr:"monitor-enter", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE,

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.MONITOR,
		valuetype: null     
	},
	MONITOR_EXIT:{ 
		byte:0x1e, 
		instr:"monitor-exit", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE,

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.MONITOR,
		valuetype: null     
	},
	
	CHECK_CAST:{ byte:0x1f, instr:"check-cast", parse: DalvikInstructionFormat.format21c, type: CONST.INSTR_TYPE.CLASS_CHECK, reftype:ReferenceType.TYPE, format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	INSTANCE_OF:{ byte:0x20, instr:"instance-of", parse: DalvikInstructionFormat.format22c, type: CONST.INSTR_TYPE.CLASS_CHECK, reftype:ReferenceType.TYPE, format:Format.Format22c, flag:/* OpcodeType.CAN_THROW |*/ OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	
	ARRAY_LENGTH:{ byte:0x21, instr:"array-length", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.ARRAY_LENGTH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	
	NEW_INSTANCE:{ byte:0x22, instr:"new-instance", parse: DalvikInstructionFormat.format21c, type: CONST.INSTR_TYPE.NEW,reftype:ReferenceType.TYPE, format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	NEW_ARRAY:{ byte:0x23, instr:"new-array", parse: DalvikInstructionFormat.format22c, type: CONST.INSTR_TYPE.NEW,reftype:ReferenceType.TYPE, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	
	FILLED_NEW_ARRAY:{ byte:0x24, instr:"filled-new-array", parse: DalvikInstructionFormat.format22c, type: CONST.INSTR_TYPE.NEW,reftype:ReferenceType.TYPE, format:Format.Format35c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT },
	
	// TODO
	FILLED_NEW_ARRAY_RANGE:{ byte:0x25, instr:"filled-new-array/range", parse: DalvikInstructionFormat.format22c,  reftype:ReferenceType.TYPE, format:Format.Format3rc, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT },
	
	// utilise des tags :array_XX
	// fill-array-data v0, :array_0
	FILL_ARRAY_DATA:{ byte:0x26, instr:"fill-array-data", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype:ReferenceType.NONE, format:Format.Format31t, flag:OpcodeType.CAN_CONTINUE },
	
	THROW:{ 
		byte:0x27, 
		instr:"throw", 
		reftype:  ReferenceType.NONE, 
		format: Format.Format11x, 
		flag: OpcodeType.CAN_THROW,

		parse: DalvikInstructionFormat.singleArgs,
		type: CONST.INSTR_TYPE.MONITOR,
		valuetype: null     
	},


	// --------------------------------- GOTO ---------------------------------------------------
	// utilise des tags :goto_XX
	// goto :goto_XX
	GOTO:{ byte:0x28, instr:"goto", parse: DalvikInstructionFormat.onlyTagged, type: CONST.INSTR_TYPE.GOTO, reftype:ReferenceType.NONE, format:Format.Format10t },
	GOTO_16:{ byte:0x29, instr:"goto/16", parse: DalvikInstructionFormat.onlyTagged, type: CONST.INSTR_TYPE.GOTO, reftype:ReferenceType.NONE, format:Format.Format20t },
	GOTO_32:{ byte:0x2a, instr:"goto/32", parse: DalvikInstructionFormat.onlyTagged, type: CONST.INSTR_TYPE.GOTO, reftype:ReferenceType.NONE, format:Format.Format30t },

	// --------------------------------- SWITCH CONDITION ---------------------------------------
	PACKED_SWITCH:{ byte:0x2b, instr:"packed-switch", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.SWITCH, reftype:ReferenceType.NONE, format:Format.Format31t, flag:OpcodeType.CAN_CONTINUE },
	SPARSE_SWITCH:{ byte:0x2c, instr:"sparse-switch", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.SWITCH, reftype:ReferenceType.NONE, format:Format.Format31t, flag:OpcodeType.CAN_CONTINUE },

	// --------------------------------- COMPARISON ---------------------------------------------
	CMPL_FLOAT:{ byte:0x2d, instr:"cmpl-float", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	CMPG_FLOAT:{ byte:0x2e, instr:"cmpg-float", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	CMPL_DOUBLE:{ byte:0x2f, instr:"cmpl-double", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	CMPG_DOUBLE:{ byte:0x30, instr:"cmpg-double", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	CMP_LONG:{ byte:0x31, instr:"cmp-long", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },

	// --------------------------------- IF CONDITION --------------------------------------------
	IF_EQ:{ byte:0x32, instr:"if-eq", parse: DalvikInstructionFormat.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:OpcodeType.CAN_CONTINUE },
	IF_NE:{ byte:0x33, instr:"if-ne", parse: DalvikInstructionFormat.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:OpcodeType.CAN_CONTINUE },
	IF_LT:{ byte:0x34, instr:"if-lt", parse: DalvikInstructionFormat.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:OpcodeType.CAN_CONTINUE },
	IF_GE:{ byte:0x35, instr:"if-ge", parse: DalvikInstructionFormat.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:OpcodeType.CAN_CONTINUE },
	IF_GT:{ byte:0x36, instr:"if-gt", parse: DalvikInstructionFormat.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:OpcodeType.CAN_CONTINUE },
	IF_LE:{ byte:0x37, instr:"if-le", parse: DalvikInstructionFormat.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:OpcodeType.CAN_CONTINUE },
	IF_EQZ:{ byte:0x38, instr:"if-eqz", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:OpcodeType.CAN_CONTINUE },
	IF_NEZ:{ byte:0x39, instr:"if-nez", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:OpcodeType.CAN_CONTINUE },
	IF_LTZ:{ byte:0x3a, instr:"if-ltz", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:OpcodeType.CAN_CONTINUE },
	IF_GEZ:{ byte:0x3b, instr:"if-gez", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:OpcodeType.CAN_CONTINUE },
	IF_GTZ:{ byte:0x3c, instr:"if-gtz", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:OpcodeType.CAN_CONTINUE },
	IF_LEZ:{ byte:0x3d, instr:"if-lez", parse: DalvikInstructionFormat.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:OpcodeType.CAN_CONTINUE },

	// --------------------------------- ARRAY OPE ----------------------------------------------
	AGET:{ byte:0x44, instr:"aget", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AGET_WIDE:{ byte:0x45, instr:"aget-wide", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	AGET_OBJECT:{ byte:0x46, instr:"aget-object", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AGET_BOOLEAN:{ byte:0x47, instr:"aget-boolean", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AGET_BYTE:{ byte:0x48, instr:"aget-byte", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AGET_CHAR:{ byte:0x49, instr:"aget-char", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AGET_SHORT:{ byte:0x4a, instr:"aget-short", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	APUT:{ byte:0x4b, instr:"aput", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	APUT_WIDE:{ byte:0x4c, instr:"aput-wide", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	APUT_OBJECT:{ byte:0x4d, instr:"aput-object", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	APUT_BOOLEAN:{ byte:0x4e, instr:"aput-boolean", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	APUT_BYTE:{ byte:0x4f, instr:"aput-byte", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	APUT_CHAR:{ byte:0x50, instr:"aput-char", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	APUT_SHORT:{ byte:0x51, instr:"aput-short", parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	
	// --------------------------------- INSTANCE OPE ----------------------------------------------
	IGET:{ byte:0x52, instr:"iget", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	IGET_WIDE:{ byte:0x53, instr:"iget-wide", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	IGET_OBJECT:{ byte:0x54, instr:"iget-object", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	IGET_BOOLEAN:{ byte:0x55, instr:"iget-boolean", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	IGET_BYTE:{ byte:0x56, instr:"iget-byte", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	IGET_CHAR:{ byte:0x57, instr:"iget-char", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	IGET_SHORT:{ byte:0x58, instr:"iget-short", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	IPUT:{ byte:0x59, instr:"iput", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	IPUT_WIDE:{ byte:0x5a, instr:"iput-wide", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	IPUT_OBJECT:{ byte:0x5b, instr:"iput-object", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	IPUT_BOOLEAN:{ byte:0x5c, instr:"iput-boolean", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	IPUT_BYTE:{ byte:0x5d, instr:"iput-byte", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	IPUT_CHAR:{ byte:0x5e, instr:"iput-char", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	IPUT_SHORT:{ byte:0x5f, instr:"iput-short", parse: DalvikInstructionFormat.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE },
	
	// --------------------------------- STATIC OPE ----------------------------------------------
	SGET:{ 
		byte:0x60, 
		instr:"sget", 
		parse: DalvikInstructionFormat.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: null,
		reftype: ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.STATIC_FIELD_ACCESSOR },
	SGET_WIDE:{ 
		byte:0x61, 
		instr:"sget-wide", 
		parse: DalvikInstructionFormat.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: null,
		reftype:ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER | OpcodeType.STATIC_FIELD_ACCESSOR },
	SGET_OBJECT:{ 
		byte:0x62, 
		instr:"sget-object", 
		reftype:ReferenceType.FIELD,
		format:Format.Format21c, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.STATIC_FIELD_ACCESSOR,
	
		parse: DalvikInstructionFormat.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.L,
	},
	SGET_BOOLEAN:{ 
		byte:0x63, 
		instr:"sget-boolean", 
		parse: DalvikInstructionFormat.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.Z,
		reftype:ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.STATIC_FIELD_ACCESSOR },
	SGET_BYTE:{ 
		byte:0x64, 
		instr:"sget-byte", 
		parse: DalvikInstructionFormat.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.B,
		reftype:ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.STATIC_FIELD_ACCESSOR },
	SGET_CHAR:{ 
		byte:0x65, 
		instr:"sget-char", 
		parse: DalvikInstructionFormat.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.C,
		reftype:ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.STATIC_FIELD_ACCESSOR },
	SGET_SHORT:{ 
		byte:0x66, 
		instr:"sget-short", 
		parse: DalvikInstructionFormat.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.S,
		reftype: ReferenceType.FIELD, 
		format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.STATIC_FIELD_ACCESSOR },
	SPUT:{ 
		byte:0x67, 
		instr:"sput", 
		parse: DalvikInstructionFormat.regField,
		type: CONST.INSTR_TYPE.SETTER, 
		reftype: ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.STATIC_FIELD_ACCESSOR },
	SPUT_WIDE:{ byte:0x68, instr:"sput-wide", parse: DalvikInstructionFormat.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.STATIC_FIELD_ACCESSOR },
	SPUT_OBJECT:{ byte:0x69, instr:"sput-object", parse: DalvikInstructionFormat.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.STATIC_FIELD_ACCESSOR },
	SPUT_BOOLEAN:{ byte:0x6a, instr:"sput-boolean", parse: DalvikInstructionFormat.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.STATIC_FIELD_ACCESSOR },
	SPUT_BYTE:{ byte:0x6b, instr:"sput-byte", parse: DalvikInstructionFormat.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.STATIC_FIELD_ACCESSOR },
	SPUT_CHAR:{ byte:0x6c, instr:"sput-char", parse: DalvikInstructionFormat.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.STATIC_FIELD_ACCESSOR },
	SPUT_SHORT:{ byte:0x6d, instr:"sput-short", parse: DalvikInstructionFormat.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.STATIC_FIELD_ACCESSOR },
	
	// --------------------------------- INVOKE ----------------------------------------------
	INVOKE_VIRTUAL:{ byte:0x6e, instr:"invoke-virtual", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT },
	INVOKE_SUPER:{ byte:0x6f, instr:"invoke-super", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT },
	INVOKE_DIRECT:{ byte:0x70, instr:"invoke-direct", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT | OpcodeType.CAN_INITIALIZE_REFERENCE },
	INVOKE_STATIC:{ byte:0x71, instr:"invoke-static", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT | OpcodeType.STATIC_CALL},
	INVOKE_INTERFACE:{ byte:0x72, instr:"invoke-interface", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT },
	INVOKE_VIRTUAL_RANGE:{ byte:0x74, instr:"invoke-virtual/range", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT },
	INVOKE_SUPER_RANGE:{ byte:0x75, instr:"invoke-super/range", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT },
	INVOKE_DIRECT_RANGE:{ byte:0x76, instr:"invoke-direct/range", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT | OpcodeType.CAN_INITIALIZE_REFERENCE },
	INVOKE_STATIC_RANGE:{ byte:0x77, instr:"invoke-static/range", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT | OpcodeType.STATIC_CALL },
	INVOKE_INTERFACE_RANGE:{ byte:0x78, instr:"invoke-interface/range", parse: DalvikInstructionFormat.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_RESULT },
	
	// --------------------------------- MATH OPE ----------------------------------------------
	NEG_INT:{ byte:0x7b, instr:"neg-int", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	NOT_INT:{ byte:0x7c, instr:"not-int", ope: CONST.LEX.TOKEN.NOT, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	NEG_LONG:{ byte:0x7d, instr:"neg-long", ope: CONST.LEX.TOKEN.NEG, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	NOT_LONG:{ byte:0x7e, instr:"not-long", ope: CONST.LEX.TOKEN.NOT, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	NEG_FLOAT:{ byte:0x7f, instr:"neg-float", ope: CONST.LEX.TOKEN.NEG, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	NEG_DOUBLE:{ byte:0x80, instr:"neg-double", ope: CONST.LEX.TOKEN.NEG, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	
	// --------------------------------- MATH CAST ----------------------------------------------
	INT_TO_LONG:{ byte:0x81, instr:"int-to-long", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	INT_TO_FLOAT:{ byte:0x82, instr:"int-to-float", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	INT_TO_DOUBLE:{ byte:0x83, instr:"int-to-double", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	LONG_TO_INT:{ byte:0x84, instr:"long-to-int", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	LONG_TO_FLOAT:{ byte:0x85, instr:"long-to-float", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	LONG_TO_DOUBLE:{ byte:0x86, instr:"long-to-double", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	FLOAT_TO_INT:{ byte:0x87, instr:"float-to-int", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	FLOAT_TO_LONG:{ byte:0x88, instr:"float-to-long", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	FLOAT_TO_DOUBLE:{ byte:0x89, instr:"float-to-double", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	DOUBLE_TO_INT:{ byte:0x8a, instr:"double-to-int", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	DOUBLE_TO_LONG:{ byte:0x8b, instr:"double-to-long", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	DOUBLE_TO_FLOAT:{ byte:0x8c, instr:"double-to-float", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	INT_TO_BYTE:{ byte:0x8d, instr:"int-to-byte", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	INT_TO_CHAR:{ byte:0x8e, instr:"int-to-char", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	INT_TO_SHORT:{ byte:0x8f, instr:"int-to-short", parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	
	// --------------------------------- MATH ----------------------------------------------
	ADD_INT:{ byte:0x90, instr:"add-int", ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SUB_INT:{ byte:0x91, instr:"sub-int", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	MUL_INT:{ byte:0x92, instr:"mul-int", ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	DIV_INT:{ byte:0x93, instr:"div-int", ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	REM_INT:{ byte:0x94, instr:"rem-int", ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AND_INT:{ byte:0x95, instr:"and-int", ope: CONST.LEX.TOKEN.AND, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	OR_INT:{ byte:0x96, instr:"or-int", ope: CONST.LEX.TOKEN.OR, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	XOR_INT:{ byte:0x97, instr:"xor-int", ope: CONST.LEX.TOKEN.XOR, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SHL_INT:{ byte:0x98, instr:"shl-int", ope: CONST.LEX.TOKEN.SHL, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SHR_INT:{ byte:0x99, instr:"shr-int", ope: CONST.LEX.TOKEN.SHR, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	USHR_INT:{ byte:0x9a, instr:"ushr-int", ope: CONST.LEX.TOKEN.USHR, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	ADD_LONG:{ byte:0x9b, instr:"add-long", ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	SUB_LONG:{ byte:0x9c, instr:"sub-long", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	MUL_LONG:{ byte:0x9d, instr:"mul-long", ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	DIV_LONG:{ byte:0x9e, instr:"div-long", ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	REM_LONG:{ byte:0x9f, instr:"rem-long", ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	AND_LONG:{ byte:0xa0, instr:"and-long", ope: CONST.LEX.TOKEN.AND, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	OR_LONG:{ byte:0xa1, instr:"or-long", ope: CONST.LEX.TOKEN.OR, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	XOR_LONG:{ byte:0xa2, instr:"xor-long", ope: CONST.LEX.TOKEN.XOR, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	SHL_LONG:{ byte:0xa3, instr:"shl-long", ope: CONST.LEX.TOKEN.SHL, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	SHR_LONG:{ byte:0xa4, instr:"shr-long", ope: CONST.LEX.TOKEN.SHR, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	USHR_LONG:{ byte:0xa5, instr:"ushr-long", ope: CONST.LEX.TOKEN.USHR, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	ADD_FLOAT:{ byte:0xa6, instr:"add-float", ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SUB_FLOAT:{ byte:0xa7, instr:"sub-float", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	MUL_FLOAT:{ byte:0xa8, instr:"mul-float", ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	DIV_FLOAT:{ byte:0xa9, instr:"div-float", ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	REM_FLOAT:{ byte:0xaa, instr:"rem-float", ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	ADD_DOUBLE:{ byte:0xab, instr:"add-double", ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	SUB_DOUBLE:{ byte:0xac, instr:"sub-double", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	MUL_DOUBLE:{ byte:0xad, instr:"mul-double", ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	DIV_DOUBLE:{ byte:0xae, instr:"div-double", ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	REM_DOUBLE:{ byte:0xaf, instr:"rem-double", ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.Format23x, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	
	ADD_INT_2ADDR:{ byte:0xb0, instr:"add-int/2addr", ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SUB_INT_2ADDR:{ byte:0xb1, instr:"sub-int/2addr", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	MUL_INT_2ADDR:{ byte:0xb2, instr:"mul-int/2addr", ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	DIV_INT_2ADDR:{ byte:0xb3, instr:"div-int/2addr", ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	REM_INT_2ADDR:{ byte:0xb4, instr:"rem-int/2addr", ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AND_INT_2ADDR:{ byte:0xb5, instr:"and-int/2addr", ope: CONST.LEX.TOKEN.AND, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	OR_INT_2ADDR:{ byte:0xb6, instr:"or-int/2addr", ope: CONST.LEX.TOKEN.OR, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	XOR_INT_2ADDR:{ byte:0xb7, instr:"xor-int/2addr", ope: CONST.LEX.TOKEN.XOR, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SHL_INT_2ADDR:{ byte:0xb8, instr:"shl-int/2addr", ope: CONST.LEX.TOKEN.SHL, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SHR_INT_2ADDR:{ byte:0xb9, instr:"shr-int/2addr", ope: CONST.LEX.TOKEN.SHR, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	USHR_INT_2ADDR:{ byte:0xba, instr:"ushr-int/2addr", ope: CONST.LEX.TOKEN.USHR, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	ADD_LONG_2ADDR:{ byte:0xbb, instr:"add-long/2addr", ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	SUB_LONG_2ADDR:{ byte:0xbc, instr:"sub-long/2addr", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	MUL_LONG_2ADDR:{ byte:0xbd, instr:"mul-long/2addr", ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	DIV_LONG_2ADDR:{ byte:0xbe, instr:"div-long/2addr", ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	REM_LONG_2ADDR:{ byte:0xbf, instr:"rem-long/2addr", ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	AND_LONG_2ADDR:{ byte:0xc0, instr:"and-long/2addr", ope: CONST.LEX.TOKEN.AND, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	OR_LONG_2ADDR:{ byte:0xc1, instr:"or-long/2addr", ope: CONST.LEX.TOKEN.OR, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	XOR_LONG_2ADDR:{ byte:0xc2, instr:"xor-long/2addr", ope: CONST.LEX.TOKEN.XOR, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	SHL_LONG_2ADDR:{ byte:0xc3, instr:"shl-long/2addr", ope: CONST.LEX.TOKEN.SHL, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	SHR_LONG_2ADDR:{ byte:0xc4, instr:"shr-long/2addr", ope: CONST.LEX.TOKEN.SHR, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	USHR_LONG_2ADDR:{ byte:0xc5, instr:"ushr-long/2addr", ope: CONST.LEX.TOKEN.USHR, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	ADD_FLOAT_2ADDR:{ byte:0xc6, instr:"add-float/2addr", ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SUB_FLOAT_2ADDR:{ byte:0xc7, instr:"sub-float/2addr", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	MUL_FLOAT_2ADDR:{ byte:0xc8, instr:"mul-float/2addr", ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	DIV_FLOAT_2ADDR:{ byte:0xc9, instr:"div-float/2addr", ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	REM_FLOAT_2ADDR:{ byte:0xca, instr:"rem-float/2addr", ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	ADD_DOUBLE_2ADDR:{ byte:0xcb, instr:"add-double/2addr", ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	SUB_DOUBLE_2ADDR:{ byte:0xcc, instr:"sub-double/2addr", ope: CONST.LEX.TOKEN.SUB, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	MUL_DOUBLE_2ADDR:{ byte:0xcd, instr:"mul-double/2addr", ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	DIV_DOUBLE_2ADDR:{ byte:0xce, instr:"div-double/2addr", ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	REM_DOUBLE_2ADDR:{ byte:0xcf, instr:"rem-double/2addr", ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER | OpcodeType.SETS_WIDE_REGISTER },
	
	ADD_INT_LIT16:{ byte:0xd0, instr:"add-int/lit16",  ope: CONST.LEX.TOKEN.ADD, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format22s, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	RSUB_INT:{ byte:0xd1, instr:"rsub-int",   parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format22s, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	MUL_INT_LIT16:{ byte:0xd2, instr:"mul-int/lit16",  ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	DIV_INT_LIT16:{ byte:0xd3, instr:"div-int/lit16",  ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	REM_INT_LIT16:{ byte:0xd4, instr:"rem-int/lit16",  ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AND_INT_LIT16:{ byte:0xd5, instr:"and-int/lit16",  ope: CONST.LEX.TOKEN.AND, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	OR_INT_LIT16:{ byte:0xd6, instr:"or-int/lit16",  ope: CONST.LEX.TOKEN.OR, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	XOR_INT_LIT16:{ byte:0xd7, instr:"xor-int/lit16",  ope: CONST.LEX.TOKEN.XOR, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	ADD_INT_LIT8:{ byte:0xd8, instr:"add-int/lit8",  ope: CONST.LEX.TOKEN.ADD,  parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	RSUB_INT_LIT8:{ byte:0xd9, instr:"rsub-int/lit8",  parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	MUL_INT_LIT8:{ byte:0xda, instr:"mul-int/lit8",  ope: CONST.LEX.TOKEN.MUL, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	DIV_INT_LIT8:{ byte:0xdb, instr:"div-int/lit8",  ope: CONST.LEX.TOKEN.DIV, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	REM_INT_LIT8:{ byte:0xdc, instr:"rem-int/lit8",  ope: CONST.LEX.TOKEN.REM, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_THROW | OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	AND_INT_LIT8:{ byte:0xdd, instr:"and-int/lit8",  ope: CONST.LEX.TOKEN.AND, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	OR_INT_LIT8:{ byte:0xde, instr:"or-int/lit8",  ope: CONST.LEX.TOKEN.OR, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	XOR_INT_LIT8:{ byte:0xdf, instr:"xor-int/lit8",  ope: CONST.LEX.TOKEN.XOR, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SHL_INT_LIT8:{ byte:0xe0, instr:"shl-int/lit8",  ope: CONST.LEX.TOKEN.SHL, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	SHR_INT_LIT8:{ byte:0xe1, instr:"shr-int/lit8",  ope: CONST.LEX.TOKEN.SHR, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
	USHR_INT_LIT8:{ byte:0xe2, instr:"ushr-int/lit8",  ope: CONST.LEX.TOKEN.USHR, parse: DalvikInstructionFormat.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:OpcodeType.CAN_CONTINUE | OpcodeType.SETS_REGISTER },
};
