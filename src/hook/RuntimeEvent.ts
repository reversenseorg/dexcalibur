import {INode, Node} from "../INode.js";
import HookMessageV2 from "./HookMessageV2.js";

import BusEvent, {BusEventOptions} from "../BusEvent.js";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";
import {
    NodeType,
    NodeProperty,
    DbDataType,
    DbKeyType,
    NodePropertyState,
    Tag,
    NodeUtils
} from "@dexcalibur/dexcalibur-orm";
import {CoreDebug} from "../core/CoreDebug.js";

export enum RuntimeEventType {
    HOOK= 'h',
    MEMORY='m',
    NETWORK='n',
    FILESYSTEM='f',
    HOOK_ERROR='he',
    FRAG_ERROR='fe',
    INPUT_EVT='ev',
    SCREENSHOT = 'ss'
}


export interface RuntimeEventOptions<P> extends BusEventOptions<P> {
    id?:string,
    rt_type?:RuntimeEventType,
    node?:INode[],
    tags?:number[]
}

/**
 * This class represents any events happening at runtime of target applications and
 * captured by Dexcalibur
 *
 * Most specialized message - such as hook messages - are encapsulated to RuntimeEvent
 *
 *
 * @class
 */
export class RuntimeEvent<P> extends BusEvent<any> implements INode {

    static TYPE:NodeType = new NodeType( "runtime_evt", NodeInternalType.RUNTIME_EVENT,
        [
            (new NodeProperty("id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("type")).type(DbDataType.STRING).def(null),
            (new NodeProperty("rt_type")).type(DbDataType.STRING).def(null),
            (new NodeProperty("interceptors")).type(DbDataType.STRING).def([]),
            (new NodeProperty("_s")).type(DbDataType.BOOLEAN).def(true),
            (new NodeProperty("data"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p != null && x.p.toJsonObject != null){
                        return x.p.toJsonObject();
                    }else{
                        return null;
                    }
                })
                .wakeUp( (x:NodePropertyState)=>{
                    switch (x.self.type){
                        case RuntimeEventType.HOOK:
                        default:
                            return new HookMessageV2(x.p);
                            break;
                    }
                    return (x.p!=null ? x.p: null)
                })
                .def(null),
            (new NodeProperty("node"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    //const t = Object.keys(x.p);
                    const t = [];
                    // transform a list of INode to a list of Node UID+type
                    x.p.map( (n:INode) => t.push({
                        __:n.__,
                        uid:n.getUID()
                    }));
                    return t;
                })
                .wakeUp( (x:NodePropertyState)=>{
                    const o: INode[] = [];
                    x.p.map( (v) => {
                        o.push(new Node(v));
                    });
                    return o;
                })
                .def([]),
            (new NodeProperty("tags"))
                .type(DbDataType.STRING)
                /*.sleep( (x:NodePropertyState)=>{
                    //const t = Object.keys(x.p);
                    return Object.keys(x.p);
                })
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? x.p : null)})*/
                .def([])
        ]).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.RUNTIME_EVENT;

    rt_type:RuntimeEventType = null;

    id:any = null;

    node:INode[] = [];

    tags:number[] = [];

    //data:P = null;

    /**
     * Save flag. FALSE = not saved
     */
    _s = false;

    constructor( pConfig:RuntimeEventOptions<P>) {
        super(pConfig);


        this.rt_type = pConfig.rt_type!;
        this.id = pConfig.id!;
        this.tags = pConfig.tags!;
        this.node = pConfig.node!;

        /*for(const i in this){
            this[i] = (pConfig[i] as any);
        }*/
    }

    set saved(pFlag:boolean) {
        this._s = pFlag;
    }

    get saved():boolean {
        return this._s;
    }

    setRuntimeType(pType:RuntimeEventType):void {
        this.rt_type = pType;
    }

    getRuntimeType():RuntimeEventType {
        return this.rt_type;
    }

    getUID():any {
        return this.id;
    }

    getMessage():P {
        return this.data;
    }


    isHookMessage(){
        return (this.type==RuntimeEventType.HOOK);
    }

    setNodes(pNodes:INode[]){
        this.node = pNodes;
    }

    addNode(pNode:INode){
        if(this.node == null){
            this.node = [];
        }
        this.node.push(pNode);
    }


    addTag(vTag:Tag){
        const uuid = vTag.getUUID();

        if(!Array.isArray(this.tags)){
            this.tags = [];
        }

        if(this.tags.indexOf(uuid)==-1)
            this.tags.push(uuid);
    }

    hasTag(vTag:Tag):boolean{
        const uuid = vTag.getUUID()
        for(let i=0; i<this.tags.length; i++){
            if(this.tags[i]===uuid){
                return true;
            }
        }
        return false;
    }

    getTags():number[]{
        return this.tags;
    }


    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} Returns an Object instance representing the type
     */
    toJsonObject():any{
        const o:any = new Object();

        // from BusEvent
        o.type = this.type;
        o.interceptors = this.interceptors;

        // from runtime event
        if(this.data!=null){
            if((this.data as any).toJsonObject != null){
                o.data = (this.data as any).toJsonObject();
            }else{
                o.data = this.data;
            }
        }else{
            o.data = null;
        }
        o.rt_type = this.rt_type;
        o.node = this.node;
        o.tags = this.tags;

        //if(this.tags != null && this.tags.length > 0)
        //    o.tags = this.tags;
        CoreDebug.checkJsonSerialize(o, "RuntimeEvent");
        return o;
    }

    isNotError():boolean {
        return (this.rt_type!=RuntimeEventType.HOOK_ERROR);
    }
}
RuntimeEvent.TYPE.builder(RuntimeEvent);