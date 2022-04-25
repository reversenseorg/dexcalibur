import KeyPoint from "./KeyPoint";
import {HookManager} from "./HookManager";
import HookTemplateFragment from "./HookTemplateFragment";
import HookSet from "../HookSet";
import Util from "../Utils";
import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";


export abstract class AbstractHook {

    public name:string;

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

    public customName:string = null;

    public color:string = null;

    private _time:number = null;
    /**
     *
     */
    public parentID:string = null;

    public edited:boolean = false;

    unloadOn(pKeyPoint:KeyPoint):AbstractHook {
        this._unloadkp = pKeyPoint;
        return this;
    }

    loadOn(pKeyPoint:KeyPoint):AbstractHook {
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


    getVariable(pID:string){
        return this._vars[pID];
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
     * To append fragement according to its priority
     *
     * @param pArr
     * @param pFrag
     * @protected
     */
    protected _appendFragment( pArr:HookTemplateFragment[], pFrag:HookTemplateFragment):void {
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

    appendBefore(pFrag: HookTemplateFragment){
        this._appendFragment( this._before, pFrag);
    }

    appendAfter(pFrag: HookTemplateFragment){
        this._appendFragment( this._after, pFrag);
    }

    appendReplace(pFrag: HookTemplateFragment){
        this._appendFragment( this._replace, pFrag);
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

    isEnable():boolean {
        return this._enabled;
    }

    isTargetNodeType( pNodeType:NodeInternalType){
        return (this._t === pNodeType);
    }

    abstract  isTarget(pNode: any): boolean;
    abstract  getTarget(): any;
    abstract  build(pContext:any): any;
    abstract  destroy(pContext:any): any;


    toJsonObject(){
        let o:any = {};
        o.id = this.getGUID();
        o.parentID = this.parentID;
        o.color = this.color;
        o.customName = this.customName;
        o.name = this.name;


        o.enable = this._enabled;
        o.script = Util.b64_encode(Util.encodeURI(this._code));
        o.edited = this.edited;

        o._after = []
        if(this._after.length > 0){
            this._after.map( (x:HookTemplateFragment) => {
                o._after.push( x.toJsonObject());
            })
        }
        o._before = []
        if(this._before.length > 0){
            this._before.map( (x:HookTemplateFragment) => {
                o._before.push( x.toJsonObject());
            })
        }
        o._replace = []
        if(this._replace.length > 0){
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
        return o;
    }

    extends( pOptions:any){

    }


    updateWith(object:any, method:any){
        this._uid = object.id;
        this.parentID = object.parentID;
        this.customName = object.customName;
        this.name = object.name;
        this._enabled = object.enable;


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