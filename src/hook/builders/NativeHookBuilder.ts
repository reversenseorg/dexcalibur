/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {CONST} from "../../CoreConst.js";
import Util from "../../Utils.js";
import HookTemplateFragment from "../HookTemplateFragment.js";
import NativeFunctionHook from "../NativeFunctionHook.js";
import {ModelFunction} from "../../ModelFunction.js";
import {ModelVariable} from "../../ModelVariable.js";
import {DataType} from "../../types/DataType.js";
import {NativeHookBuilderException} from "../../errors/NativeHookBuilderException.js";
import ModelFile from "../../ModelFile.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {CryptoUtils} from "../../CryptoUtils.js";
import {Nullable} from "@reversense/dxc-core-api";
import {TargetLanguage} from "../common.js";
import {HookOptions} from "../HookManager.js";

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


    private ctx:DexcaliburProject;

    constructor(pContext:DexcaliburProject){
        this.ctx = pContext;
    }

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

    private _serializeAs( pDataType: DataType, pValExpress:string, pLang:TargetLanguage):string {
        if(pDataType.isReference){
            // if type is known, try to read data form memory, else return addr
        }
        return pValExpress;
    }

    /**
     *
     * @param ret
     */
    makeRetHelper(pRet:Nullable<ModelVariable>, pLang:TargetLanguage, pOnLeave = true):any{
        if(pRet == null) return null;

        const helper:any = {
            data: ""
        };

        //
        helper.data += pRet.getName()+":";
        const d = (pOnLeave ? "ret" : `this.context.${pRet.getRef()}`);
        helper.data += (pRet.getType()==null ? d : this._serializeAs(pRet.getType(),d, pLang));

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
              ${this._replaceFragID(code,pFragment[0].getUID())}      
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
                        ${this._replaceFragID(code,pFragment[i].getUID())}  
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

    static createDefaultFragment():string {
        return `DXC.send( "@@__HOOK_ID__@@", "@@__FRAG_ID__@@", @@__ARGS_DATA__@@ );`;
    }

    static createDefaultAfterFragment():string {
        return `DXC.send({ id:"@@__HOOK_ID__@@", msg:"@@__FUNCSIGN__@@", data:@@__RET_DATA__@@, after:true @@__RET_VAL__@@ });`;
    }

    private _replaceFragID( pCode:string, pFragID:string):string {

        do{
            pCode = pCode.replace("@@__FRAG_ID__@@", pFragID);
        }while(pCode.indexOf("@@__FRAG_ID__@@")>-1);

        return pCode;
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
    build( pNativeHook:NativeFunctionHook, pOptions:Nullable<HookOptions> = null):string{

        /* TODO : implement MissingReference probing */

        const target:ModelFunction = pNativeHook.getTarget();
        let script:string = null;
        let after:string = null;
        let before:string = null;
        let replace:string = null;
        let fnAddr:string = null;

        const tags:any = {
            "@@__LIB_FILE_NAME__@@": "",
            "@@__FUNCDEF__@@": CryptoUtils.md5(target.getUID()),
            "@@__FUNCNAME__@@": (target.name=='<init>')? '$init' : target.name,
            "@@__FUNCSIGN__@@": target.getUID(),
            "@@__APP_NAME__@@": this.ctx.getPackageName(),
            "@@__HOOK_ARGS__@@": "",
            "@@__NESTED_ARGS__@@": "",
            "@@__RET__@@": "",
            "@@__RET_TYPE__@@": (target.getReturn()==null ? "void" :target.getReturn().getType().getName()),
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

        if(pOptions!=null && pOptions.lib!=null){
            if(typeof pOptions.lib ==="string"){
                tags["@@__LIB_FILE_NAME__@@"]  = pOptions.lib;
            }else{
                tags["@@__LIB_FILE_NAME__@@"]  = (pOptions.lib as ModelFile).getName();
            }
        }


        tags["@@__VAR__@@"] = "v_"+CryptoUtils.md5(pNativeHook.getGUID())+"_VAR";
        pNativeHook.setVariableID(tags["@@__VAR__@@"]);

        let varDecl = '';
        if (pNativeHook.hasVariables()) {
            varDecl = pNativeHook.setupVariables();
        }

        //this.code.varID = tags["@@__VAR__@@"];

        const retHelper:any = this.makeRetHelper(target.getReturn(), pNativeHook.lang,  true);
        tags["@@__RET_DATA__@@"] = retHelper==null ? "null": "{"+retHelper.data+"}";

        // TODO : replace by keypoint namespace
        if(pNativeHook.parentID != null){
            tags["@@__CTX__@@"] = "ctx_"+CryptoUtils.md5(pNativeHook.parentID);
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


            if(before === null && after === null){
                script = `    
                    ${varDecl}
                    Interceptor.replace(
                        ${fnAddr},
                        new NativeCallback(function(@@__HOOK_ARGS__@@){
                            ${this.mergeFragments(pNativeHook.getReplace(), tags)}
                        }, '@@__RET_TYPE__@@', @@__ARGS_TYPE__@@)
                    );
                `;
            }else{
                script = `    
                    ${varDecl}
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
                ${varDecl}
                Interceptor.attach(
                    ${fnAddr},
                    {
            `;
            if(before != null){
                script += `
                    onEnter: function(args){
                        ${before}
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