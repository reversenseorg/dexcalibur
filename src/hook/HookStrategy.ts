import DexcaliburProject from "../DexcaliburProject.js";
import HookStrategySelector, {HookStrategySelectorOptions} from "./HookStrategySelector.js";
import * as VM from "vm";
import {FinderResult} from "../search/FinderResult.js";
import JavaMethodHook from "./JavaMethodHook.js";
import KeyPoint from "./KeyPoint.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import {HOOK_FRAGMENT_POS, UID_POS_MAPPING} from "./AbstractHook.js";
import ModelMethod from "../ModelMethod.js";
import {ModelFunction} from "../ModelFunction.js";
import NativeFunctionHook from "./NativeFunctionHook.js";
import {INode, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;
import {HookManager} from "./HookManager.js";
import * as Log from "../Logger.js";
import {CryptoUtils} from "../CryptoUtils.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {HookVariableMap, InspectorState, TargetLanguage} from "./common.js";
import {Nullable} from "../core/IStringIndex.js";
import {HookRevision, HookRevisionSubject, RevisionOperation} from "../HookRevision.js";
import {UPGRADE_MODE} from "../inspector/common.js";
import Util from "../Utils.js";
import {InspectorManagerException} from "../errors/InspectorManagerException.js";
import {Operation} from "../search/MerlinSearchRequest.js";

export const DEFAULT_PRIORITY = -1;

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface HookStrategyOptions {
    name:string;
    search:HookStrategySelectorOptions;
    autoEmit?:boolean;
    emitEvent?:Nullable<string>;
    descr?:Nullable<string>;
    before?:Nullable<string>;
    after?:Nullable<string>;
    replace?:Nullable<string>;
    loadOn?:Nullable<string>;
    unloadOn?:Nullable<string>;
    deprecated?:boolean;
    removed?:boolean;
    [key:string] :any;
}

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
export default class HookStrategy implements INode{


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
     * The name of the event emitted.
     *
     * It is added by the engine after fragment lookup from the hook message
     *
     * @type {string}
     * @field
     */
    emitEvent:string = null;

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


    loadOn:string = null;
    unloadOn:string = null;

    load_kp:KeyPoint = null;
    unload_kp:KeyPoint = null;

    key_point:KeyPoint = null;

    lang:TargetLanguage = TargetLanguage.TS;

    passed = 0;
    variables: HookVariableMap = {};

    tags:TagUUID[] = [];

    deprecated = false;
    removed = false;


    /**
     * Group of hook
     *
     * @param {*} config
     * @constructor
     *
     */
    constructor(pConfig:Nullable<HookStrategyOptions>=null){

        this.passed = 0;

        // this.requiresNode = [];
        if(pConfig!=null) {
            for (const i in pConfig)
                this[i] = pConfig[i];
        }

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

        //if(pConfig.preprocessor != null){
        //    o.updatePreprocessorSrc(pConfig.preprocessor);
        //}

        if(o.search != null){
            o.search = HookStrategySelector.from(o.search);
        }

        if(pConfig.before != null){
            o.before = new HookTemplateFragment();
            o.before.setStrategy(o);
            o.before.template = pConfig.before;
            if(pConfig.emitEvent) o.before.setEventType(pConfig.emitEvent);
            if(pConfig.autoEmit) o.before.setAutoEmit(pConfig.autoEmit);

        }

        if(pConfig.after != null){
            o.after = new HookTemplateFragment();
            o.after.setStrategy(o);
            o.after.template = pConfig.after;
            if(pConfig.emitEvent) o.after.setEventType(pConfig.emitEvent);
            if(pConfig.autoEmit) o.after.setAutoEmit(pConfig.autoEmit);
        }

        if(pConfig.replace != null){
            o.replace = new HookTemplateFragment();
            o.replace.setStrategy(o);
            o.replace.template = pConfig.replace;
            if(pConfig.emitEvent) o.replace.setEventType(pConfig.emitEvent);
            if(pConfig.autoEmit) o.replace.setAutoEmit(pConfig.autoEmit);
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
        if(pKeyPoint==null) return;
        this.unload_kp = pKeyPoint;
        this.unloadOn = pKeyPoint.getUID();
    }

    setLoadKeyPoint( pKeyPoint:KeyPoint):void {
        if(pKeyPoint==null) return;
        this.load_kp = pKeyPoint;
        this.loadOn = pKeyPoint.getUID();
    }

    setSearchEngineRequest(pRequest:string|Operation[]) {
        this.search.setRequest(pRequest);
    }

    getSearchEngineRequest():string|Operation[] {
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
    private async _runOnSEResults(pContext:DexcaliburProject):Promise<boolean>{

        const hm:HookManager = pContext.getHookManager();
        const results:FinderResult = (VM.runInNewContext('project.find.' + this.search.getRequest() + ';', { project: pContext }) as FinderResult);

        const res=results.list();
        let pRes:any;
        let success = false;
        let t:ModelMethod[] = [];

        Logger.info(`[HOOK STRATEGY] [uid=${this.getUID()}] _runOnSEResults : ${res.length}`);

        if(this.search.isMethod()){
            for(let i=0; i<res.length;i++){
                pRes = res[i];
                if(pRes==null || !pRes.hasOwnProperty('__') || (pRes.__!=NodeInternalType.METHOD)){

                    if(pRes!=null){
                        Logger.error("[HOOK STRATEGY] _runOnSEResults (project.find." + this.search.getRequest() + "): Not a method : "+JSON.stringify(Object.keys(pRes)));
                    }else{
                        Logger.error("[HOOK STRATEGY] _runOnSEResults (project.find." + this.search.getRequest() + "): NULL ");
                    }

                    continue;
                }

                if(pRes._uid!=null && pRes.__signature__==null){
                    // node ref
                    t = await pContext.getProjectDB().search({
                        __signature__:pRes._uid
                    }, NodeInternalType.METHOD);
                    if(t.length>0){
                        pRes = t[0];
                    }else{
                        Logger.info(`[HOOK STRATEGY] [uid=${this.getUID()}] _runOnSEResults : skip result ${pRes._uid}`);
                        continue;
                    }
                }

                let h:JavaMethodHook = hm.getJavaMethodHook(pRes);
                let create = false;

                if(h == null){
                    h = await hm.createJavaMethodHook( pRes, { loadKP: this.load_kp });
                    h.setContext(pContext);
                    h.unloadOn(this.unload_kp);
                    create = true;
                }

                if(Object.keys(this.variables).length>0) h.mergeVariables(this.variables);
                if(this.before != null) h.appendBefore(this.before);
                if(this.after != null) h.appendAfter(this.after);
                if(this.replace != null) h.appendReplace(this.replace);

                h.build(this.lang);

                await hm.save(h,create);

                success = success || true;
            }
        }
        else if(this.search.isNativeFunc()){

            for(let i=0; i<res.length;i++){
                pRes = res[i];
                if(pRes==null || !pRes.hasOwnProperty('__') || (pRes.__!=NodeInternalType.FUNC)){
                    return false;
                }
            }
        }
        else if(this.search.isSystemCall()){

        }
        else if(this.search.isRaw()){

        }

        // mark as passed
        return true;
    }


    private async _searchAndCreateMethodHook( pUID:string, pContext:DexcaliburProject):Promise<void>{
        let jhook:JavaMethodHook = null;
        let create = false;
        const hm = pContext.getHookManager();

        const m:ModelMethod = pContext.find.get.method(pUID)

        // if method is missing, create it
        if(m == null){
            pContext.getAnalyzer().createMissingMethod(pUID);

        }

        if(m != null){
            jhook = hm.getJavaMethodHook(m);

            if(jhook == null){
                jhook = await hm.createJavaMethodHook(m, {loadKP:  this.load_kp })
                jhook.unloadOn(this.unload_kp);
                create = true;
            }

            if(Object.keys(this.variables).length>0) jhook.mergeVariables(this.variables);
            if(this.before != null) jhook.appendBefore(this.before);
            if(this.after != null) jhook.appendAfter(this.after);
            if(this.replace != null) jhook.appendReplace(this.replace);

            // update hook script
            jhook.build(this.lang);
            await hm.save(jhook, create);
        }
    }


    private async _searchAndCreateNativeFnHook( pUID:string, pContext:DexcaliburProject):Promise<void>{
        let nhook:NativeFunctionHook = null;
        const m:ModelFunction = pContext.find.get.func(pUID);
        const hm = pContext.getHookManager();
        let create = true;

        if(m != null){
            nhook = hm.getNativeFunctionHook(m)

            if(nhook == null){
                nhook = await hm.createNativeFunctionHook(m, {loadKP:  this.load_kp });
                nhook.unloadOn(this.unload_kp);
                create = true;
            }

            if(Object.keys(this.variables).length>0) nhook.mergeVariables(this.variables);
            if(this.before != null) nhook.appendBefore(this.before);
            if(this.after != null) nhook.appendAfter(this.after);
            if(this.replace != null) nhook.appendReplace(this.replace);

            nhook.build(this.lang);
            await hm.save(nhook,create);
        }
    }


    /**
     * To run the strategy :  it research things to hook and create hook
     *
     * @param {DexcaliburProject} pContext The current project
     * @param {boolean} pForce to run if the strategy is already passed
     * @return {number} Return `passed` flag
     * @method
     */
    async run(pContext:DexcaliburProject, pForce = false, pDbCreate = false):Promise<number>{

        // skip if already executed previously
        if((this.passed == 1) && !pForce){
            return 1;
        }

        Logger.info(`[HOOK STRATEGY] [uid=${this.getUID()}] Run `);

        const hm:HookManager = pContext.getHookManager();
        // if there is a search request
        if(this.search.getRequest() != null){
            this.passed = await this._runOnSEResults(pContext) ? 1 : 0;
            await hm.save(this, pDbCreate);
            return this.passed;
        }

        let uids:string[] = [];
        // else
        if(this.search.isMethod()){
            uids = this.search.getUids();

            for(let i=0; i<uids.length; i++){
                let x = uids[i];
                await this._searchAndCreateMethodHook(uids[i], pContext);
            }
            /*
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
                        jhook = await hm.createJavaMethodHook(m, {loadKP:  this.load_kp })
                        jhook.unloadOn(this.unload_kp);
                        create = true;
                    }

                    if(Object.keys(this.variables).length>0) jhook.initVariables(this.variables);
                    if(this.before != null) jhook.appendBefore(this.before);
                    if(this.after != null) jhook.appendAfter(this.after);
                    if(this.replace != null) jhook.appendReplace(this.replace);

                    // update hook script
                    jhook.build(this.lang);

                    hm.save(jhook, create);


                    if(this.preprocessor != null){
                        hm.addMatchListener(jhook.getGUID(), this.preprocessor);
                    }
                }
            });*/
        }
        else if(this.search.isNativeFunc()){


            for(let i=0; i<uids.length; i++){
                let x = uids[i];
                await this._searchAndCreateNativeFnHook(uids[i], pContext);
            }
        }
        else if(this.search.isSystemCall()){

        }
        // mark as passed
        this.passed = 1;
        await hm.save(this, pDbCreate);
        return this.passed;
    }

    /**
     * NOT USED
     *
     * @deprecated
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

    static upgradeStrategyOptions(pOldOptions:HookStrategyOptions,
                                  pNewOptions:HookStrategyOptions,
                                  pMode:UPGRADE_MODE):any {


        const change:HookRevision = {
            operation: RevisionOperation.EDIT,
            subject: HookRevisionSubject.STRATEGY,
            description: "Strategy update",
            time: Util.time(),
            data: {}
        };


        for(let k in pNewOptions){
            switch (k){
                case "autoEmit":
                case "descr":
                case "emitEvent":
                case "name":
                case "loadOn":
                case "unloadOn":
                case "after":
                case "before":
                case "replace":
                case "search":
                    if(pOldOptions[k]!=pNewOptions[k]){
                        if(pOldOptions[k] != null){
                            (pOldOptions as any)[k] = pNewOptions[k];
                        }
                        change.data[k] = {
                            value:pOldOptions[k],
                            operation: RevisionOperation.EDIT
                        };
                    }
                    break;
                default:
                    (pOldOptions as any)[k] = pNewOptions[k];
                    break;
            }
        }


        for(let k in pOldOptions){
            if(pNewOptions[k]==null){
                change.data[k] = { value:pOldOptions[k] };
                if(pMode==UPGRADE_MODE.REPLACE){
                    delete pOldOptions[k];
                    change.data[k].operation = RevisionOperation.REMOVED;
                }else{
                    change.data[k].operation = RevisionOperation.EDIT;
                }
            }
        }

        return change;
    }

    /**
     *
     */
    markAsDeprecated() {
        this.markAs(InspectorState.DEPRECATED);
    }

    /**
     *
     */
    markAsRemoved() {
        this.markAs(InspectorState.REMOVED);
    }

    /**
     *
     */
    markAs(pFlag:InspectorState) {

        if([InspectorState.DEPRECATED,InspectorState.REMOVED].indexOf(pFlag)>-1){
            throw InspectorManagerException.MARKER_NOT_SUPPORTED(pFlag);
        }

        this[pFlag] = true;

        if(this.before!=null) this.before.markAs(pFlag);
        if(this.replace!=null) this.replace.markAs(pFlag);
        if(this.after!=null) this.after.markAs(pFlag);
    }
}