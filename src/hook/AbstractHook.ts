import KeyPoint from "./KeyPoint.js";
import {HookManager, HookOptions} from "./HookManager.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import Util from "../Utils.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {HookManagerException} from "../errors/HookManagerException.js";
import HookStrategy from "./HookStrategy.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {HookVariableMap, TargetLanguage} from "./common.js";
import * as Log from "../Logger.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum HOOK_FRAGMENT_POS {
    BEFORE = 'before',
    AFTER = 'after',
    REPLACE = 'replace',
}

export const UID_POS_MAPPING = {
    [HOOK_FRAGMENT_POS.BEFORE]: "bef",
    [HOOK_FRAGMENT_POS.AFTER]: "aft",
    [HOOK_FRAGMENT_POS.REPLACE]: "repl",
};

/**
 * The abstraction for all Java and Native hook
 */
export abstract class AbstractHook {

    public name:string;

    public __:NodeInternalType;

    protected _t:NodeInternalType = null;

    protected _mgr:HookManager = null;

    protected _uid:string = null;

    //protected _hookset:HookSet = null;

    /**
     * Key Point from where the hook is loaded or unload
     * @protected
     */
    protected _kp:KeyPoint = null;

    protected _loadkp:KeyPoint = null;

    protected _unloadkp:KeyPoint = null;

    /**
     * Hold hook fragment called after target method call
     * @protected
     */
    protected  _after:HookTemplateFragment[] = [];

    /**
     * Hold hook fragment called before target method call
     * @protected
     */
    protected  _before:HookTemplateFragment[] = [];

    /**
     * Hold hook fragment called instead of target method call
     * @protected
     */
    protected  _replace:HookTemplateFragment[] = [];


    /**
     * Hold the ID of variable shared with previous executions
     * @protected
     */
    protected  _varID:string = null;

    protected  _enabled = true;

    protected  _code:string = null;

    protected  _vars:string = null;

    protected _varMap:HookVariableMap = {};

    public customName:string = null;

    public color:string = null;

    private _time:number = null;
    /**
     *
     */
    public parentID:string = null;

    public edited = false;

    private _ctx:DexcaliburProject = null;

    setContext(pProject:DexcaliburProject){
        this._ctx = pProject;
    }

    unloadOn(pKeyPoint:KeyPoint):AbstractHook {
        this._unloadkp = pKeyPoint;
        return this;
    }

    loadOn(pKeyPoint:KeyPoint):AbstractHook {
        console.log("Abstract Hook > loadOn > ",pKeyPoint);
        this._loadkp = pKeyPoint;
        return this;
    }

    setManager(pHM:HookManager){
        this._mgr = pHM;
    }

    setGUID( pGUID:string){
        this._uid = pGUID;
    }

    getGUID():string{
        return this._uid;
    }

    hasVariables():boolean {
        return (Object.keys(this._varMap).length>0);
    }

    getVariable(pID:string){
        return this._varMap[pID];
    }

    setVariableID(pID:string){
        this._varID = pID;
    }

    getVariableID():string {
        return this._varID;
    }

    getLoadKeyPoint():KeyPoint {
        return this._loadkp;
    }

    getUnloadKeyPoint():KeyPoint {
        return this._unloadkp;
    }


    setLoadKeyPoint(pKP:KeyPoint) {

        Logger.debug("Abstract Hook > setLoadKeyPoint > ");
        Logger.debugRAW(pKP)
        this._loadkp = pKP;
    }

    setUnloadKeyPoint(pKP:KeyPoint) {
        this._unloadkp = pKP;
    }

    getKeyPoint():KeyPoint {
        return this._kp;
    }

    setKeyPoint(pKP:KeyPoint) {
        this._kp = pKP;
    }

    hasKeyPointFor( pType:string){
        if(pType === 'load'){
            return (this._loadkp != null);
        }
        else if(pType === 'unload'){
            return (this._unloadkp != null);
        }
        else{
            return false;
        }
    }

    detachKeyPoint( pType:string){

        switch(pType){
            case "load":
                this._loadkp = null;
                break;
            case "unload":
                this._unloadkp = null;
                break;
        }
    }

    /**
     *
     * @param pType
     * @param pKP
     */
    attachKeyPoint(pType:any,  pKP:KeyPoint){

        console.log("Abstract Hook > attachKeyPoint > "+pType,pKP);
        if(pType == "load"){
            this._loadkp = pKP;
        }else{
            this._unloadkp = pKP;
        }
    }

