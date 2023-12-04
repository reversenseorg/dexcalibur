import HookStrategy from "./HookStrategy.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {Nullable} from "../core/IStringIndex.js";



/**
 * A HookTemplateFragment is a piece of the hook template associated to a location (before/after/replace a call)
 *
 */
export default class HookTemplateFragment {


    static TYPE:NodeType = new NodeType( "hook_fragment", NodeInternalType.HOOK_FRAGMENT, []);

    __:NodeInternalType = NodeInternalType.HOOK_FRAGMENT;


    private _uid:string = null;

    public name:string = null;

    private _strategy: HookStrategy = null;

    private _descr:string = null;

    private _tpl: string = null;

    private _w:number = -1;

    private _cache:string = null;

    private _preproc:boolean = true;

    private _keypoint:string = null;

    public autoEmit = false;

    public emitEvent:Nullable<string> = null;

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

    set description(pDescr:string) {
        this._descr = pDescr;
    }

    get description():string {
        return this._descr
    }


    set weight(pWeight:number) {
        if(pWeight===null){
            this._w = -1;
        }else
            this._w = pWeight;
    }

    get weight():number {
        return this._w
    }


    set template(pTpl:string) {
        this._tpl = pTpl;
    }

    get template():string {
        return this._tpl
    }


    set strategy(pStrat:HookStrategy) {
        this._strategy = pStrat;
    }

    get strategy():HookStrategy {
        return this._strategy
    }

    isKeyPoint():boolean {
        return (this._keypoint!==null);
    }

    getKeyPointName():string {
        return this._keypoint;
    }

    setStrategy(pStrategy:HookStrategy){
        this._strategy = pStrategy;
    }

    /**
     * To change the event type of the RuntimeEvent issued from HookMessage
     *
     * @param pType
     */
    setEventType(pType:string):void {
        this.emitEvent = pType;
    }

    /**
     * To switch between emit everytime or disable automatic emit of RuntimeEvent
     *
     * @param pAutoEmit
     */
    setAutoEmit(pAutoEmit:boolean):void {
        this.autoEmit = pAutoEmit;
    }

    setUID(pUID:string){
        this._uid = pUID;
    }

    getUID():string {
        return this._uid;
    }

    isPreProcessed():boolean {
        return this._preproc;
    }

    enablePreproc( pBool = true){
        this._preproc = pBool;
    }

    getStrategy():HookStrategy {
        return this._strategy;
    }

    setCodeTemplate(pTpl:string):void {
        this._tpl = pTpl;
    }

    getCodeTemplate():string {
        return this._tpl;
    }

    /**
     *
     * @param pContext
     */
    generateCode( pContext:any ):string {
        let c = this._tpl;
        for(let i in pContext){
            while(c.indexOf(i)>-1){
                c = c.replaceAll(i, pContext[i]);
            }
        }
        this._cache = c;
        return this._cache;
    }

    getGeneratedCode():string {
        return this._cache;
    }

    static fromJsonObject(pObject:any){
        const o:HookTemplateFragment = new HookTemplateFragment();

        if(pObject._uid != null){
            o._uid = pObject._uid;
        }
        o.name = pObject.name;
        o.description = pObject.descr;
        o._w = pObject.weight;
        if(o._w==null) o._w = -1;

        o.template = pObject.tpl;
        o._cache = pObject._cache;
        o._preproc = pObject._preproc;
        o.emitEvent = pObject.emitEvent;
        o.autoEmit = pObject.autoEmit;

        return o;
    }

    toJsonObject():any {
        const o:any = {};
        o._uid = this._uid;
        o.name = this.name;
        o.autoEmit = this.autoEmit;
        o.emitEvent = this.emitEvent;
        o.descr = this.description;
        o.weight = this._w;
        o.tpl = this.template;
        o._cache = this._cache;
        o._preproc = this._preproc;
        CoreDebug.checkJsonSerialize(o,"HookTemplateFragment");
        return o;
    }
}