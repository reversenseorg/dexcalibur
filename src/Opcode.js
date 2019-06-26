var CONST = require("./CoreConst.js");
var Core = require("./CoreParser.js");
const CLASS = require("./CoreClass.js");
var ut = require("./Utils.js");


var LEX = Core.LEX;
var PARSER = Core.PARSER;

var ReferenceType = CONST.OPCODE_REFTYPE;
var Format = CONST.OPCODE_FORMAT;
var Opcode = CONST.OPCODE_TYPE;


var RegType = {
	PARAM: 0,
	REGISTER: 1,
	LOCAL: 2,
};

LEX.REG = {
	v: RegType.LOCAL,
	p: RegType.PARAM
};

var OpcodeParser = {
	fieldReference: function(src,raw_src){
		let r = new CLASS.FieldReference();
		let m = Core.RX.REF_FIELD.exec(src);

//		console.log(src,m);
		if(m==null) console.log(raw_src);
		if(m.length<4) console.log("[!] Instruction : invalid field reference :"+src);

		r.fullname = m[0];
		r.fqcn = PARSER.fqcn(m[1]);
		r.field = m[2];
		r.name = m[2];
		r._hashcode = src;

		if(m[3][0]==='[')
			r.isArray = true;

		return r;
	},
	classReference: function(raw_src){
		let r = new CLASS.ClassReference();
		let m = Core.RX.FQCN.exec(src), i=61;

		r.name = PARSER.fqcn(m[1]);
		
		return r;
	},
	reg: function(src){
		return Core.RX.REF_REG.exec(src);
	},	
	singleVar: function(src){
		let m = Core.RX.REF_REG.exec(src);
		
		if(m.length!=3) console.log("[!] Instruction : invalid register reference :"+src);

		return {t:m[1],i:m[2]};//new CLASS.Variable(m[1],m[2]);
	},
	multiVar: function(raw_src){
		let m = null, v = [];

		m = Core.RX.REF_REG_MULT.exec(raw_src);

		if(m == null) m = Core.RX.REF_REG_INTER.exec(raw_src);

		if(m !== null){
			for(let i=1; i<m.length; i++){
				if(m[i] !== undefined){
					//console.log(m[i],raw_src);
					v.push(this.singleVar(m[i]));
				} 
			}
		}else{
			m = Core.RX.REF_REG_INV.exec(raw_src);
			if(m !== null)
				v.push({t:m[1],i:m[2]});
			else if(ut.trim(raw_src) !== "{}")
				console.log(raw_src,m);
		}

		return v;
	},
	stringValue: function(src){
		let m = Core.RX.STR_VAL.exec(src);
		
		if(m.length!=2) console.log("[!] Instruction : invalid string value :"+src);

		return m[1];
	}
};