    enable( pBool = true){
        this._enabled = pBool;
    }

    setGeneratedCode(pCode:string) {
        this._code = pCode;
        this._time = (new Date()).getTime();
    }

    getGeneratedCode():string {
        return this._code;
    }

    getLastModified():number {
        return this._time;
    }

    /**
     * To add an extra hook template fragment (not rattached to a strategy)
     *
     * @param pPosition
     * @param pFragment
     */
    async addExtraFragment( pPosition:HOOK_FRAGMENT_POS, pFragment:HookTemplateFragment):Promise<void> {

        // update fragment UID and save it (out of hook strategy)
        pFragment.setUID(
            HookStrategy.generateFragmentUID(pPosition, pFragment, null)
        );

        await this._mgr.save(pFragment);

        //Logger.raw("XXXX> "+pPosition+" >>>> "+(pPosition === HOOK_FRAGMENT_POS.BEFORE ))
        // attach the fragment to the hook
        if(pPosition === HOOK_FRAGMENT_POS.BEFORE){
            this.appendBefore(pFragment);
        }
        else if(pPosition === HOOK_FRAGMENT_POS.AFTER){
            this.appendAfter(pFragment);
        }
        else if(pPosition === HOOK_FRAGMENT_POS.REPLACE){
            this.appendReplace(pFragment);
        }
        else{
            throw HookManagerException.UNKNOW_HOOK_FRAGMENT_POS();
        }

        // save the hook
        await this._mgr.save(this);
    }

    /**
     * To get a fragment from this hook by its UID
     *
     * @param {string} pFragmentUID Fragment UID
     * @return {HookTemplateFragment} Hook template fragment
     * @method
     */
    getFragment( pFragmentUID:string ):HookTemplateFragment {
        let frag:HookTemplateFragment = null;
        const pos = ["_before","_after","_replace"];
        let fl:number;

        for(let k=0; k<pos.length; k++){
            fl = this[pos[k]].length ;
            for(let i = 0; i<fl; i++){
                if(this[pos[k]][i].getUID()===pFragmentUID){
                    frag = this[pos[k]][i];
                    break;
                }
            }
            if(frag != null) break;
        }

        return frag;
    }

    /**
     * To remove a fragment from the hook.
     *
     * It not remove the fragment from the DB.
     *
     *
     * @param {(string|HookTemplateFragment)} pFragment
     *
     */
    async removeFragment( pFragment:string|HookTemplateFragment ):Promise<HookTemplateFragment> {
        let frag:HookTemplateFragment = null;
        const uid = (typeof pFragment !== "string")? pFragment.getUID() : pFragment;
        const pos = ["_before","_after","_replace"];
        let fl:number;

        for(let k=0; k<pos.length; k++){

            this[pos[k]] = (this[pos[k]] as Array<any>).filter(
                (x:HookTemplateFragment) => {
                    if(x.getUID()!==uid){
                        frag = x;
                        return false;
                    }else{
                        return true;
                    }
                }
            )
        }

        await this._mgr.save(this);

        return frag;
    }

    protected _containsTemplateFragment(pArr:HookTemplateFragment[], pFrag:HookTemplateFragment):boolean {
        let exists = false;
        pArr.map( x => {
            if(x.getUID() == pFrag.getUID()){
                exists = true;
            }
        })

        // ignore if already exists
        if(exists) return true;

        return false;
    }
    /**
     * To append fragement according to its priority
     *
     * @param pArr
     * @param pFrag
     * @protected
     */
    protected _appendFragment( pArr:HookTemplateFragment[], pFrag:HookTemplateFragment):void {


        // ignore if already exists
        if(this._containsTemplateFragment( pArr, pFrag)) return;


        if(pFrag.weight > -1){
            let newIndex = 0;
            for(let i=0; i<pArr.length; i++){
                if(pFrag.weight >= pArr[i].weight){
                    newIndex = i;
                }
            }
            pArr.splice(newIndex, 0, pFrag);
        }else{
            pArr.push(pFrag);
        }
    }

    initVariables(pVars:HookVariableMap):void {
        this._varMap = pVars;
    }

    appendBefore(pFrag: HookTemplateFragment, pSync = true, pLang = TargetLanguage.TS){
        this._appendFragment( this._before, pFrag);
        if(pSync) this.build(pLang);
    }

    appendAfter(pFrag: HookTemplateFragment, pSync = true, pLang = TargetLanguage.TS){
        this._appendFragment( this._after, pFrag);
        if(pSync) this.build(pLang);
    }

