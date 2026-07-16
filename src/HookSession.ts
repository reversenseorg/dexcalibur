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
import Util from "./Utils.js";
import * as Frida from 'frida';
import {HookManager} from "./hook/HookManager.js";
import {WebsocketSession} from "./WebsocketSession.js";
import * as Log from "./Logger.js";
import HookMessageV2 from "./hook/HookMessageV2.js";
import {RuntimeEvent, RuntimeEventType} from "./hook/RuntimeEvent.js";
import {HookMessageException} from "./errors/HookMessageException.js";

import {NodeInternalType} from "@reversense/dxc-core-api";

import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    SerializeOptions,
    Tag
} from "@reversense/dexcalibur-orm";
import {CryptoUtils} from "./CryptoUtils.js";
import {CoreDebug} from "./core/CoreDebug.js";
import {HookWorkspaceState} from "./hook/HookWorkspace.js";
import {Nullable} from "./core/IStringIndex.js";
import {UserAccountUUID} from "./user/UserAccount.js";
import {Device, DeviceUUID} from "./Device.js";
import DeviceEventCollector from "./platform/DeviceEventCollector.js";
import InputEvent from "./platform/InputEvent.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export type HookSessionUUID = string;

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
 * Options to create a new instance
 */
export interface HookSessionOpts {
    _uid?:string;
    message?:RuntimeEvent<any>[];
    owner?:Nullable<UserAccountUUID>;
    hookManager?:HookManager;
    sets_matches?:any;
    time?:number;
    frida?:any;
    active?:boolean;
    opts?:HookSessionOpts;
    offset?:number;
    evTags?:Record<string, Tag>;
    wsState?:Nullable<HookWorkspaceState>;
}


export interface RuntimeEventFilter {
    fragUID?:string;
    hookUID?:string;
    tagUUIDs?:number[];
    tagNames?:string[];
}

/**
 * @class
 */
