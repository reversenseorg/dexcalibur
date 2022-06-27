import {IPersistent} from "../persist/orm/IPersistent";
import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";
import {NodeProperty} from "../persist/orm/NodeProperty";
import {DbDataType, DbKeyType, DbSerialize} from "../persist/orm/DbAbstraction";
import {ValidationRule} from "../Validator";
import DataScope from "../DataScope";
import ModelFileSection from "../ModelFileSection";
import {INode, INodeMap} from "../INode";
import Util from "../Utils";
import {KeyPointException} from "../errors/KeyPointException";

export enum KeyPointType {
    HOOK=0,
    FS_EVENT
}

export enum KeyPointLifecycleEventType {
    KP_DELETED,
    REACHED
}

export interface KeyPointLifecycleEvent {
    event:KeyPointLifecycleEventType;
    data?:any;
}

export enum KeyPointRole {
    LOAD='load',
    UNLOAD='unload',
    ANY='*'
}
/**
 * Represents a key point into application timeé
 *
 * from where hook can be load/unload or action triggered
 *
 * @class
 */
export default class KeyPoint implements IPersistent {

    static TYPE:NodeType = new NodeType("key_point", NodeInternalType.KEY_POINT, []);
    __:NodeInternalType = NodeInternalType.KEY_POINT;

    deps:string[] = [];

    /**
     * If the key point is from a state caught by another key point
     * @field
     * @type {KeyPoint}
     */
    parent:KeyPoint = null;
    children:KeyPoint[] = [];

    /**
     * Should be unique
     */
    name:string;

    token:string;
    description:string;
    condition:string;
    code = "";
    //genCode: string = null;
    generator: any = null;
    weight:number;
    type: KeyPointType = KeyPointType.HOOK;
    node:INodeMap = {};
    enabled:boolean;
    _c:string;

    constructor(pConfig:any={}){
        this.weight = -1;
        this.enabled = true;
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    hasNode(pNode:INode):boolean {
        return (this.node[pNode.getUID()]  != null);
    }

    addNode(pNode:INode):any {
        this.node[pNode.getUID()] = pNode ;
    }

    getNodes():INodeMap {
        return this.node;
    }

    getNode(pUID:string):INode {
        return this.node[pUID];
    }

    getFirstNode():INode {
        return Object.values(this.node)[0];
    }

    hasNodes():boolean {
        return (Object.values(this.node).length > 0);
    }


    hasAncestor():boolean {
        return this.parent!=null;
    }

    getAncestor():KeyPoint {
        return this.parent;
    }

    setCondition(pConditionName:string){
        this.condition = pConditionName;
    }

    getCondition():string {
        return this.condition;
    }

    getToken():string {
        return this.token;
    }

    setToken(pToken:string) {
        this.token = pToken;
    }

    getUID():string {
        return this.name;
    }

    getName():string {
        return this.name;
    }

    getWeight():number {
        return this.weight;
    }

    setWeight(weight:number) {
        this.weight = weight;
    }

    setName(pName:string) {
        this.name = pName;
    }

    isHookBased():boolean {
        return this.type === KeyPointType.HOOK;
    }

    /**
     * To generate the final code of the keypoint by replacing tokens by generated piece of code
     *  of children key points.
     *
     *  Put it in the code cache
     *
     * @param {string} vCode Code for children keypoints
     * @throws {KeyPointException}
     * @return {string} The generated code for this keypoint and all children
     * @method
     */
    generateCode(vCode:string):string{
        if(this.generator != null){
            return this._c = (this.generator)(vCode);
        }else{
            if(Util.isEmpty(this.code, Util.FLAG_WS | Util.FLAG_CR | Util.FLAG_TB)){
                throw KeyPointException.INVALID_KP(this.getUID())
            }

            return this._c = this.code.replace("@@__CONTENT__@@", vCode); //+"\n"+vCode;
        }
    }

    /**
     * To get the code cache
     *
     * @method
     */
    getCodeCache():string {
        return this._c;
    }

    getDescription():string {
        return this.description;
    }

    setDescription(pDescr:string) {
        this.description = pDescr;
    }

    getChildrenKeyPoints():KeyPoint[] {
        return this.children;
    }

    hasChildrenKeyPoints():boolean {
        return (this.children.length > 0);
    }


    setKeypointType(keypointType:KeyPointType) {
        this.type = keypointType;
    }

    /**
     * To add a JS module required by the keypoint code
     *
     * @param pModule {string} JS module required by the code
     */
    require(pModule:string):void {
        this.deps.push(pModule);
    }

    /**
     * To check if the key point require some externals/shared libs/code
     *
     * @return {boolean}
     * @method
     */
    hasDependencies():boolean {
        return (this.deps.length > 0);
    }

    getDependencies():string[] {
        return this.deps;
    }

    active( pStatut:boolean):void {
        this.enabled = pStatut;
    }

    /**
     * To notify attached hooks and actionables, the key point has been removed
     *
     * @method
     */
    removed():void {
        // TODO
        //this.bus.next({ event:KeyPointLifecycleEventType.KP_DELETED });
    }


    /**
     * To notify attached hooks and actionables, the key point has been updated
     *
     * @method
     */
    updated():void {
        // TODO
        //this.bus.next({ event:KeyPointLifecycleEventType.KP_DELETED });
    }

    /**
     * To notify attached hooks and actionables, the key point has been removed
     *
     * @method
     */
    trigger( pSource:any):void {
        // TODO
        //this.bus.next({ event:KeyPointLifecycleEventType.REACHED, data:pSource });
    }

    toJsonObject():any {
        const o:any = {};
        for(const i in this){
            switch (i){
                case 'parent':
                    o.parent = this.parent==null ? null :  this.parent.getUID();
                    break;
                case 'children':
                    o.children = [];
                    this.children.map( c => o.children.push(c.getUID()));
                    break;
                case 'node':
                    o.node = [];
                    for(const k in this.node) o.node.push({ __:this.node[k].__, uid:this.node[k].getUID() });
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        return o;
    }
}