/**
 * Represents the object which search pattern into application and generate
 * corresponding insttrumentation.
 *
 * By default, such HookStrategy are executed when the application has been analyzed,
 * however if it is attached to particular a particular event, it can be trigged earlier or later.
 *
 * @class
 */
import * as _md5_ from "md5";
import DexcaliburProject from "../DexcaliburProject";
import HookStrategySelector from "./HookStrategySelector";
import * as VM from "vm";
import {FinderResult} from "../FinderResult";
import HookTemplate from "./HookTemplate";
import {IHook} from "./IHook";
import JavaMethodHook from "./JavaMethodHook";
import KeyPoint from "./KeyPoint";
import HookTemplateFragment from "./HookTemplateFragment";
import {AbstractHook} from "./AbstractHook";
import ModelMethod from "../ModelMethod";
import {ModelFunction} from "../ModelFunction";
import NativeFunctionHook from "./NativeFunctionHook";
import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";

export const DEFAULT_PRIORITY = -1;

export default class HookStrategy {


    static TYPE:NodeType = new NodeType( "hook_strategy", NodeInternalType.HOOK_STRATEGY, []);

    __:NodeInternalType = NodeInternalType.HOOK_STRATEGY;

    _uid:string = null;
    name:string = null;
    descr:string = null;

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



    /**
     * Group of hook
     *
     * @param {*} config
     */
    constructor(pConfig:any=null){

        // this.requiresNode = [];
        if(pConfig!=null)
            for(const i in pConfig)
                this[i] = pConfig[i];


    }

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
            o.before.strategy = o;
            o.before.template = pConfig.before;
        }

        if(pConfig.after != null){
            o.after = new HookTemplateFragment();
            o.after.strategy = o;
            o.after.template = pConfig.after;
        }

        if(pConfig.replace != null){
            o.replace = new HookTemplateFragment();
            o.replace.strategy = o;
            o.replace.template = pConfig.replace;
        }

        return o;
    }

    getUID():string {
        return this._uid;
    }

    setUID(pUID:string) {
        this._uid = pUID;
        if(this.before != null){
            this.before.setUID( _md5_( pUID+':bef') );
        }
        if(this.after != null){
            this.after.setUID( _md5_( pUID+':aft') );
        }
        if(this.replace != null){
            this.replace.setUID( _md5_( pUID+':repl') );
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
    private _runOnSEResults(pContext:DexcaliburProject){

        const results:FinderResult = (VM.runInNewContext('project.find.' + this.search.getRequest() + ';', { project: pContext }) as FinderResult);

        if(this.search.isMethod()){
            results.foreach( (pRes)=>{
                let h:JavaMethodHook = pContext.hook.getJavaMethodHook( pRes, this.key_point);
                if(h == null){
                    h = pContext.hook.createJavaMethodHook( pRes, { loadKP: this.key_point });
                }

                if(this.before != null) h.appendBefore(this.before);
                if(this.after != null) h.appendAfter(this.after);
                if(this.replace != null) h.appendReplace(this.replace);

                h.build(pContext);

                if(this.onMatch != null){
                    pContext.getHookManager().addMatchListener(h.getGUID(), this.onMatch);
                }

            })
        }
        else if(this.search.isNativeFunc()){

        }
        else if(this.search.isSystemCall()){

        }
        else if(this.search.isRaw()){

        }
    }

    /**
     * To run the strategy :  it research things to hook and create hook
     * @param pContext
     */
    run(pContext:DexcaliburProject){


        if(this.search.getRequest() != null){
            return this._runOnSEResults(pContext);
        }

        if(this.search.isMethod()){
            this.search.getUids().map( (x:string) => {
                let jhook:JavaMethodHook = null;
                const m:ModelMethod = pContext.find.get.method(x)

                if(m != null){
                    jhook = pContext.getHookManager().createJavaMethodHook(m, {loadKP:  this.load_kp })
                    jhook.unloadOn(this.unload_kp);
                    if(this.before != null) jhook.appendBefore(this.before);
                    if(this.after != null) jhook.appendAfter(this.after);
                    if(this.replace != null) jhook.appendReplace(this.replace);
                    jhook.build(pContext);


                    if(this.onMatch != null){
                        pContext.getHookManager().addMatchListener(jhook.getGUID(), this.onMatch);
                    }
                }
            });
        }
        else if(this.search.isNativeFunc()){
            this.search.getUids().map( (x:string) =>
            {
                let nhook:NativeFunctionHook = null;
                const m:ModelFunction = pContext.find.get.func(x)

                if(m != null){
                    nhook = pContext.getHookManager().createNativeFunctionHook(m, {loadKP:  this.load_kp });
                    nhook.unloadOn(this.unload_kp);
                    if(this.before != null) nhook.appendBefore(this.before);
                    if(this.after != null) nhook.appendAfter(this.after);
                    if(this.replace != null) nhook.appendReplace(this.replace);
                    nhook.build();


                    if(this.onMatch != null){
                        pContext.getHookManager().addMatchListener(nhook.getGUID(), this.onMatch);
                    }
                }
            });
        }
        else if(this.search.isSystemCall()){

        }
    }

    static newPreprocessorFn( pSource: string):any {
        return (new Function('pCtx', 'pEvent', pSource)) ;
    }
}