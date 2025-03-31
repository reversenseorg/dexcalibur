

import ModelMethod from "./ModelMethod.js";
import DexcaliburProject from "./DexcaliburProject.js";
import Util from "./Utils.js";
import {ModelBasicType, ModelObjectType} from "./ModelType.js";
import {CONST} from "./CoreConst.js";
import {ModelFunction} from "./ModelFunction.js";
import {ModelVariable} from "./ModelVariable.js";
import {CryptoUtils} from "./CryptoUtils.js";
import {CoreDebug} from "./core/CoreDebug.js";



function getLetterFromType(typename:string):string{
    for(let i in CONST.WORDS){
        if(CONST.WORDS[i]==typename) return i;
    }
    return null;
}



interface HookCode {
    varID:any,
    before: null,
    after: null,
    replace: null,
    custom: null
}



export default class Hook
{
    id:string = null;

    // ! important
    // It is used in order to link in-hook method call with method declared outside of the hook
    parentID:string = null;
    customName:boolean = false;
    name:string = null; //name;
    description:string = null;
    script:string = null;//src;
    enabled:boolean = true;
    native:boolean = false;
    isIntercept:boolean = false;
    onMatch = null;

    context:DexcaliburProject = null;
    edited:boolean = false;

    // JavaHook -> ModelMethod, NativeHook -> ?? , InstructionHook -> ??
    method:ModelMethod|ModelFunction = null;

    when:number = 0;

    after:boolean = false;
    before:boolean = false;

    color:any = null;
    code:any = null;
    variables:any = null;

    constraints:any = null;




    /**
     * Represente un hook (actif ou non)
     * @param {string} name The hook name
     * @param {string} src The hook script source code
     * @constructor
     */
    constructor(context:DexcaliburProject){
        this.context = context;
        this.code = {
            varID: null,
            before: null,
            after: null,
            replace: null,
            custom: null
        };
    }


    /**
     * Set enable flag with the given boolean.
     * @deprecated
     */
    setEnable(bool:boolean){
        this.enabled = bool;
        this.context.trigger({
            type: (bool==true? "probe.enable":"probe.disable"),
            data: {
                hook: this
            }
        });
    }

    enable(){
        this.enabled = true;
        this.context.trigger({
            type: "probe.enable",
            data: {
                hook: this
            }
        });
    }

    // TODO : replace 'probe.disable' by 'probe.enable'+value
    disable(){
        this.enabled = false;
        this.context.trigger({
            type: "probe.disable",
            data: {
                hook: this
            }
        });
    }

    isEnable():boolean{
        return this.enabled;
    }

    modifyScript(script:string):void{

        this.script = script;
        this.edited = true;

        this.context.trigger({
            type: "probe.post_code_change",
            data: {
                hook: this,
                method: this.method
            }
        });
    }

    hasVariables():boolean{
        return (this.variables!=null);
    }

    setupVariables():string{
        let code="\t\tvar "+this.code.varID+` = {
            `;
        for(let i in this.variables){
            code += "\t\t"+i+":";
            code += this.variables[i].write();
        }
        return code+`
            };`;
    }

    getVariable(name){
        return this.variables[name];
    }

    isModified():boolean{
        return this.edited;
    }

    isCustomHook():boolean{
        return this.code.custom != null;
    }

    getCustomCode():string{
        return this.code.custom;
    }

    setCustomCode(script:string):void{
        this.code.custom = script;
    }

    /**
     * To check if the hook is associated to a method/func
     *
     * @return {boolean}
     * @method
     */
    hasMethod():boolean {
        return (this.method!==null);
    }


    /**
     * To check if the hook is called before the hooked function
     * @returns {boolean} Returns TRUE if the hook is called before the function, else FALSE
     * @deprecated
     * @function
     */
    isBefore():boolean{
        return (this.when <= 0);
    }

    /**
     * To check if the hook is called after the hooked function
     * @returns {boolean} Returns TRUE if the hook is called after the function, else FALSE
     * @deprecated
     * @function
     */
    isAfter():boolean{
        return (this.when>0);
    }

    /**
     * To check if the hook perform an intercept (it modifiy value or execution path)
     * @returns {boolean} Returns TRUE if the hook is an intercept, else FALSE
     * @function
     *//*
    isIntercept(){
        return this.isIntercept;
    }*/