export default class HookSession extends WebsocketSession implements INode
{
    static TYPE:NodeType = new NodeType( "hook_session", NodeInternalType.HOOK_SESSION,
        [
            (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("message"))
                .multiple(RuntimeEvent.TYPE)
                .def([]),
            (new NodeProperty("owner"))
                .type(DbDataType.STRING).def(null), // owner UUID
            (new NodeProperty("hookManager")).volatile(),
            (new NodeProperty("sets_matches")).volatile().def(null),
            (new NodeProperty("time")).type(DbDataType.NUMERIC).def(-1),
            (new NodeProperty("frida"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{
                    if(x.p==null) return {};

                    return {
                        pid: x.p.pid,
                        session: null,
                        device: null,
                        script: null
                    };
                })
                .wakeUp( (x:NodePropertyState)=>{
                    return (x.p!=null ? x.p: null);
                })
                .def(0),
            (new NodeProperty("active")).volatile().type(DbDataType.BOOLEAN).def(false),
            (new NodeProperty("opts"))
                .type(DbDataType.BLOB)
                .def({
                    rawOutput: false,
                    //timeout: 100000,
                }),
            (new NodeProperty("wsState"))
                .type(DbDataType.BLOB)
                .def({
                    commit: null
                }),
            (new NodeProperty("offset")).type(DbDataType.NUMERIC).def(0),
            (new NodeProperty("devUID")).type(DbDataType.STRING).def(null),
            (new NodeProperty("evTags"))
                .volatile()
                .type(DbDataType.STRING)
                // .sleep( (x:NodePropertyState)=>{  return Object.keys(x.p);})
                // .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? x.p : null)})
                .def({})
        ]).dataSource("PROJECT_DB");
    __:NodeInternalType = NodeInternalType.HOOK_SESSION;

    public _uid:HookSessionUUID = null;

    /**
     * The owner of this session
     */
    owner:Nullable<UserAccountUUID> = null;

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

    /**
     * A cache of tags to avoid to research tag from tag uuid foreach hook message
     *
     * Volatile
     *
     * @field
     */
    evTags:Record<string, Tag> = {};

    tags = [];

    offset = 0;

    /**
     * Hook Workspace state
     */
    wsState:Nullable<HookWorkspaceState> = null;

    /**
     * Device UID
     */
    devUID:Nullable<DeviceUUID> = null;

    /**
     * Spawned a child process to collect devices events from device.
     */
    deviceEventCollector: DeviceEventCollector = null;

    extra:any = {};

    private _batch:RuntimeEvent<any>[] = [];

    /**
     *
     * @param {Nullable<HookSessionOpts>} pOptions Default NULL
     * @constructor
     */
    constructor(pOptions: Nullable<HookSessionOpts> = null) {
        super();

        if(pOptions!=null){
            for (let i in pOptions){
                this[i] = pOptions[i];
            }
        }else{
            // not enough unique for collaborative mode
            // should be bound to the device also
            const now =  Util.time();

            this._uid = CryptoUtils.md5(now+"");

            // hook
            this.message = [];
            this.sets_matches = {};
            this.time = now;
            this.frida = {
                session: null,
                device: null,
                script: null,
                pid: null
            };
            this.opts = {
                // FALSE = not publish events on bus
                rawOutput: false
            }
        }
    }

    async setHookManager(pHM:HookManager):Promise<any>{
        this.hookManager = pHM;
        this.evTags = this.hookManager.getMessageTags();
        this.wsState = await this.hookManager.getWorkspaceState();
    }



    getUID():HookSessionUUID {
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

    private _sendInputEvent(pEvt:RuntimeEvent<InputEvent>):void {
        const ev = pEvt.data as InputEvent;
        if(ev==null) return;

        this.send({
            data:{
                device: ev.source,
                type: {
                    name: ev.type.key,
                },
                code: {
                    name: ev.code.key
                },
                value: ev.value,
                time: ev.timestamp
            },
            node: null,
            tags: pEvt.tags,
            rt_type: pEvt.getRuntimeType(),
            type: pEvt.getType(),
            __i: null
        });
    }

    pushExtraRuntimeEvent( pEvt:RuntimeEvent<any>, pEvtType:string){


        try{
            pEvt.setType(pEvtType);
            this.offset++;

            // cache hook msg
            this.message.push(pEvt);

            // process hook message as RuntimeEvent
            const jsonNode = [];
            if(pEvt.node!=null){
                pEvt.node.map( x => jsonNode.push( x.__!=null ? (x as any).toJsonObject() : x));
            }

            //this.hookManager.newRuntimeEvent(pEvt, false);
            switch(pEvt.getRuntimeType()){
                case RuntimeEventType.INPUT_EVT:
                    this._sendInputEvent(pEvt);
                    break;
                default:
                    break;
            }

        }catch(e){
            Logger.error(e.message,e.stack);
        }


    }
    /**
     * To push a new message from a hook into the session.
     * Each message is an instance of HookMessage
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
        hm.hid = pRawMsg.hid;

        // by default, not tagged hook message are not broadcasted
        let broadcast = false;

        if(hm.hook && pRawMsg.fid!=null){
            hm.fid = pRawMsg.fid;
            hm.frag = hm.hook.getFragment(pRawMsg.fid);
            hm.when = hm.hook.getLocationOf(pRawMsg.fid);
            ev.addTag(this.evTags.HOOK);

            // now, event type and auto emit can be retrieved for each fragments
            broadcast = hm.frag.autoEmit;
            ev.setType(hm.frag.emitEvent);
        }

        if(pRawMsg.err!=null){
            switch (pRawMsg.err){
                case -1:
                    ev.setRuntimeType(RuntimeEventType.FRAG_ERROR);//HOOK_ERROR);
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
        ev.setData<HookMessageV2>(hm);

        if(pRawMsg.fsid!=null && pRawMsg.fztype!=null){
            ev.type = "fuzz."+pRawMsg.fztype;
            ev.rt_type = RuntimeEventType.FUZZER;
            ev.data.fsid = pRawMsg.fsid;
            ev.data.tcid = pRawMsg.tcid ?? null;
            ev.data.value = pRawMsg.value ?? null;
            this.hookManager.context.bus.send(ev);
            return hm;
        }else{
            this.offset++;

            // 'Action' is already known by fragment
            // hm.action = msg.payload.action;

            // 'When' is the fragment location before/after/replace
            //hm.when = (msg.after)? 1 : 0;


            // 'payload.tags' is updated host-side  by Inspectors
            // if(msg.payload.tags != null) hm.setTags(msg.payload.tags);

            //Logger.raw(JSON.stringify(hm));

            // cache hook msg
            this.message.push(ev);
        }



        // TODO : send raw hook message only if specified

        if(!this.opts.rawOutput){
            // process hook message as RuntimeEvent
            const jsonNode = [];
            ev.node.map( x => jsonNode.push( x.__!=null ? (x as any).toJsonObject() : x));

            // TODO : ev to websocket msg
            // only valid message are broadcasted
            if(ev.isNotError()){
                this.hookManager.newRuntimeEvent(ev, broadcast);
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

        // save hook message in DB by batch of 100 message
        this.batchSave(ev, 100).then((vLen:number)=>{
            if(vLen>-1){
                Logger.info("HookSession.push() : batch save done with "+vLen+" messages");
            }
        })

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
    getMessages( pOffset:number, pSize:number ):RuntimeEvent<HookMessageV2>[]{
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
        const o:any = {};
        let limit:number=pOptions.size;
        o._uid = this._uid;
        o.owner = this.owner;
        o.message = [];
        o.msgLength = this.message.length;
        o.active = this.active;
        o.time = this.time;
        o.offset = this.offset;
        o.evTags = [];
        o.wsState = this.wsState;
        o.devUID = this.devUID;

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

    /**
     * a method to override default behaviour when the socket if exited
     */
    onExit():void {


        for(let k=0; k<this.hookManager._on.sessionStop.length;k++){
            this.hookManager._on.sessionStop[k].apply(null,[this.hookManager,this]);
        }

        /*if (this.deviceEventCollector) {
            this.deviceEventCollector.stop();
        }*/
    }


    /**
     * To set the device where the session runs
     * @param {Device} pDevice The device
     * @method
     * @deprecated
     */
    setDevice(pDevice:Device):void {
        this.devUID = pDevice.getUID();
    }

    /**
     * To set the device where the session runs
     * @param {Device} pDevice The device
     * @method
     */
    setDeviceUID(pDevice:DeviceUUID):void {
        this.devUID = pDevice;
    }

        /**
     * to get the UID of the device that triggered the session
     *
     * @returns {string} The device UID or null
     * @method
     */
    getDeviceUID():string {
        return this.devUID;
    }


    /**
     * To get filtered runtime events from this session
     *
     * @param {RuntimeEventFilter} pFilter
     */
    getRuntimeEvents(pFilter:RuntimeEventFilter):RuntimeEvent<any>[]{

        let tags:Tag[] = [];
        if(pFilter.tagNames!=null){
            pFilter.tagNames.map(x => {
                tags.push(this.hookManager.context.getTagManager().getTag(x));
            });
        }
        if(pFilter.tagUUIDs!=null){
            pFilter.tagUUIDs.map(x => {
                tags.push(this.hookManager.context.getTagManager().getTagByUUID(x));
            });
        }


        return this.message.filter(x => {
            let pass = true;
            let msg = (x as RuntimeEvent<HookMessageV2>).getMessage();
            if(pFilter.fragUID!=null){
                pass = pass && (msg.fid==pFilter.fragUID);
            }
            if(pFilter.hookUID!=null){
                pass = pass && (msg.hid==pFilter.fragUID);
            }

            if(tags.length>0){
                for(let i =0; i<tags.length; i++){
                    if(tags[i].match(x)){
                        pass = pass && true;
                        break;
                    }
                }
            }
        });
    }

    setOwner(pOwner:UserAccountUUID):void{
        this.owner = pOwner;
    }

    async batchSave(pEvent: RuntimeEvent<any>, pBatchSz: number):Promise<number> {
        if(this._batch.length==pBatchSz) {
            const t = this._batch;
            this._batch = [pEvent];

            const evs = await this.hookManager.context
                                            .getProjectDB()
                                            .saveMany(t, NodeInternalType.RUNTIME_EVENT);
            // flush batch
            return 1;
        }else{
            this._batch.push(pEvent);
            return -1;
        }
    }

    hasWaitingEvents():boolean {
        return (this._batch.length>0);
    }

}
HookSession.TYPE.builder(HookSession);