var MainParser = {
	move: function(src,raw_src){
		let instr = new CLASS.Instruction(); 

		instr.left = OpcodeParser.singleVar(src[1]);
		instr.right = OpcodeParser.singleVar(src[2]);

		return instr;
	},
	math: function(src,raw_src){
		let instr = new CLASS.Instruction(); 

		instr.left = OpcodeParser.singleVar(src[1]);
		instr.right = OpcodeParser.singleVar(src[2]);

		return instr;
	},
	addrX: function(src,raw_src){
		let instr = new CLASS.Instruction(); 
		let v = OpcodeParser.multiVar(raw_src);

		instr.left = v[0];
		instr.right = v.shift();
	
		return instr;
	},
	Format23x: function(src,raw_src){
		let instr = new CLASS.Instruction(); 
		let v = OpcodeParser.multiVar(raw_src);

		instr.left = v[0];
		instr.right = [];
		if(v[1]!=null)
			instr.right.push(v[1]);
		if(v[2]!=null)
			instr.right.push(v[2]);
	
		return instr;
	},
	singleArgs: function(src,raw_src){
		let instr = new CLASS.Instruction(); 

		instr.left = OpcodeParser.singleVar(src[1]);
		// la droite est la valeur de retour du dernier invoke  MOVE_RESULT
		// ou une exception MOVE_EXCPT
		//instr.right = OpcodeParser.singleVar(src[2]);

		return instr;
	},
	noArgs: function(src,raw_src){
		let instr = new CLASS.Instruction(); 

		return instr;
	},
	// v0, [B
	format21c: function(src,raw_src){
		let instr = new CLASS.Instruction(); 
		let i = raw_src.lastIndexOf(","), arr=false;
		
		instr.left = OpcodeParser.singleVar(raw_src.substr(0,i));

		let r = raw_src.substr(i+1);
		let m = Core.RX.FORMAT21C.exec(r);

		if(m[1]==="[")
			arr = true;

		if(m[2]=='L')
			instr.right = new CLASS.ObjectType(Core.PARSER.fqcn(m[3]),arr);
		else
			instr.right = new CLASS.BasicType(m[2],arr);

		return instr;
	},
	// v0, v1, [L...
	format22c: function(src,raw_src){
		let instr = new CLASS.Instruction(); 
		let i = raw_src.lastIndexOf(","), arr=false;
		
		instr.left = OpcodeParser.multiVar(raw_src.substr(0,i));

		let r = raw_src.substr(i+1);
		let m = Core.RX.FORMAT21C.exec(r);

		if(m[1]==="[")
			arr = true;

		if(m[2]=='L')
			instr.right = new CLASS.ObjectType(Core.PARSER.fqcn(m[3]),arr);
		else
			instr.right = new CLASS.BasicType(m[2],arr);

		return instr;
	},
	regField: function(src,raw_src){
		let instr = new CLASS.Instruction(); 

		instr.left = OpcodeParser.singleVar(src[1]);
		instr.right = OpcodeParser.fieldReference(src[2],raw_src);
		
		return instr;
	},	
	multRegField: function(src,raw_src){
		let instr = new CLASS.Instruction();
		let i = raw_src.lastIndexOf(",");
		
		instr.left = OpcodeParser.multiVar(raw_src.substr(0,i));
		instr.right = OpcodeParser.fieldReference(raw_src.substr(i+1),raw_src);
		
		return instr;
	}, 
	invoke: function(src,raw_src){
		let instr = new CLASS.Instruction(); 
		let m = Core.RX.INVOKE.exec(raw_src), meth=null;		
		let regs = raw_src.substr(0,raw_src.lastIndexOf(","));
		
		instr.left = OpcodeParser.multiVar(regs);


		if(m !== null){

			meth = Core.PARSER.methodName(m[m.length-1]);
			instr.right = new CLASS.MethodReference({
				fqcn: Core.PARSER.fqcn(m[m.length-2]),
				name: meth.name,
				args: meth.args,
				ret: meth.ret,
				special: false
			});
			if(instr.right==null) console.log(raw_src);

		}else{
			m = Core.RX.INVOKE_SPECIAL.exec(raw_src.substr(raw_src.lastIndexOf(",")));

			if(m == null) console.log("Parsing fail : ",raw_src);

			meth = Core.PARSER.methodName(m[m.length-1]);
			instr.right = new CLASS.MethodReference({
				fqcn: Core.PARSER.fqcn(m[m.length-2]),
				name: meth.name,
				args: meth.args,
				ret: meth.ret,
				special: true,
			});
		}

		return instr;
	},
	onlyTagged: function(src,raw_src){
		let instr = new CLASS.Instruction();
		let m = Core.RX.TAG.exec(raw_src);


		instr.left = null;
		instr.right = new CLASS.Tag(m[m.length-1]);

		return instr;
	}, 	
	tagged: function(src,raw_src){
		let instr = new CLASS.Instruction();
		let m = Core.RX.REG_TAG.exec(raw_src);

		instr.left = {t:m[1],i:m[2]};//new CLASS.Variable(m[1],m[2]);
		instr.right = new CLASS.Tag(':'+m[m.length-2]+"_"+m[m.length-1]);

		return instr;
	}, 	
	multTagged: function(src,raw_src){
		let instr = new CLASS.Instruction();
		let i = raw_src.lastIndexOf(",");
		
		instr.left = OpcodeParser.multiVar(raw_src.substr(0,i));

		let m = Core.RX.TAG.exec(raw_src.substr(i+1));
		instr.right = new CLASS.Tag(':'+m[m.length-2]+"_"+m[m.length-1]); //m[m.length-1]);

		return instr;
	}, 
	format_lit16: function(src,raw_src){	
		let instr = new CLASS.Instruction();
		let r = raw_src.lastIndexOf(",");

		instr.left = OpcodeParser.multiVar(raw_src.substr(0,r));//new CLASS.Variable(m[1],m[2]);
		instr.right = new CLASS.ValueConst(
			parseInt(raw_src.substr(r+1)), [], instr
		);

		return instr;
	},
	setlitteral: function(src,raw_src){	
		let instr = new CLASS.Instruction();
		let m = (new RegExp(Core.PATTERN.CONST_LIT_INSTR)).exec(raw_src);

		instr.left = {t:m[1],i:m[2]};//new CLASS.Variable(m[1],m[2]);
		instr.right = new CLASS.ValueConst(
			parseInt(m[3]), [], instr
		);

		return instr;
	},
	setstring: function(src,raw_src){
		let instr = new CLASS.Instruction();
		let m = (new RegExp(Core.PATTERN.STR_INSTR)).exec(raw_src);

		
		instr.tags.push(CONST.TAG.STRING);
		instr.left = {t:m[1], i:m[2]};//new CLASS.Variable(m[1],m[2]);
		//instr.left.tags.push(CONST.TAG.STRING);

		instr.right = new CLASS.ValueConst(
			m[3], [CONST.TAG.STRING,CONST.TAG.STRING_DECL]
		);

		return instr;
	},
	setclass: function(src,raw_src){
		let instr = new CLASS.Instruction(); 
		let m = (new RegExp(Core.PATTERN.CONST_CLASS_INSTR)).exec(raw_src);
		
		//console.log(m,raw_src);
		if(m !== null && m[0] === ut.trim(raw_src)){
			instr.left = {t:m[1],i:m[2]};//new CLASS.Variable(m[1],m[2]); 
			if(m[5] === undefined){
				instr.right = new CLASS.BasicType(m[3]);
			}else{
				instr.right = new CLASS.ObjectType(Core.PARSER.fqcn(m[5]));
			}
			
			return instr;
		}
		
		m = (new RegExp(Core.PATTERN.CONST_CLASS_MULT_INSTR)).exec(raw_src);

		//console.log(m,Core.PATTERN.CONST_CLASS_MULT_INSTR,raw_src);
		if(m==null) console.log(raw_src);
		instr.left = {t:m[1],i:m[2]};//new CLASS.Variable(m[1],m[2]); 

		if(m[3][0]=='L')
			instr.right = new CLASS.ObjectType(Core.PARSER.fqcn(m[5]),true);
		else
			instr.right = new CLASS.BasicType(m[3],true);
		
		return instr;
	},
	TODO: function(src,raw_src){
	
	}
};

 


