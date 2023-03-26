import DexcaliburProject from "./DexcaliburProject.js";
import ModelMethod from "./ModelMethod.js";
import Hook from "./Hook.js";
import {HookVariable, HookVariableArray, HookVariableObject} from "./HookVariable.js";
import HookSet from "./HookSet.js";
import * as Log from './Logger.js';
import * as md5 from 'md5';

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * @class
 */
export default class HookPrimitive
{
    when:number = null;
    method_signature:string = null;
    isIntercept:boolean = false;
    isCustom:boolean = false;
    interceptBefore:any = null;
    interceptAfter:any = null;
    interceptReplace:any = null;
    onMatch:any = null;
    custom:boolean = false;
    variables:HookVariable[] = null;
    raw:any = null;
    color:any;
    customCode:string = null;


    /**
     * To represent a hook primitive.
     * A hook primitive is like a hook template, it allows a developer or a user
     * to define hooks in different files and combine it in order to be injected
     * by using a single script.
     * @constructor
     */
    constructor(pConfig:any=null){
        if(pConfig!=null) {
            for (let i in pConfig) {
                if (i != "multiple_method" && i != "method")
                    this[i] = pConfig[i];
            }
        }
        if(pConfig.method!=null)
            this.method_signature = pConfig.method;
    }


    /**
     * Create a object shared with others hook callback
     * @param {Object} config Shared object config
     */
    /*HookPrimitive.prototype.addVariable(config){
        this.variable = config;
        return this;
    }*/

    /**
     * Get the shared object from this hookset
     * @returns {Object} Shared object
     * @function
     */
    getVariables():HookVariable[]{
        return this.variables;
    }


    setMethod(method:string){
        this.method_signature = method;
    }

    // TODO : cleanup
    buildRawMethod(raw:ModelMethod){
        raw.__signature__ = raw.signature();
        return raw;
    }

    /**
     * To built a probing hook from the current primitive
     * @param {DexcaliburProject} context The reference to the current Project instance
     * @param {HookSet} set The hookset where the hook primitive is defined
     * @returns {Hook} The hook ready to be injected
     * @function
     */
    toProbe(context:DexcaliburProject, pHookGroup:HookSet){
        let hook:Hook = new Hook(context), method:ModelMethod=null;

        hook.variables = this.variables;

        if(this.raw == null)
            method = context.find.get.method(this.method_signature);
        else
            method = this.buildRawMethod(this.raw);

        if(method==undefined){
            Logger.error("[HOOK] Method not found by signature");
            console.log(this);
        }
        //hook.setID( context.hook.nextHookIdFor(method));
        hook.setID( md5(context.hook.nextHookIdFor(method)));

        hook.setParentID(pHookGroup.id);//name);
        hook.makeHookFor(method);

        return hook;
    }


    /**
     * To built an intercepting hook from the current primitive
     * @param {Project} context The reference to the current Project instance
     * @param {HookSet} set The hookset where the hook primitive is defined
     * @returns {Hook} The hook ready to be injected
     * @function
     */
    toIntercept(context:DexcaliburProject, set:HookSet){

        let hook:Hook = new Hook(context);
        let method:ModelMethod;

        hook.variables = this.variables;

        if(this.raw == null)
            method = context.find.get.method(this.method_signature);
        else{
            method = this.buildRawMethod(this.raw);
            //console.log(method, context.hook.nextHookIdFor(method));
        }

        hook.setID( md5(context.hook.nextHookIdFor(method)));
        hook.setParentID(set.id);//name);
        hook.isIntercept = true;
        hook.onMatch = this.onMatch;

        //console.log(this);
        if(this.interceptBefore != null){
            hook.setInterceptBefore(this.interceptBefore);
        }
        if(this.interceptAfter != null){
            hook.setInterceptAfter(this.interceptAfter);
        }
        if(this.interceptReplace != null){
            hook.setInterceptReplace(this.interceptReplace);
        }
        if(this.customCode != null){
            hook.setCustomCode(this.customCode);
        }


        if(!hook.isCustomHook()){
            hook.makeHookFor(method);
        }else{
            hook.buildCustomScript(method);
        }

        hook.color = this.color;
        //console.log(hook);
        return hook;
    }

    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} Returns an Object instance representing the type
     */
    toJsonObject():any{
        let o:any = {};

        o.when = this.when;
        o.method = this.method_signature;
        o.interceptBefore = (this.interceptBefore!=null)?this.interceptBefore:null;
        o.interceptAfter = (this.interceptAfter!=null)?this.interceptAfter:null;
        o.interceptReplace = (this.interceptReplace!=null)?this.interceptReplace:null;
        // o.onMatch
        return o;
    }
}


