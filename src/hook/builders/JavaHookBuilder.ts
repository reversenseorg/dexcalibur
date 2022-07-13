import * as _md5_ from 'md5';

import {ModelBasicType, ModelObjectType} from "../../ModelType";
import {IDatabase, IDatabaseAdapter, IDbCollection} from "../../persist/orm/DbAbstraction";
import {CONST} from "../../CoreConst";
import ModelMethod from "../../ModelMethod";
import Util from "../../Utils";
import JavaMethodHook from "../JavaMethodHook";
import HookTemplateFragment from "../HookTemplateFragment";


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
export class JavaHookBuilder{


    //private _rules:HookBuilderRule[] = [];
    //private _db:IDbCollection;


    /**
     * To return the code snippet required to cast an object instance
     * into a readable string according to its type
     *
     * @param argtype
     * @param argname
     */
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


    /**
     * To return the code snippet required to cast a primitive
     * into a readable string according to its type
     *
     * Example :
     *
     *
     * @param argtype
     * @param argname
     */
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
        const helper:any = {
            // Value to pass to the "overload()" method of Frida
            call_signature: "",
            // Value to set as parameters name in the hook and in the call
            // to the hooked function
            hook_args: "",
            hook_args_stub: "",
            // Format string for the logger
            logger: "",
            // TODO
            data: "",
        };
        let v = 0, arg:string=null, dataval="";

        for(const i in args_arr){

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


            helper.hook_args_stub +=  "a"+v+",";
            v++;
        }

