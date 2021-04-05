


const LOG_DBG = true;

export var LOG = {
    DEBUG: function(txt){
        if(LOG_DBG) console.log(txt); 
    }
};


export var LEX:any = {};

export var PATTERN:any = {
    FQCN: "L(.+);",
    REG_TYPE: "([vpVP])",
    REF_FIELD: "L([^;]+);->(.+):(\[?[A-Za-z]((.+);)?)",
    REF_REG: "([vp])([0-9]+),?",
    REF_REG_ONE: "([vp])([0-9]+),",
    REF_REG_INV: "\{([vp])([0-9]+)\}",
    REF_REG_INTER: "\{([vp][0-9]+) +\.\. +([vp][0-9]+)\}",
    REF_REG_ARR: "\{([vp][0-9]+)(L([^;]+);->(.+):,[vp][0-9]+)*\}",
    REF_REG_MULT: "([vp][0-9]+)(?:, *([vp][0-9]+))?(?:, *([vp][0-9]+))?(?:, *([vp][0-9]+))?(?:, *([vp][0-9]+))?(?:, *([vp][0-9]+))",
    STR_VAL: "\"(.*)\"", //$
    LIT_VAL: "(-?0x[0-9a-f]+)",
    METH: "(.*)\(([^)]*)\)(\[?[A-Za-z]((.+);)?)",
    PRIM_T: "([CJDBISZVLF])",
    PRIM_T2: "[CJDBISZVF]",
    TAG: ":([a-z_]+)_([0-9a-f]+)",
    ARRAY: "(\\[)"
};
PATTERN.REG_4 = `${PATTERN.REG_TYPE}([0-9]{0,3})`;
PATTERN.REG_8 = `${PATTERN.REG_TYPE}([0-9]{0,5})`;

PATTERN.IDENTIFIER = `(.*)`;
PATTERN.REF_CLASS = `L(${PATTERN.PACKAGE}${PATTERN.IDENTIFIER});`;
PATTERN.TYPE = `${PATTERN.PRIM_T}|${PATTERN.REF_CLASS}`;

PATTERN.STR_INSTR = PATTERN.REF_REG_ONE+"\\s*"+PATTERN.STR_VAL;
PATTERN.CONST_LIT_INSTR = PATTERN.REF_REG_ONE+"\\s*"+PATTERN.LIT_VAL;

PATTERN.CONST_CLASS_INSTR = PATTERN.REF_REG_ONE+"\\s*(("+PATTERN.FQCN+")|"+PATTERN.PRIM_T+")";
PATTERN.CONST_CLASS_MULT_INSTR = PATTERN.REF_REG_ONE+"\\s*\\[+(("+PATTERN.FQCN+")|"+PATTERN.PRIM_T+")";
PATTERN.INVOKE = " *"+PATTERN.FQCN+"->(.*)";
PATTERN.INVOKE_SPECIAL = " *([)?"+PATTERN.PRIM_T+"->(.*)";

PATTERN.REF_FIELD = `${PATTERN.REF_CLASS}->${PATTERN.FIELD_NAME}`;


PATTERN.FORMAT23X = ` *(${PATTERN.REG_8}),\\s*(${PATTERN.REG_8}),\\s*(${PATTERN.REG_8}) *`;
PATTERN.FORMAT21C_FIELD = ` *(${PATTERN.REG_8}),\\s*(${PATTERN.REF_FIELD}):${PATTERN.TYPE} *`;

// PATTERN.FORMAT21C = " *([)?"+PATTERN.PRIM_T+"(.*);? *";
PATTERN.FORMAT21C = " *(?<isarray>\\[)?(?<primitive>"+PATTERN.PRIM_T2+")?(?<class>L.+;)? *";

PATTERN.FORMAT22C = " *(\\[)?"+PATTERN.PRIM_T+"([^;]+)?;? *";

PATTERN.REG_TAG = PATTERN.REF_REG_ONE+"\\s*"+PATTERN.TAG;

export let RX:any = {
    FQCN: new RegExp("L(.+);"),
    REF_FIELD: new RegExp("L([^;]+);->(.+):(\[?[A-Za-z]((.+);)?)"),
	REF_REG: new RegExp("([vp])([0-9]+),?"),
    REF_REG_ARR: new RegExp("\{([vp][0-9]+)(,[vp][0-9]+)*\}"),
    REF_REG_MULT: new RegExp(PATTERN.REF_REG_MULT),
    REF_REG_INTER: new RegExp(PATTERN.REF_REG_INTER),
    REF_REG_INV: new RegExp(PATTERN.REF_REG_INV),
    STR_VAL: new RegExp("\"(.*)\""), // $
    PRIM_T: new RegExp(PATTERN.PRIM_T),
    INVOKE: new RegExp(PATTERN.INVOKE),
    INVOKE_SPECIAL: new RegExp(PATTERN.INVOKE_SPECIAL),
    TAG: new RegExp("\\s*"+PATTERN.TAG),
    REG_TAG: new RegExp(PATTERN.REF_REG_ONE+"\\s*"+PATTERN.TAG),
    FORMAT21C: new RegExp(PATTERN.FORMAT21C),
    FORMAT22C: new RegExp(PATTERN.FORMAT22C),
    FORMAT23X: new RegExp(PATTERN.FORMAT23X)
};

