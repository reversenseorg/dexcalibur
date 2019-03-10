var ut = require("./Utils.js"); 
var OPCODE = require("./Opcode.js");
var CONST = require("./CoreConst.js");
const CLASS = require("./CoreClass.js");
const Chalk = require("chalk");

const SML_MAIN=0;
const SML_METH=1;
const SML_ANNO=2;
const ERR_PARSE=0;
const LOG_DBG = false;

var LEX = CONST.LEX;

// todo voir WABT, square attack, mesh

var LOG = {
    DEBUG: function(txt){
        if(LOG_DBG) console.log(txt); 
    }
};

// end of core class

var Checker = {
    isBasicType: function(c){
        return (CONST.TYPES[c] != undefined);
    },
    isObjectType: function(c){
        return c=="L";
    },
    makeFnHashcode: function(modif,cls,name,args,ret){
        let xargs = "";
        for(let i in args) xargs+="<"+args[i]._hashcode+">";
        return modif._name+"|"+cls.name+"|"+name+"|"+xargs+"|"+ret._hashcode;
    },
    makeFieldHashcode: function(modif,cls,name,type){
        //console.log(type);
        return modif._name+"|"+cls.name+"|"+name+"|"+type._hashcode;
    }
};


/**
 * Represent the Smali parser 
 * @constructor
 */