        helper.call_signature = helper.call_signature.substr(0,helper.call_signature.length-1);
        helper.hook_args = helper.hook_args.substr(0,helper.hook_args.length-1);
        return helper;
    }

    makeRetHelper(ret:ModelBasicType|ModelObjectType):any{
        if(ret == null) return null;

        const helper:any = {
            // Format string for the logger
            logger: "",
            // TODO
            data: "",
        };
        let dataval ="";


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
    }

    static isCodeEmpty(pCode:string):boolean {
        return Util.isEmpty( pCode, Util.FLAG_WS|Util.FLAG_CR|Util.FLAG_TB);
    }

    private _replaceFragID( pCode:string, pFragID:string):string {

        do{
            pCode = pCode.replace("@@__FRAG_ID__@@", pFragID);
        }while(pCode.indexOf("@@__FRAG_ID__@@")>-1);

        return pCode;
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
        const tags = pTags;


        if(pFragment.length == 1){

            code = pFragment[0].getCodeTemplate();
            if(code==null || JavaHookBuilder.isCodeEmpty(code)) return script;

            script += `
              ${this._replaceFragID(code,pFragment[0].getUID()) }      
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
                if(code==null || JavaHookBuilder.isCodeEmpty(code)) continue;

                script += `
                    (function(@@__HOOK_ARGS_STUBS__@@){
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

    static createDefaultBeforeFragment():string {
        return `send({ id:"@@__HOOK_ID__@@", msg:"@@__METHSIGN__@@", data:@@__ARGS_DATA__@@, action:"None before", after:false @@__ARGS_VAL__@@ });`;
    }

    static createDefaultAfterFragment():string {
        return `send({ id:"@@__HOOK_ID__@@", msg:"@@__METHSIGN__@@", data:@@__ARGS_DATA__@@, action:"None before", after:false @@__ARGS_VAL__@@ });`;
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
    build( pJavaHook:JavaMethodHook):string{

        /* TODO : implement MissingReference probing */

        const target:ModelMethod = pJavaHook.getTarget();
        const tags:any = {
            "@@__CLSDEF__@@": _md5_(target.enclosingClass.name),
            "@@__FQCN__@@": target.enclosingClass.name,
            "@@__METHDEF__@@": _md5_(target.getUID()),
            "@@__METHNAME__@@": (target.name=='<init>')? '$init' : target.name,
            "@@__METHSIGN__@@": target.getUID(),
            "@@__ARGS__@@": "",
            "@@__HOOK_ARGS__@@": "",
            "@@__HOOK_ARGS2__@@": "",
            "@@__HOOK_ARGS_STUBS__@@": "",
            "@@__RET__@@": "",
            "@@__ARGS_VAL__@@": "",
            "@@__HOOK_ID__@@": Util.b64_encode(pJavaHook.getGUID()),
            "@@__CTX__@@":"",
            "@@__ARGS_DATA__@@":"null",
            "@@__RET_DATA__@@":"",
            "@@__VAR__@@":""
        };

        tags["@@__VAR__@@"] = "v"+_md5_(pJavaHook.getGUID())+"_VAR";
        pJavaHook.setVariableID(tags["@@__VAR__@@"]);

        //this.code.varID = tags["@@__VAR__@@"];

        const retHelper:any = this.makeRetHelper(target.ret);
        tags["@@__RET_DATA__@@"] = "{"+retHelper.data+"}";

        if(pJavaHook.parentID != null){
            tags["@@__CTX__@@"] = "ctx_"+_md5_(pJavaHook.parentID);
        }

        if(Object.keys(target.args).length > 0){
            const argHelper:any = this.makeArgsHelper(target.args);
            tags["@@__ARGS__@@"] = argHelper.call_signature;
            tags["@@__ARGS_DATA__@@"] = "{"+argHelper.data+"}";
            tags["@@__HOOK_ARGS__@@"] = argHelper.hook_args;
            tags["@@__HOOK_ARGS2__@@"] = ", "+argHelper.hook_args;
            tags["@@__HOOK_ARGS_STUB__@@"] = ", "+argHelper.hook_args_stub;
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

          Define vars per key point namespace
         */



        let script = `
    
            var cls_@@__CLSDEF__@@ = Java.use('@@__FQCN__@@');
            var meth_@@__METHDEF__@@ = cls_@@__CLSDEF__@@.@@__METHNAME__@@.overload(@@__ARGS__@@);
            meth_@@__METHDEF__@@.implementation = function(@@__HOOK_ARGS__@@) {
                var ret = null;
        `;

        /*
        if(pJavaHook.hasReplaceFragments()){
            script += this.mergeFragments(pJavaHook.getReplace(), tags);
            script += `
            }
    
            `;
            return script;
        }*/

        // BEFORE insert
        if(pJavaHook.hasBeforeFragments()){
            script += this.mergeFragments(pJavaHook.getBefore(), tags);
        }else{
            script += JavaHookBuilder.createDefaultBeforeFragment();
        }

        if(pJavaHook.hasReplaceFragments()){
            script += this.mergeFragments(pJavaHook.getReplace(), tags);
        }else{
            script += `            
                ret = meth_@@__METHDEF__@@.call(this @@__HOOK_ARGS2__@@);
               `;
        }


        //  AFTER insert
        if(pJavaHook.hasAfterFragments()){
            script += this.mergeFragments(pJavaHook.getAfter(), tags);
        }/*else{
            script += JavaHookBuilder.createDefaultAfterFragment();
        }*/

        script += `
            return ret;
        }
        `;

        // replace token
        for(const i in tags){
            do{
                script = script.replace(i,tags[i]);
            }while(script.indexOf(i)>-1);
        }

        return script;
    }


    /*
    buildCustom(pJavaHook:JavaMethodHook):boolean{

        const target:ModelMethod = pJavaHook.getTarget();
        let builtScript:string = pJavaHook.getCustomFragment();

        const tags:any = {
            "@@__CLSDEF__@@": _md5_(target.enclosingClass.name),
            "@@__FQCN__@@": target.enclosingClass.name,
            "@@__METHDEF__@@": _md5_(target.__signature__),
            "@@__METHNAME__@@": (target.name=='<init>')? '$init' : target.name,
            "@@__METHSIGN__@@": target.__signature__,
            "@@__ARGS__@@": "",
            "@@__HOOK_ARGS__@@": "",
            "@@__HOOK_ARGS2__@@": "",
            "@@__RET__@@": "",
            "@@__ARGS_VAL__@@": "",
            "@@__HOOK_ID__@@": Util.b64_encode(this.id),
            "@@__CTX__@@":"",
            "@@__ARGS_DATA__@@":"null",
            "@@__RET_DATA__@@":""
        };

        tags["@@__VAR__@@"] = tags["@@__HOOK_ID__@@"]+"_VAR";

        pJavaHook.setVariableID(tags["@@__VAR__@@"]);


        const retHelp:any = this.makeRetHelper(target.ret);
        tags["@@__RET_DATA__@@"] = "{"+retHelp.data+"}";

        if(this.parentID != null){
            tags["@@__CTX__@@"] = "ctx_"+_md5_(this.parentID);
        }
        if(Object.keys(target.args).length > 0){
            let argHelp:any = this.makeArgsHelper(target.args);
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

        return true;
    }*/
}