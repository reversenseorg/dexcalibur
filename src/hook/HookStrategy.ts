

import DexcaliburProject from "../DexcaliburProject.js";
import HookStrategySelector from "./HookStrategySelector.js";
import * as VM from "vm";
import {FinderResult} from "../search/FinderResult.js";
import JavaMethodHook from "./JavaMethodHook.js";
import KeyPoint from "./KeyPoint.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import {AbstractHook, HOOK_FRAGMENT_POS, UID_POS_MAPPING} from "./AbstractHook.js";
import ModelMethod from "../ModelMethod.js";
import {ModelFunction} from "../ModelFunction.js";
import NativeFunctionHook from "./NativeFunctionHook.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {HookManager} from "./HookManager.js";
import * as Log from "../Logger.js";
import {CryptoUtils} from "../CryptoUtils.js";
import {CoreDebug} from "../core/CoreDebug.js";

export const DEFAULT_PRIORITY = -1;

const Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * Represents the object which search a pattern into the application graphs and generate
 * corresponding instrumentation.
 *
 * By default, such HookStrategy are executed when the application has been analyzed,
 * however if it is attached to a particular event, it can be trigged earlier or later.
 *
 * A hook strategy search a group of nodes to hook, and it generate fragments of hook code
 * inserted before/intead-of/after selected codes.
 *
 * Finally the hook manager will merge all fragments according to conditions (key point, shared code, requirements, ...)
 * and generate final script for each node.
 *
 * @class
 */
export default class HookStrategy {


    static TYPE:NodeType = new NodeType( "hook_strategy", NodeInternalType.HOOK_STRATEGY, []);

    __:NodeInternalType = NodeInternalType.HOOK_STRATEGY;

    _uid:string = null;
    name:string = null;
    descr:string = null;

    /**
     * A boolean to turn ON/OFF auto-emit of event for each hook trigged
     *
     * @type {boolean}
     * @field
     */
    autoEmit:boolean = false;

    /**
     * The name of the event emitted
     *
     * @type {string}
     * @field
     */
    emitEvent:string = null;

    preprocessor: string = null;
    /**
     * Search Engine request
     * @private
     */
    search:HookStrategySelector = null;

    /**
     * @deprecated
     */
    //hooks:AbstractHook[] = []

    weight = DEFAULT_PRIORITY;

    before:HookTemplateFragment = null;
    after:HookTemplateFragment = null;
    replace:HookTemplateFragment = null;

    on:string = null;

    onMatch:any = null;

    loadOn:string = null;
    unloadOn:string = null;

    load_kp:KeyPoint = null;
    unload_kp:KeyPoint = null;

    key_point:KeyPoint = null;

    passed = 0;


    /**
     * Group of hook
     *
     * @param {*} config
     * @constructor
     *
     */
    constructor(pConfig:any=null){

        this.passed = 0;

        // this.requiresNode = [];
        if(pConfig!=null)
            for(const i in pConfig)
                this[i] = pConfig[i];


    }

    /**
     * To create a hook strategy from raw object
     *
     * @param {any} pConfig
     * @return {HookStrategy}  A fresh HookStrategy instance
     * @method
     * @static
     */
    static from(pConfig:any):HookStrategy {
        const o:HookStrategy = new HookStrategy(pConfig);

        if(pConfig.preprocessor != null){
            o.updatePreprocessorSrc(pConfig.preprocessor);
        }

        if(o.search != null){
            o.search = HookStrategySelector.from(o.search);
        }

        if(pConfig.before != null){
            o.before = new HookTemplateFragment();
            o.before.setStrategy(o);
            o.before.template = pConfig.before;
        }

        if(pConfig.after != null){
            o.after = new HookTemplateFragment();
            o.after.setStrategy(o);
            o.after.template = pConfig.after;
        }

        if(pConfig.replace != null){
            o.replace = new HookTemplateFragment();
            o.replace.setStrategy(o);
            o.replace.template = pConfig.replace;
        }

        return o;
    }

    /**
     * To get strategy UID
     *
     * @return {string} Object UID
     * @method
     */
    getUID():string {
        return this._uid;
    }


