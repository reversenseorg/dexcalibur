import {INode} from "../INode.js";
import HookMessageV2 from "./HookMessageV2.js";
import {Tag} from "../tags/Tag.js";
import BusEvent from "../BusEvent.js";
import {NodeType} from "../persist/orm/NodeType.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {NodeProperty, NodePropertyState} from "../persist/orm/NodeProperty.js";
import {DbDataType, DbKeyType} from "../persist/orm/DbAbstraction.js";
import {CoreDebug} from "../core/CoreDebug.js";

export enum RuntimeEventType {
    HOOK= 'h',
    MEMORY='m',
    NETWORK='n',
    FILESYSTEM='f',
    HOOK_ERROR='he',
    FRAG_ERROR='fe'
}


/**
 * This class represents any events happening at runtime of target applications and
 * captured by Dexcalibur
 *
 * Most specifialized message - such as hook messages - are lifted to RuntimeEvent
 *
 *
 * @class
 */
export class RuntimeEvent<P> extends BusEvent<any> implements INode {

    static TYPE:NodeType = new NodeType( "runtime_evt", NodeInternalType.RUNTIME_EVENT,
        [
            (new NodeProperty("id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("type")).type(DbDataType.STRING).def(null),
            (new NodeProperty("_s")).type(DbDataType.BOOLEAN).def(true),
            (new NodeProperty("raw"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p != null){
                        return JSON.stringify(x.p.toJsonObject());
                    }else{
                        return null;
                    }
                })
                .wakeUp( (x:NodePropertyState)=>{
                    switch (x.self.type){
                        case RuntimeEventType.HOOK:
                        default:
                            return new HookMessageV2(JSON.parse(x.p));
                            break;
                    }
                    return (x.p!=null ? JSON.parse(x.p) : null)
                })
                .def(null),
            (new NodeProperty("node"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    //const t = Object.keys(x.p);
                    const t = [];
                    // transform a list of INode to a list of Node UID+type
                    x.p.map( n => t.push({ __:n.__, uid:n.getUID() }));
                    return JSON.stringify(t);
                })
                .wakeUp( (x:NodePropertyState)=>{
                    return (x.p!=null ? JSON.parse(x.p) : null)
                })
                .def("[]"),
            (new NodeProperty("tags"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    //const t = Object.keys(x.p);
                    return JSON.stringify(Object.keys(x.p));
                })
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)})
                .def("[]")
        ]);
    __:NodeInternalType = NodeInternalType.RUNTIME_EVENT;

    type:RuntimeEventType = null;

    id:any = null;

    raw: P = null;

    node:INode[] = [];

    tags:number[] = [];

    /**
     * Save flag. FALSE = not saved
     */
    _s = false;

    constructor( pConfig:any) {
        super(pConfig);

        for(const i in this){
            this[i] = pConfig[i];
        }
    }

    set saved(pFlag:boolean) {
        this._s = pFlag;
    }

    get saved():boolean {
        return this._s;
    }

    getUID():any {
        return this.id;
    }

    getMessage():P {
        return this.raw;
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

        o.type = this.type
        o.node = this.node;
        o.tags = this.tags;
        o.raw = (this.raw != null ? (this.raw as any).toJsonObject() : null);

        //if(this.tags != null && this.tags.length > 0)
        //    o.tags = this.tags;
        CoreDebug.checkJsonSerialize(o, "RuntimeEvent");
        return o;
    }

    isNotError():boolean {
        return (this.type!=RuntimeEventType.HOOK_ERROR);
    }
}