    /**
     * To set the Unique ID of the hook
     * @param {string} id The Unique ID of the hook
     * @returns {Hook} The instance of this hook
     * @function
     */
    setID(id:string):Hook{
        this.id = id;
        return this;
    }

    /**
     * To get the Unique ID of the hook
     * @returns {string} id The Unique ID of this hook
     * @function
     */
    getID():string{
        return this.id;
    }

    /**
     * To set the parent ID if available, like an HookSet ID.
     * @param {string} id The parent ID
     * @returns {Hook} The instance of this hook
     * @function
     */
    setParentID(id:string):Hook{
        this.parentID = id;
        return this;
    }

    /**
     * To get the parent ID if available, like an HookSet ID.
     * @returns {String} The parent ID
     * @function
     */
    getParentID():string{
        return this.parentID;
    }

    /**
     * To set the name of the hook.
     * By default, it's the signature of the hooked method
     * @param {string} name The parent ID
     * @returns {Hook} The instance of this hook
     * @function
     */
    setName(name:string):Hook{
        this.name = name;
        this.customName = true;
        return this;
    }

    /**
     * To set the built hook code to exec BEFORE the hooked function.
     * @param {string} code The built source code of the hook
     * @returns {Hook} The instance of this hook
     * @function
     */
    setInterceptBefore(code:string):Hook{
        this.code.before = code;
        return this;
    }

    /**
     * To set the built hook code to exec AFTER the hooked function.
     * @param {string} code The built source code of the hook
     * @returns {Hook} The instance of this hook
     * @function
     */
    setInterceptAfter(code:string):Hook{
        this.code.after = code;
        return this;
    }

