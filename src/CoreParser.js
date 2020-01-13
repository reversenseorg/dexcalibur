
var CONST = require("./CoreConst.js");
const CLASS = require("./CoreClass.js");
var ut = require("./Utils.js");

var LOG_DBG = true;
var LOG = {
    DEBUG: function(txt){
        if(LOG_DBG) console.log(txt); 
    }
};




var LEX = {};
var PATTERN = {
    FQCN: "L(.+);",
    REF_FIELD: "L([^;]+);->(.+):(\[?[A-Za-z]((.+);)?)",
	REF_REG: "([vp])([0-9]+),?",
    REF_REG_ONE: "([vp])([0-9]+),",
    REF_REG_INV: "\{([vp])([0-9]+)\}",
    REF_REG_INTER: "\{([vp][0-9]+) +\.\. +([vp][0-9]+)\}",
    REF_REG_ARR: "\{([vp][0-9]+)(L([^;]+);->(.+):,[vp][0-9]+)*\}",
    REF_REG_MULT: "([vp][0-9]+)(?:, *([vp][0-9]+))?(?:, *([vp][0-9]+))?(?:, *([vp][0-9]+))?(?:, *([vp][0-9]+))?(?:, *([vp][0-9]+))",
    STR_VAL: "\"(.*)\"$",
    LIT_VAL: "(-?0x[0-9a-f]+)",
    METH: "(.*)\(([^)]*)\)(\[?[A-Za-z]((.+);)?)",
    PRIM_T: "([CJDBISZVLF])",
    TAG: ":([a-z_]+)_([0-9a-f]+)",
};

PATTERN.STR_INSTR = PATTERN.REF_REG_ONE+"\\s*"+PATTERN.STR_VAL;
PATTERN.CONST_LIT_INSTR = PATTERN.REF_REG_ONE+"\\s*"+PATTERN.LIT_VAL;

PATTERN.CONST_CLASS_INSTR = PATTERN.REF_REG_ONE+"\\s*(("+PATTERN.FQCN+")|"+PATTERN.PRIM_T+")";
PATTERN.CONST_CLASS_MULT_INSTR = PATTERN.REF_REG_ONE+"\\s*\\[+(("+PATTERN.FQCN+")|"+PATTERN.PRIM_T+")";
PATTERN.INVOKE = " *"+PATTERN.FQCN+"->(.*)";
PATTERN.INVOKE_SPECIAL = " *([)?"+PATTERN.PRIM_T+"->(.*)";

PATTERN.FORMAT21C = " *([)?"+PATTERN.PRIM_T+"(.*);? *";
PATTERN.FORMAT22C = " *(\\[)?"+PATTERN.PRIM_T+"([^;]+)?;? *";

PATTERN.REG_TAG = PATTERN.REF_REG_ONE+"\\s*"+PATTERN.TAG;

var RX = {
    FQCN: new RegExp("L(.+);"),
    REF_FIELD: new RegExp("L([^;]+);->(.+):(\[?[A-Za-z]((.+);)?)"),
	REF_REG: new RegExp("([vp])([0-9]+),?"),
    REF_REG_ARR: new RegExp("\{([vp][0-9]+)(,[vp][0-9]+)*\}"),
    REF_REG_MULT: new RegExp(PATTERN.REF_REG_MULT),
    REF_REG_INTER: new RegExp(PATTERN.REF_REG_INTER),
    REF_REG_INV: new RegExp(PATTERN.REF_REG_INV),
    STR_VAL: new RegExp("\"(.*)\"$"),
    PRIM_T: new RegExp(PATTERN.PRIM_T),
    INVOKE: new RegExp(PATTERN.INVOKE),
    INVOKE_SPECIAL: new RegExp(PATTERN.INVOKE_SPECIAL),
    TAG: new RegExp("\\s*"+PATTERN.TAG),
    REG_TAG: new RegExp(PATTERN.REF_REG_ONE+"\\s*"+PATTERN.TAG),
    FORMAT21C: new RegExp(PATTERN.FORMAT21C),
    FORMAT22C: new RegExp(PATTERN.FORMAT22C)
};


module.exports = {
    LEX: LEX,
    RX: RX,
    PATTERN: PATTERN,
    PARSER: {
        isModifier: function(name){
            for(let i in CONST.LEX.MODIFIER) if(CONST.LEX.MODIFIER[i]==name) return true;
            return false;
        },
        fqcn: function(src){
            if(src.length==0) return null;

            let raw="";
            raw = (src instanceof Array)? src[0] : src;
     
            while(raw.indexOf("/")>-1) raw=raw.replace("/",".");
            
            return raw; 
        },
        type: function(src){
            let i=0,l=-1,types=[],s=src,fqn=null,isArray=false,m=null;
            
            while(i<src.length){
                if(src[i]==CONST.LEX.TOKEN.ARRAY){
                    isArray=true;
                    i++;
                    continue;
                }
    
                if(src[i]==CONST.LEX.TOKEN.OBJREF){
                    l=src.indexOf(";",i);
                    fqn=this.fqcn(src.substr(i+1,l-i-1));
                    //fqn=this.fqcn(src.substr(i,l-i+1));
                    //console.log(fqn);
                    types.push(new CLASS.ObjectType(fqn, isArray));
                    i=l+1;
                    isArray=false;
                    continue;
    
                }else if( (m=RX.PRIM_T.exec(src[i]))!==null){
                    types.push(new CLASS.BasicType(src[i], isArray));
                    i++;
                    isArray = false;
                    continue;
                }
                else{
                    console.log("[!] Unknow type : "+src[i]+" (in "+src+")");
                    break;
                }
            }
    
            return types;
        },
        methodName: function(raw_src){
            let mod = null, raw=null, tmp=null, args=null, ret=null, sa=ea=0;
            let info = { name:null, args:null, ret:null };

            raw = ut.trim(raw_src);
    
            // risque d'UTF8 / autre dans le nom, quid des regexp;
            info.name = raw.substr(0,sa=raw.indexOf(CONST.LEX.TOKEN.METH_ARG_B));  
            args = raw.substr(sa+1,(ea=raw.indexOf(CONST.LEX.TOKEN.METH_ARG_E))-sa-1)
           
            info.args = this.type(ut.trim(args));
            
            ret=raw.substr(ea+1);
            info.ret = this.type(ut.trim(ret))[0];

            return info;
        }
    }
}