
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
import HookMessage from "./HookMessage";
import Util from "./Utils";
import * as Frida from 'frida';
import {HookManager} from "./hook/HookManager";
import {WebsocketSession} from "./WebsocketSession";
import * as Log from "./Logger";
import HookMessageV2 from "./hook/HookMessageV2";
import {RuntimeEvent, RuntimeEventType} from "./hook/RuntimeEvent";


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
export default class HookSession extends WebsocketSession
{



    /**
     * The stack containing the received message
     * @field
     */
    message:RuntimeEvent<HookMessageV2>[] = [];
    // message:HookMessage[] = [];

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


    active:boolean = true;

    opts:HookSessionOptions;


    /**
     *
     * @param {HookManager} manager
     * @constructor
     */
    constructor(manager) {
        super();

        // hook
        this.message = [];
        this.hookManager = manager;
        this.sets_matches = {};
        this.time = Util.time();
        this.frida = {
            session: null,
            device: null,
            script: null,
            pid: null
        };
        this.opts = {
            rawOutput: false
        }
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
    push(msg:any){

        const hm:HookMessageV2 = new HookMessageV2();
        const ev:RuntimeEvent<HookMessageV2> = new RuntimeEvent<HookMessageV2>({
            type: RuntimeEventType.HOOK,
            raw: hm,
            node: null
        });

        if(msg.type == "error") return null;

        // TODO : mettre tout 'msg' dans 'hm' ou 'hm.data'

        // console.log(msg);

        // message are bound to fragment and not hook
        if(msg.payload.id != undefined && msg.payload.id != null){
            //hook = this.hookManager.findHook(UT.b64_decode(msg.payload.id));
           // hm.hook = msg.payload.id;
        }

        // 'match' is not yet used because fragment/keypoint allow to issue hook message conditionnaly & agent-side
        // hm.match = (msg.payload.match!=null)? msg.payload.match : false;

        // 'msg' is informational text such as FQCN or signature of method hooked
        // hm.msg = msg.payload.msg;

        hm.data = msg.payload.data;

        // 'Action' is already known by fragment
        // hm.action = msg.payload.action;

        // 'When' is the fragment location before/after/replace
        // hm.when = (msg.after)? 1 : 0;


        // 'payload.tags' is updated host-side  by Inspectors
        // if(msg.payload.tags != null) hm.setTags(msg.payload.tags);

        //Logger.raw(JSON.stringify(hm));

        // cache hook msg
        this.message.push(hm);

        // TODO : send raw hook message only if specified
        if(this.opts.rawOutput){
            this.send(hm);
        }else{
            // process hook message as RuntimeEvent
            this.hookManager.newRuntimeEvent(new RuntimeEvent<HookMessageV2>({
                type: RuntimeEventType.HOOK,
                raw: hm,
                node: null
            }));
        }

        // TODO : remove 'match' from hook message template
        // if(hm.match)
        //    this.hookManager.trigger(hm);

        return hm;
    }


    /**
     * @method
     */
    hasMessages( pOffset:number=0){
        return this.message.length > pOffset;
    }

    /**
     * @method
     */
    messages():RuntimeEvent<HookMessageV2>{
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
        let arr = [];
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
    toJsonObject( pOffset:number=0, pSize:number=-1):any{
        let o:any = new Object(), limit:number=pSize;
        o.message = [];
        o.active = this.active;

        if(limit==-1)
            limit = this.message.length;

        limit += pOffset;
        for(let i=pOffset; i<limit; i++){
            if(this.message[i] != null)
                o.message.push(this.message[i].toJsonObject());
        }

        o.size = o.message.length;
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
    }


}