    /**
     * To set the built hook code to exec in place of the hooked function.
     * @param {string} code The builnt source code of the hook
     * @returns {Hook} The instance of this hook
     * @function
     */
    setInterceptReplace(code:string):Hook{
        this.code.replace = code;
        return this;
    }

    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} - Returns an Object instance representing the type
     */
    toJsonObject(){
        let o:any = {};
        o.id = this.id;
        o.parentID = this.parentID;
        o.color = this.color;
        o.customName = this.customName;
        o.name = this.name;

        if(this.native){
            o.native = this.native;
            const f = (this.method as ModelFunction).getDeclaringFile();
            if(typeof f==='string')
                o.file = f;
            else if(f!==null)
                o.file = f.getName();
        }else{
            // add declaring file for multi-dex
            // o.file = (this.method as ModelMethod).getDeclaringFile().getName();
        }

        o.enable = this.enabled;
        o.method = this.method.signature();
        o.script = Util.b64_encode(Util.encodeURI(this.script));
        o.edited = this.edited;
        o.isIntercept = this.isIntercept;
        if(this.variables != null){
            o.variables = {
                id: this.code.varID,
                data: {}
            };

            for(let i in this.variables){
                o.variables.data[i] = this.variables[i].write();
            }
        }
        o.code = {
            //variable: (this.code.variable!=null)? UT.b64_decode(this.code.dynamic) : null,
            before: (this.code.before!=null)? Util.b64_encode(this.code.before) : null,
            after: (this.code.after!=null)? Util.b64_encode(this.code.after) : null,
            replace: (this.code.replace!=null)? Util.b64_encode(this.code.replace) : null,
        };
        CoreDebug.checkJsonSerialize(o, "Hook");
        return o;
    }

    updateWith(object:any, method:ModelMethod){
        this.id = object.id;
        this.parentID = object.parentID;
        this.customName = object.customName;
        this.name = object.name;
        this.enabled = object.enable;

        // resolve method
        this.method = method;

        this.script = Util.decodeURI(Util.b64_decode(object.script));
        this.edited = object.edited;
        this.isIntercept = object.isIntercept;
        this.code = {
            dynamic: (object.code.dynamic!=null)? Util.b64_decode(object.code.dynamic) : null,
            before: (object.code.before!=null)? Util.b64_decode(object.code.before) : null,
            after: (object.code.after!=null)? Util.b64_decode(object.code.after) : null,
            replace: (object.code.replace!=null)? Util.b64_decode(object.code.replace) : null,
        };
        return this;
    }

    // ------------- NATIVE ------------


    /**
     * To build the hook code dumping variables
     * @param pFn
     * @param pType
     */
    prepareVarDump(pFn: ModelFunction, pType:string, pOptions:any={}) {

        if(pFn.hasOwnProperty(pType)==false)
            throw new Error("[HOOK::MANAGER] Prepare var dump : Invalid variable type");

        let s:string = "{\n";
        let r:ModelVariable = null;
        const l = pFn[pType].length;

        for(let i=0; i<l; i++){
            r = pFn[pType][i];
            if(typeof r.refs==='string')
                s += 'arg_'+i+'_'+r.refs+': args['+i+']';
            else
                s += 'arg_'+i+': args['+i+']';

            switch(r.type.getName()){
                case 'int32_t':
                    s+='.toInt32()';
                    break;
            }

            s += (i<l-1?',':'');
        }

        return s+"\n}";
    }

    /**
     * To build the hook code dumping variables
     * @param pFn
     * @param pType
     */
    prepareCpuCtxDump(pSize:number=9, pOptions:any={}) {

        let s:string = "{\n";
        let r:ModelVariable = null;

        for(let i=0; i<pSize; i++){
            // add name depending of platform and reg size
            s += 'reg_'+0+': args['+i+']';
            // TODO : depend of address width and device
            switch('int32_t'){
                default:
                case 'int32_t':
                    s+='.toInt32()';
                    break;
            }

            s += (i<pSize-1?',':'');
        }

        return s+"\n}";
    }

    prepareRetval(pFn:ModelFunction, pOptions:any={}):string {
        let s:string = "{\n";

        pFn.regvars.map( vVar => {
            if (pFn.ctype == "arm32" && vVar.refs.reg == 'r0') {
                /*if(pOptions.dump!=null){

                }*/

                //if(vVar.type=="int32_t")
                    s += 'retval:retval.toInt32()';
            }
        });

        return s+"\n}";
    }

    /**
     * To create the Frida hook script for a specific method.
     * Each token starting and ending by "@@" will be replaced by his value
     * in the final script.
     *
     * The available tokens are :
     "@@__CLSDEF__@@": md5(method.enclosingClass.name),
     "@@__FQCN__@@": method.enclosingClass.name,
     "@@__METHDEF__@@": md5(method.__signature__),
     "@@__METHNAME__@@": (method.name=='<init>')? '$init' : method.name,
     "@@__METHSIGN__@@": method.__signature__,
     "@@__ARGS__@@": "",
     "@@__HOOK_ARGS__@@": "",
     "@@__HOOK_ARGS2__@@": "",
     "@@__RET__@@": "",
     "@@__ARGS_VAL__@@": "",
     "@@__HOOK_ID__@@": UT.b64_encode(this.id),
     "@@__CTX__@@":"",
     "@@__ARGS_DATA__@@":"null",
     "@@__RET_DATA__@@":"",
     *
     * The resulting script is stored into the 'script' field of
     * the 'Hook' instance.
     *
     * @param {Method} method The method to hook
     * @function
     */
    makeNativeHookFor(pFn:ModelFunction, pOptions:any={}):boolean{
        /* TODO : implement MissingReference probing */

        let tags:any = {
            "@@__LIB_FILE_NAME__@@": (pOptions.file != null? pOptions.file : null),
            "@@__FN_SYM__@@": pFn.getSymbol(),
            "@@__FN_ADDR__@@": "0x"+pFn.getAddr().toString(16),
            "@@__FN_UID__@@": CryptoUtils.md5(pFn.signature()),
            "@@__VAR__@@": "v"+CryptoUtils.md5(this.id)+"_VAR",
            "@@__HOOK_ID__@@": this.id,
            "@@__MSG__@@": "Native:"+pFn.getDeclaringFile()+':'+pFn.getSymbol(),
        };

        this.code.varID = tags["@@__VAR__@@"];

        if(this.parentID != null){
            tags["@@__CTX__@@"] = "ctx_"+CryptoUtils.md5(this.parentID);
        }


        if(pFn.regvars.length>0){
            tags["@@__REG_VAR_DUMP__@@"] = this.prepareVarDump(pFn, 'regvars', pOptions.regvar);
        }else{
            tags["@@__REG_VAR_DUMP__@@"] = this.prepareCpuCtxDump(9);
        }

        let script:string = 'Intercept.attach(';

        switch(pOptions.ptr_mode){
            case 'export':
                script += 'Module.getExportByName(\'@@__LIB_FILE_NAME__@@\',\'@@__FN_SYM__@@\')';
                break;
            case 'addr':
                script += 'ptr(\'@@__FN_ADDR__@@\')';
                break;
            case 'relative':
            default:
                script += 'Module.findBaseAddress(\'@@__LIB_FILE_NAME__@@\').add(\'@@__FN_ADDR__@@\')';
                break;

        }

        script += ', {';

        if(pOptions.onEnter){


            script += `
    onEnter: function(args){
        send({ 
            id:"@@__HOOK_ID__@@", 
            msg: "@@__MSG__@@ (in)",
            data:@@__REG_VAR_DUMP__@@, 
            action:"-", 
            after:false
        });
    }`;
        }


        if(pOptions.onLeave){

            tags["@@__RET_DATA__@@"] = this.prepareRetval(pFn, pOptions.ret);
            if(pOptions.onEnter)script += ', ';
            script += `
    onLeave: function(ret){
        send({ 
            id:"@@__HOOK_ID__@@", 
            data:@@__RET_DATA__@@, 
            msg: "@@__MSG__@@ (out)",
            action:"-", 
            after:true
        });
    }`;

        }

        script += `
});`;

        // replace token
        for(let i in tags){
            do{
                script = script.replace(i,tags[i]);
            }while(script.indexOf(i)>-1);
        }

        this.method = pFn;
        pFn.probing = true;
        this.name = pFn.signature();
        this.enable();
        this.script = script;
        return true;
        //console.log(script);
    }




    // ------------- JAVA --------------

    dataObjAutoCast(argtype:string, argname:string):string{
        let val:string = null;

        switch(argtype){
            case "java.lang.String":
                val = argname;
                break;
            case "java.lang.CharSequence":
                val = argname; //".toString()";
                break;
        }

        return val;
    }

    dataPrimAutoCast(argtype:string, argname:string):string{
        let val = null;

        switch(argtype){
            /* case "int":
                val = argname;
                break; */
            default:
                val = argname;
                break;
        }

        return val;
    }


    /**
     * To build the code source corresponding an array of parameters
     *
     * It builds :
     *  - Argument part of the signature needed by Frida in order
     *    to identtfy good function to overload
     *  - Source code of the object send by the hook to the frida client
     *
     * @param {ObjectType|BasicType} args_arr An array of Types
     * @function
     *
     */
    makeArgsHelper(args_arr:(ModelBasicType|ModelObjectType)[]){
        //if(Objectargs_arr.length ==0)
        //    return null;

        let raw_name:string = null;
        let helper:any = {
            // Value to pass to the "overload()" method of Frida
            call_signature: "",
            // Value to set as parameters name in the hook and in the call
            // to the hooked function
            hook_args: "",
            // Format string for the logger
            logger: "",
            // TODO
            data: "",
        };
        let v:number = 0, arg:string=null, dataval:string="";

        for(let i in args_arr){

            arg = "arg"+v;

            if(args_arr[i] instanceof ModelBasicType){

                raw_name = getLetterFromType(args_arr[i]._name);

                if(args_arr[i].arr){
                    helper.call_signature += "'["+raw_name+"',";
                }else{
                    helper.call_signature += "'"+args_arr[i]._name+"',";
                }

                dataval = this.dataPrimAutoCast(args_arr[i]._name,arg);
                if(dataval != null)
                    helper.data += arg+":"+dataval+",";

                helper.hook_args +=  arg+",";
            }
            else if(args_arr[i] instanceof ModelObjectType){

                if(args_arr[i].arr){
                    // frida 11.0.2
                    // helper.call_signature += "'[L"+args_arr[i]._name+"',";
                    // frida 12.2.26
                    helper.call_signature += "'[L"+args_arr[i]._name+";',";
                }else{
                    //helper.call_signature += "'L"+args_arr[i]._name+";',";
                    helper.call_signature += "'"+args_arr[i]._name+"',";
                }

                dataval = this.dataObjAutoCast(args_arr[i]._name,arg);
                if(dataval != null)
                    helper.data += arg+":"+dataval+",";

                helper.hook_args +=  arg+",";
            }
            v++;
        }

        helper.call_signature = helper.call_signature.substr(0,helper.call_signature.length-1);
        helper.hook_args = helper.hook_args.substr(0,helper.hook_args.length-1);
        return helper;
    };

    makeRetHelper(ret:ModelBasicType|ModelObjectType):any{
        if(ret == null) return null;

        let helper:any = {
            // Format string for the logger
            logger: "",
            // TODO
            data: "",
        };
        let dataval:string="";


        if(ret instanceof ModelBasicType){

            dataval = this.dataPrimAutoCast(ret._name,"ret");
            if(dataval != null)
                helper.data += "ret:"+dataval;
        }
        else if(ret instanceof ModelObjectType){

            dataval = this.dataObjAutoCast(ret._name,"ret");
            if(dataval != null)
                helper.data += "ret:"+dataval;
        }

        return helper;
    };


    /**
     * To create the Frida hook script for a specific method.
     * Each token starting and ending by "@@" will be replaced by his value
     * in the final script.
     *
     * The available tokens are :
     "@@__CLSDEF__@@": md5(method.enclosingClass.name),
     "@@__FQCN__@@": method.enclosingClass.name,
     "@@__METHDEF__@@": md5(method.__signature__),
     "@@__METHNAME__@@": (method.name=='<init>')? '$init' : method.name,
     "@@__METHSIGN__@@": method.__signature__,
     "@@__ARGS__@@": "",
     "@@__HOOK_ARGS__@@": "",
     "@@__HOOK_ARGS2__@@": "",
     "@@__RET__@@": "",
     "@@__ARGS_VAL__@@": "",
     "@@__HOOK_ID__@@": UT.b64_encode(this.id),
     "@@__CTX__@@":"",
     "@@__ARGS_DATA__@@":"null",
     "@@__RET_DATA__@@":"",
     *
     * The resulting script is stored into the 'script' field of
     * the 'Hook' instance.
     *
     * @param {Method} method The method to hook
     * @function
     */
    makeHookFor(method:ModelMethod, pOptions:any={}):boolean{
        /* TODO : implement MissingReference probing */

        let tags:any = {
            "@@__CLSDEF__@@": CryptoUtils.md5(method.enclosingClass.name),
            "@@__FQCN__@@": method.enclosingClass.name,
            "@@__METHDEF__@@": CryptoUtils.md5(method.__signature__),
            "@@__METHNAME__@@": (method.name=='<init>')? '$init' : method.name,
            "@@__METHSIGN__@@": method.__signature__,
            "@@__ARGS__@@": "",
            "@@__HOOK_ARGS__@@": "",
            "@@__HOOK_ARGS2__@@": "",
            "@@__RET__@@": "",
            "@@__ARGS_VAL__@@": "",
            "@@__HOOK_ID__@@": this.id,
            "@@__CTX__@@":"",
            "@@__ARGS_DATA__@@":"null",
            "@@__RET_DATA__@@":"",
            "@@__VAR__@@":""
        };

        tags["@@__VAR__@@"] = "v"+CryptoUtils.md5(this.id)+"_VAR";
        this.code.varID = tags["@@__VAR__@@"];

        let retHelp:any = this.makeRetHelper(method.ret);
        tags["@@__RET_DATA__@@"] = "{"+retHelp.data+"}";

        if(this.parentID != null){
            tags["@@__CTX__@@"] = "ctx_"+CryptoUtils.md5(this.parentID);
        }
        // @ts-ignore
        if(Object.keys(method.args).length > 0){
            let argHelp:any = this.makeArgsHelper(method.args);
            tags["@@__ARGS__@@"] = argHelp.call_signature;
            tags["@@__ARGS_DATA__@@"] = "{"+argHelp.data+"}";
            tags["@@__HOOK_ARGS__@@"] = argHelp.hook_args;
            tags["@@__HOOK_ARGS2__@@"] = ", "+argHelp.hook_args;
        }

        /*
        if(method.ret != null){
            if(!(method.ret instanceof CLASS.BasicType) || !method.ret.isVoid()){
                tags["@@__RET__@@"] = ", ret:ret";
            }
        }
        */

        /*
         TODO : dont redifine cls_$$ and meth_$$ when another hook has
          already defined it. Improve performance, reduce script size
         */

        let script:string = `
    
            var cls_@@__CLSDEF__@@ = Java.use('@@__FQCN__@@');
    
            var meth_@@__METHDEF__@@ = cls_@@__CLSDEF__@@.@@__METHNAME__@@.overload(@@__ARGS__@@);
    
            meth_@@__METHDEF__@@.implementation = function(@@__HOOK_ARGS__@@) {
        `;

        if(this.code.replace != null){
            script += this.code.replace;
            script += `
            }
    
            `;

            // replace token
            for(let i in tags){
                do{
                    script = script.replace(i as string,tags[i] as string);
                }while(script.indexOf(i)>-1);
            }

            this.method = method;
            this.name = method.__signature__;
            this.enable();
            this.script = script;

            return true;
        }

        // BEFORE insert
        if(this.isIntercept && this.code.before!=null){
            script += this.code.before;
        }else if(this.isIntercept == false){
            // __METHSIGN__
            script += `
                send({ id:"@@__HOOK_ID__@@", msg:"@@__METHSIGN__@@", data:@@__ARGS_DATA__@@, action:"None before", after:false @@__ARGS_VAL__@@ });
            `;
            /*script += `
                send({ id:"@@__HOOK_ID__@@", msg:"@@__FQCN__@@.@@__METHNAME__@@()", data:@@__ARGS_DATA__@@, action:"None before", after:false @@__ARGS_VAL__@@ });
            `;*/

        }

        script += `            var ret = meth_@@__METHDEF__@@.call(this @@__HOOK_ARGS2__@@);`;

        //  AFTER insert
        if(this.isIntercept && this.code.after!=null){
            script += this.code.after;
        }else if(this.isIntercept == false){
            script += `
                send({ id:"@@__HOOK_ID__@@", msg:"@@__METHSIGN__@@", data:@@__RET_DATA__@@, action:"None before", after:true @@__ARGS_VAL__@@ });
            `;
        }

        script += `
            return ret;
        }
        `;

        // replace token
        for(let i in tags){
            do{
                script = script.replace(i,tags[i]);
            }while(script.indexOf(i)>-1);
        }

        this.method = method;
        method.probing = true;
        this.name = method.__signature__;
        this.enable();
        this.script = script;
        return true;
    }



    buildCustomScript(method:ModelMethod):boolean{

        let builtScript:string = this.code.custom;
        let tags:any = {
            "@@__CLSDEF__@@": CryptoUtils.md5(method.enclosingClass.name),
            "@@__FQCN__@@": method.enclosingClass.name,
            "@@__METHDEF__@@": CryptoUtils.md5(method.__signature__),
            "@@__METHNAME__@@": (method.name=='<init>')? '$init' : method.name,
            "@@__METHSIGN__@@": method.__signature__,
            "@@__ARGS__@@": "",
            "@@__HOOK_ARGS__@@": "",
            "@@__HOOK_ARGS2__@@": "",
            "@@__RET__@@": "",
            "@@__ARGS_VAL__@@": "",
            "@@__HOOK_ID__@@": this.id,
            "@@__CTX__@@":"",
            "@@__ARGS_DATA__@@":"null",
            "@@__RET_DATA__@@":""
        };

        tags["@@__VAR__@@"] = "v"+tags["@@__HOOK_ID__@@"]+"_VAR";

        this.code.varID = tags["@@__VAR__@@"];


        let retHelp:any = this.makeRetHelper(method.ret);
        tags["@@__RET_DATA__@@"] = "{"+retHelp.data+"}";

        if(this.parentID != null){
            tags["@@__CTX__@@"] = "ctx_"+CryptoUtils.md5(this.parentID);
        }
        if(Object.keys(method.args).length > 0){
            let argHelp:any = this.makeArgsHelper(method.args);
            tags["@@__ARGS__@@"] = argHelp.call_signature;
            tags["@@__ARGS_DATA__@@"] = "{"+argHelp.data+"}";
            tags["@@__HOOK_ARGS__@@"] = argHelp.hook_args;
            tags["@@__HOOK_ARGS2__@@"] = ", "+argHelp.hook_args;
        }

        for(let i in tags){
            while(builtScript.indexOf(i)>-1){
                builtScript = builtScript.replace(i,tags[i]);
            }
        }

        this.script = builtScript;
        this.method = method;
        method.probing = true;
        this.name = method.__signature__;
        this.enable();

        return true;
    }

    generateDynamicCode(){
        //this.code.dynamic =
    }

    setMethod(method:ModelMethod){
        this.method = method;
    }

    getMethod():ModelMethod|ModelFunction{
        return this.method;
    }

}