    /**
     * To generate an UID for a hook fragment
     *
     * @param pPosition
     * @param pFrag
     * @param {HookStrategy} pStrategy  The parent strategy
     * @return {string} Generate UID for hook fragment template for a specified strategy
     * @method
     * @static
     */
    static generateFragmentUID( pPosition:HOOK_FRAGMENT_POS, pFrag:HookTemplateFragment, pStrategy:HookStrategy = null):string {
        if(pStrategy != null){
            return CryptoUtils.md5( pStrategy.getUID()+':'+UID_POS_MAPPING[pPosition]+':'+pFrag.name, 'hex' );
        }else{
            return CryptoUtils.md5( '::::'+UID_POS_MAPPING[pPosition]+':'+pFrag.name, 'hex' );
        }

    }

    /**
     * Set strategy UID and compute new UID for children fragments
     *
     * @param {string} pUID Strategy UID
     * @method
     */
    setUID(pUID:string) {
        this._uid = pUID;
        if(this.before != null){
            this.before.setUID(
                HookStrategy.generateFragmentUID(HOOK_FRAGMENT_POS.BEFORE, this.before, this)
            );
        }
        if(this.after != null){
            this.after.setUID(
                HookStrategy.generateFragmentUID(HOOK_FRAGMENT_POS.AFTER, this.after, this)
            );
        }
        if(this.replace != null){
            this.replace.setUID(
                HookStrategy.generateFragmentUID(HOOK_FRAGMENT_POS.REPLACE, this.replace, this)
            );
        }
    }

    getName():string {
        return this.name;
    }

    setName(pName:string) {
        this.name = pName;
    }

    hasLoadKeyPoint():boolean {
        return (this.load_kp != null) || (this.loadOn != null);
    }

    hasUnloadKeyPoint():boolean {
        return (this.unload_kp != null) || (this.unloadOn != null);
    }

    setUnloadKeyPoint( pKeyPoint:KeyPoint):void {
        this.unload_kp = pKeyPoint;
    }

    setLoadKeyPoint( pKeyPoint:KeyPoint):void {
        this.load_kp = pKeyPoint;
    }

    setSearchEngineRequest(pRequest:string) {
        this.search.setRequest(pRequest);
    }

    getSearchEngineRequest():string {
        return this.search.getRequest();
    }

    triggerOn(pEventName:string):void {
        this.on = pEventName;
    }

    updatePreprocessorSrc( pSource:string):void {
        this.preprocessor = pSource;
        this.onMatch = new Function('pCtx', 'pEvent', this.preprocessor);
    }

    setPreprocessorFn( pFunc:any):void {
        this.preprocessor = null;
        this.onMatch = pFunc;
    }
    /**
     *
     * @param pContext
     * @private
     */
    private _runOnSEResults(pContext:DexcaliburProject):boolean{

        const hm:HookManager = pContext.getHookManager();
        const results:FinderResult = (VM.runInNewContext('project.find.' + this.search.getRequest() + ';', { project: pContext }) as FinderResult);

        if(this.search.isMethod()){
            results.foreach( (vI, pRes)=>{
                if(!pRes.hasOwnProperty('__') || (pRes.__!=NodeInternalType.METHOD)){

                    Logger.error("[HOOK STRATEGY] _runOnSEResults (project.find." + this.search.getRequest() + "): Not a method : "+JSON.stringify(Object.keys(pRes)));
                    return;
                }

                let h:JavaMethodHook = pContext.hook.getJavaMethodHook( pRes);
                let create = false;

                if(h == null){
                    h = pContext.hook.createJavaMethodHook( pRes, { loadKP: this.load_kp });
                    h.setContext(pContext);
                    h.unloadOn(this.unload_kp);
                    create = true;
                }

                if(this.before != null) h.appendBefore(this.before);
                if(this.after != null) h.appendAfter(this.after);
                if(this.replace != null) h.appendReplace(this.replace);

                h.build();

                hm.save(h,create);

                if(this.onMatch != null){
                    pContext.getHookManager().addMatchListener(h.getGUID(), this.onMatch);
                }

            })
        }
        else if(this.search.isNativeFunc()){
            results.foreach( (pRes)=>{
                if(!pRes.hasOwnProperty('__') || (pRes.__!=NodeInternalType.FUNC)){
                    return;
                }

            })
        }
        else if(this.search.isSystemCall()){

        }
        else if(this.search.isRaw()){

        }

        // mark as passed
        return true;
    }