    appendReplace(pFrag: HookTemplateFragment, pSync = true, pLang = TargetLanguage.TS){
        this._appendFragment( this._replace, pFrag);
        if(pSync) this.build(pLang);
    }

    private _hasFragments( pArr:HookTemplateFragment[]){
        return (pArr.length > 0);
    }

    hasReplaceFragments():boolean {
        return this._hasFragments(this._replace);
    }

    hasBeforeFragments():boolean {
        return this._hasFragments(this._before);
    }

    hasAfterFragments():boolean {
        return this._hasFragments(this._after);
    }

    getBefore():HookTemplateFragment[] {
        return this._before;
    }

    getAfter():HookTemplateFragment[] {
        return this._after;
    }

    getReplace():HookTemplateFragment[] {
        return this._replace;
    }

    /**
     * To get all fragment template for the given location
     *
     * @param {string} pLocation Location name
     * @return {HookTemplateFragment[]} The list of HookTemplateFragment for the specified location
     * @method
     */
    getFragmentsByLocation( pLocation:string):HookTemplateFragment[] {
        if(pLocation === "before"){
            return this._before;
        }
        else if(pLocation === "after"){
            return this._after;
        }
        else if(pLocation === "replace"){
            return this._replace;
        }
        else{
            throw HookManagerException.UNKNOW_HOOK_FRAGMENT_POS();
        }
    }

    isEnable():boolean {
        return this._enabled;
    }

    isTargetNodeType( pNodeType:NodeInternalType){
        return (this._t === pNodeType);
    }

    abstract  isTarget(pNode: any): boolean;
    abstract  getTarget(): any;
    abstract  build(pTargetLanguage:TargetLanguage): any;
    abstract  destroy(): any;


    toJsonObject(){
        const o:any = {};
        o.__ = this.__;
        o.id = this.getGUID();
        o.parentID = this.parentID;
        o.color = this.color;
        o.customName = this.customName;
        o.name = this.name;

        o._loadkp = (this._loadkp!=null ? this._loadkp.getUID() : null);
        o._unloadkp = (this._unloadkp!=null ? this._unloadkp.getUID() : null);


        o.enable = this._enabled;
        o.script = Util.b64_encode(Util.encodeURI(this._code));
        o.edited = this.edited;

        o._after = []
        if(this._after!=null && this._after.length > 0){
            this._after.map( (x:HookTemplateFragment) => {
                o._after.push( x.toJsonObject());
            })
        }
        o._before = []
        if(this._before!=null && this._before.length > 0){
            this._before.map( (x:HookTemplateFragment) => {
                o._before.push( x.toJsonObject());
            })
        }
        o._replace = []
        if(this._replace!=null && this._replace.length > 0){
            this._replace.map( (x:HookTemplateFragment) => {
                o._replace.push( x.toJsonObject());
            })
        }


        /*if(this._varID != null){
            o.variables = {
                id: this._varID,
                data: {}
            };
            //console.log(this.variables);
            for(let i in this._vars){
                o.variables.data[i] = this.variables[i].write();
            }
        }*/

        /*o.code = {
            //variable: (this.code.variable!=null)? UT.b64_decode(this.code.dynamic) : null,
            before: [],
            after: [],
            replace: [],
        };*/

        CoreDebug.checkJsonSerialize(o,"AbstractHook");
        return o;
    }

    /**
     * Not used
     * @param pOptions
     */
    extends( pOptions:HookOptions){
        // todo
    }


    updateWith(object:any, method:any){
        this._uid = object.id;
        this.parentID = object.parentID;
        this.customName = object.customName;
        this.name = object.name;
        this._enabled = object.enable;

        if(object._unloadkp != null){
            this._unloadkp = object._unloadkp;
        }

        if(object._loadkp != null){

            console.log("Abstract Hook > updateWith > ",object._loadkp);
            this._loadkp = object._loadkp;
        }


        this._code = Util.decodeURI(Util.b64_decode(object.script));
        this.edited = object.edited;
        /*
        this.code = {
            dynamic: (object.code.dynamic!=null)? Util.b64_decode(object.code.dynamic) : null,
            before: (object.code.before!=null)? Util.b64_decode(object.code.before) : null,
            after: (object.code.after!=null)? Util.b64_decode(object.code.after) : null,
            replace: (object.code.replace!=null)? Util.b64_decode(object.code.replace) : null,
        };*/
        return this;
    }
}