function Parser(){
    this.state = null; //  state of the parser
    this.subject = null; // parsed smali file
    this.obj = null;
    this.__tmp_meth = null;
    this.__tmp_block = null;

    this.__instr_ctr = null;
    this.__instr_line = null;

    
/*    this.isModifier = function(name){
        for(let i in LEX.MODIFIER) if(LEX.MODIFIER[i]==name) return true;
        return false;
    };    
*/
    this.isModifier = function(name){
        for(let i in LEX.MODIFIER) if(LEX.MODIFIER[i]==name) return true;
        return false;
    };    
/*
    this.isClassField = function(field){
        let ret = new CLASS.Class();
        //console.log(ret,field,ret[field],ret[field] !== undefined);
        return ret[field] !== undefined;
    };

    this.isMethodField = function(field){
        let ret = new CLASS.Method();
        return ret[field] !== undefined;
    };

    this.isFieldField = function(field){
        let ret = new CLASS.Field();
        return ret[field] !== undefined;
    };
*/
/*
    this.isAnnotationData = function(type,field){
        let ret = new CLASS.Annotation();
        return ret[field] != undefined;
    };
*/
    this.modifier = function(src){
        if(src instanceof String) src=src.split(LEX.TOKEN.SPACE);
        let mod = new CLASS.Modifiers(), next=true;

        //if(src.length<2) return ERR_PARSE;
        for(let i=0; i<src.length && next; i++){
            mod._match++;
            switch(ut.trim(src[i])){
                case LEX.MODIFIER.PRIVATE:
                    mod.visibility = CONST.JAVA.PRIVATE;
                    mod.private = true;
                    mod._name += "Pv";
                    break;
                case LEX.MODIFIER.PROTECTED:
                    mod.visibility = CONST.JAVA.PROTECTED;
                    mod.protected = true;
                    mod._name += "Pt";
                    break;
                case LEX.MODIFIER.PUBLIC:
                    mod.visibility = CONST.JAVA.PUBLIC;
                    mod.public = true;
                    mod._name += "Pb";
                    break;
                case LEX.MODIFIER.STATIC:
                    mod.static = true;
                    mod._name += "St";
                    break;
                case LEX.MODIFIER.VOLATILE:
                    mod.volatile = true;
                    mod._name += "Vl";
                    break;
                case LEX.MODIFIER.ABSTRACT:
                    mod.abstract = true;
                    mod._name += "Ab";
                    break;
                case LEX.MODIFIER.FINAL:
                    mod.final = true;
                    mod._name += "Fl";
                    break;
                case LEX.MODIFIER.CONSTR:
                    mod.constructor = true;
                    mod._name += "Ct";
                    break;
                case LEX.MODIFIER.SYNTHETIC:
                    mod.synth = true;
                    mod._name += "Sy";
                    break;
                case LEX.MODIFIER.ENUM:
                    mod.enum = true;
                    mod._name += "En";
                    break;
                case LEX.MODIFIER.TRANSIENT:
                    mod.transient = true;
                    mod._name += "Tr";
                    break;
                case LEX.MODIFIER.DECLSYNC:
                    mod.declsync = true;
                    mod._name += "Ds";
                    break;
                case LEX.MODIFIER.BRIDGE:
                    mod.bridge = true;
                    mod._name += "Br";
                    break;
                case LEX.MODIFIER.VARARG:
                    mod.varargs = true;
                    mod._name += "Va";
                    break;
                case LEX.MODIFIER.NATIVE:
                    mod.native = true;
                    mod._name += "Na";
                    break;
                case LEX.MODIFIER.INTERFACE:
                    mod.interface = true;
                    mod._name += "In";
                    break;
                case LEX.MODIFIER.ANNOTATION:
                    mod.annotation = true;
                    mod._name += "An";
                    break;
                default:
                    next=false;
                    mod._match--;
                    break;
            }
        }

        if(LOG_DBG){
            LOG.DEBUG("[parser::modifier] "+mod.sprint());
        }
        return mod;
    };

    this.fqcn = function(src){
        if(src.length==0) return ERR_PARSE;
        let raw="";
        raw = (src instanceof Array)? src[0] : src;

        // remove additional chars : "L"  at begin and ";" at end. 
        // console.log("PARSER::FQCN > ",src);
        let s=raw.substr(1,raw.length-2);
        while(s.indexOf("/")>-1) s=s.replace("/",".");
        
        LOG.DEBUG("[parser::fqcn] "+s);
        return s; 
    };

    this.fspath = function(src){
        let s=src;
        s = s.substr(s.indexOf(LEX.TOKEN.DELIMITER)+1);
        s = s.substr(0,s.indexOf(LEX.TOKEN.DELIMITER));
        LOG.DEBUG("[parser::fspath] "+s);
        return s;
    };

    // char 
    this.basicTypes = function(c){
        return CONST.TYPES[c];
    };



    this.class = function(src){
        let fqcn=null,end=-1;
        LOG.DEBUG("---------------------------------------------\n[parser::class] Start ");

        //console.log("[?] Instruction parsed : "+OPCODE.CTR);
        if(src instanceof String)
            src=ut.trim(src).split(LEX.STRUCT.SPACE); 
        
        if(src[0]==LEX.STRUCT.CLASS)   src.shift();

        this.obj = new CLASS.Class();
        //console.log(src);
        // parse modifiers
        this.obj.modifiers = this.modifier(src);
        //console.log(src);

        // clean src with identified modifier
        for(let i=0; i<this.obj.modifiers._match; i++) src.shift();

        // console.log(src);
        // parse nam
        fqcn = this.fqcn(src);
        end = fqcn.lastIndexOf(".");
        this.obj.fqcn = this.obj.name = fqcn;
        this.obj.package = fqcn.substr(0,end); 
        this.obj.simpleName = fqcn.substr(end+1); 
        if(this.obj.name.indexOf(LEX.TOKEN.INNER_FQCN)>-1){
            this.obj.simpleName = this.obj.simpleName.substr(this.obj.simpleName.indexOf(LEX.TOKEN.INNER_FQCN)+1);
            this.obj.innerClass = true;
            this.obj.enclosingClass = this.obj.name.substr(0,this.obj.name.indexOf(LEX.TOKEN.INNER_FQCN));
        } 

        this.obj._hashcode = this.obj.hashCode();

        LOG.DEBUG("[parser::class] End\n---------------------------------------------");
        //return obj;
    };


    this.type = function(src){
        let i=0,l=-1,types=[],s=src,fqn=null,isArray=false;

        while(i<src.length){
            if(src[i]==LEX.TOKEN.ARRAY){
                isArray=true;
                i++;
                continue;
            }

            if(src[i]==LEX.TOKEN.OBJREF){
                l=src.indexOf(";",i);
                fqn=this.fqcn(src.substr(i,l-i+1));
                //console.log(fqn);
                types.push(new CLASS.ObjectType(fqn, isArray));
                i=l+1;
                isArray=false;
                continue;

            }else if(Checker.isBasicType(src[i])){
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
    };


    this.methodHeader = function(src){
        let mod = this.modifier(src), raw=null, tmp=null, args=null, ret=null, sa=ea=0;
        let argTypes = null;
        // clean src with identified modifier
        for(let i=0; i<mod._match; i++) src.shift();

        if(src.length > 1){
            console.log(src);
            console.log("[!] Method has more modifiers");
        }

        this.__tmp_meth.modifiers = mod;
        raw = ut.trim(src[src.length-1]);

        // risque d'UTF8 / autre dans le nom, quid des regexp;
        tmp = raw.substr(0,sa=raw.indexOf(LEX.TOKEN.METH_ARG_B));  
        this.__tmp_meth.name = tmp;
        
        args = raw.substr(sa+1,(ea=raw.indexOf(LEX.TOKEN.METH_ARG_E))-sa-1)
        argTypes = this.type(ut.trim(args));
        this.__tmp_meth.args = argTypes;
        this.__tmp_meth.argsNb = this.__tmp_meth.args.length;

        ret=raw.substr(ea+1);
        ret = this.type(ut.trim(ret))
        if(ret.length == 0)
            console.log("[!] this.method error : return type of '"+tmp+"("+args+")' cannot be parsed.")
            //exit(0);

        this.__tmp_meth.enclosingClass = this.obj;
        this.__tmp_meth.ret = ret[0];

        this.__tmp_meth._hashcode = this.__tmp_meth.hashCode();/*Checker.makeFnHashcode(
            this.__tmp_meth.modifiers, 
            this.obj,
            this.__tmp_meth.name, 
            this.__tmp_meth.args,
            this.__tmp_meth.ret);*/
    };

    this.instr = function(src, raw_src, src_line){
        let inst = null;//new Instruction();

        inst = OPCODE.parse(src,raw_src, src_line);

        if(inst != null){
            //console.log(inst);
        }
        //inst.operands = inst.opcode.parse(src);
        //console.log('"'+src[0]+'"',inst.opcode);
        // todo
        return inst;
    };

    this.field = function(src_arr, src_line){
        let f=new CLASS.Field(), type=null, tmp=null;

        // parse modifiers
        f.modifiers = this.modifier(src_arr);
        
        // clean src with identified modifier
        for(let i=0; i<f.modifiers._match; i++) src_arr.shift();
        // parse name and type
        tmp=src_arr[0].split(":");
        
        f.name=tmp[0];

        type=this.type(tmp[1]);
        if(type.length>0) f.type=type[0];

        //console.log(type.type[0]._hashcode);

        f.enclosingClass = this.obj;
        f._hashcode = f.hashCode();//Checker.makeFieldHashcode(f.modifiers,this.obj,f.name,f.type);
        
        f.signature();
        f.oline = src_line;

        LOG.DEBUG("[parser::field] Hashcode : "+f._hashcode);

        src_arr.shift();

        // parse value if available
        if(src_arr.length>0){
            f.value = src_arr.pop();
        }
        return f;
    };


    this.method = function(src, raw_src, src_line){
        if(this.state != SML_METH) return null;
        
        let sml=src/*.split(LEX.SPACE)*/, hdl=null;

        // search lexeme
        switch(ut.trim(sml[0])){
            case LEX.STRUCT.METHOD_BEG:
                LOG.DEBUG("---------------------------------------------\n[parser::method] Start ");    
                this.__tmp_meth = new CLASS.Method();
                sml.shift();

                
                /*this.__tmp_meth.signature();
                if(this.__tmp_meth.name.indexOf("valueOf")>-1){

                   if(this.__tmp_meth.enclosingClass.name.indexOf("lang.Enum")>-1){
                       console.log(this.__tmp_meth);
                   }
                   // console.log(this.__tmp_meth);
               }*/

                this.methodHeader(sml,src_line);  
            
                this.__tmp_meth.__$in_annot = false;
                this.__tmp_block = new CLASS.BasicBlock();
                this.__instr_ctr = 0;
                break;
            case LEX.STRUCT.LOCALS:
                this.__tmp_meth.locals = parseInt(sml[1],10);
                break;
            case LEX.STRUCT.PARAMS:
                // this.__tmp_meth.params = parseInt(sml[1],10);
                this.__tmp_meth.params.push(
                    OPCODE.parseParam(sml[1],raw_src)
                );
                
                break;
            case LEX.STRUCT.REG:
                this.__tmp_meth.registers = parseInt(sml[1],10);
                break;
            case ".prologue":
                break;
            case LEX.STRUCT.LINE:
                /*
                :pswitch_data_0
                .packed-switch 0x1
                    :pswitch_0
                    :pswitch_1
                .end packed-switch
                */
                /*if(this.__tmp_block != null){
                    this.__tmp_block.offset = this.__tmp_meth.instr.length;
                    this.__tmp_meth.instr.push(this.__tmp_block); 
                }*/
                if(this.__tmp_block != null && this.__tmp_block.stack.length > 0){
                    this.__tmp_block.offset = this.__tmp_meth.instr.length;
                    this.__tmp_meth.instr.push(this.__tmp_block); 
                    this.__tmp_block = new CLASS.BasicBlock();
                }
                //  && this.__tmp_block.line != null
                this.__tmp_block.line = parseInt(sml[1],10);
                // source line number
                this.__tmp_block.srcln = parseInt(sml[1],10);
                
                break;
            case LEX.STRUCT.END:

                if(sml[1]!=undefined && sml[1]=="method"){
                    //hdl = this.__tmp_meth._hashcode;
                    this.state=SML_MAIN;   
                    this.__tmp_meth.instr.push(this.__tmp_block);   
                    
                    // la signature doit etre complete pour pouvoir ajouter les methodes heritee
                    // avec leur signature complete sans risque de conflit
                    // une surcharge sera alors identifiable si il y a deux methodes avec la meme __callSignature__
                    this.obj.methods[ this.__tmp_meth.signature()] = this.__tmp_meth;
                    this.obj._methCount++;
                    /*
                    this.obj.methods[hdl]
                    deepCopy(this.__tmp_meth, this.obj.methods[hdl])
                    deepCopy(this.__tmp_block, this.obj.methods[hdl].instr);
                    if(this.__tmp_block.modifier.constructor)
                        this.obj.cls.constructor.push(hdl);
                    */
                    LOG.DEBUG("[parser::method] End\n---------------------------------------------");
                }else if(sml[1]!=undefined && sml[1]=="annotation"){
                    this.__tmp_meth.__$in_annot = false;
                }
                break;
            case LEX.STRUCT.ANNOT_BEG:
                // ignore
                this.__tmp_meth.__$in_annot = true;
                break;
            default: 
                if(this.__tmp_meth.__$in_annot){
                    // ignore
                    break;
                }

                // next instr
                /*if(this.__tmp_block==null){ 
                    this.__tmp_block = new CLASS.BasicBlock();
                }*/

                if(sml[0].indexOf(':cond_')>-1){
                    if(this.__tmp_block.stack.length>0){
                        this.__tmp_block.offset = this.__tmp_meth.instr.length;
                        this.__tmp_meth.instr.push(this.__tmp_block); 
                        this.__tmp_block = new CLASS.BasicBlock();
                    }

                    //this.__tmp_block.tag = sml[0];
                    this.__tmp_block.setAsConditionalBlock(sml[0]);

                }else if(sml[0].indexOf(':goto_')>-1){
                    if(this.__tmp_block.stack.length>0){
                        this.__tmp_block.offset = this.__tmp_meth.instr.length;
                        this.__tmp_meth.instr.push(this.__tmp_block);                 
                        this.__tmp_block = new CLASS.BasicBlock();
                    }
                    //this.__tmp_block.tag = sml[0];
                    this.__tmp_block.setAsGotoBlock(sml[0]);

                }else if(sml[0].indexOf(':try_start')>-1){
                    if(this.__tmp_block.stack.length>0){
                        this.__tmp_block.offset = this.__tmp_meth.instr.length;
                        this.__tmp_meth.instr.push(this.__tmp_block);     
                        this.__tmp_block = new CLASS.BasicBlock();
                    }
                    //   this.__tmp_block.tag = sml[0];
                    this.__tmp_block.setAsTryBlock(sml[0]);
                    
                }else if(sml[0].indexOf(':try_end')>-1){
                    this.__tmp_block.setTryEndName(sml[0]);
                }else if(sml[0].indexOf('.catchall')>-1){
                    this.__tmp_block.setCatchCond(raw_src);
                }
                else if(sml[0].indexOf(':catchall')>-1){
                    if(this.__tmp_block.stack.length>0){
                        this.__tmp_block.offset = this.__tmp_meth.instr.length;
                        this.__tmp_meth.instr.push(this.__tmp_block);                     
                        this.__tmp_block = new CLASS.BasicBlock();
                    }
                    // this.__tmp_block.tag = sml[0];
                    this.__tmp_block.setAsCatchBlock(sml[0]);

                }else{
                    hdl = this.instr(sml,raw_src,src_line);

                    if(hdl !== null){
                        this.__instr_ctr++;
                        hdl.offset = this.__instr_ctr;
                        hdl.oline = this.__instr_ctr;
                        this.__tmp_block.stack.push(hdl);
                        //console.log("New instr")
                    }
                }



                break;
        }

        return true;
    };

    this.annotation = function(src){
        if(this.state != SML_ANNO) return null;

        let sml=[], hdl=null;

        sml=(src instanceof String)? src.split(LEX.TOKEN.SPACE) : src ;
        
        // search lexeme
        switch(ut.trim(sml[0])){
            case LEX.STRUCT.END:
                if(sml[1]!=undefined && sml[1]=="annotation"){
                    this.state=SML_MAIN;    
                }
                break;
        }
        //console.log("[!] this.annotation not implemented");
    };

    // openocd
    this.parse = function(src){
        let ls=src.split("\n"), ln=null, sml=null, obj=null;
    
        //console.log(ls);
        for(let l=0; l<ls.length; l++){
            ln=ut.trim(ls[l]);
            if(ln.length==0){
                continue;
            }
            sml=ln.split(LEX.TOKEN.SPACE);
            switch(sml[0]){
                case LEX.STRUCT.CLASS:
                    sml.shift();
                    this.class(sml);
                    break;
                case LEX.STRUCT.IMPLEMENTS:
                    sml.shift();
                    this.obj.implements.push(this.fqcn(sml[0]));
                    break;
                case LEX.STRUCT.SUPER:
                    sml.shift();
                    this.obj.extends = this.fqcn(sml[0]);
                    break;
                case LEX.STRUCT.SRC: 
                    this.obj.source = this.fspath(sml[1]);
                    break;
                case LEX.STRUCT.FIELD:
                    sml.shift();
                    obj=this.field(sml,l);
                    // use an internal name which combine visibility and field name
                    //this.obj.fields[obj._hashcode] = obj;
                    this.obj.fields[obj.signature()] = obj;
                    this.obj._fieldCount++;
                    
                    break;
                case LEX.STRUCT.METHOD_BEG:
                    this.state = SML_METH;
                    this.method(sml,ln,l);
                    break;
                case LEX.STRUCT.ANNOT_BEG:
                    if(this.state != SML_METH){
                        this.state = SML_ANNO;
                        this.annotation(sml);
                    }
                    break;
                default:
                    switch(this.state){
                        case SML_METH:
                            this.method(sml,ln,l);
                            break;
                        case SML_ANNO:
                            this.annotation(sml);
                            break;
                    }
                    break;
            }
        }
        //console.log(this.obj);
        //this.obj.dump();
        return this.obj;
    };
}

module.exports = Parser;    