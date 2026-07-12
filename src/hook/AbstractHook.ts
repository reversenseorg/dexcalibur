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

import KeyPoint from "./KeyPoint.js";
import {HookManager, HookOptions} from "./HookManager.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import Util from "../Utils.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {HookManagerException} from "../errors/HookManagerException.js";
import HookStrategy from "./HookStrategy.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {HookVariableMap, TargetLanguage} from "./common.js";
import * as Log from "../Logger.js";
import {FuzzSessionUID} from "../fuzzing/common.js";
import {Nullable} from "../core/IStringIndex.js";

;

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

    protected _varMap:HookVariableMap = {};

    public customName:string = null;

    public color:string = null;

    private _time:number = null;
    /**
     *
     */
    public parentID:string = null;

    public edited = false;

    /**
     * Default target language for hooks
     */
    public lang:TargetLanguage = TargetLanguage.TS;

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

    hasVariable(variable):boolean {
        return Object.keys(this._varMap).includes(variable);
    }


    getVariable(pID:string){
        return this._varMap[pID];
    }

    getVarMap(){
        return this._varMap;
    }

    setVariableID(pID:string){
        this._varID = pID;
    }

    getVariableID():string {
        return this._varID;
    }

    setupVariables():string{
        let code= "\t\tlet " + this.getVariableID() + `: Record<string, any> = {
            `;
        for(let i in this.getVarMap()){
            code += "\t\t"+i+":";
            code += this.getVariable(i).write();
        }
        return code+`
            };`;
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


    hasFuzzerFragment(pSess:FuzzSessionUID):boolean{
       return (this.getBefore().find( vFrag => {
           return (pSess===vFrag.getFuzzSession());
       })!=null)
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
        if(pFragmentUID==null){
            throw HookManagerException.FRAGMENT_UID_IS_MANDATORY("AbstractHook.getFragment, param");
        }

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
     * If the hook manager is accessible it trigger save else
     * It not removes the fragment from the DB.
     *
     *
     * @param {(string|HookTemplateFragment)} pFragment
     *
     */
    async removeFragment( pFragment:string|HookTemplateFragment ):Promise<HookTemplateFragment> {
        let frag:HookTemplateFragment = null;
        const uid = (typeof pFragment !== "string")? pFragment.getUID() : pFragment;
        const pos = ["_before","_after","_replace"];
        let success = false;

        if(uid==null){
            throw HookManagerException.FRAGMENT_UID_IS_MANDATORY("AbstractHook.getFragment, param");
        }

        for(let k=0; k<pos.length; k++){

            this[pos[k]] = (this[pos[k]] as Array<any>).filter(
                (x:HookTemplateFragment) => {
                    if(x.getUID()!==uid){
                        frag = x;
                        return true;
                    }else{
                        success = true;
                        return false;
                    }
                }
            )
        }

        if(!success){
            throw HookManagerException.HOOK_FRAGMENT_CANNOT_BE_REMOVED(uid,"Fragment not found");
        }

        // if hook is actively attached to a manager, save changes
        if(this._mgr != null){
            await this._mgr.save(this);
        }else{
            Logger.warn(`[HOOK] Fragment [uid=${uid}] has been removed, but changes have not been saved because the hook is not attached to a HookManager`)
        }


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
     * If the hook contains already a fragment at the same position with
     * the same UID, the new fragment is not added.
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

    //TODO: Deal with same named variables in strategies from a same hook. VarMap={strategyID:HookVariableMap} ?
    mergeVariables(pVars:HookVariableMap):void {
        for (let i in pVars) {
            if (this.hasVariable(i)) {
                Logger.error("[ABSTRACK_HOOK][MERGE_VARIABLES] Two variable has the same name in" + this.getGUID()
                    + "\nOriginal HookVariableMap :" + this.getVarMap() + "\n New HookVariableMap: " + pVars)
            }
            else {
                this._varMap[i] = pVars[i];
            }
        }
    }

    /**
     * To append a "before" fragment to existing ones
     *
     * If there is already a fragment with the same ID , it is skipped
     *
     * @param pFrag
     * @param pSync
     * @param pLang
     */
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
        this._before.sort((vFragA, vFragB)=>{
            return (vFragA.weight > vFragB.weight ? -1 : 1);
        });

        //if(this.)
        return this._before;
    }

    getAfter():HookTemplateFragment[] {
        this._after.sort((vFragA, vFragB)=>{
            return (vFragA.weight > vFragB.weight ? -1 : 1);
        });
        return this._after;
    }

    getReplace():HookTemplateFragment[] {
        this._replace.sort((vFragA, vFragB)=>{
            return (vFragA.weight > vFragB.weight ? -1 : 1);
        });
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
            return this.getBefore();
        }
        else if(pLocation === "after"){
            return this.getAfter();
        }
        else if(pLocation === "replace"){
            return this.getReplace();
        }
        else{
            throw HookManagerException.UNKNOW_HOOK_FRAGMENT_POS();
        }
    }

    isEnable():boolean {
        return this._enabled;
    }

    /**
     * To get the location of a fragment by its UID
     *
     * @param {string} pFragmentUID Fragment UID
     * @return {number} -1 if the fragment is before, 1 if after, 0 if replace
     * @method
     * @since 1.12.7
     */
    getLocationOf( pFragmentUID:string):number {
        if(this.getBefore().find(f => f.getUID()===pFragmentUID)!=null){
            return -1;
        }
        else if(this.getAfter().find(f => f.getUID()===pFragmentUID)!=null){
            return 1;
        }
        else if(this.getReplace().find(f => f.getUID()===pFragmentUID)!=null){
            return 0;
        }
        else{
            return null;
        }
    }

    isTargetNodeType( pNodeType:NodeInternalType){
        return (this._t === pNodeType);
    }

    abstract  isTarget(pNode: any): boolean;
    abstract  getTarget(): any;
    abstract  build(pTargetLanguage?:Nullable<TargetLanguage>, pOpts?:Nullable<HookOptions>): any;
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
            this.getAfter().map( (x:HookTemplateFragment) => {
                o._after.push( x.toJsonObject());
            })
        }
        o._before = []
        if(this._before!=null && this._before.length > 0){
            this.getBefore().map( (x:HookTemplateFragment) => {
                o._before.push( x.toJsonObject());
            })
        }
        o._replace = []
        if(this._replace!=null && this._replace.length > 0){
            this.getReplace().map( (x:HookTemplateFragment) => {
                o._replace.push( x.toJsonObject());
            })
        }

        if (this.hasVariables()) {
            o.variables = {
                id: this.getVariableID(),
                data: {}
            };
            //console.log(this.variables);
            for(let i in this.getVarMap()){
                o.variables.data[i] = this.getVariable(i).write();
            }
        }

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