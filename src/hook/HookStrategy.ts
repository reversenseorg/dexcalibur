/**
 * Represents the object which search pattern into application and generate
 * corresponding insttrumentation.
 *
 * By default, such HookStrategy are executed when the application has been analyzed,
 * however if it is attached to particular a particular event, it can be trigged earlier or later.
 *
 * @class
 */
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

export default class HookStrategy {

    /**
     * Search Engine request
     * @private
     */
    search:HookStrategySelector = null;

    hooks:AbstractHook[] = []

    weight:number = -1;

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
            for(let i in pConfig)
                this[i] = pConfig[i];


    }

    static from(pConfig:any):HookStrategy {
        const o:HookStrategy = new HookStrategy(pConfig);

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
                    h = pContext.hook.createJavaMethodHook( pRes, this.key_point);
                }

                h.appendBefore(this.before);
                h.appendAfter(this.after);
                h.appendReplace(this.replace);

                h.build(pContext);
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
                const m:ModelMethod = pContext.find.get.method(x)

                if(m != null){
                    pContext.getHookManager().createJavaMethodHook(m, this.load_kp).unloadOn(this.unload_kp);
                }
            });
        }
        else if(this.search.isNativeFunc()){
            this.search.getUids().map( (x:string) => {
                const m:ModelFunction = pContext.find.get.func(x)

                if(m != null){
                    pContext.getHookManager().createNativeFunctionHook(m, this.load_kp).unloadOn(this.unload_kp);
                }
            });
        }
        else if(this.search.isSystemCall()){

        }
    }
}