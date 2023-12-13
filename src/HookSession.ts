/**
 * Represents a session of hooking.
 *
 * A session comonly starts when the Frida final script is loaded and
 * finish at the next start.
 *
 * (TODO : or when the device is disconnected)
 *
 * @param {*} manager
 */
import HookMessage from "./HookMessage.js";
import Util from "./Utils.js";
import * as Frida from 'frida';
import {HookManager} from "./hook/HookManager.js";
import {WebsocketSession} from "./WebsocketSession.js";
import * as Log from "./Logger.js";
import HookMessageV2 from "./hook/HookMessageV2.js";
import {RuntimeEvent, RuntimeEventType} from "./hook/RuntimeEvent.js";
import {HookMessageException} from "./errors/HookMessageException.js";
import {TagHashMap} from "./tags/TagManager.js";
import {NodeInternalType} from "./NodeInternalType.js";

import {
    NodeType,
    DbSerialize,
    NodePropertyState,
    NodeProperty,
    DbDataType,
    DbKeyType,
    INode,
    SerializeOptions
} from "@dexcalibur/dexcalibur-orm";
import {CryptoUtils} from "./CryptoUtils.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {Nullable} from "./core/IStringIndex.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface FridaBindings {
    session:Frida.Session,
    device: Frida.Device,
    script: Frida.Script,
    pid: number
}

export interface HookSessionOptions {
    rawOutput:boolean
}

/**
 * @class
 */
