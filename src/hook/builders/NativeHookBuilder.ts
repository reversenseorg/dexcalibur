import * as _md5_ from 'md5';

import {ModelBasicType, ModelObjectType} from "../../ModelType";
import {IDatabase, IDatabaseAdapter, IDbCollection} from "../../persist/orm/DbAbstraction";
import {CONST} from "../../CoreConst";
import ModelMethod from "../../ModelMethod";
import Util from "../../Utils";
import JavaMethodHook from "../JavaMethodHook";
import HookTemplateFragment from "../HookTemplateFragment";
import NativeFunctionHook from "../NativeFunctionHook";
import {ModelFunction} from "../../ModelFunction";
import {ModelVariable} from "../../ModelVariable";
import {DataType} from "../../types/DataType";
import {NativeHookBuilderException} from "../../errors/NativeHookBuilderException";
import ModelFile from "../../ModelFile";

const FRIDA_READ_API = ['readU8','readS8','readU16','readS16','readU32','readS32','readU64','readS64'];

function getLetterFromType(typename:string):string{
    for(const i in CONST.WORDS){
        if(CONST.WORDS[i]==typename) return i;
    }
    return null;
}


/**
 * To build Java Hook code according to rules
 *
 * @class
 */
export class NativeHookBuilder{

    getValueFromCpuContext(pVar:ModelVariable):string{
        let code = "";

        if(pVar.isRegister()){
            code = `this.context.${pVar.getRef()}`;
        }else{
            code = `this.context.${pVar.getRef().base}.add(${pVar.getRef().offset})`;
        }

        return code;
    }

    private _isFridaApiCompliant(pFunc:string){
        return (FRIDA_READ_API.indexOf(pFunc)>-1);
    }