var OPCODE={
	NOP:{ 
		byte:0x00, 
		instr:"nop", 
		reftype:ReferenceType.NONE, 
		format:Format.Format10x, 
		flag:Opcode.CAN_CONTINUE,
		
		parse: MainParser.noArgs,
		type: CONST.INSTR_TYPE.NOP,
		valuetype: null 	
	},
	MOVE:{ 
		byte:0x01, 
		instr:"move", 
		reftype:ReferenceType.NONE, 
		format:Format.Format12x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 		 
	},
	MOVE_FROM16:{ 
		byte:0x02, 
		instr:"move/from16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format22x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_16:{ 
		byte:0x03, 
		instr:"move/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format32x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_WIDE:{ 
		byte:0x04, 
		instr:"move-wide", 
		reftype:ReferenceType.NONE, 
		format:Format.Format12x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER, 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_WIDE_FROM16:{ 
		byte:0x05, 
		instr:"move-wide/from16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format22x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER, 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_WIDE_16:{ 
		byte:0x06, 
		instr:"move-wide/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format32x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER, 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_OBJECT:{ 
		byte:0x07, 
		instr:"move-object", 
		reftype:ReferenceType.NONE, 
		format:Format.Format12x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER , 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null
	},
	MOVE_OBJECT_FROM16:{ 
		byte:0x08, 
		instr:"move-object/from16", 
		reftype: ReferenceType.NONE, 
		format: Format.Format22x, 
		flag: Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null
	},
	MOVE_OBJECT_16:{ 
		byte:0x09, 
		instr:"move-object/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format32x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.move,
		type: CONST.INSTR_TYPE.MOVE,
		valuetype: null 
	},
	MOVE_RESULT:{ 
		byte:0x0a, 
		instr:"move-result", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.MOVE_RESULT,
		valuetype: null  
	},
	MOVE_RESULT_WIDE:{ 
		byte:0x0b, 
		instr:"move-result-wide", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.MOVE_RESULT,
		valuetype: null  
	},
	MOVE_RESULT_OBJECT:{ 
		byte:0x0c,
		instr:"move-result-object", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.MOVE_RESULT,
		valuetype: null  
	},
	MOVE_EXCEPTION:{
		byte:0x0d, 
		instr:"move-exception", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.MOVE_EXCPT,
		valuetype: null  
	},

	// --------------------------------------------------------------------------
	RETURN_VOID:{ 
		byte:0x0e, 
		instr:"return-void", 
		reftype: ReferenceType.NONE, 
		format: Format.Format10x, 

		parse: MainParser.noArgs,
		type: CONST.INSTR_TYPE.RET,
		valuetype: null   
	},
	RETURN:{ 
		byte:0x0f, 
		instr:"return", 
		reftype: ReferenceType.NONE, 
		format: Format.Format11x, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.RET,
		valuetype: null    
	},
	RETURN_WIDE:{ 
		byte:0x10, 
		instr:"return-wide", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.RET,
		valuetype: null    
	},
	RETURN_OBJECT:{ 
		byte:0x11, 
		instr:"return-object", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.RET,
		valuetype: null    
	},
	
	// --------------------------------------------------------------------------
	CONST_4:{ 
		byte:0x12, 
		instr:"const/4", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11n, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	},
	CONST_16:{ 
		byte:0x13, 
		instr:"const/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format21s, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null      },
	CONST:{ 
		byte:0x14, 
		instr:"const", 
		reftype:ReferenceType.NONE, 
		format:Format.Format31i, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_HIGH16:{ 
		byte:0x15, 
		instr:"const/high16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format21ih, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 

		parse: MainParser.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_WIDE_16:{ 
		byte:0x16, 
		instr:"const-wide/16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format21s, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER, 

		parse: MainParser.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_WIDE_32:{ 
		byte:0x17, 
		instr:"const-wide/32", 
		reftype:ReferenceType.NONE, 
		format:Format.Format31i, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER, 

		parse: MainParser.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_WIDE:{ 
		byte:0x18, 
		instr:"const-wide", 
		reftype:ReferenceType.NONE, 
		format:Format.Format51l, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER, 

		parse: MainParser.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_WIDE_HIGH16:{ 
		byte:0x19, 
		instr:"const-wide/high16", 
		reftype:ReferenceType.NONE, 
		format:Format.Format21lh, 
		flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER, 

		parse: MainParser.setlitteral,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null     
	 },
	CONST_STRING:{ 
		byte:	0x1a, 
		instr:	"const-string", 
		reftype:	ReferenceType.STRING, 
		format:	Format.Format21c, 
		flag:	Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER,
	
		parse: MainParser.setstring,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null, 		
	},
	CONST_STRING_JUMBO:{ 
		byte:	0x1b, 
		instr:	"const-string/jumbo", 
		reftype:	ReferenceType.STRING, 
		format:	Format.Format31c, 
		flag:	Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 
		
		
		parse: MainParser.setstring,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null,
	},
	CONST_CLASS:{ 
		byte:0x1c, 
		instr:"const-class", 
		reftype: ReferenceType.TYPE, 
		format:Format.Format21c, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER, 
		
		parse: MainParser.setclass,
		type: CONST.INSTR_TYPE.VAR_SETTER,
		valuetype: null
	},

	// ------------------ MONITOR ------------------------------
	MONITOR_ENTER:{ 
		byte:0x1d, 
		instr:"monitor-enter", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.MONITOR,
		valuetype: null     
	},
	MONITOR_EXIT:{ 
		byte:0x1e, 
		instr:"monitor-exit", 
		reftype:ReferenceType.NONE, 
		format:Format.Format11x, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.MONITOR,
		valuetype: null     
	},
	
	CHECK_CAST:{ byte:0x1f, instr:"check-cast", parse: MainParser.format21c, type: CONST.INSTR_TYPE.CLASS_CHECK, reftype:ReferenceType.TYPE, format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	INSTANCE_OF:{ byte:0x20, instr:"instance-of", parse: MainParser.format22c, type: CONST.INSTR_TYPE.CLASS_CHECK, reftype:ReferenceType.TYPE, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	
	ARRAY_LENGTH:{ byte:0x21, instr:"array-length", parse: MainParser.move, type: CONST.INSTR_TYPE.ARRAY_LENGTH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	
	NEW_INSTANCE:{ byte:0x22, instr:"new-instance", parse: MainParser.format21c, type: CONST.INSTR_TYPE.NEW,reftype:ReferenceType.TYPE, format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	NEW_ARRAY:{ byte:0x23, instr:"new-array", parse: MainParser.format22c, type: CONST.INSTR_TYPE.NEW,reftype:ReferenceType.TYPE, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },	
	
	FILLED_NEW_ARRAY:{ byte:0x24, instr:"filled-new-array", parse: MainParser.format22c, type: CONST.INSTR_TYPE.NEW,reftype:ReferenceType.TYPE, format:Format.Format35c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	
	// TODO
	FILLED_NEW_ARRAY_RANGE:{ byte:0x25, instr:"filled-new-array/range", reftype:ReferenceType.TYPE, format:Format.Format3rc, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	
	// utilise des tags :array_XX
	// fill-array-data v0, :array_0
	FILL_ARRAY_DATA:{ byte:0x26, instr:"fill-array-data", parse: MainParser.tagged, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype:ReferenceType.NONE, format:Format.Format31t, flag:Opcode.CAN_CONTINUE },
	
	THROW:{ 
		byte:0x27, 
		instr:"throw", 
		reftype:  ReferenceType.NONE, 
		format: Format.Format11x, 
		flag: Opcode.CAN_THROW, 

		parse: MainParser.singleArgs,
		type: CONST.INSTR_TYPE.MONITOR,
		valuetype: null     
	},


	// --------------------------------- GOTO ---------------------------------------------------
	// utilise des tags :goto_XX
	// goto :goto_XX
	GOTO:{ byte:0x28, instr:"goto", parse: MainParser.onlyTagged, type: CONST.INSTR_TYPE.GOTO, reftype:ReferenceType.NONE, format:Format.Format10t },
	GOTO_16:{ byte:0x29, instr:"goto/16", parse: MainParser.onlyTagged, type: CONST.INSTR_TYPE.GOTO, reftype:ReferenceType.NONE, format:Format.Format20t },
	GOTO_32:{ byte:0x2a, instr:"goto/32", parse: MainParser.onlyTagged, type: CONST.INSTR_TYPE.GOTO, reftype:ReferenceType.NONE, format:Format.Format30t },

	// --------------------------------- SWITCH CONDITION ---------------------------------------
	PACKED_SWITCH:{ byte:0x2b, instr:"packed-switch", parse: MainParser.tagged, type: CONST.INSTR_TYPE.SWITCH, reftype:ReferenceType.NONE, format:Format.Format31t, flag:Opcode.CAN_CONTINUE },
	SPARSE_SWITCH:{ byte:0x2c, instr:"sparse-switch", parse: MainParser.tagged, type: CONST.INSTR_TYPE.SWITCH, reftype:ReferenceType.NONE, format:Format.Format31t, flag:Opcode.CAN_CONTINUE },

	// --------------------------------- COMPARISON ---------------------------------------------
	CMPL_FLOAT:{ byte:0x2d, instr:"cmpl-float", parse: MainParser.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	CMPG_FLOAT:{ byte:0x2e, instr:"cmpg-float", parse: MainParser.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	CMPL_DOUBLE:{ byte:0x2f, instr:"cmpl-double", parse: MainParser.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	CMPG_DOUBLE:{ byte:0x30, instr:"cmpg-double", parse: MainParser.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	CMP_LONG:{ byte:0x31, instr:"cmp-long", parse: MainParser.Format23x, type: CONST.INSTR_TYPE.CMP, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },

	// --------------------------------- IF CONDITION --------------------------------------------
	IF_EQ:{ byte:0x32, instr:"if-eq", parse: MainParser.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:Opcode.CAN_CONTINUE },
	IF_NE:{ byte:0x33, instr:"if-ne", parse: MainParser.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:Opcode.CAN_CONTINUE },
	IF_LT:{ byte:0x34, instr:"if-lt", parse: MainParser.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:Opcode.CAN_CONTINUE },
	IF_GE:{ byte:0x35, instr:"if-ge", parse: MainParser.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:Opcode.CAN_CONTINUE },
	IF_GT:{ byte:0x36, instr:"if-gt", parse: MainParser.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:Opcode.CAN_CONTINUE },
	IF_LE:{ byte:0x37, instr:"if-le", parse: MainParser.multTagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format22t, flag:Opcode.CAN_CONTINUE },
	IF_EQZ:{ byte:0x38, instr:"if-eqz", parse: MainParser.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:Opcode.CAN_CONTINUE },
	IF_NEZ:{ byte:0x39, instr:"if-nez", parse: MainParser.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:Opcode.CAN_CONTINUE },
	IF_LTZ:{ byte:0x3a, instr:"if-ltz", parse: MainParser.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:Opcode.CAN_CONTINUE },
	IF_GEZ:{ byte:0x3b, instr:"if-gez", parse: MainParser.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:Opcode.CAN_CONTINUE },
	IF_GTZ:{ byte:0x3c, instr:"if-gtz", parse: MainParser.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:Opcode.CAN_CONTINUE },
	IF_LEZ:{ byte:0x3d, instr:"if-lez", parse: MainParser.tagged, type: CONST.INSTR_TYPE.IF, reftype:ReferenceType.NONE, format:Format.Format21t, flag:Opcode.CAN_CONTINUE },

	// --------------------------------- ARRAY OPE ----------------------------------------------
	AGET:{ byte:0x44, instr:"aget", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AGET_WIDE:{ byte:0x45, instr:"aget-wide", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	AGET_OBJECT:{ byte:0x46, instr:"aget-object", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AGET_BOOLEAN:{ byte:0x47, instr:"aget-boolean", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AGET_BYTE:{ byte:0x48, instr:"aget-byte", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AGET_CHAR:{ byte:0x49, instr:"aget-char", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AGET_SHORT:{ byte:0x4a, instr:"aget-short", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_GETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	APUT:{ byte:0x4b, instr:"aput", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	APUT_WIDE:{ byte:0x4c, instr:"aput-wide", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	APUT_OBJECT:{ byte:0x4d, instr:"aput-object", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	APUT_BOOLEAN:{ byte:0x4e, instr:"aput-boolean", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	APUT_BYTE:{ byte:0x4f, instr:"aput-byte", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	APUT_CHAR:{ byte:0x50, instr:"aput-char", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	APUT_SHORT:{ byte:0x51, instr:"aput-short", parse: MainParser.addrX, type: CONST.INSTR_TYPE.ARRAY_SETTER, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	
	// --------------------------------- INSTANCE OPE ----------------------------------------------
	IGET:{ byte:0x52, instr:"iget", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	IGET_WIDE:{ byte:0x53, instr:"iget-wide", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	IGET_OBJECT:{ byte:0x54, instr:"iget-object", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	IGET_BOOLEAN:{ byte:0x55, instr:"iget-boolean", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	IGET_BYTE:{ byte:0x56, instr:"iget-byte", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	IGET_CHAR:{ byte:0x57, instr:"iget-char", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	IGET_SHORT:{ byte:0x58, instr:"iget-short", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.GETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	IPUT:{ byte:0x59, instr:"iput", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	IPUT_WIDE:{ byte:0x5a, instr:"iput-wide", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	IPUT_OBJECT:{ byte:0x5b, instr:"iput-object", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	IPUT_BOOLEAN:{ byte:0x5c, instr:"iput-boolean", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	IPUT_BYTE:{ byte:0x5d, instr:"iput-byte", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	IPUT_CHAR:{ byte:0x5e, instr:"iput-char", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	IPUT_SHORT:{ byte:0x5f, instr:"iput-short", parse: MainParser.multRegField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format22c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE },
	
	// --------------------------------- STATIC OPE ----------------------------------------------
	SGET:{ 
		byte:0x60, 
		instr:"sget", 
		parse: MainParser.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: null,
		reftype: ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.STATIC_FIELD_ACCESSOR },
	SGET_WIDE:{ 
		byte:0x61, 
		instr:"sget-wide", 
		parse: MainParser.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: null,
		reftype:ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER | Opcode.STATIC_FIELD_ACCESSOR },
	SGET_OBJECT:{ 
		byte:0x62, 
		instr:"sget-object", 
		reftype:ReferenceType.FIELD,
		format:Format.Format21c, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.STATIC_FIELD_ACCESSOR, 
	
		parse: MainParser.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.L,
	},
	SGET_BOOLEAN:{ 
		byte:0x63, 
		instr:"sget-boolean", 
		parse: MainParser.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.Z,
		reftype:ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.STATIC_FIELD_ACCESSOR },
	SGET_BYTE:{ 
		byte:0x64, 
		instr:"sget-byte", 
		parse: MainParser.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.B,
		reftype:ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.STATIC_FIELD_ACCESSOR },
	SGET_CHAR:{ 
		byte:0x65, 
		instr:"sget-char", 
		parse: MainParser.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.C,
		reftype:ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.STATIC_FIELD_ACCESSOR },
	SGET_SHORT:{ 
		byte:0x66, 
		instr:"sget-short", 
		parse: MainParser.regField,
		type: CONST.INSTR_TYPE.GETTER,
		valuetype: CONST.TYPES.S,
		reftype: ReferenceType.FIELD, 
		format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.STATIC_FIELD_ACCESSOR },
	SPUT:{ 
		byte:0x67, 
		instr:"sput", 
		parse: MainParser.regField, 
		type: CONST.INSTR_TYPE.SETTER, 
		reftype: ReferenceType.FIELD, 
		format:Format.Format21c, 
		flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.STATIC_FIELD_ACCESSOR },
	SPUT_WIDE:{ byte:0x68, instr:"sput-wide", parse: MainParser.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.STATIC_FIELD_ACCESSOR },
	SPUT_OBJECT:{ byte:0x69, instr:"sput-object", parse: MainParser.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.STATIC_FIELD_ACCESSOR },
	SPUT_BOOLEAN:{ byte:0x6a, instr:"sput-boolean", parse: MainParser.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.STATIC_FIELD_ACCESSOR },
	SPUT_BYTE:{ byte:0x6b, instr:"sput-byte", parse: MainParser.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.STATIC_FIELD_ACCESSOR },
	SPUT_CHAR:{ byte:0x6c, instr:"sput-char", parse: MainParser.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.STATIC_FIELD_ACCESSOR },
	SPUT_SHORT:{ byte:0x6d, instr:"sput-short", parse: MainParser.regField, type: CONST.INSTR_TYPE.SETTER, reftype:ReferenceType.FIELD, format:Format.Format21c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.STATIC_FIELD_ACCESSOR },
	
	// --------------------------------- INVOKE ----------------------------------------------
	INVOKE_VIRTUAL:{ byte:0x6e, instr:"invoke-virtual", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	INVOKE_SUPER:{ byte:0x6f, instr:"invoke-super", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	INVOKE_DIRECT:{ byte:0x70, instr:"invoke-direct", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT | Opcode.CAN_INITIALIZE_REFERENCE },
	INVOKE_STATIC:{ byte:0x71, instr:"invoke-static", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	INVOKE_INTERFACE:{ byte:0x72, instr:"invoke-interface", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format35c, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	INVOKE_VIRTUAL_RANGE:{ byte:0x74, instr:"invoke-virtual/range", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	INVOKE_SUPER_RANGE:{ byte:0x75, instr:"invoke-super/range", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	INVOKE_DIRECT_RANGE:{ byte:0x76, instr:"invoke-direct/range", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT | Opcode.CAN_INITIALIZE_REFERENCE },
	INVOKE_STATIC_RANGE:{ byte:0x77, instr:"invoke-static/range", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	INVOKE_INTERFACE_RANGE:{ byte:0x78, instr:"invoke-interface/range", parse: MainParser.invoke, type: CONST.INSTR_TYPE.INVOKE, reftype:ReferenceType.METHOD, format:Format.Format3rc, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_RESULT },
	
	// --------------------------------- MATH OPE ----------------------------------------------
	NEG_INT:{ byte:0x7b, instr:"neg-int", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	NOT_INT:{ byte:0x7c, instr:"not-int", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	NEG_LONG:{ byte:0x7d, instr:"neg-long", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	NOT_LONG:{ byte:0x7e, instr:"not-long", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	NEG_FLOAT:{ byte:0x7f, instr:"neg-float", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	NEG_DOUBLE:{ byte:0x80, instr:"neg-double", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	
	// --------------------------------- MATH CAST ----------------------------------------------
	INT_TO_LONG:{ byte:0x81, instr:"int-to-long", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	INT_TO_FLOAT:{ byte:0x82, instr:"int-to-float", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	INT_TO_DOUBLE:{ byte:0x83, instr:"int-to-double", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	LONG_TO_INT:{ byte:0x84, instr:"long-to-int", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	LONG_TO_FLOAT:{ byte:0x85, instr:"long-to-float", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	LONG_TO_DOUBLE:{ byte:0x86, instr:"long-to-double", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	FLOAT_TO_INT:{ byte:0x87, instr:"float-to-int", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	FLOAT_TO_LONG:{ byte:0x88, instr:"float-to-long", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	FLOAT_TO_DOUBLE:{ byte:0x89, instr:"float-to-double", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	DOUBLE_TO_INT:{ byte:0x8a, instr:"double-to-int", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	DOUBLE_TO_LONG:{ byte:0x8b, instr:"double-to-long", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	DOUBLE_TO_FLOAT:{ byte:0x8c, instr:"double-to-float", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	INT_TO_BYTE:{ byte:0x8d, instr:"int-to-byte", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	INT_TO_CHAR:{ byte:0x8e, instr:"int-to-char", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	INT_TO_SHORT:{ byte:0x8f, instr:"int-to-short", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH_CAST, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	
	// --------------------------------- MATH ----------------------------------------------
	ADD_INT:{ byte:0x90, instr:"add-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SUB_INT:{ byte:0x91, instr:"sub-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	MUL_INT:{ byte:0x92, instr:"mul-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	DIV_INT:{ byte:0x93, instr:"div-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	REM_INT:{ byte:0x94, instr:"rem-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AND_INT:{ byte:0x95, instr:"and-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	OR_INT:{ byte:0x96, instr:"or-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	XOR_INT:{ byte:0x97, instr:"xor-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SHL_INT:{ byte:0x98, instr:"shl-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SHR_INT:{ byte:0x99, instr:"shr-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	USHR_INT:{ byte:0x9a, instr:"ushr-int", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	ADD_LONG:{ byte:0x9b, instr:"add-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	SUB_LONG:{ byte:0x9c, instr:"sub-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	MUL_LONG:{ byte:0x9d, instr:"mul-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	DIV_LONG:{ byte:0x9e, instr:"div-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	REM_LONG:{ byte:0x9f, instr:"rem-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	AND_LONG:{ byte:0xa0, instr:"and-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	OR_LONG:{ byte:0xa1, instr:"or-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	XOR_LONG:{ byte:0xa2, instr:"xor-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	SHL_LONG:{ byte:0xa3, instr:"shl-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	SHR_LONG:{ byte:0xa4, instr:"shr-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	USHR_LONG:{ byte:0xa5, instr:"ushr-long", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	ADD_FLOAT:{ byte:0xa6, instr:"add-float", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SUB_FLOAT:{ byte:0xa7, instr:"sub-float", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	MUL_FLOAT:{ byte:0xa8, instr:"mul-float", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	DIV_FLOAT:{ byte:0xa9, instr:"div-float", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	REM_FLOAT:{ byte:0xaa, instr:"rem-float", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	ADD_DOUBLE:{ byte:0xab, instr:"add-double", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	SUB_DOUBLE:{ byte:0xac, instr:"sub-double", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	MUL_DOUBLE:{ byte:0xad, instr:"mul-double", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	DIV_DOUBLE:{ byte:0xae, instr:"div-double", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	REM_DOUBLE:{ byte:0xaf, instr:"rem-double", parse: MainParser.addrX, type: CONST.INSTR_TYPE.MATH, reftype: ReferenceType.NONE, format: Format.Format23x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	
	ADD_INT_2ADDR:{ byte:0xb0, instr:"add-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SUB_INT_2ADDR:{ byte:0xb1, instr:"sub-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	MUL_INT_2ADDR:{ byte:0xb2, instr:"mul-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	DIV_INT_2ADDR:{ byte:0xb3, instr:"div-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	REM_INT_2ADDR:{ byte:0xb4, instr:"rem-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AND_INT_2ADDR:{ byte:0xb5, instr:"and-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	OR_INT_2ADDR:{ byte:0xb6, instr:"or-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	XOR_INT_2ADDR:{ byte:0xb7, instr:"xor-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SHL_INT_2ADDR:{ byte:0xb8, instr:"shl-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SHR_INT_2ADDR:{ byte:0xb9, instr:"shr-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	USHR_INT_2ADDR:{ byte:0xba, instr:"ushr-int/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	ADD_LONG_2ADDR:{ byte:0xbb, instr:"add-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	SUB_LONG_2ADDR:{ byte:0xbc, instr:"sub-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	MUL_LONG_2ADDR:{ byte:0xbd, instr:"mul-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	DIV_LONG_2ADDR:{ byte:0xbe, instr:"div-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	REM_LONG_2ADDR:{ byte:0xbf, instr:"rem-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	AND_LONG_2ADDR:{ byte:0xc0, instr:"and-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	OR_LONG_2ADDR:{ byte:0xc1, instr:"or-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	XOR_LONG_2ADDR:{ byte:0xc2, instr:"xor-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	SHL_LONG_2ADDR:{ byte:0xc3, instr:"shl-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	SHR_LONG_2ADDR:{ byte:0xc4, instr:"shr-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	USHR_LONG_2ADDR:{ byte:0xc5, instr:"ushr-long/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	ADD_FLOAT_2ADDR:{ byte:0xc6, instr:"add-float/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SUB_FLOAT_2ADDR:{ byte:0xc7, instr:"sub-float/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	MUL_FLOAT_2ADDR:{ byte:0xc8, instr:"mul-float/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	DIV_FLOAT_2ADDR:{ byte:0xc9, instr:"div-float/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	REM_FLOAT_2ADDR:{ byte:0xca, instr:"rem-float/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	ADD_DOUBLE_2ADDR:{ byte:0xcb, instr:"add-double/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	SUB_DOUBLE_2ADDR:{ byte:0xcc, instr:"sub-double/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	MUL_DOUBLE_2ADDR:{ byte:0xcd, instr:"mul-double/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	DIV_DOUBLE_2ADDR:{ byte:0xce, instr:"div-double/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	REM_DOUBLE_2ADDR:{ byte:0xcf, instr:"rem-double/2addr", parse: MainParser.move, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format12x, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER | Opcode.SETS_WIDE_REGISTER },
	
	ADD_INT_LIT16:{ byte:0xd0, instr:"add-int/lit16",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format22s, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	RSUB_INT:{ byte:0xd1, instr:"rsub-int",   parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH, reftype:ReferenceType.NONE, format:Format.Format22s, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	MUL_INT_LIT16:{ byte:0xd2, instr:"mul-int/lit16",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	DIV_INT_LIT16:{ byte:0xd3, instr:"div-int/lit16",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	REM_INT_LIT16:{ byte:0xd4, instr:"rem-int/lit16",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AND_INT_LIT16:{ byte:0xd5, instr:"and-int/lit16",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	OR_INT_LIT16:{ byte:0xd6, instr:"or-int/lit16",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	XOR_INT_LIT16:{ byte:0xd7, instr:"xor-int/lit16",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22s, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	ADD_INT_LIT8:{ byte:0xd8, instr:"add-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	RSUB_INT_LIT8:{ byte:0xd9, instr:"rsub-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	MUL_INT_LIT8:{ byte:0xda, instr:"mul-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	DIV_INT_LIT8:{ byte:0xdb, instr:"div-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	REM_INT_LIT8:{ byte:0xdc, instr:"rem-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_THROW | Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	AND_INT_LIT8:{ byte:0xdd, instr:"and-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	OR_INT_LIT8:{ byte:0xde, instr:"or-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	XOR_INT_LIT8:{ byte:0xdf, instr:"xor-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SHL_INT_LIT8:{ byte:0xe0, instr:"shl-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	SHR_INT_LIT8:{ byte:0xe1, instr:"shr-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
	USHR_INT_LIT8:{ byte:0xe2, instr:"ushr-int/lit8",  parse: MainParser.format_lit16, type: CONST.INSTR_TYPE.MATH,  reftype:ReferenceType.NONE, format:Format.Format22b, flag:Opcode.CAN_CONTINUE | Opcode.SETS_REGISTER },
};

module.exports = {
	CTR: 0,
	OPCODE: OPCODE,
	findOpcode: function(byte){
		for(let op in OPCODE){
			// if(i==10) console.log(instr,OPCODE[op].instr);
			if(byte==OPCODE[op].byte) return OPCODE[op]; 
		}
		return null;
	},
	find: function(instr){
		for(let op in OPCODE){
			// if(i==10) console.log(instr,OPCODE[op].instr);
			if(instr==OPCODE[op].instr) return OPCODE[op]; 
		}
		return null;
	},
	parse: function(src,raw_src, src_line){
		let op = this.find(src[0]), instr = null;
		this.CTR++;

		// return UNKNOW instr
		if(op == null) return null;

		if(op.parse != undefined){
			instr = op.parse(src,raw_src.substr(raw_src.indexOf(CONST.LEX.TOKEN.SPACE)));
			instr.opcode = op;
			instr.oline = src_line;
			instr._raw = raw_src;
		}

		return instr;
		/* if(op.byte == OPCODE.SGET_CHAR.byte) 
			console.log("[!] Instr sget-char : "+raw_instr.join(" "));*/
	},
	parseParam: function(src, raw_src, src_line){
		let instr = MainParser.setstring(src, raw_src);
		return { param:instr.left, name:instr.right._value };
	}
}