    /**
     * To run the strategy :  it research things to hook and create hook
     *
     * @param {DexcaliburProject} pContext The current project
     * @param {boolean} Force to run if the strategy is already passed
     * @return {number} Return `passed` flag
     * @method
     */
    run(pContext:DexcaliburProject, pForce = false, pDbCreate = false):number{

        // skip if already executed previously
        if((this.passed == 1) && !pForce){
            return 1;
        }

        // if there is a search request
        if(this.search.getRequest() != null){
            this.passed = this._runOnSEResults(pContext) ? 1 : 0;

            pContext.hook.save(this,pDbCreate);
            return this.passed;
        }

        const hm:HookManager = pContext.getHookManager();

        // else
        if(this.search.isMethod()){
            this.search.getUids().map( (x:string) => {
                let jhook:JavaMethodHook = null;
                let create = false;
                const m:ModelMethod = pContext.find.get.method(x)

                // if method is missing, create it
                if(m == null){
                    pContext.getAnalyzer().createMissingMethod(x);

                }

                if(m != null){
                    jhook = hm.getJavaMethodHook(m);

                    if(jhook == null){
                        jhook = hm.createJavaMethodHook(m, {loadKP:  this.load_kp })
                        jhook.unloadOn(this.unload_kp);
                        create = true;
                    }

                    if(this.before != null) jhook.appendBefore(this.before);
                    if(this.after != null) jhook.appendAfter(this.after);
                    if(this.replace != null) jhook.appendReplace(this.replace);

                    // update hook script
                    jhook.build();

                    hm.save(jhook, create);


                    if(this.preprocessor != null){
                        hm.addMatchListener(jhook.getGUID(), this.preprocessor);
                    }
                }
            });
        }
        else if(this.search.isNativeFunc()){
            this.search.getUids().map( (x:string) =>
            {
                let nhook:NativeFunctionHook = null;
                const m:ModelFunction = pContext.find.get.func(x);
                let create = true;

                if(m != null){
                    nhook = hm.getNativeFunctionHook(m)

                    if(nhook == null){
                        nhook = hm.createNativeFunctionHook(m, {loadKP:  this.load_kp });
                        nhook.unloadOn(this.unload_kp);
                        create = true;
                    }


                    if(this.before != null) nhook.appendBefore(this.before);
                    if(this.after != null) nhook.appendAfter(this.after);
                    if(this.replace != null) nhook.appendReplace(this.replace);

                    nhook.build();
                    hm.save(nhook,create);


                    if(this.preprocessor != null){
                        hm.addMatchListener(nhook.getGUID(), this.preprocessor);
                    }
                }
            });
        }
        else if(this.search.isSystemCall()){

        }
        // mark as passed
        this.passed = 1;
        pContext.hook.save(this, pDbCreate);
        return this.passed;
    }

    /**
     * NOT USED
     *
     * @param pSource
     */
    static newPreprocessorFn( pSource: string):any {
        return (new Function('pCtx', 'pEvent', pSource)) ;
    }

    /**
     * To export to json
     */
    toJsonObject():any{
        const o:any = {};
        for(const i in this){
            switch(i){
                case 'after':
                case 'before':
                case 'replace':
                    // @ts-ignore
                    o[i] = (this[i] !== null ? (this[i] as HookTemplateFragment).toJsonObject() : null);
                    break;
                case 'load_kp':
                case 'unload_kp':
                case 'key_point':
                    // @ts-ignore
                    o[i] = (this[i] !== null ? (this[i] as KeyPoint).getUID() : null);
                    break;
                case 'search':
                    o.search = (this.search !== null ? this.search.toJsonObject() : null);
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        CoreDebug.checkJsonSerialize(o, "HookStrategy");
        return o;
    }
}