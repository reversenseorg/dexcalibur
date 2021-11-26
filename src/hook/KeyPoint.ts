import {IPersistent} from "../persist/orm/IPersistent";
import {NodeType} from "../persist/orm/NodeType";
import {NodeInternalType} from "../NodeInternalType";
import {NodeProperty} from "../persist/orm/NodeProperty";
import {DbDataType, DbKeyType, DbSerialize} from "../persist/orm/DbAbstraction";
import {ValidationRule} from "../Validator";
import DataScope from "../DataScope";
import ModelFileSection from "../ModelFileSection";

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

/**
 * Represents a key point into application cinetiq
 *
 * from where hook can be load/unload or action triggered
 *
 * @class
 */
export default class KeyPoint implements IPersistent {

    static TYPE:NodeType = new NodeType("key_point", NodeInternalType.KEY_POINT, []);
    __:NodeInternalType = NodeInternalType.KEY_POINT;


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
    code:string = "";
    //genCode: string = null;
    generator: any = null;
    weight:number = -1;
    type: KeyPointType = KeyPointType.HOOK;

    _c:string = "";
   // bus:Subject<KeyPointLifecycleEvent> = new Subject<KeyPointLifecycleEvent>();

    constructor(pConfig:any={}) {
        for(let i in pConfig){
            this[i] = pConfig[i];
        }
    }

    hasAncestor():boolean {
        return this.parent!=null;
    }

    getAncestor():KeyPoint {
        return this.parent;
    }

    getToken():string {
        return this.token;
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

    setName(pName:string) {
        this.name = pName;
    }

    isHookBased():boolean {
        return this.type === KeyPointType.HOOK;
    }



    generateCode(vCode:string){
        if(this.generator != null){
            return this._c = (this.generator)(vCode);
        }else{
            return this._c = this.code.replace("@@__CONTENT__@@", vCode); //+"\n"+vCode;
        }
    }

    getCodeCache():string {
        return this._c;
    }

    getDescription():string {
        return this.description;
    }

    getChildrenKeyPoints():KeyPoint[] {
        return this.children;
    }

    hasChildrenKeyPoints():boolean {
        return (this.children.length > 0);
    }

    /**
     * To notify attached hooks and actionables, the key point has been removed
     *
     * @method
     */
    removed():void {
        //this.bus.next({ event:KeyPointLifecycleEventType.KP_DELETED });
    }

    /**
     * To notify attached hooks and actionables, the key point has been removed
     *
     * @method
     */
    trigger( pSource:any):void {
        //this.bus.next({ event:KeyPointLifecycleEventType.REACHED, data:pSource });
    }

    toJsonObject():any {
        const o:any = {};
        for(let i in this){
            switch (i){
                case 'parent':
                    o.parent = this.parent==null ? null :  this.parent.getUID();
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        return o;
    }
}