    /**
     *
     * @param pVar
     * @param pParamOffset
     * @param pParName
     */
    getReadCodeFor(pVar:ModelVariable, pParamOffset = -1, pParName = "args"):string{
        let code = "";
        const t:DataType = pVar.getType();

        if(pParamOffset>-1){

            if(t.isString()){
                // add utf8 options
                code += 'readCString';
            }else{
                code = `read${t.signed ? 'S' : 'U'}${t.len}`;
                if(!this._isFridaApiCompliant(code)){
                    throw NativeHookBuilderException.TYPE_READER_IS_NOT_FRIDA_OK(t.name);
                }
            }

            code = `${pParName}[${pParamOffset}].${code}()`;
        }else{
            code = this.getValueFromCpuContext(pVar);
        }

        return code;
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
    makeArgsHelper(args_arr:ModelVariable[]){

        let param:ModelVariable = null;

        const helper:any = {
            // Value to pass to the "overload()" method of Frida
            decl: "",
            // Value to set as parameters name in the hook and in the call
            // to the hooked function
            hook_args: "",
            //hook_args_stub: "",
            // Format string for the logger
            //logger: "",
            data: "",
            types: ""
        };
        let v = 0, arg:string=null, dataval="", sep = '';
        const len = args_arr.length-1;

        for(let i=0; i<args_arr.length;  i++){

            param = args_arr[i];
            arg = param.getName()
            sep = (i<len ? ', ':' ');

            // TODO :  handle pointer
            if(!param.isPointer()){
                dataval = this.getReadCodeFor(param, i, 'args');
                helper.data += arg+":"+dataval+sep;
            }else{
                // not implemented
            }
            helper.types += `'${param.getType().getName()}'${sep}`;
            helper.hook_args +=  "args_"+v+sep;
            helper.decl +=  "args"+v+" "+sep;
            v++;
        }

        return helper;
    }

    /**
     *
     * @param ret
     */
    makeRetHelper(pRet:ModelVariable, pOnLeave = true):any{
        if(pRet == null) return null;

        const helper:any = {
            data: ""
        };

        helper.data += pRet.getName()+":";


        if(pOnLeave){
            helper.data += "ret";
        }else{
            helper.data += `this.context.${pRet.getRef()}`;
        }

        return helper;
    }

    static isCodeEmpty(pCode:string):boolean {
        return Util.isEmpty( pCode, Util.FLAG_WS|Util.FLAG_CR|Util.FLAG_TB);
    }

    /**
     * To merge fragments according to priority, and replacing tags
     * Fragment with preprocess disabled are not modified.
     *
     * @param pFragment
     * @param pTags
     */
    mergeFragments( pFragment:HookTemplateFragment[], pTags:any ):string{
        let script = "";
        let code:string;

        if(pFragment.length == 1){

            code = pFragment[0].getCodeTemplate();
            if(code==null || NativeHookBuilder.isCodeEmpty(code)) return script;

            script += `
              ${code}      
            `;

            // replace token
            if(pFragment[0].isPreProcessed()){
                for(const i in pTags){
                    do{
                        script = script.replace(i as string,pTags[i] as string);
                    }while(script.indexOf(i)>-1);
                }
            }

        }else{
            for(let i=pFragment.length-1; i>=0; i--){

                code = pFragment[i].getCodeTemplate();
                if(code==null || NativeHookBuilder.isCodeEmpty(code)) continue;

                script += `
                    ((@@__NESTED_ARGS__@@)=>{
                        ${code}  
                    })(@@__HOOK_ARGS__@@);
                `;

                if(pFragment[i].isPreProcessed()){
                    for(const k in pTags){
                        do{
                            script = script.replace(k as string,pTags[k] as string);
                        }while(script.indexOf(k)>-1);
                    }
                }
            }
        }

        return script;
    }

    static createDefaultBeforeFragment():string {
        return `send({ id:"@@__HOOK_ID__@@", msg:"@@__FUNCSIGN__@@", data:@@__ARGS_DATA__@@, after:false @@__ARGS_VAL__@@ });`;
    }

    static createDefaultAfterFragment():string {
        return `send({ id:"@@__HOOK_ID__@@", msg:"@@__FUNCSIGN__@@", data:@@__RET_DATA__@@, after:true @@__RET_VAL__@@ });`;
    }

    getCodeForFuncAddr(pFunc:ModelFunction, pMode:string):string{

        switch(pMode){
            case 'export': return  'Module.getExportByName(\'@@__LIB_FILE_NAME__@@\',\'@@__FN_SYM__@@\')';
            case 'addr': return 'ptr(\'@@__FN_ADDR__@@\')';
            case 'relative': return 'Module.findBaseAddress(\'@@__LIB_FILE_NAME__@@\').add(@@__FN_ADDR__@@)';
            default: return 'Module.findBaseAddress(\'@@__LIB_FILE_NAME__@@\').add(\'@@__FN_ADDR__@@\')';
        }
    }

    /**
     * To create the Frida hook script for a specific native function.
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
     "@@__HOOK_ID__@@": this.id,
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
    build( pNativeHook:NativeFunctionHook, pOptions:any = {}):string{

        /* TODO : implement MissingReference probing */

        const target:ModelFunction = pNativeHook.getTarget();
        let script:string = null;
        let after:string = null;
        let before:string = null;
        let replace:string = null;
        let fnAddr:string = null;

        const tags:any = {
            "@@__LIB_FILE_NAME__@@": "",
            "@@__FUNCDEF__@@": _md5_(target.getUID()),
            "@@__FUNCNAME__@@": (target.name=='<init>')? '$init' : target.name,
            "@@__FUNCSIGN__@@": target.getUID(),
            "@@__HOOK_ARGS__@@": "",
            "@@__NESTED_ARGS__@@": "",
            "@@__RET__@@": "",
            "@@__RET_TYPE__@@": target.getReturn().getType().getName(),
            "@@__ARGS_VAL__@@": "",
            "@@__ARGS_TYPE__@@":"[]",
            "@@__RET_VAL__@@": "",
            "@@__HOOK_ID__@@": pNativeHook.getGUID(),
            "@@__CTX__@@":"",
            "@@__ARGS_DATA__@@":"null",
            "@@__RET_DATA__@@":"",
            "@@__VAR__@@":"",
            "@@__FN_ADDR__@@": "0x"+target.getAddr().toString(16),
            "@@__FN_SYM__@@": target.getSymbol()
        };

        const lib = target.getDeclaringFile();



        if(typeof lib === 'string'){
            tags["@@__LIB_FILE_NAME__@@"] = lib;
        }else{
            tags["@@__LIB_FILE_NAME__@@"] = (lib as ModelFile).getName();
        }

        tags["@@__VAR__@@"] = "v"+_md5_(pNativeHook.getGUID())+"_VAR";
        pNativeHook.setVariableID(tags["@@__VAR__@@"]);

        //this.code.varID = tags["@@__VAR__@@"];

        const retHelper:any = this.makeRetHelper(target.getReturn(), true);
        tags["@@__RET_DATA__@@"] = "{"+retHelper.data+"}";

        // TODO : replace by keypoint namespace
        if(pNativeHook.parentID != null){
            tags["@@__CTX__@@"] = "ctx_"+_md5_(pNativeHook.parentID);
        }

        if(Object.keys(target.args).length > 0){
            const argHelper:any = this.makeArgsHelper(target.regvars);
            tags["@@__ARGS_DATA__@@"] = "{"+argHelper.data+"}";
            tags["@@__ARGS_TYPE__@@"] = "["+argHelper.types+"]";
            tags["@@__HOOK_ARGS__@@"] = argHelper.hook_args;
            tags["@@__NESTED_ARGS__@@"] = argHelper.decl;
        }


        /*
         TODO : dont redifine cls_$$ and meth_$$ when another hook has
          already defined it. Improve performance, reduce script size

          Define vars per key point namespace
         */

        if(pOptions.hasOwnProperty('ptr_mode')){
            fnAddr = this.getCodeForFuncAddr( target, pOptions.ptr_mode);
        }else{
            fnAddr = this.getCodeForFuncAddr( target, 'relative');
        }


        if(pNativeHook.hasBeforeFragments()){
            before = this.mergeFragments(pNativeHook.getBefore(), tags);
        }

        if(pNativeHook.hasAfterFragments()){
            after = this.mergeFragments(pNativeHook.getAfter(), tags);
        }

        if(pNativeHook.hasReplaceFragments()){

            replace = this.mergeFragments(pNativeHook.getReplace(), tags);

            if(before === null && after === null){
                script = `    
                    Interceptor.replace(
                        ${fnAddr},
                        new NativeCallback(function(@@__HOOK_ARGS__@@){
                            ${NativeHookBuilder.createDefaultBeforeFragment()}
                            
                            ${this.mergeFragments(pNativeHook.getReplace(), tags)}
                        }, '@@__RET_TYPE__@@', @@__ARGS_TYPE__@@)
                    );
                `;
            }else{
                script = `    
                    Interceptor.replace(
                        ${fnAddr},
                        new NativeCallback(function(@@__HOOK_ARGS__@@){
                            ${before!=null?before:''}
                            
                            ${this.mergeFragments(pNativeHook.getReplace(), tags)}
                           
                            ${after!=null?after:''}
                            
                        }, '@@__RET_TYPE__@@', @@__ARGS_TYPE__@@)
                    );
                `;
            }
        }else{
            script = `    
                Interceptor.attach(
                    ${fnAddr},
                    {
            `;
            if(before != null){
                script += `
                    onEnter: function(args){
                        ${before}
                    }${after!=null?',':''}`;
            }else{
                script += `
                    onEnter: function(args){
                        ${NativeHookBuilder.createDefaultBeforeFragment()}
                    }${after!=null?',':''}`;
            }
            if(after != null){
                script += `
                    onLeave: function(@@__RET__@@){
                        ${after}
                    }
                `
            }
            script += `
                });
            `;
        }


        // replace token
        for(const i in tags){
            do{
                script = script.replace(i,tags[i]);
            }while(script.indexOf(i)>-1);
        }

        return script;
    }
}