export default class HookSession extends WebsocketSession implements INode
{
    static TYPE:NodeType = new NodeType( "hook_session", NodeInternalType.HOOK_SESSION,
        [
            (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("message")).multiple(RuntimeEvent.TYPE).def("[]"),
            (new NodeProperty("hookManager")).volatile(),
            (new NodeProperty("sets_matches")).volatile().def(null),
            (new NodeProperty("time")).type(DbDataType.NUMERIC).def(-1),
            (new NodeProperty("frida"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return {};

                    return JSON.stringify({
                        pid: x.p.pid,
                        session: null,
                        device: null,
                        script: null
                    });
                })
                .wakeUp( (x:NodePropertyState)=>{
                    return (x.p!=null ? JSON.parse(x.p) : null);
                })
                .def(0),
            (new NodeProperty("active")).type(DbDataType.BOOLEAN).def(false),
            (new NodeProperty("opts")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def(null),
            (new NodeProperty("offset")).type(DbDataType.NUMERIC).def(0),
            (new NodeProperty("evTags"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    //const t = Object.keys(x.p);
                    return JSON.stringify(Object.keys(x.p));
                })
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)})
                .def(0)
        ]);
    __:NodeInternalType = NodeInternalType.HOOK_SESSION;

    public _uid:string = null;

    /**
     * The stack containing the received message
     * @field
     */
    message:RuntimeEvent<any>[] = [];
    //message:HookMessageV2[] = [];

    /**
     * The associated HookManager
     * (TODO : 1 hookManager per device)
     * @field
     */
    hookManager:HookManager = null;

    /**
     * Follow hookset matches
     * @field
     */
    sets_matches:any = {};

    /**
     * The timestamp of the session
     * @field
     */
    time:number = -1;

    /**
     * To hold some references from frida-node
     * @field
     */
    frida:FridaBindings = null


    active = true;

    opts:HookSessionOptions;

    evTags:TagHashMap = {};

    tags = [];

    offset = 0;

    /**
     *
     * @param {HookManager} manager
     * @constructor
     */
    constructor(manager: HookManager) {
        super();

        // not enough unique for collaborative mode
        // should be bound to the device also
        const now =  Util.time();

        this._uid = CryptoUtils.md5(now+"");

        // hook
        this.message = [];
        this.hookManager = manager;
        this.sets_matches = {};
        this.time = now;
        this.frida = {
            session: null,
            device: null,
            script: null,
            pid: null
        };
        this.opts = {
            rawOutput: false
        }
        this.evTags = this.hookManager.getMessageTags();
    }

    getUID():string {
        return this._uid;
    }

    set fridaSession( pSession:Frida.Session){
        this.frida.session = pSession;
    }

    get fridaSession():Frida.Session{
        return this.frida.session;
    }


    set fridaDevice( pDevice:Frida.Device){
        this.frida.device = pDevice;
    }

    get fridaDevice():Frida.Device{
        return this.frida.device;
    }


    set fridaScript( pScript:Frida.Script){
        this.frida.script = pScript;
    }

    get fridaScript():Frida.Script{
        return this.frida.script;
    }


    set pid( pPID:number){
        this.frida.pid = pPID;
    }

    get pid():number{
        return this.frida.pid;
    }

    setOptions(pOptions:HookSessionOptions){
        this.opts = pOptions;
    }

    /**
     * To push a new message from a hook into the session.
     * Each message are an instance of HookMessage
     *
     * @method
     */
    push(pRawMsg:any){

        const hm:HookMessageV2 = new HookMessageV2();
        const ev:RuntimeEvent<any> = new RuntimeEvent<any>({
            type: "*",
            rt_type: RuntimeEventType.HOOK,
            id: this.getUID()+':'+this.message.length,
            interceptors: []
        });

        //if(pRawMsg.type == "error") return null;

        // TODO : mettre tout 'msg' dans 'hm' ou 'hm.data'

        // console.log(msg);
        if(pRawMsg.hid == null) throw HookMessageException.MISSING_HOOK_ID();


        // update hook message
        hm.setSession(this);
        hm.uid = this.offset;
        hm.hook = this.hookManager.getHookByID(pRawMsg.hid);

        // by default, not tagged hook message are not broadcasted
        let brodcast = false;

        if(hm.hook && pRawMsg.fid!=null){
            hm.frag = hm.hook.getFragment(pRawMsg.fid);
            ev.addTag(this.evTags.HOOK);

            // now, event type and auto emit can be retrieved for each fragments
            brodcast = hm.frag.autoEmit;
            ev.setType(hm.frag.emitEvent);
        }

        if(pRawMsg.err!=null){
            switch (pRawMsg.err){
                case -1:
                    ev.setRuntimeType(RuntimeEventType.HOOK_ERROR);
                    ev.addTag(this.evTags.FRAG_ERR);
                    break;
                case 1:
                default:
                    ev.setRuntimeType(RuntimeEventType.HOOK_ERROR);
                    ev.addTag(this.evTags.HOOK_ERR);
                    break;
            }
        }

        hm.data = pRawMsg.data;

        // fill runtiume event
        ev.addNode(hm.hook.getTarget() as INode);
        ev.data = hm;

        this.offset++;

        // 'Action' is already known by fragment
        // hm.action = msg.payload.action;

        // 'When' is the fragment location before/after/replace
        // hm.when = (msg.after)? 1 : 0;


        // 'payload.tags' is updated host-side  by Inspectors
        // if(msg.payload.tags != null) hm.setTags(msg.payload.tags);

        //Logger.raw(JSON.stringify(hm));

        // cache hook msg
        this.message.push(ev);

        // TODO : send raw hook message only if specified

        if(!this.opts.rawOutput){
            // process hook message as RuntimeEvent
            const jsonNode = [];
            ev.node.map( x => jsonNode.push( x.__!=null ? (x as any).toJsonObject() : x));


            // TODO : ev to websocket msg
            // only valid message are broadcasted
            if(ev.isNotError()){
                this.hookManager.newRuntimeEvent(ev, brodcast);
            }

            this.send({
                data:{
                    id: hm.uid,
                    data: hm.data,
                    hook:  hm.hook.toJsonObject(),
                    frag:  (hm.frag!=null) ? hm.frag.toJsonObject() : null
                },
                node: jsonNode,
                tags: ev.tags,
                rt_type: ev.getRuntimeType(),
                type: ev.getType(),
                __i: ev.interceptors
            });

        }else{
            this.send({
                id: hm.uid,
                data: pRawMsg.data,
                rt_type: ev.getRuntimeType(),
                type: ev.getType(),
                node: {
                    __: hm.hook.getTarget()!=null ?  hm.hook.getTarget().__ : null,
                    uid: hm.hook.getTarget()!=null ?  hm.hook.getTarget().getUID() : null
                },
                hook: {
                    __: hm.hook.__,
                    uid: hm.hook.getGUID(),
                },
                frag:  (hm.frag!=null) ? hm.frag.getUID() : null
            });
        }

        // TODO : remove 'match' from hook message template
        // if(hm.match)
        //    this.hookManager.trigger(hm);

        return hm;
    }


    /**
     * @method
     */
    hasMessages( pOffset=0):boolean{
        return this.message.length > pOffset;
    }

    /**
     * @method
     */
    messages():RuntimeEvent<HookMessageV2>[]{
        return this.message;
    }

    /**
     * To get hook messages into the specific interval
     *
     * @param {number} pOffset Offset of the first message to include into return
     * @param {number} pSize Number of message to return
     * @method
     */
    getMessages( pOffset:number, pSize:number ):HookMessage[]{
        const arr = [];
        for(let i=pOffset; i<pOffset+pSize; i++){
            // not null and not undefined
            if(this.message[i] != null){
                arr.push(this.message[i]);
            }
        }

        return arr;
    }

    /**
     * @method
     */
    //toJsonObject( pOffset=0, pSize=-1):any {
    toJsonObject(pOptions?: SerializeOptions):any  {
        const o:any = new Object();
        let limit:number=pOptions.size;
        o._uid = this._uid;
        o.message = [];
        o.active = this.active;
        o.time = this.time;
        o.offset = this.offset;
        o.evTags = [];

        for(const k in this.evTags) o.evTags.push(this.evTags[k].getUUID())

        o.opts = this.opts;
        o._sessid = this._sessid;

        if(limit==-1)
            limit = this.message.length;

        limit += pOptions.offset;
        for(let i=pOptions.offset; i<limit; i++){
            if(this.message[i] != null)
                o.message.push(this.message[i].toJsonObject());
        }

        o.size = o.message.length;

        CoreDebug.checkJsonSerialize(o, "HookSession");
        return o;
    }

    /**
     * to check is the hook session is running
     *
     */
    isActive():boolean {
        return this.active;
    }

    onExit():void {
        //
    }


}

